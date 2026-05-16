import '@angular/compiler';
import { FormBuilder } from '@angular/forms';
import { PartitaIva } from './partita-iva';

const fb = new FormBuilder();
const seo = { set: () => {} } as any;

describe('PartitaIva', () => {
  it('validates a correct Italian P.IVA', () => {
    const comp = new PartitaIva(fb, seo);
    // Known valid P.IVA: 00159560366
    comp.form.patchValue({ piva: '00159560366' });
    expect(comp.result?.valid).toBe(true);
  });

  it('rejects a P.IVA with an incorrect checksum digit', () => {
    const comp = new PartitaIva(fb, seo);
    // Modify last digit of valid P.IVA
    comp.form.patchValue({ piva: '00159560360' });
    expect(comp.result?.valid).toBe(false);
    expect(comp.result?.reason).toBe('CHECKSUM');
  });

  it('rejects a P.IVA with wrong format (non-digits)', () => {
    const comp = new PartitaIva(fb, seo);
    comp.form.patchValue({ piva: '0015956036X' });
    expect(comp.result?.valid).toBe(false);
    expect(comp.result?.reason).toBe('FORMAT');
  });
});

