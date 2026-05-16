import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing-module';
import { Home } from './home';
import { SharedModule } from '../../shared/shared-module';

@NgModule({
  declarations: [Home],
  imports: [CommonModule, SharedModule, HomeRoutingModule],
})
export class HomeModule {}
