import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { SqlFormatter } from './sql-formatter';

const fb = new FormBuilder();
const seo = { set: () => {} } as any;

describe('SqlFormatter', () => {
  it('formats a simple SELECT statement with keywords on separate lines', () => {
    const comp = new SqlFormatter(fb, seo);
    comp.form.patchValue({ sql: 'select * from users where id = 1', indent: '  ' });
    comp.formatSql();
    expect(comp.output).toContain('SELECT');
    expect(comp.output).toContain('FROM');
    expect(comp.output).toContain('WHERE');
    // Keywords should each be on their own line
    const lines = comp.output.split('\n');
    expect(lines.some((l) => l.trim() === 'SELECT')).toBe(true);
  });

  it('produces empty output for an empty input', () => {
    const comp = new SqlFormatter(fb, seo);
    comp.form.patchValue({ sql: '', indent: '  ' });
    comp.formatSql();
    expect(comp.output).toBe('');
  });

  it('clears sql and output when clear is called', () => {
    const comp = new SqlFormatter(fb, seo);
    comp.form.patchValue({ sql: 'SELECT 1', indent: '  ' });
    comp.formatSql();
    comp.clear();
    expect(comp.output).toBe('');
    expect(comp.form.value.sql).toBe('');
  });
});

