import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

// Italian P.IVA checksum validation (Luhn-like algorithm)
function validatePartitaIva(piva: string): { valid: boolean; reason: string } {
  const p = piva.trim().replace(/\s/g, '');
  if (!/^\d{11}$/.test(p)) {
    return { valid: false, reason: 'FORMAT' };
  }
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const d = parseInt(p[i], 10);
    sum += i % 2 === 0 ? d : (() => { const v = d * 2; return v > 9 ? v - 9 : v; })();
  }
  const check = (10 - (sum % 10)) % 10;
  if (check !== parseInt(p[10], 10)) {
    return { valid: false, reason: 'CHECKSUM' };
  }
  return { valid: true, reason: 'OK' };
}

@Component({
  selector: 'app-partita-iva',
  standalone: false,
  templateUrl: './partita-iva.html',
})
export class PartitaIva {
  readonly form: FormGroup;
  result: { valid: boolean; reason: string } | null = null;

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Validatore Partita IVA', 'Verifica la validità di una Partita IVA italiana con controllo del checksum. Strumento online gratuito.');
    this.form = fb.group({ piva: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]] });
    this.form.get('piva')!.valueChanges.subscribe((v: string) => {
      const clean = (v ?? '').replace(/\s/g, '');
      if (clean.length === 11) {
        this.result = validatePartitaIva(clean);
      } else {
        this.result = null;
      }
    });
  }
}
