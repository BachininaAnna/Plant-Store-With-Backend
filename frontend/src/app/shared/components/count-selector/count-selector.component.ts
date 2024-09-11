import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'count-selector',
  templateUrl: './count-selector.component.html',
  styleUrls: ['./count-selector.component.scss']
})
export class CountSelectorComponent {

  @Input() count: number = 1;

  @Output() countChange: EventEmitter<number> = new EventEmitter<number>();

  countChanges() {
    this.countChange.emit(this.count);
  }

  decrease() {
    if (this.count > 1) {
      this.count--;
      this.countChanges();
    }
  }

  increase() {
    if (this.count < 100) {
      this.count++;
      this.countChanges();
    }
  }
}
