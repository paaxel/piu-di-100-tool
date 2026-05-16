import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Loader {
  private readonly loadingState = new BehaviorSubject(false);
  readonly loading$ = this.loadingState.asObservable();

  show(): void {
    this.loadingState.next(true);
  }

  hide(): void {
    this.loadingState.next(false);
  }
}
