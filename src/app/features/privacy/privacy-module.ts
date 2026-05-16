import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared-module';
import { PrivacyRoutingModule } from './privacy-routing-module';
import { Privacy } from './privacy';

@NgModule({
  declarations: [Privacy],
  imports: [CommonModule, SharedModule, PrivacyRoutingModule],
})
export class PrivacyModule {}
