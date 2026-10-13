import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

/* The host element takes the click; the parent binds (click) on it. Locked, it looks flat but still takes
   the click; the parent decides what a click does. */
@Component({
  selector: 'speedtest-player-next-button',
  template: `
    <button aria-label="weiter" [class.locked]="locked" [attr.aria-disabled]="locked">
      <svg width="85" height="85" viewBox="0 0 85 85" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle class="shadow" cx="46.5" cy="46.5" r="38.5" fill="#d1dfe3"/>
        <circle cx="40" cy="40" r="40" fill="#196175"/>
        <path d="M 43.154718,54.799642 57.996287,39.958072 43.154718,25.116502"
              stroke="#ffffff" stroke-width="5.7083" stroke-linecap="round"/>
        <path d="m 21.919857,39.958072 c 11.41667,0.06623 22.833048,-0.052 34.249776,0"
              stroke="#ffffff" stroke-width="5.7083" stroke-linecap="round"/>
      </svg>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: `
    button {
      display: block;
      padding: 0;
      margin: 5px;
      border: none;
      background: transparent;
      cursor: pointer;

      &:hover {
        filter: brightness(90%);
      }

      &.locked {
        cursor: default;
        filter: none;
      }
    }
    // Locked, the button looks flat: without the circle that is its shadow.
    .locked .shadow {
      visibility: hidden;
    }
  `
})
export class NextButtonComponent {
  @Input() locked = false;
}
