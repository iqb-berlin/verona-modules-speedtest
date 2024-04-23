import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { Question } from 'common/interfaces/unit';

@Component({
  selector: 'speedtest-player-unit-view',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    NgClass,
    MatButton
  ],
  template: `
    <div class="wrapper" [ngClass]="{'column': layout == 'column', 'row': layout == 'row'}"
         [style.flex-direction]="layout">
      <div class="question" [style.margin]="layout == 'column' ? '2% 15%' : '2% 5%'">
        <img *ngIf="question.imgSrc" [src]="question.imgSrc" [alt]="question.text">
        <p>{{ question.text }}</p>
      </div>
      <div class="answers" [style.display]="layout == 'row' ? 'grid' : 'flex'"
           [style.flex-direction]="layout == 'row' ? 'column' : 'row'">
        <button mat-raised-button *ngFor="let answer of question.answers; let i = index;"
                [style.background-color]="buttonColor"
                (click)="responseGiven.emit(i)">
          {{ answer }}
        </button>
      </div>
    </div>
  `,
  styleUrls: ['unit-view.component.css']
})
export class UnitViewComponent {
  @Input() question!: Question;
  @Input() layout!: 'column' | 'row';
  @Input() buttonColor: string | undefined;
  @Output() responseGiven = new EventEmitter<number>();
}
