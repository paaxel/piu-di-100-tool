import { ChangeDetectorRef, Component } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { SeoService } from '../../../core/services/seo';
import { ImageProcessorService } from '../../../core/services/image-processor';

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function clamp(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function rgbToHex(c: Rgb): string {
  return `#${clamp(c.r).toString(16).padStart(2, '0')}${clamp(c.g).toString(16).padStart(2, '0')}${clamp(c.b).toString(16).padStart(2, '0')}`.toUpperCase();
}

@Component({
  selector: 'app-palette-from-image',
  standalone: false,
  templateUrl: './palette-from-image.html',
})
export class PaletteFromImage {
  imagePalette: string[] = [];
  preview: SafeUrl | null = null;
  error = '';

  constructor(
    private readonly images: ImageProcessorService,
    private readonly cdr: ChangeDetectorRef,
    seo: SeoService,
  ) {
    seo.set('Palette da Immagine', 'Estrai i colori dominanti da un immagine direttamente nel browser.');
  }

  async onImage(file: File): Promise<void> {
    this.error = '';
    this.imagePalette = [];

    const loaded = await this.images.load(file, 'image/*');
    if (!loaded) {
      this.error = 'Formato non valido.';
      return;
    }

    this.preview = loaded.preview;

    const canvas = document.createElement('canvas');
    const size = 100;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      this.error = 'Canvas non disponibile.';
      return;
    }

    ctx.drawImage(loaded.image, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;
    const counts = new Map<string, number>();

    for (let i = 0; i < data.length; i += 16) {
      const a = data[i + 3];
      if (a < 64) continue;
      const r = Math.round(data[i] / 32) * 32;
      const g = Math.round(data[i + 1] / 32) * 32;
      const b = Math.round(data[i + 2] / 32) * 32;
      const key = rgbToHex({ r, g, b });
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    this.imagePalette = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([hex]) => hex);

    if (this.imagePalette.length === 0) {
      this.error = 'Nessun colore rilevato.';
    }

    this.cdr.detectChanges();
  }

  copy(hex: string): void {
    navigator.clipboard?.writeText(hex).catch(() => undefined);
  }
}
