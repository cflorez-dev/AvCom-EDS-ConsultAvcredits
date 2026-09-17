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
  saldo = 'Saldo actual',
  titular = 'Titular',
  numeroCredit = 'avianca credits N° ********8901',
  tipo = 'Tipo:',
  estado = 'Estado:',
  fechaExpedicion = 'Fecha de expedición',
  fechaVencimiento = 'Fecha de vencimiento',
  saldoInicial = 'Saldo inicial'
}) => {
  const [labels, setLabels] = useState({});

  useEffect(() => {
    const loadLabels = async () => {
      if (!i18Cache) {
        const cookieLanguage = getStoredLanguage() || 'es';
        const i18Data = await fetchAEMData(`${cookieLanguage}`);
        i18Cache = i18Data?.data || [];
        if (cookieLanguage !== 'es' && !i18FallbackCache) {
          const esFallback = await fetchAEMData('es');
          i18FallbackCache = esFallback?.data || [];
        }
      }
      setLabels({
        balanceText: getI18nLabel('avCreditsBanner.balanceText', 'Solicitar ascenso'),
        holderText: getI18nLabel('avCreditsBanner.holderText', 'Código de reserva'),
        numberAvCreditsText: getI18nLabel('avCreditsBanner.numberAvCreditsText', 'Apellido'),
        typeText: getI18nLabel('avCreditsBanner.typeText', 'Tal y como aparece(n) en la reserva'),
        statusText: getI18nLabel('avCreditsBanner.statusText', 'El código de reserva es obligatorio'),
        issueDateText: getI18nLabel('avCreditsBanner.issueDateText', 'El apellido es obligatorio'),
        expiryDateText: getI18nLabel('avCreditsBanner.expiryDateText', 'Cargando...'),
        openingBalanceText: getI18nLabel('avCreditsBanner.openingBalanceText', '¡Ups! Algo salió mal'),
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
          <span class="text-white"><b>avianca</b> credits</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="31" height="35" viewBox="0 0 31 35" fill="none">
            <path d="M18.3179 27.0214H21.4422C22.7419 27.0214 23.3151 27.1283 23.6784 27.3009C23.1213 25.5417 21.3695 24.177 15.2016 23.7085C16.1866 24.8676 17.2199 25.9856 18.3179 27.0296V27.0214Z" fill="white"/>
            <path d="M15.2097 23.7084C9.21948 16.6222 5.18293 7.55481 3.5683 0C3.5683 0 0.274466 2.95945 0.0161267 9.17428C-0.274505 15.9728 3.30996 22.8206 15.0967 23.692C15.1371 23.692 15.1774 23.692 15.2097 23.7084Z" fill="white"/>
            <path d="M18.3179 27.0214C13.6677 27.0214 5.64311 27.0214 5.64311 27.0214C5.81264 27.4242 6.3939 27.7037 7.70982 27.7859C15.6215 28.2627 16.7355 34.5844 28.0621 34.5844C29.0551 34.5844 29.6767 34.5269 30.2984 34.4036C25.8259 33.0061 21.8055 30.3672 18.3098 27.0214L18.3179 27.0214Z" fill="white"/>
          </svg>
        </div>

        <!-- Cuerpo del Tiquete con Muescas (Notches) -->
        <div class="avcredits-ticket-body bg-white">
          <div class="avcredits-notch-left"></div>
          <div class="avcredits-notch-right"></div>

          <div class="flex flex-col gap-small">
            <span class="paragraph-p300 text-primary">${labels.balanceText}</span>
            <span class="heading-h700 text-primary">COP 300.000</span>
          </div>

          <div class="flex flex-col gap-small">
            <span class="paragraph-p300 text-secondary">${labels.holderText}</span>
            <span class="paragraph-p300 font-medium text-primary">Juan Sebastián Cruz</span>
          </div>
        </div>
      </div>

      <!-- LADO DERECHO: Tarjeta de Detalles -->
      <div class="avcredits-details bg-card border-border-stroke-default">
        
        <!-- Info Superior -->
        <div class="flex flex-col gap-x-small">
          <h3 class="heading-h400 text-primary m-0!">${labels.numberAvCreditsText}</h3>
          <p class="paragraph-p300 text-secondary m-0!">${labels.typeText} Reembolsable</p>
          <div class="flex items-center gap-x-small">
            <span class="paragraph-p300 text-secondary">${labels.statusText}</span>
            <${StatusIcon} estado='Activo' />
            <span class="paragraph-p300 font-medium text-secondary">Activo</span>
          </div>
        </div>

        <hr class="border-border-stroke-default w-full my-4" />

        <!-- Info Inferior -->
        <div class="avcredits-details-grid">
          <div class="flex flex-col">
            <span class="paragraph-p200 text-secondary">${labels.issueDateText}</span>
            <span class="paragraph-p300 font-medium text-primary">Ene 30, 2026</span>
          </div>
          <div class="flex flex-col">
            <span class="paragraph-p200 text-secondary">${labels.expiryDateText}</span>
            <span class="paragraph-p300 font-medium text-primary">Ene 30, 2027</span>
          </div>
          <div class="flex flex-col">
            <span class="paragraph-p200 text-secondary">${labels.openingBalanceText}</span>
            <span class="paragraph-p300 font-medium text-primary">COP 1.567.098</span>
          </div>
        </div>

      </div>
    </div>
  `;
};