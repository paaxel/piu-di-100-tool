import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SearchRoutingModule } from './search-routing-module';
import { Search } from './search';
import { SharedModule } from '../../shared/shared-module';

@NgModule({
  declarations: [Search],
  imports: [CommonModule, SharedModule, SearchRoutingModule],
})
export class SearchModule {}
