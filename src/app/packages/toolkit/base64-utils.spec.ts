import { decodeBase64, encodeBase64 } from './base64-utils';

describe('base64-utils', () => {
  it('encodes utf-8 strings', () => {
    expect(encodeBase64('Ciao mondo')).toBe('Q2lhbyBtb25kbw==');
  });

  it('decodes utf-8 strings', () => {
    expect(decodeBase64('Q2lhbyBtb25kbw==')).toBe('Ciao mondo');
  });
});
