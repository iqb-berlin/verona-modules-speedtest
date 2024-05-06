import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { fromEvent } from 'rxjs';
import { FileService } from 'common/services/file.service';
import { Unit } from 'common/interfaces/unit';
import { UnitViewComponent } from './unit-view.component';
import { PageNavCommand, StartCommand, VeronaAPIService } from './verona-api.service';

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

    <speedtest-player-unit-view *ngIf="unit && !showOutroPage"
                                [question]="unit.questions[activePageIndex]"
                                [layout]="unit.layout"
                                [buttonColor]="unit.buttonColor"
                                (responseGiven)="sendResponse($event); nextQuestion()">
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
  activePageIndex: number = 0;
  activePageStartTime: number = Date.now();
  showOutroPage: boolean = false;

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

        if (message.unitState?.dataParts) {
          const responseData = JSON.parse(message.unitState?.dataParts.lastSeenPageIndex);
          this.activePageIndex = Number(responseData.value);
          if (this.activePageIndex >= this.unit!.questions.length) this.showOutroPage = true;
        }

        VeronaAPIService.sendState(this.unit!.questions.length, this.activePageIndex, []);
      });

    VeronaAPIService.pageNavCommand
      .subscribe((message: PageNavCommand): void => {
        this.activePageIndex = Number(message.target) - 1;
        VeronaAPIService.sendState(this.unit!.questions.length, this.activePageIndex, []);
      });
    VeronaAPIService.sendReady();
  }

  async loadUnitFromFile(eventTarget: EventTarget | null): Promise<void> {
    const loadedUnit = await FileService.readFileAsText((eventTarget as HTMLInputElement).files?.[0] as File);
    this.unit = JSON.parse(loadedUnit);
  }

  sendResponse(answerIndex: number) {
    if (!this.unit?.questions) throw Error();
    VeronaAPIService.sendState(this.unit.questions.length, this.activePageIndex + 1, [{
      id: `speedtest_${this.activePageIndex}`,
      status: 'VALUE_CHANGED',
      value: answerIndex
    }, {
      id: `speedtest-time_${this.activePageIndex}`,
      status: 'VALUE_CHANGED',
      value: Date.now() - this.activePageStartTime
    }
    ]);
  }

  nextQuestion(): void {
    if (!this.unit) throw Error();
    if (this.unit.questions.length > this.activePageIndex + 1) {
      this.activePageIndex += 1;
      this.activePageStartTime = Date.now();
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
