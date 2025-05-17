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
  MatButton, MatFabButton, MatIconButton
} from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatOption } from '@angular/material/autocomplete';
import { MatSelect } from '@angular/material/select';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import {
  MatCard, MatCardContent, MatCardHeader, MatCardTitle
} from '@angular/material/card';
import { Answer, Unit } from 'common/interfaces/unit';
import { FileService } from 'common/services/file.service';
import { imageAndImage, imageAndText, textOnly } from 'common/constants';
import { MessageService } from 'editor/src/app/services/message.service';
import { UnitService } from '../services/unit.service';
import { AnswerPanelComponent } from './answer-panel.component';

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
    SlicePipe,
    MatOption,
    MatSelect,
    AnswerPanelComponent,
    MatCheckbox,
    MatRadioGroup,
    MatRadioButton,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent
  ],
  templateUrl: 'unit-view.component.html',
  styleUrls: ['./unit-view.component.css']
})
export class UnitViewComponent {
  @Input() unit!: Unit;
  latestQuestionIndex: number | undefined;
  csvImportVisible = false;
  activeRatioDefault = textOnly;

  constructor(public unitService: UnitService, private messageService: MessageService) { }

  addQuestion() {
    this.unit.questions.push({
      text: `Frage ${this.unit.questions.length + 1}`,
      answers: [{ text: 'richtig' }, { text: 'falsch' }],
      correctAnswer: this.unit.multipleSelection ? [] : undefined
    });
    this.latestQuestionIndex = this.unit.questions.length - 1;
    this.unitService.updateUnitDef();
    this.unitService.calculateMissingCorrectAnswerIndeces();
  }

  deleteQuestion(index: number) {
    this.unit.questions.splice(index, 1);
    this.unitService.updateUnitDef();
    this.unitService.calculateMissingCorrectAnswerIndeces();
  }

  async onLoadCSVClick(event: Event) {
    const unitString = await FileService.readFileAsText((event.target as HTMLInputElement).files?.[0] as File);
    try {
      this.unitService.loadUnitFromCSV(unitString);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.messageService.showError(error.message);
      }
    }
  }

  async loadQuestionSrc(questionIndex: number, eventTarget: EventTarget | null): Promise<void> {
    this.unit.questions[questionIndex].src =
      await FileService.readFileAsText((eventTarget as HTMLInputElement).files?.[0] as File, true);
    this.unitService.updateUnitDef();
  }

  removeQuestionSrc(i: number) {
    this.unit.questions[i].src = undefined;
    this.unitService.updateUnitDef();
  }

  setQuestionTextForAll(text?: string) {
    this.unit.questions = this.unit.questions.map(question => ({ ...question, text: text }));
    this.unitService.updateUnitDef();
  }

  setAnswersForAll(answers: Answer[]) {
    this.unit.questions = this.unit.questions.map(question => ({ ...question, answers: [...answers] }));
    this.unitService.updateUnitDef();
  }

  updateRatioDeault() {
    if (this.unit.questionType === 'text' && this.unit.answerType === 'text') {
      this.activeRatioDefault = textOnly;
    } else if (this.unit.questionType === 'image' && this.unit.answerType === 'text') {
      this.activeRatioDefault = imageAndText;
    } else if (this.unit.questionType === 'image' && this.unit.answerType === 'image') {
      this.activeRatioDefault = imageAndImage;
    }
  }

  onToggleMultiselect() {
    this.unit.multipleSelection = !this.unit.multipleSelection;
    this.unit.questions.forEach(question => {
      if (this.unit.multipleSelection) {
        question.correctAnswer = question.correctAnswer === undefined ? [] : [(question.correctAnswer as number)];
      } else {
        question.correctAnswer =
          (question.correctAnswer as number[]).length > 1 ? undefined : (question.correctAnswer as number[])[0];
      }
    });
    this.unitService.calculateMissingCorrectAnswerIndeces();
    this.unitService.updateUnitDef();
  }
}
