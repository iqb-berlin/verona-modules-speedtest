import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { fromEvent } from 'rxjs';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { VeronaAPIService, StartCommand } from './services/verona-api.service';
import { UnitService } from './services/unit.service';
import { UnitViewComponent } from './components/unit-view.component';

@Component({
  selector: 'speedtest-editor',
  standalone: true,
  imports: [CommonModule, ToolbarComponent, UnitViewComponent],
  template: `
    <speedtest-toolbar *ngIf="isStandalone"
                       (saveUnit)="unitService.saveUnitToFile()"
                       (unitLoaded)="unitService.loadUnitDefinition($event)">
    </speedtest-toolbar>
    <speedtest-unit-view [unit]="unitService.unit"></speedtest-unit-view>
  `
})
export class AppComponent implements OnInit {
  isStandalone = window === window.parent;

  constructor(public unitService: UnitService) {
    fromEvent(window, 'message')
      .subscribe((event: Event): void => {
        VeronaAPIService.handleMessage((event as MessageEvent).data);
      });
  }

  ngOnInit(): void {
    VeronaAPIService.startCommand
      .subscribe((message: StartCommand): void => {
        this.unitService.loadUnitDefinition(message.unitDefinition);
      });

    VeronaAPIService.sendReady();
  }
}
