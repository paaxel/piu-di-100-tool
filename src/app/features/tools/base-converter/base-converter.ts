import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

export interface BaseResult {
  base: number;
  label: string;
  prefix: string;
  value: string;
}

const BASES: { base: number; label: string; prefix: string }[] = [
  { base: 2, label: 'Binario', prefix: '0b' },
  { base: 8, label: 'Ottale', prefix: '0o' },
  { base: 10, label: 'Decimale', prefix: '' },
  { base: 16, label: 'Esadecimale', prefix: '0x' },
];

@Component({
  selector: 'app-base-converter',
  standalone: false,
  templateUrl: './base-converter.html',
})
export class BaseConverter {
  readonly form: FormGroup;
  readonly bases = BASES;

  results: BaseResult[] = [];
  error = '';

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Convertitore di Basi Numeriche', 'Converti numeri tra binario, ottale, decimale ed esadecimale. Strumento online gratuito.');
    this.form = fb.group({
      value: ['', Validators.required],
      fromBase: ['10'],
    });
    this.form.valueChanges.subscribe(() => this.convert());
  }

  convert(): void {
    this.error = '';
    this.results = [];

    const { value, fromBase } = this.form.value;
    const input: string = (value ?? '').trim();
    if (!input) return;

    const base = parseInt(fromBase, 10);
    const decimal = parseInt(input, base);

    if (Number.isNaN(decimal)) {
      this.error = `Valore non valido in base ${base}: "${input}"`;
      return;
    }

    this.results = BASES.map((b) => ({
      ...b,
      value: decimal.toString(b.base).toUpperCase(),
    }));
  }

  clearResult(): void {
    this.results = [];
    this.error = '';
    this.form.reset({ value: '', fromBase: '10' }, { emitEvent: false });
  }
}
