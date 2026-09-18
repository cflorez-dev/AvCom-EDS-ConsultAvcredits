import { h, render } from '@dropins/tools/preact.js';
import htm from 'htm';
import { readBlockConfig } from '../../scripts/aem.js';

// 1. HEREDAMOS TODA LA LÓGICA DEL CORE
import { mapBlockData } from '../../core/blocks/header-language-selector/header-language-selector.js';
import { shouldShowByTargeting } from '../../core/scripts/utils/target-filter.js';

// 2. IMPORTAMOS TU NUEVA VISUAL
import { CustomLanguageSearch } from '../../design-system/organisms/lenguage-search/lenguage-search.js';

const html = htm.bind(h);
const isDesktop = window.matchMedia('(min-width: 768px)');

export default async function decorate(block) {
  const isAuthorEnv = window.xwalk?.isAuthorEnv;
  if (isAuthorEnv) {
    block.classList.add('header-language-selector-author-mode');
    return;
  }

  // Lógica de targeting heredada
  const targetingConfig = readBlockConfig(block);
  let targetCountries = targetingConfig['target-countries'] || '';
  let targetLanguages = targetingConfig['target-languages'] || '';

  if (!shouldShowByTargeting(targetCountries, targetLanguages)) {
    block.style.display = 'none';
    return;
  }

  // Mapear datos heredados del core
  const mappedData = mapBlockData(block);
  const config = readBlockConfig(block);
  const rawDefaultPos = mappedData.defaultPos || config['default-pos'] || 'es-col';

  let isRendered = false;

  const renderLanguageSearchInContainer = (targetContainer) => {
    if (!targetContainer) return;

    const renderAppropriateComponent = () => {
      if (isDesktop.matches) {
        // 3. INYECTAMOS TU COMPONENTE LOCAL AQUÍ
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

  // Buscamos el contenedor del header (Lógica idéntica al core)
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