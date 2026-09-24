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

    return fetch(`https://api-payments-qa.avtest.ink/api_qwikcilver_in/balanceenquiry`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6ImRndlNEdks4QTVLeUt5cHB3MWRBd1RYRDNDQSIsImtpZCI6ImRndlNEdks4QTVLeUt5cHB3MWRBd1RYRDNDQSJ9.eyJhdWQiOiJodHRwczovL2F2dGVzdG9ubGluZS5vbm1pY3Jvc29mdC5jb20vNmUxMzVjYjQtZmY2Zi00MjY3LWE1YjEtYTY2NWQ2MjA3MmNmIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvMzk3ZWQwMzEtMzkzNS00MGIwLTljNjktMTRmZDExNjRkYjhmLyIsImlhdCI6MTc5MDE3ODkxNiwibmJmIjoxNzkwMTc4OTE2LCJleHAiOjE3OTAxODI4MTYsImFpbyI6IkFTUUEyLzhlQUFBQW1lOFN5b0JMTEpzWi9xbkZxdjgyMEJrQmlraTZmNlhuWEpON3VOeXltV1k9IiwiYXBwaWQiOiI2ZTEzNWNiNC1mZjZmLTQyNjctYTViMS1hNjY1ZDYyMDcyY2YiLCJhcHBpZGFjciI6IjEiLCJpZHAiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8zOTdlZDAzMS0zOTM1LTQwYjAtOWM2OS0xNGZkMTE2NGRiOGYvIiwib2lkIjoiYTRiMDBiMTktYWM5MC00N2M2LWE4NTktMTgxYzQ0NDJjNzI0IiwicmgiOiIxLkFTa0FNZEItT1RVNXNFQ2NhUlQ5RVdUYmo3UmNFMjV2XzJkQ3BiR21aZFlnY3M4QUFBQXBBQS4iLCJzdWIiOiJhNGIwMGIxOS1hYzkwLTQ3YzYtYTg1OS0xODFjNDQ0MmM3MjQiLCJ0aWQiOiIzOTdlZDAzMS0zOTM1LTQwYjAtOWM2OS0xNGZkMTE2NGRiOGYiLCJ1dGkiOiJwSm1LNEUwZGhVNkpaRTJKeVZTVEFBIiwidmVyIjoiMS4wIiwieG1zX2Z0ZCI6IlVSM3RYdWw3dDktZ2JCZFdiUUZNVWlLbEVWdDE2b1FQS0QxTGJUaldvM3dCZFhOM1pYTjBNeTFrYzIxeiJ9.aOQpZZTxSRTfiBTl2s8pVgeKvbmuhOdwpaib1_yAh6RkB2JZC63eN3RBuXRDBrX4bdS8CRsDnalzGNJvMlQGUhcqU7BKE7o099nBPdmf--4KnnshsUX3yEpAsEtS90yDtiWof6erZ64SlZIxI37mcbYtkDD1gq25GcfSANZ6OHene3BDivE_tqsENpPhDCIi6ZND9tTVXtpFjyU__1z3WbSB_rUfJmpGqMZg3cnBCvjgPJQNFDrGpTE1dM4KKekE5VhU9ak54zHbcfnTerci5auEU7MsTGpLeN1ScdcczidbrjcbBSDGc-aF3LKLe9ILJaFfcF2tGgWR1WXGGKF3bA',
            'Ocp-Apim-Subscription-Key': 'f80b16f56a3b4a4da66eb649178bbe9e'
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