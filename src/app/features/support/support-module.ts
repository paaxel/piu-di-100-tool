import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared-module';
import { SupportRoutingModule } from './support-routing-module';
import { Support } from './support';

@NgModule({
  declarations: [Support],
  imports: [CommonModule, SharedModule, SupportRoutingModule],
})
export class SupportModule {}
