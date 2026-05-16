import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { CaseConverter } from './case-converter';

const fb = new FormBuilder();
const cdr = { detectChanges: () => {} } as any;
const seo = { set: () => {} } as any;

describe('CaseConverter', () => {
  it('converts to camelCase', () => {
    const comp = new CaseConverter(fb, cdr, seo);
    comp.form.patchValue({ value: 'hello world foo' });
    comp.convert();
    const camel = comp.results.find((r) => r.id === 'camel');
    expect(camel?.value).toBe('helloWorldFoo');
  });

  it('converts to snake_case', () => {
    const comp = new CaseConverter(fb, cdr, seo);
    comp.form.patchValue({ value: 'Hello World' });
    comp.convert();
    const snake = comp.results.find((r) => r.id === 'snake');
    expect(snake?.value).toBe('hello_world');
  });

  it('converts to CONSTANT_CASE', () => {
    const comp = new CaseConverter(fb, cdr, seo);
    comp.form.patchValue({ value: 'my variable name' });
    comp.convert();
    const constant = comp.results.find((r) => r.id === 'constant');
    expect(constant?.value).toBe('MY_VARIABLE_NAME');
  });
});

