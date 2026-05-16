import { Component } from '@angular/core';
import { SeoService } from '../../../core/services/seo';

interface BmiCategory {
  label: string;
  cssClass: string;
  badgeClass: string;
}

function getCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return { label: 'Sottopeso',  cssClass: 'text-info',    badgeClass: 'bg-info' };
  if (bmi < 25)   return { label: 'Normopeso',  cssClass: 'text-success', badgeClass: 'bg-success' };
  if (bmi < 30)   return { label: 'Sovrappeso', cssClass: 'text-warning', badgeClass: 'bg-warning' };
  return               { label: 'Obeso',        cssClass: 'text-danger',  badgeClass: 'bg-danger' };
}

@Component({
  selector: 'app-bmi-calculator',
  standalone: false,
  templateUrl: './bmi-calculator.html',
})
export class BmiCalculator {
  height = '';
  weight = '';

  constructor(seo: SeoService) {
    seo.set('Calcolatore BMI', 'Calcola il tuo indice di massa corporea (BMI) online. Scopri se sei sottopeso, normopeso o sovrappeso.');
  }

  get bmi(): number | null {
    const h = parseFloat(this.height) / 100;
    const w = parseFloat(this.weight);
    if (!h || !w || h <= 0 || w <= 0) return null;
    const v = w / (h * h);
    return isFinite(v) ? v : null;
  }

  get bmiDisplay(): string {
    return this.bmi !== null ? this.bmi.toFixed(1) : '';
  }

  get category(): BmiCategory | null {
    return this.bmi !== null ? getCategory(this.bmi) : null;
  }

  /** Position of the marker on the visual scale (10–40 range → 0–100%). */
  get markerPct(): number {
    if (this.bmi === null) return 0;
    return Math.min(100, Math.max(0, ((this.bmi - 10) / 30) * 100));
  }
}
