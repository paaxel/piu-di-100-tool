import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly siteName = 'piu-di-100-tool.it';

  constructor(private readonly title: Title, private readonly meta: Meta) {}

  set(pageTitle: string, description: string): void {
    const fullTitle = `${pageTitle} — ${this.siteName}`;
    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
  }
}
