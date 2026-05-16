import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

const WORDS = [
  'lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit',
  'sed','do','eiusmod','tempor','incididunt','ut','labore','et','dolore',
  'magna','aliqua','enim','ad','minim','veniam','quis','nostrud','exercitation',
  'ullamco','laboris','nisi','aliquip','ex','ea','commodo','consequat',
  'duis','aute','irure','in','reprehenderit','voluptate','velit','esse',
  'cillum','eu','fugiat','nulla','pariatur','excepteur','sint','occaecat',
  'cupidatat','non','proident','sunt','culpa','qui','officia','deserunt',
  'mollit','anim','id','est','laborum','perspiciatis','unde','omnis',
  'natus','error','voluptatem','accusantium','doloremque','laudantium',
  'totam','rem','aperiam','eaque','ipsa','quae','ab','illo','inventore',
  'veritatis','architecto','beatae','vitae','dicta','explicabo','nemo',
  'ipsam','quia','voluptas','aspernatur','aut','odit','fugit',
];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function generateSentence(): string {
  const len = randInt(6, 18);
  const words: string[] = [];
  for (let i = 0; i < len; i++) words.push(randomWord());
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(' ') + '.';
}

function generateParagraph(sentences: number): string {
  const result: string[] = [];
  for (let i = 0; i < sentences; i++) result.push(generateSentence());
  return result.join(' ');
}

@Component({
  selector: 'app-lorem-ipsum',
  standalone: false,
  templateUrl: './lorem-ipsum.html',
})
export class LoremIpsum {
  readonly form: FormGroup;
  output = '';
  copied = false;

  readonly unitOptions = ['paragraphs', 'sentences', 'words'];

  constructor(fb: FormBuilder, private cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('Generatore Lorem Ipsum', 'Genera testo Lorem Ipsum placeholder per mockup e prototipi. Paragrafi, frasi o parole a scelta.');
    this.form = fb.group({
      count: [3, [Validators.required, Validators.min(1), Validators.max(100)]],
      unit: ['paragraphs'],
      startWithLorem: [true],
    });
  }

  generate(): void {
    if (this.form.invalid) return;
    const { count, unit, startWithLorem } = this.form.value;
    const n = +count;
    let result = '';

    if (unit === 'paragraphs') {
      const paras: string[] = [];
      for (let i = 0; i < n; i++) {
        paras.push(i === 0 && startWithLorem
          ? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, ' + generateParagraph(randInt(3, 6))
          : generateParagraph(randInt(3, 7)));
      }
      result = paras.join('\n\n');
    } else if (unit === 'sentences') {
      const sents: string[] = [];
      if (startWithLorem) sents.push('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
      while (sents.length < n) sents.push(generateSentence());
      result = sents.slice(0, n).join(' ');
    } else {
      const words: string[] = startWithLorem ? ['Lorem', 'ipsum'] : [];
      while (words.length < n) words.push(randomWord());
      result = words.slice(0, n).join(' ');
    }

    this.output = result;
  }

  async copy(): Promise<void> {
    if (!this.output) return;
    await navigator.clipboard.writeText(this.output);
    this.copied = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.copied = false;
      this.cdr.detectChanges();
    }, 1500);
  }

  clear(): void {
    this.output = '';
  }
}
