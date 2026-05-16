import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CodiceFiscaleInverso } from './codice-fiscale-inverso';

const routes: Routes = [{ path: '', component: CodiceFiscaleInverso }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CodiceFiscaleInversoRoutingModule {}
