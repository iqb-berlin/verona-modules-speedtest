import {
  Component, EventEmitter, Input, Output,
  ChangeDetectionStrategy
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';

/* Digits 0–9 in one line and a delete key. Locked keys get light borders but still report clicks; the
   parent decides what a click does. */
@Component({
  selector: 'speedtest-player-keypad',
  imports: [MatIcon],
  template: `
    <div class="keys">
      @for (digit of digits; track digit) {
        <button [class.locked]="locked" [attr.aria-disabled]="locked"
                (click)="digitClick.emit(digit)">{{ digit }}</button>
      }
      <button class="delete" aria-label="löschen" [class.locked]="locked" [attr.aria-disabled]="locked"
              (click)="deleteClick.emit()">
        <mat-icon>backspace</mat-icon>
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: `
    :host {
      display: block;
    }
    .keys {
      display: flex;
      justify-content: center;
      gap: 10px;
    }
    button {
      flex: none;
      width: 55px;
      height: 50px;
      border: 1px solid black;
      border-radius: 5px;
      color: black;
      font-family: inherit;
      font-size: 25px;
      cursor: pointer;
    }
    button.locked {
      border-color: lightgray;
      cursor: default;
    }
    button.delete {
      width: 110px;
      margin-left: 20px;
      display: grid;
      place-items: center;
    }
  `
})
export class KeypadComponent {
  @Input() locked = false;
  @Output() digitClick = new EventEmitter<number>();
  @Output() deleteClick = new EventEmitter<void>();

  readonly digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
}
