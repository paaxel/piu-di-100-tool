import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';
import { bcryptHash, hash, md5 } from '../../../packages/toolkit/hash-utils';

@Component({
  selector: 'app-password-hash',
  standalone: false,
  templateUrl: './password-hash.html',
})
export class PasswordHash {
  readonly form: FormGroup;
  readonly algorithms = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512', 'bcrypt'];
  readonly bcryptRoundsOptions = [4, 6, 8, 10, 12, 14];

  result: string | null = null;
  computing = false;

  constructor(fb: FormBuilder, private cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('Generatore di Hash', 'Calcola hash MD5, SHA-1, SHA-256, SHA-384, SHA-512 e bcrypt di qualsiasi testo. Strumento online gratuito.');
    this.form = fb.group({
      value: [''],
      algorithm: ['SHA-256'],
      salt: [''],
      bcryptRounds: [10],
    });
  }

  get isBcrypt(): boolean {
    return this.form.controls['algorithm'].value === 'bcrypt';
  }

  async compute(): Promise<void> {
    const { value, algorithm, salt, bcryptRounds } = this.form.value;
    this.computing = true;
    this.result = null;
    try {
      if (algorithm === 'bcrypt') {
        this.result = await bcryptHash(value ?? '', Number(bcryptRounds) || 10);
      } else if (algorithm === 'MD5') {
        this.result = md5((salt ?? '') + (value ?? ''));
      } else {
        this.result = await hash((salt ?? '') + (value ?? ''), algorithm);
      }
    } finally {
      this.computing = false;
      this.cdr.detectChanges();
    }
  }

  copy(): void {
    if (this.result) {
      navigator.clipboard?.writeText(this.result).catch(() => undefined);
    }
  }
}
