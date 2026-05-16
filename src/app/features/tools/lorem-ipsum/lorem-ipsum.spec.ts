import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { LoremIpsum } from './lorem-ipsum';

const fb = new FormBuilder();
const cdr = { detectChanges: () => {} } as any;
const seo = { set: () => {} } as any;

describe('LoremIpsum', () => {
  it('generates non-empty output for 1 paragraph', () => {
    const comp = new LoremIpsum(fb, cdr, seo);
    comp.form.patchValue({ count: 1, unit: 'paragraphs', startWithLorem: true });
    comp.generate();
    expect(comp.output.length).toBeGreaterThan(0);
  });

  it('starts with "Lorem ipsum" when startWithLorem is true', () => {
    const comp = new LoremIpsum(fb, cdr, seo);
    comp.form.patchValue({ count: 2, unit: 'paragraphs', startWithLorem: true });
    comp.generate();
    expect(comp.output.startsWith('Lorem ipsum')).toBe(true);
  });

  it('generates the requested number of sentences', () => {
    const comp = new LoremIpsum(fb, cdr, seo);
    comp.form.patchValue({ count: 3, unit: 'sentences', startWithLorem: false });
    comp.generate();
    // 3 sentences each ending with '.'
    const sentenceCount = (comp.output.match(/\./g) ?? []).length;
    expect(sentenceCount).toBeGreaterThanOrEqual(3);
  });
});

