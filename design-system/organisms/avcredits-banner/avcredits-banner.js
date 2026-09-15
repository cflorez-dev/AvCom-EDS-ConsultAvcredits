import { h } from '@dropins/tools/preact.js';
import htm from 'htm';

const html = htm.bind(h);

// Subcomponente para el ícono de estado (Activo, Cancelado, etc.)
const StatusIcon = ({ estado }) => {
  const statusLower = estado?.toLowerCase() || '';
  
  if (statusLower.includes('activo')) {
    return html`
      <svg class="w-4 h-4 text-[#00A650]" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
    `;
  }
  if (statusLower.includes('cancelado')) {
    return html`
      <svg class="w-4 h-4 text-[#FF1C46]" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>
    `;
  }
  // Estado por defecto (Sin saldo, Vencido) -> Gris
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
    <div class="flex flex-col lg:flex-row items-center lg:items-stretch w-full max-w-[1000px] mx-auto py-8">
      
      <!-- LADO IZQUIERDO: El Tiquete -->
      <div class="relative w-full lg:w-[350px] flex-shrink-0 z-10 rounded-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.08)] bg-white overflow-hidden flex flex-col">
        
        <!-- Cabecera Verde -->
        <div class="bg-gradient-to-r from-[#008F45] to-[#00A650] px-6 py-4 flex items-center justify-between h-[60px]">
          <span class="text-white font-bold text-lg tracking-wide">avianca credits</span>
          <!-- Ícono de Avianca (SVG simplificado genérico, cámbialo por tu asset oficial) -->
          <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.9 6.4c-.6-.4-1.5-.6-2.5-.7-2.3-.2-5 .5-7.5 1.7-1.4.7-2.7 1.5-3.8 2.5l-4-1.3C3 8.3 2.1 8.5 1.7 9c-.3.4-.3 1 0 1.5l3.2 3.8c-1.3 1.5-2.2 3-2.6 4.6-.2.8.2 1.4 1 1.6.8.2 1.6-.2 1.9-1 .3-1.2 1.1-2.4 2.1-3.6l5.2 2.7c1.3.7 2.7 1 4 1h.1c2-.1 3.9-.9 5.3-2.3 1.6-1.6 2.3-3.8 2-6-.1-1.9-.9-3.6-2-4.9z"/>
          </svg>
        </div>

        <!-- Cuerpo del Tiquete con Muescas (Notches) -->
        <div class="relative px-6 py-8 flex flex-col md:flex-row lg:flex-col gap-6 md:justify-between lg:justify-start bg-white min-h-[160px]">
          
          <!-- Muescas simuladas con círculos absolutos (Asume un fondo exterior gris claro bg-[#f4f4f4] o el color de tu fondo) -->
          <div class="absolute top-1/2 -left-3 w-6 h-6 bg-[#f4f4f4] rounded-full transform -translate-y-1/2 shadow-inner"></div>
          <div class="absolute top-1/2 -right-3 w-6 h-6 bg-[#f4f4f4] rounded-full transform -translate-y-1/2 shadow-inner"></div>

          <div class="flex flex-col gap-1">
            <span class="text-gray-500 text-sm font-medium">Saldo actual</span>
            <span class="text-[#212121] text-[28px] font-bold leading-tight">COP ${saldoActual}</span>
          </div>

          <div class="flex flex-col gap-1">
            <span class="text-gray-500 text-sm font-medium">Titular</span>
            <span class="text-[#212121] text-base font-medium">${titular}</span>
          </div>
        </div>
      </div>

      <!-- LADO DERECHO: Tarjeta de Detalles -->
      <!-- En Desktop, usa -ml-4 para meterse debajo del tiquete visualmente -->
      <div class="w-full lg:flex-1 bg-white rounded-[16px] lg:rounded-l-none border border-gray-100 shadow-sm mt-4 lg:mt-6 lg:-ml-6 lg:pl-14 p-6 lg:py-6 flex flex-col gap-6 z-0">
        
        <!-- Info Superior -->
        <div class="flex flex-col gap-1">
          <h3 class="text-[#212121] font-bold text-lg">avianca credits N° ${numeroCredit}</h3>
          <p class="text-gray-500 text-sm">Tipo: ${tipo}</p>
          <div class="flex items-center gap-1.5 mt-1">
            <span class="text-gray-500 text-sm">Estado:</span>
            <${StatusIcon} estado=${estado} />
            <span class="text-[#212121] text-sm font-medium">${estado}</span>
          </div>
        </div>

        <!-- Línea divisoria -->
        <hr class="border-gray-100 w-full" />

        <!-- Info Inferior (Columnas en Desktop/Tablet, Filas en Mobile) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="flex flex-col gap-1">
            <span class="text-gray-500 text-[13px]">Fecha de expedición</span>
            <span class="text-[#212121] text-sm font-medium">${fechaExpedicion}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-gray-500 text-[13px]">Fecha de vencimiento</span>
            <span class="text-[#212121] text-sm font-medium">${fechaVencimiento}</span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="text-gray-500 text-[13px]">Saldo inicial</span>
            <span class="text-[#212121] text-sm font-medium">COP ${saldoInicial}</span>
          </div>
        </div>

      </div>
    </div>
  `;
};