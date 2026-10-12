import {
  Component, EventEmitter, Input, OnChanges, SimpleChanges, Output
} from '@angular/core';
import { Question, Unit } from 'common/interfaces/unit';
import { defaultQuestionSpaceRatio } from 'common/constants';
import { TextQuestionComponent } from './text-question.component';
import { ImageQuestionComponent } from './image-question.component';
import { TextAnswersComponent } from './text-answers.component';
import { NextButtonComponent } from './next-button.component';

/* Shows one question: instruction, a stage split into question and answer area, and a footer.
   Owns the selection and decides when an answer is submitted. */
@Component({
  selector: 'speedtest-player-question-view',
  imports: [TextQuestionComponent, ImageQuestionComponent, TextAnswersComponent, NextButtonComponent],
  templateUrl: 'question-view.component.html',
  styleUrls: ['question-view.component.scss']
})
export class QuestionViewComponent implements OnChanges {
  @Input() question!: Question;
  @Input() unit!: Unit;
  @Output() responseGiven = new EventEmitter<number | number[]>();

  selectedAnswers: number[] = [];
  needsNextButton = false;
  stageTracks = '';

  /* The format combinations this view handles so far; the app routes everything else to the old view. */
  static supports(unit: Unit): boolean {
    return ['text', 'image'].includes(unit.questionType) && unit.answerType === 'text';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['unit']) {
      this.needsNextButton = !!this.unit.multipleSelection;
      this.stageTracks = QuestionViewComponent.stageTracksFor(this.unit);
    }
    if (changes['question']) this.selectedAnswers = [];
  }

  /* Grid tracks of the stage: question first, answers second. Each is as big as its content, at most its
     share by the question space ratio (minus half the gap between them), so small content stays together
     instead of being spread over the stage. Stacked answers always keep their own height; the question
     only gets what is left. */
  private static stageTracksFor(unit: Unit): string {
    const ratio = unit.questionSpaceRatio ?? defaultQuestionSpaceRatio(unit.questionType, unit.answerType);
    const answers = unit.layout === 'column' ? 'min-content' : `fit-content(calc(${100 - ratio}% - 25px))`;
    return `fit-content(calc(${ratio}% - 25px)) ${answers}`;
  }

  onAnswerClick(answerIndex: number): void {
    if (!this.unit.multipleSelection) {
      this.submit(answerIndex);
      return;
    }
    this.selectedAnswers = this.selectedAnswers.includes(answerIndex) ?
      this.selectedAnswers.filter(index => index !== answerIndex) :
      [...this.selectedAnswers, answerIndex].sort((a, b) => a - b);
  }

  onNext(): void {
    this.submit(this.selectedAnswers);
  }

  private submit(answer: number | number[]): void {
    this.selectedAnswers = [];
    this.responseGiven.emit(answer);
  }
}
