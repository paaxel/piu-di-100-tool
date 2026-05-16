import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared-module';
import { TermsRoutingModule } from './terms-routing-module';
import { Terms } from './terms';

@NgModule({
  declarations: [Terms],
  imports: [CommonModule, SharedModule, TermsRoutingModule],
})
export class TermsModule {}
