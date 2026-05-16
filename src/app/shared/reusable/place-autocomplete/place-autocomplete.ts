import { Component, ElementRef, forwardRef, HostListener, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

function normalize(value: string): string {
  return value
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const MAX_RESULTS = 20;

@Component({
  selector: 'app-place-autocomplete',
  standalone: false,
  templateUrl: './place-autocomplete.html',
  styleUrl: './place-autocomplete.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PlaceAutocomplete),
      multi: true,
    },
  ],
})
export class PlaceAutocomplete implements ControlValueAccessor {
  @Input() items: string[] = [];
  @Input() placeholder = '';
  @Input() hintLabel = 'Type to search…';

  query = '';
  suggestions: string[] = [];
  isOpen = false;
  showHint = false;
  activeIndex = -1;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private readonly elRef: ElementRef<HTMLElement>) {}

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query = value;
    this.activeIndex = -1;
    this.showHint = false;
    this.suggestions = this.search(value);
    this.isOpen = this.suggestions.length > 0;
    if (!value.trim()) {
      this.onChange('');
      this.onTouched();
    }
  }

  onFocus(): void {
    if (this.query) {
      this.suggestions = this.search(this.query);
      this.isOpen = this.suggestions.length > 0;
    } else {
      this.showHint = true;
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.isOpen) return;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex = Math.min(this.activeIndex + 1, this.suggestions.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex = Math.max(this.activeIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.activeIndex >= 0) {
          this.select(this.suggestions[this.activeIndex]);
        }
        break;
      case 'Escape':
        this.isOpen = false;
        break;
    }
  }

  select(item: string): void {
    this.query = item;
    this.isOpen = false;
    this.activeIndex = -1;
    this.onChange(item);
    this.onTouched();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elRef.nativeElement.contains(event.target as Node)) {
      this.isOpen = false;
      this.showHint = false;
    }
  }

  private search(query: string): string[] {
    const q = normalize(query.trim());
    if (q.length < 1) return [];

    const starts: string[] = [];
    const contains: string[] = [];

    for (const item of this.items) {
      const n = normalize(item);
      if (n.startsWith(q)) {
        starts.push(item);
        // Enough prefix matches — keep scanning for more but exit early if list is full
        if (starts.length >= MAX_RESULTS) break;
      } else if (n.includes(q)) {
        contains.push(item);
      }
    }

    return [...starts, ...contains].slice(0, MAX_RESULTS);
  }

  writeValue(value: string): void {
    this.query = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // future: disable the inner input via ViewChild
  }
}
