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
import { FormsModule } from '@angular/forms';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { Unit } from 'common/interfaces/unit';
import { FileService } from 'common/services/file.service';
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
    MatButtonToggleGroup,
    MatButtonToggle,
    SlicePipe,
    MatOption,
    MatSelect,
    AnswerPanelComponent
  ],
  templateUrl: 'unit-view.component.html',
  styleUrls: ['./unit-view.component.css']
})
export class UnitViewComponent {
  @Input() unit!: Unit;
  latestQuestionIndex: number | undefined;

  constructor(public unitService: UnitService) { }

  addQuestion() {
    this.unit.questions.push({
      text: `Frage ${this.unit.questions.length + 1}`,
      answers: ['richtig', 'falsch']
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

  async loadCSV(event: Event) {
    // const loadedUnit = await FileService.readFileAsText((event.target as HTMLInputElement).files?.[0] as File);
    // this.unitService.loadCsv(loadedUnit);
    // this.unitService.updateUnitDef();
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

  setAnswersForAll(answers: string[]) {
    this.unit.questions = this.unit.questions.map(question => ({ ...question, answers: [...answers] }));
    this.unitService.updateUnitDef();
  }
}
