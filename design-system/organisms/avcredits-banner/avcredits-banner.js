import { h } from '@dropins/tools/preact.js';
import htm from 'htm';

const html = htm.bind(h);

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
  saldoActual = '',
  titular = '',
  numeroCredit = '',
  tipo = '',
  estado = '',
  fechaExpedicion = '',
  fechaVencimiento = '',
  saldoInicial = ''
}) => {
  return html`
    <div class="avcredits-container">
      
      <!-- LADO IZQUIERDO: El Tiquete -->
      <div class="avcredits-ticket shadow-lg">
        
        <!-- Cabecera Verde -->
        <div class="avcredits-ticket-header">
          <span class="heading-h400 text-white">avianca credits</span>
          <svg class="size-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.9 6.4c-.6-.4-1.5-.6-2.5-.7-2.3-.2-5 .5-7.5 1.7-1.4.7-2.7 1.5-3.8 2.5l-4-1.3C3 8.3 2.1 8.5 1.7 9c-.3.4-.3 1 0 1.5l3.2 3.8c-1.3 1.5-2.2 3-2.6 4.6-.2.8.2 1.4 1 1.6.8.2 1.6-.2 1.9-1 .3-1.2 1.1-2.4 2.1-3.6l5.2 2.7c1.3.7 2.7 1 4 1h.1c2-.1 3.9-.9 5.3-2.3 1.6-1.6 2.3-3.8 2-6-.1-1.9-.9-3.6-2-4.9z"/>
          </svg>
        </div>

        <!-- Cuerpo del Tiquete con Muescas (Notches) -->
        <div class="avcredits-ticket-body bg-white">
          <div class="avcredits-notch-left"></div>
          <div class="avcredits-notch-right"></div>

          <div class="flex flex-col gap-1">
            <span class="paragraph-p100 text-secondary">Saldo actual</span>
            <span class="heading-h600 text-primary">COP ${saldoActual}</span>
          </div>

          <div class="flex flex-col gap-1">
            <span class="paragraph-p100 text-secondary">Titular</span>
            <span class="paragraph-p300 font-medium text-primary">${titular}</span>
          </div>
        </div>
      </div>

      <!-- LADO DERECHO: Tarjeta de Detalles -->
      <div class="avcredits-details bg-card border-border-stroke-default shadow-sm">
        
        <!-- Info Superior -->
        <div class="flex flex-col gap-1">
          <h3 class="heading-h400 text-primary">avianca credits N° ${numeroCredit}</h3>
          <p class="paragraph-p200 text-secondary">Tipo: ${tipo}</p>
          <div class="flex items-center gap-2 mt-1">
            <span class="paragraph-p200 text-secondary">Estado:</span>
            <${StatusIcon} estado=${estado} />
            <span class="paragraph-p200 font-medium text-primary">${estado}</span>
          </div>
        </div>

        <hr class="border-border-stroke-default w-full my-4" />

        <!-- Info Inferior -->
        <div class="avcredits-details-grid">
          <div class="flex flex-col gap-1">
            <span class="paragraph-p100 text-secondary">Fecha de expedición</span>
            <span class="paragraph-p200 font-medium text-primary">${fechaExpedicion}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="paragraph-p100 text-secondary">Fecha de vencimiento</span>
            <span class="paragraph-p200 font-medium text-primary">${fechaVencimiento}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="paragraph-p100 text-secondary">Saldo inicial</span>
            <span class="paragraph-p200 font-medium text-primary">COP ${saldoInicial}</span>
          </div>
        </div>

      </div>
    </div>
  `;
};