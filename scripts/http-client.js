/**
 * Límite de tiempo POR INTENTO. Sin él, un backend que no responde deja el
 * FullPageLoader a pantalla completa indefinidamente: no tiene botón de cierre, ni
 * Escape, ni clic fuera, así que la única salida del usuario era recargar la página.
 *
 * Al vencer se lanza, y la excepción cae en el `try/catch` de handleSubmit, que ya
 * pinta el modal de error técnico y apaga el loader (CA-05).
 *
 * Es por intento y NO consume reintento: reintentar un cuelgue duplicaría la espera,
 * que es justo lo que se quiere acotar. Peor caso visible = un 5xx rápido + backoff +
 * un intento colgado = VALIDATE_TIMEOUT_MS + RETRY_5XX_DELAY_MS.
 */
export const VALIDATE_TIMEOUT_MS = 12000;

/**
 * Corre `run(signal)` con fecha límite. Aborta la petición en curso para no dejar el
 * socket colgado, y además compite contra un temporizador: el `signal` por sí solo no
 * cubre los cuelgues ANTERIORES al fetch (servicio de token, config de environment),
 * donde no habría nada que abortar.
 *
 * @param {(signal: AbortSignal) => Promise<any>} run
 * @param {number} ms
 * @returns {Promise<any>}
 */
const withTimeout = (run, ms) => {
  const controller = new AbortController();
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error(`[consult-av-credits-form] balance excedió el tiempo límite de ${ms}ms`));
    }, ms);
  });
  const attempt = run(controller.signal);
  // El aborto hace que `attempt` rechace después de que la fecha límite ya ganó la
  // carrera; sin este catch quedaría como unhandled rejection.
  attempt.catch(() => {});
  return Promise.race([attempt, deadline]).finally(() => clearTimeout(timer));
};

/**
 * Cliente HTTP genérico con soporte para timeout y reintentos automáticos.
 * 
 * @param {string} url - La URL del endpoint.
 * @param {object} options - Opciones de fetch (method, body, headers, etc.).
 * @param {object} retries - Control interno de reintentos { auth, server }.
 * @returns {object} { ok, status, body }
 */
export const httpClient = async (url, options = {}, retries = { auth: 0, server: 0 }) => {
  const { method = 'GET', body, headers = {}, ...restOptions } = options;

  // Configuramos las opciones base de fetch
  const fetchOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers, // Permite sobreescribir headers si es necesario
    },
    ...restOptions,
  };

  // Solo adjuntamos el body si no es un GET/HEAD
  if (body && method !== 'GET' && method !== 'HEAD') {
    fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  // Ejecutamos la petición con el wrapper de timeout
  const res = await withTimeout(async (signal) => {
    return fetch(url, { ...fetchOptions, signal });
  }, VALIDATE_TIMEOUT_MS);

  // Manejo de reintentos por error de autenticación (401)
  if (res.status === 401 && retries.auth < 1) {
    // Nota: Aquí podrías agregar lógica para refrescar un token antes de reintentar
    return httpClient(url, options, { ...retries, auth: retries.auth + 1 });
  }

  // Manejo de reintentos por error del servidor (500+)
  if (res.status >= 500 && retries.server < 1) {
    return httpClient(url, options, { ...retries, server: retries.server + 1 });
  }

  // Procesamiento seguro de la respuesta
  let responseBody = null;
  try {
    responseBody = await res.json();
  } catch (_) {
    responseBody = null; // Falla silenciosamente si la respuesta no es un JSON válido
  }

  return { 
    ok: res.ok, 
    status: { 
      code: res.status.toString(), 
      desc: res.statusText 
    }, 
    body: responseBody 
  };
};