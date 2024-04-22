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
    version: '0.2',
    questions: [],
    layout: 'column'
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
        const items = line.split(';')
        return {
          layout: 'column' as 'column' | 'row',
          text: items[0],
          answers: items
            .filter((item: string, index: number) => index > 0)
            .map(item => (item.trim()))
        }
      });
    this.unit = {
      type: 'speedtest-unit-defintion',
      version: '0.1',
      layout: 'column',
      questions: newQuestions
    };
  }

  updateUnitDef() {
    this.veronaApiService.sendVoeDefinitionChangedNotification(this.unit);
  }
}
