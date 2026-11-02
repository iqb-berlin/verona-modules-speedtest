import {
  Component, EventEmitter, HostListener, Input, OnChanges, SimpleChanges, Output,
  ChangeDetectionStrategy
} from '@angular/core';
import { Item, Unit } from 'common/interfaces/unit';
import { defaultQuestionSpaceRatio } from 'common/constants';
import { TextQuestionComponent } from './question/text-question.component';
import { ImageQuestionComponent } from './question/image-question.component';
import { AudioQuestionComponent } from './question/audio-question.component';
import { WordSelectComponent } from './question/word-select.component';
import { InlineAnswersComponent } from './question/inline-answers.component';
import { TextAnswersComponent } from './answers/text-answers.component';
import { ImageAnswersComponent } from './answers/image-answers.component';
import { NumberBoxesComponent } from './answers/number-entry/number-boxes.component';
import { KeypadComponent } from './answers/number-entry/keypad.component';
import { NumberEntry } from './answers/number-entry/number-entry';
import { NextButtonComponent } from './next-button.component';

/* Shows one item, that is a question with its answers: instruction, then a stage with question and answer
   area and, if needed, keypad and next button.
   Owns the selection and decides when an answer is submitted. Also owns whether an audio is playing:
   only one may play at a time, so every audio button is disabled meanwhile. With audioRequired, a question
   with audio locks every answer input until that audio has played to its end (#36); a locked input
   looks flat where it can without losing contrast, takes no answer, and wobbles the audio button instead. */
@Component({
  selector: 'speedtest-player-item-view',
  imports: [
    TextQuestionComponent, ImageQuestionComponent, AudioQuestionComponent, WordSelectComponent, InlineAnswersComponent,
    TextAnswersComponent, ImageAnswersComponent, NumberBoxesComponent, KeypadComponent, NextButtonComponent
  ],
  templateUrl: 'item-view.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['item-view.component.scss']
})
export class ItemViewComponent implements OnChanges {
  @Input() item!: Item;
  @Input() unit!: Unit;
  @Output() responseGiven = new EventEmitter<number | number[]>();

  selectedAnswers: number[] = [];
  numberEntry = new NumberEntry(1);
  audioPlaying = false;
  answersLocked = false;
  // A trigger, not state: each new value wobbles the audio button again.
  audioButtonWobbles = 0;
  answersInQuestion = false;
  togglesSelection = false;
  needsNextButton = false;
  keypadBelowStage = false;
  stageLayout: 'column' | 'row' = 'column';
  stageRows = '';
  stageColumns = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['unit']) {
      // Word-select and inline answers are answered within the question; there is no answer area.
      this.answersInQuestion = ['word-select', 'inline-answers'].includes(this.unit.questionType);
      this.stageLayout = this.answersInQuestion ? 'column' : this.unit.layout;
      // Words are always struck through one by one and then submitted.
      this.togglesSelection = !!this.unit.multipleSelection || this.unit.questionType === 'word-select';
      this.needsNextButton = this.togglesSelection || this.unit.answerType === 'number';
      // Beside the question, the keypad does not fit into the answer area; it spans the stage below both.
      this.keypadBelowStage = this.unit.answerType === 'number' && this.unit.layout === 'row';
      [this.stageRows, this.stageColumns] =
        ItemViewComponent.stageTracksFor(this.unit, this.answersInQuestion, this.keypadBelowStage,
                                         this.needsNextButton);
    }
    if (changes['item']) {
      this.selectedAnswers = [];
      this.numberEntry = NumberEntry.forAnswer(this.item.correctAnswer);
      // A new source stops the playing audio without an ended event.
      this.audioPlaying = false;
      this.answersLocked = !!this.unit.audioRequired && !!this.item.src &&
        ['audio', 'word-select', 'inline-answers'].includes(this.unit.questionType);
    }
  }

  /* Grid rows and columns of the stage. Question first, answers second: each is as big as its content, at
     most its share by the question space ratio (minus half the gap between them), so small content stays
     together instead of being spread over the stage. Stacked text and audio answers always keep their own
     height; the question only gets what is left. Image answers give way like an image question. Keypad and
     next button follow in rows of their own, so they stay close to the content. Empty columns at both ends
     centre the content, so the next button can end where the content ends; in row, the gap between question
     and answers is a column of its own, so those empty columns do not add gaps. */
  private static stageTracksFor(
    unit: Unit, questionOnly: boolean, keypad: boolean, nextButton: boolean
  ): [string, string] {
    const ratio = unit.questionSpaceRatio ?? defaultQuestionSpaceRatio(unit.questionType, unit.answerType);
    const question = `fit-content(calc(${ratio}% - 25px))`;
    const answers = unit.layout === 'column' && unit.answerType !== 'image' ?
      'min-content' :
      `fit-content(calc(${100 - ratio}% - 25px))`;
    const below = `${keypad ? ' auto' : ''}${nextButton ? ' auto' : ''}`;
    const columns = 'minmax(0, 1fr) minmax(0, max-content) minmax(0, 1fr)';
    if (questionOnly) return [`minmax(0, auto)${below}`, columns];
    return unit.layout === 'column' ?
      [`${question} ${answers}${below}`, columns] :
      [`minmax(0, auto)${below}`, `minmax(0, 1fr) ${question} 50px ${answers} minmax(0, 1fr)`];
  }

  // Also when the audio cannot be played, so that a broken file does not lock the question for good.
  onQuestionAudioFinished(): void {
    this.answersLocked = false;
  }

  onAnswerClick(answerIndex: number): void {
    if (this.refuseWhileLocked()) return;
    if (!this.togglesSelection) {
      this.submit(answerIndex);
      return;
    }
    this.selectedAnswers = this.selectedAnswers.includes(answerIndex) ?
      this.selectedAnswers.filter(index => index !== answerIndex) :
      [...this.selectedAnswers, answerIndex].sort((a, b) => a - b);
  }

  onNext(): void {
    if (this.refuseWhileLocked()) return;
    this.submit(this.unit.answerType === 'number' ? this.numberEntry.value() : this.selectedAnswers);
  }

  /* Hardware keyboard for number entry: digits, backspace, and the arrow keys to move between boxes. */
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.unit.answerType !== 'number') return;
    if (!/^\d$/.test(event.key) && !['Backspace', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    if (this.refuseWhileLocked()) return;
    if (/^\d$/.test(event.key)) this.numberEntry.enter(Number(event.key));
    if (event.key === 'Backspace') this.numberEntry.delete();
    if (event.key === 'ArrowLeft') this.numberEntry.moveBack();
    if (event.key === 'ArrowRight') this.numberEntry.moveForward();
  }

  onDigitClick(digit: number): void {
    if (!this.refuseWhileLocked()) this.numberEntry.enter(digit);
  }

  onDeleteClick(): void {
    if (!this.refuseWhileLocked()) this.numberEntry.delete();
  }

  onBoxClick(boxIndex: number): void {
    if (!this.refuseWhileLocked()) this.numberEntry.select(boxIndex);
  }

  /* Whether an answer input must be ignored. If so, the audio button wobbles, unless its audio is already
     playing. */
  private refuseWhileLocked(): boolean {
    if (!this.answersLocked) return false;
    if (!this.audioPlaying) this.audioButtonWobbles += 1;
    return true;
  }

  private submit(answer: number | number[]): void {
    this.selectedAnswers = [];
    this.responseGiven.emit(answer);
  }
}
