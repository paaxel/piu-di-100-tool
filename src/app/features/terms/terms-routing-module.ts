import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Terms } from './terms';

const routes: Routes = [{ path: '', component: Terms }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TermsRoutingModule {}
