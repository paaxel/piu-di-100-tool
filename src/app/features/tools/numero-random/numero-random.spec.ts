import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { NumeroRandom } from './numero-random';

const fb = new FormBuilder();
const seo = { set: () => {} } as any;

describe('NumeroRandom', () => {
  it('generates a number within the specified range', () => {
    const comp = new NumeroRandom(fb, seo);
    comp.form.patchValue({ min: 1, max: 10, count: 1 });
    comp.generate();
    expect(comp.result).not.toBeNull();
    expect(comp.result!).toBeGreaterThanOrEqual(1);
    expect(comp.result!).toBeLessThanOrEqual(10);
  });

  it('generates the requested number of results', () => {
    const comp = new NumeroRandom(fb, seo);
    comp.form.patchValue({ min: 1, max: 100, count: 5 });
    comp.generate();
    expect(comp.results).toHaveLength(5);
  });

  it('handles inverted min/max by swapping them', () => {
    const comp = new NumeroRandom(fb, seo);
    comp.form.patchValue({ min: 10, max: 1, count: 1 });
    comp.generate();
    expect(comp.result!).toBeGreaterThanOrEqual(1);
    expect(comp.result!).toBeLessThanOrEqual(10);
  });
});

