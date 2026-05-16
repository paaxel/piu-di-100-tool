import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';
import { csvToJson, jsonToCsv } from '../../../packages/toolkit/csv-utils';

@Component({
  selector: 'app-json-csv',
  standalone: false,
  templateUrl: './json-csv.html',
})
export class JsonCsv {
  readonly form: FormGroup;
  result = '';
  error = '';

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Convertitore JSON ↔ CSV', 'Converti tra array JSON di oggetti e formato CSV online.');
    this.form = fb.group({ value: [''] });
  }

  toCsv(): void {
    this.error = '';
    try {
      this.result = jsonToCsv(JSON.parse(this.form.controls['value'].value ?? ''));
    } catch (e) {
      this.error = (e as Error).message;
      this.result = '';
    }
  }

  toJson(): void {
    this.error = '';
    try {
      this.result = JSON.stringify(csvToJson(this.form.controls['value'].value ?? ''), null, 2);
    } catch (e) {
      this.error = (e as Error).message;
      this.result = '';
    }
  }

  clearResult(): void {
    this.result = '';
  }
}
