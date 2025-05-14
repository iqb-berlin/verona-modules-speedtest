import { Injectable } from '@angular/core';
import { VariableInfo } from '@iqb/responses';
import packageInfo from 'packageInfo';
import {
  Answer, Question, Unit, AnswerType
} from 'common/interfaces/unit';
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
    FileService.saveUnitToFile(UnitService.stringifyUnit(this.unit));
  }

  loadUnitFromCSV(unitString: string) {
    const questions: Question[] = unitString.split(/\n/)
      .filter(text => text.trim())
      .map((line: string) => {
        const items: string[] = line.split(';');
        return {
          text: items[0],
          // Only set when second column contains a number. Otherwise it is interpreted as answer text.
          correctAnswer: UnitService.isNumber(items[1].trim()) ? parseInt(items[1].trim(), 10) : undefined,
          answers: UnitService.generateAnswers(this.unit.answerType, items,
                                               UnitService.useOffet(this.unit, items[1]) ? 1 : 0),
          answerPosition: this.unit.questionType === 'inline-answers' ? parseInt(items[1], 10) : undefined
        };
      });
    this.unit = {
      type: 'speedtest-unit-defintion',
      version: this.unitDefVersion,
      layout: this.unit.layout,
      questions: questions,
      questionType: this.unit.questionType,
      answerType: this.unit.answerType
    };
    this.updateUnitDef();
  }

  private static isNumber(string: string): boolean {
    return !Number.isNaN(parseInt(string, 10));
  }

  private static useOffet(unit: Unit, cellContent: string): boolean {
    return UnitService.isNumber(cellContent.trim()) || unit.questionType === 'inline-answers';
  }

  private static generateAnswers(answerType: AnswerType, items: string[], offset: number = 0): Answer[] {
    if (answerType === 'text') {
      return items
        // skip column if it contains a number
        .filter((item: string, index: number) => index > offset)
        .map(item => ({ text: item.trim() }));
    }
    return [];
  }

  updateUnitDef() {
    VeronaAPIService.sendChange(UnitService.stringifyUnit(this.unit), UnitService.getVariableInfo());
  }

  private static stringifyUnit(unit: Unit): string {
    return JSON.stringify(unit, (key, value) => {
      if (unit.answerType === 'number' && key === 'answers') {
        return undefined;
      }
      return value;
    });
  }

  static getVariableInfo(useMultiSelect: boolean = false): VariableInfo[] {
    return [
      {
        id: 'value',
        alias: 'value',
        type: 'integer',
        format: '',
        multiple: useMultiSelect,
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
    this.unit.questions[questionIndex].answers.push({ text: answerText });
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
