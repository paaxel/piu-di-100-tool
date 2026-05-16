import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { JsonCsv } from './json-csv';

const fb = new FormBuilder();
const seo = { set: () => {} } as any;

describe('JsonCsv', () => {
  it('converts a JSON array to CSV with headers', () => {
    const comp = new JsonCsv(fb, seo);
    comp.form.patchValue({ value: JSON.stringify([{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }]) });
    comp.toCsv();
    expect(comp.result).toContain('name,age');
    expect(comp.result).toContain('Alice');
    expect(comp.error).toBe('');
  });

  it('converts CSV back to a JSON array', () => {
    const comp = new JsonCsv(fb, seo);
    comp.form.patchValue({ value: 'name,age\nAlice,30\nBob,25' });
    comp.toJson();
    const parsed = JSON.parse(comp.result);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].name).toBe('Alice');
  });

  it('sets an error for invalid JSON input', () => {
    const comp = new JsonCsv(fb, seo);
    comp.form.patchValue({ value: 'not json' });
    comp.toCsv();
    expect(comp.error).toBeTruthy();
    expect(comp.result).toBe('');
  });
});

