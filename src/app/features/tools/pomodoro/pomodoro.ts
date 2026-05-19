import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { SeoService } from '../../../core/services/seo';

type Phase = 'work' | 'break' | 'long-break';

@Component({
  selector: 'app-pomodoro',
  standalone: false,
  templateUrl: './pomodoro.html',
})
export class PomodoroTimer implements OnDestroy {
  workMins = 25;
  breakMins = 5;
  longBreakMins = 15;

  phase: Phase = 'work';
  secondsLeft = 25 * 60;
  isRunning = false;
  completedPomodoros = 0;

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private startedAt = 0;
  private initialSecondsLeft = 0;

  constructor(private readonly cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('Pomodoro Timer', 'Timer Pomodoro online: sessioni di 25 minuti alternate a pause. Aumenta la concentrazione e la produttività.');
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  // ── Derived values ─────────────────────────────────────────────────────────

  get totalSeconds(): number {
    return this.phaseMins * 60;
  }

  get phaseMins(): number {
    if (this.phase === 'work') return this.workMins;
    if (this.phase === 'break') return this.breakMins;
    return this.longBreakMins;
  }

  get timeDisplay(): string {
    const m = Math.floor(this.secondsLeft / 60);
    const s = this.secondsLeft % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  get phaseLabel(): string {
    if (this.phase === 'work') return 'Lavoro';
    if (this.phase === 'break') return 'Pausa breve';
    return 'Pausa lunga';
  }

  get phaseIcon(): string {
    if (this.phase === 'work') return 'timer';
    return 'coffee';
  }

  get phaseColor(): string {
    if (this.phase === 'work') return 'var(--bs-danger, #dc3545)';
    if (this.phase === 'break') return 'var(--bs-success, #198754)';
    return 'var(--bs-info, #0dcaf0)';
  }

  /** SVG circle progress: stroke-dashoffset for a circle with r=54 (circumference ≈ 339). */
  get dashOffset(): number {
    const circumference = 2 * Math.PI * 54;
    const elapsed = this.totalSeconds - this.secondsLeft;
    return circumference * (1 - elapsed / this.totalSeconds);
  }

  get circumference(): number {
    return 2 * Math.PI * 54;
  }

  // ── Controls ───────────────────────────────────────────────────────────────

  startPause(): void {
    if (this.isRunning) {
      this.clearTimer();
      this.isRunning = false;
    } else {
      this.isRunning = true;
      this.startedAt = Date.now();
      this.initialSecondsLeft = this.secondsLeft;
      this.intervalId = setInterval(() => this.tick(), 500);
    }
  }

  reset(): void {
    this.clearTimer();
    this.isRunning = false;
    this.secondsLeft = this.phaseMins * 60;
  }

  fullReset(): void {
    this.clearTimer();
    this.isRunning = false;
    this.phase = 'work';
    this.completedPomodoros = 0;
    this.secondsLeft = this.workMins * 60;
  }

  setPhase(p: Phase): void {
    if (this.isRunning) return;
    this.phase = p;
    this.secondsLeft = this.phaseMins * 60;
  }

  onDurationChange(): void {
    if (!this.isRunning) this.secondsLeft = this.phaseMins * 60;
  }

  // ── Internal ───────────────────────────────────────────────────────────────

  private tick(): void {
    const elapsed = Math.floor((Date.now() - this.startedAt) / 1000);
    this.secondsLeft = Math.max(0, this.initialSecondsLeft - elapsed);
    if (this.secondsLeft <= 0) {
      this.beep();
      this.advance();
    }
    this.cdr.detectChanges();
  }

  private advance(): void {
    this.clearTimer();
    this.isRunning = false;
    if (this.phase === 'work') {
      this.completedPomodoros++;
      this.phase = this.completedPomodoros % 4 === 0 ? 'long-break' : 'break';
    } else {
      this.phase = 'work';
    }
    this.secondsLeft = this.phaseMins * 60;
  }

  private clearTimer(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private beep(): void {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch { /* AudioContext not available */ }
  }
}
