import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { OneLine } from './one-line';

const fb = new FormBuilder();
const seo = { set: () => {} } as any;

describe('OneLine', () => {
  it('collapses multi-line text into a single line', () => {
    const comp = new OneLine(fb, seo);
    comp.form.patchValue({ value: 'line one\nline two\nline three', removeSpaces: false });
    comp.apply();
    expect(comp.result).toBe('line one line two line three');
  });

  it('collapses multiple spaces when removeSpaces is true', () => {
    const comp = new OneLine(fb, seo);
    comp.form.patchValue({ value: 'hello   world', removeSpaces: true });
    comp.apply();
    expect(comp.result).toBe('hello world');
  });

  it('trims leading and trailing whitespace from the result', () => {
    const comp = new OneLine(fb, seo);
    comp.form.patchValue({ value: '  hello  ', removeSpaces: true });
    comp.apply();
    expect(comp.result).toBe('hello');
  });
});

