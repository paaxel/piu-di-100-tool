import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';
import { checkIbanControl, IbanCheckResult } from '../../../packages/toolkit/iban-utils';

@Component({
  selector: 'app-iban-checker',
  standalone: false,
  templateUrl: './iban-checker.html',
})
export class IbanChecker {
  result: IbanCheckResult | null = null;
  readonly form: FormGroup;

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Verificatore IBAN', 'Verifica le cifre di controllo IBAN con l\'algoritmo MOD-97. Solo controllo formato — nessuna verifica bancaria.');
    this.form = fb.group({ value: [''] });
  }

  check(): void {
    this.result = checkIbanControl(this.form.controls['value'].value ?? '');
  }

  clearResult(): void {
    this.result = null;
  }
}
