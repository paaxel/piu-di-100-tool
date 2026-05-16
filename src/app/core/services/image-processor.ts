import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

export interface LoadedImageData {
  file: File;
  baseName: string;
  size: number;
  dataUrl: string;
  preview: SafeUrl;
  image: HTMLImageElement;
}

export interface RenderToBlobOptions {
  format: string;
  /** Quality 0-1 — ignored for PNG. */
  quality?: number;
  /** When true paints a white background before drawing (use for JPEG). */
  fillWhiteBackground?: boolean;
}

/**
 * Centralises the shared logic of the image tools:
 *  - file selection & validation
 *  - reading file as data URL
 *  - decoding to HTMLImageElement
 *  - rendering an image to a Blob with a given canvas size and format
 *  - safe Blob URL management
 */
@Injectable({ providedIn: 'root' })
export class ImageProcessorService {
  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Reads a `File` selected through `<input type=file>` and returns a decoded image.
   * Returns `null` if `file` is missing or its MIME type doesn't match `accept`.
   * `accept` may be a regex (e.g. `/^image\/(jpeg|jpg)$/`) or an exact string
   * (e.g. `'image/png'`) or `'image/*'` (default).
   */
  load(file: File | null | undefined, accept: RegExp | string = 'image/*'): Promise<LoadedImageData | null> {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve(null);
        return;
      }
      const isValid =
        accept instanceof RegExp
          ? accept.test(file.type)
          : accept === 'image/*'
            ? file.type.startsWith('image/')
            : file.type === accept;
      if (!isValid) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error ?? new Error('FileReader error'));
      reader.onload = (ev) => {
        const dataUrl = ev.target!.result as string;
        const img = new Image();
        img.onerror = () => reject(new Error('Image decode failed'));
        img.onload = () => {
          resolve({
            file,
            baseName: file.name.replace(/\.[^.]+$/, ''),
            size: file.size,
            dataUrl,
            preview: this.sanitizer.bypassSecurityTrustUrl(dataUrl),
            image: img,
          });
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Renders the given image into a Blob using a canvas of the chosen dimensions.
   * Defaults to the image's natural size.
   */
  render(
    image: HTMLImageElement,
    options: RenderToBlobOptions,
    width: number = image.naturalWidth,
    height: number = image.naturalHeight,
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(width));
      canvas.height = Math.max(1, Math.round(height));
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }
      const fillWhite = options.fillWhiteBackground ?? options.format === 'image/jpeg';
      if (fillWhite) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const quality = options.format === 'image/png' ? undefined : options.quality;
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('canvas.toBlob returned null'));
            return;
          }
          resolve(blob);
        },
        options.format,
        quality,
      );
    });
  }

  /** Builds an object URL and a SafeUrl wrapper for a Blob. */
  toPreview(blob: Blob): { url: string; safeUrl: SafeUrl } {
    const url = URL.createObjectURL(blob);
    return { url, safeUrl: this.sanitizer.bypassSecurityTrustUrl(url) };
  }

  /** Triggers a browser download for the given object URL. */
  download(url: string, filename: string): void {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }

  /** Safe release for a previously created object URL. */
  revoke(url: string | null | undefined): void {
    if (url) URL.revokeObjectURL(url);
  }

  extensionFor(format: string): string {
    switch (format) {
      case 'image/jpeg':
        return '.jpg';
      case 'image/png':
        return '.png';
      case 'image/webp':
        return '.webp';
      default:
        return '';
    }
  }
}
