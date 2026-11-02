import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { LatexPipe } from 'common/latex.pipe';

@Component({
  selector: 'speedtest-player-text-question',
  imports: [LatexPipe],
  template: '<p class="latex-block" [innerHTML]="text | latex: latex"></p>',
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
  @Input() latex = false;
}
