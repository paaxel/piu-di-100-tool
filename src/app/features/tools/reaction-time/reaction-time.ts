import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { SeoService } from '../../../core/services/seo';

type TestMode = 'semaphore' | 'random';
type Phase = 'idle' | 'waiting' | 'red' | 'yellow' | 'ready' | 'early' | 'done';

interface Round {
  reactionMs: number;
}

@Component({
  selector: 'app-reaction-time',
  standalone: false,
  templateUrl: './reaction-time.html',
})
export class ReactionTime implements OnDestroy {
  mode: TestMode = 'semaphore';
  phase: Phase = 'idle';
  rounds: Round[] = [];
  currentMs = 0;
  earlyCount = 0;

  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private startedAt = 0;

  constructor(private readonly cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('Test Tempo di Reazione', 'Misura il tuo tempo di reazione con il test del semaforo o eventi casuali. In millisecondi.');
  }

  ngOnDestroy(): void { this.clearTimeout(); }

  // ── Derived ──────────────────────────────────────────────────────────────

  get avgMs(): number {
    if (!this.rounds.length) return 0;
    return Math.round(this.rounds.reduce((s, r) => s + r.reactionMs, 0) / this.rounds.length);
  }

  get bestMs(): number {
    if (!this.rounds.length) return 0;
    return Math.min(...this.rounds.map(r => r.reactionMs));
  }

  get rating(): string {
    if (!this.rounds.length) return '';
    const avg = this.avgMs;
    if (avg < 180) return 'Eccezionale ⚡';
    if (avg < 250) return 'Ottimo 🏆';
    if (avg < 350) return 'Buono 👍';
    if (avg < 450) return 'Nella media 😐';
    return 'Lento 🐢';
  }

  // ── Semaphore lights for display ─────────────────────────────────────────

  get redLight(): boolean { return this.phase === 'red'; }
  get yellowLight(): boolean { return this.phase === 'yellow'; }
  get greenLight(): boolean { return this.phase === 'ready' || this.phase === 'done'; }

  // ── Actions ──────────────────────────────────────────────────────────────

  setMode(m: TestMode): void {
    this.mode = m;
    this.resetAll();
  }

  beginWait(): void {
    this.clearTimeout();
    if (this.mode === 'semaphore') {
      // off → red → yellow → green
      this.phase = 'red';
      this.cdr.detectChanges();
      const redDelay = 1000 + Math.random() * 2000;   // 1 – 3 s
      this.timeoutId = setTimeout(() => {
        this.phase = 'yellow';
        this.cdr.detectChanges();
        this.timeoutId = setTimeout(() => {
          this.phase = 'ready';
          this.startedAt = Date.now();
          this.cdr.detectChanges();
        }, 600 + Math.random() * 400);   // 0.6 – 1 s
      }, redDelay);
    } else {
      this.phase = 'waiting';
      const delay = 1500 + Math.random() * 3500;   // 1.5 – 5 s
      this.timeoutId = setTimeout(() => {
        this.phase = 'ready';
        this.startedAt = Date.now();
        this.cdr.detectChanges();
      }, delay);
      this.cdr.detectChanges();
    }
  }

  react(): void {
    if (this.phase === 'waiting' || this.phase === 'red' || this.phase === 'yellow') {
      // Too early
      this.clearTimeout();
      this.phase = 'early';
      this.earlyCount++;
      this.cdr.detectChanges();
      return;
    }
    if (this.phase === 'ready') {
      this.currentMs = Date.now() - this.startedAt;
      this.rounds.push({ reactionMs: this.currentMs });
      this.phase = 'done';
      this.cdr.detectChanges();
      return;
    }
    if (this.phase === 'idle' || this.phase === 'done' || this.phase === 'early') {
      this.beginWait();
    }
  }

  reset(): void {
    this.clearTimeout();
    this.phase = 'idle';
    this.currentMs = 0;
    this.cdr.detectChanges();
  }

  resetAll(): void {
    this.clearTimeout();
    this.phase = 'idle';
    this.rounds = [];
    this.currentMs = 0;
    this.earlyCount = 0;
    this.cdr.detectChanges();
  }

  private clearTimeout(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
