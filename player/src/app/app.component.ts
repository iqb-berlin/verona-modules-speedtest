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
                                [layout]="unit.layout"
                                [buttonColor]="unit.buttonColor"
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
        this.unit = JSON.parse(message.unitDefinition) as Unit;

        if (message.unitState?.dataParts !== undefined && Object.keys(message.unitState?.dataParts).length > 0) {
          // Add 1 because the activeQuestionIndex has already been seen and answered
          this.activeQuestionIndex = Number(JSON.parse(message.unitState?.dataParts.activeQuestionIndex).value) + 1;
          this.sumCorrect = Number(JSON.parse(message.unitState?.dataParts.sums).value);
          this.sumWrong = Number(JSON.parse(message.unitState?.dataParts.activeQuestionIndex).value);
          if (this.activeQuestionIndex >= this.unit!.questions.length) this.showOutroPage = true;
        }

        VeronaAPIService.sendState({});
      });

    VeronaAPIService.sendReady();
  }

  async loadUnitFromFile(eventTarget: EventTarget | null): Promise<void> {
    const loadedUnit = await FileService.readFileAsText((eventTarget as HTMLInputElement).files?.[0] as File);
    this.unit = JSON.parse(loadedUnit);
  }

  onResponse(answerIndex: number) {
    this.updateResults(answerIndex);
    VeronaAPIService.sendState(this.createResponseData(answerIndex));
    this.gotoNextQuestion();
  }

  private updateResults(answerIndex: number): void {
    if (this.unit?.questions[this.activeQuestionIndex].correctAnswerIndex !== undefined) {
      this.unit?.questions[this.activeQuestionIndex].correctAnswerIndex === answerIndex ?
        this.sumCorrect += 1 : this.sumWrong += 1;
    }
  }

  private createResponseData(answerIndex: number, isCorrect?: boolean): Record<string, Response[]> {
    let code;
    if (isCorrect === undefined) {
      code = undefined;
    } else {
      code = isCorrect ? 1 : 0;
    }

    return {
      [`question_${this.activeQuestionIndex}`]: [{
        id: 'value',
        status: 'VALUE_CHANGED',
        value: answerIndex,
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
          id: 'correct',
          status: 'VALUE_CHANGED',
          value: this.sumCorrect,
          subform: 'sums'
        },
        {
          id: 'wrong',
          status: 'VALUE_CHANGED',
          value: this.sumWrong,
          subform: 'sums'
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
