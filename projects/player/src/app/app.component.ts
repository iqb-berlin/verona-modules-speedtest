import { Component, HostListener, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { fromEvent } from 'rxjs';
import { FileService } from 'common/services/file.service';
import { Unit } from 'common/interfaces/unit';
import { UnitParseError, UNIT_PARSE_ERROR_MESSAGES, parseUnitDefinition } from 'common/services/unit-validation';
import { QuestionViewComponent } from './question-view/question-view.component';
import { StartCommand, VeronaAPIService, Response } from './verona-api.service';

@Component({
  selector: 'speedtest-player',
  imports: [QuestionViewComponent, MatButton, MatIcon],
  template: `
    @if (isStandalone) {
      <button mat-raised-button class="load-button" (click)="upload.click()">
        Unit laden
        <mat-icon>file_upload</mat-icon>
      </button>
    }

    <input type="file" hidden accept=".json, .voud" #upload
           (change)="loadUnitFromFile($event.target)">

    @if (unit && unit.questions.length > 0 && !showOutroPage) {
      <speedtest-player-question-view [question]="unit.questions[activeQuestionIndex]"
                                      [unit]="unit"
                                      (responseGiven)="onResponse($event)">
      </speedtest-player-question-view>
    }

    @if (showOutroPage) {
      <div class="outro">
        Keine weiteren Seiten. Weiterleitung zur nächsten Unit...
      </div>
    }

    @if (loadErrorMessage) {
      <div class="load-error">
        Diese Unit kann nicht geladen werden.<br>
        ({{ loadErrorMessage }})
      </div>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100vh;
    }
    .load-button {
      position: absolute;
      right: 0;
    }
    .outro {
      margin: auto;
      font-size: x-large;
    }
    .load-error {
      margin: auto;
      font-size: x-large;
      text-align: center;
    }
  `
})
export class AppComponent implements OnInit {
  isStandalone = window === window.parent;
  unit: Unit | undefined;
  activeQuestionIndex: number = 0;
  activeQuestionStartTime: number = Date.now();
  showOutroPage: boolean = false;
  loadErrorMessage: string | undefined;
  sumCorrect: number = 0;
  sumWrong: number = 0;

  constructor() {
    fromEvent(window, 'message')
      .subscribe((event: Event): void => {
        VeronaAPIService.handleMessage((event as MessageEvent<StartCommand>).data);
      });
  }

  ngOnInit(): void {
    VeronaAPIService.startCommand
      .subscribe((message: StartCommand): void => {
        if (!message.unitDefinition) return;
        this.resetUnitState();
        // Wait for the child component to be destroyed, before loading the new unit.
        setTimeout(() => {
          const result = parseUnitDefinition(message.unitDefinition);
          if (result.error) {
            this.showLoadError(result.error);
            VeronaAPIService.sendState({});
            return;
          }
          this.unit = result.unit;
          if (message.unitState?.dataParts !== undefined && Object.keys(message.unitState?.dataParts).length > 0) {
            const { dataParts } = message.unitState;
            const sums = JSON.parse(dataParts['sums']) as Response[];
            // Add 1 because the activeQuestionIndex has already been seen and answered
            const lastAnswered = JSON.parse(dataParts['activeQuestionIndex']) as Response[];
            this.activeQuestionIndex = Number(lastAnswered[0].value) + 1;
            this.sumCorrect = Number(sums[0].value);
            this.sumWrong = Number(sums[1].value);
            if (this.activeQuestionIndex >= this.unit.questions.length) this.showOutroPage = true;
          }
          VeronaAPIService.sendState({});
        });
      });
    VeronaAPIService.sendReady();
  }

  async loadUnitFromFile(eventTarget: EventTarget | null): Promise<void> {
    this.resetUnitState();
    const loadedUnit = await FileService.readFileAsText((eventTarget as HTMLInputElement).files?.[0] as File);
    const result = parseUnitDefinition(loadedUnit);
    if (result.error) {
      this.showLoadError(result.error);
      return;
    }
    this.unit = result.unit;
  }

  // Logged as well, so the reason also reaches the host's logs, where the screen is not seen.
  private showLoadError(error: UnitParseError): void {
    this.loadErrorMessage = UNIT_PARSE_ERROR_MESSAGES[error];
    console.error(`Speedtest-Player: ${this.loadErrorMessage}`);
  }

  private resetUnitState(): void {
    this.unit = undefined;
    this.loadErrorMessage = undefined;
    this.activeQuestionIndex = 0;
    this.activeQuestionStartTime = Date.now();
    this.showOutroPage = false;
    this.sumCorrect = 0;
    this.sumWrong = 0;
  }

  onResponse(answer: number | number[]) {
    const isCorrect = AppComponent.getIsCorrect(
      answer, this.unit?.questions[this.activeQuestionIndex].correctAnswer);
    if (isCorrect !== undefined) this.updateResultSums(isCorrect);
    VeronaAPIService.sendState(this.createResponseData(answer, isCorrect));
    this.gotoNextQuestion();
  }

  private static getIsCorrect(answer: number | number[],
                              correctAnswer: number | number[] | undefined): boolean | undefined {
    if (correctAnswer === undefined) return undefined;
    return JSON.stringify(answer) === JSON.stringify(correctAnswer);
  }

  private updateResultSums(isCorrect: boolean): void {
    if (isCorrect) {
      this.sumCorrect += 1;
    } else {
      this.sumWrong += 1;
    }
  }

  private createResponseData(answerValue: number | number[], isCorrect?: boolean): Record<string, Response[]> {
    let code;
    if (isCorrect === undefined) {
      code = undefined;
    } else {
      code = isCorrect ? 1 : 0;
    }

    return {
      [`question_${this.activeQuestionIndex}`]: [{
        id: 'value',
        status: 'CODING_COMPLETE',
        value: answerValue,
        subform: String(this.activeQuestionIndex),
        code: code,
        score: code
      }, {
        id: 'time',
        status: 'VALUE_CHANGED',
        value: Date.now() - this.activeQuestionStartTime,
        subform: String(this.activeQuestionIndex)
      }],
      sums: [
        {
          id: 'total_correct',
          status: 'VALUE_CHANGED',
          value: this.sumCorrect
        },
        {
          id: 'total_wrong',
          status: 'VALUE_CHANGED',
          value: this.sumWrong
        }
      ],
      activeQuestionIndex: [{
        id: 'activeQuestionIndex',
        status: 'VALUE_CHANGED',
        value: this.activeQuestionIndex
      }]
    };
  }

  private gotoNextQuestion(): void {
    if (!this.unit) throw Error();
    if (this.unit.questions.length > this.activeQuestionIndex + 1) {
      this.activeQuestionIndex += 1;
      this.activeQuestionStartTime = Date.now();
    } else {
      this.showOutroPage = true;
      VeronaAPIService.sendNavRequest();
    }
  }

  @HostListener('window:blur')
  onBlur() {
    VeronaAPIService.sendFocusChanged(false);
  }

  @HostListener('window:focus')
  onFocus() {
    VeronaAPIService.sendFocusChanged(true);
  }
}
