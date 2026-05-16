import { calculateControlCharacter } from './codice-fiscale-utils';

export interface CfCheckResult {
  valid: boolean;
  normalized: string;
  reason?: 'FORMAT' | 'CHECKSUM';
  expectedCheck?: string;
  givenCheck?: string;
}

export const CF_REGEX = /^[A-Z0-9]{16}$/i;

export function checkCodiceFiscaleControl(value: string): CfCheckResult {
  const normalized = (value || '').trim().toUpperCase();

  if (!CF_REGEX.test(normalized)) {
    return { valid: false, normalized, reason: 'FORMAT' };
  }

  const partial = normalized.slice(0, 15);
  const givenCheck = normalized.slice(15);
  const expectedCheck = calculateControlCharacter(partial);

  if (expectedCheck !== givenCheck) {
    return { valid: false, normalized, reason: 'CHECKSUM', expectedCheck, givenCheck };
  }

  return { valid: true, normalized, expectedCheck, givenCheck };
}
