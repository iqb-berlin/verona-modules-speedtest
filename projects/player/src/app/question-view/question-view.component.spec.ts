import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Question, Unit } from 'common/interfaces/unit';
import { QuestionViewComponent } from './question-view.component';

function question(text: string): Question {
  return { text, answers: [{ text: 'a' }, { text: 'b' }, { text: 'c' }] };
}

function textUnit(multipleSelection: boolean): Unit {
  return {
    type: 'speedtest-unit-definition',
    version: '2.2.0',
    layout: 'column',
    questionType: 'text',
    answerType: 'text',
    multipleSelection,
    questions: [question('Frage 1'), question('Frage 2')]
  };
}

describe('QuestionViewComponent', () => {
  let fixture: ComponentFixture<QuestionViewComponent>;
  let responses: (number | number[])[];

  function show(unit: Unit, questionIndex = 0): void {
    fixture.componentRef.setInput('unit', unit);
    fixture.componentRef.setInput('question', unit.questions[questionIndex]);
    fixture.detectChanges();
  }

  function answerButton(index: number): HTMLButtonElement {
    return fixture.nativeElement.querySelectorAll('speedtest-player-text-answers button')[index];
  }

  function nextButton(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector('speedtest-player-next-button button');
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionViewComponent);
    responses = [];
    fixture.componentInstance.responseGiven.subscribe(answer => responses.push(answer));
  });

  it('submits a single-choice answer on the first click, without a next button', () => {
    show(textUnit(false));
    expect(nextButton()).toBeNull();
    answerButton(1).click();
    expect(responses).toEqual([1]);
  });

  it('collects a multiple selection in index order and submits it on next', () => {
    show(textUnit(true));
    answerButton(2).click();
    answerButton(0).click();
    answerButton(1).click();
    answerButton(1).click();
    expect(responses).toEqual([]);
    nextButton()!.click();
    expect(responses).toEqual([[0, 2]]);
  });

  it('marks selected answers', () => {
    show(textUnit(true));
    answerButton(1).click();
    fixture.detectChanges();
    expect(answerButton(1).classList).toContain('selected');
    expect(answerButton(0).classList).not.toContain('selected');
  });

  it('starts every question with an empty selection', () => {
    const unit = textUnit(true);
    show(unit, 0);
    answerButton(0).click();
    show(unit, 1);
    expect(answerButton(0).classList).not.toContain('selected');
    nextButton()!.click();
    expect(responses).toEqual([[]]);
  });
});
