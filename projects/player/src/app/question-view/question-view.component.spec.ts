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

  it('shows an image question with its caption', () => {
    const unit: Unit = {
      ...textUnit(false),
      questionType: 'image',
      questions: [{ ...question('Was siehst du?'), src: 'data:image/png;base64,AAAA' }]
    };
    show(unit);
    const image: HTMLImageElement = fixture.nativeElement.querySelector('speedtest-player-image-question img');
    expect(image.getAttribute('src')).toBe('data:image/png;base64,AAAA');
    expect(fixture.nativeElement.querySelector('figcaption').textContent).toContain('Was siehst du?');
  });

  it('selects image answers and marks the selected image', () => {
    const unit: Unit = {
      ...textUnit(true),
      answerType: 'image',
      questions: [{ text: 'Was passt?', answers: [{ text: '', src: 'data:image/png;base64,AAAA' }, { text: '', src: 'data:image/png;base64,BBBB' }] }]
    };
    show(unit);
    const cells = fixture.nativeElement.querySelectorAll('speedtest-player-image-answers button');
    cells[1].click();
    fixture.detectChanges();
    expect(cells[1].querySelector('img').classList).toContain('selected');
    nextButton()!.click();
    expect(responses).toEqual([[1]]);
  });

  it('disables the audio button while the audio plays, and enables it for the next question', () => {
    const unit: Unit = {
      ...textUnit(false),
      questionType: 'audio',
      questions: [
        { ...question('Hör zu.'), src: 'data:audio/wav;base64,AAAA' },
        { ...question('Hör noch mal zu.'), src: 'data:audio/wav;base64,BBBB' }
      ]
    };
    show(unit, 0);
    const audioButton = (): HTMLButtonElement => fixture.nativeElement.querySelector('speedtest-player-audio-button button');
    expect(audioButton().disabled).toBeFalse();
    fixture.nativeElement.querySelector('audio').dispatchEvent(new Event('play'));
    fixture.detectChanges();
    expect(audioButton().disabled).toBeTrue();
    show(unit, 1);
    expect(audioButton().disabled).toBeFalse();
  });

  it('lets only one audio answer play at a time and submits by the label button', () => {
    const unit: Unit = {
      ...textUnit(false),
      answerType: 'audio',
      questions: [{ text: 'Was hörst du?', answers: [{ text: 'bei', src: 'data:audio/wav;base64,AAAA' }, { text: 'ein', src: 'data:audio/wav;base64,BBBB' }] }]
    };
    show(unit);
    const audioButtons = (): HTMLButtonElement[] => [...fixture.nativeElement.querySelectorAll('speedtest-player-audio-button button')];
    fixture.nativeElement.querySelectorAll('audio')[0].dispatchEvent(new Event('play'));
    fixture.detectChanges();
    expect(audioButtons().map(button => button.disabled)).toEqual([true, true]);
    fixture.nativeElement.querySelectorAll('.answer > button')[1].click();
    expect(responses).toEqual([1]);
  });

  it('enters a number by keypad and keyboard, one box per digit of the correct answer', () => {
    const unit: Unit = {
      ...textUnit(false),
      answerType: 'number',
      questions: [{ text: '12 + 30', answers: [], correctAnswer: 42 }]
    };
    show(unit);
    const boxes = (): string[] => [...fixture.nativeElement.querySelectorAll('speedtest-player-number-boxes button')]
      .map((box: HTMLElement) => box.textContent!.trim());
    const key = (label: string): HTMLButtonElement => [...fixture.nativeElement.querySelectorAll('speedtest-player-keypad button')]
      .find((button: HTMLElement) => button.textContent!.trim() === label);
    expect(boxes()).toEqual(['', '']);
    key('4').click();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '2' }));
    fixture.detectChanges();
    expect(boxes()).toEqual(['4', '2']);
    nextButton()!.click();
    expect(responses).toEqual([42]);
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
