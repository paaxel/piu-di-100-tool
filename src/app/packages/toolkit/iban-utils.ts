export interface IbanCheckResult {
  valid: boolean;
  normalized: string;
  reason?: string;
}

const IBAN_REGEX = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/;

export function normalizeIban(value: string): string {
  return (value || '').replace(/\s+/g, '').toUpperCase();
}

export function checkIbanControl(value: string): IbanCheckResult {
  const normalized = normalizeIban(value);

  if (normalized.length < 15 || normalized.length > 34) {
    return { valid: false, normalized, reason: 'LENGTH' };
  }
  if (!IBAN_REGEX.test(normalized)) {
    return { valid: false, normalized, reason: 'FORMAT' };
  }

  const rearranged = normalized.slice(4) + normalized.slice(0, 4);
  let remainder = 0;
  for (const ch of rearranged) {
    const code = ch.charCodeAt(0);
    const digit = code >= 65 && code <= 90 ? (code - 55).toString() : ch;
    for (const d of digit) {
      remainder = (remainder * 10 + parseInt(d, 10)) % 97;
    }
  }

  return { valid: remainder === 1, normalized, reason: remainder === 1 ? undefined : 'CHECKSUM' };
}
