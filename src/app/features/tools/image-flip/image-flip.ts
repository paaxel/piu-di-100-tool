import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { SeoService } from '../../../core/services/seo';
import { ImageProcessorService } from '../../../core/services/image-processor';

@Component({
  selector: 'app-image-flip',
  standalone: false,
  templateUrl: './image-flip.html',
})
export class ImageFlip implements OnDestroy {
  inputPreview: SafeUrl | null = null;
  outputPreview: SafeUrl | null = null;
  inputName = '';
  flipH = true;
  flipV = false;
  error = '';

  private image: HTMLImageElement | null = null;
  private blobUrl = '';

  constructor(private readonly images: ImageProcessorService, private readonly cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('Ribalta Immagine', 'Ribalta immagini orizzontalmente e verticalmente in locale nel browser.');
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
    await this.flip();
  }

  async flip(): Promise<void> {
    if (!this.image) return;

    const w = this.image.naturalWidth;
    const h = this.image.naturalHeight;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.error = 'Canvas non disponibile.';
      return;
    }

    ctx.save();
    ctx.translate(this.flipH ? w : 0, this.flipV ? h : 0);
    ctx.scale(this.flipH ? -1 : 1, this.flipV ? -1 : 1);
    ctx.drawImage(this.image, 0, 0, w, h);
    ctx.restore();

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
    this.images.download(this.blobUrl, `${this.inputName || 'image'}_flipped.png`);
  }
}
