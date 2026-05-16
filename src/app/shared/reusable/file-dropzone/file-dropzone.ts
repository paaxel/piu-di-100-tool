import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-file-dropzone',
  standalone: false,
  templateUrl: './file-dropzone.html',
  styleUrl: './file-dropzone.scss',
})
export class FileDropzone {
  @Input() accept = '*';
  @Input() label = '';
  @Output() fileChange = new EventEmitter<File>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isDragOver = false;
  selectedFileName = '';

  get acceptHint(): string {
    if (!this.accept || this.accept === '*') return '';
    const parts = this.accept
      .split(',')
      .map(m => {
        const sub = m.trim().split('/')[1]?.toUpperCase() ?? m.trim();
        return sub === '*' ? '' : sub;
      })
      .filter(Boolean);
    return [...new Set(parts)].join(', ');
  }

  openPicker(): void {
    this.fileInput.nativeElement.click();
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    this.isDragOver = false;
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragOver = false;
    const file = e.dataTransfer?.files[0];
    if (file) this.emit(file);
  }

  onInputChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) this.emit(file);
  }

  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.openPicker();
    }
  }

  clear(): void {
    this.selectedFileName = '';
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private emit(file: File): void {
    this.selectedFileName = file.name;
    this.fileChange.emit(file);
  }
}
