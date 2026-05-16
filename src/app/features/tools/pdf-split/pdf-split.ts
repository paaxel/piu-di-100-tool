import { ChangeDetectorRef, Component } from '@angular/core';
import { SeoService } from '../../../core/services/seo';
import { PdfProcessorService } from '../../../core/services/pdf-processor';

interface SplitPage {
  index: number;
  bytes: Uint8Array;
  thumb: string;
}

@Component({
  selector: 'app-pdf-split',
  standalone: false,
  templateUrl: './pdf-split.html',
})
export class PdfSplit {
  pages: SplitPage[] = [];
  processing = false;
  error = '';
  fileName = '';
  previewSrc = '';
  previewLoading = false;
  private currentFile: File | null = null;

  constructor(private readonly cdr: ChangeDetectorRef, private readonly pdf: PdfProcessorService, seo: SeoService) {
    seo.set('Dividi PDF', 'Dividi un PDF in pagine singole nel browser. Senza upload, senza servizi esterni.');
  }

  async onFile(file: File): Promise<void> {
    this.currentFile = file;
    this.processing = true;
    this.error = '';
    this.pages = [];
    this.fileName = file.name.replace(/\.pdf$/i, '');
    this.cdr.detectChanges();
    try {
      const results = await this.pdf.split(file);
      this.pages = results.map((bytes, index) => ({ index, bytes, thumb: '' }));
    } catch {
      this.error = 'TOOLS.PDF_SPLIT.ERROR';
    } finally {
      this.processing = false;
      this.cdr.detectChanges();
    }
    if (this.pages.length > 0) {
      this.loadThumbs(file);
    }
  }

  private async loadThumbs(file: File): Promise<void> {
    for await (const { pageIndex, thumb } of this.pdf.thumbnailGenerator(file)) {
      if (file !== this.currentFile || pageIndex >= this.pages.length) break;
      this.pages[pageIndex].thumb = thumb;
      this.cdr.markForCheck();
    }
  }

  downloadPage(page: SplitPage): void {
    this.pdf.download(page.bytes, `${this.fileName}_pagina_${page.index + 1}.pdf`);
  }

  downloadAll(): void {
    this.pages.forEach(p => this.downloadPage(p));
  }

  async openPreview(pageIndex: number): Promise<void> {
    if (!this.currentFile) return;
    this.previewLoading = true;
    this.previewSrc = '';
    try {
      this.previewSrc = await this.pdf.renderThumbnail(this.currentFile, pageIndex, 1.5);
    } catch { /* ignore */ }
    this.previewLoading = false;
    this.cdr.markForCheck();
  }

  closePreview(): void {
    this.previewSrc = '';
    this.previewLoading = false;
  }

  reset(): void {
    this.currentFile = null;
    this.pages = [];
    this.error = '';
    this.fileName = '';
    this.previewSrc = '';
    this.previewLoading = false;
    this.cdr.detectChanges();
  }
}
