import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { RomanNumbers } from './roman-numbers';

const fb = new FormBuilder();
const seo = { set: () => {} } as any;

describe('RomanNumbers', () => {
  it('converts 4 to "IV"', () => {
    const comp = new RomanNumbers(fb, seo);
    comp.toRomanForm.patchValue({ arabic: 4 });
    expect(comp.romanResult).toBe('IV');
  });

  it('converts 2024 to "MMXXIV"', () => {
    const comp = new RomanNumbers(fb, seo);
    comp.toRomanForm.patchValue({ arabic: 2024 });
    expect(comp.romanResult).toBe('MMXXIV');
  });

  it('converts "XIV" back to 14', () => {
    const comp = new RomanNumbers(fb, seo);
    comp.fromRomanForm.patchValue({ roman: 'XIV' });
    expect(comp.arabicResult).toBe('14');
  });
});

