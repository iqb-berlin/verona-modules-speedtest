import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Question } from 'common/interfaces/unit';
import { MessageService } from '../services/message.service';
import { UnitService } from '../services/unit.service';
import { VeronaAPIService } from '../services/verona-api.service';
import { UnitViewComponent } from './unit-view.component';

describe('UnitViewComponent', () => {
  let component: UnitViewComponent;
  let unitService: UnitService;
  let sendChange: jasmine.Spy;

  function question(text: string): Question {
    return { text: text, answers: [{ text: 'richtig' }, { text: 'falsch' }], correctAnswer: 0 };
  }

  function questionOrder(): (string | undefined)[] {
    return component.unit.questions.map(singleQuestion => singleQuestion.text);
  }

  function setAllSolutions(correctAnswer: number | number[] | undefined): void {
    component.unit.questions = component.unit.questions
      .map(singleQuestion => ({ ...singleQuestion, correctAnswer: correctAnswer }));
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideNoopAnimations()] });
    unitService = TestBed.inject(UnitService);
    // These tests only exercise logic, so the component is built without compiling its template.
    component = new UnitViewComponent(unitService, TestBed.inject(MessageService));
    component.unit = unitService.unit;
    component.unit.questions = [question('A'), question('B'), question('C')];
    sendChange = spyOn(VeronaAPIService, 'sendChange');
  });

  describe('moveQuestion', () => {
    it('moves a question towards the front', () => {
      component.moveQuestion(1, 'up');

      expect(questionOrder()).toEqual(['B', 'A', 'C']);
    });

    it('moves a question towards the back', () => {
      component.moveQuestion(1, 'down');

      expect(questionOrder()).toEqual(['A', 'C', 'B']);
    });

    it('sends the new order to the host', () => {
      component.moveQuestion(1, 'up');

      expect(sendChange).toHaveBeenCalled();
    });

    it('updates the reported positions of questions without a solution', () => {
      component.unit.questions[0].correctAnswer = undefined;
      unitService.calculateMissingCorrectAnswerIndeces();
      expect(unitService.missingCorrectAnswerIndices).toEqual([1]);

      component.moveQuestion(0, 'down');

      expect(unitService.missingCorrectAnswerIndices).toEqual([2]);
    });
  });

  describe('onToggleMultiselect', () => {
    it('wraps a single solution in a list when switching on', () => {
      setAllSolutions(1);

      component.onToggleMultiselect();

      expect(component.unit.multipleSelection).toBeTrue();
      expect(component.unit.questions[0].correctAnswer).toEqual([1]);
    });

    it('unwraps a one element list when switching off', () => {
      component.unit.multipleSelection = true;
      setAllSolutions([1]);

      component.onToggleMultiselect();

      expect(component.unit.multipleSelection).toBeFalse();
      expect(component.unit.questions[0].correctAnswer).toBe(1);
    });

    it('drops a solution that cannot be expressed as a single answer', () => {
      component.unit.multipleSelection = true;
      setAllSolutions([0, 1]);

      component.onToggleMultiselect();

      expect(component.unit.questions[0].correctAnswer).toBeUndefined();
    });

    it('keeps questions without a solution when switching off', () => {
      component.unit.multipleSelection = true;
      setAllSolutions(undefined);

      component.onToggleMultiselect();

      expect(component.unit.questions[0].correctAnswer).toBeUndefined();
    });
  });
});
