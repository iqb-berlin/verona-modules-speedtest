import { Injectable } from '@angular/core';
import { VariableInfo } from '@iqb/responses';
import packageInfo from 'packageInfo';
import { Unit } from 'common/interfaces/unit';
import { FileService } from 'common/services/file.service';
import { VeronaAPIService } from './verona-api.service';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  unitDefVersion = packageInfo.config.unit_definition_version;
  unit: Unit = {
    type: 'speedtest-unit-defintion',
    version: this.unitDefVersion,
    questions: [],
    layout: 'column'
  };

  loadUnitDefinition(unitDefinition: string): void {
    if (unitDefinition) this.unit = JSON.parse(unitDefinition);
  }

  saveUnitToFile(): void {
    FileService.saveUnitToFile(JSON.stringify(this.unit));
  }

  loadCsv(loadedUnit: string) {
    const newQuestions = loadedUnit.split(/\n/)
      .filter(text => text.trim())
      .map((line: string) => {
        const items = line.split(';');
        return {
          layout: 'column' as 'column' | 'row',
          text: items[0],
          answers: items
            .filter((item: string, index: number) => index > 0)
            .map(item => (item.trim()))
        };
      });
    this.unit = {
      type: 'speedtest-unit-defintion',
      version: this.unitDefVersion,
      layout: 'column',
      questions: newQuestions
    };
  }

  updateUnitDef() {
    VeronaAPIService.sendChange(this.unit, this.getVariableInfo());
  }

  getVariableInfo(): VariableInfo[] {
    const allQuestions: VariableInfo[] = this.unit.questions.map((q, i) => ({
      id: `question_${i}`,
      alias: `question_${i}`,
      type: 'integer',
      format: '',
      multiple: false,
      nullable: false,
      values: q.answers
        .map((option, j) => ({
          value: j,
          label: option
        })),
      valuePositionLabels: [],
      valuesComplete: true
    }));

    return allQuestions.concat([
      {
        id: 'activeQuestionIndex',
        alias: 'activeQuestionIndex',
        type: 'no-value',
        format: '',
        multiple: false,
        nullable: false,
        values: [],
        valuePositionLabels: [],
        valuesComplete: true
      },
      {
        id: 'total_correct',
        alias: 'total_correct',
        type: 'integer',
        format: '',
        multiple: false,
        nullable: false,
        values: [],
        valuePositionLabels: [],
        valuesComplete: true
      },
      {
        id: 'total_wrong',
        alias: 'total_wrong',
        type: 'integer',
        format: '',
        multiple: false,
        nullable: false,
        values: [],
        valuePositionLabels: [],
        valuesComplete: true
      }
    ]);
  }
}
