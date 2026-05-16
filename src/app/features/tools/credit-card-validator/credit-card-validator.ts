import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

interface ValidationResult {
  normalized: string;
  issuer: string;
  valid: boolean;
  reason: string;
}

function normalize(input: string): string {
  return (input ?? '').replace(/[^\d]/g, '');
}

function luhnCheck(number: string): boolean {
  let sum = 0;
  let doubleDigit = false;
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = Number(number[i]);
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0;
}

function detectIssuer(number: string): string {
  if (/^4\d{12}(\d{3})?(\d{3})?$/.test(number)) return 'Visa';
  if (/^(5[1-5]\d{14}|2(2[2-9]\d{12}|[3-6]\d{13}|7[01]\d{12}|720\d{12}))$/.test(number)) return 'Mastercard';
  if (/^3[47]\d{13}$/.test(number)) return 'American Express';
  if (/^6(?:011|5\d{2})\d{12}$/.test(number)) return 'Discover';
  if (/^3(?:0[0-5]|[68]\d)\d{11}$/.test(number)) return 'Diners Club';
  if (/^(?:2131|1800|35\d{3})\d{11}$/.test(number)) return 'JCB';
  if (/^(?:5[06-9]|6\d)\d{10,17}$/.test(number)) return 'Maestro';
  return 'Unknown';
}

@Component({
  selector: 'app-credit-card-validator',
  standalone: false,
  templateUrl: './credit-card-validator.html',
})
export class CreditCardValidator {
  readonly form: FormGroup;
  result: ValidationResult | null = null;

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Validatore Carta di Credito', 'Valida numeri di carte con algoritmo Luhn e rilevamento circuito. Strumento online gratuito.');
    this.form = fb.group({ number: [''] });
    this.form.valueChanges.subscribe(() => this.validate());
  }

  validate(): void {
    const raw = this.form.controls['number'].value ?? '';
    const normalized = normalize(raw);
    if (!normalized) {
      this.result = null;
      return;
    }

    if (normalized.length < 12 || normalized.length > 19) {
      this.result = {
        normalized,
        issuer: detectIssuer(normalized),
        valid: false,
        reason: 'Lunghezza non valida (12-19 cifre).',
      };
      return;
    }

    const valid = luhnCheck(normalized);
    this.result = {
      normalized,
      issuer: detectIssuer(normalized),
      valid,
      reason: valid ? 'Numero valido.' : 'Checksum Luhn non valido.',
    };
  }
}
