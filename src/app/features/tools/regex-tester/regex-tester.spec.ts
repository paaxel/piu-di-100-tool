import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { RegexTester } from './regex-tester';

const fb = new FormBuilder();
const seo = { set: () => {} } as any;

describe('RegexTester', () => {
  it('finds all matches in global mode', () => {
    const comp = new RegexTester(fb, seo);
    comp.form.patchValue({ pattern: 'a+', flags: 'g', testString: 'aaa bbb aa' });
    comp.test();
    expect(comp.matches).toHaveLength(2);
    expect(comp.matches[0].match).toBe('aaa');
    expect(comp.matches[1].match).toBe('aa');
  });

  it('finds a single match in non-global mode', () => {
    const comp = new RegexTester(fb, seo);
    comp.form.patchValue({ pattern: '\\d+', flags: '', testString: 'abc 123 def 456' });
    comp.test();
    expect(comp.matches).toHaveLength(1);
    expect(comp.matches[0].match).toBe('123');
  });

  it('sets an error message for an invalid regex pattern', () => {
    const comp = new RegexTester(fb, seo);
    comp.form.patchValue({ pattern: '[invalid', flags: 'g', testString: 'test' });
    comp.test();
    expect(comp.error).toBeTruthy();
    expect(comp.matches).toHaveLength(0);
  });
});

