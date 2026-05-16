import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

export interface DiffLine {
  type: 'equal' | 'added' | 'removed';
  text: string;
  lineA: number | null;
  lineB: number | null;
}

function lcsLengthTable(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp;
}

function diffLines(original: string, modified: string): DiffLine[] {
  const a = original.split('\n');
  const b = modified.split('\n');

  // Guard against huge inputs
  if (a.length * b.length > 200_000) {
    return [{ type: 'added', text: '⚠ Testo troppo grande per il diff riga per riga.', lineA: null, lineB: null }];
  }

  const dp = lcsLengthTable(a, b);
  const result: DiffLine[] = [];
  let i = a.length;
  let j = b.length;
  let lineA = i;
  let lineB = j;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      result.unshift({ type: 'equal', text: a[i - 1], lineA: i, lineB: j });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'added', text: b[j - 1], lineA: null, lineB: j });
      j--;
    } else {
      result.unshift({ type: 'removed', text: a[i - 1], lineA: i, lineB: null });
      i--;
    }
  }
  return result;
}

@Component({
  selector: 'app-diff-checker',
  standalone: false,
  templateUrl: './diff-checker.html',
  styleUrl: './diff-checker.scss',
})
export class DiffChecker {
  readonly form: FormGroup;

  diff: DiffLine[] = [];
  stats = { added: 0, removed: 0, equal: 0 };
  computed = false;

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Diff Checker', 'Confronta due testi riga per riga ed evidenzia le differenze. Strumento online gratuito.');
    this.form = fb.group({ original: [''], modified: [''] });
  }

  compare(): void {
    const { original, modified } = this.form.value;
    this.diff = diffLines(original ?? '', modified ?? '');
    this.stats = {
      added: this.diff.filter((d) => d.type === 'added').length,
      removed: this.diff.filter((d) => d.type === 'removed').length,
      equal: this.diff.filter((d) => d.type === 'equal').length,
    };
    this.computed = true;
  }

  clear(): void {
    this.diff = [];
    this.stats = { added: 0, removed: 0, equal: 0 };
    this.computed = false;
    this.form.reset();
  }
}
