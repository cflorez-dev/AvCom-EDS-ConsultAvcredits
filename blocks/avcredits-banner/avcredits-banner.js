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

  rows.forEach((row, index) => {
    const cell = row.children.length === 2 ? row.children[1] : row.children[0];
    if (!cell) return;

    switch (index) {
      case 0:
        options.headerTitleHTML = cell.innerHTML.trim(); 
        break;
      case 1:
        const img = cell.querySelector('img');
        options.headerIconData = img ? { src: img.src, alt: img.alt || 'Header Icon' } : null;
        break;
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
    html`<${AvCreditsBanner} ...${props} />`,
    container
  );
}