import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { IbanChecker } from './iban-checker';

const fb = new FormBuilder();
const seo = { set: () => {} } as any;

describe('IbanChecker', () => {
  it('validates a correct Italian IBAN', () => {
    const comp = new IbanChecker(fb, seo);
    comp.form.patchValue({ value: 'IT60X0542811101000000123456' });
    comp.check();
    expect(comp.result?.valid).toBe(true);
  });

  it('rejects an IBAN with wrong check digits', () => {
    const comp = new IbanChecker(fb, seo);
    comp.form.patchValue({ value: 'IT00X0542811101000000123456' });
    comp.check();
    expect(comp.result?.valid).toBe(false);
  });

  it('clears the result when clearResult is called', () => {
    const comp = new IbanChecker(fb, seo);
    comp.form.patchValue({ value: 'IT60X0542811101000000123456' });
    comp.check();
    comp.clearResult();
    expect(comp.result).toBeNull();
  });
});

