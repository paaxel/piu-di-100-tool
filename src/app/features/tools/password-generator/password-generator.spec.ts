import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { PasswordGenerator } from './password-generator';

const fb = new FormBuilder();
const seo = { set: () => {} } as any;

describe('PasswordGenerator', () => {
  it('generates a password of the requested length', () => {
    const comp = new PasswordGenerator(fb, seo);
    comp.form.patchValue({ length: 16, lowercase: true, uppercase: true, digits: true, symbols: false });
    comp.generate();
    expect(comp.password.length).toBe(16);
  });

  it('generates a password containing only digits when only digits are selected', () => {
    const comp = new PasswordGenerator(fb, seo);
    comp.form.patchValue({
      length: 10,
      lowercase: false,
      uppercase: false,
      digits: true,
      symbols: false,
      requireLowercase: false,
      requireUppercase: false,
      requireDigits: true,
      requireSymbols: false,
    });
    comp.generate();
    expect(comp.password).toMatch(/^\d+$/);
  });

  it('assigns a strength rating to the generated password', () => {
    const comp = new PasswordGenerator(fb, seo);
    comp.form.patchValue({ length: 20, lowercase: true, uppercase: true, digits: true, symbols: true });
    comp.generate();
    expect(['WEAK', 'FAIR', 'GOOD', 'STRONG']).toContain(comp.strength);
  });
});

