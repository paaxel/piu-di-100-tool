import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';
import { CronExplanation, explainCron } from '../../../packages/toolkit/cron-utils';

@Component({
  selector: 'app-cron',
  standalone: false,
  templateUrl: './cron.html',
})
export class Cron implements OnInit {
  readonly form: FormGroup;
  explanation: CronExplanation = { fields: [], summary: '', valid: false };

  readonly examples = [
    { expr: '0 9 * * 1-5', label: 'Every weekday at 09:00' },
    { expr: '*/15 * * * *', label: 'Every 15 minutes' },
    { expr: '0 0 1 * *', label: 'First day of every month' },
    { expr: '0 0 0 * * *', label: '6-field: every midnight' },
  ];

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Costruttore Espressioni Cron', 'Costruisci e spiega espressioni cron (5 o 6 campi) con una guida visiva, come crontab.guru.');
    this.form = fb.group({ expression: ['*/15 9-17 * * 1-5'] });
  }

  ngOnInit(): void {
    this.form.controls['expression'].valueChanges.subscribe((v: string) => this.update(v));
    this.update(this.form.controls['expression'].value);
  }

  update(v: string): void {
    this.explanation = explainCron(v);
  }

  apply(expr: string): void {
    this.form.controls['expression'].setValue(expr);
  }

  get fieldLabels(): string[] {
    return this.explanation.fields.length === 6
      ? ['second', 'minute', 'hour', 'day-of-month', 'month', 'day-of-week']
      : ['minute', 'hour', 'day-of-month', 'month', 'day-of-week'];
  }
}
