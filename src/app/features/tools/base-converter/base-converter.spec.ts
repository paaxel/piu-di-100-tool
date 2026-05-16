import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { BaseConverter } from './base-converter';

const fb = new FormBuilder();
const seo = { set: () => {} } as any;

describe('BaseConverter', () => {
  it('converts decimal 10 to all bases', () => {
    const comp = new BaseConverter(fb, seo);
    comp.form.patchValue({ value: '10', fromBase: '10' });
    comp.convert();
    const byBase = Object.fromEntries(comp.results.map((r) => [r.base, r.value]));
    expect(byBase[2]).toBe('1010');
    expect(byBase[8]).toBe('12');
    expect(byBase[16]).toBe('A');
  });

  it('converts hexadecimal A (base 16) to decimal 10', () => {
    const comp = new BaseConverter(fb, seo);
    comp.form.patchValue({ value: 'A', fromBase: '16' });
    comp.convert();
    const dec = comp.results.find((r) => r.base === 10);
    expect(dec?.value).toBe('10');
  });

  it('sets an error for an invalid value in the selected base', () => {
    const comp = new BaseConverter(fb, seo);
    comp.form.patchValue({ value: '2', fromBase: '2' });
    comp.convert();
    expect(comp.error).toMatch(/non valido/i);
    expect(comp.results).toHaveLength(0);
  });
});

