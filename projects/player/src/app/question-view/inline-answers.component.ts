import {
  Component, EventEmitter, Input, OnChanges, Output,
  ChangeDetectionStrategy
} from '@angular/core';
import { Answer } from 'common/interfaces/unit';
import { AudioButtonComponent } from './audio-button.component';

/* A sentence with its gap filled by a stack of answer buttons, with an optional audio button in front. The
   gap sits before the word at answerPosition (counted from 0); without one, the buttons follow the text. */
@Component({
  selector: 'speedtest-player-inline-answers',
  imports: [AudioButtonComponent],
  template: `
    <div class="sentence">
      @if (src) {
        <speedtest-player-audio-button [src]="src"
                                       [disabled]="audioPlaying"
                                       (playingChange)="playingChange.emit($event)">
        </speedtest-player-audio-button>
      }
      <span>{{ before }}</span>
      <div class="buttons">
        @for (answer of answers; let answerIndex = $index; track answerIndex) {
          <button [class.selected]="isSelected[answerIndex]"
                  [style.background-color]="buttonColor"
                  (click)="answerClick.emit(answerIndex)">{{ answer.text }}</button>
        }
      </div>
      <span>{{ after }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: `
    :host {
      display: block;
    }
    .sentence {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-base);
    }
    speedtest-player-audio-button {
      flex: none;
      width: 45px;
      margin-right: 15px;
    }
    .buttons {
      flex: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
      // Room for the button shadow, which the scrolling question area would cut off.
      margin: 0 10px;
      padding: 0 15px 15px 0;
    }
    button {
      min-height: 55px;
      padding: 5px 20px;
      font-family: inherit;
      font-size: var(--font-size-base);
      font-weight: 500;
      letter-spacing: 0.0893em;
      color: black;
      background-color: white;
      border: 1px solid lightgray;
      border-radius: 10px;
      box-shadow: 7px 6px 8px #0003;
      cursor: pointer;
    }
    button.selected {
      outline: 5px solid blueviolet;
      outline-offset: -5px;
    }
  `
})
export class InlineAnswersComponent implements OnChanges {
  @Input() text = '';
  @Input() answerPosition?: number;
  @Input() answers: Answer[] = [];
  @Input() src = '';
  @Input() buttonColor?: string;
  @Input() audioPlaying = false;
  @Input() selectedAnswers: number[] = [];
  @Output() answerClick = new EventEmitter<number>();
  @Output() playingChange = new EventEmitter<boolean>();

  before = '';
  after = '';
  isSelected: boolean[] = [];

  ngOnChanges(): void {
    const words = this.text.split(' ');
    this.before = words.slice(0, this.answerPosition).join(' ');
    this.after = this.answerPosition === undefined ? '' : words.slice(this.answerPosition).join(' ');
    this.isSelected = this.answers.map((_, index) => this.selectedAnswers.includes(index));
  }
}
