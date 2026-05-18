import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule, Translation } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Shell } from './layout/shell/shell';
import { GlobalLoader } from './shared/reusable/global-loader/global-loader';
import { SharedModule } from './shared/shared-module';

const TRANSLATIONS_VERSION = 1;

class JsonTranslateLoader implements TranslateLoader {
  constructor(private readonly http: HttpClient) {}

  getTranslation(lang: string): Observable<Translation> {
    return this.http.get<Translation>(`./i18n/${lang}.json?v=${TRANSLATIONS_VERSION}`);
  }
}

export function httpLoaderFactory(http: HttpClient): TranslateLoader {
  return new JsonTranslateLoader(http);
}

@NgModule({
  declarations: [App, Shell, GlobalLoader],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    SharedModule,
    TranslateModule.forRoot({
      defaultLanguage: 'it',
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    AppRoutingModule,
  ],
  providers: [provideBrowserGlobalErrorListeners(), provideHttpClient(withFetch())],
  bootstrap: [App],
})
export class AppModule {}
