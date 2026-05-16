import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { RandomToken } from './random-token';

const fb = new FormBuilder();
const cdr = { detectChanges: () => {} } as any;
const seo = { set: () => {} } as any;

describe('RandomToken', () => {
  it('generates hex tokens with correct character count (32 bytes → 64 hex chars)', () => {
    const comp = new RandomToken(fb, cdr, seo);
    comp.form.patchValue({ bytes: 32, encoding: 'hex', count: 1 });
    comp.generate();
    expect(comp.tokens).toHaveLength(1);
    expect(comp.tokens[0]).toMatch(/^[0-9a-f]{64}$/);
  });

  it('generates the requested number of tokens', () => {
    const comp = new RandomToken(fb, cdr, seo);
    comp.form.patchValue({ bytes: 16, encoding: 'hex', count: 5 });
    comp.generate();
    expect(comp.tokens).toHaveLength(5);
  });

  it('generates base64url tokens without + / or = characters', () => {
    const comp = new RandomToken(fb, cdr, seo);
    comp.form.patchValue({ bytes: 32, encoding: 'base64url', count: 3 });
    comp.generate();
    for (const token of comp.tokens) {
      expect(token).not.toContain('+');
      expect(token).not.toContain('/');
      expect(token).not.toContain('=');
    }
  });
});

