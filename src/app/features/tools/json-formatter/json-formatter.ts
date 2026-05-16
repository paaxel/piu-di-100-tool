import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

@Component({
  selector: 'app-json-formatter',
  standalone: false,
  templateUrl: './json-formatter.html',
})
export class JsonFormatter {
  readonly form: FormGroup;
  result = '';
  error = '';

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Formattatore JSON', 'Formatta, minifica e valida documenti JSON online. Formattatore e validatore JSON gratuito.');
    this.form = fb.group({ value: [''], indent: [2] });
  }

  format(): void {
    this.error = '';
    try {
      const parsed = JSON.parse(this.form.controls['value'].value ?? '');
      this.result = JSON.stringify(parsed, null, Number(this.form.controls['indent'].value) || 2);
    } catch (e) {
      this.error = (e as Error).message;
      this.result = '';
    }
  }

  minify(): void {
    this.error = '';
    try {
      this.result = JSON.stringify(JSON.parse(this.form.controls['value'].value ?? ''));
    } catch (e) {
      this.error = (e as Error).message;
      this.result = '';
    }
  }

  clearResult(): void {
    this.result = '';
  }
}
