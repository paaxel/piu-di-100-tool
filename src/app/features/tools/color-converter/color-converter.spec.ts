import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { ColorConverter } from './color-converter';

const fb = new FormBuilder();
const seo = { set: () => {} } as any;

describe('ColorConverter', () => {
  it('converts #ff0000 to RGB {r:255, g:0, b:0}', () => {
    const comp = new ColorConverter(fb, seo);
    comp.fromHex('#ff0000');
    expect(comp.rgb).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('converts #ffffff to HSL {h:0, s:0, l:100}', () => {
    const comp = new ColorConverter(fb, seo);
    comp.fromHex('#ffffff');
    expect(comp.hsl).toEqual({ h: 0, s: 0, l: 100 });
  });

  it('sets an error for an invalid hex value', () => {
    const comp = new ColorConverter(fb, seo);
    comp.fromHex('#xyz');
    expect(comp.error).toBeTruthy();
  });
});

