import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { SeoService } from '../../../core/services/seo';
import { ImageProcessorService } from '../../../core/services/image-processor';

type WatermarkPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

@Component({
  selector: 'app-image-watermark',
  standalone: false,
  templateUrl: './image-watermark.html',
})
export class ImageWatermark implements OnDestroy {
  inputPreview: SafeUrl | null = null;
  outputPreview: SafeUrl | null = null;
  inputName = '';

  text = '© My Brand';
  color = '#ffffff';
  opacity = 0.65;
  fontSize = 32;
  position: WatermarkPosition = 'bottom-right';
  padding = 24;

  error = '';

  private image: HTMLImageElement | null = null;
  private blobUrl = '';

  constructor(private readonly images: ImageProcessorService, private readonly cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('Aggiungi Watermark a Immagine', 'Inserisci watermark testuale su immagini in locale, senza upload server.');
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
    await this.apply();
  }

  async apply(): Promise<void> {
    if (!this.image) return;
    const canvas = document.createElement('canvas');
    canvas.width = this.image.naturalWidth;
    canvas.height = this.image.naturalHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.error = 'Canvas non disponibile.';
      return;
    }

    ctx.drawImage(this.image, 0, 0);
    ctx.save();
    const opacity = Number(this.opacity);
    ctx.globalAlpha = Math.max(0, Math.min(1, Number.isFinite(opacity) ? opacity : 0.65));
    ctx.fillStyle = this.color;
    const fontSize = Number(this.fontSize);
    ctx.font = `${Math.max(8, Number.isFinite(fontSize) ? fontSize : 32)}px sans-serif`;

    const text = this.text || '';
    const metrics = ctx.measureText(text);
    const textW = metrics.width;
    const textH = Math.max(12, Number.isFinite(fontSize) ? fontSize : 32);

    const padding = Number(this.padding);
    const p = Math.max(0, Number.isFinite(padding) ? padding : 24);
    let x = p;
    let y = textH + p;

    if (this.position === 'top-right') {
      x = canvas.width - textW - p;
      y = textH + p;
    } else if (this.position === 'bottom-left') {
      x = p;
      y = canvas.height - p;
    } else if (this.position === 'bottom-right') {
      x = canvas.width - textW - p;
      y = canvas.height - p;
    } else if (this.position === 'center') {
      x = (canvas.width - textW) / 2;
      y = (canvas.height + textH / 2) / 2;
    }

    ctx.fillText(text, x, y);
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
    this.images.download(this.blobUrl, `${this.inputName || 'image'}_watermarked.png`);
  }
}
