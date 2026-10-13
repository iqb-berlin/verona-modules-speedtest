import {
  Component, EventEmitter, Input, OnChanges, Output,
  ChangeDetectionStrategy
} from '@angular/core';
import { AudioButtonComponent } from './audio-button.component';

interface TextPart {
  text: string;
  wordIndex?: number;
}

/* A sentence whose words can be struck through, with an optional audio button in front. Words are numbered
   in order, skipping numbers and punctuation; the selection reports those numbers. Locked words look as
   usual and still report clicks; the parent decides what a click does. */
@Component({
  selector: 'speedtest-player-word-select',
  imports: [AudioButtonComponent],
  template: `
    <p>
      @if (src) {
        <speedtest-player-audio-button [src]="src"
                                       [disabled]="audioPlaying"
                                       [wobble]="wobble"
                                       (playingChange)="playingChange.emit($event)"
                                       (finished)="audioFinished.emit()">
        </speedtest-player-audio-button>
      }
      @for (part of parts; track $index) {
        @if (part.wordIndex !== undefined) {
          <span class="word" [class.selected]="isSelected[part.wordIndex]" [class.locked]="locked"
                (click)="wordClick.emit(part.wordIndex)">{{ part.text }}</span>
        } @else {
          <span>{{ part.text }}</span>
        }
      }
    </p>
  `,
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
    span {
      display: inline-block;
    }
    .word {
      cursor: pointer;
    }
    .word.locked {
      cursor: default;
    }
    .selected {
      text-decoration: line-through;
      text-decoration-thickness: 3px;
    }
    speedtest-player-audio-button {
      display: inline-block;
      width: 45px;
      margin-right: 15px;
      vertical-align: middle;
    }
  `
})
export class WordSelectComponent implements OnChanges {
  @Input() text = '';
  @Input() src = '';
  @Input() audioPlaying = false;
  @Input() wobble = 0;
  @Input() locked = false;
  @Input() selectedWords: number[] = [];
  @Output() wordClick = new EventEmitter<number>();
  @Output() playingChange = new EventEmitter<boolean>();
  @Output() audioFinished = new EventEmitter<void>();

  parts: TextPart[] = [];
  isSelected: boolean[] = [];

  ngOnChanges(): void {
    this.parts = WordSelectComponent.split(this.text);
    const wordCount = this.parts.filter(part => part.wordIndex !== undefined).length;
    this.isSelected = Array.from({ length: wordCount }, (_, index) => this.selectedWords.includes(index));
  }

  /* Words, numbers, punctuation and spaces as separate parts; only words are numbered. Spaces become
     non-breaking, since the parts are inline blocks and the line breaks between them anyway. */
  private static split(sentence: string): TextPart[] {
    const tokens = sentence.match(/\p{L}+\p{M}*|\p{N}+|[^\p{L}\p{N}\s]+|\s+/gu) ?? [];
    let wordIndex = 0;
    return tokens.map((token) => {
      if (/^\s+$/.test(token)) return { text: '\u00A0' };
      if (!/^\p{L}+$/u.test(token)) return { text: token };
      const part = { text: token, wordIndex };
      wordIndex += 1;
      return part;
    });
  }
}
