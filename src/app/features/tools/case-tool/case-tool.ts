import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { SeoService } from '../../../core/services/seo';
import { CaseType, CASES, convertCase } from '../../../packages/toolkit/case-utils';

@Component({
  selector: 'app-case-tool',
  standalone: false,
  templateUrl: './case-tool.html',
})
export class CaseTool implements OnInit, OnDestroy {
  readonly form: FormGroup;
  caseType: CaseType = 'camel';
  caseLabel = '';
  result = '';
  copied = false;

  private routeSub = Subscription.EMPTY;
  private formSub = Subscription.EMPTY;

  constructor(
    fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
    private readonly seo: SeoService,
  ) {
    this.form = fb.group({ value: [''] });
  }

  ngOnInit(): void {
    this.routeSub = this.route.data.subscribe((data) => {
      this.caseType = data['caseType'] as CaseType;
      const def = CASES.find((c) => c.id === this.caseType);
      this.caseLabel = def?.label ?? this.caseType;
      this.seo.set(
        `${this.caseLabel} Converter`,
        `Converti testo nel formato ${this.caseLabel}. Strumento online gratuito.`,
      );
      this.result = convertCase(this.form.value.value ?? '', this.caseType);
      this.cdr.detectChanges();
    });
    this.formSub = this.form.valueChanges.subscribe(() => this.convert());
  }

  get caseExample(): string {
    return convertCase('Hello World', this.caseType);
  }

  convert(): void {
    this.result = convertCase(this.form.value.value ?? '', this.caseType);
  }

  clearResult(): void {
    this.result = '';
    this.form.patchValue({ value: '' }, { emitEvent: false });
  }

  async copy(): Promise<void> {
    if (!this.result) return;
    await navigator.clipboard.writeText(this.result);
    this.copied = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.copied = false;
      this.cdr.detectChanges();
    }, 1500);
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
    this.formSub.unsubscribe();
  }
}
