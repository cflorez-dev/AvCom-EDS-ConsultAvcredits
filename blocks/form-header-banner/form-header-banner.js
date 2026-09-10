// blocks/form-header-banner/form-header-banner.js
import { default as coreDecorate } from '/core/blocks/form-header-banner/form-header-banner.js';

/**
 * Maps block options from HTML according to the model defined in _component-models.json
 
 * @param {Element} block The form-header-banner block element
 * @returns {Object} Object with options mapped according to the model
 */
/**
 * Decorates the Form Header Banner block
 * @param {Element} block The form-header-banner block element
 */
export default function decorate(block) {
  await coreDecorate(block);
}
