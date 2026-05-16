import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { SeoService } from '../../../core/services/seo';

@Component({
  selector: 'app-countdown-timer',
  standalone: false,
  templateUrl: './countdown-timer.html',
})
export class CountdownTimer implements OnDestroy {
  inputHours = 0;
  inputMinutes = 5;
  inputSeconds = 0;

  secondsLeft = 0;
  totalSeconds = 0;
  isRunning = false;
  finished = false;

  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('Conto alla Rovescia', 'Timer conto alla rovescia online. Imposta ore, minuti e secondi e avvia il countdown.');
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  get display(): string {
    const h = Math.floor(this.secondsLeft / 3600);
    const m = Math.floor((this.secondsLeft % 3600) / 60);
    const s = this.secondsLeft % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  get progressPct(): number {
    if (!this.totalSeconds) return 0;
    return ((this.totalSeconds - this.secondsLeft) / this.totalSeconds) * 100;
  }

  start(): void {
    if (this.isRunning) return;
    if (this.secondsLeft === 0 && !this.finished) {
      this.totalSeconds = this.inputHours * 3600 + this.inputMinutes * 60 + this.inputSeconds;
      if (this.totalSeconds <= 0) return;
      this.secondsLeft = this.totalSeconds;
    }
    this.finished = false;
    this.isRunning = true;
    this.cdr.detectChanges();
    this.intervalId = setInterval(() => {
      this.secondsLeft--;
      if (this.secondsLeft <= 0) {
        this.secondsLeft = 0;
        this.isRunning = false;
        this.finished = true;
        this.clearTimer();
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  pause(): void {
    this.clearTimer();
    this.isRunning = false;
    this.cdr.detectChanges();
  }

  reset(): void {
    this.clearTimer();
    this.isRunning = false;
    this.finished = false;
    this.secondsLeft = 0;
    this.totalSeconds = 0;
    this.cdr.detectChanges();
  }

  private clearTimer(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
