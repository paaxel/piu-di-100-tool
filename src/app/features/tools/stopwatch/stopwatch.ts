import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { SeoService } from '../../../core/services/seo';

@Component({
  selector: 'app-stopwatch',
  standalone: false,
  templateUrl: './stopwatch.html',
})
export class Stopwatch implements OnDestroy {
  elapsed = 0;          // milliseconds
  isRunning = false;
  laps: number[] = [];

  private startedAt = 0;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('Cronometro', 'Cronometro online con giri. Misura tempi con precisione al centesimo di secondo.');
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  get display(): string {
    return this.format(this.elapsed);
  }

  get lapSplit(): string {
    const prev = this.laps.length > 0 ? this.laps[this.laps.length - 1] : 0;
    return this.format(this.elapsed - prev);
  }

  format(ms: number): string {
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    const s = Math.floor((ms % 60_000) / 1_000);
    const cs = Math.floor((ms % 1_000) / 10);
    const base = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
    return h > 0 ? `${h}:${base}` : base;
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startedAt = Date.now() - this.elapsed;
    this.cdr.detectChanges();
    this.intervalId = setInterval(() => {
      this.elapsed = Date.now() - this.startedAt;
      this.cdr.detectChanges();
    }, 30);
  }

  stop(): void {
    if (!this.isRunning) return;
    this.clearTimer();
    this.isRunning = false;
    this.cdr.detectChanges();
  }

  lap(): void {
    if (!this.isRunning) return;
    this.laps.push(this.elapsed);
    this.cdr.detectChanges();
  }

  reset(): void {
    this.clearTimer();
    this.isRunning = false;
    this.elapsed = 0;
    this.laps = [];
    this.cdr.detectChanges();
  }

  private clearTimer(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
