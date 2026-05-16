import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { DiffChecker } from './diff-checker';

const fb = new FormBuilder();
const seo = { set: () => {} } as any;

describe('DiffChecker', () => {
  it('marks identical texts as all equal lines', () => {
    const comp = new DiffChecker(fb, seo);
    comp.form.patchValue({ original: 'line1\nline2', modified: 'line1\nline2' });
    comp.compare();
    expect(comp.stats.added).toBe(0);
    expect(comp.stats.removed).toBe(0);
    expect(comp.stats.equal).toBe(2);
  });

  it('detects an added line', () => {
    const comp = new DiffChecker(fb, seo);
    comp.form.patchValue({ original: 'line1', modified: 'line1\nnewline' });
    comp.compare();
    expect(comp.stats.added).toBe(1);
    expect(comp.stats.removed).toBe(0);
  });

  it('detects a removed line', () => {
    const comp = new DiffChecker(fb, seo);
    comp.form.patchValue({ original: 'line1\nline2', modified: 'line1' });
    comp.compare();
    expect(comp.stats.removed).toBe(1);
    expect(comp.stats.added).toBe(0);
  });
});

