import type { Mock } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MATERIAL_ANIMATIONS } from '@angular/material/core';
import { UNIT_DEFINITION_TYPE } from 'common/services/unit-validation';
import { UnitService } from './unit.service';
import { MessageService } from './message.service';
import { VeronaAPIService } from './verona-api.service';

describe('UnitService', () => {
  const csv = `frage; loesung; antwort_1; antwort_2
               Frage 1; 1; richtig; falsch
               Frage 2; 0; ja; nein`;

  let service: UnitService;
  let sendChange: Mock;
  let showError: Mock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: MATERIAL_ANIMATIONS, useValue: { animationsDisabled: true } }]
    });
    service = TestBed.inject(UnitService);
    sendChange = vi.spyOn(VeronaAPIService, 'sendChange').mockReturnValue(undefined);
    showError = vi.spyOn(TestBed.inject(MessageService), 'showError').mockReturnValue(undefined);
  });

  describe('loadUnitFromCSV', () => {
    it('replaces the questions with the imported ones', () => {
      service.loadUnitFromCSV(csv);

      expect(service.unit.questions.length).toBe(2);
      expect(service.unit.questions[0].text).toBe('Frage 1');
      expect(service.unit.questions[1].text).toBe('Frage 2');
    });

    it('keeps the question and answer type settings', () => {
      service.unit.layout = 'row';
      service.unit.questionType = 'image';
      service.unit.multipleSelection = true;

      service.loadUnitFromCSV(csv);

      expect(service.unit.layout).toBe('row');
      expect(service.unit.questionType).toBe('image');
      expect(service.unit.multipleSelection).toBe(true);
    });

    it('keeps the styling settings', () => {
      service.unit.buttonColor = '#ff0000';
      service.unit.instructionText = 'Kreuze die richtige Antwort an';
      service.unit.questionSpaceRatio = 65;

      service.loadUnitFromCSV(csv);

      expect(service.unit.buttonColor).toBe('#ff0000');
      expect(service.unit.instructionText).toBe('Kreuze die richtige Antwort an');
      expect(service.unit.questionSpaceRatio).toBe(65);
    });

    it('sends the new definition to the host', () => {
      service.loadUnitFromCSV(csv);

      expect(sendChange).toHaveBeenCalled();
    });
  });

  describe('loadUnitDefinition', () => {
    function definition(overrides: Record<string, unknown> = {}): string {
      return JSON.stringify({
        type: UNIT_DEFINITION_TYPE,
        version: service.unitDefVersion,
        layout: 'column',
        questionType: 'text',
        answerType: 'text',
        questions: [{ text: 'Geladene Frage', answers: [{ text: 'richtig' }] }],
        ...overrides
      });
    }

    /* Which definitions are rejected, and why, is covered in unit-validation.spec.ts.
       These only pin down what the editor does with the outcome. */

    it('loads a valid unit', () => {
      service.loadUnitDefinition(definition());

      expect(service.unit.questions[0].text).toBe('Geladene Frage');
      expect(showError).not.toHaveBeenCalled();
    });

    it('keeps the current unit and reports the reason when a definition is rejected', () => {
      expect(() => service.loadUnitDefinition('{ not json')).not.toThrow();

      expect(service.unit.questions.length).toBe(0);
      expect(showError).toHaveBeenCalledWith('Die Unit-Definition konnte nicht gelesen werden.');
    });
  });

  describe('hasFormula', () => {
    it('is true for a text with a formula in a LaTeX unit', () => {
      service.unit.latex = true;

      expect(service.hasFormula('Berechne $x^2$')).toBe(true);
    });

    it('is false without the LaTeX setting or without a formula', () => {
      expect(service.hasFormula('Berechne $x^2$')).toBe(false);
      service.unit.latex = true;
      expect(service.hasFormula('kostet 5 \\$')).toBe(false);
      expect(service.hasFormula(undefined)).toBe(false);
    });

    it('is false for question types that split their text into words', () => {
      service.unit.latex = true;
      service.unit.questionType = 'word-select';

      expect(service.usesLatex()).toBe(false);
      expect(service.hasFormula('Berechne $x^2$')).toBe(false);
    });
  });
});
