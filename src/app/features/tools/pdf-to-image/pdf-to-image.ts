import { ChangeDetectorRef, Component } from '@angular/core';
import { SeoService } from '../../../core/services/seo';
import { PdfProcessorService } from '../../../core/services/pdf-processor';

@Component({
  selector: 'app-pdf-to-image',
  standalone: false,
  templateUrl: './pdf-to-image.html',
})
export class PdfToImage {
  images: string[] = [];
  scale = 2;
  processing = false;
  error = '';
  private fileName = '';

  constructor(private readonly cdr: ChangeDetectorRef, private readonly pdf: PdfProcessorService, seo: SeoService) {
    seo.set('PDF in Immagini', 'Converti ogni pagina di un PDF in un\'immagine PNG. Tutto nel browser.');
  }

  async onFile(file: File): Promise<void> {
    this.processing = true;
    this.error = '';
    this.images = [];
    this.fileName = file.name.replace(/\.pdf$/i, '');
    this.cdr.detectChanges();
    try {
      this.images = await this.pdf.pdfToImages(file, this.scale);
    } catch {
      this.error = 'TOOLS.PDF_TO_IMAGE.ERROR';
    } finally {
      this.processing = false;
      this.cdr.detectChanges();
    }
  }

  downloadImage(dataUrl: string, index: number): void {
    this.pdf.downloadImage(dataUrl, `${this.fileName}_pagina_${index + 1}.png`);
  }

  downloadAll(): void {
    this.images.forEach((img, i) => this.downloadImage(img, i));
  }

  reset(): void {
    this.images = [];
    this.error = '';
    this.fileName = '';
    this.cdr.detectChanges();
  }
}
