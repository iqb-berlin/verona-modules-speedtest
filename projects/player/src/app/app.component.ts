import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { fromEvent } from 'rxjs';
import { FileService } from 'common/services/file.service';
import { Unit } from 'common/interfaces/unit';
import { UnitViewComponent } from './unit-view.component';
import { StartCommand, VeronaAPIService, Response } from './verona-api.service';

@Component({
  selector: 'speedtest-player',
  standalone: true,
  imports: [CommonModule, UnitViewComponent, MatButton, MatIcon, MatButton],
  template: `
    <button *ngIf="isStandalone" mat-raised-button class="load-button" (click)="upload.click()">
      Unit laden
      <mat-icon>file_upload</mat-icon>
    </button>

    <input type="file" hidden accept=".json, .voud" #upload
           (change)="loadUnitFromFile($event.target)">

    <speedtest-player-unit-view *ngIf="unit && unit.questions.length > 0 && !showOutroPage"
                                [question]="unit.questions[activeQuestionIndex]"
                                [unit]="unit"
                                (responseGiven)="onResponse($event)">
    </speedtest-player-unit-view>

    <div *ngIf="showOutroPage" class="outro">
      Keine weiteren Seiten. Weiterleitung zur nächsten Unit...
    </div>
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
  `
})
export class AppComponent implements OnInit {
  isStandalone = window === window.parent;
  unit: Unit | undefined;
  activeQuestionIndex: number = 0;
  activeQuestionStartTime: number = Date.now();
  showOutroPage: boolean = false;
  sumCorrect: number = 0;
  sumWrong: number = 0;

  constructor() {
    fromEvent(window, 'message')
      .subscribe((event: Event): void => {
        VeronaAPIService.handleMessage((event as MessageEvent).data);
      });
  }

  ngOnInit(): void {
    VeronaAPIService.startCommand
      .subscribe((message: StartCommand): void => {
        if (!message.unitDefinition) return;
        this.resetUnitState();
        // Wait for the child component to be destroyed, before loading the new unit.
        setTimeout(() => {
          this.unit = JSON.parse(message.unitDefinition) as Unit;
          if (message.unitState?.dataParts !== undefined && Object.keys(message.unitState?.dataParts).length > 0) {
            // Add 1 because the activeQuestionIndex has already been seen and answered
            this.activeQuestionIndex =
              Number(JSON.parse(message.unitState?.dataParts['activeQuestionIndex'])[0].value) + 1;
            this.sumCorrect = Number(JSON.parse(message.unitState?.dataParts['sums'])[0].value);
            this.sumWrong = Number(JSON.parse(message.unitState?.dataParts['activeQuestionIndex'])[0].value);
            if (this.activeQuestionIndex >= this.unit!.questions.length) this.showOutroPage = true;
          }
          VeronaAPIService.sendState({});
        });
      });
    VeronaAPIService.sendReady();
  }

  async loadUnitFromFile(eventTarget: EventTarget | null): Promise<void> {
    this.resetUnitState();
    const loadedUnit = await FileService.readFileAsText((eventTarget as HTMLInputElement).files?.[0] as File);
    this.unit = JSON.parse(loadedUnit);
  }

  private resetUnitState(): void {
    this.unit = undefined;
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
    isCorrect ? this.sumCorrect += 1 : this.sumWrong += 1;
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

  // eslint-disable-next-line class-methods-use-this
  @HostListener('window:blur')
  onBlur() {
    VeronaAPIService.sendFocusChanged(false);
  }

  // eslint-disable-next-line class-methods-use-this
  @HostListener('window:focus')
  onFocus() {
    VeronaAPIService.sendFocusChanged(true);
  }
}
