import {
  ComponentFixture, TestBed, fakeAsync, tick
} from '@angular/core/testing';
import { Subject } from 'rxjs';
import { Unit } from 'common/interfaces/unit';
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
  return textUnit(new Array(questionCount).fill(undefined));
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
  let sendState: jasmine.Spy;
  let sendNavRequest: jasmine.Spy;

  /* Returns the responseData of the most recent sendState call. */
  function lastState(): Record<string, Response[]> {
    return sendState.calls.mostRecent().args[0] as Record<string, Response[]>;
  }

  beforeEach(async () => {
    // The subject is static and the component never unsubscribes, so give every spec a fresh one.
    VeronaAPIService.startCommand = new Subject<StartCommand>();
    sendState = spyOn(VeronaAPIService, 'sendState');
    sendNavRequest = spyOn(VeronaAPIService, 'sendNavRequest');
    spyOn(VeronaAPIService, 'sendReady');

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

      expect(lastState()['question_0'][0]).toEqual(jasmine.objectContaining({
        id: 'value', value: 0, code: 1, score: 1, subform: '0'
      }));
    });

    it('marks a wrong answer with code and score 0', () => {
      component.unit = textUnit([0, 1]);

      component.onResponse(1);

      expect(lastState()['question_0'][0]).toEqual(jasmine.objectContaining({ value: 1, code: 0, score: 0 }));
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
        jasmine.objectContaining({ id: 'total_correct', value: 2 }),
        jasmine.objectContaining({ id: 'total_wrong', value: 1 })
      ]);
    });

    it('requests navigation once the last question is answered', () => {
      component.unit = textUnit([0]);

      component.onResponse(0);

      expect(component.showOutroPage).toBeTrue();
      expect(sendNavRequest).toHaveBeenCalled();
    });
  });

  describe('resuming a unit', () => {
    function start(unit: Unit, dataParts?: Record<string, string>): void {
      VeronaAPIService.startCommand.next({
        type: 'vopStartCommand',
        sessionId: 'session-1',
        unitDefinition: JSON.stringify(unit),
        ...(dataParts ? { unitState: { dataParts } } : {})
      } as StartCommand);
      tick();
    }

    it('starts at the first question when there is no previous state', fakeAsync(() => {
      start(unitWithoutSolutions(4));

      expect(component.activeQuestionIndex).toBe(0);
      expect(component.showOutroPage).toBeFalse();
    }));

    it('continues after the last answered question', fakeAsync(() => {
      start(unitWithoutSolutions(6), dataPartsFor(2, 2, 1));

      expect(component.activeQuestionIndex).toBe(3);
    }));

    it('restores the running totals', fakeAsync(() => {
      start(unitWithoutSolutions(6), dataPartsFor(2, 2, 1));

      expect(component.sumCorrect).toBe(2);
      expect(component.sumWrong).toBe(1);
    }));

    it('shows the outro page when every question was already answered', fakeAsync(() => {
      start(unitWithoutSolutions(3), dataPartsFor(2, 2, 1));

      expect(component.showOutroPage).toBeTrue();
    }));
  });
});
