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
  
  if (statusLower.includes('activated')) {
    return html`  
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 1.5C13.14 1.5 16.5 4.86 16.5 9C16.5 13.14 13.14 16.5 9 16.5C4.86 16.5 1.5 13.14 1.5 9C1.5 4.86 4.86 1.5 9 1.5ZM7.96875 10.1624L5.8689 8.0625L4.875 9.0564L7.96875 12.1501L13.125 6.9939L12.1311 6L7.96875 10.1624Z" fill="#1EA93C"/>
      </svg>
    `;
  }
  if (statusLower.includes('canceled')) {
    return html`
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M9 1.5C4.86 1.5 1.5 4.86 1.5 9C1.5 13.14 4.86 16.5 9 16.5C13.14 16.5 16.5 13.14 16.5 9C16.5 4.86 13.14 1.5 9 1.5ZM11.1213 12.182L9 10.0607L6.87868 12.182L5.81802 11.1213L7.93934 9L5.81802 6.87868L6.87868 5.81802L9 7.93934L11.1213 5.81802L12.182 6.87868L10.0607 9L12.182 11.1213L11.1213 12.182Z" fill="#FF1C46"/>
      </svg>
    `;
  }
  return html`
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M9 1.5C4.86 1.5 1.5 4.86 1.5 9C1.5 13.14 4.86 16.5 9 16.5C13.14 16.5 16.5 13.14 16.5 9C16.5 4.86 13.14 1.5 9 1.5ZM11.1213 12.182L9 10.0607L6.87868 12.182L5.81802 11.1213L7.93934 9L5.81802 6.87868L6.87868 5.81802L9 7.93934L11.1213 5.81802L12.182 6.87868L10.0607 9L12.182 11.1213L11.1213 12.182Z" fill="#5A5A5A"/>
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

          <div class="flex flex-col ticket-col-1 gap-small">
            <span class="paragraph-p300 text-primary">${labels.balanceText}</span>
            <span class="heading-h700 text-primary">${currentBalance}</span>
          </div>

          <div class="flex flex-col ticket-col-2 gap-small">
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