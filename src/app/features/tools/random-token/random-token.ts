import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

type Encoding = 'hex' | 'base64' | 'base64url' | 'alphanumeric';

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function toBase64url(bytes: Uint8Array): string {
  return toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

const ALNUM = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function toAlphanumeric(bytes: Uint8Array, length: number): string {
  const result: string[] = [];
  for (let i = 0; i < length; i++) {
    result.push(ALNUM[bytes[i] % ALNUM.length]);
  }
  return result.join('');
}

function generateToken(bytes: number, encoding: Encoding): string {
  // Request more bytes than needed for alphanumeric to have enough entropy
  const needed = encoding === 'alphanumeric' ? Math.ceil(bytes * 1.5) : bytes;
  const arr = new Uint8Array(needed);
  crypto.getRandomValues(arr);
  switch (encoding) {
    case 'hex': return toHex(arr.slice(0, bytes));
    case 'base64': return toBase64(arr.slice(0, bytes));
    case 'base64url': return toBase64url(arr.slice(0, bytes));
    case 'alphanumeric': return toAlphanumeric(arr, bytes);
  }
}

@Component({
  selector: 'app-random-token',
  standalone: false,
  templateUrl: './random-token.html',
})
export class RandomToken {
  readonly form: FormGroup;
  tokens: string[] = [];
  copied: number | null = null;

  readonly encodings: { value: Encoding; label: string }[] = [
    { value: 'hex', label: 'HEX' },
    { value: 'base64url', label: 'Base64url (URL-safe)' },
    { value: 'base64', label: 'Base64' },
    { value: 'alphanumeric', label: 'Alfanumerico' },
  ];

  constructor(fb: FormBuilder, private cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('Generatore Token / Secret', 'Genera token casuali sicuri per API key, JWT secret e password. Hex, Base64, alfanumerico.');
    this.form = fb.group({
      bytes: [32, [Validators.required, Validators.min(8), Validators.max(256)]],
      encoding: ['hex'],
      count: [5, [Validators.required, Validators.min(1), Validators.max(20)]],
    });
    this.generate();
  }

  generate(): void {
    if (this.form.invalid) return;
    const { bytes, encoding, count } = this.form.value;
    this.tokens = Array.from({ length: +count }, () => generateToken(+bytes, encoding as Encoding));
  }

  async copy(index: number): Promise<void> {
    await navigator.clipboard.writeText(this.tokens[index]);
    this.copied = index;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.copied = null;
      this.cdr.detectChanges();
    }, 1500);
  }
}
