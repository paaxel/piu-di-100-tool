import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import {
  CodiceFiscaleDecoded,
  GENDER_FEMALE,
  GENDER_MALE,
  PlaceCodeMap,
  calculateControlCharacter,
  createDayCode,
  createMonthCode,
  createNameCode,
  createSurnameCode,
  decodeFiscalCode,
  normalizeName,
  resolvePlaceCode,
} from '../../../packages/toolkit/codice-fiscale-utils';

export type Gender = typeof GENDER_MALE | typeof GENDER_FEMALE;

export interface CodiceFiscaleInput {
  name: string;
  surname: string;
  birthDate: string;
  gender: Gender;
  birthPlace: string;
}

@Injectable({
  providedIn: 'root',
})
export class CodiceFiscale {
  private readonly placeCodeMap$: Observable<PlaceCodeMap>;

  readonly places$: Observable<string[]>;

  constructor(private readonly http: HttpClient) {
    this.placeCodeMap$ = this.http
      .get<PlaceCodeMap>('./data/place-codes.json')
      .pipe(shareReplay(1));

    this.places$ = this.placeCodeMap$.pipe(map((m) => Object.keys(m)));
  }

  build(input: CodiceFiscaleInput): Observable<string> {
    return this.placeCodeMap$.pipe(
      map((placeCodeMap) => {
        const birthDate = new Date(input.birthDate);
        if (Number.isNaN(birthDate.getTime())) {
          return '';
        }

        const normalizedPlace = normalizeName(input.birthPlace);
        const year = String(birthDate.getFullYear()).slice(-2);
        const month = createMonthCode(birthDate.getMonth() + 1);
        const day = createDayCode(birthDate.getDate(), input.gender);

        const partial =
          createSurnameCode(input.surname) +
          createNameCode(input.name) +
          year +
          month +
          day +
          resolvePlaceCode(normalizedPlace, placeCodeMap);

        return partial + calculateControlCharacter(partial);
      }),
    );
  }

  decode(cf: string): Observable<CodiceFiscaleDecoded> {
    return this.placeCodeMap$.pipe(map((placeCodeMap) => decodeFiscalCode(cf, placeCodeMap)));
  }
}
