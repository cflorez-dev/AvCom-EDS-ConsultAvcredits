// Importamos OpenPGP nativamente desde un CDN para ES Modules
import * as openpgp from 'openpgp';

// Reemplaza esto con la llave pública real proporcionada por el backend
const PUBLIC_KEY_ARMORED = `-----BEGIN PGP PUBLIC KEY BLOCK-----

mQENBGjyt2gBCACxDMOTwFHeVribfFLFZtkF6tuyC8XvVqg1NQY3HmtmgEUFTRbh
3t1ITzZxwvoUYyHH8sLC29hcNDOdvphx0TbRud+9KfagzoU1CzAMOaQHnxkq32P6
yMLFqU5DT1moYc51dseF4wS2V1q7D0scfub1Yv2HMcWlZp+Rf2QLtcYgWkl8fQOJ
Jgs+OwXgBi8hbVy4A7C+J7ruCURG+C3bRYqWu6ca5hHV05OuIOE1m0uv6FPmHhU3
yMjpZHhg+mb/HFy2kfCh3nIFubjLVS4WGkkbWUalFx2/PE5oHjbQTfMdPBnNorhf
vQX430cduNXtC1mYDX3G+aIndVtTCDZV8+sTABEBAAG0K0F2Y29tUXdpa2NpbHZl
clFBIDxpdC5zZWN1cml0eUBhdmlhbmNhLmNvbT6JAVcEEwEIAEEWIQSIsHO024kJ
j0dgta0yNynLPEkHVgUCaPK3aAIbAwUJA8IzuAULCQgHAgIiAgYVCgkICwIEFgID
AQIeBwIXgAAKCRAyNynLPEkHVv6jCACS9UtszuUKGH+BdZa1QAPWuKuK5IThbeHU
AiPTFjoV87CbqqD0dRZmLcoXvN/kTClIXPAB3eE9uog9aNnMfFQw5JBrn2zQB8L2
SFrqLmkZG+8JhPWYw+AD26kleopye1oMb3OOi+hCzFyJ3s+Nw8NdPG0BZfnqlTZi
VgFPnn8qCF2UKwsZs1LAuZGCIVOmm0JATZZtbxHKL1rk7pd/dKDbmXoucKlCYyPE
vJoMYGLWrEafnlo/JlLTCSID/AINn3WKnOgQReNmkmiRG7JguaByPMJOl9nEklbZ
BA1ONDFnmCuQPSkgVNJUnMczHYQ85HhUz5M1VI59CbT7AlHaCttwuQENBGjyt2gB
CADQlysRbcLCFrTXwolDVWSjpI1zkwwdsVFSXTeyr7tIjDVr+LK4DX6sN4olHxAk
OncwxMdgVXzc8AoVP24sG+LZLBvcT6mxcWKJ7Wcy/kTPdz1tTtPxdLo5T+gdwTfH
4M2hz1Zgo7eC53isHgj1ZGZyoXUgyZw8trCYkSB8i09zRLR5NqwpZLnKvMZmRhPh
zfuObXew/HUYKx35nUQ1+NCt6NorsEcYudflGthnvvPpljgZQJYnpExErBi2XZKI
biL7k7x7UerVbR7Ve0TxCjbjAgvDEQmTrGjEzSaVFz4b+uqKyZnGo2qYsCTY7RzG
aXAtRzLfzgnxWWrIOAdvuNhzABEBAAGJATwEGAEIACYWIQSIsHO024kJj0dgta0y
NynLPEkHVgUCaPK3aAIbDAUJA8IzuAAKCRAyNynLPEkHVpaRB/40zodL7lT8qxbh
C8rkR3hs/W8QrXlveDVGW8Uzg4i52HTsthcNR2g2ImDc3FXEhqOL1x70v0sMK4NS
D5Bxqk4e0IIl/S+By7DgO+PCc3r1O8pERcQ+yGugQuSVcdlSB7QVrSRCB1Ff0xoL
8ayAOgzSCFgmMrENdrYEwbpWJ4U6gQvbEgl+If1Us1l3ExPYDkndtZpkPDPz77ze
XbzD+Hw20KB01H1YrrwOI62y4H/3InEXDAl7+sbi2TViXT7YlWVqDVnSF1QiKfX8
UW4xBhYPTtv1FqK9UF1SgbrSpTNjVnaWmOuBwVkHR+3uxZQVwr0RtWRgR1izMqJ0
GkvCvILb
=K4zW
-----END PGP PUBLIC KEY BLOCK-----
`;

/**
 * Encripta un texto plano usando PGP y retorna el string en Base64
 * @param {string} text - El texto a encriptar (voucher o pin)
 * @returns {Promise<string>} Mensaje PGP encriptado y codificado en Base64
 */
export const encryptPGP = async (text) => {
  if (!text) return '';

  try {
    // 1. Leer la llave pública
    const publicKey = await openpgp.readKey({ armoredKey: PUBLIC_KEY_ARMORED });
    
    // 2. Crear el mensaje a partir del texto plano
    const message = await openpgp.createMessage({ text: String(text) });
    
    // 3. Encriptar el mensaje (retorna el string "-----BEGIN PGP MESSAGE-----...")
    const encrypted = await openpgp.encrypt({
      message,
      encryptionKeys: publicKey,
      format: 'armored'
    });
    
    // 4. El backend espera que el bloque PGP esté codificado en Base64
    return btoa(encrypted);
  } catch (error) {
    console.error('[encryption.service] Error encriptando dato:', error);
    throw new Error('Fallo la encriptación de seguridad');
  }
};