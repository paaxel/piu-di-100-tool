import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

export interface WordFrequency {
  word: string;
  count: number;
  pct: number;
  barPct: number;
}

export interface WordStats {
  chars: number;
  charsNoSpace: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  bytesUtf8: number;
  readTimeSec: number;
  topWords: WordFrequency[];
}

const WORDS_PER_MINUTE = 200;
const TOP_WORDS_LIMIT = 20;

function computeTopWords(text: string, totalWords: number): WordFrequency[] {
  if (totalWords === 0) return [];
  const freq = new Map<string, number>();
  const tokens = text.toLowerCase().match(/[a-zA-Z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]+/g) ?? [];
  for (const token of tokens) {
    freq.set(token, (freq.get(token) ?? 0) + 1);
  }
  const sorted = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, TOP_WORDS_LIMIT);
  const maxCount = sorted[0]?.[1] ?? 1;
  return sorted.map(([word, count]) => ({
    word,
    count,
    pct: Math.round((count / totalWords) * 1000) / 10,
    barPct: Math.round((count / maxCount) * 100),
  }));
}

function analyze(text: string): WordStats {
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, '').length;
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const sentences = text.trim() === '' ? 0 : (text.match(/[.!?]+/g) ?? []).length;
  const paragraphs = text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter((p) => p.trim()).length;
  const lines = text === '' ? 0 : text.split('\n').length;
  const bytesUtf8 = new TextEncoder().encode(text).length;
  const readTimeSec = Math.ceil((words / WORDS_PER_MINUTE) * 60);
  const topWords = computeTopWords(text, words);

  return { chars, charsNoSpace, words, sentences, paragraphs, lines, bytesUtf8, readTimeSec, topWords };
}

function formatReadTime(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

@Component({
  selector: 'app-word-counter',
  standalone: false,
  templateUrl: './word-counter.html',
  styleUrl: './word-counter.scss',
})
export class WordCounter {
  readonly form: FormGroup;
  readonly maxChars = 20_000;
  stats: WordStats | null = null;

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Contatore di Parole Avanzato', 'Conta parole, caratteri, frasi, paragrafi, righe, byte e tempo di lettura stimato. Gratuito.');
    this.form = fb.group({ value: [''] });
    this.form.valueChanges.subscribe(() => this.count());
  }

  get charCount(): number {
    return (this.form.value.value ?? '').length;
  }

  count(): void {
    const text: string = this.form.value.value ?? '';
    this.stats = analyze(text);
  }

  formatReadTime(sec: number): string {
    return formatReadTime(sec);
  }

  clearResult(): void {
    this.stats = null;
    this.form.patchValue({ value: '' }, { emitEvent: false });
  }
}
