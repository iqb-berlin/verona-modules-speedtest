import { Injectable } from '@angular/core';
import { Unit } from '../../../../common/interfaces/unit';
import { FileService } from '../../../../common/services/file.service';
import { VeronaAPIService } from './verona-api.service';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  unit: Unit = {
    type: 'speedtest-unit-defintion',
    version: '0.1',
    questions: [],
    defaultVariablePrefix: 'speedtest_'
  };

  constructor(private veronaApiService: VeronaAPIService) { }

  loadUnitDefinition(unitDefinition: string): void {
    if (unitDefinition) {
      this.unit = JSON.parse(unitDefinition);
    } else {
      console.log('No unit definition given. Starting with empty unit.');
    }
  }

  saveUnitToFile(): void {
    FileService.saveUnitToFile(JSON.stringify(this.unit));
  }

  loadCsv(loadedUnit: string) {
    const newQuestions = loadedUnit.split(/\n/)
      .filter(text => text.trim())
      .map((line: string) => {
        return {
          layout: 'column' as 'column' | 'row',
          text: line,
          anwers: []
        }
      });
    this.unit = {
      type: 'speedtest-unit-defintion',
      version: '0.1',
      defaultVariablePrefix: 'speedtest_',
      questions: newQuestions
    };
  }

  updateUnitDef() {
    this.veronaApiService.sendVoeDefinitionChangedNotification(this.unit);
  }
}
