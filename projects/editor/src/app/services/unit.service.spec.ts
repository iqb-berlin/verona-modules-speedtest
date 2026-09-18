import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { UNIT_DEFINITION_TYPE } from 'common/services/unit-validation';
import { UnitService } from './unit.service';
import { MessageService } from './message.service';
import { VeronaAPIService } from './verona-api.service';

describe('UnitService', () => {
  const csv = `frage; loesung; antwort_1; antwort_2
               Frage 1; 1; richtig; falsch
               Frage 2; 0; ja; nein`;

  let service: UnitService;
  let sendChange: jasmine.Spy;
  let showError: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
    service = TestBed.inject(UnitService);
    sendChange = spyOn(VeronaAPIService, 'sendChange');
    showError = spyOn(TestBed.inject(MessageService), 'showError');
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
      expect(service.unit.multipleSelection).toBeTrue();
    });

    it('keeps the styling settings', () => {
      service.unit.buttonColor = '#ff0000';
      service.unit.buttonWidth = 200;
      service.unit.instructionText = 'Kreuze die richtige Antwort an';
      service.unit.questionSpaceRatio = 65;

      service.loadUnitFromCSV(csv);

      expect(service.unit.buttonColor).toBe('#ff0000');
      expect(service.unit.buttonWidth).toBe(200);
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
});
