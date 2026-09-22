import { h } from '@dropins/tools/preact.js';
import { useState, useRef, useEffect, useMemo } from '@dropins/tools/preact-hooks.js';
import htm from 'htm';
import { Button } from '../../../core/design-system/atoms/button/button.js';

const html = htm.bind(h);

// Usamos la misma función de importación dinámica del core
function buildModulePath(relativePath) {
  const codeBasePath = window.hlx?.codeBasePath || '';
  const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  if (!codeBasePath) return `${window.location.origin}${cleanPath}`;
  if (codeBasePath.startsWith('http://') || codeBasePath.startsWith('https://')) {
    return `${codeBasePath}${cleanPath}`.replace(/\/+/g, '/');
  }
  const basePath = codeBasePath.startsWith('/') ? codeBasePath : `/${codeBasePath}`;
  return `${window.location.origin}${basePath}${cleanPath}`.replace(/\/+/g, '/');
}

async function loadLanguageCountrySelectorService() {
  const servicePath = buildModulePath('/core/scripts/services/header/language-country-selector.js');
  try {
    return await import(servicePath);
  } catch (error) {
    console.error('Failed to load language-country-selector service:', error);
    throw error;
  }
}

export const CustomLanguageSearch = ({
  defaultPos = '',
  onPosChange,
  customClassName = '',
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [service, setService] = useState(null);
  const [selectedPos, setSelectedPos] = useState(defaultPos);
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const loadService = async () => {
      try {
        const loadedService = await loadLanguageCountrySelectorService();
        if (isMounted) {
          setService(loadedService);
          const normalizePos = loadedService.normalizePos || ((pos, fb) => fb || 'es-col');
          const validatePos = loadedService.validatePos || (() => false);
          
          let initialPos = loadedService.getStoredPos() || defaultPos;
          if (initialPos) {
            initialPos = normalizePos(initialPos);
            setSelectedPos(validatePos(initialPos) ? initialPos : normalizePos(''));
          }
        }
      } catch (error) {
        setSelectedPos('es-col');
      }
    };
    loadService();
    return () => { isMounted = false; };
  }, [defaultPos]);

  const setStoredPos = service?.setStoredPos || (() => {});
  const navigateToPOS = service?.navigateToPOS || (() => {});
  const parsePos = service?.parsePos || (() => ({ language: '', country: '' }));
  const buildPos = service?.buildPos || ((lang, country) => `${lang}-${country}`);
  const normalizePos = service?.normalizePos || ((pos, fb) => fb || 'es-col');
  const validatePos = service?.validatePos || (() => false);

  // Extraemos SOLO los idiomas, ya no necesitamos los países
  const allLanguages = useMemo(() => {
    if (!service || !service.getLanguages) return [];
    return service.getLanguages();
  }, [service]);

  const normalizedSelectedPos = normalizePos(selectedPos || '');
  const parsedPos = parsePos(normalizedSelectedPos);
  const currentLanguage = parsedPos.language || 'es';
  const currentCountry = parsedPos.country || 'col';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handleDropdownToggle = (e) => {
    e.preventDefault();
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Mantenemos el país intacto, solo actualizamos el idioma
  const handleLanguageSelect = (newLanguageValue) => {
    const newPos = buildPos(newLanguageValue, currentCountry);
    const normalizedPos = normalizePos(newPos);
    
    if (validatePos(normalizedPos)) {
      setSelectedPos(normalizedPos);
      setStoredPos(normalizedPos);
      setIsDropdownOpen(false);
      if (onPosChange) onPosChange(normalizedPos);
      navigateToPOS(normalizedPos);
    }
  };

  return html`
    <div class=${`avi-language-search h-[48px] flex items-center justify-center flex-row gap-[16px] ${customClassName}`}>
      <div class="relative inline-flex" ref=${dropdownRef}>
        <${Button}
          variant="secondary"
          size="sm"
          onClick=${handleDropdownToggle}
          aria-expanded=${isDropdownOpen}
          data-open=${isDropdownOpen ? 'true' : 'false'}
          customClassName=${`px-[12px] !rounded-full transition-colors ${isDropdownOpen ? 'force-green-border' : ''}`}
        >
          <div class="flex flex-row items-center gap-[8px]">
            
            <!-- Ícono de Globo Terráqueo -->
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              <path d="M2 12h20"></path>
            </svg>

            <!-- Idioma actual en mayúsculas -->
            <span class="m-0 not-italic font-[family-name:var(--font-family-primary)] font-[var(--font-weight-regular)] text-[length:var(--font-size-small)] text-[var(--text-normal-primary)] uppercase">
              ${currentLanguage}
            </span>
            
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" class=${`transition-transform duration-200 flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`}>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M11.06 5.72656L8 8.7799L4.94 5.72656L4 6.66656L8 10.6666L12 6.66656L11.06 5.72656Z" fill="currentColor"/>
            </svg>
          </div>
        </${Button}>

        ${isDropdownOpen ? html`
          <div class="absolute top-[calc(100%+8px)] right-0 w-[240px] bg-white rounded-[16px] shadow-[0_4px_16px_rgba(27,27,27,0.2)] py-[8px] z-[1000] overflow-hidden">
            <div class="flex flex-col">
              ${allLanguages.map((lang) => {
                const isSelected = lang.value === currentLanguage;
                
                return html`
                  <button
                    key=${lang.value}
                    class="flex items-center w-full text-left transition-colors cursor-pointer border-y-0 border-r-0 border-solid border-l-4 bg-transparent hover:bg-[#f5f5f5]"
                    style=${{ 
                      padding: '12px 16px',
                      borderLeftColor: isSelected ? '#0b9b3a' : 'transparent'
                    }}
                    onClick=${() => handleLanguageSelect(lang.value)}
                    type="button"
                    aria-selected=${isSelected}
                  >
                    <span style=${{ 
                      margin: '0',
                      fontSize: '16px',
                      fontFamily: 'var(--font-family-primary)',
                      fontWeight: isSelected ? '700' : '400',
                      color: isSelected ? '#1b1b1b' : '#4a4a4a'
                    }}>
                      ${lang.label || lang.value}
                    </span>
                    
                    ${isSelected ? html`
                      <svg class="ml-auto" style=${{ color: '#0b9b3a', width: '22px', height: '22px', flexShrink: '0' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
                      </svg>
                    ` : null}
                  </button>
                `;
              })}
            </div>
          </div>
        ` : null}
      </div>
    </div>
  `;
};