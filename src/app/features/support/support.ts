import { Component } from '@angular/core';
import { SeoService } from '../../core/services/seo';

@Component({
  selector: 'app-support',
  standalone: false,
  templateUrl: './support.html',
  styleUrl: './support.scss',
})
export class Support {
  constructor(seo: SeoService) {
    seo.set(
      'Supporto',
      'Hai bisogno di aiuto? Trova le risposte alle domande più frequenti e contatta il team di piu-di-100-tool.it.',
    );
  }
}
