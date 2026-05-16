import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

export interface IvaResult {
  imponibile: string;
  importoIva: string;
  totale: string;
}

@Component({
  selector: 'app-iva-calculator',
  standalone: false,
  templateUrl: './iva-calculator.html',
})
export class IvaCalculator {
  readonly form: FormGroup;

  readonly ivaRates = [4, 5, 10, 22];

  result: IvaResult | null = null;

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set(
      'Calcolatore IVA',
      'Calcola il prezzo con IVA e senza IVA con aliquote italiane: 4%, 5%, 10%, 22%.',
    );
    this.form = fb.group({
      mode: ['add'],
      price: [null],
      rate: [22],
    });
    this.form.valueChanges.subscribe(() => this.calculate());
  }

  calculate(): void {
    const { mode, price, rate } = this.form.value;
    const p = parseFloat(price);
    const r = parseFloat(rate);

    if (Number.isNaN(p) || p < 0 || Number.isNaN(r)) {
      this.result = null;
      return;
    }

    const multiplier = r / 100;

    if (mode === 'add') {
      // Input is net price (imponibile), output total with IVA
      const importoIva = p * multiplier;
      const totale = p + importoIva;
      this.result = {
        imponibile: this.format(p),
        importoIva: this.format(importoIva),
        totale: this.format(totale),
      };
    } else {
      // Input is gross price (total with IVA), extract net and IVA
      const imponibile = p / (1 + multiplier);
      const importoIva = p - imponibile;
      this.result = {
        imponibile: this.format(imponibile),
        importoIva: this.format(importoIva),
        totale: this.format(p),
      };
    }
  }

  clearResult(): void {
    this.result = null;
    this.form.patchValue({ price: null }, { emitEvent: false });
  }

  private format(n: number): string {
    if (!Number.isFinite(n)) return '';
    return n.toFixed(2);
  }
}
