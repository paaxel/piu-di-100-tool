import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { AgeCalculator } from './age-calculator';

const fb = new FormBuilder();
const seo = { set: () => {} } as any;

describe('AgeCalculator', () => {
  it('calculates exact age for a birthday exactly 30 years ago', () => {
    const comp = new AgeCalculator(fb, seo);
    const today = new Date('2024-06-15');
    const birth = new Date('1994-06-15');
    comp.form.patchValue({
      birthDate: birth.toISOString().split('T')[0],
      referenceDate: today.toISOString().split('T')[0],
    });
    comp.calculate();
    expect(comp.result?.years).toBe(30);
    expect(comp.result?.months).toBe(0);
    expect(comp.result?.days).toBe(0);
  });

  it('calculates partial-year age correctly', () => {
    const comp = new AgeCalculator(fb, seo);
    comp.form.patchValue({ birthDate: '1990-01-15', referenceDate: '2024-07-20' });
    comp.calculate();
    expect(comp.result?.years).toBe(34);
    expect(comp.result?.months).toBe(6);
    expect(comp.result?.days).toBe(5);
  });

  it('returns null when birth date is in the future', () => {
    const comp = new AgeCalculator(fb, seo);
    comp.form.patchValue({ birthDate: '2099-01-01', referenceDate: '2024-01-01' });
    comp.calculate();
    expect(comp.result).toBeNull();
  });
});

