import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-result-panel',
  standalone: false,
  templateUrl: './result-panel.html',
  styleUrl: './result-panel.scss',
})
export class ResultPanel {
  @Input() label = '';
  @Input() value = '';
  @Input() placeholder = '';
  @Input() safeHtml: SafeHtml | null = null;
  @Output() cleared = new EventEmitter<void>();

  clear(): void {
    this.cleared.emit();
  }

  async copyValue(): Promise<void> {
    if (!this.value) {
      return;
    }
    await navigator.clipboard.writeText(this.value);
  }
}
