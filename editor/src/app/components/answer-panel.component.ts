import { Component, Input } from '@angular/core';
import { MatButton, MatIconButton, MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { UnitService } from 'editor/src/app/services/unit.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
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
    MatIconButton
  ],
  template: `
      @if (unitService.unit.answerType !== 'number') {
          @for (answer of answers; let answerIndex = $index; track answer) {
              <div class="text-answer-list">
                  @if (unitService.unit.answerType === 'text') {
                      <mat-form-field>
                          <mat-label>Frage</mat-label>
                          <input matInput [value]="answer"
                                 (change)="changeAnswerText(questionIndex, answerIndex, $event.target)">
                      </mat-form-field>
                  }
                  @if (unitService.unit.answerType === 'image') {
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
                  }
                  <button mat-mini-fab color="warn"
                          [matTooltip]="'Antwort löschen'" (click)="deleteAnswer(questionIndex, answerIndex)">
                      <mat-icon>delete</mat-icon>
                  </button>
              </div>
          }

          <button mat-raised-button class="add-button" [matTooltip]="'Antwort hinzu'"
                  (click)="addAnswer()">
              Neue Antwort
              <mat-icon>add</mat-icon>
          </button>
      } @else {
          <mat-form-field>
              <mat-label>Antwortlänge</mat-label>
              <input matInput type="number" max="5" required
                     [(ngModel)]="unitService.unit.questions[questionIndex].answerLength">
          </mat-form-field>
      }
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
