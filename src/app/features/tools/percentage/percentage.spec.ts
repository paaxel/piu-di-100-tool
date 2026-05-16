import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { PercentageCalculator } from './percentage';

const fb = new FormBuilder();
const seo = { set: () => {} } as any;

describe('PercentageCalculator', () => {
  it('calculates 20% of 150 = 30 (percent-of mode)', () => {
    const comp = new PercentageCalculator(fb, seo);
    comp.form.patchValue({ mode: 'percent-of', a: 20, b: 150 });
    comp.calculate();
    expect(comp.result).toBe('30');
  });

  it('calculates 30 is 20% of 150 (percent-of-total mode)', () => {
    const comp = new PercentageCalculator(fb, seo);
    comp.form.patchValue({ mode: 'percent-of-total', a: 30, b: 150 });
    comp.calculate();
    expect(comp.result).toBe('20 %');
  });

  it('calculates 50% change from 100 to 150 (percent-change mode)', () => {
    const comp = new PercentageCalculator(fb, seo);
    comp.form.patchValue({ mode: 'percent-change', a: 100, b: 150 });
    comp.calculate();
    expect(comp.result).toBe('50 %');
  });
});

