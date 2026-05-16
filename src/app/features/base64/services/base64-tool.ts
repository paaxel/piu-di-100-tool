import { Injectable } from '@angular/core';
import { decodeBase64, encodeBase64 } from '../../../packages/toolkit/base64-utils';

@Injectable({
  providedIn: 'root',
})
export class Base64Tool {
  encode(value: string): string {
    return encodeBase64(value);
  }

  decode(value: string): string {
    return decodeBase64(value);
  }
}
