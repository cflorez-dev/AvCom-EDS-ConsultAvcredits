import { h, render } from '@dropins/tools/preact.js';
import { useState, useEffect } from '@dropins/tools/preact-hooks.js';
import htm from 'htm';
import { AvCreditsBanner } from '../../design-system/organisms/avcredits-banner/avcredits-banner.js'; 

const html = htm.bind(h);

/**
 * Convierte texto en mayúsculas a formato Capitalizado (Title Case)
 * Ej: "CESAR FLOREZ" -> "Cesar Florez"
 */
const capitalizeName = (name) => {
  if (!name) return '';
  return name.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

/**
 * Formatea la fecha del API al formato exacto "Ene 30, 2026"
 */
const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  
  // Extraemos el mes corto y forzamos su primera letra en mayúscula
  const month = date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
  const monthCapitalized = month.charAt(0).toUpperCase() + month.slice(1);
  
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `${monthCapitalized} ${day}, ${year}`;
};

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
 * Componente Wrapper: Conecta los datos estáticos de AEM con los dinámicos del API
 */
/**
 * Componente Wrapper: Conecta los datos estáticos de AEM con los dinámicos del API
 */
const AvCreditsBannerWrapper = ({ aemProps, block }) => {
  const [apiData, setApiData] = useState(null);

  useEffect(() => {
    // Handler para cuando llegan datos nuevos y exitosos
    const handleDataReady = (event) => {
      setApiData(event.detail);
      const section = block.closest('.section');
      if (section) {
        section.classList.remove('hidden');
      }
    };

    // Handler para ocultar el banner cuando se hace una nueva consulta
    const handleClearData = () => {
      setApiData(null); // Borramos la data anterior
      const section = block.closest('.section');
      if (section) {
        section.classList.add('hidden'); // Ocultamos la sección
      }
    };

    // Escuchamos ambos eventos
    window.addEventListener('avcredits-data-ready', handleDataReady);
    window.addEventListener('avcredits-clear-data', handleClearData);
    
    return () => {
      window.removeEventListener('avcredits-data-ready', handleDataReady);
      window.removeEventListener('avcredits-clear-data', handleClearData);
    };
  }, [block]);

  // Si no hay datos (porque apenas cargó o porque se limpiaron), no pintamos nada
  if (!apiData) return null;

  return html`
    <${AvCreditsBanner} 
      headerTitleHTML=${aemProps.headerTitleHTML}
      headerIconData=${aemProps.headerIconData}
      currentBalance=${apiData.currentBalance}
      holderName=${capitalizeName(apiData.holderName)}
      avCreditsNumber=${apiData.avCreditsNumber}
      typeRefund=${apiData.typeRefund}
      statusAvCredits=${apiData.statusAvCredits}
      issueDate=${formatDate(apiData.issueDate)}
      expiryDate=${formatDate(apiData.expiryDate)}
      openingBalance=${apiData.openingBalance}
    />
  `;
};

/**
 * Decorador principal del bloque EDS
 * @param {Element} block 
 */
export default function decorate(block) {
  const props = mapBlockOptions(block);

  const section = block.closest('.section');
  if (section) {
    section.classList.add('hidden');
  }

  block.innerHTML = '';
  
  const container = document.createElement('div');
  container.className = 'avcredits-banner-wrapper';
  block.appendChild(container);

  render(
    html`<${AvCreditsBannerWrapper} aemProps=${props} block=${block} />`,
    container
  );
}