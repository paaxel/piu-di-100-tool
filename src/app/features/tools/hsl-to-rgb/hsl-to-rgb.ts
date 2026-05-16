import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

export interface RgbColor { r: number; g: number; b: number; }

function hslToRgb(h: number, s: number, l: number): RgbColor {
  const sn = s / 100, ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round((ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)) * 255);
  };
  return { r: f(0), g: f(8), b: f(4) };
}

@Component({
  selector: 'app-hsl-to-rgb',
  standalone: false,
  templateUrl: './hsl-to-rgb.html',
})
export class HslToRgb {
  readonly form: FormGroup;
  rgb: RgbColor | null = null;
  preview = '';
  copied = false;

  constructor(fb: FormBuilder, private cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('HSL to RGB Converter', 'Convert HSL color values to RGB instantly. Free online color converter for designers and developers.');
    this.form = fb.group({
      h: [217, [Validators.required, Validators.min(0), Validators.max(360)]],
      s: [91, [Validators.required, Validators.min(0), Validators.max(100)]],
      l: [60, [Validators.required, Validators.min(0), Validators.max(100)]],
    });
    this.convert(217, 91, 60);
    this.form.valueChanges.subscribe((v) => {
      if (this.form.valid) this.convert(+v.h, +v.s, +v.l);
    });
  }

  convert(h: number, s: number, l: number): void {
    this.rgb = hslToRgb(h, s, l);
    this.preview = `hsl(${h}, ${s}%, ${l}%)`;
  }

  get rgbString(): string {
    if (!this.rgb) return '';
    return `rgb(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b})`;
  }

  async copy(): Promise<void> {
    if (!this.rgbString) return;
    await navigator.clipboard.writeText(this.rgbString);
    this.copied = true;
    this.cdr.detectChanges();
    setTimeout(() => { this.copied = false; this.cdr.detectChanges(); }, 1500);
  }
}
