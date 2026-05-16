import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { WordCounter } from './word-counter';

const fb = new FormBuilder();
const seo = { set: () => {} } as any;

describe('WordCounter', () => {
  it('counts words and characters in a simple string', () => {
    const comp = new WordCounter(fb, seo);
    comp.form.patchValue({ value: 'Hello world' });
    comp.count();
    expect(comp.stats?.words).toBe(2);
    expect(comp.stats?.chars).toBe(11);
  });

  it('counts lines correctly in multi-line text', () => {
    const comp = new WordCounter(fb, seo);
    comp.form.patchValue({ value: 'line one\nline two\nline three' });
    comp.count();
    expect(comp.stats?.lines).toBe(3);
  });

  it('returns zero counts for empty input', () => {
    const comp = new WordCounter(fb, seo);
    comp.form.patchValue({ value: '' });
    comp.count();
    expect(comp.stats?.words).toBe(0);
    expect(comp.stats?.chars).toBe(0);
    expect(comp.stats?.lines).toBe(0);
  });
});

