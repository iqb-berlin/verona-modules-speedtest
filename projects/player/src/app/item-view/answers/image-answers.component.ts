import {
  Component, EventEmitter, Input, OnChanges, Output,
  ChangeDetectionStrategy
} from '@angular/core';
import { Answer } from 'common/interfaces/unit';

/* Image answers close together in a centred line, side by side below the question or stacked beside it.
   Each image is scaled down to the area, never up, and shrinks further if the line does not fit. The image
   itself is the button face, so the selection frame sits on the image. Locked images look as usual and
   still report clicks; the parent decides what a click does. The parent must let this component fill the
   area instead of placing it by margins; --lean-x and --lean-y place the images across the line, centred if
   not set. */
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
    // A size container, so the images can be capped at the area's size (cqw, cqh): a percentage would not
    // resolve while the line is sized by its images.
    :host {
      display: block;
      min-height: 0;
      min-width: 0;
      container-type: size;
    }
    .cells {
      height: 100%;
      display: flex;
      gap: 25px;
      justify-content: center;
      align-items: var(--lean-y, center);
    }
    .cells.stacked {
      flex-direction: column;
      align-items: var(--lean-x, center);
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
      max-height: 100cqh;
      object-fit: scale-down;
    }
    .stacked img {
      max-width: 100cqw;
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
