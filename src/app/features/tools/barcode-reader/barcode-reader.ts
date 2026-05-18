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
  format?: string;
}

interface BarcodeDetectorCtor {
  new (opts?: { formats?: string[] }): { detect: (source: ImageBitmapSource) => Promise<DetectedCode[]> };
}

@Component({
  selector: 'app-barcode-reader',
  standalone: false,
  templateUrl: './barcode-reader.html',
})
export class BarcodeReader {
  @ViewChild(FileDropzone) dropzone?: FileDropzone;

  preview: SafeUrl | null = null;
  results: DetectedCode[] = [];
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
    seo.set('Lettore Barcode', 'Leggi barcode da immagini con riconoscimento locale nel browser.');
    if (isPlatformBrowser(platformId)) {
      const ctor = (window as Window & { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
      this.nativeSupported = !!ctor;
    }
  }

  onFile(file: File): void {
    this.error = '';
    this.results = [];
    this.usingFallback = false;
    this.file = file;
    this.preview = null;
    if (!file) return;
    // Mostra subito l'immagine
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
    this.results = [];
    this.usingFallback = false;
    this.loading = true;
    this.cdr.markForCheck();
    try {
      const file = this.file;
      const ctor = (window as Window & { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
      if (ctor) {
        try {
          const bitmap = await createImageBitmap(file);
          const detector = new ctor({ formats: ['code_128', 'code_39', 'code_93', 'codabar', 'ean_13', 'ean_8', 'itf', 'upc_a', 'upc_e'] });
          this.results = await detector.detect(bitmap);
          bitmap.close();
          if (this.results.length > 0) {
            this.cdr.markForCheck();
            return;
          }
        } catch {
          // Fall through to ZXing fallback.
        }
      }
      this.usingFallback = true;
      this.results = await this.decodeWithZxing(file);
      if (this.results.length === 0) {
        this.error = 'Nessun barcode rilevato.';
      }
      this.cdr.markForCheck();
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  private async decodeWithZxing(file: File): Promise<DetectedCode[]> {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.CODE_93,
      BarcodeFormat.CODABAR,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.ITF,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
    ]);

    const reader = new BrowserMultiFormatReader(hints);
    const objectUrl = URL.createObjectURL(file);
    try {
      const image = await this.loadImage(objectUrl);
      const result = await reader.decodeFromImageElement(image);
      return [{
        rawValue: result.getText(),
        format: BarcodeFormat[result.getBarcodeFormat()] ?? String(result.getBarcodeFormat()),
      }];
    } catch {
      return [];
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
    this.results = [];
    this.error = '';
    this.usingFallback = false;
    this.loading = false;
    this.dropzone?.clear();
    this.cdr.markForCheck();
  }

}