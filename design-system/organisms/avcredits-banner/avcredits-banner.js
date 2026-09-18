import { h } from '@dropins/tools/preact.js';
import { useState, useEffect } from '@dropins/tools/preact-hooks.js';
import htm from 'htm';
import { fetchAEMData } from '../../../core/scripts/utils/aem-data.js';
import { getStoredLanguage } from '../../../core/scripts/services/header/language-country-selector.js';

const html = htm.bind(h);

let i18Cache = null;
let i18FallbackCache = null;

/**
 * @param {Array<Array<{Key: string, Text: string}>>} catalogs - Catálogos por prioridad
 * @param {string} key - Llave del diccionario
 * @param {string} [fallback] - Texto a usar si la llave no está autorada en ningún catálogo
 * @returns {string}
 */
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

const StatusIcon = ({ estado }) => {
  const statusLower = estado?.toLowerCase() || '';
  
  if (statusLower.includes('activo')) {
    return html`
      <svg class="w-4 h-4 text-alert-success-icon-bg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
    `;
  }
  if (statusLower.includes('cancelado')) {
    return html`
      <svg class="w-4 h-4 text-alert-error-icon-bg" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>
    `;
  }
  return html`
    <svg class="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
    </svg>
  `;
};

export const AvCreditsBanner = ({
  headerTitleHTML = '',
  headerIconData = null,
  currentBalance = 'COP 300.000',
  holderName = 'Juan Sebastián Cruz',
  avCreditsNumber = '8901',
  typeRefund = 'Reembolsable',
  statusAvCredits = 'Activo',
  issueDate = 'Ene 30, 2026',
  expiryDate = 'Ene 30, 2027',
  openingBalance = 'COP 1.567.098'
}) => {
  const [labels, setLabels] = useState({});

  useEffect(() => {
    const loadLabels = async () => {
      if (!i18Cache) {
        const cookieLanguage = getStoredLanguage() || 'es';
        const i18Data = await fetchAEMData(`i18/${cookieLanguage}`);
        i18Cache = i18Data?.data || [];
        if (cookieLanguage !== 'es' && !i18FallbackCache) {
          const esFallback = await fetchAEMData('i18/es');
          i18FallbackCache = esFallback?.data || [];
        }
      }
      setLabels({
        balanceText: getI18nLabel('avCreditsBanner.balanceText', 'Saldo actual'),
        holderText: getI18nLabel('avCreditsBanner.holderText', 'Titular'),
        numberAvCreditsText: getI18nLabel('avCreditsBanner.numberAvCreditsText', 'avianca credits N° ********'),
        typeText: getI18nLabel('avCreditsBanner.typeText', 'Tipo:'),
        statusText: getI18nLabel('avCreditsBanner.statusText', 'Estado:'),
        issueDateText: getI18nLabel('avCreditsBanner.issueDateText', 'Fecha de expedición'),
        expiryDateText: getI18nLabel('avCreditsBanner.expiryDateText', 'Fecha de vencimiento'),
        openingBalanceText: getI18nLabel('avCreditsBanner.openingBalanceText', 'Saldo inicial'),
      });
    };
    loadLabels();
  }, []);

  return html`
    <div class="avcredits-container">
      
      <!-- LADO IZQUIERDO: El Tiquete -->
      <div class="avcredits-ticket">
        
        <!-- Cabecera Verde -->
        <div class="avcredits-ticket-header">
          <span class="text-white" dangerouslySetInnerHTML=${{ __html: headerTitleHTML }}></span>
          ${headerIconData?.src ? html`
            <img src="${headerIconData.src}" alt="${headerIconData.alt}" width="31" height="35" />
          ` : null}
        </div>

        <!-- Cuerpo del Tiquete con Muescas (Notches) -->
        <div class="avcredits-ticket-body bg-white">
          <div class="avcredits-notch-left"></div>
          <div class="avcredits-notch-right"></div>

          <div class="flex flex-col gap-small">
            <span class="paragraph-p300 text-primary">${labels.balanceText}</span>
            <span class="heading-h700 text-primary">${currentBalance}</span>
          </div>

          <div class="flex flex-col gap-small">
            <span class="paragraph-p300 text-secondary">${labels.holderText}</span>
            <span class="paragraph-p300 font-medium text-primary">${holderName}</span>
          </div>
        </div>
      </div>

      <!-- LADO DERECHO: Tarjeta de Detalles -->
      <div class="avcredits-details bg-card border-border-stroke-default">
        
        <!-- Info Superior -->
        <div class="flex flex-col gap-x-small">
          <h3 class="heading-h400 text-primary m-0!">${labels.numberAvCreditsText}${avCreditsNumber}</h3>
          <p class="paragraph-p300 text-secondary m-0!">${labels.typeText} ${typeRefund}</p>
          <div class="flex items-center gap-x-small">
            <span class="paragraph-p300 text-secondary">${labels.statusText}</span>
            <${StatusIcon} estado=${statusAvCredits} />
            <span class="paragraph-p300 font-medium text-secondary">${statusAvCredits}</span>
          </div>
        </div>

        <hr class="border-border-stroke-default w-full my-4" />

        <!-- Info Inferior -->
        <div class="avcredits-details-grid">
          <div class="flex flex-col">
            <span class="paragraph-p200 text-secondary">${labels.issueDateText}</span>
            <span class="paragraph-p300 font-medium text-primary">${issueDate}</span>
          </div>
          <div class="flex flex-col">
            <span class="paragraph-p200 text-secondary">${labels.expiryDateText}</span>
            <span class="paragraph-p300 font-medium text-primary">${expiryDate}</span>
          </div>
          <div class="flex flex-col">
            <span class="paragraph-p200 text-secondary">${labels.openingBalanceText}</span>
            <span class="paragraph-p300 font-medium text-primary">${openingBalance}</span>
          </div>
        </div>

      </div>
    </div>
  `;
};