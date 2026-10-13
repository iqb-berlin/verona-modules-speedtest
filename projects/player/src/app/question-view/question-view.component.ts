import {
  Component, EventEmitter, HostListener, Input, OnChanges, SimpleChanges, Output
} from '@angular/core';
import { Question, Unit } from 'common/interfaces/unit';
import { defaultQuestionSpaceRatio } from 'common/constants';
import { TextQuestionComponent } from './text-question.component';
import { ImageQuestionComponent } from './image-question.component';
import { AudioQuestionComponent } from './audio-question.component';
import { TextAnswersComponent } from './text-answers.component';
import { ImageAnswersComponent } from './image-answers.component';
import { NumberBoxesComponent } from './number-boxes.component';
import { KeypadComponent } from './keypad.component';
import { NextButtonComponent } from './next-button.component';
import { NumberEntry } from './number-entry';

/* Shows one question: instruction, then a stage with question and answer area and, if needed, keypad and next button.
   Owns the selection and decides when an answer is submitted. Also owns whether an audio is playing:
   only one may play at a time, so every audio button is disabled meanwhile. */
@Component({
  selector: 'speedtest-player-question-view',
  imports: [
    TextQuestionComponent, ImageQuestionComponent, AudioQuestionComponent,
    TextAnswersComponent, ImageAnswersComponent, NumberBoxesComponent, KeypadComponent, NextButtonComponent
  ],
  templateUrl: 'question-view.component.html',
  styleUrls: ['question-view.component.scss']
})
export class QuestionViewComponent implements OnChanges {
  @Input() question!: Question;
  @Input() unit!: Unit;
  @Output() responseGiven = new EventEmitter<number | number[]>();

  selectedAnswers: number[] = [];
  numberEntry = new NumberEntry(1);
  audioPlaying = false;
  needsNextButton = false;
  keypadBelowStage = false;
  stageRows = '';
  stageColumns = '';

  /* The format combinations this view handles so far; the app routes everything else to the old view. */
  static supports(unit: Unit): boolean {
    return ['text', 'image', 'audio'].includes(unit.questionType);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['unit']) {
      this.needsNextButton = !!this.unit.multipleSelection || this.unit.answerType === 'number';
      // Beside the question, the keypad does not fit into the answer area; it spans the stage below both.
      this.keypadBelowStage = this.unit.answerType === 'number' && this.unit.layout === 'row';
      [this.stageRows, this.stageColumns] =
        QuestionViewComponent.stageTracksFor(this.unit, this.keypadBelowStage, this.needsNextButton);
    }
    if (changes['question']) {
      this.selectedAnswers = [];
      this.numberEntry = NumberEntry.forAnswer(this.question.correctAnswer);
      // A new source stops the playing audio without an ended event.
      this.audioPlaying = false;
    }
  }

  /* Grid rows and columns of the stage. Question first, answers second: each is as big as its content, at
     most its share by the question space ratio (minus half the gap between them), so small content stays
     together instead of being spread over the stage. Stacked text and audio answers always keep their own
     height; the question only gets what is left. Image answers give way like an image question. Keypad and
     next button follow in rows of their own, so they stay close to the content. Empty columns at both ends
     centre the content, so the next button can end where the content ends; in row, the gap between question
     and answers is a column of its own, so those empty columns do not add gaps. */
  private static stageTracksFor(unit: Unit, keypad: boolean, nextButton: boolean): [string, string] {
    const ratio = unit.questionSpaceRatio ?? defaultQuestionSpaceRatio(unit.questionType, unit.answerType);
    const question = `fit-content(calc(${ratio}% - 25px))`;
    const answers = unit.layout === 'column' && unit.answerType !== 'image' ?
      'min-content' :
      `fit-content(calc(${100 - ratio}% - 25px))`;
    const below = `${keypad ? ' auto' : ''}${nextButton ? ' auto' : ''}`;
    return unit.layout === 'column' ?
      [`${question} ${answers}${below}`, 'minmax(0, 1fr) minmax(0, max-content) minmax(0, 1fr)'] :
      [`minmax(0, auto)${below}`, `minmax(0, 1fr) ${question} 50px ${answers} minmax(0, 1fr)`];
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
    this.submit(this.unit.answerType === 'number' ? this.numberEntry.value() : this.selectedAnswers);
  }

  /* Hardware keyboard for number entry: digits, backspace, and the arrow keys to move between boxes. */
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.unit.answerType !== 'number') return;
    if (/^\d$/.test(event.key)) this.numberEntry.enter(Number(event.key));
    if (event.key === 'Backspace') this.numberEntry.delete();
    if (event.key === 'ArrowLeft') this.numberEntry.moveBack();
    if (event.key === 'ArrowRight') this.numberEntry.moveForward();
  }

  private submit(answer: number | number[]): void {
    this.selectedAnswers = [];
    this.responseGiven.emit(answer);
  }
}
