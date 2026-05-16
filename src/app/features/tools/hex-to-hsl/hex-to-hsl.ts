import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

export interface HslColor { h: number; s: number; l: number; }
export interface RgbColor { r: number; g: number; b: number; }

function hexToRgb(hex: string): RgbColor | null {
  const m = hex.replace(/^#/, '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
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

@Component({
  selector: 'app-hex-to-hsl',
  standalone: false,
  templateUrl: './hex-to-hsl.html',
})
export class HexToHsl {
  readonly form: FormGroup;
  hsl: HslColor | null = null;
  preview = '';
  error = '';
  copied = false;

  constructor(fb: FormBuilder, private cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('HEX to HSL Converter', 'Convert a HEX color code to HSL values instantly. Free online color converter for designers and developers.');
    this.form = fb.group({ hex: ['#3b82f6'] });
    this.convert('#3b82f6');
    this.form.get('hex')!.valueChanges.subscribe((v) => this.convert(v ?? ''));
  }

  convert(hex: string): void {
    const rgb = hexToRgb(hex);
    if (!rgb) {
      this.error = hex.length > 2 ? 'HEX non valido' : '';
      this.hsl = null;
      this.preview = '';
      return;
    }
    this.error = '';
    this.hsl = rgbToHsl(rgb);
    this.preview = hex.startsWith('#') ? hex : '#' + hex;
  }

  get hslString(): string {
    if (!this.hsl) return '';
    return `hsl(${this.hsl.h}, ${this.hsl.s}%, ${this.hsl.l}%)`;
  }

  async copy(): Promise<void> {
    if (!this.hslString) return;
    await navigator.clipboard.writeText(this.hslString);
    this.copied = true;
    this.cdr.detectChanges();
    setTimeout(() => { this.copied = false; this.cdr.detectChanges(); }, 1500);
  }
}
