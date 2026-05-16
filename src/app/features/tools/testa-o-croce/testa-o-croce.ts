import { ChangeDetectorRef, Component } from '@angular/core';
import { SeoService } from '../../../core/services/seo';

type CoinSide = 'heads' | 'tails';

@Component({
  selector: 'app-testa-o-croce',
  standalone: false,
  templateUrl: './testa-o-croce.html',
  styleUrl: './testa-o-croce.scss',
})
export class TestaOCroce {
  result: CoinSide | null = null;
  isFlipping = false;
  heads = 0;
  tails = 0;

  constructor(private cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('Testa o Croce', 'Lancia una moneta virtuale e scopri testa o croce. Generatore crittograficamente sicuro.');
  }

  flip(): void {
    if (this.isFlipping) return;
    this.isFlipping = true;
    this.result = null;
    this.cdr.detectChanges();
    setTimeout(() => {
      const arr = new Uint8Array(1);
      crypto.getRandomValues(arr);
      this.result = arr[0] % 2 === 0 ? 'heads' : 'tails';
      if (this.result === 'heads') this.heads++;
      else this.tails++;
      this.isFlipping = false;
      this.cdr.detectChanges();
    }, 600);
  }

  reset(): void {
    this.result = null;
    this.heads = 0;
    this.tails = 0;
  }
}
