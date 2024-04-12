import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Question, Unit } from '../../../common/interfaces/unit';
import { NgForOf, NgIf } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'speedtest-player-unit-view',
  standalone: true,
  imports: [
    NgForOf,
    MatButton,
    MatIcon,
    NgIf
  ],
  template: `
    <div class="question">
      <img *ngIf="question.imgSrc" [src]="question.imgSrc">
      {{ question.text }}
    </div>
    <div class="answers">
      <button mat-raised-button *ngFor="let answer of question.anwers; let i = index;"
              (click)="responseGiven.emit(i)">
        {{ answer.text }}
      </button>
    </div>
  `,
  styles: `
    :host {margin: auto;}
    .question {
      font-size: x-large;
      text-align: center;
      display: flex;
      flex-direction: column;
    }
    .question img {
      max-height: 100%;
      object-fit: contain;
    }
    .answers {
      display: flex;
      justify-content: center;
      gap: 10px;
      /*margin-top: 15%;*/
    }
    .answers button {
      font-size: larger;
      width: 120px;
      height: 45px;
    }
  `
})
export class UnitViewComponent {
  @Input() question!: Question;
  @Output() responseGiven = new EventEmitter<number>();
}
