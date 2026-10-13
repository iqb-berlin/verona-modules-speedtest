/* eslint-disable @stylistic/max-len */ // SVG path data
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';

/* Plays one audio. Reports when playback starts and stops; the parent decides whether any audio may
   play (only one at a time) and disables the buttons meanwhile. The icon fills the host, so the parent
   sets the size. */
@Component({
  selector: 'speedtest-player-audio-button',
  template: `
    <audio #audio [src]="src"
           (play)="playingChange.emit(true)"
           (ended)="playingChange.emit(false)"
           (pause)="playingChange.emit(false)"
           (error)="playingChange.emit(false)"></audio>
    <button aria-label="anhören" [disabled]="disabled" (click)="audio.play()">
      <svg viewBox="0 0 85 85" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="46.5" cy="46.5" r="38.5" fill="#d1dfe3"/>
        <circle cx="40" cy="40" r="40" fill="#196175"/>
        <path d="m 46.643342,35.214198 c -6.801527,0.801525 -4.626526,10.393039 1.785938,9.496026"
              stroke="#ffffff" stroke-width="3.20247" stroke-linecap="round"/>
        <path fill="#ffffff" d="m 46.544351,55.679814 c -0.53122,0 -1.053216,-0.111845 -1.425982,-0.279818 -1.314163,-0.699392 -2.264887,-1.650385 -3.18763,-4.447952 -0.959948,-2.899905 -2.740146,-4.270574 -4.464485,-5.604132 -1.472514,-1.137675 -3.001093,-2.312665 -4.315256,-4.709164 -0.978704,-1.790243 -1.519148,-3.739359 -1.519148,-5.473577 0,-5.23128 4.091616,-9.324885 9.320288,-9.324885 4.594241,0 8.310733,3.160401 9.144922,7.476163 0.194942,1.008347 1.010067,1.848722 2.039608,1.848722 1.029438,0 1.877771,-0.837103 1.738996,-1.854651 -0.874777,-6.41128 -6.237509,-11.200085 -12.923424,-11.200085 -7.316451,0 -13.048567,5.734686 -13.048567,13.054736 0,2.359285 0.708328,4.942158 1.985184,7.273328 1.696358,3.086485 3.700196,4.625126 5.312613,5.874544 1.509924,1.165687 2.600346,2.005142 3.196854,3.813889 1.118402,3.385114 2.563038,5.296506 5.079544,6.620556 0.969378,0.438283 1.994613,0.66228 3.066483,0.66228 3.475635,0 6.404777,-2.39384 7.226462,-5.619365 0.253568,-0.995261 -0.60481,-1.840645 -1.634248,-1.840645 -1.02954,0 -1.825295,0.881882 -2.317055,1.784109 -0.632073,1.159553 -1.861372,1.945947 -3.275159,1.945947 z"/>
        <path fill="#ffffff" d="m 27.847609,24.679769 c 0.64222,-0.802547 0.651547,-1.973448 -0.07523,-2.700648 -0.729954,-0.730165 -1.923073,-0.735175 -2.583537,0.05807 -2.961223,3.556256 -4.741523,8.132105 -4.741523,13.128039 0,4.995934 1.7803,9.571885 4.741523,13.127937 0.660464,0.793244 1.853583,0.788336 2.583434,0.05807 0.726879,-0.7272 0.71745,-1.897999 0.07523,-2.700546 -2.300144,-2.87404 -3.672113,-6.51924 -3.672113,-10.485358 0,-3.966117 1.372071,-7.61142 3.672215,-10.485562 z"/>
      </svg>
    </button>
  `,
  styles: `
    :host {
      display: block;
      aspect-ratio: 1;
    }
    button {
      display: block;
      width: 100%;
      height: 100%;
      padding: 0;
      border: none;
      background: transparent;
      cursor: pointer;

      &:hover, &:disabled {
        opacity: 0.5;
      }

      &:disabled {
        cursor: default;
      }
    }
    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  `
})
export class AudioButtonComponent {
  @Input() src = '';
  @Input() disabled = false;
  @Output() playingChange = new EventEmitter<boolean>();
}
