import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { DateDiff } from './date-diff';

const fb = new FormBuilder();
const seo = { set: () => {} } as any;

describe('DateDiff', () => {
  it('calculates 4 exact years between 2020-01-01 and 2024-01-01', () => {
    const comp = new DateDiff(fb, seo);
    comp.form.patchValue({ from: '2020-01-01', to: '2024-01-01' });
    comp.calculate();
    expect(comp.result?.years).toBe(4);
    expect(comp.result?.months).toBe(0);
    expect(comp.result?.days).toBe(0);
    expect(comp.result?.totalDays).toBe(1461); // 2020 and 2024 are leap years
  });

  it('sets swapped=true when from > to', () => {
    const comp = new DateDiff(fb, seo);
    comp.form.patchValue({ from: '2024-06-01', to: '2020-01-01' });
    comp.calculate();
    expect(comp.result?.swapped).toBe(true);
  });

  it('returns null when inputs are missing', () => {
    const comp = new DateDiff(fb, seo);
    comp.form.patchValue({ from: '', to: '' });
    comp.calculate();
    expect(comp.result).toBeNull();
  });
});

