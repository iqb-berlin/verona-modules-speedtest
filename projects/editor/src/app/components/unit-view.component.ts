import { Component, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  MatButton, MatIconButton
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
import { defaultOutroText, defaultQuestionSpaceRatio } from 'common/constants';
import { LatexPipe } from 'common/latex.pipe';
import { MessageService } from 'editor/src/app/services/message.service';
import { UnitService } from '../services/unit.service';
import { AnswerPanelComponent } from './answer-panel.component';

@Component({
  selector: 'speedtest-unit-view',
  imports: [
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
    FormsModule,
    MatIconButton,
    MatOption,
    MatSelect,
    AnswerPanelComponent,
    MatCheckbox,
    MatRadioGroup,
    MatRadioButton,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    LatexPipe
  ],
  templateUrl: 'unit-view.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./unit-view.component.css']
})
export class UnitViewComponent implements OnChanges {
  @Input() unit!: Unit;
  latestItemIndex: number | undefined;
  activeRatioDefault = 0;
  // Shown as placeholder; the player uses it while the unit sets no outro text of its own.
  readonly defaultOutroText = defaultOutroText;

  constructor(public unitService: UnitService, private messageService: MessageService) { }

  ngOnChanges(): void {
    this.updateRatioDefault();
  }

  addItem() {
    this.unit.questions.push({
      text: `Frage ${this.unit.questions.length + 1}`,
      answers: [{ text: 'richtig' }, { text: 'falsch' }],
      correctAnswer: this.unit.multipleSelection ? [] : undefined
    });
    this.latestItemIndex = this.unit.questions.length - 1;
    this.unitService.updateUnitDef();
    this.unitService.calculateMissingCorrectAnswerPositions();
  }

  deleteItem(index: number) {
    this.unit.questions.splice(index, 1);
    this.unitService.updateUnitDef();
    this.unitService.calculateMissingCorrectAnswerPositions();
  }

  moveItem(itemIndex: number, direction: 'up' | 'down'): void {
    const item = this.unit.questions.splice(itemIndex, 1)[0];
    const newIndex = direction === 'up' ? -1 : 1;
    this.unit.questions.splice(itemIndex + newIndex, 0, item);
    this.unitService.updateUnitDef();
    this.unitService.calculateMissingCorrectAnswerPositions();
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

  async loadQuestionSrc(itemIndex: number, eventTarget: EventTarget | null): Promise<void> {
    this.unit.questions[itemIndex].src =
      await FileService.readFileAsText((eventTarget as HTMLInputElement).files?.[0] as File, true);
    this.unitService.updateUnitDef();
  }

  removeQuestionSrc(i: number) {
    this.unit.questions[i].src = undefined;
    this.unitService.updateUnitDef();
  }

  setQuestionTextForAll(text?: string) {
    this.unit.questions = this.unit.questions.map(item => ({ ...item, text: text }));
    this.unitService.updateUnitDef();
  }

  setAnswersForAll(answers: Answer[]) {
    this.unit.questions = this.unit.questions.map(item => ({ ...item, answers: [...answers] }));
    this.unitService.updateUnitDef();
  }

  // The player's default, shown as placeholder while the unit sets no ratio of its own.
  updateRatioDefault() {
    this.activeRatioDefault =
      defaultQuestionSpaceRatio(this.unit.layout, this.unit.questionType, this.unit.answerType);
  }

  // Units without formulas leave the property out rather than storing false.
  onToggleLatex(enabled: boolean) {
    if (enabled) this.unit.latex = true;
    else delete this.unit.latex;
    this.unitService.updateUnitDef();
  }

  // Like latex: units without the lock leave the property out rather than storing false.
  onToggleAudioRequired(enabled: boolean) {
    if (enabled) this.unit.audioRequired = true;
    else delete this.unit.audioRequired;
    this.unitService.updateUnitDef();
  }

  onToggleMultiselect() {
    this.unit.multipleSelection = !this.unit.multipleSelection;
    this.unit.questions.forEach((item) => {
      const { correctAnswer } = item;
      if (this.unit.multipleSelection) {
        item.correctAnswer = typeof correctAnswer === 'number' ? [correctAnswer] : [];
      } else {
        item.correctAnswer = Array.isArray(correctAnswer) && correctAnswer.length === 1 ?
          correctAnswer[0] :
          undefined;
      }
    });
    this.unitService.calculateMissingCorrectAnswerPositions();
    this.unitService.updateUnitDef();
  }
}
