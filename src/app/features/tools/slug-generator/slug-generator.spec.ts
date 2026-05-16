import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { SlugGenerator } from './slug-generator';

const fb = new FormBuilder();
const cdr = { detectChanges: () => {} } as any;
const seo = { set: () => {} } as any;

describe('SlugGenerator', () => {
  it('converts a simple title to a slug', () => {
    const comp = new SlugGenerator(fb, cdr, seo);
    comp.form.patchValue({ value: 'Hello World', removeStopWords: false });
    comp.generate();
    expect(comp.slug).toBe('hello-world');
  });

  it('normalises accented characters', () => {
    const comp = new SlugGenerator(fb, cdr, seo);
    comp.form.patchValue({ value: 'Città di Roma', removeStopWords: false });
    comp.generate();
    expect(comp.slug).toBe('citta-di-roma');
  });

  it('removes Italian stop-words when the option is enabled', () => {
    const comp = new SlugGenerator(fb, cdr, seo);
    comp.form.patchValue({ value: 'la città di Roma', removeStopWords: true });
    comp.generate();
    // "la" and "di" are stop-words
    expect(comp.slug).not.toContain('-la-');
    expect(comp.slug).not.toContain('-di-');
    expect(comp.slug).toContain('citta');
  });
});

