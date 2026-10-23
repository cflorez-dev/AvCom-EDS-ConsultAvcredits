import { h } from '@dropins/tools/preact.js';
import { useState, useEffect } from '@dropins/tools/preact-hooks.js';
import htm from 'htm';
import { ModalAviancaLayout, isImageSource } from '/core/design-system/molecules/modal/modal-avianca-layout.js';

const html = htm.bind(h);

// Constante simulada para el estado (ajústala a tus constantes reales como BALANCE_RESULT)
const ACTION_STATES = {
  RESET_PIN: 'RESET_PIN'
};

/**
 * Hook integrado para manejar la acción de Reset PIN
 * Escucha el evento disparado por el Pill Button y revisa si la URL carga con #resetPin
 */
const useResetPinAction = (setActiveModal, modalStateValue) => {
  useEffect(() => {
    // 1. Reaccionar al clic del Pill Button
    const handleTriggerAction = (event) => {
      const { actionId } = event.detail;
      
      if (actionId === 'resetPin') {
        setActiveModal(modalStateValue);
      }
    };

    window.addEventListener('trigger-action', handleTriggerAction);

    // 2. Reaccionar si la página se carga directamente con el ID en la URL
    const currentHash = window.location.hash;
    if (currentHash === '#resetPin') {
      setActiveModal(modalStateValue);
      
      // Limpia la URL visualmente sin recargar la página
      const cleanUrl = window.location.pathname + window.location.search;
      window.history.replaceState(null, '', cleanUrl);
    }

    return () => {
      window.removeEventListener('trigger-action', handleTriggerAction);
    };
  }, []); // <-- CORRECCIÓN: Arreglo vacío para que se ejecute solo una vez al cargar y evite el bucle
};

/**
 * Componente Organism Padre
 * Mantiene el estado de las modales y renderiza la interfaz
 */
export const resetPin = ({ labels }) => {
  const [activeModal, setActiveModal] = useState(null);

  // Inyectamos la lógica de intercepción llamando al hook definido arriba
  useResetPinAction(setActiveModal, ACTION_STATES.RESET_PIN);

  // Función genérica para cerrar la modal
  const handleCloseModal = () => {
    setActiveModal(null);
  };

  return html`
    <div class="organism-container">
      
      <${ModalAviancaLayout}
        isOpen=${activeModal === ACTION_STATES.RESET_PIN}
        onClose=${handleCloseModal}
        title=${labels?.resetPinTitle || 'Recuperar PIN'}
        description=${labels?.resetPinDescription || 'Sigue los pasos para recuperar tu PIN.'}
        primaryButtonLabel=${labels?.resetPinButton || 'Aceptar'}
        onPrimaryClick=${handleCloseModal}
      />
    </div>
  `;
};