import {
  Component, EventEmitter, Input, OnChanges, Output,
  ChangeDetectionStrategy
} from '@angular/core';
import { Answer } from 'common/interfaces/unit';
import { LatexPipe } from 'common/latex.pipe';
import { SplitWordPipe } from '../split-word.pipe';
import { AudioButtonComponent } from './audio-button.component';

/* Answer buttons that are all as wide as the widest one (#26): equal 1fr grid tracks, sized by the
   widest label. If that does not fit, the tracks shrink equally and the labels wrap. For audio answers,
   each button has its audio button in front of it; whether audio may play is the parent's decision. */
@Component({
  selector: 'speedtest-player-text-answers',
  imports: [SplitWordPipe, LatexPipe, AudioButtonComponent],
  template: `
    <div class="buttons" [class.stacked]="layout === 'row'">
      @for (answer of answers; let answerIndex = $index; track answerIndex) {
        <div class="answer">
          @if (withAudio) {
            <speedtest-player-audio-button [src]="answer.src ?? ''"
                                           [disabled]="audioPlaying"
                                           (playingChange)="playingChange.emit($event)">
            </speedtest-player-audio-button>
          }
          <button [class.selected]="isSelected[answerIndex]"
                  [style.background-color]="buttonColor"
                  (click)="answerClick.emit(answerIndex)">
            @if (answer.splitPosition) {
              <span class="label-1">{{ (answer.text | splitWord: answer.splitPosition)[0] }}</span>
              <span class="label-2">{{ (answer.text | splitWord: answer.splitPosition)[1] }}</span>
            } @else {
              <span [innerHTML]="answer.text | latex: latex"></span>
            }
          </button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: `
    :host {
      display: block;
    }
    .buttons {
      display: grid;
      gap: 25px;
      grid-auto-flow: column;
      grid-auto-columns: minmax(0, 1fr);
      // Room for the button shadow, which the scrolling answer area would cut off. Equal on both sides,
      // so the buttons stay centred.
      padding: 0 15px 15px;
    }
    // Answers beside the question are stacked; a single column is as wide as its widest button.
    .buttons.stacked {
      grid-auto-flow: row;
    }
    .answer {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }
    speedtest-player-audio-button {
      flex: none;
      width: 45px;
    }
    button {
      flex: 1;
      align-self: stretch;
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
    // The button's letter spacing would pull a formula apart.
    button ::ng-deep .katex {
      letter-spacing: normal;
    }
  `
})
export class TextAnswersComponent implements OnChanges {
  @Input() answers: Answer[] = [];
  @Input() layout: 'column' | 'row' = 'column';
  @Input() buttonColor?: string;
  @Input() selectedAnswers: number[] = [];
  @Input() latex = false;
  @Input() withAudio = false;
  @Input() audioPlaying = false;
  @Output() answerClick = new EventEmitter<number>();
  @Output() playingChange = new EventEmitter<boolean>();

  isSelected: boolean[] = [];

  ngOnChanges(): void {
    this.isSelected = this.answers.map((_, index) => this.selectedAnswers.includes(index));
  }
}
