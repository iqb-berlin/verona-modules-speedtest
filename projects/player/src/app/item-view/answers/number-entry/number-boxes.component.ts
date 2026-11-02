import {
  Component, EventEmitter, Input, Output,
  ChangeDetectionStrategy
} from '@angular/core';

/* One box per digit on a common base line; the active box is highlighted and any box can be chosen. Locked
   boxes get light borders but still report clicks; the parent decides what a click does. */
@Component({
  selector: 'speedtest-player-number-boxes',
  template: `
    <div class="boxes">
      @for (digit of digits; track $index) {
        <button [class.active]="$index === activeIndex" [class.locked]="locked"
                [attr.aria-disabled]="locked"
                [attr.aria-label]="'Ziffer ' + ($index + 1)"
                (click)="boxClick.emit($index)">{{ digit }}</button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: `
    :host {
      display: block;
    }
    .boxes {
      display: flex;
      justify-content: center;
      gap: 5px;
      padding: 5px;
      border-bottom: 2px solid black;
    }
    button {
      width: 50px;
      height: 70px;
      padding: 0;
      border: 1px dotted black;
      background: transparent;
      color: black;
      font-family: inherit;
      font-size: xx-large;
      cursor: pointer;
    }
    button.locked {
      border-color: lightgray;
      cursor: default;
    }
    button.active {
      background-color: #00606425;
    }
  `
})
export class NumberBoxesComponent {
  @Input() digits: (number | undefined)[] = [];
  @Input() activeIndex = 0;
  @Input() locked = false;
  @Output() boxClick = new EventEmitter<number>();
}
