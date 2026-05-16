import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { SeoService } from '../../../core/services/seo';
import { ImageProcessorService } from '../../../core/services/image-processor';

@Component({
  selector: 'app-image-pixelate',
  standalone: false,
  templateUrl: './image-pixelate.html',
})
export class ImagePixelate implements OnDestroy {
  inputPreview: SafeUrl | null = null;
  outputPreview: SafeUrl | null = null;
  inputName = '';
  blockSize = 10;
  error = '';
  hasOutput = false;

  private image: HTMLImageElement | null = null;
  private blobUrl = '';
  private rafId = 0;

  constructor(
    private readonly images: ImageProcessorService,
    private readonly cdr: ChangeDetectorRef,
    seo: SeoService,
  ) {
    seo.set('Pixelate Immagine', 'Applica un effetto pixelato a un immagine con controllo della dimensione dei blocchi. Gratis nel browser.');
  }

  ngOnDestroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
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
    this.cdr.detectChanges();
    await this.apply();
  }

  onBlockSizeChange(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(() => this.apply());
  }

  async apply(): Promise<void> {
    if (!this.image) return;
    const img = this.image;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const bs = Math.max(1, Math.round(this.blockSize));

    // Step 1: draw at low resolution (one pixel per block)
    const smallW = Math.max(1, Math.round(w / bs));
    const smallH = Math.max(1, Math.round(h / bs));
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = smallW;
    tempCanvas.height = smallH;
    const tCtx = tempCanvas.getContext('2d')!;
    tCtx.drawImage(img, 0, 0, smallW, smallH);

    // Step 2: scale back up without smoothing to get the pixel-block effect
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tempCanvas, 0, 0, smallW, smallH, 0, 0, w, h);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob null')), 'image/png');
    });

    this.images.revoke(this.blobUrl);
    const { url, safeUrl } = this.images.toPreview(blob);
    this.blobUrl = url;
    this.outputPreview = safeUrl;
    this.hasOutput = true;
    this.cdr.detectChanges();
  }

  download(): void {
    if (!this.blobUrl) return;
    this.images.download(this.blobUrl, `${this.inputName || 'image'}_pixelate_${this.blockSize}px.png`);
  }

  reset(): void {
    this.images.revoke(this.blobUrl);
    this.blobUrl = '';
    this.image = null;
    this.inputPreview = null;
    this.outputPreview = null;
    this.hasOutput = false;
    this.error = '';
  }
}
