import { Component, Input } from '@angular/core';
import { NgForOf, NgIf, SlicePipe } from '@angular/common';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  MatButton, MatFabButton, MatIconButton, MatMiniFabButton
} from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { Unit } from 'common/interfaces/unit';
import { FileService } from 'common/services/file.service';
import { UnitService } from '../services/unit.service';

@Component({
  selector: 'speedtest-unit-view',
  standalone: true,
  imports: [
    NgForOf,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatExpansionPanelHeader,
    MatFormField,
    MatInput,
    MatButton,
    MatIcon,
    MatLabel,
    MatTooltip,
    MatFabButton,
    FormsModule,
    NgIf,
    MatIconButton,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatCheckbox,
    MatMiniFabButton,
    SlicePipe
  ],
  templateUrl: 'unit-view.component.html',
  styleUrls: ['./unit-view.component.css']
})
export class UnitViewComponent {
  @Input() unit!: Unit;
  latestQuestionIndex: number | undefined;
  missingCorrectAnswerIndeces: number[] = [];

  constructor(public unitService: UnitService) { }

  addQuestion() {
    this.unit.questions.push({
      text: `Frage ${this.unit.questions.length + 1}`,
      answers: ['richtig', 'falsch']
    });
    this.latestQuestionIndex = this.unit.questions.length - 1;
    this.unitService.updateUnitDef();
    this.calculateMissingCorrectAnswerIndeces();
  }

  deleteQuestion(index: number) {
    this.unit.questions.splice(index, 1);
    this.unitService.updateUnitDef();
    this.calculateMissingCorrectAnswerIndeces();
  }

  addAnswer(questionIndex: number) {
    let answerText: string;
    switch (this.unit.questions[questionIndex].answers.length) {
      case 0: answerText = 'richtig'; break;
      case 1: answerText = 'falsch'; break;
      default: answerText = `Antworttext ${this.unit.questions[questionIndex].answers.length + 1}`; break;
    }
    this.unit.questions[questionIndex].answers.push(answerText);
    this.unitService.updateUnitDef();
  }

  deleteAnswer(questionIndex: number, answerIndex: number) {
    this.unit.questions[questionIndex].answers.splice(answerIndex, 1);
    this.unitService.updateUnitDef();
    this.calculateMissingCorrectAnswerIndeces();
  }

  async loadCSV(event: Event) {
    const loadedUnit = await FileService.readFileAsText((event.target as HTMLInputElement).files?.[0] as File);
    this.unitService.loadCsv(loadedUnit);
    this.unitService.updateUnitDef();
  }

  async loadImage(questionIndex: number, eventTarget: EventTarget | null): Promise<void> {
    this.unit.questions[questionIndex].imgSrc =
      await FileService.readFileAsText((eventTarget as HTMLInputElement).files?.[0] as File, true);
    this.unitService.updateUnitDef();
  }

  removeImage(i: number) {
    this.unit.questions[i].imgSrc = undefined;
    this.unitService.updateUnitDef();
  }

  changeAnswerText(questionIndex: number, answerIndex: number, eventTarget: EventTarget | null) {
    this.unit.questions[questionIndex].answers[answerIndex] = (eventTarget as HTMLInputElement).value;
    this.unitService.updateUnitDef();
  }

  setQuestionTextForAll(text: string) {
    this.unit.questions = this.unit.questions.map(question => ({ ...question, text: text }));
    this.unitService.updateUnitDef();
  }

  setAnswersForAll(answers: string[]) {
    this.unit.questions = this.unit.questions.map(question => ({ ...question, answers: [...answers] }));
    this.unitService.updateUnitDef();
  }

  setCorrectAnswer(questionIndex: number, answerIndex: number, checked: boolean) {
    if (checked) {
      this.unit.questions[questionIndex].correctAnswerIndex = answerIndex;
    } else {
      this.unit.questions[questionIndex].correctAnswerIndex = undefined;
    }
    this.calculateMissingCorrectAnswerIndeces();
  }

  /* Gets all the question indices with missing correct answers. */
  calculateMissingCorrectAnswerIndeces(): void {
    this.missingCorrectAnswerIndeces = this.unit.questions
      .map((question, index) => (question.correctAnswerIndex === undefined ? index : -1))
      .filter(index => index !== -1);
  }
}
