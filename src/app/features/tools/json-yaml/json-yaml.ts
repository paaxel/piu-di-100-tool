import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';
import { jsonToYaml, yamlToJson } from '../../../packages/toolkit/yaml-utils';

@Component({
  selector: 'app-json-yaml',
  standalone: false,
  templateUrl: './json-yaml.html',
})
export class JsonYaml {
  readonly form: FormGroup;
  result = '';
  error = '';
  resultMode: 'json' | 'yaml' = 'json';

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Convertitore JSON ↔ YAML', 'Convertitore bidirezionale online da JSON a YAML e da YAML a JSON.');
    this.form = fb.group({ value: [''] });
  }

  toYaml(): void {
    this.error = '';
    try {
      const parsed = JSON.parse(this.form.controls['value'].value ?? '');
      this.result = jsonToYaml(parsed);
      this.resultMode = 'yaml';
    } catch (e) {
      this.error = (e as Error).message;
      this.result = '';
    }
  }

  toJson(): void {
    this.error = '';
    try {
      const parsed = yamlToJson(this.form.controls['value'].value ?? '');
      this.result = JSON.stringify(parsed, null, 2);
      this.resultMode = 'json';
    } catch (e) {
      this.error = (e as Error).message;
      this.result = '';
    }
  }

  clearResult(): void {
    this.result = '';
  }
}
