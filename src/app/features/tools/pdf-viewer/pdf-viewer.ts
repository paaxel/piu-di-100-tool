import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { SeoService } from '../../../core/services/seo';
import { PdfProcessorService } from '../../../core/services/pdf-processor';

@Component({
  selector: 'app-pdf-viewer',
  standalone: false,
  templateUrl: './pdf-viewer.html',
})
export class PdfViewer implements OnDestroy {
  safeUrl: SafeResourceUrl | null = null;
  pageCount = 0;
  fileName = '';
  error = '';
  private blobUrl = '';

  constructor(private readonly cdr: ChangeDetectorRef, private readonly pdf: PdfProcessorService, seo: SeoService) {
    seo.set('Visualizza PDF', 'Visualizza file PDF direttamente nel browser senza installare nulla.');
  }

  ngOnDestroy(): void {
    this.pdf.revoke(this.blobUrl);
  }

  async onFile(file: File): Promise<void> {
    this.error = '';
    this.pdf.revoke(this.blobUrl);
    this.safeUrl = null;
    this.fileName = file.name;
    try {
      this.pageCount = await this.pdf.getPageCount(file);
      const bytes = await new Promise<Uint8Array>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
      });
      const { url, safeUrl } = this.pdf.toBlobUrl(bytes);
      this.blobUrl = url;
      this.safeUrl = safeUrl;
    } catch {
      this.error = 'TOOLS.PDF_VIEWER.ERROR';
    }
    this.cdr.detectChanges();
  }

  reset(): void {
    this.pdf.revoke(this.blobUrl);
    this.blobUrl = '';
    this.safeUrl = null;
    this.pageCount = 0;
    this.fileName = '';
    this.error = '';
    this.cdr.detectChanges();
  }
}
