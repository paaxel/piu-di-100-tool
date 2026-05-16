import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { HtmlEncoder } from './html-encoder';

const fb = new FormBuilder();
const cdr = { detectChanges: () => {} } as any;
const seo = { set: () => {} } as any;

describe('HtmlEncoder', () => {
  it('encodes < and > as HTML entities', () => {
    const comp = new HtmlEncoder(fb, cdr, seo);
    comp.process('<div>');
    expect(comp.encoded).toBe('&lt;div&gt;');
  });

  it('encodes & and " as HTML entities', () => {
    const comp = new HtmlEncoder(fb, cdr, seo);
    comp.process('a & "b"');
    expect(comp.encoded).toBe('a &amp; &quot;b&quot;');
  });

  it('leaves plain text unchanged after encoding', () => {
    const comp = new HtmlEncoder(fb, cdr, seo);
    comp.process('hello');
    expect(comp.encoded).toBe('hello');
  });
});

