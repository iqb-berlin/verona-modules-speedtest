import {
  Component, EventEmitter, Input, OnChanges, Output,
  ChangeDetectionStrategy
} from '@angular/core';
import { Answer } from 'common/interfaces/unit';

/* Image answers close together in a centred line, side by side below the question or stacked beside it.
   Each image is scaled down to the area, never up, and shrinks further if the line does not fit. The image
   itself is the button face, so the selection frame sits on the image. Locked images look as usual and
   still report clicks; the parent decides what a click does. The parent must let this component fill the
   area instead of placing it by margins, and set the area's largest size as --answer-area-width and
   --answer-area-height; --lean-y places the line below the question, --lean-x the images in the line beside
   it, centred if not set. */
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
    // The images size the line, and the line sizes the answer area; so the images are capped by the
    // area's limits the parent sets, not by percentages, which would not resolve.
    :host {
      display: grid;
      grid-template: minmax(0, 1fr) / minmax(0, 1fr);
      min-height: 0;
      min-width: 0;
    }
    // Side by side, the line is as tall as its tallest image and the images stand on its bottom edge.
    .cells {
      min-height: 0;
      min-width: 0;
      display: flex;
      gap: 25px;
      justify-content: center;
      align-items: end;
      align-self: var(--lean-y, center);
    }
    .cells.stacked {
      flex-direction: column;
      align-items: var(--lean-x, center);
      align-self: stretch;
    }
    button {
      min-height: 0;
      min-width: 0;
      padding: 0;
      border: none;
      background: transparent;
      cursor: pointer;
    }
    button.locked {
      cursor: default;
    }
    img {
      display: block;
      max-width: 100%;
      max-height: var(--answer-area-height, none);
      object-fit: scale-down;
    }
    .stacked img {
      max-width: var(--answer-area-width, none);
      max-height: 100%;
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
