import { ChangeDetectorRef, Component } from '@angular/core';
import { SeoService } from '../../../core/services/seo';
import { PdfProcessorService } from '../../../core/services/pdf-processor';

@Component({
  selector: 'app-pdf-rotate',
  standalone: false,
  templateUrl: './pdf-rotate.html',
})
export class PdfRotate {
  file: File | null = null;
  pageCount = 0;
  angle = 90;
  applyTo: 'all' | 'range' = 'all';
  pageRange = '';
  processing = false;
  error = '';

  constructor(private readonly cdr: ChangeDetectorRef, private readonly pdf: PdfProcessorService, seo: SeoService) {
    seo.set('Ruota PDF', 'Ruota le pagine di un PDF di 90°, 180° o 270°. Tutto nel browser, senza upload.');
  }

  async onFile(file: File): Promise<void> {
    this.file = file;
    this.error = '';
    try {
      this.pageCount = await this.pdf.getPageCount(file);
    } catch {
      this.error = 'TOOLS.PDF_ROTATE.ERROR_READ';
      this.file = null;
    }
    this.cdr.detectChanges();
  }

  async rotate(): Promise<void> {
    if (!this.file) return;
    this.processing = true;
    this.error = '';
    this.cdr.detectChanges();
    try {
      let indices: number[] | null = null;
      if (this.applyTo === 'range' && this.pageRange.trim()) {
        indices = this.pdf.parsePageRange(this.pageRange, this.pageCount);
        if (indices.length === 0) {
          this.error = 'TOOLS.PDF_ROTATE.ERROR_INVALID_RANGE';
          return;
        }
      }
      const bytes = await this.pdf.rotate(this.file, this.angle, indices);
      const name = this.file.name.replace(/\.pdf$/i, `-rotated${this.angle}.pdf`);
      this.pdf.download(bytes, name);
    } catch {
      this.error = 'TOOLS.PDF_ROTATE.ERROR';
    } finally {
      this.processing = false;
      this.cdr.detectChanges();
    }
  }

  reset(): void {
    this.file = null;
    this.pageCount = 0;
    this.angle = 90;
    this.applyTo = 'all';
    this.pageRange = '';
    this.error = '';
    this.cdr.detectChanges();
  }
}
