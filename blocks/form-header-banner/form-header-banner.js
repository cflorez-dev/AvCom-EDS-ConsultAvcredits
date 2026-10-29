import { h, render } from '@dropins/tools/preact.js';
import htm from 'htm';
import { default as coreDecorate } from '/core/blocks/form-header-banner/form-header-banner.js';
import { ConsultAvCreditsForm } from '/design-system/organisms/forms/consult-av-credits-form/consult-av-credits-form.js';

const html = htm.bind(h);
/**
 * Maps block options from HTML according to the model defined in _component-models.json
 
 * @param {Element} block The form-header-banner block element
 * @returns {Object} Object with options mapped according to the model
 */
/**
 * Decorates the Form Header Banner block
 * @param {Element} block The form-header-banner block element
 */
export default async function decorate(block) {
  await coreDecorate(block);
  const coreFormElement = block.querySelector('form');

  if (!coreFormElement) {
    return;
  }

  const formContainer = coreFormElement.parentElement;

  formContainer.innerHTML = '';

  render(
    html`<${ConsultAvCreditsForm} />`,
    formContainer
  );
}
