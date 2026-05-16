import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import QRCode from 'qrcode';
import { SeoService } from '../../../core/services/seo';

@Component({
  selector: 'app-qr-generator',
  standalone: false,
  templateUrl: './qr-generator.html',
})
export class QrGenerator {
  readonly form: FormGroup;
  dataUrl = '';
  error = '';
  copied = false;

  constructor(fb: FormBuilder, private cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('Generatore QR Code', 'Genera QR Code personalizzati da testo o URL direttamente nel browser.');
    this.form = fb.group({
      value: ['https://example.com'],
      size: [320],
      margin: [2],
      level: ['M'],
    });
    this.generate();
  }

  async generate(): Promise<void> {
    this.error = '';
    const value = this.form.controls['value'].value ?? '';
    if (!value.trim()) {
      this.dataUrl = '';
      return;
    }

    try {
      this.dataUrl = await QRCode.toDataURL(value, {
        width: Math.max(128, Math.min(1024, Number(this.form.controls['size'].value) || 320)),
        margin: Math.max(0, Math.min(10, Number(this.form.controls['margin'].value) || 2)),
        errorCorrectionLevel: this.form.controls['level'].value,
      });
    } catch (e) {
      this.error = (e as Error).message || 'Errore durante la generazione.';
      this.dataUrl = '';
    }
  }

  download(): void {
    if (!this.dataUrl) return;
    const a = document.createElement('a');
    a.href = this.dataUrl;
    a.download = 'qrcode.png';
    a.click();
  }

  async copy(): Promise<void> {
    const value = this.form.controls['value'].value ?? '';
    if (!value) return;
    await navigator.clipboard.writeText(value);
    this.copied = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.copied = false;
      this.cdr.detectChanges();
    }, 1200);
  }
}
