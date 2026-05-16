import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

export interface RegexMatch {
  index: number;
  match: string;
  groups: (string | undefined)[];
}

@Component({
  selector: 'app-regex-tester',
  standalone: false,
  templateUrl: './regex-tester.html',
  styleUrl: './regex-tester.scss',
})
export class RegexTester {
  readonly form: FormGroup;

  matches: RegexMatch[] = [];
  error = '';
  tested = false;
  highlightedHtml = '';

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Regex Tester', 'Testa espressioni regolari in tempo reale con evidenziazione dei match. Strumento online gratuito.');
    this.form = fb.group({
      pattern: [''],
      flags: ['g'],
      testString: [''],
    });
    this.form.valueChanges.subscribe(() => this.test());
  }

  test(): void {
    this.matches = [];
    this.error = '';
    this.highlightedHtml = '';
    this.tested = false;

    const { pattern, flags, testString } = this.form.value;
    if (!pattern) return;

    let regex: RegExp;
    try {
      regex = new RegExp(pattern, flags);
    } catch (e) {
      this.error = (e as Error).message;
      return;
    }

    this.tested = true;
    const text: string = testString ?? '';

    // Collect matches
    if (flags.includes('g')) {
      let m: RegExpExecArray | null;
      regex.lastIndex = 0;
      while ((m = regex.exec(text)) !== null) {
        this.matches.push({
          index: m.index,
          match: m[0],
          groups: m.slice(1),
        });
        // Avoid infinite loop on zero-length matches
        if (m[0].length === 0) regex.lastIndex++;
      }
    } else {
      const m = regex.exec(text);
      if (m) {
        this.matches.push({ index: m.index, match: m[0], groups: m.slice(1) });
      }
    }

    // Build highlighted HTML
    this.highlightedHtml = this.buildHighlight(text, this.matches);
  }

  private buildHighlight(text: string, matches: RegexMatch[]): string {
    if (matches.length === 0) return this.escapeHtml(text);

    let result = '';
    let cursor = 0;
    for (const m of matches) {
      result += this.escapeHtml(text.slice(cursor, m.index));
      result += `<mark>${this.escapeHtml(m.match)}</mark>`;
      cursor = m.index + m.match.length;
    }
    result += this.escapeHtml(text.slice(cursor));
    return result;
  }

  private escapeHtml(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }

  clearResult(): void {
    this.matches = [];
    this.error = '';
    this.highlightedHtml = '';
    this.tested = false;
    this.form.patchValue({ testString: '' }, { emitEvent: false });
  }
}
