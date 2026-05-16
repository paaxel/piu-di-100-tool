import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { StringLength } from './string-length';

const fb = new FormBuilder();
const seo = { set: () => {} } as any;

describe('StringLength', () => {
  it('counts characters and words in a simple string', () => {
    const comp = new StringLength(fb, seo);
    comp.form.patchValue({ value: 'hello world' });
    expect(comp.stats.characters).toBe(11);
    expect(comp.stats.words).toBe(2);
  });

  it('counts lines in a multi-line string', () => {
    const comp = new StringLength(fb, seo);
    comp.form.patchValue({ value: 'line1\nline2\nline3' });
    expect(comp.stats.lines).toBe(3);
  });

  it('returns zeros for an empty string', () => {
    const comp = new StringLength(fb, seo);
    comp.form.patchValue({ value: '' });
    expect(comp.stats.characters).toBe(0);
    expect(comp.stats.words).toBe(0);
    expect(comp.stats.lines).toBe(0);
  });
});

