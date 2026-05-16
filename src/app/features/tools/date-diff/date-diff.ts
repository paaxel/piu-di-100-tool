import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

export interface DateDiffResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  totalHours: number;
  swapped: boolean;
}

function diffDates(from: Date, to: Date): DateDiffResult {
  let swapped = false;
  let start = from, end = to;
  if (from > to) { start = to; end = from; swapped = true; }

  const totalMs = end.getTime() - start.getTime();
  const totalDays = Math.floor(totalMs / 86_400_000);
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = Math.floor(totalMs / 3_600_000);

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months--;
    const prev = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prev.getDate();
  }
  if (months < 0) { years--; months += 12; }

  const totalMonths = years * 12 + months;

  return { years, months, days, totalDays, totalWeeks, totalMonths, totalHours, swapped };
}

@Component({
  selector: 'app-date-diff',
  standalone: false,
  templateUrl: './date-diff.html',
})
export class DateDiff {
  readonly form: FormGroup;
  result: DateDiffResult | null = null;
  readonly today = new Date().toISOString().split('T')[0];

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Differenza tra Date', 'Calcola la differenza esatta tra due date in giorni, settimane, mesi e anni. Strumento online gratuito.');
    this.form = fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required],
    });
    this.form.valueChanges.subscribe(() => this.calculate());
  }

  calculate(): void {
    const { from, to } = this.form.value;
    if (!from || !to) { this.result = null; return; }
    const f = new Date(from), t = new Date(to);
    if (isNaN(f.getTime()) || isNaN(t.getTime())) { this.result = null; return; }
    this.result = diffDates(f, t);
  }
}
