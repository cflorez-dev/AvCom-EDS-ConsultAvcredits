import { getEnvironmentValues } from '/design-system/organisms/get-key-env/get-key-env.js';
import { encryptPGP } from '../encryption/pgp.service.js';

const CHANNEL = 'AVCOM';

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
      reject(new Error(`[upgrades] /validate excedió el tiempo límite de ${ms}ms`));
    }, ms);
  });
  const attempt = run(controller.signal);
  // El aborto hace que `attempt` rechace después de que la fecha límite ya ganó la
  // carrera; sin este catch quedaría como unhandled rejection.
  attempt.catch(() => {});
  return Promise.race([attempt, deadline]).finally(() => clearTimeout(timer));
};

export const validateBalance = async ({ numberAvCredits, pin }, retries = { auth: 0, server: 0 }) => {
  const res = await withTimeout(async (signal) => {
  const [endPoint, secretName] = await getEnvironmentValues([
    'AVC_ENVIRONMENT_API_URL',
    'AVC_SECRET_NAME_PUBLICKEY',
  ]);
    const [encryptedVoucher, encryptedPin] = await Promise.all([
    encryptPGP(numberAvCredits, secretName),
    encryptPGP(pin, secretName)
    ]);

    const fetchUrl = `${endPoint}/balanceEnquiry`;

    return fetch(fetchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "balance-enquiry": {
        "channel": CHANNEL,
        "voucher": encryptedVoucher,
        "pin": encryptedPin
        }
      }),
      signal,
    });
  }, VALIDATE_TIMEOUT_MS);

  if (res.status === 401 && retries.auth < 1) {
    return validateBalance({ numberAvCredits, pin }, { ...retries, auth: retries.auth + 1 });
  }

  if (res.status >= 500 && retries.server < 1) {
    await sleep(RETRY_5XX_DELAY_MS);
    return validateBalance({ numberAvCredits, pin }, { ...retries, server: retries.server + 1 });
  }

  let body = null;
  try {
    body = await res.json();
  } catch (_) {
    body = null;
  }
  return { ok: res.ok, status: res.status, body };
};