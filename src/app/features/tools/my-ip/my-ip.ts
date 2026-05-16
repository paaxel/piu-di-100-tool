import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { catchError, of } from 'rxjs';
import { SeoService } from '../../../core/services/seo';

@Component({
  selector: 'app-my-ip',
  standalone: false,
  templateUrl: './my-ip.html',
})
export class MyIp {
  ip = '';
  loading = false;
  error = '';

  constructor(private readonly http: HttpClient, private cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('Il Mio Indirizzo IP Pubblico', 'Scopri il tuo indirizzo IP pubblico corrente in un istante. Strumento online gratuito.');
  }

  fetch(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();
    this.http
      .get<{ ip: string }>('https://api.ipify.org?format=json')
      .pipe(
        catchError((e) => {
          this.error = e?.message || 'Network error';
          return of({ ip: '' });
        }),
      )
      .subscribe((res) => {
        this.ip = res.ip;
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  copy(): void {
    navigator.clipboard?.writeText(this.ip).catch(() => undefined);
  }
}
