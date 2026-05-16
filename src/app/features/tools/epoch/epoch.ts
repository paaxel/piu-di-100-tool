import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

@Component({
  selector: 'app-epoch',
  standalone: false,
  templateUrl: './epoch.html',
})
export class Epoch implements OnDestroy {
  readonly form: FormGroup;
  fromEpoch = '';
  fromDate = '';
  nowEpoch = Math.floor(Date.now() / 1000);
  private readonly intervalId: ReturnType<typeof setInterval>;

  constructor(fb: FormBuilder, private cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('Convertitore Epoch / Unix Timestamp', 'Converti tra timestamp Unix epoch e date leggibili. Strumento online gratuito.');
    this.form = fb.group({
      epoch: [this.nowEpoch],
      date: [new Date().toISOString().slice(0, 19)],
      unit: ['s'],
    });
    this.intervalId = setInterval(() => {
      this.nowEpoch = Math.floor(Date.now() / 1000);
      this.cdr.detectChanges();
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  convertFromEpoch(): void {
    const v = Number(this.form.controls['epoch'].value);
    const unit = this.form.controls['unit'].value;
    if (Number.isNaN(v)) { this.fromEpoch = ''; return; }
    const ms = unit === 'ms' ? v : v * 1000;
    const d = new Date(ms);
    this.fromEpoch = isNaN(d.getTime()) ? '' :
      `UTC: ${d.toUTCString()}\nISO: ${d.toISOString()}\nLocal: ${d.toString()}`;
  }

  convertFromDate(): void {
    const v = this.form.controls['date'].value;
    const d = new Date(v);
    if (isNaN(d.getTime())) { this.fromDate = ''; return; }
    const s = Math.floor(d.getTime() / 1000);
    this.fromDate = `Seconds: ${s}\nMilliseconds: ${d.getTime()}`;
  }
}
