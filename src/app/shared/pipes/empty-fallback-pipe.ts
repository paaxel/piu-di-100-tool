import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'emptyFallback',
  standalone: false,
})
export class EmptyFallbackPipe implements PipeTransform {
  transform(value: unknown, fallback = '-'): string {
    if (value === null || value === undefined) {
      return fallback;
    }

    const normalized = String(value).trim();
    return normalized ? normalized : fallback;
  }
}
