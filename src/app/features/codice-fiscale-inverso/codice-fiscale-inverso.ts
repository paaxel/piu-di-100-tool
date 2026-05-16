import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CodiceFiscaleDecoded } from '../../packages/toolkit/codice-fiscale-utils';
import { CodiceFiscale } from '../codice-fiscale/services/codice-fiscale';

@Component({
  selector: 'app-codice-fiscale-inverso',
  templateUrl: './codice-fiscale-inverso.html',
  styleUrl: './codice-fiscale-inverso.scss',
  standalone: false,
})
export class CodiceFiscaleInverso implements OnDestroy {
  readonly form: FormGroup;
  result: CodiceFiscaleDecoded | null = null;
  private subscription: Subscription | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly codiceFiscaleService: CodiceFiscale,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      cf: ['', [Validators.required, Validators.minLength(16), Validators.maxLength(16)]],
    });
  }

  decode(): void {
    if (this.form.invalid) return;
    const cf: string = this.form.value.cf;
    this.subscription?.unsubscribe();
    this.subscription = this.codiceFiscaleService.decode(cf).subscribe((decoded) => {
      this.result = decoded;
      this.cdr.detectChanges();
    });
  }

  reset(): void {
    this.form.reset({ cf: '' });
    this.result = null;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
