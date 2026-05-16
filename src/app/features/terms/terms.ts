import { Component } from '@angular/core';
import { SeoService } from '../../core/services/seo';

@Component({
  selector: 'app-terms',
  standalone: false,
  templateUrl: './terms.html',
  styleUrl: './terms.scss',
})
export class Terms {
  constructor(seo: SeoService) {
    seo.set(
      'Termini di Servizio',
      'Termini e condizioni di utilizzo di piu-di-100-tool.it. Strumenti gratuiti, uso personale e professionale consentito.',
    );
  }
}
