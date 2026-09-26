/**
 * Estados heredados para mantener compatibilidad con los modales actuales
 * del ConsultAvCreditsForm.
 */
export const UPGRADE_RESULT = {
  ELIGIBLE: 'ELIGIBLE', // Usaremos este cuando la tarjeta sea válida
  NO_AVAILABILITY: 'NO_AVAILABILITY', 
  NOT_FOUND: 'NOT_FOUND', // Este será el error 10086 o 10004
  ERROR: 'ERROR',
};

/**
 * Evalúa el response del API de balanceenquiry y determina qué modal mostrar
 * o si el flujo fue exitoso.
 */
export const mapValidateResult = ({ ok, status, body }) => {
  // 1. Validaciones base de red
  if (!ok) return status === 404 ? UPGRADE_RESULT.NOT_FOUND : UPGRADE_RESULT.ERROR;
  if (!body || typeof body !== 'object') return UPGRADE_RESULT.ERROR;

  const balanceEnquiry = body['response-balanceenquiry'];
  if (!balanceEnquiry) return UPGRADE_RESULT.ERROR;

  const cards = Array.isArray(balanceEnquiry.cards) ? balanceEnquiry.cards : [];
  if (!cards.length) return UPGRADE_RESULT.NOT_FOUND;

  // 2. Extraer los datos de la primera tarjeta
  const card = cards[0];
  const responseCode = card['response-code'];
  const responseMessage = card['response-message'] || '';

  // 3. NUEVA LÓGICA SOLICITADA:
  // Si el código es 1110 Y el mensaje contiene 10086 o 10004 (pin/tarjeta incorrecta)
  if (responseCode === '1110' && (responseMessage.includes('10086') || responseMessage.includes('10004'))) {
    return UPGRADE_RESULT.NOT_FOUND;
  }

  // 4. Lógica de éxito: Si es 1120 (o tu código de éxito definido), retornamos elegible
  if (responseCode === '1120') {
    return UPGRADE_RESULT.ELIGIBLE;
  }

  // Cualquier otra combinación de código/mensaje no controlada cae en error genérico
  return UPGRADE_RESULT.ERROR;
};