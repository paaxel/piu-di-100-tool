import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { JsonYaml } from './json-yaml';

const fb = new FormBuilder();
const seo = { set: () => {} } as any;

describe('JsonYaml', () => {
  it('converts simple JSON to YAML', () => {
    const comp = new JsonYaml(fb, seo);
    comp.form.patchValue({ value: '{"name":"Alice","age":30}' });
    comp.toYaml();
    expect(comp.result).toContain('name: Alice');
    expect(comp.result).toContain('age: 30');
    expect(comp.error).toBe('');
  });

  it('converts YAML back to JSON', () => {
    const comp = new JsonYaml(fb, seo);
    comp.form.patchValue({ value: 'name: Alice\nage: 30' });
    comp.toJson();
    const parsed = JSON.parse(comp.result);
    expect(parsed.name).toBe('Alice');
    expect(parsed.age).toBe(30);
  });

  it('sets an error for invalid JSON when converting to YAML', () => {
    const comp = new JsonYaml(fb, seo);
    comp.form.patchValue({ value: 'not json {' });
    comp.toYaml();
    expect(comp.error).toBeTruthy();
  });
});

