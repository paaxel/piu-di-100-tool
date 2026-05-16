import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

type InvertMode = 'chars' | 'words' | 'lines';

function invert(text: string, mode: InvertMode): string {
  if (mode === 'chars') return [...text].reverse().join('');
  if (mode === 'words') return text.split(/(\s+)/).reverse().join('');
  return text.split('\n').reverse().join('\n');
}

@Component({
  selector: 'app-text-inverter',
  standalone: false,
  templateUrl: './text-inverter.html',
})
export class TextInverter {
  readonly form: FormGroup;
  result = '';

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Invertitore di Testo', 'Inverti testo per caratteri, parole o righe direttamente online.');
    this.form = fb.group({ value: [''], mode: ['chars'] });
    this.form.valueChanges.subscribe(() => this.apply());
  }

  apply(): void {
    const value = this.form.controls['value'].value ?? '';
    const mode = (this.form.controls['mode'].value ?? 'chars') as InvertMode;
    this.result = invert(value, mode);
  }

  copy(): void {
    if (!this.result) return;
    navigator.clipboard?.writeText(this.result).catch(() => undefined);
  }
}
