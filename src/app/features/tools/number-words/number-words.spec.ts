import '@angular/compiler';
import { numberToWords } from './number-words';

describe('numberToWords', () => {
  it('converts 0 to "zero"', () => {
    expect(numberToWords(0)).toBe('zero');
  });

  it('converts 1234 to Italian words', () => {
    expect(numberToWords(1234)).toBe('milleduecentotrentaquattro');
  });

  it('converts 1000000 to "unmilione"', () => {
    expect(numberToWords(1000000)).toBe('unomilione');
  });

  it('converts 21 with elision (ventuno)', () => {
    expect(numberToWords(21)).toBe('ventuno');
  });

  it('converts 1001 to "milleuno"', () => {
    expect(numberToWords(1001)).toBe('milleuno');
  });
});

