import { Component, Input, OnInit } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import {
  MatAccordion, MatExpansionPanel,
  MatExpansionPanelDescription, MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from '@angular/material/expansion';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatFabButton, MatIconButton, MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { Unit } from '../../../../common/interfaces/unit';
import { FileService } from '../../../../common/services/file.service';
import { UnitService } from '../services/unit.service';
import { MatButtonToggle, MatButtonToggleChange, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'speedtest-unit-view',
  standalone: true,
  imports: [
    NgForOf,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatExpansionPanelHeader,
    MatExpansionPanelDescription,
    MatFormField,
    MatInput,
    MatButton,
    MatIcon,
    MatLabel,
    MatTooltip,
    MatFabButton,
    MatMiniFabButton,
    FormsModule,
    NgIf,
    MatIconButton,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatCheckbox
  ],
  template: `
    <button mat-raised-button class="csv-import-button" (click)="upload.click()">
      CSV Import
      <mat-icon>file_upload</mat-icon>
    </button>
    <input type="file" hidden accept=".csv" #upload
           (change)="loadCSV($event)">
    
    <fieldset>
      <legend>Standardwerte</legend>
      Ausrichtung
      <mat-button-toggle-group [value]="defaultLayout" (change)="setDefaultLayout($event)">
        <mat-button-toggle value="column">Vertikal</mat-button-toggle>
        <mat-button-toggle value="row">Horizontal</mat-button-toggle>
      </mat-button-toggle-group>
      <mat-checkbox [checked]="unit.globalLayout !== undefined" (change)="setGlobalLayout($event)">Für alle Fragen setzen</mat-checkbox>
    </fieldset>

    <mat-accordion multi="true">
      <mat-expansion-panel *ngFor="let question of unit.questions; let i = index" [expanded]="i == latestQuestionIndex">
        <mat-expansion-panel-header>
          <mat-panel-title>
            <h2>{{i+1}}: {{ question.text }}</h2>
            <img *ngIf="question.imgSrc" [src]="question.imgSrc">
          </mat-panel-title>
        </mat-expansion-panel-header>

        <div class="expansion-panel-content">
          <div class="question">
            <h4>Text</h4>
            <div class="question-content">
              <mat-form-field>
                <mat-label>Frage</mat-label>
                <input matInput [(ngModel)]="question.text" (change)="unitService.updateUnitDef()">
              </mat-form-field>
              <button mat-fab class="question-delete-button" color="warn" [matTooltip]="'Frage löschen'"
                      (click)="deleteQuestion(i)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
            <h4>Bild</h4>
            <div class="image-panel">
              <div class="image-panel-buttons">
                <button mat-icon-button [matTooltip]="'Bild hinzufügen'" (click)="imageUpload.click();">
                  <mat-icon>image</mat-icon>
                </button>
                <input type="file" hidden accept="image/*"
                       #imageUpload id="button-image-upload"
                       (change)="loadImage(i, $event)">
                <button *ngIf="question.imgSrc" mat-icon-button [matTooltip]="'Bild entfernen'"
                        (click)="removeImage(i);">
                  <mat-icon>backspace</mat-icon>
                </button>
              </div>
              <img *ngIf="question.imgSrc" [src]="question.imgSrc">
            </div>
            <ng-container *ngIf="!unit.globalLayout">
              <h4>Ausrichtung</h4>
              <mat-button-toggle-group [(ngModel)]="question.layout" (change)="unitService.updateUnitDef()">
                <mat-button-toggle value="column">Vertikal</mat-button-toggle>
                <mat-button-toggle value="row">Horizontal</mat-button-toggle>
              </mat-button-toggle-group>
            </ng-container>
          </div>

          <h3>Antworten</h3>
          <div *ngFor="let answer of question.anwers; let j = index" class="inner answer">
            <mat-form-field>
              <mat-label>Antwort {{ j + 1 }}</mat-label>
              <input matInput [(ngModel)]="answer.text" (change)="unitService.updateUnitDef()">
            </mat-form-field>
            <button mat-icon-button color="warn" [matTooltip]="'Antwort löschen'" (click)="deleteAnswer(i, j)">
              <mat-icon>delete</mat-icon>
            </button>
          </div>

          <button mat-raised-button (click)="addAnswer(i)" [matTooltip]="'Antwort hinzu'" class="add-button">
            Neue Antwort
            <mat-icon>add</mat-icon>
          </button>
        </div>
      </mat-expansion-panel>
    </mat-accordion>

    <button mat-raised-button (click)="addQuestion()" [matTooltip]="'Frage hinzu'" class="add-button">
      Neue Frage
      <mat-icon>add</mat-icon>
    </button>

  `,
  styleUrls: ['./unit-view.component.css']
})
export class UnitViewComponent implements OnInit {
  @Input() unit!: Unit;
  latestQuestionIndex: number | undefined;
  defaultLayout!: 'column' | 'row';

  constructor(public unitService: UnitService) { }

  ngOnInit(): void {
    this.defaultLayout = this.unit.globalLayout ? this.unit.globalLayout : 'column';
  }

  addQuestion() {
    this.unit.questions.push({
      text: `Frage ${this.unit.questions.length + 1}`,
      layout: this.defaultLayout,
      anwers: [
        { text: 'richtig' },
        { text: 'falsch' }
      ] })
    this.latestQuestionIndex = this.unit.questions.length - 1;
    this.unitService.updateUnitDef();
  }

  deleteQuestion(index: number) {
    this.unit.questions.splice(index, 1);
    this.unitService.updateUnitDef();
  }

  addAnswer(questionIndex: number) {
    let answerText: string = 'Antwort-Text'
    switch (this.unit.questions[questionIndex].anwers.length) {
      case 0: answerText = 'richtig'; break;
      case 1: answerText = 'falsch'; break;
      default: answerText = `Antworttext ${this.unit.questions[questionIndex].anwers.length + 1}`; break;
    }
    this.unit.questions[questionIndex].anwers.push({ text: answerText });
    this.unitService.updateUnitDef();
  }

  deleteAnswer(questionIndex: number, answerIndex: number) {
    this.unit.questions[questionIndex].anwers.splice(answerIndex, 1);
    this.unitService.updateUnitDef();
  }

  async loadCSV(event: Event) {
    const loadedUnit = await FileService.readFileAsText((event.target as HTMLInputElement).files?.[0] as File);
    this.unitService.loadCsv(loadedUnit);
    this.unitService.updateUnitDef();
  }

  async loadImage(questionIndex: number, event: any): Promise<void> {
    const imgSrc = await FileService.readFileAsText((event.target as HTMLInputElement).files?.[0] as File, true);
    this.unit.questions[questionIndex].imgSrc = imgSrc;
    this.unitService.updateUnitDef();
  }

  removeImage(i: number) {
    this.unit.questions[i].imgSrc = undefined;
    this.unitService.updateUnitDef();
  }

  setDefaultLayout(event: MatButtonToggleChange) {
    this.defaultLayout = event.value;
    if (this.unit.globalLayout) this.unit.globalLayout = event.value;
    this.unitService.updateUnitDef();
  }

  setGlobalLayout(event: MatCheckboxChange) {
    this.unit.globalLayout = event.checked ? this.defaultLayout : undefined;
    this.unitService.updateUnitDef();
  }
}
