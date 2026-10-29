import { getEnvironmentValues } from '/design-system/organisms/get-key-env/get-key-env.js';

/**
 * MarTech Configuration for Avianca EDS
 * Centralizes environment detection and script URLs
 */

/**
 * Detect current environment based on hostname
 * @returns {'development' | 'production'}
 */
export function getEnvironment() {
  const { hostname } = window.location;

  // Production: avianca.com (with or without www) and the fenix-prd aem.live host
  if (
    hostname.includes('avianca.com') || 
    hostname.includes('prd')
  ) {
    return 'production';
  }

  // Development: Everything else (localhost, .aem.page, .aem.live, etc.)
  return 'development';
}

/**
 * Check if analytics/tracking is disabled via query param
 * @returns {boolean}
 */
export function isTrackingDisabled() {
  return window.location.search.includes('martech=off');
}

/**
 * Detect if the page is running in AEM author mode / Universal Editor.
 * @returns {boolean}
 */
export function isAuthorMode() {
  try {
    return !!(
      window.xwalk?.isAuthorEnv
      || window.hlx?.aue
      || document.querySelector('meta[name="urn:auecon:aemconnection"]')
      || window.location.hostname.includes('author-')
      || window.location.hostname.includes('adobeaemcloud.com')
    );
  } catch (e) {
    return false;
  }
}

// Adobe Launch URLs per environment
export const ADOBE_LAUNCH_URLS = await getEnvironmentValues(['ADOBE_LAUNCH_URLS']);

// OneTrust Configuration
export const ONETRUST_CONFIG = {
  scriptUrl: await getEnvironmentValues(['ONETRUST_CONFIG_URL']),
  domainScript: await getEnvironmentValues(['ONETRUST_CONFIG_DOMAIN']),
};

// GTM Container ID
export const GTM_CONTAINER_ID = await getEnvironmentValues(['GTM_CONTAINER_ID']);
