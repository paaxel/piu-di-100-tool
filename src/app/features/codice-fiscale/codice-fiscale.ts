import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Loader } from '../../core/services/loader';
import { SeoService } from '../../core/services/seo';
import {
  CodiceFiscale as CodiceFiscaleService,
  Gender,
} from './services/codice-fiscale';

@Component({
  selector: 'app-codice-fiscale',
  standalone: false,
  templateUrl: './codice-fiscale.html',
  styleUrl: './codice-fiscale.scss',
})
export class CodiceFiscale implements OnDestroy {
  result = '';
  readonly form: FormGroup;
  readonly places$: Observable<string[]>;

  private subscription: Subscription | null = null;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly loaderService: Loader,
    private readonly codiceFiscaleService: CodiceFiscaleService,
    seo: SeoService,
  ) {
    seo.set(
      'Generatore di Codice Fiscale',
      'Calcola il tuo codice fiscale italiano da nome, cognome, data di nascita, sesso e comune di nascita.',
    );
    this.places$ = this.codiceFiscaleService.places$;
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      birthDate: ['', [Validators.required]],
      gender: ['M', [Validators.required]],
      birthPlace: ['', [Validators.required]],
    });
  }

  generate(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loaderService.show();
    const value = this.form.getRawValue();
    this.subscription = this.codiceFiscaleService
      .build({
        name: value.name ?? '',
        surname: value.surname ?? '',
        birthDate: value.birthDate ?? '',
        gender: (value.gender as Gender) ?? 'M',
        birthPlace: value.birthPlace ?? '',
      })
      .subscribe((cf) => {
        this.result = cf;
        this.loaderService.hide();
      });
  }

  clearResult(): void {
    this.result = '';
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
