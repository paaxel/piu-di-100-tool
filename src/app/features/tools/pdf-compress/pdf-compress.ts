import { ChangeDetectorRef, Component } from '@angular/core';
import { SeoService } from '../../../core/services/seo';
import { PdfProcessorService } from '../../../core/services/pdf-processor';

@Component({
  selector: 'app-pdf-compress',
  standalone: false,
  templateUrl: './pdf-compress.html',
})
export class PdfCompress {
  file: File | null = null;
  originalSize = 0;
  compressedSize = 0;
  processing = false;
  done = false;
  error = '';
  private compressedBytes: Uint8Array | null = null;

  constructor(private readonly cdr: ChangeDetectorRef, private readonly pdf: PdfProcessorService, seo: SeoService) {
    seo.set('Comprimi PDF', 'Riduci le dimensioni di un PDF ottimizzando la struttura interna. Tutto nel browser.');
  }

  async onFile(file: File): Promise<void> {
    this.file = file;
    this.originalSize = file.size;
    this.done = false;
    this.error = '';
    this.compressedBytes = null;
    this.processing = true;
    this.cdr.detectChanges();
    try {
      this.compressedBytes = await this.pdf.compress(file);
      this.compressedSize = this.compressedBytes.length;
      this.done = true;
    } catch {
      this.error = 'TOOLS.PDF_COMPRESS.ERROR';
    } finally {
      this.processing = false;
      this.cdr.detectChanges();
    }
  }

  get savingsPct(): number {
    if (!this.originalSize || !this.compressedSize) return 0;
    return Math.round((1 - this.compressedSize / this.originalSize) * 100);
  }

  download(): void {
    if (!this.compressedBytes || !this.file) return;
    const name = this.file.name.replace(/\.pdf$/i, '-compressed.pdf');
    this.pdf.download(this.compressedBytes, name);
  }

  reset(): void {
    this.file = null;
    this.originalSize = 0;
    this.compressedSize = 0;
    this.done = false;
    this.error = '';
    this.compressedBytes = null;
    this.cdr.detectChanges();
  }
}
