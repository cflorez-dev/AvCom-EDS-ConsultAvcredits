import { getApimCredentials, clearApimTokenCache } from '/core/scripts/services/apim/apim-token.service.js';
import { fetchAEMData } from '/core/scripts/utils/aem-data.js';
import { encryptPGP } from '../encryption/pgp.service.js';

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
        const [digital, upgrades, encryptedVoucher, encryptedPin] = await Promise.all([
        getApimCredentials('digital'),
        getApimCredentials('upgrades'),
        encryptPGP(numberAvCredits),
        encryptPGP(pin)
        ]);

        const fetchUrl = 'https://api-payments-qa.avtest.ink/api_qwikcilver_in/balanceenquiry';

        return fetch(fetchUrl, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': 'f80b16f56a3b4a4da66eb649178bbe9e',
                Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6ImRndlNEdks4QTVLeUt5cHB3MWRBd1RYRDNDQSIsImtpZCI6ImRndlNEdks4QTVLeUt5cHB3MWRBd1RYRDNDQSJ9.eyJhdWQiOiJodHRwczovL2F2dGVzdG9ubGluZS5vbm1pY3Jvc29mdC5jb20vNmUxMzVjYjQtZmY2Zi00MjY3LWE1YjEtYTY2NWQ2MjA3MmNmIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvMzk3ZWQwMzEtMzkzNS00MGIwLTljNjktMTRmZDExNjRkYjhmLyIsImlhdCI6MTc5MDM1NDU0NiwibmJmIjoxNzkwMzU0NTQ2LCJleHAiOjE3OTAzNTg0NDYsImFpbyI6IkFTUUEyLzhlQUFBQWEvbzducDVkWVNoc3RpaURrZzNvdEpLQmtwM2RhaUxBNGs1MjY5ZkdqQ2c9IiwiYXBwaWQiOiI2ZTEzNWNiNC1mZjZmLTQyNjctYTViMS1hNjY1ZDYyMDcyY2YiLCJhcHBpZGFjciI6IjEiLCJpZHAiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8zOTdlZDAzMS0zOTM1LTQwYjAtOWM2OS0xNGZkMTE2NGRiOGYvIiwib2lkIjoiYTRiMDBiMTktYWM5MC00N2M2LWE4NTktMTgxYzQ0NDJjNzI0IiwicmgiOiIxLkFTa0FNZEItT1RVNXNFQ2NhUlQ5RVdUYmo3UmNFMjV2XzJkQ3BiR21aZFlnY3M4QUFBQXBBQS4iLCJzdWIiOiJhNGIwMGIxOS1hYzkwLTQ3YzYtYTg1OS0xODFjNDQ0MmM3MjQiLCJ0aWQiOiIzOTdlZDAzMS0zOTM1LTQwYjAtOWM2OS0xNGZkMTE2NGRiOGYiLCJ1dGkiOiJHcDFULTNuVGswZVc4RThNSXpvZkFBIiwidmVyIjoiMS4wIiwieG1zX2Z0ZCI6IjRTeWJPT1FaNjQzNEdlQnU0aGVmUkI1SDRkWU92Y2NDRllHUTlrbGZaTXdCZFhObFlYTjBMV1J6YlhNIn0.NOWdVkHrhVasKtuPC3uH42QtY03A5wbyWgYvwcouv3h43lg8glB3SBXxLUohg1uQr5V5pJ4HHn6Neyivz2hCyqGfY90_UMy8yuagxq9pSSnheZKWNDrB6JA53MvolP3lFYYZfE6UYrcrdAtH_FocAOJUla7aqHyDUgovi43k7Nf_aV_i1K-9cDHBv7QT_s472QZlhWlHnVb_-MCM_pxr6lFwz6oNOhIGc4GxmLkey4LWDVADqvGTMENgfyZ5H1e0y0M7HIf25ZYS146SDW4jgRP4O93ly8zoZoNp5--23D06VXlLY2YbxdbtQijjP-sidLQWjALJqjQlvM4WCQ53jw',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "balance-enquiry": {
                    "channel": "AVCOM",
                    "voucher": encryptedVoucher,
                    "pin": encryptedPin
                }
            }),
            signal,
        });
    }, VALIDATE_TIMEOUT_MS);

  if (res.status === 401 && retries.auth < 1) {
    clearApimTokenCache('digital');
    clearApimTokenCache('upgrades');
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