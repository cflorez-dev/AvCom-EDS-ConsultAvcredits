import { h, render } from '@dropins/tools/preact.js';
import htm from 'htm';
import { AvCreditsBanner } from '../../design-system/organisms/avcredits-banner/avcredits-banner.js'; 

const html = htm.bind(h);

/**
 * Mapea las filas del DOM de AEM a un objeto de propiedades
 * @param {Element} block El contenedor del bloque en AEM
 * @returns {Object} Props para el componente
 */
function mapBlockOptions(block) {
  const rows = [...block.children];
  const options = {};

  // Mapeamos fila por fila asumiendo el orden exacto de autoría
  rows.forEach((row, index) => {
    // Tomamos la segunda columna (la primera es el nombre de la propiedad, la segunda es el valor)
    const value = row.children[1]?.textContent?.trim() || '';

    switch (index) {
      case 0: options.saldoActual = value; break;
      case 1: options.titular = value; break;
      case 2: options.numeroCredit = value; break;
      case 3: options.tipo = value; break;
      case 4: options.estado = value; break;
      case 5: options.fechaExpedicion = value; break;
      case 6: options.fechaVencimiento = value; break;
      case 7: options.saldoInicial = value; break;
      default: break;
    }
  });

  return options;
}

/**
 * Decorador principal del bloque EDS
 * @param {Element} block 
 */
export default function decorate(block) {
  // 1. Extraer configuración del documento
  const props = mapBlockOptions(block);

  // 2. Limpiar el DOM original para evitar que el usuario vea la tabla cruda
  block.innerHTML = '';

  // 3. Crear el contenedor de inyección para Preact
  const container = document.createElement('div');
  container.className = 'avcredits-banner-wrapper';
  block.appendChild(container);

  // 4. Renderizar el componente Preact con los datos de AEM
  render(
    html`<${AvCreditsBanner}/>`,
    container
  );
}