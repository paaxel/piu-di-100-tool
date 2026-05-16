import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

export interface DiscountResult {
  importoSconto: string;
  prezzoScontato: string;
}

@Component({
  selector: 'app-discount-calculator',
  standalone: false,
  templateUrl: './discount-calculator.html',
})
export class DiscountCalculator {
  readonly form: FormGroup;
  result: DiscountResult | null = null;

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set(
      'Calcolatore Sconto',
      'Calcola il prezzo scontato a partire dal prezzo originale e dalla percentuale di sconto.',
    );
    this.form = fb.group({
      price: [null],
      discount: [null],
    });
    this.form.valueChanges.subscribe(() => this.calculate());
  }

  calculate(): void {
    const { price, discount } = this.form.value;
    const p = parseFloat(price);
    const d = parseFloat(discount);

    if (Number.isNaN(p) || Number.isNaN(d) || p < 0 || d < 0 || d > 100) {
      this.result = null;
      return;
    }

    const importoSconto = p * (d / 100);
    const prezzoScontato = p - importoSconto;

    this.result = {
      importoSconto: this.format(importoSconto),
      prezzoScontato: this.format(prezzoScontato),
    };
  }

  clearResult(): void {
    this.result = null;
    this.form.reset();
  }

  private format(n: number): string {
    return n.toFixed(2);
  }
}
