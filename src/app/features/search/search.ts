import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../core/services/seo';
import { ToolCatalog, ToolCatalogItem } from '../../core/services/tool-catalog';
import { fuzzySearch } from '../../packages/toolkit/fuzzy-search-utils';

@Component({
  selector: 'app-search',
  standalone: false,
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search implements OnInit, OnDestroy {
  query = '';
  results: ToolCatalogItem[] = [];

  private readonly destroy$ = new Subject<void>();
  private readonly queryChange$ = new Subject<string>();
  page = 1;
  readonly pageSize = 10;

  get totalTools(): number {
    return this.toolCatalog.getAll().length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.results.length / this.pageSize));
  }

  get pagedResults(): ToolCatalogItem[] {
    const start = (this.page - 1) * this.pageSize;
    return this.results.slice(start, start + this.pageSize);
  }

  get firstItem(): number {
    return this.results.length === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }

  get lastItem(): number {
    return Math.min(this.page * this.pageSize, this.results.length);
  }

  get pages(): number[] {
    const total = this.totalPages;
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    let start = Math.max(1, this.page - 2);
    let end = start + 4;
    if (end > total) {
      end = total;
      start = Math.max(1, end - 4);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }


  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly toolCatalog: ToolCatalog,
    private readonly translate: TranslateService,
    private readonly cdr: ChangeDetectorRef,
    seo: SeoService,
  ) {
    seo.set('Ricerca Tool', 'Cerca tra oltre 100 strumenti online gratuiti per sviluppatori e non.');
  }

  getToolName(tool: ToolCatalogItem): string {
    return this.translateWithFallback(`TOOL_CATALOG.${tool.id}.NAME`, tool.name);
  }

  getToolDescription(tool: ToolCatalogItem): string {
    return this.translateWithFallback(`TOOL_CATALOG.${tool.id}.DESCRIPTION`, tool.description);
  }

  getToolCategory(tool: ToolCatalogItem): string {
    const key = tool.category.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
    return this.translateWithFallback(`TOOL_CATEGORIES.${key}`, tool.category);
  }

  ngOnInit(): void {
    this.queryChange$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(() => {
      this.page = 1;
      this.runSearch();
      this.cdr.detectChanges();
    });

    this.route.queryParamMap.subscribe((params) => {
      this.query = params.get('q') ?? '';
      this.runSearch();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onQueryChange(value: string): void {
    this.query = value;
    this.queryChange$.next(value);
  }

  submitSearch(): void {
    this.router.navigate(['/search'], { queryParams: { q: this.query } });
  }

  private runSearch(): void {
    const all = this.toolCatalog.getAll();
    this.results = fuzzySearch(all, this.query, ['name', 'description', 'category', 'tags'], all.length);
    this.page = 1;
  }

  private translateWithFallback(key: string, fallback: string): string {
    const value = this.translate.instant(key);
    return value === key ? fallback : value;
  }
}
