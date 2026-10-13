import {
  Component, EventEmitter, Input, Output,
  ChangeDetectionStrategy
} from '@angular/core';
import { LatexPipe } from 'common/latex.pipe';
import { AudioButtonComponent } from './audio-button.component';

/* A large audio button with the question text below it, centred together in the question area. The button
   shrinks with the area (down to 60px) rather than pushing the text out. The parent must let this component
   fill the area instead of placing it by margins. */
@Component({
  selector: 'speedtest-player-audio-question',
  imports: [AudioButtonComponent, LatexPipe],
  template: `
    <div class="group">
      <speedtest-player-audio-button [src]="src"
                                     [disabled]="audioPlaying"
                                     [wobble]="wobble"
                                     (playingChange)="playingChange.emit($event)"
                                     (finished)="audioFinished.emit()">
      </speedtest-player-audio-button>
      @if (text) {
        <p class="latex-block" [innerHTML]="text | latex: latex"></p>
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
    .group {
      height: 100%;
      display: grid;
      grid-template-rows: minmax(60px, 180px) auto;
      grid-template-columns: minmax(0, 1fr);
      align-content: center;
      justify-items: center;
      gap: 10px;
    }
    speedtest-player-audio-button {
      height: 100%;
      min-width: 60px;
    }
    p {
      margin: 0;
      text-align: center;
      font-size: var(--font-size-base);
    }
  `
})
export class AudioQuestionComponent {
  @Input() src = '';
  @Input() text = '';
  @Input() latex = false;
  @Input() audioPlaying = false;
  @Input() wobble = 0;
  @Output() playingChange = new EventEmitter<boolean>();
  @Output() audioFinished = new EventEmitter<void>();
}
