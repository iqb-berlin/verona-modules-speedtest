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
  answerAreaWidth = '';
  answerAreaHeight = '';

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
      const ratio = this.unit.questionSpaceRatio ??
        defaultQuestionSpaceRatio(this.unit.layout, this.unit.questionType, this.unit.answerType);
      [this.stageRows, this.stageColumns] =
        ItemViewComponent.stageTracksFor(this.unit.layout, ratio, this.unit.answerType === 'image',
                                         this.answersInQuestion, this.needsNextButton);
      [this.answerAreaWidth, this.answerAreaHeight] = ItemViewComponent.answerAreaFor(this.unit.layout, ratio);
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

  /* Grid rows and columns of the stage. The question takes its share by the question space ratio (minus half
     the gap), whatever its content, so the answers beside or below it stay in place from item to item. The
     answers take their share too, except in column, where only images need it: other answers are as tall as
     their content, so the next button follows right below them. A keypad below the stage shares its row with
     the next button. Empty columns at both ends centre the content in column, so the next button can end
     where the content ends; in row, the gap between question and answers is a column of its own, so those
     empty columns do not add gaps. */
  private static stageTracksFor(
    layout: Unit['layout'], ratio: number, imageAnswers: boolean, questionOnly: boolean, nextButton: boolean
  ): [string, string] {
    const question = `minmax(0, calc(${ratio}% - 25px))`;
    const answers = layout === 'column' && !imageAnswers ?
      'min-content' :
      `minmax(0, calc(${100 - ratio}% - 25px))`;
    const below = nextButton ? ' auto' : '';
    const columns = 'minmax(0, 1fr) minmax(0, max-content) minmax(0, 1fr)';
    if (questionOnly) return [`minmax(0, auto)${below}`, columns];
    return layout === 'column' ?
      [`${question} ${answers}${below}`, columns] :
      [`minmax(0, auto)${below}`, `minmax(0, 1fr) ${question} 50px ${answers} minmax(0, 1fr)`];
  }

  /* The largest size of the answer area, in units of the stage (a size container for image answers), so
     that content can be capped at it while it also sizes the stage tracks: the area's own size is not known
     while the tracks are sized by that content. Its share by the question space ratio in one direction, the
     whole stage in the other. */
  private static answerAreaFor(layout: Unit['layout'], ratio: number): [string, string] {
    const share = `calc(${100 - ratio}cq${layout === 'column' ? 'h' : 'w'} - 25px)`;
    return layout === 'column' ? ['100cqw', share] : [share, '100cqh'];
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
