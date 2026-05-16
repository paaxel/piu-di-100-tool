import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalMonths: number;
  totalWeeks: number;
  nextBirthdayDays: number;
  isToday: boolean;
}

function calcAge(birthDate: Date, today: Date): AgeResult {
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const totalDays = Math.floor((today.getTime() - birthDate.getTime()) / 86_400_000);
  const totalMonths = years * 12 + months;
  const totalWeeks = Math.floor(totalDays / 7);

  // Next birthday
  const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  if (nextBirthday <= today) nextBirthday.setFullYear(today.getFullYear() + 1);
  const nextBirthdayDays = Math.ceil((nextBirthday.getTime() - today.getTime()) / 86_400_000);
  const isToday = birthDate.getMonth() === today.getMonth() && birthDate.getDate() === today.getDate();

  return { years, months, days, totalDays, totalMonths, totalWeeks, nextBirthdayDays, isToday };
}

@Component({
  selector: 'app-age-calculator',
  standalone: false,
  templateUrl: './age-calculator.html',
})
export class AgeCalculator {
  readonly form: FormGroup;
  result: AgeResult | null = null;
  readonly today = new Date().toISOString().split('T')[0];

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Calcolatore di Età', 'Calcola l\'età esatta in anni, mesi e giorni a partire dalla data di nascita. Strumento online gratuito.');
    this.form = fb.group({
      birthDate: ['', Validators.required],
      referenceDate: [this.today],
    });
    this.form.valueChanges.subscribe(() => this.calculate());
  }

  calculate(): void {
    const { birthDate, referenceDate } = this.form.value;
    if (!birthDate) { this.result = null; return; }

    const birth = new Date(birthDate);
    const ref = referenceDate ? new Date(referenceDate) : new Date();

    if (isNaN(birth.getTime()) || isNaN(ref.getTime()) || birth > ref) {
      this.result = null;
      return;
    }

    this.result = calcAge(birth, ref);
  }
}
