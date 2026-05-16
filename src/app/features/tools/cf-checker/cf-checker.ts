import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';
import { checkCodiceFiscaleControl, CfCheckResult } from '../../../packages/toolkit/cf-checker-utils';

@Component({
  selector: 'app-cf-checker',
  standalone: false,
  templateUrl: './cf-checker.html',
})
export class CfChecker {
  result: CfCheckResult | null = null;
  readonly form: FormGroup;

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Verificatore Codice Fiscale', 'Verifica il carattere di controllo del codice fiscale italiano con regex generica e checksum.');
    this.form = fb.group({ value: [''] });
  }

  check(): void {
    this.result = checkCodiceFiscaleControl(this.form.controls['value'].value ?? '');
  }

  clearResult(): void {
    this.result = null;
  }
}
