import {
  Component, EventEmitter, Input, OnChanges, Output
} from '@angular/core';
import { Answer } from 'common/interfaces/unit';
import { SplitWordPipe } from '../split-word.pipe';

/* Answer buttons that are all as wide as the widest one (#26): equal 1fr grid tracks, sized by the
   widest label. If that does not fit, the tracks shrink equally and the labels wrap. */
@Component({
  selector: 'speedtest-player-text-answers',
  imports: [SplitWordPipe],
  template: `
    <div class="buttons" [class.stacked]="layout === 'row'">
      @for (answer of answers; let answerIndex = $index; track answerIndex) {
        <button
                [class.selected]="isSelected[answerIndex]"
                [style.background-color]="buttonColor"
                (click)="answerClick.emit(answerIndex)">
          @if (answer.splitPosition) {
            <span class="label-1">{{ (answer.text | splitWord: answer.splitPosition)[0] }}</span>
            <span class="label-2">{{ (answer.text | splitWord: answer.splitPosition)[1] }}</span>
          } @else {
            {{ answer.text }}
          }
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .buttons {
      display: grid;
      gap: 25px;
      grid-auto-flow: column;
      grid-auto-columns: minmax(0, 1fr);
    }
    // Answers beside the question are stacked; a single column is as wide as its widest button.
    .buttons.stacked {
      grid-auto-flow: row;
    }
    button {
      min-width: 120px;
      min-height: 90px;
      padding: 10px 25px;
      font-family: inherit;
      font-size: var(--font-size-base);
      font-weight: 500;
      letter-spacing: 0.0893em;
      overflow-wrap: break-word;
      color: black;
      background-color: white;
      border: 1px solid lightgray;
      border-radius: 10px;
      box-shadow: 7px 6px 8px #0003;
      cursor: pointer;
    }
    // Drawn inside the button, so the area does not clip it at its edges.
    button.selected {
      outline: 5px solid blueviolet;
      outline-offset: -5px;
    }
    .label-1 {
      color: #005ab5;
    }
    // Small space between the word parts
    .label-1::after {
      content: "\\202F";
    }
    .label-2 {
      color: #dc3220;
    }
  `
})
export class TextAnswersComponent implements OnChanges {
  @Input() answers: Answer[] = [];
  @Input() layout: 'column' | 'row' = 'column';
  @Input() buttonColor?: string;
  @Input() selectedAnswers: number[] = [];
  @Output() answerClick = new EventEmitter<number>();

  isSelected: boolean[] = [];

  ngOnChanges(): void {
    this.isSelected = this.answers.map((_, index) => this.selectedAnswers.includes(index));
  }
}
