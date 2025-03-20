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
    layout: 'column',
    questionType: 'text',
    answerType: 'text'
  };

  missingCorrectAnswerIndeces: number[] = [];

  loadUnitDefinition(unitDefinition: string): void {
    if (unitDefinition) this.unit = JSON.parse(unitDefinition);
  }

  saveUnitToFile(): void {
    FileService.saveUnitToFile(JSON.stringify(this.unit));
  }

  // loadCsv(loadedUnit: string) {
  //   const newQuestions = loadedUnit.split(/\n/)
  //     .filter(text => text.trim())
  //     .map((line: string) => {
  //       const items = line.split(';');
  //       return {
  //         layout: 'column' as 'column' | 'row',
  //         text: items[0],
  //         answers: items
  //           .filter((item: string, index: number) => index > 0)
  //           .map(item => (item.trim()))
  //       };
  //     });
  //   this.unit = {
  //     type: 'speedtest-unit-defintion',
  //     version: this.unitDefVersion,
  //     layout: 'column',
  //     questions: newQuestions
  //   };
  // }

  updateUnitDef() {
    // TODO remove unused fields
    VeronaAPIService.sendChange(this.unit, this.getVariableInfo());
  }

  getVariableInfo(): VariableInfo[] {
    return [
      {
        id: 'value',
        alias: 'value',
        type: 'integer',
        format: '',
        multiple: false,
        nullable: false,
        values: [],
        valuePositionLabels: [],
        valuesComplete: true
      },
      {
        id: 'time',
        alias: 'time',
        type: 'integer',
        format: '',
        multiple: false,
        nullable: false,
        values: [],
        valuePositionLabels: [],
        valuesComplete: true
      },
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
    ];
  }

  addAnswer(questionIndex: number, answerText: string) {
    this.unit.questions[questionIndex].answers.push(answerText);
    this.updateUnitDef();
  }

  deleteAnswer(questionIndex: number, answerIndex: number) {
    this.unit.questions[questionIndex].answers.splice(answerIndex, 1);
    this.updateUnitDef();
    this.calculateMissingCorrectAnswerIndeces();
  }

  /* Gets all the question indices with missing correct answers. */
  calculateMissingCorrectAnswerIndeces(): void {
    this.missingCorrectAnswerIndeces = this.unit.questions
      .map((question, index) => (question.correctAnswer === undefined ? index : -1))
      .filter(index => index !== -1);
  }
}
