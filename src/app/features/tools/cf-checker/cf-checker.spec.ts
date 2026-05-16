import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { CfChecker } from './cf-checker';

const fb = new FormBuilder();
const seo = { set: () => {} } as any;

describe('CfChecker', () => {
  it('marks a valid codice fiscale as valid', () => {
    const comp = new CfChecker(fb, seo);
    comp.form.patchValue({ value: 'RSSMRA80A01H501U' });
    comp.check();
    expect(comp.result?.valid).toBe(true);
  });

  it('rejects an invalid checksum character', () => {
    const comp = new CfChecker(fb, seo);
    comp.form.patchValue({ value: 'RSSMRA80A01H501Z' }); // Wrong last char
    comp.check();
    expect(comp.result?.valid).toBe(false);
    expect(comp.result?.reason).toBe('CHECKSUM');
  });

  it('clears the result when clearResult is called', () => {
    const comp = new CfChecker(fb, seo);
    comp.form.patchValue({ value: 'RSSMRA80A01H501U' });
    comp.check();
    comp.clearResult();
    expect(comp.result).toBeNull();
  });
});

