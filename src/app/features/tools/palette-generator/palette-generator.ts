import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function clamp(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function hexToRgb(hex: string): Rgb | null {
  const m = (hex ?? '').replace('#', '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function rgbToHex(c: Rgb): string {
  return `#${clamp(c.r).toString(16).padStart(2, '0')}${clamp(c.g).toString(16).padStart(2, '0')}${clamp(c.b).toString(16).padStart(2, '0')}`.toUpperCase();
}

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

function rgbToHsl(c: Rgb): { h: number; s: number; l: number } {
  const r = c.r / 255;
  const g = c.g / 255;
  const b = c.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: h / 6, s, l };
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  if (s === 0) {
    const v = clamp(l * 255);
    return { r: v, g: v, b: v };
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: clamp(hue2rgb(p, q, h + 1 / 3) * 255),
    g: clamp(hue2rgb(p, q, h) * 255),
    b: clamp(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

@Component({
  selector: 'app-palette-generator',
  standalone: false,
  templateUrl: './palette-generator.html',
})
export class PaletteGenerator {
  readonly form: FormGroup;
  palette: string[] = [];
  error = '';

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Palette Generator', 'Genera palette da un colore base con input HEX e color picker.');
    this.form = fb.group({ baseHex: ['#3B82F6'], baseColor: ['#3B82F6'] });
    this.generateFromBase();
  }

  onHexInput(): void {
    const raw = (this.form.controls['baseHex'].value ?? '').toString().trim();
    const normalized = raw.startsWith('#') ? raw.toUpperCase() : `#${raw.toUpperCase()}`;
    this.form.patchValue({ baseHex: normalized }, { emitEvent: false });
    if (/^#[0-9A-F]{6}$/.test(normalized)) {
      this.form.patchValue({ baseColor: normalized }, { emitEvent: false });
      this.generateFromBase();
    } else {
      this.error = 'HEX non valido.';
      this.palette = [];
    }
  }

  onColorPick(): void {
    const picked = (this.form.controls['baseColor'].value ?? '#3B82F6').toString().toUpperCase();
    this.form.patchValue({ baseHex: picked }, { emitEvent: false });
    this.generateFromBase();
  }

  generateFromBase(): void {
    const baseHex = (this.form.controls['baseHex'].value ?? '').toString();
    const base = hexToRgb(baseHex);
    if (!base) {
      this.error = 'HEX non valido.';
      this.palette = [];
      return;
    }

    this.error = '';
    const white: Rgb = { r: 255, g: 255, b: 255 };
    const black: Rgb = { r: 0, g: 0, b: 0 };
    const hsl = rgbToHsl(base);
    const complementary = hslToRgb((hsl.h + 0.5) % 1, hsl.s, hsl.l);
    const analogousA = hslToRgb((hsl.h + 0.08) % 1, hsl.s, hsl.l);
    const analogousB = hslToRgb((hsl.h + 0.92) % 1, hsl.s, hsl.l);

    this.palette = [
      rgbToHex(mix(base, white, 0.7)),
      rgbToHex(mix(base, white, 0.35)),
      rgbToHex(base),
      rgbToHex(mix(base, black, 0.25)),
      rgbToHex(mix(base, black, 0.5)),
      rgbToHex(complementary),
      rgbToHex(analogousA),
      rgbToHex(analogousB),
    ];
  }

  copy(hex: string): void {
    navigator.clipboard?.writeText(hex).catch(() => undefined);
  }
}
