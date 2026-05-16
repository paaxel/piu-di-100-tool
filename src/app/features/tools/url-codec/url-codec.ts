import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';
import { urlDecode, urlEncode } from '../../../packages/toolkit/text-utils';

@Component({
  selector: 'app-url-codec',
  standalone: false,
  templateUrl: './url-codec.html',
})
export class UrlCodec {
  readonly form: FormGroup;
  result = '';
  error = '';

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('URL Encode / Decode', 'Codifica e decodifica percentuale per URL e parametri query. Strumento online gratuito.');
    this.form = fb.group({ value: [''] });
  }

  encode(): void {
    this.error = '';
    this.result = urlEncode(this.form.controls['value'].value ?? '');
  }

  decode(): void {
    this.error = '';
    try {
      this.result = urlDecode(this.form.controls['value'].value ?? '');
    } catch (e) {
      this.error = (e as Error).message;
      this.result = '';
    }
  }

  clearResult(): void {
    this.result = '';
  }
}
