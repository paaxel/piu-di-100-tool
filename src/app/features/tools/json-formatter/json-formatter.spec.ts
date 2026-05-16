import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { JsonFormatter } from './json-formatter';

const fb = new FormBuilder();
const seo = { set: () => {} } as any;

describe('JsonFormatter', () => {
  it('formats compact JSON to pretty-printed output', () => {
    const comp = new JsonFormatter(fb, seo);
    comp.form.patchValue({ value: '{"a":1,"b":2}', indent: 2 });
    comp.format();
    expect(comp.result).toBe('{\n  "a": 1,\n  "b": 2\n}');
    expect(comp.error).toBe('');
  });

  it('minifies pretty-printed JSON to a single line', () => {
    const comp = new JsonFormatter(fb, seo);
    comp.form.patchValue({ value: '{\n  "a": 1,\n  "b": 2\n}' });
    comp.minify();
    expect(comp.result).toBe('{"a":1,"b":2}');
  });

  it('sets an error for invalid JSON', () => {
    const comp = new JsonFormatter(fb, seo);
    comp.form.patchValue({ value: '{invalid}' });
    comp.format();
    expect(comp.error).toBeTruthy();
    expect(comp.result).toBe('');
  });
});

