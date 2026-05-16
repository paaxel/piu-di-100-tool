import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';
import { removeAllSpaces, removeDoubleSpaces } from '../../../packages/toolkit/text-utils';

@Component({
  selector: 'app-space-remover',
  standalone: false,
  templateUrl: './space-remover.html',
})
export class SpaceRemover {
  readonly form: FormGroup;
  result = '';

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Rimuovi Spazi', 'Elimina tutti i caratteri di spaziatura da qualsiasi testo. Strumento online gratuito.');
    this.form = fb.group({ value: [''], onlyDouble: [true] });
  }

  apply(): void {
    const text: string = this.form.controls['value'].value ?? '';
    this.result = this.form.controls['onlyDouble'].value
      ? removeDoubleSpaces(text)
      : removeAllSpaces(text);
  }

  clearResult(): void {
    this.result = '';
  }
}
