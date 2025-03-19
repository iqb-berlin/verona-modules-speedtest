import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { Question, Unit } from 'common/interfaces/unit';

@Component({
  selector: 'speedtest-player-unit-view',
  standalone: true,
  imports: [
    NgIf,
    MatButton,
    NgClass
  ],
  template: `
      <div class="outer-wrapper">
          @if (unit.instructionText) {
              <p class="instruction-text">{{ unit.instructionText }}</p>
          }
          <div class="inner-wrapper" [ngClass]="{
                                                'column': unit.layout == 'column',
                                                'row': unit.layout == 'row',
                                                'instruction-present': unit.instructionText,
                                                'question-image-present': unit.questionType === 'image',
                                                'answer-image-present': unit.answerType === 'image',
                                                'numbers': unit.answerType === 'number'}">
              <div class="question">
                  @if (unit.questionType === 'image') {
                      <img *ngIf="question.src" [src]="question.src" [alt]="question.text">
                  }
                  @if (unit.questionType === 'audio') {
                      <audio #audioElement [src]=question.src
                             (play)="isAudioActive = true" (ended)="isAudioActive = false"></audio>
                      <button class="audio-button" [class.in-progress]="isAudioActive"
                              [disabled]="isAudioActive" (click)="audioElement.play();">
                          <svg id="Layer_1" xmlns="http://www.w3.org/2000/svg"
                               xmlns:xlink="http://www.w3.org/1999/xlink"
                               width="180px" height="180px" viewBox="0 0 64 64" xml:space="preserve">
                            <g>
                              <polygon fill="none" stroke="#000000" stroke-width="2" stroke-linejoin="bevel"
                                       stroke-miterlimit="10" points="27,21 41,32 27,43"/>
                                <path fill="none" stroke="#000000" stroke-width="2" stroke-miterlimit="10"
                                      d="M53.92,10.081 c12.107,12.105,12.107,31.732,0,43.838c-12.106,12.108-31.734,
                                       12.108-43.839,0c-12.107-12.105-12.107-31.732,0-43.838 C22.186-2.027,41.813-2.027,
                                       53.92,10.081z"/>
                            </g>
                        </svg>
                      </button>
                  }
                  <p>{{ question.text }}</p>
              </div>
              <div class="answers">
                  @if (unit.answerType !== 'number') {
                      @for (answer of question.answers; let answerIndex = $index; track answerIndex) {
                          @if (unit.answerType === 'text') {
                              <button mat-raised-button [style.background-color]="unit.buttonColor"
                                      (click)="setAnswer(answerIndex)">
                                  {{ answer }}
                              </button>
                          } @else if (unit.answerType === 'image') {
                              <img [src]="answer" (click)="setAnswer(answerIndex)">
                          }
                      }
                  } @else {
                      @for (number of numberAnswer; track $index) {
                          <div class="number-result-box" [class.active]="$index === activeNumberIndex">
                              {{ number }}
                          </div>
                      }
                  }
              </div>
          </div>
          @if (unit.answerType === 'number') {
              <div class="number-buttons">
                  @for (number of mathInputs; track number) {
                      <button (click)="enterDigit(number)">
                          {{ number }}
                      </button>
                  }
                  <button class="backspace-button" (click)="deleteDigit()">
                      <svg fill="#000000" height="40px" width="45px"
                           xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                           viewBox="0 0 44.18 44.18" xml:space="preserve">
                        <g>
                            <path d="M10.625,5.09L0,22.09l10.625,17H44.18v-34H10.625z
                                     M42.18,37.09H11.734l-9.375-15l9.375-15H42.18V37.09z"/>
                            <polygon points="18.887,30.797 26.18,23.504 33.473,30.797 34.887,29.383 27.594,22.09
                                             34.887,14.797 33.473,13.383 26.18,20.676 18.887,13.383 17.473,14.797
                                             24.766,22.09 17.473,29.383"/>
                        </g>
                    </svg>
                  </button>
              </div>
              <div class="unit-nav-next">
                  <span class="button-text">Hier geht’s weiter.</span>
                  <span class="svg-container" (click)="setAnswer($any(numberAnswer.join('')))">
                  <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 100 100">
                      <circle cx="50%" cy="50%" r="50" fill="#b3fe5b"/>
                      <path d="M 45 35 L 60 50 L 45 65" stroke="black" stroke-width="5" fill="none"/>
                  </svg>
                </span>
              </div>
          }
      </div>
  `,
  styleUrls: ['unit-view.component.css']
})
export class UnitViewComponent implements OnInit {
  @Input() question!: Question;
  @Input() unit!: Unit;
  @Output() responseGiven = new EventEmitter<number>();

  isAudioActive: boolean = false;
  numberAnswer: (number | undefined)[] = [];
  mathInputs: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  activeNumberIndex: number = 0;

  ngOnInit(): void {
    if (this.unit.answerType === 'number') {
      this.numberAnswer = Array(this.question.correctNumberAnswer?.toString().length).fill(undefined);
    }
  }

  enterDigit(number: number) {
    this.numberAnswer[this.activeNumberIndex] = number;
    if (this.activeNumberIndex + 1 < (this.question.correctNumberAnswer?.toString().length as number)) {
      this.activeNumberIndex += 1;
    }
  }

  deleteDigit() {
    this.numberAnswer[this.activeNumberIndex] = undefined;
    if (this.activeNumberIndex > 0) this.activeNumberIndex -= 1;
  }

  setAnswer(answerIndex: number) {
    this.responseGiven.emit(answerIndex);
    setTimeout(() => {
      this.resetState();
    });
  }

  resetState(): void {
    if (this.unit.answerType === 'number') {
      this.numberAnswer = Array(this.question.correctNumberAnswer?.toString().length).fill(undefined);
    }
    this.activeNumberIndex = 0;
    this.isAudioActive = false;
  }
}
