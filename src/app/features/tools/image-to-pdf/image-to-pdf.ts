import { ChangeDetectorRef, Component } from '@angular/core';
import { SeoService } from '../../../core/services/seo';
import { PdfProcessorService } from '../../../core/services/pdf-processor';

interface ImageEntry {
  file: File;
  preview: string;
}

@Component({
  selector: 'app-image-to-pdf',
  standalone: false,
  templateUrl: './image-to-pdf.html',
})
export class ImageToPdf {
  images: ImageEntry[] = [];
  processing = false;
  error = '';

  constructor(private readonly cdr: ChangeDetectorRef, private readonly pdf: PdfProcessorService, seo: SeoService) {
    seo.set('Immagini in PDF', 'Converti una o più immagini in un PDF. Ogni immagine diventa una pagina.');
  }

  onFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    for (const file of Array.from(input.files)) {
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        this.images.push({ file, preview });
      }
    }
    input.value = '';
    this.cdr.detectChanges();
  }

  remove(index: number): void {
    URL.revokeObjectURL(this.images[index].preview);
    this.images.splice(index, 1);
    this.cdr.detectChanges();
  }

  moveUp(index: number): void {
    if (index === 0) return;
    [this.images[index - 1], this.images[index]] = [this.images[index], this.images[index - 1]];
    this.cdr.detectChanges();
  }

  moveDown(index: number): void {
    if (index >= this.images.length - 1) return;
    [this.images[index], this.images[index + 1]] = [this.images[index + 1], this.images[index]];
    this.cdr.detectChanges();
  }

  async convert(): Promise<void> {
    if (this.images.length === 0) return;
    this.processing = true;
    this.error = '';
    this.cdr.detectChanges();
    try {
      const bytes = await this.pdf.imagesToPdf(this.images.map(e => e.file));
      this.pdf.download(bytes, 'images.pdf');
    } catch {
      this.error = 'TOOLS.IMAGE_TO_PDF.ERROR';
    } finally {
      this.processing = false;
      this.cdr.detectChanges();
    }
  }

  reset(): void {
    this.images.forEach(e => URL.revokeObjectURL(e.preview));
    this.images = [];
    this.error = '';
    this.cdr.detectChanges();
  }
}
