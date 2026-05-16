import {
  calculateControlCharacter,
  createNameCode,
  createSurnameCode,
  createMonthCode,
  createDayCode,
} from './codice-fiscale-utils';

describe('codice-fiscale-utils', () => {
  it('builds surname code', () => {
    expect(createSurnameCode('Rossi')).toBe('RSS');
  });

  it('builds name code with 4 consonants rule', () => {
    expect(createNameCode('Christopher')).toBe('CRS');
  });

  it('encodes month and day', () => {
    expect(createMonthCode(8)).toBe('M');
    expect(createDayCode(5, 'F')).toBe('45');
  });

  it('calculates control char', () => {
    expect(calculateControlCharacter('RSSMRA80A01H501')).toBe('U');
  });
});
