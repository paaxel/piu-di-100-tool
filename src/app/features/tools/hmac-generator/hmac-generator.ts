import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

type HmacAlgo = 'SHA-256' | 'SHA-512' | 'SHA-1';

async function computeHmac(algo: HmacAlgo, key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: algo },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

@Component({
  selector: 'app-hmac-generator',
  standalone: false,
  templateUrl: './hmac-generator.html',
})
export class HmacGenerator {
  readonly form: FormGroup;
  output = '';
  copied = false;
  error = '';
  loading = false;

  readonly algorithms: HmacAlgo[] = ['SHA-256', 'SHA-512', 'SHA-1'];

  constructor(fb: FormBuilder, private cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('Generatore HMAC', 'Genera firme HMAC SHA-256 e SHA-512 con chiave segreta. Strumento per sviluppatori API online.');
    this.form = fb.group({
      message: ['', Validators.required],
      key: ['', Validators.required],
      algo: ['SHA-256'],
    });
  }

  async generate(): Promise<void> {
    if (this.form.invalid) return;
    this.error = '';
    this.loading = true;
    try {
      const { message, key, algo } = this.form.value;
      this.output = await computeHmac(algo as HmacAlgo, key, message);
    } catch (e) {
      this.error = 'Errore durante il calcolo HMAC.';
      this.output = '';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async copy(): Promise<void> {
    if (!this.output) return;
    await navigator.clipboard.writeText(this.output);
    this.copied = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.copied = false;
      this.cdr.detectChanges();
    }, 1500);
  }

  clear(): void {
    this.output = '';
    this.form.patchValue({ message: '', key: '' });
  }
}
