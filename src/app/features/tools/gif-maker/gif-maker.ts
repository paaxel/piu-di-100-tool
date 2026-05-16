import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { SeoService } from '../../../core/services/seo';
import { ImageProcessorService } from '../../../core/services/image-processor';

interface GifFrame {
  name: string;
  preview: SafeUrl;
  image: HTMLImageElement;
}

// ─── Color quantization ───────────────────────────────────────────────────────

function buildPaletteAndLut(
  pixelArrays: Uint8ClampedArray[],
): { palette: Uint8Array; lut: Uint8Array } {
  // Frequency table for 5-bit-per-channel quantized colors (32^3 = 32768 buckets)
  const freq = new Uint32Array(32768);
  for (const d of pixelArrays) {
    for (let i = 0; i < d.length; i += 4) {
      freq[((d[i] >> 3) << 10) | ((d[i + 1] >> 3) << 5) | (d[i + 2] >> 3)]++;
    }
  }

  // Pick the 256 most frequent buckets
  const entries: Array<[number, number]> = [];
  for (let k = 0; k < 32768; k++) if (freq[k]) entries.push([k, freq[k]]);
  entries.sort((a, b) => b[1] - a[1]);
  const top = entries.slice(0, 256).map(e => e[0]);

  // Build flat palette array (256 × 3 bytes, R,G,B)
  const palette = new Uint8Array(768);
  for (let i = 0; i < top.length; i++) {
    palette[i * 3]     = (top[i] >> 10) << 3;
    palette[i * 3 + 1] = ((top[i] >> 5) & 0x1f) << 3;
    palette[i * 3 + 2] = (top[i] & 0x1f) << 3;
  }

  // Build 32768-entry lookup table: quantized-RGB key → nearest palette index
  const lut = new Uint8Array(32768);
  for (let k = 0; k < 32768; k++) {
    const kr = (k >> 10) << 3;
    const kg = ((k >> 5) & 0x1f) << 3;
    const kb = (k & 0x1f) << 3;
    let best = 0, bestD = Infinity;
    for (let j = 0; j < top.length; j++) {
      const d =
        (kr - palette[j * 3]) ** 2 +
        (kg - palette[j * 3 + 1]) ** 2 +
        (kb - palette[j * 3 + 2]) ** 2;
      if (d < bestD) { bestD = d; best = j; }
    }
    lut[k] = best;
  }
  return { palette, lut };
}

function renderFramePixels(img: HTMLImageElement, w: number, h: number): Uint8ClampedArray {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h).data;
}

function pixelsToIndices(data: Uint8ClampedArray, lut: Uint8Array): Uint8Array {
  const n = data.length >> 2;
  const idx = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    idx[i] = lut[((data[i * 4] >> 3) << 10) | ((data[i * 4 + 1] >> 3) << 5) | (data[i * 4 + 2] >> 3)];
  }
  return idx;
}

// ─── LZW encoder ─────────────────────────────────────────────────────────────

function lzwEncode(indices: Uint8Array, minCode: number): number[] {
  const cc = 1 << minCode;   // clear code (256)
  const ec = cc + 1;         // EOI   (257)
  let cs = minCode + 1;      // current code size (9 bits)
  let nc = ec + 1;           // next code to assign

  // Open-addressed hash table: key = (prefix << 8) | suffix (20-bit)
  const T = 9973;            // prime, gives ~38% load factor
  const hk = new Int32Array(T).fill(-1);
  const hv = new Uint16Array(T);

  const htReset = () => { hk.fill(-1); cs = minCode + 1; nc = ec + 1; };
  const htGet = (k: number): number => {
    let h = ((k * 2654435761) >>> 0) % T;
    while (hk[h] !== -1 && hk[h] !== k) h = (h + 1) % T;
    return hk[h] === k ? hv[h] : -1;
  };
  const htSet = (k: number, v: number) => {
    let h = ((k * 2654435761) >>> 0) % T;
    while (hk[h] !== -1 && hk[h] !== k) h = (h + 1) % T;
    hk[h] = k; hv[h] = v;
  };

  const out: number[] = [];
  let buf = 0, pos = 0;
  const emit = (c: number) => {
    buf |= c << pos; pos += cs;
    while (pos >= 8) { out.push(buf & 0xff); buf >>>= 8; pos -= 8; }
  };

  htReset();
  emit(cc);

  let prefix = -1;
  for (let i = 0; i < indices.length; i++) {
    const s = indices[i];
    if (prefix < 0) { prefix = s; continue; }
    const k = (prefix << 8) | s;
    const f = htGet(k);
    if (f >= 0) { prefix = f; continue; }
    emit(prefix);
    if (nc < 4096) {
      htSet(k, nc++);
      if (nc > (1 << cs) && cs < 12) cs++;
    } else { emit(cc); htReset(); }
    prefix = s;
  }
  if (prefix >= 0) emit(prefix);
  emit(ec);
  if (pos > 0) out.push(buf & 0xff);
  return out;
}

// ─── GIF assembler ───────────────────────────────────────────────────────────

function encodeGif(
  frames: Array<{ indices: Uint8Array; delay: number }>,
  palette: Uint8Array,
  w: number,
  h: number,
): Uint8Array {
  const b: number[] = [];
  const u16 = (n: number) => b.push(n & 0xff, (n >> 8) & 0xff);

  // Header + Logical Screen Descriptor
  for (const c of 'GIF89a') b.push(c.charCodeAt(0));
  u16(w); u16(h);
  b.push(0b10000111, 0, 0); // global CT flag, 256 colors, bg=0, aspect=0

  // Global Color Table
  for (let i = 0; i < 768; i++) b.push(palette[i]);

  // Netscape looping extension (infinite loop)
  b.push(0x21, 0xff, 0x0b);
  for (const c of 'NETSCAPE2.0') b.push(c.charCodeAt(0));
  b.push(3, 1, 0, 0, 0);

  for (const f of frames) {
    const delay = Math.max(1, Math.round(f.delay / 10)); // centiseconds

    // Graphic Control Extension
    b.push(0x21, 0xf9, 0x04, 0x00); u16(delay); b.push(0, 0);

    // Image Descriptor
    b.push(0x2c); u16(0); u16(0); u16(w); u16(h); b.push(0);

    // LZW image data
    b.push(8);
    const lzw = lzwEncode(f.indices, 8);
    let i = 0;
    while (i < lzw.length) {
      const n = Math.min(255, lzw.length - i);
      b.push(n);
      for (let j = 0; j < n; j++) b.push(lzw[i++]);
    }
    b.push(0); // block terminator
  }

  b.push(0x3b); // GIF Trailer
  return new Uint8Array(b);
}

// ─── Component ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-gif-maker',
  standalone: false,
  templateUrl: './gif-maker.html',
})
export class GifMaker implements OnDestroy {
  frames: GifFrame[] = [];
  delay = 200;    // ms per frame
  maxDim = 320;   // output max dimension
  outputPreview: SafeUrl | null = null;
  outputSize = 0;
  isProcessing = false;
  error = '';

  private outputUrl = '';

  constructor(
    private readonly images: ImageProcessorService,
    private readonly cdr: ChangeDetectorRef,
    seo: SeoService,
  ) {
    seo.set('GIF Maker', 'Crea GIF animate da più immagini nel browser. Nessun upload, gratis.');
  }

  ngOnDestroy(): void {
    this.images.revoke(this.outputUrl);
  }

  async onFilesChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    for (const file of files) {
      const loaded = await this.images.load(file, 'image/*');
      if (!loaded) continue;
      this.frames.push({ name: file.name, preview: loaded.preview, image: loaded.image });
    }
    this.cdr.detectChanges();
  }

  removeFrame(i: number): void { this.frames.splice(i, 1); }

  moveUp(i: number): void {
    if (i > 0) [this.frames[i - 1], this.frames[i]] = [this.frames[i], this.frames[i - 1]];
  }

  moveDown(i: number): void {
    if (i < this.frames.length - 1)
      [this.frames[i], this.frames[i + 1]] = [this.frames[i + 1], this.frames[i]];
  }

  async build(): Promise<void> {
    if (!this.frames.length) { this.error = 'Aggiungi almeno un frame.'; return; }
    this.isProcessing = true;
    this.error = '';
    this.cdr.detectChanges();

    try {
      const first = this.frames[0].image;
      const scale = Math.min(1, this.maxDim / Math.max(first.naturalWidth, first.naturalHeight));
      const w = Math.max(1, Math.round(first.naturalWidth * scale));
      const h = Math.max(1, Math.round(first.naturalHeight * scale));

      const pixelArrays = this.frames.map(f => renderFramePixels(f.image, w, h));
      const { palette, lut } = buildPaletteAndLut(pixelArrays);
      const encodedFrames = pixelArrays.map(pd => ({
        indices: pixelsToIndices(pd, lut),
        delay: this.delay,
      }));

      const gifBytes = encodeGif(encodedFrames, palette, w, h);
      const blob = new Blob([gifBytes.buffer as ArrayBuffer], { type: 'image/gif' });
      this.images.revoke(this.outputUrl);
      const { url, safeUrl } = this.images.toPreview(blob);
      this.outputUrl = url;
      this.outputPreview = safeUrl;
      this.outputSize = blob.size;
    } catch {
      this.error = 'Errore durante la creazione della GIF.';
    } finally {
      this.isProcessing = false;
      this.cdr.detectChanges();
    }
  }

  download(): void {
    if (this.outputUrl) this.images.download(this.outputUrl, 'animated.gif');
  }

  reset(): void {
    this.frames = [];
    this.images.revoke(this.outputUrl);
    this.outputUrl = '';
    this.outputPreview = null;
    this.outputSize = 0;
    this.error = '';
  }

  get fileSizePct(): number {
    return this.outputSize > 0 ? Math.round(this.outputSize / 1024) : 0;
  }
}
