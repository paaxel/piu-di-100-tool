import { ChangeDetectorRef, Component } from '@angular/core';
import { SeoService } from '../../../core/services/seo';
import { PdfProcessorService } from '../../../core/services/pdf-processor';

interface PdfEntry {
  file: File;
  thumb: string;
}

@Component({
  selector: 'app-pdf-merge',
  standalone: false,
  templateUrl: './pdf-merge.html',
})
export class PdfMerge {
  files: PdfEntry[] = [];
  processing = false;
  error = '';
  previewSrc = '';
  previewLoading = false;

  constructor(private readonly cdr: ChangeDetectorRef, private readonly pdf: PdfProcessorService, seo: SeoService) {
    seo.set('Unisci PDF', 'Unisci più file PDF in un unico documento. Tutto nel browser, senza upload.');
  }

  onFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    for (const file of Array.from(input.files)) {
      if (file.type === 'application/pdf') {
        const entry: PdfEntry = { file, thumb: '' };
        this.files.push(entry);
        this.loadThumb(entry);
      }
    }
    input.value = '';
    this.cdr.detectChanges();
  }

  private async loadThumb(entry: PdfEntry): Promise<void> {
    try {
      entry.thumb = await this.pdf.renderThumbnail(entry.file);
    } catch { /* silently ignore */ }
    this.cdr.markForCheck();
  }

  remove(index: number): void {
    this.files.splice(index, 1);
    this.cdr.detectChanges();
  }

  moveUp(index: number): void {
    if (index === 0) return;
    [this.files[index - 1], this.files[index]] = [this.files[index], this.files[index - 1]];
    this.cdr.detectChanges();
  }

  moveDown(index: number): void {
    if (index >= this.files.length - 1) return;
    [this.files[index], this.files[index + 1]] = [this.files[index + 1], this.files[index]];
    this.cdr.detectChanges();
  }

  async merge(): Promise<void> {
    if (this.files.length < 2) return;
    this.processing = true;
    this.error = '';
    this.cdr.detectChanges();
    try {
      const bytes = await this.pdf.merge(this.files.map(e => e.file));
      this.pdf.download(bytes, 'merged.pdf');
    } catch {
      this.error = 'TOOLS.PDF_MERGE.ERROR';
    } finally {
      this.processing = false;
      this.cdr.detectChanges();
    }
  }

  async openPreview(file: File, pageIndex: number): Promise<void> {
    this.previewLoading = true;
    this.previewSrc = '';
    try {
      this.previewSrc = await this.pdf.renderThumbnail(file, pageIndex, 1.5);
    } catch { /* ignore */ }
    this.previewLoading = false;
    this.cdr.markForCheck();
  }

  closePreview(): void {
    this.previewSrc = '';
    this.previewLoading = false;
  }

  reset(): void {
    this.files = [];
    this.error = '';
    this.previewSrc = '';
    this.previewLoading = false;
    this.cdr.detectChanges();
  }
}
