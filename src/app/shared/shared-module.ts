import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ReusableModule } from './reusable/reusable-module';
import { EmptyFallbackPipe } from './pipes/empty-fallback-pipe';
import { AbsPipe } from './pipes/abs-pipe';
import { FileSizePipe } from './pipes/file-size-pipe';
import { SyntaxHighlightPipe } from './pipes/syntax-highlight-pipe';

@NgModule({
  declarations: [EmptyFallbackPipe, AbsPipe, FileSizePipe, SyntaxHighlightPipe],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, ReusableModule],
  exports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, ReusableModule, EmptyFallbackPipe, AbsPipe, FileSizePipe, SyntaxHighlightPipe],
})
export class SharedModule {}
