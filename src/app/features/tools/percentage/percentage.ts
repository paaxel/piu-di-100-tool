import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

type PercentMode = 'percent-of' | 'percent-of-total' | 'percent-change';

@Component({
  selector: 'app-percentage',
  standalone: false,
  templateUrl: './percentage.html',
})
export class PercentageCalculator {
  readonly form: FormGroup;
  result = '';

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set(
      'Calcolatore di Percentuale',
      'Calcola percentuali, rapporti e variazioni percentuali online. Veloce e gratuito.',
    );
    this.form = fb.group({
      mode: ['percent-of'],
      a: [null],
      b: [null],
    });
    this.form.valueChanges.subscribe(() => this.calculate());
  }

  calculate(): void {
    const { mode, a, b } = this.form.value;
    const va = parseFloat(a);
    const vb = parseFloat(b);

    if (Number.isNaN(va) || Number.isNaN(vb)) {
      this.result = '';
      return;
    }

    switch (mode as PercentMode) {
      case 'percent-of':
        this.result = this.format((va * vb) / 100);
        break;
      case 'percent-of-total':
        if (vb === 0) {
          this.result = '';
          return;
        }
        this.result = this.format((va / vb) * 100) + ' %';
        break;
      case 'percent-change':
        if (va === 0) {
          this.result = '';
          return;
        }
        this.result = this.format(((vb - va) / va) * 100) + ' %';
        break;
    }
  }

  clearResult(): void {
    this.result = '';
  }

  private format(n: number): string {
    if (!Number.isFinite(n)) return '';
    return parseFloat(n.toFixed(6)).toString();
  }
}
