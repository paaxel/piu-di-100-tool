import { ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { SeoService } from '../../../core/services/seo';
import { ImageProcessorService } from '../../../core/services/image-processor';

interface RgbColor { r: number; g: number; b: number; }
interface HslColor { h: number; s: number; l: number; }

function rgbToHex({ r, g, b }: RgbColor): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function rgbToHsl({ r, g, b }: RgbColor): HslColor {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
    case gn: h = (bn - rn) / d + 2; break;
    default:  h = (rn - gn) / d + 4;
  }
  return { h: Math.round(h * 60), s: Math.round(s * 100), l: Math.round(l * 100) };
}

@Component({
  selector: 'app-image-color-picker',
  standalone: false,
  templateUrl: './image-color-picker.html',
})
export class ImageColorPicker implements OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  hasImage = false;
  error = '';
  pickedHex: string | null = null;
  pickedRgb: RgbColor | null = null;
  pickedHsl: HslColor | null = null;
  copiedKey: string | null = null;

  private image: HTMLImageElement | null = null;

  constructor(
    private readonly images: ImageProcessorService,
    private readonly cdr: ChangeDetectorRef,
    seo: SeoService,
  ) {
    seo.set('Colore da Immagine', 'Carica un immagine e clicca su qualsiasi punto per estrarne il colore in HEX, RGB e HSL.');
  }

  ngOnDestroy(): void {}

  async onFile(file: File): Promise<void> {
    this.error = '';
    this.pickedHex = null;
    this.pickedRgb = null;
    this.pickedHsl = null;
    const loaded = await this.images.load(file, 'image/*');
    if (!loaded) {
      this.error = 'Formato non valido.';
      return;
    }
    this.image = loaded.image;
    this.hasImage = true;
    this.cdr.detectChanges();
    this.drawToCanvas();
  }

  private drawToCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const img = this.image!;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
  }

  onCanvasClick(event: MouseEvent): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((event.clientX - rect.left) * scaleX);
    const y = Math.floor((event.clientY - rect.top) * scaleY);
    const ctx = canvas.getContext('2d')!;
    const data = ctx.getImageData(x, y, 1, 1).data;
    this.pickedRgb = { r: data[0], g: data[1], b: data[2] };
    this.pickedHex = rgbToHex(this.pickedRgb);
    this.pickedHsl = rgbToHsl(this.pickedRgb);
    this.cdr.detectChanges();
  }

  async copy(value: string, key: string): Promise<void> {
    await navigator.clipboard.writeText(value);
    this.copiedKey = key;
    this.cdr.detectChanges();
    setTimeout(() => { this.copiedKey = null; this.cdr.detectChanges(); }, 1500);
  }

  get hexUpper(): string { return (this.pickedHex ?? '').toUpperCase(); }
  get rgbStr(): string { return this.pickedRgb ? `rgb(${this.pickedRgb.r}, ${this.pickedRgb.g}, ${this.pickedRgb.b})` : ''; }
  get hslStr(): string { return this.pickedHsl ? `hsl(${this.pickedHsl.h}, ${this.pickedHsl.s}%, ${this.pickedHsl.l}%)` : ''; }
}
