import { Component, ChangeDetectorRef, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { SeoService } from '../../../core/services/seo';
import { ImageProcessorService } from '../../../core/services/image-processor';

type OutputFormat = 'image/png' | 'image/jpeg';

@Component({
  selector: 'app-image-crop',
  standalone: false,
  templateUrl: './image-crop.html',
})
export class ImageCrop implements OnDestroy {
  @ViewChild('cropCanvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  outputPreview: SafeUrl | null = null;
  inputSize = 0;
  outputSize = 0;
  inputName = '';
  error = '';
  hasImage = false;
  hasCrop = false;
  cropX = 0;
  cropY = 0;
  cropW = 0;
  cropH = 0;
  outputFormat: OutputFormat = 'image/png';

  private img: HTMLImageElement | null = null;
  private dragMode: 'draw' | 'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se' | null = null;
  private startX = 0;
  private startY = 0;
  private resizeAnchorX = 0;
  private resizeAnchorY = 0;
  private moveOffsetX = 0;
  private moveOffsetY = 0;
  private blobUrl = '';

  constructor(private images: ImageProcessorService, private cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set(
      'Ritaglia Immagine',
      'Ritaglia immagini online con selettore interattivo. Trascina per selezionare l\'area. Supporta PNG, JPG, WebP. Gratuito, nel browser.',
    );
  }

  ngOnDestroy(): void {
    this.images.revoke(this.blobUrl);
  }

  get cropPixelW(): number {
    if (!this.img || !this.canvasRef) return 0;
    return Math.round((this.cropW / this.canvasRef.nativeElement.width) * this.img.naturalWidth);
  }

  get cropPixelH(): number {
    if (!this.img || !this.canvasRef) return 0;
    return Math.round((this.cropH / this.canvasRef.nativeElement.height) * this.img.naturalHeight);
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
    this.img = loaded.image;
    this.inputName = loaded.baseName;
    this.inputSize = loaded.size;
    this.outputFormat = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
    this.hasImage = true;
    this.hasCrop = false;
    this.outputPreview = null;
    this.cropX = 0;
    this.cropY = 0;
    this.cropW = 0;
    this.cropH = 0;
    this.cdr.detectChanges();
    setTimeout(() => this.initCanvas(), 0);
  }

  private initCanvas(): void {
    if (!this.canvasRef || !this.img) return;
    const canvas = this.canvasRef.nativeElement;
    const maxW = 800;
    const scale = this.img.naturalWidth > maxW ? maxW / this.img.naturalWidth : 1;
    canvas.width = Math.round(this.img.naturalWidth * scale);
    canvas.height = Math.round(this.img.naturalHeight * scale);
    canvas.getContext('2d')!.drawImage(this.img, 0, 0, canvas.width, canvas.height);
  }

  private getCoords(e: MouseEvent | Touch): { x: number; y: number } {
    if (!this.canvasRef) return { x: 0, y: 0 };
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: Math.max(0, Math.min(canvas.width, (e.clientX - rect.left) * scaleX)),
      y: Math.max(0, Math.min(canvas.height, (e.clientY - rect.top) * scaleY)),
    };
  }

  private getHitZone(x: number, y: number): 'nw' | 'ne' | 'sw' | 'se' | 'move' | 'outside' {
    const H = 12;
    const { cropX: cx, cropY: cy, cropW: cw, cropH: ch } = this;
    if (x >= cx && x <= cx + H && y >= cy && y <= cy + H) return 'nw';
    if (x >= cx + cw - H && x <= cx + cw && y >= cy && y <= cy + H) return 'ne';
    if (x >= cx && x <= cx + H && y >= cy + ch - H && y <= cy + ch) return 'sw';
    if (x >= cx + cw - H && x <= cx + cw && y >= cy + ch - H && y <= cy + ch) return 'se';
    if (x >= cx && x <= cx + cw && y >= cy && y <= cy + ch) return 'move';
    return 'outside';
  }

  private updateCursor(x: number, y: number): void {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    if (!this.hasCrop) { canvas.style.cursor = 'crosshair'; return; }
    const zone = this.getHitZone(x, y);
    if (zone === 'nw' || zone === 'se') canvas.style.cursor = 'nwse-resize';
    else if (zone === 'ne' || zone === 'sw') canvas.style.cursor = 'nesw-resize';
    else if (zone === 'move') canvas.style.cursor = 'move';
    else canvas.style.cursor = 'crosshair';
  }

  onMouseDown(e: MouseEvent): void {
    e.preventDefault();
    if (!this.hasImage) return;
    const { x, y } = this.getCoords(e);

    if (this.hasCrop) {
      const zone = this.getHitZone(x, y);
      if (zone !== 'outside') {
        if (zone === 'move') {
          this.dragMode = 'move';
          this.moveOffsetX = x - this.cropX;
          this.moveOffsetY = y - this.cropY;
        } else {
          this.dragMode = `resize-${zone}` as typeof this.dragMode;
          this.resizeAnchorX = (zone === 'nw' || zone === 'sw') ? this.cropX + this.cropW : this.cropX;
          this.resizeAnchorY = (zone === 'nw' || zone === 'ne') ? this.cropY + this.cropH : this.cropY;
        }
        return;
      }
      // Clicked outside: clear crop and start a new draw
      this.hasCrop = false;
      if (this.outputPreview) {
        this.images.revoke(this.blobUrl);
        this.blobUrl = '';
        this.outputPreview = null;
      }
      this.cropX = 0; this.cropY = 0; this.cropW = 0; this.cropH = 0;
      this.redraw();
    }

    this.startX = x;
    this.startY = y;
    this.cropW = 0;
    this.cropH = 0;
    this.dragMode = 'draw';
  }

  onMouseMove(e: MouseEvent): void {
    e.preventDefault();
    const { x, y } = this.getCoords(e);

    if (!this.dragMode) {
      this.updateCursor(x, y);
      return;
    }

    if (this.dragMode === 'draw') {
      this.cropX = Math.min(this.startX, x);
      this.cropY = Math.min(this.startY, y);
      this.cropW = Math.abs(x - this.startX);
      this.cropH = Math.abs(y - this.startY);
    } else if (this.dragMode === 'move') {
      const canvas = this.canvasRef!.nativeElement;
      this.cropX = Math.max(0, Math.min(canvas.width - this.cropW, x - this.moveOffsetX));
      this.cropY = Math.max(0, Math.min(canvas.height - this.cropH, y - this.moveOffsetY));
    } else {
      // resize: anchor is the fixed opposite corner
      this.cropX = Math.min(this.resizeAnchorX, x);
      this.cropY = Math.min(this.resizeAnchorY, y);
      this.cropW = Math.max(4, Math.abs(x - this.resizeAnchorX));
      this.cropH = Math.max(4, Math.abs(y - this.resizeAnchorY));
    }
    this.redraw();
  }

  onMouseUp(): void {
    if (!this.dragMode) return;
    this.dragMode = null;

    if (this.cropW > 4 && this.cropH > 4) {
      this.hasCrop = true;
    } else {
      this.hasCrop = false;
      this.cropX = 0; this.cropY = 0; this.cropW = 0; this.cropH = 0;
      this.redraw();
    }

    if (this.outputPreview) {
      this.images.revoke(this.blobUrl);
      this.blobUrl = '';
      this.outputPreview = null;
    }
  }

  onTouchStart(e: TouchEvent): void {
    e.preventDefault();
    if (e.touches.length === 1) {
      this.onMouseDown({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY, preventDefault: () => {} } as unknown as MouseEvent);
    }
  }

  onTouchMove(e: TouchEvent): void {
    e.preventDefault();
    if (e.touches.length === 1) {
      this.onMouseMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY, preventDefault: () => {} } as unknown as MouseEvent);
    }
  }

  onTouchEnd(): void {
    this.onMouseUp();
  }

  private redraw(): void {
    if (!this.canvasRef || !this.img) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this.img, 0, 0, canvas.width, canvas.height);
    if (this.cropW > 0 && this.cropH > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const scaleX = this.img.naturalWidth / canvas.width;
      const scaleY = this.img.naturalHeight / canvas.height;
      ctx.drawImage(
        this.img,
        this.cropX * scaleX,
        this.cropY * scaleY,
        this.cropW * scaleX,
        this.cropH * scaleY,
        this.cropX,
        this.cropY,
        this.cropW,
        this.cropH,
      );
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.strokeRect(this.cropX, this.cropY, this.cropW, this.cropH);
      const hSize = 8;
      ctx.fillStyle = '#3b82f6';
      const corners = [
        [this.cropX, this.cropY],
        [this.cropX + this.cropW - hSize, this.cropY],
        [this.cropX, this.cropY + this.cropH - hSize],
        [this.cropX + this.cropW - hSize, this.cropY + this.cropH - hSize],
      ];
      corners.forEach(([cx, cy]) => ctx.fillRect(cx, cy, hSize, hSize));
    }
  }

  async crop(): Promise<void> {
    if (!this.img || !this.hasCrop || !this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const scaleX = this.img.naturalWidth / canvas.width;
    const scaleY = this.img.naturalHeight / canvas.height;
    const srcX = Math.round(this.cropX * scaleX);
    const srcY = Math.round(this.cropY * scaleY);
    const srcW = Math.round(this.cropW * scaleX);
    const srcH = Math.round(this.cropH * scaleY);
    const out = document.createElement('canvas');
    out.width = srcW;
    out.height = srcH;
    const ctx = out.getContext('2d')!;
    if (this.outputFormat === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, srcW, srcH);
    }
    ctx.drawImage(this.img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);
    const blob = await new Promise<Blob | null>((resolve) =>
      out.toBlob(resolve, this.outputFormat, 0.92),
    );
    if (!blob) return;
    this.images.revoke(this.blobUrl);
    const { url, safeUrl } = this.images.toPreview(blob);
    this.blobUrl = url;
    this.outputPreview = safeUrl;
    this.outputSize = blob.size;
    this.cdr.detectChanges();
  }

  download(): void {
    if (!this.blobUrl) return;
    const ext = this.images.extensionFor(this.outputFormat) || '.png';
    this.images.download(this.blobUrl, `${this.inputName}_crop${ext}`);
  }

  reset(): void {
    this.images.revoke(this.blobUrl);
    this.blobUrl = '';
    this.img = null;
    this.hasImage = false;
    this.hasCrop = false;
    this.outputPreview = null;
    this.inputSize = 0;
    this.outputSize = 0;
    this.cropX = 0;
    this.cropY = 0;
    this.cropW = 0;
    this.cropH = 0;
    this.error = '';
  }
}
