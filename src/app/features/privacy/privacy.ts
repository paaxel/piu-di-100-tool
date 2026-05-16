import { Component } from '@angular/core';
import { SeoService } from '../../core/services/seo';

@Component({
  selector: 'app-privacy',
  standalone: false,
  templateUrl: './privacy.html',
  styleUrl: './privacy.scss',
})
export class Privacy {
  constructor(seo: SeoService) {
    seo.set('Politica sulla Privacy', 'Informativa sulla privacy di piu-di-100-tool.it. Nessun tracciamento, nessun dato inviato a server.');
  }
}
