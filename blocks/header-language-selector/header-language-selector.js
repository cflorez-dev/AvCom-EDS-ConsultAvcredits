import { h, render } from '@dropins/tools/preact.js';
import htm from 'htm';
import { readBlockConfig } from '../../scripts/aem.js';
import { shouldShowByTargeting } from '../../core/scripts/utils/target-filter.js';
import { CustomLanguageSearch } from './custom-language-search.js';

const html = htm.bind(h);
const isDesktop = window.matchMedia('(min-width: 768px)');

// 1. COPIAMOS LA FUNCIÓN DEL CORE AQUÍ PARA EVITAR LA DEPENDENCIA CIRCULAR
function mapBlockData(block) {
  const divs = Array.from(block.querySelectorAll(':scope > div'));
  const validCountries = ['co', 'ar', 'mx', 'pe', 'ec', 'sv', 'cr', 'br', 'bo', 'cl', 'ca', 'gt', 'hn', 'ni', 'pa', 'py', 'do', 'eu', 'gb', 'uy', 'ot', 'us'];
  let startIndex = 0;
  
  if (divs.length >= 2) {
    const firstRowValue = divs[0]?.children[0]?.textContent?.trim().toLowerCase();
    const firstRowIsTargeting = firstRowValue && 
      divs[0].children.length <= 2 &&
      (validCountries.includes(firstRowValue) || firstRowValue.split(',').every((c) => validCountries.includes(c.trim())));
    
    if (firstRowIsTargeting) {
      startIndex = 2;
    }
  }

  const extractValue = (div) => {
    if (!div) return null;
    const innerDiv = div.querySelector(':scope > div');
    if (innerDiv) {
      const paragraph = innerDiv.querySelector('p');
      return paragraph ? paragraph.textContent.trim() : null;
    }
    return null;
  };

  const parseBoolean = (value) => {
    if (!value || value === '') return false;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return Boolean(value);
  };

  return {
    defaultPos: extractValue(divs[startIndex + 0]) || '',
    showSearchButton: parseBoolean(extractValue(divs[startIndex + 1])),
    title: extractValue(divs[startIndex + 2]) || null,
    countryLabel: extractValue(divs[startIndex + 3]) || null,
    languageLabel: extractValue(divs[startIndex + 4]) || null,
    confirmLabel: extractValue(divs[startIndex + 5]) || null,
    confirmButtonText: extractValue(divs[startIndex + 6]) || null,
  };
}

export default async function decorate(block) {
  const isAuthorEnv = window.xwalk?.isAuthorEnv;
  if (isAuthorEnv) {
    block.classList.add('header-language-selector-author-mode');
    return;
  }

  const targetingConfig = readBlockConfig(block);
  let targetCountries = targetingConfig['target-countries'] || '';
  let targetLanguages = targetingConfig['target-languages'] || '';

  if (!shouldShowByTargeting(targetCountries, targetLanguages)) {
    block.style.display = 'none';
    return;
  }

  const mappedData = mapBlockData(block);
  const config = readBlockConfig(block);
  const rawDefaultPos = mappedData.defaultPos || config['default-pos'] || 'es-col';

  let isRendered = false;

  const renderLanguageSearchInContainer = (targetContainer) => {
    if (!targetContainer) return;

    const renderAppropriateComponent = () => {
      // OJO AQUÍ: El componente solo se pinta en Desktop por reglas de Avianca
      if (isDesktop.matches) {
        render(
          html`
            <${CustomLanguageSearch}
              defaultPos=${rawDefaultPos}
              customClassName="header-language-selector"
            />
          `,
          targetContainer
        );
      } else {
        render(null, targetContainer);
      }
    };

    renderAppropriateComponent();
    isRendered = true;
    isDesktop.addEventListener('change', renderAppropriateComponent);
  };

  const findAndRenderLanguageSearch = () => {
    const languageSelectorContainer = document.querySelector('.header-language-selector');
    if (languageSelectorContainer) {
      renderLanguageSearchInContainer(languageSelectorContainer);
      block.classList.add('hidden');
      return true;
    }
    return false;
  };

  if (!findAndRenderLanguageSearch()) {
    let attempts = 0;
    const tryRender = () => {
      attempts += 1;
      if (findAndRenderLanguageSearch()) return;
      if (attempts < 20) {
        requestAnimationFrame(tryRender);
      } else {
        block.classList.add('hidden');
      }
    };
    requestAnimationFrame(tryRender);
  }

  const handleHeaderReady = (event) => {
    if (isRendered) return;
    const languageSelectorContainer = event?.detail?.languageSelectorContainer;
    if (languageSelectorContainer) {
      renderLanguageSearchInContainer(languageSelectorContainer);
      block.classList.add('hidden');
      return;
    }
    findAndRenderLanguageSearch();
  };
  window.addEventListener('header-template-ready', handleHeaderReady);
}