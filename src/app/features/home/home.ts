import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../core/services/seo';
import { ToolCatalog } from '../../core/services/tool-catalog';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  search = '';
  readonly featuredTools;

  constructor(
    private readonly toolCatalog: ToolCatalog,
    private readonly router: Router,
    private readonly translate: TranslateService,
    seo: SeoService,
  ) {
    this.featuredTools = this.toolCatalog.getFeatured();
    seo.set(
      'Oltre 100 Strumenti Online Gratuiti',
      'Strumenti online gratuiti per sviluppatori e utenti: formattatore JSON, codifica Base64, verifica IBAN, decoder JWT, generatore Codice Fiscale e molto altro.',
    );
  }

  getToolName(id: string, fallback: string): string {
    return this.translateWithFallback(`TOOL_CATALOG.${id}.NAME`, fallback);
  }

  getToolDescription(id: string, fallback: string): string {
    return this.translateWithFallback(`TOOL_CATALOG.${id}.DESCRIPTION`, fallback);
  }

  private translateWithFallback(key: string, fallback: string): string {
    const value = this.translate.instant(key);
    return value === key ? fallback : value;
  }

  openSearch(): void {
    this.router.navigate(['/search'], { queryParams: { q: this.search } });
  }

  exploreAll(): void {
    this.router.navigate(['/search']);
  }
}
