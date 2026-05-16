export interface DecodedJwt {
  header: unknown;
  payload: unknown;
  signature: string;
  raw: { header: string; payload: string; signature: string };
}

const HMAC_ALGS: Record<string, string> = { HS256: 'SHA-256', HS384: 'SHA-384', HS512: 'SHA-512' };
const RSA_ALGS: Record<string, string> = { RS256: 'SHA-256', RS384: 'SHA-384', RS512: 'SHA-512' };
const PSS_ALGS: Record<string, [string, number]> = {
  PS256: ['SHA-256', 32],
  PS384: ['SHA-384', 48],
  PS512: ['SHA-512', 64],
};
const EC_ALGS: Record<string, [string, string]> = {
  ES256: ['SHA-256', 'P-256'],
  ES384: ['SHA-384', 'P-384'],
  ES512: ['SHA-512', 'P-521'],
};

export const SYMMETRIC_ALGS = Object.keys(HMAC_ALGS);
export const ASYMMETRIC_ALGS = [...Object.keys(RSA_ALGS), ...Object.keys(PSS_ALGS), ...Object.keys(EC_ALGS)];
export const SUPPORTED_VERIFY_ALGS = [...SYMMETRIC_ALGS, ...ASYMMETRIC_ALGS];

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  const decoded = atob(padded + pad);
  try {
    return decodeURIComponent(
      decoded
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
  } catch {
    return decoded;
  }
}

function decodeBase64(b64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function base64UrlToBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const padded = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  return decodeBase64(padded + pad);
}

function pemToBytes(pem: string): Uint8Array<ArrayBuffer> {
  const stripped = pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
  return decodeBase64(stripped);
}

/** Convert a raw R||S ECDSA signature (JWT format) to DER for Web Crypto. */
function ecdsaRawToDer(raw: Uint8Array<ArrayBuffer>): Uint8Array<ArrayBuffer> {
  const half = raw.length / 2;
  const r = raw.subarray(0, half);
  const s = raw.subarray(half);
  const rPad = r[0] & 0x80 ? new Uint8Array([0, ...r]) : new Uint8Array(r);
  const sPad = s[0] & 0x80 ? new Uint8Array([0, ...s]) : new Uint8Array(s);
  const seqLen = 2 + rPad.length + 2 + sPad.length;
  const der = new Uint8Array(2 + seqLen);
  let i = 0;
  der[i++] = 0x30;
  der[i++] = seqLen;
  der[i++] = 0x02;
  der[i++] = rPad.length;
  der.set(rPad, i);
  i += rPad.length;
  der[i++] = 0x02;
  der[i++] = sPad.length;
  der.set(sPad, i);
  return der;
}

export function decodeJwt(token: string): DecodedJwt {
  const trimmed = (token || '').trim();
  const parts = trimmed.split('.');
  if (parts.length < 2) {
    throw new Error('INVALID_JWT');
  }

  const headerStr = base64UrlDecode(parts[0]);
  const payloadStr = base64UrlDecode(parts[1]);

  return {
    header: JSON.parse(headerStr),
    payload: JSON.parse(payloadStr),
    signature: parts[2] ?? '',
    raw: { header: parts[0], payload: parts[1], signature: parts[2] ?? '' },
  };
}

export async function verifyJwtSignature(token: string, keyMaterial: string): Promise<boolean> {
  const parts = token.trim().split('.');
  if (parts.length !== 3) throw new Error('INVALID_JWT');

  const decoded = decodeJwt(token);
  const alg = ((decoded.header as Record<string, unknown>)['alg'] as string) ?? '';
  const signingStr = parts[0] + '.' + parts[1];
  const signingInput = new Uint8Array(signingStr.length);
  for (let i = 0; i < signingStr.length; i++) signingInput[i] = signingStr.charCodeAt(i);
  const rawSig = base64UrlToBytes(parts[2]);

  let cryptoKey: CryptoKey;
  let verifyAlg: AlgorithmIdentifier | RsaPssParams | EcdsaParams;
  let signature: Uint8Array<ArrayBuffer> = rawSig;

  if (HMAC_ALGS[alg]) {
    const keyStr = keyMaterial;
    const keyBytes = new Uint8Array(keyStr.length);
    for (let i = 0; i < keyStr.length; i++) keyBytes[i] = keyStr.charCodeAt(i);
    cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: HMAC_ALGS[alg] },
      false,
      ['verify'],
    );
    verifyAlg = { name: 'HMAC' };
  } else if (RSA_ALGS[alg]) {
    cryptoKey = await crypto.subtle.importKey(
      'spki',
      pemToBytes(keyMaterial),
      { name: 'RSASSA-PKCS1-v1_5', hash: RSA_ALGS[alg] },
      false,
      ['verify'],
    );
    verifyAlg = { name: 'RSASSA-PKCS1-v1_5' };
  } else if (PSS_ALGS[alg]) {
    const [hash, saltLength] = PSS_ALGS[alg];
    cryptoKey = await crypto.subtle.importKey(
      'spki',
      pemToBytes(keyMaterial),
      { name: 'RSA-PSS', hash },
      false,
      ['verify'],
    );
    verifyAlg = { name: 'RSA-PSS', saltLength };
  } else if (EC_ALGS[alg]) {
    const [hash, namedCurve] = EC_ALGS[alg];
    cryptoKey = await crypto.subtle.importKey(
      'spki',
      pemToBytes(keyMaterial),
      { name: 'ECDSA', namedCurve },
      false,
      ['verify'],
    );
    verifyAlg = { name: 'ECDSA', hash };
    signature = ecdsaRawToDer(rawSig);
  } else {
    throw new Error('UNSUPPORTED_ALG');
  }

  return crypto.subtle.verify(verifyAlg, cryptoKey, signature, signingInput);
}
