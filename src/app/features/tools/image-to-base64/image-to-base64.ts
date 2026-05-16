import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { SeoService } from '../../../core/services/seo';
import { ImageProcessorService } from '../../../core/services/image-processor';

type OutputMode = 'dataUrl' | 'raw';

@Component({
  selector: 'app-image-to-base64',
  standalone: false,
  templateUrl: './image-to-base64.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageToBase64 {
  inputPreview: SafeUrl | null = null;
  inputName = '';
  inputSize = 0;
  mimeType = '';
  dataUrl = '';
  rawBase64 = '';
  outputMode: OutputMode = 'dataUrl';
  error = '';
  copied = false;

  private readonly previewLimit = 12_000;
  private readonly downloadThreshold = 50_000;

  constructor(
    private readonly images: ImageProcessorService,
    private readonly cdr: ChangeDetectorRef,
    seo: SeoService,
  ) {
    seo.set(
      'Image to Base64',
      'Convert image files to Base64 strings or data URLs directly in your browser. Download the output as TXT when it becomes too long to copy comfortably.',
    );
  }

  get output(): string {
    return this.outputMode === 'dataUrl' ? this.dataUrl : this.rawBase64;
  }

  get displayOutput(): string {
    if (this.output.length <= this.previewLimit) {
      return this.output;
    }

    return `${this.output.slice(0, this.previewLimit)}\n\n...[preview truncated]...`;
  }

  get isLongOutput(): boolean {
    return this.output.length > this.downloadThreshold;
  }

  async onFile(file: File): Promise<void> {
    try {
      const loaded = await this.images.load(file);
      if (!loaded) {
        this.reset();
        this.error = 'FORMAT';
        this.cdr.markForCheck();
        return;
      }

      this.error = '';
      this.copied = false;
      this.inputPreview = loaded.preview;
      this.inputName = loaded.baseName;
      this.inputSize = loaded.size;
      this.mimeType = loaded.file.type;
      this.dataUrl = loaded.dataUrl;
      this.rawBase64 = loaded.dataUrl.split(',', 2)[1] ?? '';
      this.cdr.markForCheck();
    } catch {
      this.reset();
      this.error = 'FORMAT';
      this.cdr.markForCheck();
    }
  }

  async copy(): Promise<void> {
    if (!this.output) return;
    await navigator.clipboard.writeText(this.output);
    this.copied = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.copied = false;
      this.cdr.markForCheck();
    }, 1500);
  }

  downloadText(): void {
    if (!this.output) return;
    const blob = new Blob([this.output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.inputName || 'image'}-${this.outputMode === 'dataUrl' ? 'data-url' : 'base64'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  reset(): void {
    this.inputPreview = null;
    this.inputName = '';
    this.inputSize = 0;
    this.mimeType = '';
    this.dataUrl = '';
    this.rawBase64 = '';
    this.outputMode = 'dataUrl';
    this.copied = false;
    this.error = '';
  }
}