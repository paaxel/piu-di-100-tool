import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Loader } from '../../../core/services/loader';

@Component({
  selector: 'app-global-loader',
  standalone: false,
  templateUrl: './global-loader.html',
  styleUrl: './global-loader.scss',
})
export class GlobalLoader {
  readonly loading$: Observable<boolean>;

  constructor(loaderService: Loader) {
    this.loading$ = loaderService.loading$;
  }
}
