import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/home/home-module').then((m) => m.HomeModule),
  },
  {
    path: 'search',
    loadChildren: () => import('./features/search/search-module').then((m) => m.SearchModule),
  },
  {
    path: 'calcola-codice-fiscale',
    loadChildren: () =>
      import('./features/codice-fiscale/codice-fiscale-module').then((m) => m.CodiceFiscaleModule),
  },
  {
    path: 'codice-fiscale-inverso',
    loadChildren: () =>
      import('./features/codice-fiscale-inverso/codice-fiscale-inverso-module').then(
        (m) => m.CodiceFiscaleInversoModule,
      ),
  },
  {
    path: 'base64',
    loadChildren: () => import('./features/base64/base64-module').then((m) => m.Base64Module),
  },
  {
    path: 'tools',
    loadChildren: () => import('./features/tools/tools-module').then((m) => m.ToolsModule),
  },
  {
    path: 'privacy',
    loadChildren: () => import('./features/privacy/privacy-module').then((m) => m.PrivacyModule),
  },
  {
    path: 'termini',
    loadChildren: () => import('./features/terms/terms-module').then((m) => m.TermsModule),
  },
  {
    path: 'supporto',
    loadChildren: () => import('./features/support/support-module').then((m) => m.SupportModule),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
