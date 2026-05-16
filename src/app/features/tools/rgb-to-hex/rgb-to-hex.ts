import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

@Component({
  selector: 'app-rgb-to-hex',
  standalone: false,
  templateUrl: './rgb-to-hex.html',
})
export class RgbToHex {
  readonly form: FormGroup;
  hex = '';
  preview = '';
  copied = false;

  constructor(fb: FormBuilder, private cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('RGB to HEX Converter', 'Convert RGB color values to a HEX color code instantly. Free online color converter for designers and developers.');
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
    this.hex = rgbToHex(r, g, b);
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
