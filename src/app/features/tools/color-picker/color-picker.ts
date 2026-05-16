import { ChangeDetectorRef, Component } from '@angular/core';
import { SeoService } from '../../../core/services/seo';

interface RgbColor { r: number; g: number; b: number; }
interface HslColor { h: number; s: number; l: number; }

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
    default:  h = (rn - gn) / d + 4;
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

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(v)));
}

@Component({
  selector: 'app-color-picker',
  standalone: false,
  templateUrl: './color-picker.html',
  styleUrl: './color-picker.scss',
})
export class ColorPicker {
  hex = '#3b82f6';
  r = 59;  g = 130; b = 246;
  h = 217; s = 91;  l = 60;
  copiedKey: string | null = null;

  constructor(private readonly cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('Color Picker', 'Scegli un colore visivamente e ottieni i valori HEX, RGB e HSL. Strumento online gratuito.');
  }

  setFromPicker(value: string): void {
    this.hex = value;
    this.syncFromHex();
  }

  setFromHex(value: string): void {
    const normalized = (value.startsWith('#') ? value : '#' + value).toLowerCase();
    if (!/^#[0-9a-f]{6}$/.test(normalized)) return;
    this.hex = normalized;
    this.syncFromHex();
  }

  setR(v: number): void { this.r = clamp(v, 0, 255); this.syncFromRgb(); }
  setG(v: number): void { this.g = clamp(v, 0, 255); this.syncFromRgb(); }
  setB(v: number): void { this.b = clamp(v, 0, 255); this.syncFromRgb(); }

  setH(v: number): void { this.h = clamp(v, 0, 360); this.syncFromHsl(); }
  setS(v: number): void { this.s = clamp(v, 0, 100); this.syncFromHsl(); }
  setL(v: number): void { this.l = clamp(v, 0, 100); this.syncFromHsl(); }

  async copy(value: string, key: string): Promise<void> {
    await navigator.clipboard.writeText(value);
    this.copiedKey = key;
    this.cdr.detectChanges();
    setTimeout(() => { this.copiedKey = null; this.cdr.detectChanges(); }, 1500);
  }

  get hexUpper(): string { return this.hex.toUpperCase(); }
  get rgbStr(): string   { return `rgb(${this.r}, ${this.g}, ${this.b})`; }
  get hslStr(): string   { return `hsl(${this.h}, ${this.s}%, ${this.l}%)`; }

  private syncFromHex(): void {
    const rgb = hexToRgb(this.hex);
    if (!rgb) return;
    this.r = rgb.r; this.g = rgb.g; this.b = rgb.b;
    const hsl = rgbToHsl(rgb);
    this.h = hsl.h; this.s = hsl.s; this.l = hsl.l;
  }

  private syncFromRgb(): void {
    const rgb = { r: this.r, g: this.g, b: this.b };
    this.hex = rgbToHex(rgb);
    const hsl = rgbToHsl(rgb);
    this.h = hsl.h; this.s = hsl.s; this.l = hsl.l;
  }

  private syncFromHsl(): void {
    const rgb = hslToRgb(this.h, this.s, this.l);
    this.r = rgb.r; this.g = rgb.g; this.b = rgb.b;
    this.hex = rgbToHex(rgb);
  }
}
