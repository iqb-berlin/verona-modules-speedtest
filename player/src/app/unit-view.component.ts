import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { Question, Unit } from 'common/interfaces/unit';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'speedtest-player-unit-view',
  standalone: true,
  imports: [
    NgIf,
    MatButton,
    NgClass,
    FormsModule
  ],
  templateUrl: 'unit-view.component.html',
  styleUrls: ['unit-view.component.scss']
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
      this.numberAnswer = Array(this.question.correctAnswer?.toString().length).fill(undefined);
    }
  }

  enterDigit(number: number) {
    this.numberAnswer[this.activeNumberIndex] = number;
    if (this.activeNumberIndex + 1 < (this.question.correctAnswer?.toString().length as number)) {
      this.activeNumberIndex += 1;
    }
  }

  deleteDigit() {
    this.numberAnswer[this.activeNumberIndex] = undefined;
    if (this.activeNumberIndex > 0) this.activeNumberIndex -= 1;
  }

  setAnswer(answer: number) {
    this.responseGiven.emit(answer);
    setTimeout(() => {
      this.resetState();
    });
  }

  resetState(): void {
    if (this.unit.answerType === 'number') {
      this.numberAnswer = Array(this.question.correctAnswer?.toString().length).fill(undefined);
    }
    this.activeNumberIndex = 0;
    this.isAudioActive = false;
  }

  protected readonly parseInt = parseInt;
}
