import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { Cron } from './cron';

const fb = new FormBuilder();
const seo = { set: () => {} } as any;

describe('Cron', () => {
  it('parses a valid 5-field expression and reports valid=true', () => {
    const comp = new Cron(fb, seo);
    comp.update('*/15 9-17 * * 1-5');
    expect(comp.explanation.valid).toBe(true);
    expect(comp.explanation.fields).toHaveLength(5);
  });

  it('reports invalid=true for a malformed expression', () => {
    const comp = new Cron(fb, seo);
    comp.update('not a cron');
    expect(comp.explanation.valid).toBe(false);
  });

  it('parses a 6-field expression and returns 6 fields', () => {
    const comp = new Cron(fb, seo);
    comp.update('0 0 0 * * *');
    expect(comp.explanation.valid).toBe(true);
    expect(comp.explanation.fields).toHaveLength(6);
  });
});

