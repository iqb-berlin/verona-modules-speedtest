import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { AudioButtonComponent } from './audio-button.component';

/* A large audio button with the question text below it, centred together in the question area. The button
   shrinks with the area (down to 60px) rather than pushing the text out. The parent must let this component
   fill the area instead of placing it by margins. */
@Component({
  selector: 'speedtest-player-audio-question',
  imports: [AudioButtonComponent],
  template: `
    <div class="group">
      <speedtest-player-audio-button [src]="src"
                                     [disabled]="audioPlaying"
                                     (playingChange)="playingChange.emit($event)">
      </speedtest-player-audio-button>
      @if (text) {
        <p>{{ text }}</p>
      }
    </div>
  `,
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
  @Input() audioPlaying = false;
  @Output() playingChange = new EventEmitter<boolean>();
}
