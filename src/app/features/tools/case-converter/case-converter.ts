import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';
import { CaseType, CaseDefinition, CASES, convertCase } from '../../../packages/toolkit/case-utils';

export type { CaseType };

export interface CaseResult {
  id: CaseType;
  label: string;
  value: string;
}

@Component({
  selector: 'app-case-converter',
  standalone: false,
  templateUrl: './case-converter.html',
})
export class CaseConverter {
  readonly form: FormGroup;
  readonly cases: CaseDefinition[] = CASES;
  results: CaseResult[] = [];
  copied: string | null = null;

  constructor(fb: FormBuilder, private cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('Convertitore di Maiuscole/Minuscole', 'Converti testo in camelCase, PascalCase, snake_case, kebab-case, UPPER e molto altro. Strumento online gratuito.');
    this.form = fb.group({ value: [''], selectedCase: ['all'] });
    this.form.valueChanges.subscribe(() => this.convert());
  }

  get filteredResults(): CaseResult[] {
    const sel: string = this.form.value.selectedCase ?? 'all';
    return sel === 'all' ? this.results : this.results.filter((r) => r.id === sel);
  }

  get converterExample(): string {
    const sel: string = this.form.value.selectedCase ?? 'all';
    if (sel !== 'all') {
      return `«${convertCase('Hello World', sel as CaseType)}»`;
    }
    return CASES.slice(0, 3)
      .map((c) => `${c.label}: «${convertCase('Hello World', c.id)}»`)
      .join(' · ') + ' …';
  }

  convert(): void {
    const input: string = this.form.value.value ?? '';
    if (!input.trim()) {
      this.results = [];
      return;
    }
    this.results = CASES.map((c) => ({
      id: c.id,
      label: c.label,
      value: convertCase(input, c.id),
    }));
  }

  async copy(value: string): Promise<void> {
    await navigator.clipboard.writeText(value);
    this.copied = value;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.copied = null;
      this.cdr.detectChanges();
    }, 1500);
  }

  clearResult(): void {
    this.results = [];
    this.form.patchValue({ value: '' }, { emitEvent: false });
  }
}
