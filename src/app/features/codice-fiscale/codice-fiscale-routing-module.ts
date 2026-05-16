import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CodiceFiscale } from './codice-fiscale';

const routes: Routes = [{ path: '', component: CodiceFiscale }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CodiceFiscaleRoutingModule {}
