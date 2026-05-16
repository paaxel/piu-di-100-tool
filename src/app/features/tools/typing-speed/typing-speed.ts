import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { SeoService } from '../../../core/services/seo';

type Phase = 'idle' | 'running' | 'finished';

interface Result {
  wpm: number;
  accuracy: number;
  time: number;
  errors: number;
}

const TEXTS = [
  'Il sole splende alto nel cielo azzurro e le nuvole bianche si muovono lentamente spinte dal vento.',
  'La programmazione è un arte che richiede logica, creatività e molta pratica quotidiana.',
  'Nel bosco fitto gli alberi proiettano lunghe ombre sul sentiero coperto di foglie autunnali.',
  'Scrivere codice pulito e leggibile è importante quanto farlo funzionare correttamente.',
  'Il mare agitato sbatteva le onde sugli scogli con un rumore sordo e potente.',
  'Angular è un framework potente per costruire applicazioni web scalabili e performanti.',
  'La curiosità è il motore della conoscenza: non smettere mai di fare domande e cercare risposte.',
];

@Component({
  selector: 'app-typing-speed',
  standalone: false,
  templateUrl: './typing-speed.html',
})
export class TypingSpeed implements OnDestroy {
  phase: Phase = 'idle';
  text = '';
  typed = '';
  timeLimit = 60;
  secondsLeft = 60;
  result: Result | null = null;

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private startTime = 0;

  constructor(private readonly cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('Test Velocità di Scrittura', 'Misura la tua velocità di scrittura in parole al minuto (WPM) con testi in italiano.');
  }

  ngOnDestroy(): void { this.clearTimer(); }

  get chars(): { char: string; state: 'pending' | 'correct' | 'wrong' }[] {
    return this.text.split('').map((char, i) => {
      if (i >= this.typed.length) return { char, state: 'pending' };
      return { char, state: this.typed[i] === char ? 'correct' : 'wrong' };
    });
  }

  get progressPct(): number {
    if (!this.timeLimit) return 0;
    return ((this.timeLimit - this.secondsLeft) / this.timeLimit) * 100;
  }

  start(): void {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    this.text = TEXTS[arr[0] % TEXTS.length];
    this.typed = '';
    this.secondsLeft = this.timeLimit;
    this.result = null;
    this.phase = 'running';
    this.startTime = Date.now();
    this.intervalId = setInterval(() => {
      this.secondsLeft--;
      if (this.secondsLeft <= 0) {
        this.secondsLeft = 0;
        this.finish();
      }
      this.cdr.detectChanges();
    }, 1000);
    this.cdr.detectChanges();
  }

  onInput(value: string): void {
    if (this.phase !== 'running') return;
    this.typed = value;
    if (this.typed.length >= this.text.length) {
      this.finish();
    }
    this.cdr.detectChanges();
  }

  private finish(): void {
    this.clearTimer();
    this.phase = 'finished';
    const elapsed = (Date.now() - this.startTime) / 1000;
    const words = this.typed.trim().split(/\s+/).filter(Boolean).length;
    const minutes = elapsed / 60;
    const wpm = Math.round(words / (minutes || 0.01));
    let errors = 0;
    for (let i = 0; i < this.typed.length; i++) {
      if (this.typed[i] !== this.text[i]) errors++;
    }
    const accuracy = this.typed.length > 0
      ? Math.round(((this.typed.length - errors) / this.typed.length) * 100)
      : 0;
    this.result = { wpm, accuracy, time: Math.round(elapsed), errors };
    this.cdr.detectChanges();
  }

  private clearTimer(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset(): void {
    this.clearTimer();
    this.phase = 'idle';
    this.typed = '';
    this.text = '';
    this.result = null;
    this.cdr.detectChanges();
  }
}
