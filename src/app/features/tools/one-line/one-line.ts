import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';
import { toOneLine } from '../../../packages/toolkit/text-utils';

@Component({
  selector: 'app-one-line',
  standalone: false,
  templateUrl: './one-line.html',
})
export class OneLine {
  readonly form: FormGroup;
  result = '';

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Testo su una riga', 'Comprimi testo su più righe in una singola riga e rimuovi spazi extra. Strumento online gratuito.');
    this.form = fb.group({ value: [''], removeSpaces: [true] });
  }

  apply(): void {
    const value = this.form.controls['value'].value ?? '';
    const removeSpaces = this.form.controls['removeSpaces'].value;
    let out = value.replace(/\r\n|\r|\n/g, ' ');
    if (removeSpaces) out = out.replace(/\s+/g, ' ');
    this.result = out.trim();
  }

  clearResult(): void {
    this.result = '';
  }
}
