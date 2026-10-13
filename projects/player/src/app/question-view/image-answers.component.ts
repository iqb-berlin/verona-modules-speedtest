import {
  Component, EventEmitter, Input, OnChanges, Output,
  ChangeDetectionStrategy
} from '@angular/core';
import { Answer } from 'common/interfaces/unit';

/* Image answers in equal cells, side by side below the question or stacked beside it. Each image is scaled
   down into its cell, never up, and the image itself is the button face, so the selection frame sits on
   the image. Locked images look as usual and still report clicks; the parent decides what a click does. The
   parent must let this component fill the area instead of placing it by margins. */
@Component({
  selector: 'speedtest-player-image-answers',
  template: `
    <div class="cells" [class.stacked]="layout === 'row'">
      @for (answer of answers; let answerIndex = $index; track answerIndex) {
        <button [attr.aria-label]="'Antwort ' + (answerIndex + 1)" [class.locked]="locked"
                [attr.aria-disabled]="locked" (click)="answerClick.emit(answerIndex)">
          <img [src]="answer.src" alt="" [class.selected]="isSelected[answerIndex]">
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: `
    :host {
      display: block;
      min-height: 0;
      min-width: 0;
    }
    .cells {
      height: 100%;
      display: grid;
      gap: 25px;
      grid-auto-flow: column;
      grid-auto-columns: minmax(0, 1fr);
      grid-template-rows: minmax(0, 1fr);
    }
    .cells.stacked {
      grid-auto-flow: row;
      grid-auto-rows: minmax(0, 1fr);
      grid-template-rows: none;
      grid-template-columns: minmax(0, 1fr);
    }
    button {
      min-height: 0;
      min-width: 0;
      padding: 0;
      border: none;
      background: transparent;
      display: grid;
      place-items: center;
      cursor: pointer;
    }
    button.locked {
      cursor: default;
    }
    img {
      display: block;
      max-width: 100%;
      max-height: 100%;
      min-height: 0;
      min-width: 0;
      object-fit: scale-down;
    }
    // Drawn inside the image, so the cell does not clip it at its edges.
    img.selected {
      outline: 5px solid blueviolet;
      outline-offset: -5px;
    }
  `
})
export class ImageAnswersComponent implements OnChanges {
  @Input() answers: Answer[] = [];
  @Input() layout: 'column' | 'row' = 'column';
  @Input() selectedAnswers: number[] = [];
  @Input() locked = false;
  @Output() answerClick = new EventEmitter<number>();

  isSelected: boolean[] = [];

  ngOnChanges(): void {
    this.isSelected = this.answers.map((_, index) => this.selectedAnswers.includes(index));
  }
}
