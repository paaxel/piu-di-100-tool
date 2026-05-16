import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PDFDocument, degrees } from 'pdf-lib';

@Injectable({ providedIn: 'root' })
export class PdfProcessorService {
  constructor(private readonly sanitizer: DomSanitizer) {}

  private readFile(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  download(bytes: Uint8Array, filename: string): void {
    const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  downloadImage(dataUrl: string, filename: string): void {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    a.click();
  }

  toBlobUrl(bytes: Uint8Array): { url: string; safeUrl: SafeResourceUrl } {
    const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    return { url, safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(url) };
  }

  revoke(url: string): void {
    if (url) URL.revokeObjectURL(url);
  }

  async getPageCount(file: File): Promise<number> {
    const buf = await this.readFile(file);
    const doc = await PDFDocument.load(buf);
    return doc.getPageCount();
  }

  async merge(files: File[]): Promise<Uint8Array> {
    const merged = await PDFDocument.create();
    for (const file of files) {
      const buf = await this.readFile(file);
      const doc = await PDFDocument.load(buf);
      const copied = await merged.copyPages(doc, doc.getPageIndices());
      copied.forEach(p => merged.addPage(p));
    }
    return merged.save();
  }

  async split(file: File): Promise<Uint8Array[]> {
    const buf = await this.readFile(file);
    const doc = await PDFDocument.load(buf);
    const results: Uint8Array[] = [];
    for (let i = 0; i < doc.getPageCount(); i++) {
      const single = await PDFDocument.create();
      const [page] = await single.copyPages(doc, [i]);
      single.addPage(page);
      results.push(await single.save());
    }
    return results;
  }

  async compress(file: File): Promise<Uint8Array> {
    const buf = await this.readFile(file);
    const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
    return doc.save({ useObjectStreams: true, addDefaultPage: false });
  }

  async rotate(file: File, angle: number, pageIndices: number[] | null = null): Promise<Uint8Array> {
    const buf = await this.readFile(file);
    const doc = await PDFDocument.load(buf);
    const targets = pageIndices ?? doc.getPageIndices();
    for (const i of targets) {
      const page = doc.getPage(i);
      const current = page.getRotation().angle;
      page.setRotation(degrees((current + angle) % 360));
    }
    return doc.save();
  }

  async reorder(file: File, newOrder: number[]): Promise<Uint8Array> {
    const buf = await this.readFile(file);
    const src = await PDFDocument.load(buf);
    const dst = await PDFDocument.create();
    const pages = await dst.copyPages(src, newOrder);
    pages.forEach(p => dst.addPage(p));
    return dst.save();
  }

  async extract(file: File, pageIndices: number[]): Promise<Uint8Array> {
    const buf = await this.readFile(file);
    const src = await PDFDocument.load(buf);
    const dst = await PDFDocument.create();
    const pages = await dst.copyPages(src, pageIndices);
    pages.forEach(p => dst.addPage(p));
    return dst.save();
  }

  async imagesToPdf(files: File[]): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    for (const file of files) {
      const buf = await this.readFile(file);
      const bytes = new Uint8Array(buf);
      const img = file.type === 'image/jpeg' || file.type === 'image/jpg'
        ? await doc.embedJpg(bytes)
        : await doc.embedPng(bytes);
      const page = doc.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }
    return doc.save();
  }

  async signPdf(
    file: File,
    signatureDataUrl: string,
    pageIndex: number,
    xFromLeft: number,
    yFromTop: number,
    width: number,
    height: number,
  ): Promise<Uint8Array> {
    const buf = await this.readFile(file);
    const doc = await PDFDocument.load(buf);
    const base64 = signatureDataUrl.split(',')[1];
    const sigBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const image = await doc.embedPng(sigBytes);
    const page = doc.getPage(pageIndex);
    const { height: pageHeight } = page.getSize();
    page.drawImage(image, {
      x: xFromLeft,
      y: pageHeight - yFromTop - height,
      width,
      height,
    });
    return doc.save();
  }

  async pdfToImages(file: File, scale = 2): Promise<string[]> {
    const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
    GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.min.mjs';
    const buf = await this.readFile(file);
    const pdf = await getDocument({ data: new Uint8Array(buf) }).promise;
    const images: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d')!;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await page.render({ canvasContext: ctx as any, viewport } as any).promise;
      images.push(canvas.toDataURL('image/png'));
    }
    return images;
  }

  async renderThumbnail(file: File, pageIndex = 0, scale = 0.25): Promise<string> {
    const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
    GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.min.mjs';
    const buf = await this.readFile(file);
    const pdf = await getDocument({ data: new Uint8Array(buf) }).promise;
    const page = await pdf.getPage(pageIndex + 1);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await page.render({ canvasContext: canvas.getContext('2d') as any, viewport } as any).promise;
    return canvas.toDataURL('image/jpeg', 0.75);
  }

  async *thumbnailGenerator(file: File, scale = 0.25): AsyncGenerator<{ pageIndex: number; thumb: string }> {
    const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
    GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.min.mjs';
    const buf = await this.readFile(file);
    const pdf = await getDocument({ data: new Uint8Array(buf) }).promise;
    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await page.render({ canvasContext: canvas.getContext('2d') as any, viewport } as any).promise;
      yield { pageIndex: i, thumb: canvas.toDataURL('image/jpeg', 0.75) };
    }
  }

  parsePageRange(input: string, total: number): number[] {
    const indices = new Set<number>();
    for (const part of input.split(',')) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [a, b] = trimmed.split('-').map(s => parseInt(s.trim(), 10));
        for (let n = a; n <= b; n++) {
          if (n >= 1 && n <= total) indices.add(n - 1);
        }
      } else {
        const n = parseInt(trimmed, 10);
        if (n >= 1 && n <= total) indices.add(n - 1);
      }
    }
    return [...indices].sort((a, b) => a - b);
  }
}
