import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

@Component({
  selector: 'app-find-replace',
  standalone: false,
  templateUrl: './find-replace.html',
})
export class FindReplace {
  readonly form: FormGroup;
  result = '';
  count = 0;
  error = '';

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Trova e Sostituisci Testo', 'Trova e sostituisci testo con supporto regex, case sensitive e sostituzione globale.');
    this.form = fb.group({
      source: [''],
      find: [''],
      replace: [''],
      useRegex: [false],
      caseSensitive: [false],
      global: [true],
    });
  }

  apply(): void {
    this.error = '';
    this.result = '';
    this.count = 0;

    const source = this.form.controls['source'].value ?? '';
    const find = this.form.controls['find'].value ?? '';
    const replace = this.form.controls['replace'].value ?? '';
    const useRegex = !!this.form.controls['useRegex'].value;
    const caseSensitive = !!this.form.controls['caseSensitive'].value;
    const global = !!this.form.controls['global'].value;

    if (!find) {
      this.result = source;
      return;
    }

    try {
      const pattern = useRegex ? find : find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const flags = `${global ? 'g' : ''}${caseSensitive ? '' : 'i'}`;
      const re = new RegExp(pattern, flags);
      this.result = source.replace(re, () => {
        this.count += 1;
        return replace;
      });
    } catch (e) {
      this.error = (e as Error).message;
      this.result = source;
    }
  }

  copy(): void {
    if (!this.result) return;
    navigator.clipboard?.writeText(this.result).catch(() => undefined);
  }
}
