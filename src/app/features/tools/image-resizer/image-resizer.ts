import { Component, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { SeoService } from '../../../core/services/seo';
import { ImageProcessorService } from '../../../core/services/image-processor';

type OutputFormat = 'image/webp' | 'image/png' | 'image/jpeg';

@Component({
  selector: 'app-image-resizer',
  standalone: false,
  templateUrl: './image-resizer.html',
})
export class ImageResizer implements OnDestroy {
  inputPreview: SafeUrl | null = null;
  outputPreview: SafeUrl | null = null;
  inputSize = 0;
  outputSize = 0;
  inputName = '';
  origWidth = 0;
  origHeight = 0;
  width = 0;
  height = 0;
  keepRatio = true;
  format: OutputFormat = 'image/webp';
  quality = 85;
  error = '';
  hasOutput = false;

  private image: HTMLImageElement | null = null;
  private blobUrl = '';
  private ratio = 1;

  constructor(private images: ImageProcessorService, private cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set(
      'Ridimensiona Immagine',
      'Ridimensiona e converti immagini online. Imposta larghezza e altezza personalizzate, mantieni le proporzioni. Gratuito, nel browser.',
    );
  }

  ngOnDestroy(): void {
    this.images.revoke(this.blobUrl);
  }

  get outputExt(): string {
    return this.images.extensionFor(this.format) || '.webp';
  }

  async onFile(file: File): Promise<void> {
    if (!file.type.startsWith('image/')) {
      this.reset();
      this.error = 'FORMAT';
      return;
    }
    const loaded = await this.images.load(file);
    if (!loaded) {
      this.error = 'FORMAT';
      return;
    }
    this.error = '';
    this.image = loaded.image;
    this.inputName = loaded.baseName;
    this.inputSize = loaded.size;
    this.inputPreview = loaded.preview;
    this.origWidth = loaded.image.naturalWidth;
    this.origHeight = loaded.image.naturalHeight;
    this.width = this.origWidth;
    this.height = this.origHeight;
    this.ratio = this.origWidth / this.origHeight;
    this.hasOutput = false;
    this.outputPreview = null;
    this.images.revoke(this.blobUrl);
    this.blobUrl = '';
    this.cdr.detectChanges();
  }

  onWidthChange(): void {
    if (this.keepRatio && this.ratio) {
      this.height = Math.max(1, Math.round(this.width / this.ratio));
    }
  }

  onHeightChange(): void {
    if (this.keepRatio && this.ratio) {
      this.width = Math.max(1, Math.round(this.height * this.ratio));
    }
  }

  async resize(): Promise<void> {
    if (!this.image || !this.width || !this.height) return;
    const blob = await this.images.render(
      this.image,
      { format: this.format, quality: this.quality / 100 },
      this.width,
      this.height,
    );
    this.images.revoke(this.blobUrl);
    const { url, safeUrl } = this.images.toPreview(blob);
    this.blobUrl = url;
    this.outputPreview = safeUrl;
    this.outputSize = blob.size;
    this.hasOutput = true;
    this.cdr.detectChanges();
  }

  download(): void {
    if (!this.blobUrl) return;
    this.images.download(this.blobUrl, `${this.inputName}_${this.width}x${this.height}${this.outputExt}`);
  }

  reset(): void {
    this.images.revoke(this.blobUrl);
    this.blobUrl = '';
    this.image = null;
    this.inputPreview = null;
    this.outputPreview = null;
    this.inputSize = 0;
    this.outputSize = 0;
    this.origWidth = 0;
    this.origHeight = 0;
    this.width = 0;
    this.height = 0;
    this.hasOutput = false;
    this.error = '';
  }
}
