import { Component, Input } from '@angular/core';

/* Fills the question area and scales the image down into it, never up. Image and caption stay together
   and are centred in the area: the image box is at most as big as the image, the caption centred below it.
   The parent must let this component fill the area instead of placing it by margins. */
@Component({
  selector: 'speedtest-player-image-question',
  template: `
    <figure>
      <img [src]="src" [alt]="caption">
      @if (caption) {
        <figcaption>{{ caption }}</figcaption>
      }
    </figure>
  `,
  styles: `
    :host {
      display: block;
      min-height: 0;
      min-width: 0;
    }
    figure {
      height: 100%;
      margin: 0;
      display: grid;
      grid-template-rows: minmax(0, auto) auto;
      grid-template-columns: minmax(0, 1fr);
      align-content: center;
      gap: 5px;
    }
    img {
      display: block;
      max-width: 100%;
      max-height: 100%;
      min-height: 0;
      min-width: 0;
      justify-self: center;
      object-fit: scale-down;
    }
    figcaption {
      font-size: var(--font-size-base);
      text-align: center;
    }
  `
})
export class ImageQuestionComponent {
  @Input() src = '';
  @Input() caption = '';
}
