export const BALANCE_RESULT = {
  ELIGIBLE: 'ELIGIBLE',
  BLOCKED_CARD: 'BLOCKED_CARD', 
  NOT_FOUND: 'NOT_FOUND',
  ERROR: 'ERROR',
  ERROR_QC: 'ERROR_QC',
  MAX_RETRIES: 'MAX_RETRIES',
};

let retryCount = 0;

export const resetRetryCount = () => {
  retryCount = 0;
};

export const mapValidateResult = ({ ok, status, body }) => {
  if (!ok || !body || typeof body !== 'object') return BALANCE_RESULT.ERROR_QC;

  const balanceEnquiry = body['response-balanceenquiry'];
  if (!balanceEnquiry) return BALANCE_RESULT.ERROR_QC;

  const cards = Array.isArray(balanceEnquiry.cards) ? balanceEnquiry.cards : [];
  if (!cards.length) return BALANCE_RESULT.NOT_FOUND;

  const card = cards[0];
  const responseCode = card['response-code'];
  const responseMessage = card['response-message'] || '';

  // Éxito
  if (responseCode === '1120') {
    retryCount = 0;
    return BALANCE_RESULT.ELIGIBLE;
  }

  // Información no encontrada y máximo de reintentos
  if (responseCode === '1110') {
    if (responseMessage.includes('10086')) {
      retryCount += 1;
      if (retryCount >= 3) {
        return BALANCE_RESULT.MAX_RETRIES;
      }
      return BALANCE_RESULT.NOT_FOUND;
    }

    if (responseMessage.includes('10004')) {
      return BALANCE_RESULT.NOT_FOUND;
    }

    if (responseMessage.includes('10119')) {
      return BALANCE_RESULT.BLOCKED_CARD;
    }
  }

  return BALANCE_RESULT.ERROR;
};