import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as semver from 'semver';
import { SeoService } from '../../../core/services/seo';

@Component({
  selector: 'app-semver-checker',
  standalone: false,
  templateUrl: './semver-checker.html',
})
export class SemverChecker {
  readonly form: FormGroup;

  compareOutput = '';
  rangeOutput = '';
  error = '';

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Semver Comparator e Range Checker', 'Confronta versioni semantiche e verifica se una versione soddisfa un range npm.');
    this.form = fb.group({
      v1: ['1.0.0'],
      v2: ['1.1.0'],
      range: ['^1.0.0'],
      candidate: ['1.2.3'],
    });
  }

  compare(): void {
    this.error = '';
    this.compareOutput = '';
    const a = semver.valid(semver.clean(this.form.controls['v1'].value ?? ''));
    const b = semver.valid(semver.clean(this.form.controls['v2'].value ?? ''));

    if (!a || !b) {
      this.error = 'Versioni non valide.';
      return;
    }

    if (semver.eq(a, b)) this.compareOutput = `${a} = ${b}`;
    else if (semver.gt(a, b)) this.compareOutput = `${a} > ${b}`;
    else this.compareOutput = `${a} < ${b}`;
  }

  checkRange(): void {
    this.error = '';
    this.rangeOutput = '';

    const candidate = semver.valid(semver.clean(this.form.controls['candidate'].value ?? ''));
    const range = this.form.controls['range'].value ?? '';
    const normalizedRange = semver.validRange(range);

    if (!candidate) {
      this.error = 'Versione candidato non valida.';
      return;
    }
    if (!normalizedRange) {
      this.error = 'Range semver non valido.';
      return;
    }

    const ok = semver.satisfies(candidate, normalizedRange, { includePrerelease: true });
    this.rangeOutput = ok
      ? `${candidate} soddisfa ${normalizedRange}`
      : `${candidate} non soddisfa ${normalizedRange}`;
  }
}
