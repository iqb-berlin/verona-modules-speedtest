import * as csvParser from 'editor/src/app/services/csv-parser';

describe('CSVParser', () => {
  it('reads text-text format', () => {
    const csv = `frage; loesung; antwort_1; antwort_2
Frage 1; 1; richtig; falsch
Frage 2; 2;antwort 1; antwort2`;

    const questions = csvParser.parseQuestions(csv, 'text');

    expect(questions.length).toBe(2);

    expect(questions[0]).toEqual({
      text: 'Frage 1',
      answers: [{ text: 'richtig' }, { text: 'falsch' }],
      correctAnswer: 1,
      answerPosition: undefined
    });
    expect(questions[1]).toEqual({
      text: 'Frage 2',
      answers: [{ text: 'antwort 1' }, { text: 'antwort2' }],
      correctAnswer: 2,
      answerPosition: undefined
    });
  });

  it('reads text-text format in mixed up column order', () => {
    const csv = `frage; antwort_1; antwort_2; loesung
Frage 1; richtig; falsch; 1
Frage 2; antwort 1; antwort2; 1`;
    const questions = csvParser.parseQuestions(csv, 'text');
    expect(questions.length).toBe(2);
    expect(questions[0]).toEqual({
      text: 'Frage 1',
      answers: [{ text: 'richtig' }, { text: 'falsch' }],
      correctAnswer: 1,
      answerPosition: undefined
    });
  });

  it('reads word-select format', () => {
    const csv = `frage; loesung
Frage mit mehreren Worten; 1,3
Frage 2; 2`;
    const questions = csvParser.parseQuestions(csv, 'word-select');
    expect(questions.length).toBe(2);
    expect(questions[0]).toEqual({
      text: 'Frage mit mehreren Worten',
      answers: [],
      correctAnswer: [1, 3],
      answerPosition: undefined
    });
  });

  it('reads number format', () => {
    const csv = `frage; loesung
Frage 1; 1234
Frage 2; 6
Frage 3; 2`;
    const questions = csvParser.parseQuestions(csv, 'text');
    expect(questions.length).toBe(3);
    expect(questions[0]).toEqual({
      text: 'Frage 1',
      answers: [],
      correctAnswer: 1234,
      answerPosition: undefined
    });
  });

  it('reads number format in mixed order', () => {
    const csv = `loesung; frage
2; Frage 1`;
    const questions = csvParser.parseQuestions(csv, 'text');
    expect(questions.length).toBe(1);
    expect(questions[0]).toEqual({
      text: 'Frage 1',
      answers: [],
      correctAnswer: 2,
      answerPosition: undefined
    });
  });

  it('should throw Error when line item count does not match header count', () => {
    const csv = `frage; antwort_1; antwort_2
Frage 1; 1; richtig; falsch
Frage 2; 2;antwort 1; antwort2`;
    expect(() => csvParser.parseQuestions(csv, 'text')).toThrow();
  });

  it('should throw Error when invalid header items are present', () => {
    const csv = 'fragex; antwort_1; antwort_2';
    expect(() => csvParser.parseQuestions(csv, 'text')).toThrow();
  });
});
