import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FileService } from 'common/services/file.service';
import { Unit } from 'common/interfaces/unit';
import { UnitViewComponent } from './unit-view.component';
import { PageNavCommand, StartCommand, VeronaAPIService } from './verona-api.service';

@Component({
  selector: 'speedtest-player',
  standalone: true,
  imports: [CommonModule, UnitViewComponent, MatButton, MatIcon, MatButton],
  template: `
    <button *ngIf="isStandalone" mat-raised-button (click)="upload.click()">
      Unit laden
      <mat-icon>file_upload</mat-icon>
    </button>
    <input type="file" hidden accept=".json, .voud" #upload
           (change)="loadUnitFromFile($event.target)">

    <speedtest-player-unit-view *ngIf="unit"
                                [question]="unit.questions[activePageIndex]"
                                [layout]="unit.layout"
                                [buttonColor]="unit.buttonColor"
                                (responseGiven)="sendResponse($event); nextQuestion()">
    </speedtest-player-unit-view>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100vh;
    }
  `
})
export class AppComponent implements OnInit {
  isStandalone = window === window.parent;
  unit: Unit | undefined;
  activePageIndex: number = 0;
  activePageStartTime: number = Date.now();

  constructor(private veronaApiService: VeronaAPIService) { }

  ngOnInit(): void {
    this.veronaApiService.startCommand
      .subscribe((message: StartCommand): void => {
        this.unit = JSON.parse(message.unitDefinition);
        this.veronaApiService.sendState(this.unit!.questions.length, this.activePageIndex, []);
      });
    this.veronaApiService.pageNavCommand
      .subscribe((message: PageNavCommand): void => {
        this.activePageIndex = Number(message.target) - 1;
        this.veronaApiService.sendState(this.unit!.questions.length, this.activePageIndex, []);
      });
    this.veronaApiService.sendReady();
  }

  async loadUnitFromFile(eventTarget: EventTarget | null): Promise<void> {
    const loadedUnit = await FileService.readFileAsText((eventTarget as HTMLInputElement).files?.[0] as File);
    this.unit = JSON.parse(loadedUnit);
  }

  sendResponse(answerIndex: number) {
    if (!this.unit?.questions) throw Error();
    this.veronaApiService.sendState(this.unit.questions.length, this.activePageIndex + 1, [{
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
      this.veronaApiService.sendNavRequest();
    }
  }

  @HostListener('window:blur')
  onBlur() {
    this.veronaApiService.sendFocusChanged(false);
  }

  @HostListener('window:focus')
  onFocus() {
    this.veronaApiService.sendFocusChanged(true);
  }
}
