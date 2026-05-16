import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

interface RgbColor { r: number; g: number; b: number; }

function hslToRgb(h: number, s: number, l: number): RgbColor {
  const sn = s / 100, ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round((ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)) * 255);
  };
  return { r: f(0), g: f(8), b: f(4) };
}

function rgbToHex({ r, g, b }: RgbColor): string {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

@Component({
  selector: 'app-hsl-to-hex',
  standalone: false,
  templateUrl: './hsl-to-hex.html',
})
export class HslToHex {
  readonly form: FormGroup;
  hex = '';
  preview = '';
  copied = false;

  constructor(fb: FormBuilder, private cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('HSL to HEX Converter', 'Convert HSL color values to a HEX color code instantly. Free online color converter for designers and developers.');
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
    const rgb = hslToRgb(h, s, l);
    this.hex = rgbToHex(rgb);
    this.preview = this.hex;
  }

  async copy(): Promise<void> {
    if (!this.hex) return;
    await navigator.clipboard.writeText(this.hex);
    this.copied = true;
    this.cdr.detectChanges();
    setTimeout(() => { this.copied = false; this.cdr.detectChanges(); }, 1500);
  }
}
