import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { SeoService } from '../../../core/services/seo';
import { ImageProcessorService } from '../../../core/services/image-processor';

@Component({
  selector: 'app-image-rotate',
  standalone: false,
  templateUrl: './image-rotate.html',
})
export class ImageRotate implements OnDestroy {
  inputPreview: SafeUrl | null = null;
  outputPreview: SafeUrl | null = null;
  inputName = '';
  angle = 90;
  error = '';

  private image: HTMLImageElement | null = null;
  private blobUrl = '';

  constructor(private readonly images: ImageProcessorService, private readonly cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('Ruota Immagine', 'Ruota immagini online di qualsiasi angolo mantenendo l anteprima in tempo reale.');
  }

  ngOnDestroy(): void {
    this.images.revoke(this.blobUrl);
  }

  async onFile(file: File): Promise<void> {
    const loaded = await this.images.load(file, 'image/*');
    if (!loaded) {
      this.error = 'Formato non valido.';
      return;
    }
    this.error = '';
    this.image = loaded.image;
    this.inputName = loaded.baseName;
    this.inputPreview = loaded.preview;
    await this.rotate();
  }

  async rotate(): Promise<void> {
    if (!this.image) return;

    const rad = (Number(this.angle) || 0) * Math.PI / 180;
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));
    const w = this.image.naturalWidth;
    const h = this.image.naturalHeight;
    const outW = Math.max(1, Math.round(w * cos + h * sin));
    const outH = Math.max(1, Math.round(w * sin + h * cos));

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.error = 'Canvas non disponibile.';
      return;
    }

    ctx.translate(outW / 2, outH / 2);
    ctx.rotate(rad);
    ctx.drawImage(this.image, -w / 2, -h / 2);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (!b) {
          reject(new Error('toBlob fallita'));
          return;
        }
        resolve(b);
      }, 'image/png');
    });

    this.images.revoke(this.blobUrl);
    const { url, safeUrl } = this.images.toPreview(blob);
    this.blobUrl = url;
    this.outputPreview = safeUrl;
    this.cdr.detectChanges();
  }

  download(): void {
    if (!this.blobUrl) return;
    this.images.download(this.blobUrl, `${this.inputName || 'image'}_rotated.png`);
  }
}
