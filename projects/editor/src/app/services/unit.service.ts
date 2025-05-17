import { Injectable } from '@angular/core';
import { VariableInfo } from '@iqb/responses';
import packageInfo from 'packageInfo';
import { Unit } from 'common/interfaces/unit';
import { FileService } from 'common/services/file.service';
import * as csvParser from 'editor/src/app/services/csv-parser';
import { VeronaAPIService } from './verona-api.service';
import { MessageService } from 'editor/src/app/services/message.service';

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

  missingCorrectAnswerIndices: number[] = [];

  constructor(private messageService: MessageService) {
  }

  loadUnitDefinition(unitDefinition: string): void {
    if (unitDefinition) this.unit = JSON.parse(unitDefinition);
  }

  saveUnitToFile(): void {
    FileService.saveUnitToFile(UnitService.stringifyUnit(this.unit));
  }

  loadUnitFromCSV(unitString: string) {
    this.unit = {
      type: 'speedtest-unit-defintion',
      version: this.unitDefVersion,
      layout: this.unit.layout,
      questions: csvParser.parseQuestions(unitString, this.unit.questionType, this.unit.multipleSelection),
      questionType: this.unit.questionType,
      answerType: this.unit.answerType,
      multipleSelection: this.unit.multipleSelection
    };
    this.updateUnitDef();
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
    this.missingCorrectAnswerIndices = this.unit.questions
      .map((question, index) => (question.correctAnswer === undefined ? index : -1))
      .filter(index => index !== -1)
      .map(index => index + 1);
    if (this.missingCorrectAnswerIndices.length > 0) {
      this.messageService.showPermanently(
        `Es fehlen Lösungen für mindestens folgende Fragen:
                    ${this.missingCorrectAnswerIndices.slice(0, 9).join(', ')}`
      );
    } else {
      this.messageService.hideMessage();
    }
  }
}
