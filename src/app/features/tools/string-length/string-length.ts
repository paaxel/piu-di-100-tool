import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';
import { computeStringStats, StringStats } from '../../../packages/toolkit/text-utils';

@Component({
  selector: 'app-string-length',
  standalone: false,
  templateUrl: './string-length.html',
  styleUrl: './string-length.scss',
})
export class StringLength {
  readonly form: FormGroup;
  stats: StringStats = { characters: 0, charactersNoSpaces: 0, words: 0, lines: 0, bytes: 0 };

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Lunghezza Stringa', 'Conta caratteri, parole, righe e dimensione in byte di qualsiasi testo. Strumento online gratuito.');
    this.form = fb.group({ value: [''] });
    this.form.controls['value'].valueChanges.subscribe((v: string) => {
      this.stats = computeStringStats(v ?? '');
    });
  }
}
