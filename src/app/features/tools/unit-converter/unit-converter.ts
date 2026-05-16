import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';
import { convertUnit, UNITS, UnitCategory } from '../../../packages/toolkit/unit-conversion-utils';

@Component({
  selector: 'app-unit-converter',
  standalone: false,
  templateUrl: './unit-converter.html',
})
export class UnitConverter {
  readonly form: FormGroup;
  readonly categories: UnitCategory[] = ['length', 'mass', 'volume', 'temperature', 'speed'];
  result = '';

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Convertitore di Unità', 'Converti unità del sistema metrico SI in unità americane — lunghezza, massa, volume, temperatura e velocità.');
    this.form = fb.group({
      category: ['length'],
      from: ['m'],
      to: ['ft'],
      value: [1],
    });
    this.form.valueChanges.subscribe(() => this.convert());
    this.convert();
  }

  unitsFor(cat: UnitCategory) {
    return UNITS[cat];
  }

  onCategoryChange(cat: UnitCategory): void {
    const list = UNITS[cat];
    this.form.patchValue({ category: cat, from: list[0].id, to: list[1]?.id ?? list[0].id });
  }

  convert(): void {
    const { category, from, to, value } = this.form.value;
    const v = parseFloat(value);
    if (Number.isNaN(v)) {
      this.result = '';
      return;
    }
    const out = convertUnit(category, from, to, v);
    this.result = Number.isNaN(out) ? '' : this.format(out);
  }

  private format(n: number): string {
    if (!Number.isFinite(n)) return '';
    if (Math.abs(n) >= 1e15 || (Math.abs(n) < 1e-4 && n !== 0)) return n.toExponential(6);
    return parseFloat(n.toFixed(6)).toString();
  }

  clearResult(): void {
    this.result = '';
  }
}
