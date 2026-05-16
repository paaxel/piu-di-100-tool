import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { UrlCodec } from './url-codec';

const fb = new FormBuilder();
const seo = { set: () => {} } as any;

describe('UrlCodec', () => {
  it('encodes a string with spaces and special chars', () => {
    const comp = new UrlCodec(fb, seo);
    comp.form.patchValue({ value: 'hello world & more' });
    comp.encode();
    expect(comp.result).toBe('hello%20world%20%26%20more');
    expect(comp.error).toBe('');
  });

  it('decodes a percent-encoded string back to plain text', () => {
    const comp = new UrlCodec(fb, seo);
    comp.form.patchValue({ value: 'hello%20world%20%26%20more' });
    comp.decode();
    expect(comp.result).toBe('hello world & more');
  });

  it('sets error when decoding a malformed percent-encoded string', () => {
    const comp = new UrlCodec(fb, seo);
    comp.form.patchValue({ value: '%zz' });
    comp.decode();
    expect(comp.error).toBeTruthy();
    expect(comp.result).toBe('');
  });
});

