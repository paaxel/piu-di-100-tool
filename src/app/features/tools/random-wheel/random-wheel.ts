import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SeoService } from '../../../core/services/seo';

const COLORS = [
  '#FF6B6B', '#FFE66D', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#F7DC6F', '#DDA0DD', '#98D8C8', '#F8C471', '#BB8FCE',
  '#F1948A', '#85C1E9', '#82E0AA', '#AEB6BF', '#F0B27A',
];

@Component({
  selector: 'app-random-wheel',
  standalone: false,
  templateUrl: './random-wheel.html',
})
export class RandomWheel implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  itemsText = 'Elemento 1\nElemento 2\nElemento 3\nElemento 4\nElemento 5\nElemento 6';
  winner = '';
  isSpinning = false;

  private angle = 0;
  private velocity = 0;
  private rafId = 0;

  private readonly isBrowser: boolean;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    seo: SeoService,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    seo.set('Ruota Fortunata', 'Crea una ruota casuale con i tuoi elementi e clicca per girare. Strumento online gratuito.');
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) this.drawWheel();
  }

  ngOnDestroy(): void {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  get items(): string[] {
    return this.itemsText.split('\n').map(s => s.trim()).filter(Boolean);
  }

  onItemsChange(): void {
    this.winner = '';
    this.drawWheel();
  }

  spin(): void {
    if (this.isSpinning || this.items.length < 2) return;
    this.winner = '';
    this.isSpinning = true;
    // Random velocity: 20–35 degrees per frame
    this.velocity = (20 + Math.random() * 15) * (Math.PI / 180);
    this.animate();
  }

  private animate(): void {
    this.velocity *= 0.982;
    this.angle += this.velocity;
    this.drawWheel();

    if (this.velocity < 0.003) {
      this.isSpinning = false;
      this.winner = this.calcWinner();
      this.cdr.detectChanges();
      return;
    }
    this.rafId = requestAnimationFrame(() => this.animate());
  }

  private calcWinner(): string {
    const items = this.items;
    if (!items.length) return '';
    const step = (2 * Math.PI) / items.length;
    // Pointer is at angle 0 (right side). Find which sector contains angle 0.
    const normalised = (((-this.angle) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    return items[Math.floor(normalised / step) % items.length];
  }

  drawWheel(): void {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const items = this.items;
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const r = Math.min(cx, cy) - 16;

    ctx.clearRect(0, 0, W, H);

    if (!items.length) {
      ctx.fillStyle = '#aaa';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Aggiungi elementi nella lista', cx, cy);
      return;
    }

    const step = (2 * Math.PI) / items.length;

    for (let i = 0; i < items.length; i++) {
      const start = this.angle + i * step;
      const end = start + step;

      // Sector
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + step / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#222';
      ctx.font = `bold ${Math.max(10, Math.min(14, Math.floor(r / items.length * 1.5)))}px sans-serif`;
      const label = items[i].length > 14 ? items[i].slice(0, 13) + '…' : items[i];
      ctx.fillText(label, r - 12, 5);
      ctx.restore();
    }

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, 2 * Math.PI);
    ctx.fillStyle = '#222';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pointer triangle (right side)
    ctx.beginPath();
    ctx.moveTo(W - 4, cy - 12);
    ctx.lineTo(W - 4, cy + 12);
    ctx.lineTo(W - 4 - 22, cy);
    ctx.closePath();
    ctx.fillStyle = '#222';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}
