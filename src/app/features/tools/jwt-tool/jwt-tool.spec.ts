import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { JwtTool } from './jwt-tool';

const fb = new FormBuilder();
const cdr = { detectChanges: () => {} } as any;
const seo = { set: () => {} } as any;

// A known HS256 JWT: header={"alg":"HS256","typ":"JWT"}, payload={"sub":"1234567890","name":"John Doe","iat":1516239022}
const VALID_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

describe('JwtTool', () => {
  it('decodes a valid JWT and sets header, payload, signature', () => {
    const comp = new JwtTool(fb, cdr, seo);
    comp.form.patchValue({ token: VALID_JWT });
    comp.decode();
    const header = JSON.parse(comp.header);
    const payload = JSON.parse(comp.payload);
    expect(header.alg).toBe('HS256');
    expect(payload.sub).toBe('1234567890');
    expect(comp.signature).toBeTruthy();
  });

  it('sets error for an invalid JWT token', () => {
    const comp = new JwtTool(fb, cdr, seo);
    comp.form.patchValue({ token: 'not.a.jwt' });
    comp.decode();
    expect(comp.error).toBeTruthy();
  });

  it('detects the algorithm and isSymmetric flag from the header', () => {
    const comp = new JwtTool(fb, cdr, seo);
    comp.form.patchValue({ token: VALID_JWT });
    comp.decode();
    expect(comp.detectedAlg).toBe('HS256');
    expect(comp.isSymmetric).toBe(true);
  });
});

