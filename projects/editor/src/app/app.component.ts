import { Component, OnInit } from '@angular/core';
import { fromEvent } from 'rxjs';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { VeronaAPIService, StartCommand, GetDefinitionCommand } from './services/verona-api.service';
import { UnitService } from './services/unit.service';
import { UnitViewComponent } from './components/unit-view.component';

@Component({
  selector: 'speedtest-editor',
  imports: [ToolbarComponent, UnitViewComponent],
  template: `
    @if (isStandalone) {
      <speedtest-toolbar (saveUnit)="unitService.saveUnitToFile()"
                         (unitLoaded)="unitService.loadUnitDefinition($event)">
      </speedtest-toolbar>
    }
    <speedtest-unit-view [unit]="unitService.unit"></speedtest-unit-view>
  `
})
export class AppComponent implements OnInit {
  isStandalone = window === window.parent;

  constructor(public unitService: UnitService) {
    fromEvent(window, 'message')
      .subscribe((event: Event): void => {
        VeronaAPIService.handleMessage((event as MessageEvent<GetDefinitionCommand | StartCommand>).data);
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
