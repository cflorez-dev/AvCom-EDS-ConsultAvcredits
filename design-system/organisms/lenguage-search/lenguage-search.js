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
  const servicePath = buildModulePath('/scripts/services/header/language-country-selector.js');
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
          customClassName=${`px-[8px] !rounded-full transition-colors ${isDropdownOpen ? 'force-green-border' : ''}`}
        >
          <div class="flex flex-row items-center gap-[8px]">
            
            <!-- Ícono de Globo Terráqueo -->
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M7.99301 1.33301C4.31301 1.33301 1.33301 4.31967 1.33301 7.99967C1.33301 11.6797 4.31301 14.6663 7.99301 14.6663C11.6797 14.6663 14.6663 11.6797 14.6663 7.99967C14.6663 4.31967 11.6797 1.33301 7.99301 1.33301ZM12.613 5.33301H10.6463C10.433 4.49967 10.1263 3.69967 9.72634 2.95967C10.953 3.37967 11.973 4.23301 12.613 5.33301ZM7.99967 2.69301C8.55301 3.49301 8.98634 4.37967 9.27301 5.33301H6.72634C7.01301 4.37967 7.44634 3.49301 7.99967 2.69301ZM2.83967 9.33301C2.73301 8.90634 2.66634 8.45967 2.66634 7.99967C2.66634 7.53967 2.73301 7.09301 2.83967 6.66634H5.09301C5.03967 7.10634 4.99967 7.54634 4.99967 7.99967C4.99967 8.45301 5.03967 8.89301 5.09301 9.33301H2.83967ZM3.38634 10.6663H5.35301C5.56634 11.4997 5.87301 12.2997 6.27301 13.0397C5.04634 12.6197 4.02634 11.773 3.38634 10.6663ZM5.35301 5.33301H3.38634C4.02634 4.22634 5.04634 3.37967 6.27301 2.95967C5.87301 3.69967 5.56634 4.49967 5.35301 5.33301ZM7.99967 13.3063C7.44634 12.5063 7.01301 11.6197 6.72634 10.6663H9.27301C8.98634 11.6197 8.55301 12.5063 7.99967 13.3063ZM9.55967 9.33301H6.43967C6.37967 8.89301 6.33301 8.45301 6.33301 7.99967C6.33301 7.54634 6.37967 7.09967 6.43967 6.66634H9.55967C9.61967 7.09967 9.66634 7.54634 9.66634 7.99967C9.66634 8.45301 9.61967 8.89301 9.55967 9.33301ZM9.72634 13.0397C10.1263 12.2997 10.433 11.4997 10.6463 10.6663H12.613C11.973 11.7663 10.953 12.6197 9.72634 13.0397ZM10.9063 9.33301C10.9597 8.89301 10.9997 8.45301 10.9997 7.99967C10.9997 7.54634 10.9597 7.10634 10.9063 6.66634H13.1597C13.2663 7.09301 13.333 7.53967 13.333 7.99967C13.333 8.45967 13.2663 8.90634 13.1597 9.33301H10.9063Z" fill-rule="evenodd" clip-rule="evenodd" fill="#1B1B1B"/>
            </svg>

            <!-- Idioma actual en mayúsculas -->
            <span class="m-0 not-italic font-[family-name:var(--font-family-primary)] font-[var(--font-weight-regular)] text-[length:var(--font-size-small)] text-[var(--text-normal-primary)] uppercase">
              ${currentLanguage}
            </span>
            
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M11.06 5.72656L8 8.7799L4.94 5.72656L4 6.66656L8 10.6666L12 6.66656L11.06 5.72656Z" fill-rule="evenodd" clip-rule="evenodd" fill="#1B1B1B"/>
            </svg>
          </div>
        </${Button}>

        ${isDropdownOpen ? html`
          <div class="absolute top-[calc(100%+4px)] right-0 w-[240px] bg-white rounded-[16px] shadow-[0_4px_16px_rgba(27,27,27,0.2)] py-[8px] z-[1000] overflow-hidden">
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