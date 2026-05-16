import { ChangeDetectorRef, Component } from '@angular/core';
import { SeoService } from '../../../core/services/seo';
import { generateUlid, generateUuidV4, IdType } from '../../../packages/toolkit/uuid-utils';

@Component({
  selector: 'app-uuid-generator',
  standalone: false,
  templateUrl: './uuid-generator.html',
  styleUrl: './uuid-generator.scss',
})
export class UuidGenerator {
  type: IdType = 'uuid';
  count = 5;
  results: string[] = [];
  copied: string | null = null;
  copiedAll = false;

  constructor(private cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set(
      'Generatore UUID / ULID',
      'Genera identificatori univoci UUID v4 e ULID crittograficamente sicuri. Strumento online gratuito.',
    );
    this.generate();
  }

  generate(): void {
    const n = Math.min(100, Math.max(1, Math.round(this.count) || 1));
    this.count = n;
    this.results = Array.from({ length: n }, () =>
      this.type === 'uuid' ? generateUuidV4() : generateUlid(),
    );
    this.copied = null;
    this.copiedAll = false;
  }

  copyOne(value: string): void {
    navigator.clipboard?.writeText(value).catch(() => undefined);
    this.copied = value;
    this.copiedAll = false;
    this.cdr.detectChanges();
    setTimeout(() => {
      if (this.copied === value) this.copied = null;
      this.cdr.detectChanges();
    }, 1500);
  }

  copyAll(): void {
    navigator.clipboard?.writeText(this.results.join('\n')).catch(() => undefined);
    this.copiedAll = true;
    this.copied = null;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.copiedAll = false;
      this.cdr.detectChanges();
    }, 1500);
  }

  onCountChange(): void {
    this.generate();
  }

  onTypeChange(): void {
    this.generate();
  }
}
