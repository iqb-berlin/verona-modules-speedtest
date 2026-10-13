import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'speedtest-player-text-question',
  template: '<p>{{ text }}</p>',
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: `
    :host {
      display: block;
    }
    p {
      margin: 0;
      text-align: center;
      font-size: var(--font-size-base);
    }
  `
})
export class TextQuestionComponent {
  @Input() text = '';
}
