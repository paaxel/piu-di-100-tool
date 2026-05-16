import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { IvaCalculator } from './iva-calculator';

const fb = new FormBuilder();
const seo = { set: () => {} } as any;

describe('IvaCalculator', () => {
  it('adds 22% IVA to 100€ net price', () => {
    const comp = new IvaCalculator(fb, seo);
    comp.form.patchValue({ mode: 'add', price: 100, rate: 22 });
    comp.calculate();
    expect(comp.result?.imponibile).toBe('100.00');
    expect(comp.result?.importoIva).toBe('22.00');
    expect(comp.result?.totale).toBe('122.00');
  });

  it('extracts 22% IVA from 122€ gross price', () => {
    const comp = new IvaCalculator(fb, seo);
    comp.form.patchValue({ mode: 'remove', price: 122, rate: 22 });
    comp.calculate();
    expect(parseFloat(comp.result!.imponibile)).toBeCloseTo(100, 1);
    expect(parseFloat(comp.result!.importoIva)).toBeCloseTo(22, 1);
  });

  it('returns null for a negative price', () => {
    const comp = new IvaCalculator(fb, seo);
    comp.form.patchValue({ mode: 'add', price: -10, rate: 22 });
    comp.calculate();
    expect(comp.result).toBeNull();
  });
});

