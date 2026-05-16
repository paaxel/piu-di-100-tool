import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

interface DieResult {
  value: number;
  faces: number;
}

@Component({
  selector: 'app-tira-il-dado',
  standalone: false,
  templateUrl: './tira-il-dado.html',
  styleUrl: './tira-il-dado.scss',
})
export class TiraIlDado {
  readonly form: FormGroup;
  readonly diceTypes = [4, 6, 8, 10, 12, 20, 100];

  results: DieResult[] = [];
  total = 0;

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Tira il Dado', 'Lancia uno o più dadi virtuali: D4, D6, D8, D10, D12, D20, D100. Strumento online gratuito.');
    this.form = fb.group({
      faces: [6],
      count: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
    });
  }

  roll(): void {
    if (this.form.invalid) return;
    const { faces, count } = this.form.value;
    const arr = new Uint32Array(+count);
    crypto.getRandomValues(arr);
    this.results = Array.from(arr, (v) => ({
      value: (v % +faces) + 1,
      faces: +faces,
    }));
    this.total = this.results.reduce((s, r) => s + r.value, 0);
  }
}
