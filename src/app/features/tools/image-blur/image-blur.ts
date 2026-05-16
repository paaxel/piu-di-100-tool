import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { SeoService } from '../../../core/services/seo';
import { ImageProcessorService } from '../../../core/services/image-processor';

@Component({
  selector: 'app-image-blur',
  standalone: false,
  templateUrl: './image-blur.html',
})
export class ImageBlur implements OnDestroy {
  inputPreview: SafeUrl | null = null;
  outputPreview: SafeUrl | null = null;
  inputName = '';
  radius = 5;
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
    seo.set('Sfoca Immagine', 'Applica un effetto blur a un immagine con controllo del raggio. Download PNG nel browser, gratis.');
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

  onRadiusChange(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(() => this.apply());
  }

  async apply(): Promise<void> {
    if (!this.image) return;
    const img = this.image;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const r = Math.max(0, Math.round(this.radius));
    const pad = r * 2;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.filter = `blur(${r}px)`;
    // Draw oversized so blur does not fade at the edges
    ctx.drawImage(img, -pad, -pad, w + pad * 2, h + pad * 2);
    ctx.filter = 'none';

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
    this.images.download(this.blobUrl, `${this.inputName || 'image'}_blur_${this.radius}px.png`);
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
