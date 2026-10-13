import type { Mock } from 'vitest';
import {
  ComponentFixture, TestBed
} from '@angular/core/testing';
import { Subject } from 'rxjs';
import { Unit } from 'common/interfaces/unit';
import { defaultOutroText } from 'common/constants';
import { UNIT_PARSE_ERROR_MESSAGES } from 'common/services/unit-validation';
import { AppComponent } from './app.component';
import { Response, StartCommand, VeronaAPIService } from './verona-api.service';

/* A unit of text questions, each offering the answers "richtig" (index 0) and "falsch" (index 1).
   One entry of correctAnswerPerQuestion per question; undefined leaves a question without a solution. */
function textUnit(correctAnswerPerQuestion: (number | number[] | undefined)[]): Unit {
  return {
    type: 'speedtest-unit-defintion',
    version: '2.1.0',
    layout: 'column',
    questionType: 'text',
    answerType: 'text',
    questions: correctAnswerPerQuestion.map((correctAnswer, index) => ({
      text: `Frage ${index + 1}`,
      answers: [{ text: 'richtig' }, { text: 'falsch' }],
      correctAnswer: correctAnswer
    }))
  };
}

function unitWithoutSolutions(questionCount: number): Unit {
  return textUnit(new Array<undefined>(questionCount).fill(undefined));
}

/* Builds the dataParts of a unit state as the player itself would have written them.
   lastAnsweredIndex is an index, not a count: 2 means the questions 0, 1 and 2 were answered,
   so totalCorrect and totalWrong have to add up to 3. */
function dataPartsFor(lastAnsweredIndex: number, totalCorrect: number, totalWrong: number): Record<string, string> {
  return {
    activeQuestionIndex: JSON.stringify([
      { id: 'activeQuestionIndex', status: 'VALUE_CHANGED', value: lastAnsweredIndex }
    ]),
    sums: JSON.stringify([
      { id: 'total_correct', status: 'VALUE_CHANGED', value: totalCorrect },
      { id: 'total_wrong', status: 'VALUE_CHANGED', value: totalWrong }
    ])
  };
}

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let sendState: Mock;
  let sendNavRequest: Mock;

  /* Returns the responseData of the most recent sendState call. */
  function lastState(): Record<string, Response[]> {
    return sendState.mock.lastCall![0] as Record<string, Response[]>;
  }

  beforeEach(async () => {
    // The subject is static and the component never unsubscribes, so give every spec a fresh one.
    VeronaAPIService.startCommand = new Subject<StartCommand>();
    sendState = vi.spyOn(VeronaAPIService, 'sendState').mockReturnValue(undefined);
    sendNavRequest = vi.spyOn(VeronaAPIService, 'sendNavRequest').mockReturnValue(undefined);
    vi.spyOn(VeronaAPIService, 'sendReady').mockReturnValue(undefined);

    await TestBed.configureTestingModule({ imports: [AppComponent] }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('response data', () => {
    // The units have a question to spare so that onResponse advances normally
    // instead of taking the end-of-unit branch, which is covered separately below.
    it('marks a correct answer with code and score 1', () => {
      component.unit = textUnit([0, 1]);

      component.onResponse(0);

      expect(lastState()['question_0'][0]).toEqual(expect.objectContaining({
        id: 'value', value: 0, code: 1, score: 1, subform: '0'
      }));
    });

    it('marks a wrong answer with code and score 0', () => {
      component.unit = textUnit([0, 1]);

      component.onResponse(1);

      expect(lastState()['question_0'][0]).toEqual(expect.objectContaining({ value: 1, code: 0, score: 0 }));
    });

    it('leaves code and score undefined when the question has no correct answer', () => {
      component.unit = textUnit([undefined, undefined]);

      component.onResponse(0);

      expect(lastState()['question_0'][0].code).toBeUndefined();
      expect(lastState()['question_0'][0].score).toBeUndefined();
    });

    it('reports the time spent on the question', () => {
      component.unit = textUnit([0, 0]);

      component.onResponse(0);

      const time = lastState()['question_0'][1];
      expect(time.id).toBe('time');
      expect(time.value).toBeGreaterThanOrEqual(0);
      expect(time.subform).toBe('0');
    });

    it('compares a multiple-selection answer as a whole', () => {
      component.unit = textUnit([[0, 1]]);

      component.onResponse([0, 1]);

      expect(lastState()['question_0'][0].code).toBe(1);
    });

    it('counts correct and wrong answers across questions', () => {
      component.unit = textUnit([0, 0, 0]);

      component.onResponse(0); // correct
      component.onResponse(1); // wrong
      component.onResponse(0); // correct

      expect(lastState()['sums']).toEqual([
        expect.objectContaining({ id: 'total_correct', value: 2 }),
        expect.objectContaining({ id: 'total_wrong', value: 1 })
      ]);
    });

    it('requests navigation once the last question is answered', () => {
      component.unit = textUnit([0]);

      component.onResponse(0);

      expect(component.showOutroPage).toBe(true);
      expect(sendNavRequest).toHaveBeenCalled();
    });
  });

  describe('outro page', () => {
    function outroAfterLastAnswer(unit: Unit): string {
      component.unit = unit;
      component.onResponse(0);
      fixture.detectChanges();
      return (fixture.nativeElement as HTMLElement).querySelector('.outro')!.textContent.trim();
    }

    it('shows the text of the unit', () => {
      expect(outroAfterLastAnswer({ ...textUnit([0]), outroText: 'Geschafft!' })).toBe('Geschafft!');
    });

    it('shows the default text when the unit sets none or an empty one', () => {
      expect(outroAfterLastAnswer(textUnit([0]))).toBe(defaultOutroText);
      expect(outroAfterLastAnswer({ ...textUnit([0]), outroText: '' })).toBe(defaultOutroText);
    });
  });

  describe('resuming a unit', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    function start(unit: Unit, dataParts?: Record<string, string>): void {
      VeronaAPIService.startCommand.next({
        type: 'vopStartCommand',
        sessionId: 'session-1',
        unitDefinition: JSON.stringify(unit),
        ...(dataParts ? { unitState: { dataParts } } : {})
      });
      vi.runOnlyPendingTimers();
    }

    it('starts at the first question when there is no previous state', () => {
      start(unitWithoutSolutions(4));

      expect(component.activeQuestionIndex).toBe(0);
      expect(component.showOutroPage).toBe(false);
    });

    it('continues after the last answered question', () => {
      start(unitWithoutSolutions(6), dataPartsFor(2, 2, 1));

      expect(component.activeQuestionIndex).toBe(3);
    });

    it('restores the running totals', () => {
      start(unitWithoutSolutions(6), dataPartsFor(2, 2, 1));

      expect(component.sumCorrect).toBe(2);
      expect(component.sumWrong).toBe(1);
    });

    it('shows the outro page when every question was already answered', () => {
      start(unitWithoutSolutions(3), dataPartsFor(2, 2, 1));

      expect(component.showOutroPage).toBe(true);
    });
  });

  /* Which definitions are rejected, and why, is covered in unit-validation.spec.ts.
     These only pin down what the player does with the outcome. */
  describe('a unit that cannot be read', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      // The player logs the reason; keep it out of the test output.
      vi.spyOn(console, 'error').mockReturnValue(undefined);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    function startWith(unitDefinition: string): void {
      VeronaAPIService.startCommand.next({
        type: 'vopStartCommand', sessionId: 'session-1', unitDefinition
      });
      vi.runOnlyPendingTimers();
    }

    it('shows the error instead of the unit', () => {
      startWith('{ not json');

      expect(component.loadErrorMessage).toBe(UNIT_PARSE_ERROR_MESSAGES['invalid-json']);
      expect(component.unit).toBeUndefined();
    });

    it('names the actual reason', () => {
      startWith(JSON.stringify({ ...unitWithoutSolutions(1), version: '1.1.0' }));

      expect(component.loadErrorMessage).toBe(UNIT_PARSE_ERROR_MESSAGES['incompatible-version']);
    });

    it('logs the reason', () => {
      startWith('{ not json');

      expect(console.error).toHaveBeenCalledWith(expect.stringContaining(UNIT_PARSE_ERROR_MESSAGES['invalid-json']));
    });

    it('still answers the host so it does not keep waiting', () => {
      startWith('{ not json');

      expect(sendState).toHaveBeenCalled();
    });

    it('clears the error when a valid unit follows', () => {
      startWith('{ not json');

      startWith(JSON.stringify(unitWithoutSolutions(2)));

      expect(component.loadErrorMessage).toBeUndefined();
      expect(component.unit).toBeDefined();
    });
  });
});
