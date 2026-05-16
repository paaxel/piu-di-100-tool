import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';
import { decodeJwt, verifyJwtSignature, SYMMETRIC_ALGS, SUPPORTED_VERIFY_ALGS } from '../../../packages/toolkit/jwt-utils';

@Component({
  selector: 'app-jwt-tool',
  standalone: false,
  templateUrl: './jwt-tool.html',
  styleUrl: './jwt-tool.scss',
})
export class JwtTool {
  readonly form: FormGroup;
  header = '';
  payload = '';
  signature = '';
  error = '';
  detectedAlg = '';
  isSymmetric = false;
  isVerifiable = false;
  verifyResult: boolean | null = null;
  verifyError = '';
  verifying = false;

  constructor(fb: FormBuilder, private cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('Decodificatore JWT', 'Decodifica e ispeziona JSON Web Token — visualizza header, payload e verifica la firma.');
    this.form = fb.group({ token: [''], secret: [''] });
  }

  decode(): void {
    this.error = '';
    this.verifyResult = null;
    this.verifyError = '';
    try {
      const r = decodeJwt(this.form.controls['token'].value ?? '');
      this.header = JSON.stringify(r.header, null, 2);
      this.payload = JSON.stringify(r.payload, null, 2);
      this.signature = r.signature;
      const h = r.header as Record<string, unknown>;
      this.detectedAlg = (h['alg'] as string) ?? '';
      this.isSymmetric = SYMMETRIC_ALGS.includes(this.detectedAlg);
      this.isVerifiable = SUPPORTED_VERIFY_ALGS.includes(this.detectedAlg);
    } catch (e) {
      this.error = (e as Error).message || 'Invalid token';
      this.header = this.payload = this.signature = '';
      this.detectedAlg = '';
      this.isVerifiable = false;
    }
  }

  async verify(): Promise<void> {
    this.verifyResult = null;
    this.verifyError = '';
    this.verifying = true;
    try {
      const token = this.form.controls['token'].value ?? '';
      const secret = this.form.controls['secret'].value ?? '';
      this.verifyResult = await verifyJwtSignature(token, secret);
    } catch (e) {
      this.verifyError = (e as Error).message || 'Verification failed';
    } finally {
      this.verifying = false;
      this.cdr.detectChanges();
    }
  }
}
