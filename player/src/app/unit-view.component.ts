import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Question } from '../../../common/interfaces/unit';
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
    <div class="wrapper" [style.flex-direction]="layout">
      <div class="question" [style.margin]="question.layout == 'column' ? '2% 15%' : '2% 5%'">
        <img *ngIf="question.imgSrc" [src]="question.imgSrc">
        <p>{{ question.text }}</p>
      </div>
      <div class="answers" [style.flex-direction]="layout == 'row' ? 'column' : 'row'">
        <button mat-raised-button *ngFor="let answer of question.anwers; let i = index;"
                (click)="responseGiven.emit(i)">
          {{ answer.text }}
        </button>
      </div>
    </div>
  `,
  styleUrls: ['unit-view.component.css']
})
export class UnitViewComponent implements OnInit, OnChanges {
  @Input() question!: Question;
  @Input() globalLayout: 'column' | 'row' | undefined;
  @Output() responseGiven = new EventEmitter<number>();

  layout: 'column' | 'row' | undefined;

  ngOnInit(): void {
    this.layout = this.globalLayout || this.question.layout;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.layout = this.globalLayout || this.question.layout;
  }
}
