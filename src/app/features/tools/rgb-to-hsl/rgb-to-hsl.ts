import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

export interface HslColor { h: number; s: number; l: number; }

function rgbToHsl(r: number, g: number, b: number): HslColor {
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
  selector: 'app-rgb-to-hsl',
  standalone: false,
  templateUrl: './rgb-to-hsl.html',
})
export class RgbToHsl {
  readonly form: FormGroup;
  hsl: HslColor | null = null;
  preview = '';
  copied = false;

  constructor(fb: FormBuilder, private cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('RGB to HSL Converter', 'Convert RGB color values to HSL instantly. Free online color converter for designers and developers.');
    this.form = fb.group({
      r: [59, [Validators.required, Validators.min(0), Validators.max(255)]],
      g: [130, [Validators.required, Validators.min(0), Validators.max(255)]],
      b: [246, [Validators.required, Validators.min(0), Validators.max(255)]],
    });
    this.convert(59, 130, 246);
    this.form.valueChanges.subscribe((v) => {
      if (this.form.valid) this.convert(+v.r, +v.g, +v.b);
    });
  }

  convert(r: number, g: number, b: number): void {
    this.hsl = rgbToHsl(r, g, b);
    this.preview = `rgb(${r}, ${g}, ${b})`;
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
