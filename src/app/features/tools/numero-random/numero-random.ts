import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

@Component({
  selector: 'app-numero-random',
  standalone: false,
  templateUrl: './numero-random.html',
  styleUrl: './numero-random.scss',
})
export class NumeroRandom {
  readonly form: FormGroup;

  result: number | null = null;
  results: number[] = [];
  history: number[] = [];

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Numero Casuale', 'Estrai un numero casuale in un intervallo personalizzato. Generatore crittograficamente sicuro.');
    this.form = fb.group({
      min: [1, [Validators.required]],
      max: [100, [Validators.required]],
      count: [1, [Validators.required, Validators.min(1), Validators.max(100)]],
    });
  }

  generate(): void {
    if (this.form.invalid) return;
    const { min, max, count } = this.form.value;
    const lo = Math.min(+min, +max);
    const hi = Math.max(+min, +max);
    const range = hi - lo + 1;
    const arr = new Uint32Array(+count);
    crypto.getRandomValues(arr);
    this.results = Array.from(arr, (v) => lo + (v % range));
    this.result = this.results[0];
    this.history = [...this.results, ...this.history].slice(0, 100);
  }

  clearHistory(): void {
    this.result = null;
    this.results = [];
    this.history = [];
  }
}
