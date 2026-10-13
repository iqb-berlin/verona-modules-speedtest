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

  function find<T extends HTMLElement = HTMLElement>(selector: string): T | null {
    return (fixture.nativeElement as HTMLElement).querySelector<T>(selector);
  }

  function findAll<T extends HTMLElement = HTMLElement>(selector: string): T[] {
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<T>(selector));
  }

  function answerButton(index: number): HTMLButtonElement {
    return findAll<HTMLButtonElement>('speedtest-player-text-answers button')[index];
  }

  function nextButton(): HTMLButtonElement | null {
    return find<HTMLButtonElement>('speedtest-player-next-button button');
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
    expect(find('speedtest-player-image-question img')!.getAttribute('src')).toBe('data:image/png;base64,AAAA');
    expect(find('figcaption')!.textContent).toContain('Was siehst du?');
  });

  it('renders formulas in the question text of a LaTeX unit', () => {
    const unit: Unit = { ...textUnit(false), latex: true, questions: [question('Berechne $\\frac{1}{2}$.')] };
    show(unit);
    expect(find('speedtest-player-text-question .katex')).not.toBeNull();
    expect(find('speedtest-player-text-question p')!.textContent).toContain('Berechne');
  });

  it('renders formulas in image captions and audio question texts of a LaTeX unit', () => {
    const imageUnit: Unit = {
      ...textUnit(false),
      latex: true,
      questionType: 'image',
      questions: [{ ...question('$x^2$'), src: 'data:image/png;base64,AAAA' }]
    };
    show(imageUnit);
    expect(find('figcaption .katex')).not.toBeNull();
    const audioUnit: Unit = { ...imageUnit, questionType: 'audio' };
    show(audioUnit);
    expect(find('speedtest-player-audio-question p .katex')).not.toBeNull();
  });

  it('shows $ signs and markup in the question text as they are without the LaTeX flag', () => {
    show({ ...textUnit(false), questions: [question('Kostet $5 <b>oder</b> $x$?')] });
    expect(find('speedtest-player-text-question .katex')).toBeNull();
    expect(find('speedtest-player-text-question b')).toBeNull();
    expect(find('speedtest-player-text-question p')!.textContent).toBe('Kostet $5 <b>oder</b> $x$?');
  });

  it('renders formulas in text and audio answer labels of a LaTeX unit', () => {
    const answers = [
      { text: '$\\frac{3}{4}$', src: 'data:audio/wav;base64,AAAA' },
      { text: '0,75', src: 'data:audio/wav;base64,BBBB' }
    ];
    const unit: Unit = { ...textUnit(false), latex: true, questions: [{ text: 'Was ist gleich?', answers }] };
    show(unit);
    expect(answerButton(0).querySelector('.katex')).not.toBeNull();
    expect(answerButton(1).textContent.trim()).toBe('0,75');
    show({ ...unit, answerType: 'audio' });
    expect(find('.answer > button .katex')).not.toBeNull();
  });

  it('selects image answers and marks the selected image', () => {
    const unit: Unit = {
      ...textUnit(true),
      answerType: 'image',
      questions: [{
        text: 'Was passt?',
        answers: [{ text: '', src: 'data:image/png;base64,AAAA' }, { text: '', src: 'data:image/png;base64,BBBB' }]
      }]
    };
    show(unit);
    const cells = findAll('speedtest-player-image-answers button');
    cells[1].click();
    fixture.detectChanges();
    expect(cells[1].querySelector('img')!.classList).toContain('selected');
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
    const audioButton = (): HTMLButtonElement => find<HTMLButtonElement>('speedtest-player-audio-button button')!;
    expect(audioButton().disabled).toBe(false);
    find('audio')!.dispatchEvent(new Event('play'));
    fixture.detectChanges();
    expect(audioButton().disabled).toBe(true);
    show(unit, 1);
    expect(audioButton().disabled).toBe(false);
  });

  it('lets only one audio answer play at a time and submits by the label button', () => {
    const unit: Unit = {
      ...textUnit(false),
      answerType: 'audio',
      questions: [{
        text: 'Was hörst du?',
        answers: [
          { text: 'bei', src: 'data:audio/wav;base64,AAAA' },
          { text: 'ein', src: 'data:audio/wav;base64,BBBB' }
        ]
      }]
    };
    show(unit);
    const audioButtons = (): HTMLButtonElement[] => findAll<HTMLButtonElement>('speedtest-player-audio-button button');
    findAll('audio')[0].dispatchEvent(new Event('play'));
    fixture.detectChanges();
    expect(audioButtons().map(button => button.disabled)).toEqual([true, true]);
    findAll('.answer > button')[1].click();
    expect(responses).toEqual([1]);
  });

  it('enters a number by keypad and keyboard, one box per digit of the correct answer', () => {
    const unit: Unit = {
      ...textUnit(false),
      answerType: 'number',
      questions: [{ text: '12 + 30', answers: [], correctAnswer: 42 }]
    };
    show(unit);
    const boxes = (): string[] => findAll('speedtest-player-number-boxes button')
      .map(box => box.textContent.trim());
    const key = (label: string): HTMLElement => findAll('speedtest-player-keypad button')
      .find(button => button.textContent.trim() === label)!;
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

  it('strikes words through and submits their numbers, skipping punctuation and numbers', () => {
    const unit: Unit = {
      ...textUnit(false),
      questionType: 'word-select',
      questions: [{ text: 'Der Hund, 3 Katzen.', answers: [] }]
    };
    show(unit);
    const words = (): HTMLElement[] => findAll('.word');
    expect(words().map(word => word.textContent)).toEqual(['Der', 'Hund', 'Katzen']);
    words()[2].click();
    words()[0].click();
    fixture.detectChanges();
    expect(words()[2].classList).toContain('selected');
    nextButton()!.click();
    expect(responses).toEqual([[0, 2]]);
  });

  it('shows inline answers in the gap of the sentence and submits on click', () => {
    const unit: Unit = {
      ...textUnit(false),
      questionType: 'inline-answers',
      questions: [{
        text: 'Der Ball liegt dem Tisch.', answerPosition: 3, answers: [{ text: 'unter' }, { text: 'über' }]
      }]
    };
    show(unit);
    expect(findAll('.sentence > span').map(part => part.textContent)).toEqual(['Der Ball liegt', 'dem Tisch.']);
    expect(find('.area.answers')).toBeNull();
    findAll('.sentence > .buttons button')[1].click();
    expect(responses).toEqual([1]);
  });

  describe('with audioRequired', () => {
    function audioUnit(overrides: Partial<Unit> = {}): Unit {
      return {
        ...textUnit(false),
        questionType: 'audio',
        audioRequired: true,
        questions: [
          { ...question('Hör zu.'), src: 'data:audio/wav;base64,AAAA' },
          { ...question('Hör noch mal zu.'), src: 'data:audio/wav;base64,BBBB' }
        ],
        ...overrides
      };
    }

    // The question comes before the answers, so its audio is the first one.
    function questionAudio(event: string): void {
      find('audio')!.dispatchEvent(new Event(event));
      fixture.detectChanges();
    }

    function audioButtonIsWobbling(): boolean {
      return find('speedtest-player-audio-button button')!.classList.contains('wobbling');
    }

    it('locks the answers until the question audio has ended, and wobbles the audio button instead', () => {
      show(audioUnit());
      expect(answerButton(0).classList).toContain('locked');
      expect(audioButtonIsWobbling()).toBe(false);
      answerButton(0).click();
      fixture.detectChanges();
      expect(responses).toEqual([]);
      expect(audioButtonIsWobbling()).toBe(true);
      questionAudio('play');
      questionAudio('pause');
      answerButton(0).click();
      expect(responses).toEqual([]);
      questionAudio('ended');
      expect(answerButton(0).classList).not.toContain('locked');
      answerButton(1).click();
      expect(responses).toEqual([1]);
    });

    it('locks every question again', () => {
      const unit = audioUnit();
      show(unit, 0);
      questionAudio('ended');
      show(unit, 1);
      answerButton(0).click();
      expect(responses).toEqual([]);
    });

    it('unlocks the answers when the question audio cannot be played', () => {
      show(audioUnit());
      questionAudio('error');
      answerButton(0).click();
      expect(responses).toEqual([0]);
    });

    it('does not lock a question without audio', () => {
      show(audioUnit({ questions: [question('Ohne Audio')] }));
      answerButton(1).click();
      expect(responses).toEqual([1]);
    });

    it('is not unlocked by audio answers', () => {
      const answers = [
        { text: 'bei', src: 'data:audio/wav;base64,CCCC' }, { text: 'ein', src: 'data:audio/wav;base64,DDDD' }
      ];
      show(audioUnit({
        answerType: 'audio',
        questions: [{ text: 'Was hörst du?', src: 'data:audio/wav;base64,AAAA', answers }]
      }));
      findAll('.answer audio')[0].dispatchEvent(new Event('ended'));
      fixture.detectChanges();
      findAll('.answer > button')[0].click();
      expect(responses).toEqual([]);
    });

    it('locks keypad, number boxes, keyboard and the next button of a number entry', () => {
      show(audioUnit({
        answerType: 'number',
        questions: [{ text: 'Hör zu.', src: 'data:audio/wav;base64,AAAA', answers: [], correctAnswer: 42 }]
      }));
      findAll('speedtest-player-keypad button')[4].click();
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '2' }));
      findAll('speedtest-player-number-boxes button')[1].click();
      nextButton()!.click();
      fixture.detectChanges();
      expect(findAll('speedtest-player-number-boxes button').map(box => box.textContent.trim())).toEqual(['', '']);
      expect(find('speedtest-player-number-boxes button')!.classList).toContain('active');
      expect(responses).toEqual([]);
    });

    it('locks word-select and inline answers until their audio has ended', () => {
      show(audioUnit({
        questionType: 'word-select',
        questions: [{ text: 'Der Hund', src: 'data:audio/wav;base64,AAAA', answers: [] }]
      }));
      findAll('.word')[1].click();
      fixture.detectChanges();
      expect(audioButtonIsWobbling()).toBe(true);
      questionAudio('ended');
      findAll('.word')[1].click();
      nextButton()!.click();
      expect(responses).toEqual([[1]]);
      show(audioUnit({
        questionType: 'inline-answers',
        questions: [{
          text: 'Der Ball liegt dem Tisch.', src: 'data:audio/wav;base64,AAAA', answerPosition: 3,
          answers: [{ text: 'unter' }, { text: 'über' }]
        }]
      }));
      findAll('.sentence > .buttons button')[1].click();
      expect(responses).toEqual([[1]]);
      questionAudio('ended');
      findAll('.sentence > .buttons button')[1].click();
      expect(responses).toEqual([[1], 1]);
    });
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
