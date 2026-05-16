import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-section-card',
  standalone: false,
  templateUrl: './section-card.html',
  styleUrl: './section-card.scss',
})
export class SectionCard {
  @Input() title = '';
  @Input() subtitle = '';
}
