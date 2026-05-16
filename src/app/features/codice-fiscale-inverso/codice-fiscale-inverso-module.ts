import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CodiceFiscaleInversoRoutingModule } from './codice-fiscale-inverso-routing-module';
import { CodiceFiscaleInverso } from './codice-fiscale-inverso';
import { SharedModule } from '../../shared/shared-module';

@NgModule({
  declarations: [CodiceFiscaleInverso],
  imports: [CommonModule, SharedModule, CodiceFiscaleInversoRoutingModule],
})
export class CodiceFiscaleInversoModule {}
