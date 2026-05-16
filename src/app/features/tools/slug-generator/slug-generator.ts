import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

// Italian stop-words to optionally strip
const STOP_WORDS = new Set([
  'il','lo','la','i','gli','le','un','uno','una',
  'di','a','da','in','con','su','per','tra','fra',
  'e','o','ma','se','che','non','è','del','della',
  'dei','degli','delle','al','alla','ai','agli','alle',
  'dal','dalla','dai','dagli','dalle','nel','nella',
  'nei','negli','nelle','sul','sulla','sui','sugli','sulle',
]);

function toSlug(input: string, removeStopWords: boolean): string {
  let s = input
    .toLowerCase()
    // Normalize accented characters
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remove anything not alphanumeric or space
    .replace(/[^a-z0-9\s-]/g, '')
    .trim();

  let words = s.split(/\s+/).filter((w) => w.length > 0);

  if (removeStopWords) {
    const filtered = words.filter((w) => !STOP_WORDS.has(w));
    // Keep at least one word
    if (filtered.length > 0) words = filtered;
  }

  return words.join('-').replace(/-+/g, '-');
}

@Component({
  selector: 'app-slug-generator',
  standalone: false,
  templateUrl: './slug-generator.html',
})
export class SlugGenerator {
  readonly form: FormGroup;
  slug = '';
  copied = false;

  constructor(fb: FormBuilder, private cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('Generatore di Slug', 'Genera URL slug SEO-friendly da un titolo. Rimuove accenti, caratteri speciali e stop-word italiane.');
    this.form = fb.group({ value: [''], removeStopWords: [false] });
    this.form.valueChanges.subscribe(() => this.generate());
  }

  generate(): void {
    const { value, removeStopWords } = this.form.value;
    this.slug = toSlug(value ?? '', removeStopWords);
  }

  async copy(): Promise<void> {
    if (!this.slug) return;
    await navigator.clipboard.writeText(this.slug);
    this.copied = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.copied = false;
      this.cdr.detectChanges();
    }, 1500);
  }

  clearResult(): void {
    this.slug = '';
    this.form.patchValue({ value: '' }, { emitEvent: false });
  }
}
