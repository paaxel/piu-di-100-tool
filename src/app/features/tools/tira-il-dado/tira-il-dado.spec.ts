import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { TiraIlDado } from './tira-il-dado';

const fb = new FormBuilder();
const seo = { set: () => {} } as any;

describe('TiraIlDado', () => {
  it('rolls a D6 and produces values between 1 and 6', () => {
    const comp = new TiraIlDado(fb, seo);
    comp.form.patchValue({ faces: 6, count: 1 });
    comp.roll();
    expect(comp.results).toHaveLength(1);
    expect(comp.results[0].value).toBeGreaterThanOrEqual(1);
    expect(comp.results[0].value).toBeLessThanOrEqual(6);
  });

  it('rolls 3 D20 and produces exactly 3 results', () => {
    const comp = new TiraIlDado(fb, seo);
    comp.form.patchValue({ faces: 20, count: 3 });
    comp.roll();
    expect(comp.results).toHaveLength(3);
    for (const r of comp.results) {
      expect(r.value).toBeGreaterThanOrEqual(1);
      expect(r.value).toBeLessThanOrEqual(20);
    }
  });

  it('total equals the sum of all die values', () => {
    const comp = new TiraIlDado(fb, seo);
    comp.form.patchValue({ faces: 6, count: 4 });
    comp.roll();
    const expected = comp.results.reduce((s, r) => s + r.value, 0);
    expect(comp.total).toBe(expected);
  });
});

