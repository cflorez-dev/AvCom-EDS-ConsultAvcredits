import { fetchAEMData } from '../../core/scripts/utils/aem-data.js';
import { getStoredLanguage } from '../../core/scripts/services/header/language-country-selector.js';

let i18Cache = null;
let i18FallbackCache = null;

export const pickI18nText = (catalogs, key, fallback = '') => {
  const found = (catalogs || [])
    .filter(Array.isArray)
    .map((catalog) => catalog.find((item) => item?.Key === key))
    .find((entry) => typeof entry?.Text === 'string');
  return found ? found.Text : fallback;
};

function getI18nLabel(key, fallback = '') {
  return pickI18nText([i18Cache, i18FallbackCache], key, fallback);
}

const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const month = date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
  const monthCapitalized = month.charAt(0).toUpperCase() + month.slice(1);
  const day = date.getDate();
  const year = date.getFullYear();
  return `${day} ${monthCapitalized} ${year}`;
};

const formatCurrency = (amountString, currencyCode) => {
  if (!amountString) return '';
  const numericValue = Number(amountString) / 100;
  const isCOP = currencyCode?.toUpperCase() === 'COP';
  const isWholeNumber = numericValue % 1 === 0;
  const decimals = (isCOP && isWholeNumber) ? 0 : 2;
  
  let locale = 'es-CO';
  if (!isCOP) locale = 'en-US';
  
  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(numericValue);

  return `${currencyCode} ${formattedNumber}`;
};

export default async function decorate(block) {
  // 1. LÓGICA i18n EN VANILLA JS (Reemplaza a useEffect y useState)
  if (!i18Cache) {
    const cookieLanguage = getStoredLanguage() || 'es';
    const i18Data = await fetchAEMData(`i18/${cookieLanguage}`);
    i18Cache = i18Data?.data || [];
    if (cookieLanguage !== 'es' && !i18FallbackCache) {
      const esFallback = await fetchAEMData('i18/es');
      i18FallbackCache = esFallback?.data || [];
    }
  }

  // Guardamos el texto en una constante simple
  const reservationText = getI18nLabel('transactionsHistory.reservationText', 'Código de reserva:');

  const rows = Array.from(block.children);
  const titleText = rows[0]?.textContent.trim() || 'Transacciones realizadas';
  const emptyStateImageHTML = rows[1]?.querySelector('picture')?.outerHTML || '';
  const emptyStateTitle = rows[2]?.textContent.trim() || 'No has realizado transacciones con tu avianca credits';
  const emptyStateSubtitleHTML = rows[3]?.querySelector('div')?.innerHTML || 'Si tienes dudas sobre cómo usar tu avianca credits, consulta nuestro <a href="#">Centro de ayuda</a>.';

  block.innerHTML = '';

  const header = document.createElement('h5');
  header.className = 'transactions-header-title';
  header.textContent = titleText;
  
  header.setAttribute('data-aue-prop', 'title');
  header.setAttribute('data-aue-type', 'text');
  header.setAttribute('data-aue-label', 'Title');
  
  block.appendChild(header);

  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'transactions-content-wrapper';
  block.appendChild(contentWrapper);

  const renderTransactions = (transactionsData) => {
    contentWrapper.innerHTML = '';

    if (!transactionsData || transactionsData.length === 0) {
      contentWrapper.innerHTML = `
        <div class="transactions-empty-state">
          <div class="empty-state-icon" data-aue-prop="emptyStateImage" data-aue-type="reference" data-aue-label="Empty State Image">
            ${emptyStateImageHTML}
          </div>
          <div class="empty-state-description">
            <h4 class="empty-state-title" data-aue-prop="emptyStateTitle" data-aue-type="text" data-aue-label="Empty State Title">
              ${emptyStateTitle}
            </h4>
            <div class="empty-state-subtitle" data-aue-prop="emptyStateSubtitle" data-aue-type="richtext" data-aue-label="Empty State Subtitle">
              ${emptyStateSubtitleHTML}
            </div>
          </div>
        </div>
      `;
      return;
    }

    const listWrapper = document.createElement('div');
    listWrapper.className = 'transactions-list';

    const latestTransactions = transactionsData.slice(0, 3);

    latestTransactions.forEach((tx) => {
      const iconSuccess = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1.5C13.14 1.5 16.5 4.86 16.5 9C16.5 13.14 13.14 16.5 9 16.5C4.86 16.5 1.5 13.14 1.5 9C1.5 4.86 4.86 1.5 9 1.5ZM7.96875 10.1624L5.8689 8.0625L4.875 9.0564L7.96875 12.1501L13.125 6.9939L12.1311 6L7.96875 10.1624Z" fill="#1EA93C"/></svg>`;
      const iconError = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M9 1.5C4.86 1.5 1.5 4.86 1.5 9C1.5 13.14 4.86 16.5 9 16.5C13.14 16.5 16.5 13.14 16.5 9C16.5 4.86 13.14 1.5 9 1.5ZM11.1213 12.182L9 10.0607L6.87868 12.182L5.81802 11.1213L7.93934 9L5.81802 6.87868L6.87868 5.81802L9 7.93934L11.1213 5.81802L12.182 6.87868L10.0607 9L12.182 11.1213L11.1213 12.182Z" fill="#FF1C46"/></svg>`;
      
      const isSuccess = tx['transaction-status'].toLowerCase() === 'success';
      const statusIcon = isSuccess ? iconSuccess : iconError;

      const card = document.createElement('div');
      card.className = 'transaction-card';
      card.innerHTML = `
        <div class="tx-info-left">
          <p class="tx-default">${reservationText} <strong>${tx['reference-number']}</strong></p>
          <p class="tx-details"><span>${formatDate(tx['transaction-date'])}</span> <span class="tx-line"></span> <span>${tx['transaction-status']}</span> <span class="tx-icon">${statusIcon}</span></p>
        </div>
        <div class="tx-info-right">
          <p class="tx-default"><strong>${formatCurrency(tx['transaction-amount'], tx.currency)}</strong></p>
        </div>
      `;
      listWrapper.appendChild(card);
    });

    contentWrapper.appendChild(listWrapper);
  };

  window.addEventListener('transaction-data-ready', (event) => {
    const txnData = event.detail; 
    renderTransactions(txnData);
  });
}