import { Component, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { SeoService } from '../../../core/services/seo';
import { ImageProcessorService } from '../../../core/services/image-processor';

const FAVICON_SIZES = [16, 32, 48] as const;
type FaviconSize = (typeof FAVICON_SIZES)[number];

@Component({
  selector: 'app-favicon-generator',
  standalone: false,
  templateUrl: './favicon-generator.html',
})
export class FaviconGenerator implements OnDestroy {
  inputPreview: SafeUrl | null = null;
  inputSize = 0;
  inputName = '';
  error = '';
  hasOutput = false;
  previews: Array<{ size: FaviconSize; safeUrl: SafeUrl }> = [];

  private image: HTMLImageElement | null = null;
  private blobUrl = '';
  private previewUrls: string[] = [];

  constructor(
    private images: ImageProcessorService,
    private cdr: ChangeDetectorRef,
    seo: SeoService,
  ) {
    seo.set(
      'Favicon Generator',
      'Generate a favicon.ico from any image. Creates a multi-size ICO file (16×16, 32×32, 48×48) locally in your browser.',
    );
  }

  ngOnDestroy(): void {
    this.revokeAll();
  }

  async onFile(file: File): Promise<void> {
    if (!file.type.startsWith('image/')) {
      this.reset();
      this.error = 'FORMAT';
      return;
    }
    const loaded = await this.images.load(file);
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
    this.revokeAll();
    this.hasOutput = false;
    this.previews = [];
    this.cdr.detectChanges();
    await this.generate();
  }

  async generate(): Promise<void> {
    if (!this.image) return;

    const blobs: Blob[] = [];
    const previewEntries: Array<{ size: FaviconSize; safeUrl: SafeUrl }> = [];

    for (const size of FAVICON_SIZES) {
      const blob = await this.images.render(this.image, { format: 'image/png' }, size, size);
      blobs.push(blob);
      const { url, safeUrl } = this.images.toPreview(blob);
      this.previewUrls.push(url);
      previewEntries.push({ size, safeUrl });
    }

    const ico = await this.buildIco(blobs, [...FAVICON_SIZES]);
    this.images.revoke(this.blobUrl);
    const { url } = this.images.toPreview(ico);
    this.blobUrl = url;
    this.previews = previewEntries;
    this.hasOutput = true;
    this.cdr.detectChanges();
  }

  private async buildIco(blobs: Blob[], sizes: number[]): Promise<Blob> {
    const buffers = await Promise.all(blobs.map((b) => b.arrayBuffer()));
    const headerSize = 6 + sizes.length * 16;
    let totalSize = headerSize;
    for (const buf of buffers) totalSize += buf.byteLength;

    const data = new Uint8Array(totalSize);
    const view = new DataView(data.buffer);

    // ICONDIR header
    view.setUint16(0, 0, true);            // reserved
    view.setUint16(2, 1, true);            // type = 1 (ICO)
    view.setUint16(4, sizes.length, true); // image count

    let offset = headerSize;
    for (let i = 0; i < sizes.length; i++) {
      const buf = buffers[i];
      const w = sizes[i];
      const e = 6 + i * 16;

      data[e + 0] = w >= 256 ? 0 : w; // width  (0 means 256)
      data[e + 1] = w >= 256 ? 0 : w; // height (0 means 256)
      data[e + 2] = 0;                 // color count (0 = no palette)
      data[e + 3] = 0;                 // reserved
      view.setUint16(e + 4, 1, true);  // planes
      view.setUint16(e + 6, 32, true); // bit count
      view.setUint32(e + 8, buf.byteLength, true); // data size in bytes
      view.setUint32(e + 12, offset, true);         // offset from file start

      data.set(new Uint8Array(buf), offset);
      offset += buf.byteLength;
    }

    return new Blob([data], { type: 'image/x-icon' });
  }

  download(): void {
    if (!this.blobUrl) return;
    this.images.download(this.blobUrl, `${this.inputName || 'favicon'}.ico`);
  }

  reset(): void {
    this.revokeAll();
    this.image = null;
    this.inputPreview = null;
    this.inputSize = 0;
    this.hasOutput = false;
    this.previews = [];
    this.error = '';
  }

  private revokeAll(): void {
    this.images.revoke(this.blobUrl);
    this.blobUrl = '';
    for (const url of this.previewUrls) this.images.revoke(url);
    this.previewUrls = [];
  }
}
