import { Component, ChangeDetectorRef, ViewChild, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { SeoService } from '../../../core/services/seo';
import { ImageProcessorService } from '../../../core/services/image-processor';
import { FileDropzone } from '../../../shared/reusable/file-dropzone/file-dropzone';

interface DetectedCode {
  rawValue?: string;
}

interface BarcodeDetectorCtor {
  new (opts?: { formats?: string[] }): { detect: (source: ImageBitmapSource) => Promise<DetectedCode[]> };
}

@Component({
  selector: 'app-qrcode-reader',
  standalone: false,
  templateUrl: './qrcode-reader.html',
})
export class QrcodeReader {
  @ViewChild(FileDropzone) dropzone?: FileDropzone;

  preview: SafeUrl | null = null;
  value = '';
  error = '';
  nativeSupported = false;
  usingFallback = false;
  file: File | null = null;
  loading = false;

  constructor(
    private readonly images: ImageProcessorService,
    private readonly sanitizer: DomSanitizer,
    seo: SeoService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    seo.set('Lettore QR Code', 'Decodifica QR Code da immagine direttamente nel browser.');
    if (isPlatformBrowser(platformId)) {
      const ctor = (window as Window & { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
      this.nativeSupported = !!ctor;
      if (!ctor) {
        console.warn('BarcodeDetector API not available on this platform — falling back to ZXing.');
      }
    }
  }

  onFile(file: File): void {
    this.error = '';
    this.value = '';
    this.usingFallback = false;
    this.file = file;
    this.preview = null;
    if (!file) return;
    // Mostra subito l'immagine, senza attendere altre operazioni
    const reader = new FileReader();
    reader.onload = (ev) => {
      this.preview = this.sanitizer.bypassSecurityTrustUrl(ev.target!.result as string);
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
    // Continua a validare e caricare per logica tool
    this.images.load(file, 'image/*').then(loaded => {
      if (!loaded) {
        this.error = 'Formato non valido.';
        this.file = null;
        this.preview = null;
        this.cdr.markForCheck();
        return;
      }
      // preview già mostrata sopra
    });
  }

  async decode(): Promise<void> {
    if (!this.file) return;
    this.error = '';
    this.value = '';
    this.usingFallback = false;
    this.loading = true;
    this.cdr.markForCheck();
    try {
      const file = this.file;
      const ctor = (window as Window & { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
      if (ctor) {
        try {
          const bitmap = await createImageBitmap(file);
          const detector = new ctor({ formats: ['qr_code'] });
          const results = await detector.detect(bitmap);
          bitmap.close();
          this.value = results[0]?.rawValue ?? '';
          if (this.value) {
            this.cdr.markForCheck();
            return;
          }
        } catch {
          // Fall through to ZXing fallback.
        }
      }
      this.usingFallback = true;
      this.value = await this.decodeQrWithZxing(file);
      if (!this.value) this.error = 'Nessun QR Code rilevato.';
      this.cdr.markForCheck();
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  copy(): void {
    if (!this.value) return;
    navigator.clipboard?.writeText(this.value).catch(() => undefined);
  }

  private async decodeQrWithZxing(file: File): Promise<string> {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);

    const reader = new BrowserMultiFormatReader(hints);
    const objectUrl = URL.createObjectURL(file);
    try {
      const image = await this.loadImage(objectUrl);
      const result = await reader.decodeFromImageElement(image);
      return result.getText() ?? '';
    } catch {
      return '';
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Immagine non leggibile'));
      img.src = src;
    });
  }

  reset(): void {
    this.file = null;
    this.preview = null;
    this.value = '';
    this.error = '';
    this.usingFallback = false;
    this.loading = false;
    this.dropzone?.clear();
    this.cdr.markForCheck();
  }
}
