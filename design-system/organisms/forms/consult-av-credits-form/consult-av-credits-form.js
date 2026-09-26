import { h } from '@dropins/tools/preact.js';
import { useState, useEffect } from '@dropins/tools/preact-hooks.js';
import htm from 'htm';
import { Input } from '/core/design-system/atoms/inputs/input/input.js';
import { Button } from '/core/design-system/atoms/button/button.js';
import { ModalAviancaLayout, isImageSource } from '/core/design-system/molecules/modal/modal-avianca-layout.js';
import { preloadIcons } from '/core/design-system/atoms/icon/icon.js';
import { FullPageLoader, CONDOR_LOADER_ASSET } from '/core/design-system/molecules/full-page-loader/full-page-loader.js';
import { fetchAEMData } from '/core/scripts/utils/aem-data.js';
import { getStoredLanguage } from '/core/scripts/services/header/language-country-selector.js';
import { validateUpgrade, getUpgradesConfig } from '/core/scripts/services/upgrades/upgrades.service.js';
import { validateBalance } from '../../../../scripts/services/balanceenquiry/balanceenquiry.service.js';
import { mapValidateResult, UPGRADE_RESULT } from '../../../../scripts/services/balanceenquiry/balanceenquiry-result.js';
import { showLoader, updateLoaderText } from '/core/scripts/services/loader/loader.service.js';

const html = htm.bind(h);

let i18Cache = null;
let i18FallbackCache = null;

export const resetI18nCachesForTests = () => {
  i18Cache = null;
  i18FallbackCache = null;
};

// Sanitiza forzando solo números y un máximo de 16 caracteres
export const sanitizeAvCredits = (value) => String(value ?? '')
  .replace(/[^0-9]/g, '')
  .slice(0, 16);

// Sanitiza forzando solo números y un máximo de 6 caracteres
export const sanitizePin = (value) => String(value ?? '')
  .replace(/[^0-9]/g, '')
  .slice(0, 6);

export const MODAL_ICONS = {
  [UPGRADE_RESULT.NO_AVAILABILITY]: 'modals/upgrade-no-availability',
  [UPGRADE_RESULT.NOT_FOUND]: 'modals/data-not-found',
  [UPGRADE_RESULT.ERROR]: 'modals/upgrade-error',
};

export const MODAL_ICON_FALLBACK = 'modals/upgrade-not-available';

export const MODAL_IMAGE_KEYS = {
  [UPGRADE_RESULT.NO_AVAILABILITY]: 'ConsultAvCreditsForm.modalHighDemand.image',
  [UPGRADE_RESULT.NOT_FOUND]: 'ConsultAvCreditsForm.modalNotFound.image',
  [UPGRADE_RESULT.ERROR]: 'ConsultAvCreditsForm.modalError.image',
};

export const resolveModalIcon = (result, cmsValue, overrideSrc) => {
  const authored = typeof cmsValue === 'string' ? cmsValue.trim() : '';
  return authored
    || overrideSrc
    || MODAL_ICONS[result]
    || MODAL_ICON_FALLBACK;
};

export const collectModalIllustrations = (labels, overrideSrc) => {
  const l = labels || {};
  const resueltas = [
    resolveModalIcon(UPGRADE_RESULT.NO_AVAILABILITY, l.highDemandImage, overrideSrc),
    resolveModalIcon(UPGRADE_RESULT.NOT_FOUND, l.notFoundImage, overrideSrc),
    resolveModalIcon(UPGRADE_RESULT.ERROR, l.errorImage, overrideSrc),
  ].filter((v) => typeof v === 'string' && v.trim());
  const unicas = [...new Set(resueltas)];
  return {
    sprites: unicas.filter((v) => !isImageSource(v)),
    images: unicas.filter((v) => isImageSource(v)),
  };
};

const warmModalIllustrations = ({ sprites, images }) => {
  if (typeof window === 'undefined') return;
  preloadIcons(sprites);
  images.forEach((src) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
  });
};

const prefetchFallbackLoaderAsset = () => {
  if (typeof document === 'undefined') return;
  const tieneBloque = !!document.querySelector('.section.cms-loader-container')
    || !!document.querySelector('.cms-loader.block');
  if (tieneBloque) return;
  const yaDeclarado = document.head
    .querySelector(`link[rel="prefetch"][href="${CONDOR_LOADER_ASSET}"]`);
  if (yaDeclarado) return;
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'image';
  link.href = CONDOR_LOADER_ASSET;
  document.head.appendChild(link);
};

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

export const ConsultAvCreditsForm = ({
  onSubmit = () => {},
  onError = () => {},
  modalDescription,
  modalImageData,
  modalImageAlt,
  customClassName = '',
  ...rest
}) => {
  // Variables renombradas
  const [numberAvCredits, setNumberAvCredits] = useState('');
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ numberAvCredits: '', pin: '' });
  
  const [activeModal, setActiveModal] = useState(null); 
  const [useFallbackLoader, setUseFallbackLoader] = useState(false);
  const [labels, setLabels] = useState({});

  useEffect(() => {
    warmModalIllustrations(collectModalIllustrations());
    prefetchFallbackLoaderAsset();
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
        buttonText: getI18nLabel('ConsultAvCreditsForm.buttonText', 'Consultar'),
        avCreditsLabel: getI18nLabel('ConsultAvCreditsForm.labels.avCredits', 'Número de avianca credits'),
        avCreditsHelper: getI18nLabel('ConsultAvCreditsForm.helper.avCredits', 'Debe tener 16 dígitos sin caracteres especiales. Ejemplo: 7492836452738497.'),
        pinLabel: getI18nLabel('ConsultAvCreditsForm.labels.pin', 'PIN'),
        pinHelper: getI18nLabel('ConsultAvCreditsForm.helper.pin', 'Debe ser de 6 dígitos. Fue enviado junto con la información del avianca credits.'),
        avCreditsError: getI18nLabel('ConsultAvCreditsForm.error.avCredits', 'Completa los 16 dígitos de tu número Avianca Credits.'),
        pinError: getI18nLabel('ConsultAvCreditsForm.error.pin', 'Completa los 6 dígitos de tu PIN.'),
        loaderLabel: getI18nLabel('ConsultAvCreditsForm.loader.label', 'Cargando...'),
        errorTitle: getI18nLabel('ConsultAvCreditsForm.modalError.title', '¡Ups! Algo salió mal'),
        errorDescription: getI18nLabel('ConsultAvCreditsForm.modalError.description', 'Por favor, intenta de nuevo.'),
        errorButton: getI18nLabel('ConsultAvCreditsForm.modalError.buttonText', 'Reintentar'),
        highDemandTitle: getI18nLabel('ConsultAvCreditsForm.modalHighDemand.title', 'Servicio con alta demanda'),
        highDemandDescription: getI18nLabel('ConsultAvCreditsForm.modalHighDemand.description', 'El ascenso de cabina no está disponible para este vuelo.'),
        highDemandButton: getI18nLabel('ConsultAvCreditsForm.modalHighDemand.buttonText', 'Consultar otra reserva'),
        notFoundTitle: getI18nLabel('ConsultAvCreditsForm.modalNotFound.title', 'Los datos que proporcionaste no son válidos'),
        notFoundDescription: getI18nLabel('ConsultAvCreditsForm.modalNotFound.description', 'Por favor, asegúrate que el número y PIN de tu Avianca credits sea correcto'),
        notFoundButton: getI18nLabel('ConsultAvCreditsForm.modalNotFound.buttonText', 'Reintentar'),
        highDemandImage: getI18nLabel(MODAL_IMAGE_KEYS[UPGRADE_RESULT.NO_AVAILABILITY], ''),
        notFoundImage: getI18nLabel(MODAL_IMAGE_KEYS[UPGRADE_RESULT.NOT_FOUND], ''),
        errorImage: getI18nLabel(MODAL_IMAGE_KEYS[UPGRADE_RESULT.ERROR], ''),
        highDemandImageAlt: getI18nLabel('ConsultAvCreditsForm.modalHighDemand.imageAlt', ''),
        notFoundImageAlt: getI18nLabel('ConsultAvCreditsForm.modalNotFound.imageAlt', ''),
        errorImageAlt: getI18nLabel('ConsultAvCreditsForm.modalError.imageAlt', ''),
        notFoundAvCredits: getI18nLabel('ConsultAvCreditsForm.error.pnrNotFound', 'Revisa los 16 dígitos de tu número Avianca Credits.'),
        notFoundPin: getI18nLabel('ConsultAvCreditsForm.error.apellidoNotFound', 'Revisa los 6 dígitos de tu PIN.'),
        formAriaLabel: getI18nLabel('ConsultAvCreditsForm.aria.form', 'Formulario de upgrade de cabina'),
        submitAriaLabel: getI18nLabel('ConsultAvCreditsForm.aria.submitButton', 'Solicitar ascenso a Business Class'),
      });
      warmModalIllustrations(collectModalIllustrations({
        highDemandImage: getI18nLabel(MODAL_IMAGE_KEYS[UPGRADE_RESULT.NO_AVAILABILITY], ''),
        notFoundImage: getI18nLabel(MODAL_IMAGE_KEYS[UPGRADE_RESULT.NOT_FOUND], ''),
        errorImage: getI18nLabel(MODAL_IMAGE_KEYS[UPGRADE_RESULT.ERROR], ''),
      }, modalImageData?.src));
    };
    loadLabels();
  }, []);

  const handleNumberKeyPress = (e, limit, currentValue) => {
    // Permitir teclas de control nativas (borrar, flechas, tab)
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) return;
    
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
      return;
    }
    
    if (currentValue.length >= limit) {
      e.preventDefault();
    }
  };

  const handleAvCreditsChange = (value) => {
    const sanitized = sanitizeAvCredits(value);
    setNumberAvCredits(sanitized);
    if (errors.numberAvCredits && sanitized.length > 0) {
      setErrors((prev) => ({ ...prev, numberAvCredits: '' }));
    }
  };

  const handlePinChange = (value) => {
    const sanitized = sanitizePin(value);
    setPin(sanitized);
    if (errors.pin && sanitized.length > 0) {
      setErrors((prev) => ({ ...prev, pin: '' }));
    }
  };

  const handlePreventCopyPaste = (e) => {
    e.preventDefault();
  };

  const closeModal = () => setActiveModal(null);

  const handleHighDemandClose = () => {
    setActiveModal(null);
    setNumberAvCredits('');
    setPin('');
  };

  const handleNotFoundClose = () => {
    setActiveModal(null);
    document.getElementById('number-av-credits')?.focus();
  };

  const formatCurrency = (amountString, currencyCode) => {
    if (!amountString) return '';
    const numericValue = Number(amountString) / 100;
    const isCOP = currencyCode?.toUpperCase() === 'COP';
    const isWholeNumber = numericValue % 1 === 0;
    const decimals = (isCOP && isWholeNumber) ? 0 : 2;
    
    let locale = 'es-CO';
    if (currencyCode === 'USD') locale = 'en-US';
    if (currencyCode === 'ARS') locale = 'es-AR';
    
    const formattedNumber = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(numericValue);

    return `${currencyCode} ${formattedNumber}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('avcredits-clear-data'));

    const newErrors = { numberAvCredits: '', pin: '' };
    
    if (!numberAvCredits.trim() || numberAvCredits.trim().length !== 16) {
      newErrors.numberAvCredits = labels.avCreditsError;
    }
    
    if (!pin.trim() || pin.trim().length !== 6) {
      newErrors.pin = labels.pinError;
    } 
    
    if (newErrors.numberAvCredits || newErrors.pin) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    const hasCmsLoader = showLoader(true);
    if (hasCmsLoader && typeof labels.loaderLabel === 'string') {
      updateLoaderText(labels.loaderLabel);
    }
    setUseFallbackLoader(!hasCmsLoader);

    try {
      // Llamado al servicio usando las variables
      const response = await validateBalance({ numberAvCredits, pin });
      
      // Enviamos TODO el objeto response a nuestra nueva función
      const result = mapValidateResult(response); 
      
      // Si todo fue correcto
      if (result === UPGRADE_RESULT.ELIGIBLE) {
        const cardData = response.body['response-balanceenquiry'].cards[0];
        
        const mappedData = {
          currentBalance: formatCurrency(cardData.balance, cardData['currency-code']),
          holderName: `${cardData.holder['first-name'] || ''} ${cardData.holder['last-name'] || ''}`.trim(),
          avCreditsNumber: numberAvCredits.slice(-4),
          typeRefund: cardData['card-type'],
          statusAvCredits: cardData['card-status'],
          issueDate: cardData['activation-date'],
          expiryDate: cardData['expiry-date'],
          openingBalance: formatCurrency(cardData['activation-amount'], cardData['currency-code'])
        };

        // Disparamos evento para mostrar el banner
        window.dispatchEvent(new CustomEvent('avcredits-data-ready', { detail: mappedData }));
        
        showLoader(false);
        setIsSubmitting(false);
        return;
      }

      // Si nuestra nueva función detectó el 10086 o el 10004
      if (result === UPGRADE_RESULT.NOT_FOUND) {
        setErrors({ 
          numberAvCredits: labels.notFoundAvCredits, 
          pin: labels.notFoundPin
        });
      }
      
      // Mostramos el modal correspondiente y ocultamos loader
      showLoader(false);
      setActiveModal(result);
      onError({ result, response });

    } catch (error) {
      console.error('[consult-av-credits-form] validate failed:', error);
      showLoader(false);
      setActiveModal(UPGRADE_RESULT.ERROR);
      onError({ result: UPGRADE_RESULT.ERROR, error });
    }
    setIsSubmitting(false);
  };

  const containerClasses = `cabin-upgrade-form w-full ${customClassName}`.trim();
  const modalIconOverride = modalImageData?.src;

  return html`
    <form
      class=${containerClasses}
      onSubmit=${handleSubmit}
      data-name="ConsultAvCreditsForm"
      aria-label=${labels.formAriaLabel || 'Formulario de upgrade de cabina'}
      novalidate
      ...${rest}
    >
      <div class="flex gap-4 lg:flex-row flex-col w-full lg:min-h-[64px]">
        <div class="flex gap-4 lg:flex-row flex-col w-full">
          <div class="w-full">
            <${Input}
              id="number-av-credits"
              name="numberAvCredits"
              label=${labels.avCreditsLabel}
              type="password"
              value=${numberAvCredits}
              onChange=${handleAvCreditsChange}
              onKeyPress=${(e) => handleNumberKeyPress(e, 16, numberAvCredits)}
              onCopy=${handlePreventCopyPaste}
              onPaste=${handlePreventCopyPaste}
              required=${true}
              maxlength="16"
              minlength="16"
              state=${errors.numberAvCredits ? 'error' : 'normal'}
              helperText=${errors.numberAvCredits || labels.avCreditsHelper}
              showPasswordToggle=${true}
              aria-required="true"
              aria-invalid=${errors.numberAvCredits ? 'true' : 'false'}
              aria-describedby=${errors.numberAvCredits ? 'numberAvCredits-error' : undefined}
              customClassName=${`[&>div]:!outline-[var(${errors.numberAvCredits ? '' : '--color-border-default'})]${errors.numberAvCredits ? ' [&>div]:!outline-[#FF1C46]' : ''} ${errors.numberAvCredits ? '[&_label]:!text-[var(--color-alert-error-icon-bg)]' : '[&_label]:!text-[var(--color-text-normal-primary)]'}`}
            />
          </div>

          <div class="w-full">
            <${Input}
              id="pin"
              name="pin"
              label=${labels.pinLabel}
              type="password"
              value=${pin}
              onChange=${handlePinChange}
              onKeyPress=${(e) => handleNumberKeyPress(e, 6, pin)}
              onCopy=${handlePreventCopyPaste}
              onPaste=${handlePreventCopyPaste}
              required=${true}
              maxlength="6"
              minlength="6"
              state=${errors.pin ? 'error' : 'normal'}
              helperText=${errors.pin || labels.pinHelper}
              showPasswordToggle=${true}
              aria-required="true"
              aria-invalid=${errors.pin ? 'true' : 'false'}
              aria-describedby=${errors.pin ? 'pin-error' : undefined}
              customClassName=${`[&>div]:!outline-[var(${errors.pin ? '' : '--color-border-default'})]${errors.pin ? ' [&>div]:!outline-[#FF1C46]' : ''} ${errors.pin ? '[&_label]:!text-[var(--color-alert-error-icon-bg)]' : '[&_label]:!text-[var(--color-text-normal-primary)]'}`}
            />
          </div>
        </div>

        <div class="flex items-center max-h-[4rem] w-full lg:w-auto">
          <${Button}
            type="submit"
            variant="primary"
            size="md"
            disabled=${isSubmitting}
            customClassName="w-full lg:w-auto whitespace-nowrap"
            aria-label=${labels.submitAriaLabel || 'Solicitar ascenso a Business Class'}
          >
            ${labels.buttonText}
          </${Button}>
        </div>
      </div>
    </form>

    <${FullPageLoader} isOpen=${isSubmitting && useFallbackLoader} label=${labels.loaderLabel} />

    <${ModalAviancaLayout}
      isOpen=${activeModal === UPGRADE_RESULT.NO_AVAILABILITY}
      onClose=${handleHighDemandClose}
      title=${labels.highDemandTitle}
      description=${modalDescription || labels.highDemandDescription}
      icon=${resolveModalIcon(UPGRADE_RESULT.NO_AVAILABILITY, labels.highDemandImage, modalIconOverride)}
      imageAlt=${labels.highDemandImageAlt || modalImageAlt}
      primaryButtonLabel=${labels.highDemandButton}
      onPrimaryClick=${handleHighDemandClose}
    />

    <${ModalAviancaLayout}
      isOpen=${activeModal === UPGRADE_RESULT.NOT_FOUND}
      onClose=${handleNotFoundClose}
      title=${labels.notFoundTitle}
      description=${labels.notFoundDescription}
      icon=${resolveModalIcon(UPGRADE_RESULT.NOT_FOUND, labels.notFoundImage, modalIconOverride)}
      imageAlt=${labels.notFoundImageAlt || modalImageAlt}
      primaryButtonLabel=${labels.notFoundButton}
      onPrimaryClick=${handleNotFoundClose}
    />

    <${ModalAviancaLayout}
      isOpen=${activeModal === UPGRADE_RESULT.ERROR}
      onClose=${closeModal}
      title=${labels.errorTitle}
      description=${labels.errorDescription}
      icon=${resolveModalIcon(UPGRADE_RESULT.ERROR, labels.errorImage, modalIconOverride)}
      imageAlt=${labels.errorImageAlt || modalImageAlt}
      primaryButtonLabel=${labels.errorButton}
      onPrimaryClick=${closeModal}
    />
  `;
};

export default ConsultAvCreditsForm;