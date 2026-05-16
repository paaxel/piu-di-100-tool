import { Component, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { SeoService } from '../../../core/services/seo';
import { ImageProcessorService } from '../../../core/services/image-processor';

type OutputFormat = 'image/png' | 'image/jpeg';

@Component({
  selector: 'app-webp-converter',
  standalone: false,
  templateUrl: './webp-converter.html',
})
export class WebpConverter implements OnDestroy {
  inputPreview: SafeUrl | null = null;
  outputPreview: SafeUrl | null = null;
  inputSize = 0;
  outputSize = 0;
  inputName = '';
  format: OutputFormat = 'image/png';
  quality = 85;
  error = '';
  hasOutput = false;

  private image: HTMLImageElement | null = null;
  private blobUrl = '';

  constructor(private images: ImageProcessorService, private cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set(
      'Converti WebP in PNG o JPG',
      'Converti immagini WebP in PNG o JPG online. Gratuito, 100% nel browser.',
    );
  }

  ngOnDestroy(): void {
    this.images.revoke(this.blobUrl);
  }

  get savingsPct(): number {
    if (!this.inputSize || !this.outputSize) return 0;
    return Math.round((1 - this.outputSize / this.inputSize) * 100);
  }

  get outputExt(): string {
    return this.images.extensionFor(this.format) || '.png';
  }

  async onFile(file: File): Promise<void> {
    const loaded = await this.images.load(file, 'image/webp');
    if (!loaded) {
      this.reset();
      this.error = 'FORMAT';
      return;
    }
    this.error = '';
    this.image = loaded.image;
    this.inputName = loaded.baseName;
    this.inputSize = loaded.size;
    this.inputPreview = loaded.preview;
    this.cdr.detectChanges();
    this.convert();
  }

  async convert(): Promise<void> {
    if (!this.image) return;
    const blob = await this.images.render(this.image, {
      format: this.format,
      quality: this.quality / 100,
    });
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
    this.images.download(this.blobUrl, `${this.inputName}${this.outputExt}`);
  }

  reset(): void {
    this.images.revoke(this.blobUrl);
    this.blobUrl = '';
    this.image = null;
    this.inputPreview = null;
    this.outputPreview = null;
    this.inputSize = 0;
    this.outputSize = 0;
    this.hasOutput = false;
    this.error = '';
  }
}
