import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { PasswordHash } from './password-hash';

const fb = new FormBuilder();
const cdr = { detectChanges: () => {} } as any;
const seo = { set: () => {} } as any;

describe('PasswordHash', () => {
  it('computes SHA-256 of "hello" to the known hex digest', async () => {
    const comp = new PasswordHash(fb, cdr, seo);
    comp.form.patchValue({ value: 'hello', algorithm: 'SHA-256', salt: '' });
    await comp.compute();
    expect(comp.result).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  });

  it('computes MD5 of empty string to the known digest', async () => {
    const comp = new PasswordHash(fb, cdr, seo);
    comp.form.patchValue({ value: '', algorithm: 'MD5', salt: '' });
    await comp.compute();
    expect(comp.result).toBe('d41d8cd98f00b204e9800998ecf8427e');
  });

  it('isBcrypt getter returns true when algorithm is bcrypt', () => {
    const comp = new PasswordHash(fb, cdr, seo);
    comp.form.patchValue({ algorithm: 'bcrypt' });
    expect(comp.isBcrypt).toBe(true);
  });
});
