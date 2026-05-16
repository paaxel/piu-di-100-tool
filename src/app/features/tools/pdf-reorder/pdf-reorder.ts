import { ChangeDetectorRef, Component } from '@angular/core';
import { SeoService } from '../../../core/services/seo';
import { PdfProcessorService } from '../../../core/services/pdf-processor';

interface PageItem {
  originalIndex: number;
  label: string;
  thumb: string;
}

@Component({
  selector: 'app-pdf-reorder',
  standalone: false,
  templateUrl: './pdf-reorder.html',
})
export class PdfReorder {
  file: File | null = null;
  pages: PageItem[] = [];
  processing = false;
  error = '';
  previewSrc = '';
  previewLoading = false;

  constructor(private readonly cdr: ChangeDetectorRef, private readonly pdf: PdfProcessorService, seo: SeoService) {
    seo.set('Riordina Pagine PDF', 'Riordina le pagine di un PDF con semplici frecce. Nel browser, senza upload.');
  }

  async onFile(file: File): Promise<void> {
    this.file = file;
    this.error = '';
    this.pages = [];
    try {
      const count = await this.pdf.getPageCount(file);
      this.pages = Array.from({ length: count }, (_, i) => ({
        originalIndex: i,
        label: `Pagina ${i + 1}`,
        thumb: '',
      }));
      this.cdr.detectChanges();
      this.loadPageThumbs(file);
    } catch {
      this.error = 'TOOLS.PDF_REORDER.ERROR_READ';
      this.file = null;
      this.cdr.detectChanges();
    }
  }

  private async loadPageThumbs(file: File): Promise<void> {
    for await (const { pageIndex, thumb } of this.pdf.thumbnailGenerator(file)) {
      const item = this.pages.find(p => p.originalIndex === pageIndex);
      if (!item) break;
      item.thumb = thumb;
      this.cdr.markForCheck();
    }
  }

  moveUp(index: number): void {
    if (index === 0) return;
    [this.pages[index - 1], this.pages[index]] = [this.pages[index], this.pages[index - 1]];
    this.cdr.detectChanges();
  }

  moveDown(index: number): void {
    if (index >= this.pages.length - 1) return;
    [this.pages[index], this.pages[index + 1]] = [this.pages[index + 1], this.pages[index]];
    this.cdr.detectChanges();
  }

  async save(): Promise<void> {
    if (!this.file) return;
    this.processing = true;
    this.error = '';
    this.cdr.detectChanges();
    try {
      const newOrder = this.pages.map(p => p.originalIndex);
      const bytes = await this.pdf.reorder(this.file, newOrder);
      const name = this.file.name.replace(/\.pdf$/i, '-reordered.pdf');
      this.pdf.download(bytes, name);
    } catch {
      this.error = 'TOOLS.PDF_REORDER.ERROR';
    } finally {
      this.processing = false;
      this.cdr.detectChanges();
    }
  }

  async openPreview(pageIndex: number): Promise<void> {
    if (!this.file) return;
    this.previewLoading = true;
    this.previewSrc = '';
    try {
      this.previewSrc = await this.pdf.renderThumbnail(this.file, pageIndex, 1.5);
    } catch { /* ignore */ }
    this.previewLoading = false;
    this.cdr.markForCheck();
  }

  closePreview(): void {
    this.previewSrc = '';
    this.previewLoading = false;
  }

  reset(): void {
    this.file = null;
    this.pages = [];
    this.error = '';
    this.previewSrc = '';
    this.previewLoading = false;
    this.cdr.detectChanges();
  }
}
