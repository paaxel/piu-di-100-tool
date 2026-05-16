import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import JsBarcode from 'jsbarcode';
import { SeoService } from '../../../core/services/seo';

@Component({
  selector: 'app-barcode-generator',
  standalone: false,
  templateUrl: './barcode-generator.html',
})
export class BarcodeGenerator implements AfterViewInit {
  @ViewChild('barcodeCanvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  readonly form: FormGroup;
  error = '';

  readonly formats = ['CODE128', 'EAN13', 'EAN8', 'UPC', 'ITF14', 'MSI', 'pharmacode'] as const;

  private readonly maxLengthByFormat: Record<string, number> = {
    CODE128: 80,
    EAN13: 13,
    EAN8: 8,
    UPC: 12,
    ITF14: 14,
    MSI: 18,
    pharmacode: 6,
  };

  private computeGtinCheckDigit(body: string): number {
    const sum = body
      .split('')
      .map((d) => Number(d))
      .reduce((acc, digit, index) => acc + digit * (index % 2 === 0 ? 3 : 1), 0);
    return (10 - (sum % 10)) % 10;
  }

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set(
      'Generatore Barcode',
      'Generatore barcode 1D online: crea codici CODE128, EAN13, EAN8, UPC, ITF14, MSI e Pharmacode direttamente nel browser con anteprima e download PNG.',
    );
    this.form = fb.group({
      value: ['123456789012'],
      format: ['CODE128'],
      width: [2],
      height: [90],
      displayValue: [true],
    });
  }

  ngAfterViewInit(): void {
    this.generate();
  }

  get currentFormat(): string {
    return (this.form.controls['format'].value ?? 'EAN13').toString();
  }

  get maxValueLength(): number {
    return this.maxLengthByFormat[this.currentFormat] ?? 80;
  }

  onFormatChange(): void {
    this.error = '';
    this.enforceInputLimit();
  }

  onValueInput(): void {
    this.error = '';
    this.enforceInputLimit();
  }

  get formatHint(): string {
    switch (this.currentFormat) {
      case 'EAN13': return 'EAN13 richiede 13 cifre numeriche.';
      case 'EAN8': return 'EAN8 richiede 8 cifre numeriche.';
      case 'UPC': return 'UPC richiede 12 cifre numeriche.';
      case 'ITF14': return 'ITF14 richiede 14 cifre numeriche.';
      case 'MSI': return 'MSI accetta solo cifre (max 18).';
      case 'pharmacode': return 'Pharmacode accetta solo cifre (3-6).';
      default: return 'CODE128 accetta testo e numeri (max 80 caratteri).';
    }
  }

  generate(): void {
    this.error = '';
    if (!this.canvasRef) return;

    const canvas = this.canvasRef.nativeElement;
    const value = (this.form.controls['value'].value ?? '').toString().trim();
    const format = this.currentFormat;

    if (!value) {
      this.error = 'Inserisci un valore da codificare.';
      return;
    }

    const validationError = this.validateValue(value, format);
    if (validationError) {
      this.error = validationError;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    try {
      JsBarcode(canvas, value, {
        format,
        width: Math.max(1, Math.min(5, Number(this.form.controls['width'].value) || 2)),
        height: Math.max(40, Math.min(180, Number(this.form.controls['height'].value) || 90)),
        displayValue: !!this.form.controls['displayValue'].value,
        margin: 12,
      });
    } catch (e) {
      const reason = (e as Error).message || '';
      this.error = `Impossibile generare il barcode. Verifica che il valore sia compatibile con ${format}. ${this.formatHint}${reason ? ` (${reason})` : ''}`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  private enforceInputLimit(): void {
    const current = (this.form.controls['value'].value ?? '').toString();
    const maxLen = this.maxValueLength;
    if (current.length > maxLen) {
      this.form.controls['value'].setValue(current.slice(0, maxLen), { emitEvent: false });
    }
  }

  private validateValue(value: string, format: string): string {
    if (value.length > this.maxValueLength) {
      return `Il formato ${format} accetta massimo ${this.maxValueLength} caratteri.`;
    }

    const digitsOnlyFormats = new Set(['EAN13', 'EAN8', 'UPC', 'ITF14', 'MSI', 'pharmacode']);
    if (digitsOnlyFormats.has(format) && !/^\d+$/.test(value)) {
      return `Il formato ${format} accetta solo cifre numeriche.`;
    }

    if (format === 'EAN13' && value.length !== 13) return 'EAN13 richiede esattamente 13 cifre.';
    if (format === 'EAN8' && value.length !== 8) return 'EAN8 richiede esattamente 8 cifre.';
    if (format === 'UPC' && value.length !== 12) return 'UPC richiede esattamente 12 cifre.';
    if (format === 'ITF14') {
      if (value.length !== 14) return 'ITF14 richiede esattamente 14 cifre.';
      const body = value.slice(0, 13);
      const providedCheck = Number(value[13]);
      const expectedCheck = this.computeGtinCheckDigit(body);
      if (providedCheck !== expectedCheck) {
        return `ITF14 non valido: checksum errato. Cifra di controllo attesa: ${expectedCheck}.`;
      }
    }
    if (format === 'pharmacode' && (value.length < 3 || value.length > 6)) return 'Pharmacode richiede da 3 a 6 cifre.';

    return '';
  }

  download(): void {
    if (!this.canvasRef) return;
    const a = document.createElement('a');
    a.href = this.canvasRef.nativeElement.toDataURL('image/png');
    a.download = 'barcode.png';
    a.click();
  }
}
