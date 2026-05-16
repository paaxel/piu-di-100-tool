import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';
import { estimateStrength, generatePassword, PasswordStrength } from '../../../packages/toolkit/password-utils';

@Component({
  selector: 'app-password-generator',
  standalone: false,
  templateUrl: './password-generator.html',
  styleUrl: './password-generator.scss',
})
export class PasswordGenerator implements OnInit {
  readonly form: FormGroup;
  password = '';
  strength: PasswordStrength = 'WEAK';

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Generatore di Password', 'Genera password sicure con un generatore casuale crittograficamente sicuro. Strumento online gratuito.');
    this.form = fb.group({
      length: [20],
      lowercase: [true],
      uppercase: [true],
      digits: [true],
      symbols: [true],
      excludeAmbiguous: [false],
      requireLowercase: [true],
      requireUppercase: [true],
      requireDigits: [true],
      requireSymbols: [true],
    });
  }

  ngOnInit(): void {
    this.generate();
  }

  generate(): void {
    this.normalizeLength();
    this.password = generatePassword(this.form.value);
    this.strength = estimateStrength(this.password);
  }

  onLengthSliderInput(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const length = Number(input?.value ?? 20);
    this.form.get('length')?.setValue(length, { emitEvent: false });
    this.generate();
  }

  onCharsetChange(): void {
    this.form.get('requireLowercase')?.setValue(!!this.form.get('lowercase')?.value, { emitEvent: false });
    this.form.get('requireUppercase')?.setValue(!!this.form.get('uppercase')?.value, { emitEvent: false });
    this.form.get('requireDigits')?.setValue(!!this.form.get('digits')?.value, { emitEvent: false });
    this.form.get('requireSymbols')?.setValue(!!this.form.get('symbols')?.value, { emitEvent: false });

    this.generate();
  }

  private normalizeLength(): void {
    const control = this.form.get('length');
    if (!control) {
      return;
    }

    const rawLength = Number(control.value);
    const safeLength = Number.isFinite(rawLength) ? Math.round(rawLength) : 20;
    const normalized = Math.min(128, Math.max(4, this.requiredCharsCount, safeLength));

    if (control.value !== normalized) {
      control.setValue(normalized, { emitEvent: false });
    }
  }

  private get requiredCharsCount(): number {
    let count = 0;
    if (this.form.get('requireLowercase')?.value) count += 1;
    if (this.form.get('requireUppercase')?.value) count += 1;
    if (this.form.get('requireDigits')?.value) count += 1;
    if (this.form.get('requireSymbols')?.value) count += 1;
    return count;
  }

  copy(): void {
    navigator.clipboard?.writeText(this.password).catch(() => undefined);
  }

  get strengthClass(): string {
    return 'strength-' + this.strength.toLowerCase();
  }
}
