import { ChangeDetectorRef, Component } from '@angular/core';
import { SeoService } from '../../../core/services/seo';
import { PdfProcessorService } from '../../../core/services/pdf-processor';

@Component({
  selector: 'app-pdf-extract',
  standalone: false,
  templateUrl: './pdf-extract.html',
})
export class PdfExtract {
  file: File | null = null;
  pageCount = 0;
  pageRange = '';
  processing = false;
  error = '';

  constructor(private readonly cdr: ChangeDetectorRef, private readonly pdf: PdfProcessorService, seo: SeoService) {
    seo.set('Estrai Pagine PDF', 'Estrai pagine specifiche da un PDF. Specifica un intervallo e scarica il risultato.');
  }

  async onFile(file: File): Promise<void> {
    this.file = file;
    this.error = '';
    this.pageRange = '';
    try {
      this.pageCount = await this.pdf.getPageCount(file);
    } catch {
      this.error = 'TOOLS.PDF_EXTRACT.ERROR_READ';
      this.file = null;
    }
    this.cdr.detectChanges();
  }

  async extract(): Promise<void> {
    if (!this.file || !this.pageRange.trim()) return;
    const indices = this.pdf.parsePageRange(this.pageRange, this.pageCount);
    if (indices.length === 0) {
      this.error = 'TOOLS.PDF_EXTRACT.ERROR_INVALID_RANGE';
      this.cdr.detectChanges();
      return;
    }
    this.processing = true;
    this.error = '';
    this.cdr.detectChanges();
    try {
      const bytes = await this.pdf.extract(this.file, indices);
      const name = this.file.name.replace(/\.pdf$/i, '-extracted.pdf');
      this.pdf.download(bytes, name);
    } catch {
      this.error = 'TOOLS.PDF_EXTRACT.ERROR';
    } finally {
      this.processing = false;
      this.cdr.detectChanges();
    }
  }

  reset(): void {
    this.file = null;
    this.pageCount = 0;
    this.pageRange = '';
    this.error = '';
    this.cdr.detectChanges();
  }
}
