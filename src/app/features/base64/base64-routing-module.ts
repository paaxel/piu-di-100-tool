import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Base64 } from './base64';

const routes: Routes = [{ path: '', component: Base64 }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Base64RoutingModule {}
