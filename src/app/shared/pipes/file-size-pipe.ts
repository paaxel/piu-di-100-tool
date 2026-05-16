import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fileSize', standalone: false })
export class FileSizePipe implements PipeTransform {
  transform(bytes: number | null | undefined): string {
    if (bytes === null || bytes === undefined || isNaN(bytes)) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1_048_576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1_048_576).toFixed(2) + ' MB';
  }
}
