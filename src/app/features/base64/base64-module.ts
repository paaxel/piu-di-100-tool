import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Base64RoutingModule } from './base64-routing-module';
import { Base64 } from './base64';
import { SharedModule } from '../../shared/shared-module';

@NgModule({
  declarations: [Base64],
  imports: [CommonModule, SharedModule, Base64RoutingModule],
})
export class Base64Module {}
