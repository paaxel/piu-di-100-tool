import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

export interface RgbColor { r: number; g: number; b: number; }
export interface HslColor { h: number; s: number; l: number; }

function hexToRgb(hex: string): RgbColor | null {
  const m = hex.replace(/^#/, '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function rgbToHex({ r, g, b }: RgbColor): string {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

function rgbToHsl({ r, g, b }: RgbColor): HslColor {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
    case gn: h = (bn - rn) / d + 2; break;
    default: h = (rn - gn) / d + 4;
  }
  return { h: Math.round(h * 60), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): RgbColor {
  const sn = s / 100, ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const v = ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(v * 255);
  };
  return { r: f(0), g: f(8), b: f(4) };
}

@Component({
  selector: 'app-color-converter',
  standalone: false,
  templateUrl: './color-converter.html',
})
export class ColorConverter {
  readonly hexForm: FormGroup;
  readonly rgbForm: FormGroup;
  readonly hslForm: FormGroup;

  hex = '';
  rgb: RgbColor | null = null;
  hsl: HslColor | null = null;
  preview = '#ffffff';
  error = '';

  private updating = false;

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Convertitore Colori HEX RGB HSL', 'Converti colori tra HEX, RGB e HSL online. Strumento gratuito per designer e sviluppatori.');
    this.hexForm = fb.group({ hex: ['#3b82f6'] });
    this.rgbForm = fb.group({ r: [59, [Validators.min(0), Validators.max(255)]], g: [130, [Validators.min(0), Validators.max(255)]], b: [246, [Validators.min(0), Validators.max(255)]] });
    this.hslForm = fb.group({ h: [217, [Validators.min(0), Validators.max(360)]], s: [91, [Validators.min(0), Validators.max(100)]], l: [60, [Validators.min(0), Validators.max(100)]] });

    this.fromHex('#3b82f6');

    this.hexForm.get('hex')!.valueChanges.subscribe((v) => {
      if (this.updating) return;
      this.fromHex(v ?? '');
    });
    this.rgbForm.valueChanges.subscribe((v) => {
      if (this.updating || this.rgbForm.invalid) return;
      this.fromRgb(v.r, v.g, v.b);
    });
    this.hslForm.valueChanges.subscribe((v) => {
      if (this.updating || this.hslForm.invalid) return;
      this.fromHsl(v.h, v.s, v.l);
    });
  }

  fromHex(hex: string): void {
    const rgb = hexToRgb(hex);
    if (!rgb) { this.error = hex.length > 2 ? 'HEX non valido' : ''; return; }
    this.error = '';
    const hsl = rgbToHsl(rgb);
    this.sync(hex.startsWith('#') ? hex : '#' + hex, rgb, hsl);
  }

  fromRgb(r: number, g: number, b: number): void {
    const rgb: RgbColor = { r: +r, g: +g, b: +b };
    const hex = rgbToHex(rgb);
    const hsl = rgbToHsl(rgb);
    this.sync(hex, rgb, hsl);
  }

  fromHsl(h: number, s: number, l: number): void {
    const rgb = hslToRgb(+h, +s, +l);
    const hex = rgbToHex(rgb);
    const hsl: HslColor = { h: +h, s: +s, l: +l };
    this.sync(hex, rgb, hsl);
  }

  private sync(hex: string, rgb: RgbColor, hsl: HslColor): void {
    this.updating = true;
    this.hex = hex;
    this.rgb = rgb;
    this.hsl = hsl;
    this.preview = hex;
    this.hexForm.patchValue({ hex }, { emitEvent: false });
    this.rgbForm.patchValue(rgb, { emitEvent: false });
    this.hslForm.patchValue(hsl, { emitEvent: false });
    this.updating = false;
  }

  get rgbString(): string {
    if (!this.rgb) return '';
    return `rgb(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b})`;
  }

  get hslString(): string {
    if (!this.hsl) return '';
    return `hsl(${this.hsl.h}, ${this.hsl.s}%, ${this.hsl.l}%)`;
  }
}
