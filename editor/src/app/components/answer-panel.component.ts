import { Component, Input } from '@angular/core';
import { MatButton, MatIconButton, MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { UnitService } from 'editor/src/app/services/unit.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { NgIf } from '@angular/common';

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
    NgIf,
    MatIconButton
  ],
  template: `
      @for (answer of answers; let answerIndex = $index; track answer) {
          @if (unitService.unit.answerType === 'text') {
            <div class="text-answer-list">
                <mat-form-field>
                    <mat-label>Frage</mat-label>
                    <input matInput [value]="answer"
                           (change)="changeAnswerText(questionIndex, answerIndex, $event.target)">
                </mat-form-field>
                <button mat-mini-fab color="warn"
                        [matTooltip]="'Antwort löschen'" (click)="deleteAnswer(questionIndex, answerIndex)">
                    <mat-icon>delete</mat-icon>
                </button>
            </div>
          }
          @if (unitService.unit.answerType === 'image') {
            <div class="text-answer-list">
                <img *ngIf="answer" [src]="answer">
                <button mat-icon-button [matTooltip]="'Bild hinzufügen'" (click)="imageUpload.click();">
                    <mat-icon>image</mat-icon>
                </button>
                <input type="file" hidden accept="image/*" #imageUpload
                       (change)="loadAnswerImage(questionIndex, $event.target)">
                <button *ngIf="answer" mat-icon-button [matTooltip]="'Bild entfernen'"
                        (click)="removeAnswerImage(questionIndex);">
                    <mat-icon>backspace</mat-icon>
                </button>
                <button mat-mini-fab color="warn"
                        [matTooltip]="'Antwort löschen'" (click)="deleteAnswer(questionIndex, answerIndex)">
                    <mat-icon>delete</mat-icon>
                </button>
            </div>
          }
      }

      <button mat-raised-button class="add-button" [matTooltip]="'Antwort hinzu'"
              (click)="addAnswer()">
          Neue Antwort
          <mat-icon>add</mat-icon>
      </button>
  `,
  styles: `
    .text-answer-list {
      display: flex; flex-direction: row;
    }

  `
})
export class AnswerPanelComponent {
  @Input() answers!: string[];
  @Input() questionIndex!: number;

  constructor(public unitService: UnitService) { }

  // addAnswer(questionIndex: number) {
  addAnswer() {
    let answerText: string;
    // switch (this.unit.questions[questionIndex].answers.length) {
    switch (this.answers.length) {
      case 0: answerText = 'richtig'; break;
      case 1: answerText = 'falsch'; break;
      default: answerText = `Antworttext ${this.answers.length + 1}`; break;
    }
    this.unitService.addAnswer(this.questionIndex, answerText);
    // this.unit.questions[questionIndex].answers.push(answerText);
    // this.unitService.updateUnitDef();
  }

  deleteAnswer(questionIndex: number, answerIndex: number) {
    this.unitService.deleteAnswer(questionIndex, answerIndex);
  }

  changeAnswerText(questionIndex: number, answerIndex: number, eventTarget: EventTarget | null) {
    this.unitService.unit.questions[questionIndex].answers[answerIndex] = (eventTarget as HTMLInputElement).value;
    this.unitService.updateUnitDef();
  }

  setCorrectAnswer(questionIndex: number, answerIndex: number, checked: boolean) {
    // if (checked) {
    //   this.unit.questions[questionIndex].correctAnswerIndex = answerIndex;
    // } else {
    //   this.unit.questions[questionIndex].correctAnswerIndex = undefined;
    // }
    // this.calculateMissingCorrectAnswerIndeces();
    // this.unitService.updateUnitDef();
  }
}
