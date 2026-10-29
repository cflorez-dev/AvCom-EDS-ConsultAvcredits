// Importamos OpenPGP nativamente desde un CDN para ES Modules
import * as openpgp from 'openpgp';
import { getEnvironmentValues } from '/design-system/organisms/get-key-env/get-key-env.js';

const [endPoint] = await getEnvironmentValues(['AVC_ENVIRONMENT_API_URL']);
let PUBLIC_KEY_ARMORED = '';
let currentSecretName = '';

/**
 * Encripta un texto plano usando PGP y retorna el string en Base64
 * @param {string} text - El texto a encriptar (voucher o pin)
 * @param {string} secretName - Nombre del secreto en KeyVault
 * @returns {Promise<string>} Mensaje PGP encriptado y codificado en Base64
 */
export const encryptPGP = async (text, secretName) => {
  if (!text) return '';
  if (!secretName) throw new Error('Se requiere el secretName para obtener la llave');
  
  try {
    
    if (!PUBLIC_KEY_ARMORED || currentSecretName !== secretName) {
      const url = `${endPoint}/publicKey?secretName=${secretName}`;
      const response = await fetch(url, { method: 'GET' });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      PUBLIC_KEY_ARMORED = atob(data.value);
      currentSecretName = secretName;
    }
    
    const publicKey = await openpgp.readKey({ armoredKey: PUBLIC_KEY_ARMORED });
    
    const message = await openpgp.createMessage({ text: String(text) });
    
    const encrypted = await openpgp.encrypt({
      message,
      encryptionKeys: publicKey,
      format: 'armored'
    });
    
    return btoa(encrypted);
  } catch (error) {
    console.error('[encryption.service] Error encriptando dato:', error);
    throw new Error('Fallo la encriptación de seguridad');
  }
};