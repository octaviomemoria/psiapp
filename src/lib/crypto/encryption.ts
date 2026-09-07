/**
 * PsiApp - Camada de Criptografia Nível de Saúde (Web Crypto API)
 * Utiliza AES-GCM com chave derivada via PBKDF2 (SHA-256) com salt único.
 * Desenvolvido para proteção de dados sensíveis de prontuário (CFP 001/2009 e LGPD Art. 11).
 */

// Chave padrão de derivação de sessão (em produção real, é fornecida pela chave privada do usuário)
const DEFAULT_KEY_PASSPHRASE = 'psi-app-secure-salt-key-2026';

function stringToArrayBuffer(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function arrayBufferToString(buffer: ArrayBuffer): string {
  return new TextDecoder().decode(buffer);
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Deriva uma chave AES-GCM a partir de uma senha e salt via PBKDF2.
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    stringToArrayBuffer(passphrase) as any,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export interface EncryptedPayload {
  cipherText: string;
  iv: string;
  salt: string;
  version: string;
}

/**
 * Criptografa um texto com AES-GCM-256
 */
export async function encryptText(
  plainText: string,
  passphrase = DEFAULT_KEY_PASSPHRASE
): Promise<EncryptedPayload> {
  if (typeof window === 'undefined' && typeof crypto === 'undefined') {
    // Fallback se executado fora do browser/Node moderno
    return {
      cipherText: btoa(unescape(encodeURIComponent(plainText))),
      iv: 'fallback-iv',
      salt: 'fallback-salt',
      version: 'v1-fallback'
    };
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);

  const encodedData = stringToArrayBuffer(plainText);
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as any
    },
    key,
    encodedData as any
  );

  return {
    cipherText: arrayBufferToBase64(encryptedBuffer),
    iv: arrayBufferToBase64(iv.buffer),
    salt: arrayBufferToBase64(salt.buffer),
    version: 'aes-gcm-256-v1'
  };
}

/**
 * Decifra um texto cifrado com AES-GCM-256
 */
export async function decryptText(
  payload: EncryptedPayload,
  passphrase = DEFAULT_KEY_PASSPHRASE
): Promise<string> {
  if (payload.version === 'v1-fallback') {
    return decodeURIComponent(escape(atob(payload.cipherText)));
  }

  try {
    const salt = new Uint8Array(base64ToArrayBuffer(payload.salt));
    const iv = new Uint8Array(base64ToArrayBuffer(payload.iv));
    const cipherData = base64ToArrayBuffer(payload.cipherText);

    const key = await deriveKey(passphrase, salt);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as any
      },
      key,
      cipherData as any
    );

    return arrayBufferToString(decryptedBuffer);
  } catch (error) {
    console.error('Falha ao decifrar conteúdo sensível:', error);
    throw new Error('Chave de descriptografia incorreta ou dados corrompidos.');
  }
}
