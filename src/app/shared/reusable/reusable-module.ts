import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SectionCard } from './section-card/section-card';
import { ResultPanel } from './result-panel/result-panel';
import { PlaceAutocomplete } from './place-autocomplete/place-autocomplete';
import { FileDropzone } from './file-dropzone/file-dropzone';

@NgModule({
  declarations: [SectionCard, ResultPanel, PlaceAutocomplete, FileDropzone],
  imports: [CommonModule, TranslateModule],
  exports: [SectionCard, ResultPanel, PlaceAutocomplete, FileDropzone],
})
export class ReusableModule {}
