import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

// ─── Italian number-to-words engine ──────────────────────────────────────────
const ONES = ['', 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove',
  'dieci', 'undici', 'dodici', 'tredici', 'quattordici', 'quindici', 'sedici',
  'diciassette', 'diciotto', 'diciannove'];
const TENS = ['', '', 'venti', 'trenta', 'quaranta', 'cinquanta', 'sessanta', 'settanta', 'ottanta', 'novanta'];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  const t = TENS[Math.floor(n / 10)];
  const o = ONES[n % 10];
  // Elision: venti/trenta/… drop final vowel before uno/otto
  if (o === 'uno' || o === 'otto') return t.slice(0, -1) + o;
  return t + o;
}

function threeDigits(n: number): string {
  if (n === 0) return '';
  const h = Math.floor(n / 100);
  const rest = n % 100;
  let result = '';
  if (h === 1) result = 'cento';
  else if (h > 1) result = ONES[h] + 'cento';
  result += twoDigits(rest);
  return result;
}

// Groups: ones, thousands, millions, billions
const GROUPS = [
  { singular: '', plural: '' },
  { singular: 'mille', plural: 'mila' },
  { singular: 'milione', plural: 'milioni' },
  { singular: 'miliardo', plural: 'miliardi' },
];

export function numberToWords(n: number): string {
  if (!Number.isInteger(n) || n < 0 || n > 999_999_999_999) return '';
  if (n === 0) return 'zero';

  const chunks: number[] = [];
  let tmp = n;
  while (tmp > 0) { chunks.push(tmp % 1000); tmp = Math.floor(tmp / 1000); }

  const parts: string[] = [];
  for (let i = chunks.length - 1; i >= 0; i--) {
    const chunk = chunks[i];
    if (chunk === 0) continue;
    const { singular, plural } = GROUPS[i];
    if (i === 0) {
      parts.push(threeDigits(chunk));
    } else if (i === 1) {
      // thousands: "mille" for 1000, "duemila" for 2000, etc.
      parts.push(chunk === 1 ? singular : threeDigits(chunk) + plural);
    } else {
      // millions / billions: always use full digits + group label
      parts.push(threeDigits(chunk) + (chunk === 1 ? singular : plural));
    }
  }
  return parts.join('');
}

@Component({
  selector: 'app-number-words',
  standalone: false,
  templateUrl: './number-words.html',
})
export class NumberWords {
  readonly form: FormGroup;
  result = '';
  tooHigh = false;
  copied = false;

  constructor(fb: FormBuilder, private cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('Numero in Lettere (Italiano)', 'Converti numeri in parole italiane: 1234 → milleduecentotrentaquattro. Utile per documenti e contratti.');
    this.form = fb.group({ value: ['', [Validators.required, Validators.min(0)]] });
    this.form.get('value')!.valueChanges.subscribe((v) => {
      const n = parseInt(v, 10);
      if (!isNaN(n) && n > 999_999_999_999) {
        this.tooHigh = true;
        this.result = '';
      } else {
        this.tooHigh = false;
        this.result = (!isNaN(n) && n >= 0) ? numberToWords(n) : '';
      }
    });
  }

  async copy(): Promise<void> {
    if (!this.result) return;
    await navigator.clipboard.writeText(this.result);
    this.copied = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.copied = false;
      this.cdr.detectChanges();
    }, 1500);
  }
}
