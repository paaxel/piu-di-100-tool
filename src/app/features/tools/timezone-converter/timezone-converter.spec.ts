import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { TimezoneConverter, TIMEZONES } from './timezone-converter';

const fb = new FormBuilder();
const seo = { set: () => {} } as any;

describe('TimezoneConverter', () => {
  it('produces one result per configured timezone', () => {
    const comp = new TimezoneConverter(fb, seo);
    comp.form.patchValue({ datetime: '2024-01-15T12:00', sourceTz: 'UTC' });
    comp.convert();
    expect(comp.results).toHaveLength(TIMEZONES.length);
  });

  it('each result has a formatted string and an offset', () => {
    const comp = new TimezoneConverter(fb, seo);
    comp.form.patchValue({ datetime: '2024-06-01T10:00', sourceTz: 'Europe/Rome' });
    comp.convert();
    for (const entry of comp.results) {
      expect(entry.formatted).toBeTruthy();
      expect(entry.offset).toBeTruthy();
    }
  });

  it('returns empty results when datetime is missing', () => {
    const comp = new TimezoneConverter(fb, seo);
    comp.form.patchValue({ datetime: '', sourceTz: 'UTC' });
    comp.convert();
    expect(comp.results).toHaveLength(0);
  });
});

