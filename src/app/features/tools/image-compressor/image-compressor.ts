import { Component, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { SeoService } from '../../../core/services/seo';
import { ImageProcessorService } from '../../../core/services/image-processor';

type OutputFormat = 'image/webp' | 'image/jpeg';

@Component({
  selector: 'app-image-compressor',
  standalone: false,
  templateUrl: './image-compressor.html',
})
export class ImageCompressor implements OnDestroy {
  inputPreview: SafeUrl | null = null;
  outputPreview: SafeUrl | null = null;
  inputSize = 0;
  outputSize = 0;
  inputName = '';
  format: OutputFormat = 'image/webp';
  quality = 75;
  error = '';
  hasOutput = false;

  private image: HTMLImageElement | null = null;
  private blobUrl = '';
  private rafId = 0;

  constructor(private images: ImageProcessorService, private cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set(
      'Comprimi Immagine',
      'Comprimi immagini online con controllo qualità in tempo reale. Vedi subito la riduzione delle dimensioni. Gratuito, nel browser.',
    );
  }

  ngOnDestroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.images.revoke(this.blobUrl);
  }

  get savingsPct(): number {
    if (!this.inputSize || !this.outputSize) return 0;
    return Math.round((1 - this.outputSize / this.inputSize) * 100);
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
    this.cdr.detectChanges();
    this.compress();
  }

  onQualityChange(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(() => this.compress());
  }

  async compress(): Promise<void> {
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
    this.images.download(this.blobUrl, `${this.inputName}_compressed${this.outputExt}`);
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
