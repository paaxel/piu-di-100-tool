/**
 * UUID v4 — uses the Web Crypto API (cryptographically secure).
 */
export function generateUuidV4(): string {
  return crypto.randomUUID();
}

/**
 * Crockford's Base32 alphabet (no I, L, O, U).
 */
const CROCKFORD_CHARS = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/**
 * ULID — Universally Unique Lexicographically Sortable Identifier.
 * Format: 48-bit ms timestamp (10 chars) + 80-bit random (16 chars).
 */
export function generateUlid(): string {
  const timestampMs = Date.now();

  // Encode 48-bit timestamp into 10 Crockford Base32 chars
  let t = timestampMs;
  let tsEncoded = '';
  for (let i = 0; i < 10; i++) {
    tsEncoded = CROCKFORD_CHARS[t % 32] + tsEncoded;
    t = Math.floor(t / 32);
  }

  // Generate 80 random bits (10 random bytes → 16 Crockford Base32 chars)
  const randomBytes = crypto.getRandomValues(new Uint8Array(10));
  let randEncoded = '';
  // Process bytes into 5-bit groups for Base32 encoding
  let bits = 0;
  let bitsCount = 0;
  for (const byte of randomBytes) {
    bits = (bits << 8) | byte;
    bitsCount += 8;
    while (bitsCount >= 5) {
      bitsCount -= 5;
      randEncoded += CROCKFORD_CHARS[(bits >> bitsCount) & 0x1f];
    }
  }

  return tsEncoded + randEncoded;
}

export type UuidVersion = 'v4';
export type IdType = 'uuid' | 'ulid';
