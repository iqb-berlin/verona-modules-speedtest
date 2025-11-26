import {
  Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, QueryList, ViewChildren
} from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Question, Unit } from 'common/interfaces/unit';
import { FormsModule } from '@angular/forms';
import { SplitWordPipe } from './split-word.pipe';

@Component({
    selector: 'speedtest-player-unit-view',
    imports: [
        NgIf,
        MatButton,
        NgClass,
        FormsModule,
        SplitWordPipe,
        MatIcon
    ],
    templateUrl: 'unit-view.component.html',
    styleUrls: ['unit-view.component.scss']
})
export class UnitViewComponent implements OnInit, OnChanges {
  @Input() question!: Question;
  @Input() unit!: Unit;
  @Output() responseGiven = new EventEmitter<number | number[]>();
  @ViewChildren('audioRef') audioElements!: QueryList<ElementRef<HTMLAudioElement>>;

  innerWrapperClasses: Record<string, boolean> = {};

  isAudioActive: boolean = false;
  numberAnswer: (number | undefined)[] = [];
  mathInputs: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  activeNumberIndex: number = 0;
  selectedAnswers: number[] = [];
  textParts: TextPart[] = [];

  ngOnInit(): void {
    this.initStateVars();
    this.innerWrapperClasses = UnitViewComponent.setInnerWrapperClasses(this.unit);
  }

  ngOnChanges(): void {
    this.initStateVars();
  }

  private initStateVars(): void {
    if (this.unit.answerType === 'number') {
      this.numberAnswer = Array(this.question.correctAnswer?.toString().length).fill(undefined);
    }
    if (this.unit.questionType === 'word-select') {
      this.textParts = UnitViewComponent.createWordList(this.question.text as string);
    }
    if (this.unit.questionType === 'inline-answers') {
      if (!this.question.text || !this.question.answerPosition) throw Error();
      const [firstPart, secondPart] = UnitViewComponent.splitSentence(this.question.text, this.question.answerPosition);
      this.textParts[0] = { text: firstPart };
      this.textParts[1] = { text: secondPart };
    }
  }

  private static splitSentence(text: string, pos: number): [string, string] {
    const words = text.split(' ');
    const firstPart = words.slice(0, pos).join(' ');
    const secondPart = words.slice(pos).join(' ');
    return [firstPart, secondPart];
  }

  private static setInnerWrapperClasses(unit: Unit): Record<string, boolean> {
    return {
      column: unit.layout === 'column',
      row: unit.layout === 'row',
      'instruction-present': !!unit.instructionText,
      'text-audio-only':
        (unit.questionType === 'text' && ['text', 'audio'].includes(unit.answerType)) || unit.questionType === 'audio',
      'image-answers': unit.answerType === 'image',
      numbers: unit.answerType === 'number',
      'image-and-numbers': unit.questionType === 'image' && unit.answerType === 'number',
      'inline-answers': unit.questionType === 'inline-answers',
      'word-select': unit.questionType === 'word-select'
    };
  }

  onAnswerClick(answerIndex: number) {
    if (this.unit.multipleSelection || this.unit.questionType === 'word-select') {
      if (this.selectedAnswers.includes(answerIndex)) {
        this.selectedAnswers.splice(this.selectedAnswers.indexOf(answerIndex), 1);
      } else {
        this.selectedAnswers.push(answerIndex);
      }
      this.selectedAnswers.sort();
    } else {
      this.setAnswer(answerIndex);
    }
  }

  setAnswer(answerValue: number | number[]) {
    this.responseGiven.emit(answerValue);
    setTimeout(() => {
      this.resetState();
    });
  }

  onNext() {
    let value;
    if (this.unit.answerType === 'number') {
      value = parseInt(this.numberAnswer.join(''), 10);
    } else {
      value = this.selectedAnswers;
    }
    this.setAnswer(value);
  }

  resetState(): void {
    if (this.unit.answerType === 'number') {
      this.numberAnswer = Array(this.question.correctAnswer?.toString().length).fill(undefined);
    }
    this.activeNumberIndex = 0;
    this.isAudioActive = false;
    this.selectedAnswers = [];
  }

  /* Tokenized sentence for word selection */
  private static createWordList(sentence: string): TextPart[] {
    const parts: TextPart[] = [];
    let wordIndex = 0;
    // Regex: match words, punctuation, and spaces separately
    const tokens = sentence.match(/\p{L}+\p{M}*|\p{N}+|[^\p{L}\p{N}\s]+|\s+/gu) || [];
    tokens.forEach(token => {
      const isWord = /^\p{L}+$/u.test(token);
      const isSpace = /^\s+$/.test(token);
      const part: TextPart = {
        text: isSpace ? '\u00A0' : token,
        isSelectable: isWord && !isSpace
      };
      if (part.isSelectable) {
        part.wordIndex = wordIndex;
        wordIndex += 1;
      }
      parts.push(part);
    });
    return parts;
  }

  playAnswerAudio(answerIndex: number) {
    const audioEl = this.audioElements.toArray()[answerIndex];
    if (audioEl) {
      audioEl.nativeElement.play();
    }
  }

  enterDigit(number: number) {
    this.numberAnswer[this.activeNumberIndex] = number;
    if (this.activeNumberIndex + 1 < (this.question.correctAnswer?.toString().length as number)) {
      this.activeNumberIndex += 1;
    }
  }

  deleteDigit(): void {
    if (this.numberAnswer[this.activeNumberIndex] === undefined) {
      this.moveCursorBackward();
    }
    this.numberAnswer[this.activeNumberIndex] = undefined;
  }

  moveCursorBackward() {
    if (this.activeNumberIndex > 0) this.activeNumberIndex -= 1;
  }

  moveCorsorForward() {
    if (this.activeNumberIndex <= this.numberAnswer.length - 2) this.activeNumberIndex += 1;
  }

  // This method allows for keyboard input on number answers.
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (this.unit.answerType === 'number') {
      if (/^\d$/.test(event.key)) {
        this.enterDigit(Number.parseInt(event.key, 10));
      }
      if (event.key === 'ArrowLeft') {
        this.moveCursorBackward();
      }
      if (event.key === 'ArrowRight') {
        this.moveCorsorForward();
      }
    }
  }

  selectResultBox(boxIndex: number): void {
    this.activeNumberIndex = boxIndex;
  }
}

export interface TextPart {
  text: string;
  isSelectable?: boolean;
  wordIndex?: number;
}
