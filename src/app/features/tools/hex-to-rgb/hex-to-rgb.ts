import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

export interface RgbColor { r: number; g: number; b: number; }

function hexToRgb(hex: string): RgbColor | null {
  const m = hex.replace(/^#/, '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

@Component({
  selector: 'app-hex-to-rgb',
  standalone: false,
  templateUrl: './hex-to-rgb.html',
})
export class HexToRgb {
  readonly form: FormGroup;
  rgb: RgbColor | null = null;
  preview = '';
  error = '';
  copied = false;

  constructor(fb: FormBuilder, private cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('HEX to RGB Converter', 'Convert a HEX color code to RGB values instantly. Free online color converter for designers and developers.');
    this.form = fb.group({ hex: ['#3b82f6'] });
    this.convert('#3b82f6');
    this.form.get('hex')!.valueChanges.subscribe((v) => this.convert(v ?? ''));
  }

  convert(hex: string): void {
    const rgb = hexToRgb(hex);
    if (!rgb) {
      this.error = hex.length > 2 ? 'HEX non valido' : '';
      this.rgb = null;
      this.preview = '';
      return;
    }
    this.error = '';
    this.rgb = rgb;
    this.preview = hex.startsWith('#') ? hex : '#' + hex;
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
