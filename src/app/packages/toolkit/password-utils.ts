export interface PasswordOptions {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  digits: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  requireLowercase?: boolean;
  requireUppercase?: boolean;
  requireDigits?: boolean;
  requireSymbols?: boolean;
}

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.<>?/|~';
const AMBIGUOUS = /[O0Il1|`'"]/g;

export function generatePassword(options: PasswordOptions): string {
  let lowerPool = options.lowercase ? LOWER : '';
  let upperPool = options.uppercase ? UPPER : '';
  let digitPool = options.digits ? DIGITS : '';
  let symbolPool = options.symbols ? SYMBOLS : '';

  if (options.excludeAmbiguous) {
    lowerPool = lowerPool.replace(AMBIGUOUS, '');
    upperPool = upperPool.replace(AMBIGUOUS, '');
    digitPool = digitPool.replace(AMBIGUOUS, '');
    symbolPool = symbolPool.replace(AMBIGUOUS, '');
  }

  const alphabet = lowerPool + upperPool + digitPool + symbolPool;

  if (!alphabet || options.length <= 0) return '';

  const len = Math.min(Math.max(1, options.length | 0), 1024);
  const requiredChars: string[] = [];

  if (options.requireLowercase && lowerPool) requiredChars.push(pickChar(lowerPool));
  if (options.requireUppercase && upperPool) requiredChars.push(pickChar(upperPool));
  if (options.requireDigits && digitPool) requiredChars.push(pickChar(digitPool));
  if (options.requireSymbols && symbolPool) requiredChars.push(pickChar(symbolPool));

  if (requiredChars.length > len) {
    return '';
  }

  const out = new Array<string>(len);
  for (let j = 0; j < requiredChars.length; j += 1) {
    out[j] = requiredChars[j];
  }

  let i = requiredChars.length;
  while (i < len) {
    out[i++] = pickChar(alphabet);
  }

  for (let k = out.length - 1; k > 0; k -= 1) {
    const j = randomIndex(k + 1);
    [out[k], out[j]] = [out[j], out[k]];
  }

  return out.join('');
}

function pickChar(pool: string): string {
  return pool[randomIndex(pool.length)];
}

function randomIndex(maxExclusive: number): number {
  const max = Math.floor(0xffffffff / maxExclusive) * maxExclusive;
  const buf = new Uint32Array(1);

  while (true) {
    crypto.getRandomValues(buf);
    if (buf[0] < max) {
      return buf[0] % maxExclusive;
    }
  }
}

export type PasswordStrength = 'WEAK' | 'FAIR' | 'STRONG' | 'EXCELLENT';

export function estimateStrength(password: string): PasswordStrength {
  if (!password) return 'WEAK';
  const len = password.length;
  if (len < 10) return 'WEAK';
  if (len <= 14) return 'FAIR';
  if (len <= 20) return 'STRONG';
  return 'EXCELLENT';
}
