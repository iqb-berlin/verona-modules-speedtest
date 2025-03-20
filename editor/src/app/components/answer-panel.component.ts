import { Component, Input } from '@angular/core';
import { MatButton, MatIconButton, MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { UnitService } from 'editor/src/app/services/unit.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { FileService } from 'common/services/file.service';

@Component({
  selector: 'speedtest-answer-panel',
  standalone: true,
  imports: [
    MatButton,
    MatIcon,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    FormsModule,
    MatTooltip,
    MatMiniFabButton,
    MatIconButton,
    MatRadioGroup,
    MatRadioButton
  ],
  template: `
      @if (unitService.unit.answerType !== 'number') {
          <mat-radio-group [(ngModel)]="unitService.unit.questions[questionIndex].correctAnswer"
                           (ngModelChange)="updateCorrectAnswer()">
              <div class="text-answer-list">
                  <h4 [style.grid-row-start]="1" [style.grid-column-start]="1">richtige Antwort</h4>
                  <h4 [style.grid-row-start]="1" [style.grid-column-start]="2">Antwort</h4>
                  @for (answer of answers; let answerIndex = $index; track answer) {
                      <mat-radio-button [value]="answerIndex"
                                        [style.grid-row-start]="answerIndex + 2" [style.grid-column-start]="1">
                      </mat-radio-button>
                      @if (unitService.unit.answerType === 'text') {
                          <mat-form-field [style.grid-row-start]="answerIndex + 2" [style.grid-column-start]="2">
                              <mat-label>Frage</mat-label>
                              <input matInput [value]="answer"
                                     (change)="changeAnswerText(questionIndex, answerIndex, $event.target)">
                          </mat-form-field>
                      }
                      @if (unitService.unit.answerType === 'image') {
                          <div class="image-answer" [style.grid-row-start]="answerIndex + 2"
                               [style.grid-column-start]="2">
                              @if (answer) {
                                  <img [src]="answer">
                              } @else {
                                  kein Bild definiert
                              }
                              <button mat-icon-button [matTooltip]="'Bild hinzufügen'" (click)="imageUpload.click();">
                                  <mat-icon>image</mat-icon>
                              </button>
                              <input type="file" hidden accept="image/*" #imageUpload
                                     (change)="loadAnswerImage(questionIndex, answerIndex, $event.target)">
                              <button mat-icon-button [matTooltip]="'Bild entfernen'"
                                      [disabled]="!answer"
                                      (click)="removeAnswerImage(questionIndex, answerIndex);">
                                  <mat-icon>backspace</mat-icon>
                              </button>
                          </div>
                      }
                      <button mat-mini-fab color="warn"
                              [style.grid-row-start]="answerIndex + 2" [style.grid-column-start]="3"
                              [matTooltip]="'Antwort löschen'" (click)="deleteAnswer(questionIndex, answerIndex)">
                          <mat-icon>delete</mat-icon>
                      </button>
                  }
              </div>
          </mat-radio-group>
          <button mat-raised-button class="add-button" [matTooltip]="'Antwort hinzu'"
                  (click)="addAnswer()">
              Neue Antwort
              <mat-icon>add</mat-icon>
          </button>
      } @else {
          <mat-form-field>
              <mat-label>
                  Erwartete Antwort - Hierüber wird ebenfalls die Anzahl der dargestellten Felder gesteuert.</mat-label>
              <input matInput type="number" required
                     [(ngModel)]="unitService.unit.questions[questionIndex].correctAnswer"
                     (ngModelChange)="unitService.calculateMissingCorrectAnswerIndeces(); unitService.updateUnitDef()">
          </mat-form-field>
      }
  `,
  styles: `
    :host {
      display: flex; flex-direction: column;
    }
    .text-answer-list {
      display: grid;
      grid-template-columns: 170px 5fr 1fr;
      align-items: center;
      row-gap: 15px;
    }
    .text-answer-list mat-radio-button {
      justify-self: center;
    }
    :host ::ng-deep .text-answer-list mat-radio-button .mdc-form-field {
      padding-bottom: 5px;
    }
    .text-answer-list button.mdc-fab {
      margin-left: 30px;
    }
    .image-answer {
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    .image-answer img {
      max-height: 50px;
    }
    .add-button {
      align-self: center;
      width: 25%;
      background-color: lightgray !important;
    }
  `
})
export class AnswerPanelComponent {
  @Input() answers!: string[];
  @Input() questionIndex!: number;

  constructor(public unitService: UnitService) { }

  addAnswer() {
    let answerText: string;
    switch (this.answers.length) {
      case 0: answerText = 'richtig'; break;
      case 1: answerText = 'falsch'; break;
      default: answerText = `Antworttext ${this.answers.length + 1}`; break;
    }
    this.unitService.addAnswer(this.questionIndex, answerText);
  }

  deleteAnswer(questionIndex: number, answerIndex: number) {
    this.unitService.deleteAnswer(questionIndex, answerIndex);
  }

  changeAnswerText(questionIndex: number, answerIndex: number, eventTarget: EventTarget | null) {
    this.unitService.unit.questions[questionIndex].answers[answerIndex] = (eventTarget as HTMLInputElement).value;
    this.unitService.updateUnitDef();
  }

  async loadAnswerImage(questionIndex: number, answerIndex: number, eventTarget: EventTarget | null): Promise<void> {
    this.unitService.unit.questions[questionIndex].answers[answerIndex] =
      await FileService.readFileAsText((eventTarget as HTMLInputElement).files?.[0] as File, true);
    this.unitService.updateUnitDef();
  }

  removeAnswerImage(questionIndex: number, answerIndex: number) {
    this.unitService.unit.questions[questionIndex].answers[answerIndex] = '';
    this.unitService.updateUnitDef();
  }

  updateCorrectAnswer() {
    this.unitService.calculateMissingCorrectAnswerIndeces();
    this.unitService.updateUnitDef();
  }
}
