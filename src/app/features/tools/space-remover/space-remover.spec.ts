import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { SpaceRemover } from './space-remover';

const fb = new FormBuilder();
const seo = { set: () => {} } as any;

describe('SpaceRemover', () => {
  it('collapses double spaces when onlyDouble is true', () => {
    const comp = new SpaceRemover(fb, seo);
    comp.form.patchValue({ value: 'a  b   c', onlyDouble: true });
    comp.apply();
    expect(comp.result).toBe('a b c');
  });

  it('removes all whitespace when onlyDouble is false', () => {
    const comp = new SpaceRemover(fb, seo);
    comp.form.patchValue({ value: 'a b c', onlyDouble: false });
    comp.apply();
    expect(comp.result).toBe('abc');
  });

  it('clears the result when clearResult is called', () => {
    const comp = new SpaceRemover(fb, seo);
    comp.form.patchValue({ value: 'test', onlyDouble: false });
    comp.apply();
    comp.clearResult();
    expect(comp.result).toBe('');
  });
});

