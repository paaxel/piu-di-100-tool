import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CodiceFiscaleRoutingModule } from './codice-fiscale-routing-module';
import { CodiceFiscale } from './codice-fiscale';
import { SharedModule } from '../../shared/shared-module';

@NgModule({
  declarations: [CodiceFiscale],
  imports: [CommonModule, SharedModule, CodiceFiscaleRoutingModule],
})
export class CodiceFiscaleModule {}
