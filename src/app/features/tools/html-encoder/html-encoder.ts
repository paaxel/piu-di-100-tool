import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

function htmlEncode(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function htmlDecode(input: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = input;
  return textarea.value;
}

@Component({
  selector: 'app-html-encoder',
  standalone: false,
  templateUrl: './html-encoder.html',
})
export class HtmlEncoder {
  readonly form: FormGroup;
  encoded = '';
  decoded = '';
  copiedEncoded = false;
  copiedDecoded = false;

  constructor(fb: FormBuilder, private cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('HTML Encode / Decode', 'Codifica e decodifica entità HTML online. Converti caratteri speciali in entità HTML e viceversa.');
    this.form = fb.group({ value: [''] });
    this.form.get('value')!.valueChanges.subscribe((v: string) => this.process(v ?? ''));
  }

  process(input: string): void {
    this.encoded = htmlEncode(input);
    this.decoded = htmlDecode(input);
  }

  async copyEncoded(): Promise<void> {
    if (!this.encoded) return;
    await navigator.clipboard.writeText(this.encoded);
    this.copiedEncoded = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.copiedEncoded = false;
      this.cdr.detectChanges();
    }, 1500);
  }

  async copyDecoded(): Promise<void> {
    if (!this.decoded) return;
    await navigator.clipboard.writeText(this.decoded);
    this.copiedDecoded = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.copiedDecoded = false;
      this.cdr.detectChanges();
    }, 1500);
  }
}
