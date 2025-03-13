import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { Question, Unit } from 'common/interfaces/unit';

@Component({
  selector: 'speedtest-player-unit-view',
  standalone: true,
  imports: [
    NgIf,
    MatButton,
    NgIf
  ],
  template: `
      <div class="wrapper" [style.flex-direction]="layout">
        <div class="question">
            @if (unit.questionType === 'image') {
                <img *ngIf="question.src" [src]="question.src" [alt]="question.text">
            }
            @if (unit.questionType === 'audio') {
                <audio *ngIf="question.src" controls [src]=question.src></audio>
            }
            <p>{{ question.text }}</p>
        </div>
        <div class="answers">
          @for (answer of question.answers; let answerIndex = $index; track answer) {
            <button mat-raised-button [style.background-color]="buttonColor"
                    (click)="responseGiven.emit(answerIndex)">
              {{ answer }}
            </button>
          }
        </div>
      </div>
<!--        <div class="wrapper" [ngClass]="{'column': layout == 'column', 'row': layout == 'row'}"-->
<!--         [style.flex-direction]="layout">-->
<!--      <div class="question">-->
<!--        <img *ngIf="question.src" [src]="question.src" [alt]="question.text">-->
<!--        <p>{{ question.text }}</p>-->
<!--      </div>-->
<!--      <div class="answers">-->
<!--        <button mat-raised-button *ngFor="let answer of question.answers; let i = index;"-->
<!--                [style.background-color]="buttonColor"-->
<!--                (click)="responseGiven.emit(i)">-->
<!--          {{ answer }}-->
<!--        </button>-->
<!--      </div>-->
<!--    </div>-->
  `,
  styleUrls: ['unit-view.component.css']
})
export class UnitViewComponent {
  @Input() question!: Question;
  @Input() layout!: 'column' | 'row';
  @Input() buttonColor: string | undefined;
  @Input() unit!: Unit;
  @Output() responseGiven = new EventEmitter<number>();
}
