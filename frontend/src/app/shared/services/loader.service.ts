import {Injectable} from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  showLoader$: Subject<boolean> = new Subject<boolean>();

  constructor() {
  }

  show() {
    this.showLoader$.next(true);
  }

  hide() {
      this.showLoader$.next(false);
  }

}
