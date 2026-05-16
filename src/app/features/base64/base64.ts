import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Loader } from '../../core/services/loader';
import { SeoService } from '../../core/services/seo';
import { Base64Tool } from './services/base64-tool';

@Component({
  selector: 'app-base64',
  standalone: false,
  templateUrl: './base64.html',
  styleUrl: './base64.scss',
})
export class Base64 {
  result = '';
  readonly form: FormGroup;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly loaderService: Loader,
    private readonly base64Service: Base64Tool,
    private readonly translateService: TranslateService,
    seo: SeoService,
  ) {
    seo.set(
      'Base64 Codifica / Decodifica',
      'Codifica e decodifica qualsiasi stringa di testo in Base64. Strumento online gratuito, nessuna registrazione richiesta.',
    );
    this.form = this.formBuilder.group({
      value: ['', [Validators.required]],
    });
  }

  encode(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loaderService.show();
    this.result = this.base64Service.encode(this.form.controls['value'].value ?? '');
    this.loaderService.hide();
  }

  decode(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loaderService.show();
    try {
      this.result = this.base64Service.decode(this.form.controls['value'].value ?? '');
    } catch {
      this.result = this.translateService.instant('BASE64.INVALID_INPUT');
    }
    this.loaderService.hide();
  }

  clearResult(): void {
    this.result = '';
  }
}
