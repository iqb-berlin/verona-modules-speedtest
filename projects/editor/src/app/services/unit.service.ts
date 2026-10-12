import { Injectable } from '@angular/core';
import { VariableInfo } from '@iqb/responses';
import packageInfo from 'packageInfo';
import { Unit } from 'common/interfaces/unit';
import { FileService } from 'common/services/file.service';
import * as csvParser from 'editor/src/app/services/csv-parser';
import { MessageService } from 'editor/src/app/services/message.service';
import { UNIT_DEFINITION_TYPE, UNIT_PARSE_ERROR_MESSAGES, parseUnitDefinition } from 'common/services/unit-validation';
import { VeronaAPIService } from './verona-api.service';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  unitDefVersion = packageInfo.config.unit_definition_version;
  unit: Unit = {
    type: UNIT_DEFINITION_TYPE,
    version: this.unitDefVersion,
    questions: [],
    layout: 'column',
    questionType: 'text',
    answerType: 'text'
  };

  missingCorrectAnswerPositions: number[] = [];

  constructor(private messageService: MessageService) { }

  loadUnitDefinition(unitDefinition: string): void {
    if (!unitDefinition) return;
    const result = parseUnitDefinition(unitDefinition);
    if (result.error) {
      this.messageService.showError(UNIT_PARSE_ERROR_MESSAGES[result.error]);
      return;
    }
    this.unit = result.unit;
  }

  saveUnitToFile(): void {
    FileService.saveUnitToFile(UnitService.stringifyUnit(this.unit));
  }

  /* Replaces the questions; every global setting of the current unit is kept. */
  loadUnitFromCSV(unitString: string) {
    this.unit = {
      ...this.unit,
      version: this.unitDefVersion,
      questions: csvParser.parseQuestions(unitString, this.unit.questionType, this.unit.multipleSelection)
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
    this.calculateMissingCorrectAnswerPositions();
  }

  /* Gets the 1-based positions of all questions with missing correct answers. */
  calculateMissingCorrectAnswerPositions(): void {
    this.missingCorrectAnswerPositions = this.unit.questions
      .flatMap((question, index) => (question.correctAnswer === undefined ||
        (Array.isArray(question.correctAnswer) && question.correctAnswer.length === 0) ?
        [index + 1] : []));
    if (this.missingCorrectAnswerPositions.length > 0) {
      this.messageService.showPermanently(
        `Es fehlen Lösungen für mindestens folgende Fragen:
                    ${this.missingCorrectAnswerPositions.slice(0, 9).join(', ')}`
      );
    } else {
      this.messageService.hideMessage();
    }
  }
}
