import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { DiscountCalculator } from './discount-calculator';

const fb = new FormBuilder();
const seo = { set: () => {} } as any;

describe('DiscountCalculator', () => {
  it('calculates 20% discount on 100€ correctly', () => {
    const comp = new DiscountCalculator(fb, seo);
    comp.form.patchValue({ price: 100, discount: 20 });
    comp.calculate();
    expect(comp.result?.importoSconto).toBe('20.00');
    expect(comp.result?.prezzoScontato).toBe('80.00');
  });

  it('returns 0 discount amount when discount is 0', () => {
    const comp = new DiscountCalculator(fb, seo);
    comp.form.patchValue({ price: 50, discount: 0 });
    comp.calculate();
    expect(comp.result?.importoSconto).toBe('0.00');
    expect(comp.result?.prezzoScontato).toBe('50.00');
  });

  it('returns null for discount greater than 100', () => {
    const comp = new DiscountCalculator(fb, seo);
    comp.form.patchValue({ price: 100, discount: 150 });
    comp.calculate();
    expect(comp.result).toBeNull();
  });
});

