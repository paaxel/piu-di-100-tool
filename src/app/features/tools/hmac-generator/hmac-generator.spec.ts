import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { HmacGenerator } from './hmac-generator';

const fb = new FormBuilder();
const cdr = { detectChanges: () => {} } as any;
const seo = { set: () => {} } as any;

// Known HMAC-SHA256: key="secret", message="hello"
const KNOWN_HMAC_SHA256 = '88aab3ede8d3adf94d26ab90d3bafd4a2083070c3bcce9c014ee04a443847c0b';

describe('HmacGenerator', () => {
  it('computes HMAC-SHA256 for known key and message', async () => {
    const comp = new HmacGenerator(fb, cdr, seo);
    comp.form.patchValue({ key: 'secret', message: 'hello', algo: 'SHA-256' });
    await comp.generate();
    expect(comp.output).toBe(KNOWN_HMAC_SHA256);
    expect(comp.error).toBe('');
  });

  it('does not compute and output stays empty when form is invalid', async () => {
    const comp = new HmacGenerator(fb, cdr, seo);
    // key is required — leave it empty to make form invalid
    comp.form.patchValue({ key: '', message: 'hello', algo: 'SHA-256' });
    await comp.generate();
    expect(comp.output).toBe('');
  });

  it('generates a non-empty HMAC-SHA512 output', async () => {
    const comp = new HmacGenerator(fb, cdr, seo);
    comp.form.patchValue({ key: 'mykey', message: 'mydata', algo: 'SHA-512' });
    await comp.generate();
    expect(comp.output).toHaveLength(128); // SHA-512 hex = 64 bytes = 128 hex chars
    expect(comp.error).toBe('');
  });
});
