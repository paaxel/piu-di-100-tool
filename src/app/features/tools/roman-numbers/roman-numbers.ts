import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

const ROMAN_TABLE: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100, 'C'],  [90, 'XC'],  [50, 'L'],  [40, 'XL'],
  [10, 'X'],   [9, 'IX'],   [5, 'V'],   [4, 'IV'], [1, 'I'],
];

function toRoman(n: number): string {
  if (n < 1 || n > 3999) return '';
  let result = '';
  for (const [val, sym] of ROMAN_TABLE) {
    while (n >= val) { result += sym; n -= val; }
  }
  return result;
}

function fromRoman(s: string): number {
  const upper = s.toUpperCase().trim();
  if (!upper) return NaN;
  const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i < upper.length; i++) {
    const curr = map[upper[i]];
    const next = map[upper[i + 1]];
    if (curr === undefined) return NaN;
    if (next && curr < next) { total += next - curr; i++; }
    else total += curr;
  }
  // Validate by re-encoding
  return toRoman(total) === upper ? total : NaN;
}

@Component({
  selector: 'app-roman-numbers',
  standalone: false,
  templateUrl: './roman-numbers.html',
})
export class RomanNumbers {
  readonly toRomanForm: FormGroup;
  readonly fromRomanForm: FormGroup;

  romanResult = '';
  arabicResult = '';
  arabicError = '';
  toRomanError = '';

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Convertitore Numeri Romani', 'Converti numeri arabi in numeri romani e viceversa. Strumento online gratuito.');
    this.toRomanForm = fb.group({ arabic: ['', [Validators.required, Validators.min(1), Validators.max(3999)]] });
    this.fromRomanForm = fb.group({ roman: ['', Validators.required] });

    this.toRomanForm.get('arabic')!.valueChanges.subscribe((v) => {
      const n = parseInt(v, 10);
      if (!v && v !== 0) { this.romanResult = ''; this.toRomanError = ''; return; }
      if (isNaN(n) || n < 1 || n > 3999) {
        this.romanResult = '';
        this.toRomanError = n > 3999 ? 'TOO_LARGE' : '';
      } else {
        this.romanResult = toRoman(n);
        this.toRomanError = '';
      }
    });

    this.fromRomanForm.get('roman')!.valueChanges.subscribe((v: string) => {
      if (!v?.trim()) { this.arabicResult = ''; this.arabicError = ''; return; }
      const n = fromRoman(v);
      if (isNaN(n)) { this.arabicResult = ''; this.arabicError = 'INVALID'; }
      else { this.arabicResult = n.toString(); this.arabicError = ''; }
    });
  }
}
