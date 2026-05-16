import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SeoService } from '../../../core/services/seo';

export interface TzEntry { id: string; label: string; }

// Common time zones with friendly labels
export const TIMEZONES: TzEntry[] = [
  { id: 'UTC', label: 'UTC' },
  { id: 'Europe/Rome', label: 'Roma (CET/CEST)' },
  { id: 'Europe/London', label: 'Londra (GMT/BST)' },
  { id: 'Europe/Paris', label: 'Parigi (CET/CEST)' },
  { id: 'Europe/Berlin', label: 'Berlino (CET/CEST)' },
  { id: 'Europe/Moscow', label: 'Mosca (MSK)' },
  { id: 'America/New_York', label: 'New York (ET)' },
  { id: 'America/Chicago', label: 'Chicago (CT)' },
  { id: 'America/Denver', label: 'Denver (MT)' },
  { id: 'America/Los_Angeles', label: 'Los Angeles (PT)' },
  { id: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
  { id: 'Africa/Cairo', label: 'Il Cairo (EET)' },
  { id: 'Africa/Nairobi', label: 'Nairobi (EAT)' },
  { id: 'Asia/Dubai', label: 'Dubai (GST)' },
  { id: 'Asia/Kolkata', label: 'Mumbai/Delhi (IST)' },
  { id: 'Asia/Bangkok', label: 'Bangkok (ICT)' },
  { id: 'Asia/Shanghai', label: 'Shanghai/Pechino (CST)' },
  { id: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { id: 'Asia/Seoul', label: 'Seoul (KST)' },
  { id: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
  { id: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)' },
];

function formatInTz(date: Date, tz: string): string {
  return new Intl.DateTimeFormat('it-IT', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).format(date);
}

function getOffset(date: Date, tz: string): string {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: tz, timeZoneName: 'shortOffset',
  }).formatToParts(date);
  return parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
}

@Component({
  selector: 'app-timezone-converter',
  standalone: false,
  templateUrl: './timezone-converter.html',
})
export class TimezoneConverter implements OnInit {
  readonly form: FormGroup;
  readonly timezones = TIMEZONES;
  results: { tz: TzEntry; formatted: string; offset: string }[] = [];

  constructor(fb: FormBuilder, seo: SeoService) {
    seo.set('Convertitore Fuso Orario', 'Converti un orario tra i principali fusi orari del mondo. Strumento online per team distribuiti.');
    const now = new Date();
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
      .toISOString().slice(0, 16);
    this.form = fb.group({
      datetime: [localIso, Validators.required],
      sourceTz: ['Europe/Rome', Validators.required],
    });
    this.form.valueChanges.subscribe(() => this.convert());
  }

  ngOnInit(): void { this.convert(); }

  convert(): void {
    const { datetime, sourceTz } = this.form.value;
    if (!datetime || !sourceTz) { this.results = []; return; }

    // Parse the local datetime string as if it's in the source timezone
    // We do this by formatting a date in the target tz that matches the input
    const [datePart, timePart] = datetime.split('T');
    const [y, mo, d] = datePart.split('-').map(Number);
    const [h, mi] = (timePart ?? '00:00').split(':').map(Number);

    // Build a UTC date that corresponds to the given local time in sourceTz
    // Approach: try a candidate UTC time and adjust offset iteratively
    const candidate = new Date(Date.UTC(y, mo - 1, d, h, mi));
    const offsetMs = this.getOffsetMs(candidate, sourceTz);
    const utc = new Date(candidate.getTime() - offsetMs);

    this.results = this.timezones.map((tz) => ({
      tz,
      formatted: formatInTz(utc, tz.id),
      offset: getOffset(utc, tz.id),
    }));
  }

  private getOffsetMs(date: Date, tz: string): number {
    const utcStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).format(date);
    // en-CA gives YYYY-MM-DD, HH:MM:SS
    const clean = utcStr.replace(', ', 'T');
    const local = new Date(clean + 'Z');
    return local.getTime() - date.getTime();
  }
}
