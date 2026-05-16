import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { ToolCatalog } from '../../core/services/tool-catalog';

@Component({
  selector: 'app-shell',
  standalone: false,
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  searchQuery = '';
  currentLanguage: 'it' | 'en' = 'it';
  toolBottomDescription = '';
  showToolBottomDescription = false;

  private readonly routeToToolId: Map<string, string>;
  private readonly fallbackDescriptionByToolId: Map<string, string>;

  constructor(
    private readonly translateService: TranslateService,
    private readonly router: Router,
    toolCatalog: ToolCatalog,
  ) {
    const tools = toolCatalog.getAll();
    this.routeToToolId = new Map(tools.map((tool) => [tool.route, tool.id]));
    this.fallbackDescriptionByToolId = new Map(tools.map((tool) => [tool.id, tool.description]));

    this.translateService.use(this.currentLanguage);
    this.updateToolBottomDescription(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.updateToolBottomDescription(event.urlAfterRedirects));

    this.translateService.onLangChange.subscribe(() => this.updateToolBottomDescription(this.router.url));
  }

  setLanguage(language: 'it' | 'en'): void {
    this.currentLanguage = language;
    this.translateService.use(language);
  }

  submitSearch(): void {
    this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
  }

  private updateToolBottomDescription(url: string): void {
    const cleanUrl = this.cleanUrl(url);
    const toolId = this.routeToToolId.get(cleanUrl);

    if (!toolId) {
      this.showToolBottomDescription = false;
      this.toolBottomDescription = '';
      return;
    }

    this.showToolBottomDescription = true;
    this.toolBottomDescription = this.translateToolDescription(toolId);
  }

  private translateToolDescription(toolId: string): string {
    const longKey = `TOOL_CATALOG.${toolId}.LONG_DESCRIPTION`;
    const long = this.translateService.instant(longKey);
    if (long !== longKey) return long;

    const shortKey = `TOOL_CATALOG.${toolId}.DESCRIPTION`;
    const short = this.translateService.instant(shortKey);
    if (short !== shortKey) return short;

    return this.fallbackDescriptionByToolId.get(toolId) ?? '';
  }

  private cleanUrl(url: string): string {
    const [withoutQuery] = url.split('?');
    const [withoutHash] = withoutQuery.split('#');
    return withoutHash;
  }
}
