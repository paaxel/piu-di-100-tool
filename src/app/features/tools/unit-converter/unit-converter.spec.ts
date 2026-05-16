import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { UnitConverter } from './unit-converter';

const fb = new FormBuilder();
const seo = { set: () => {} } as any;

describe('UnitConverter', () => {
  it('converts 1 metre to approximately 3.28084 feet', () => {
    const comp = new UnitConverter(fb, seo);
    comp.form.patchValue({ category: 'length', from: 'm', to: 'ft', value: 1 });
    comp.convert();
    expect(parseFloat(comp.result)).toBeCloseTo(3.28084, 3);
  });

  it('converts 0°C to 32°F', () => {
    const comp = new UnitConverter(fb, seo);
    comp.form.patchValue({ category: 'temperature', from: 'c', to: 'f', value: 0 });
    comp.convert();
    expect(parseFloat(comp.result)).toBeCloseTo(32, 1);
  });

  it('converts 1 kg to approximately 2.20462 lbs', () => {
    const comp = new UnitConverter(fb, seo);
    comp.form.patchValue({ category: 'mass', from: 'kg', to: 'lb', value: 1 });
    comp.convert();
    expect(parseFloat(comp.result)).toBeCloseTo(2.20462, 3);
  });
});

