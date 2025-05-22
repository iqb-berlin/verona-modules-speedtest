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
      answers: [{ text: 'richtig', splitPosition: undefined }, { text: 'falsch', splitPosition: undefined }],
      correctAnswer: 1,
      answerPosition: undefined
    });
    expect(questions[1]).toEqual({
      text: 'Frage 2',
      answers: [{ text: 'antwort 1', splitPosition: undefined }, { text: 'antwort2', splitPosition: undefined }],
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
      answers: [{ text: 'richtig', splitPosition: undefined }, { text: 'falsch', splitPosition: undefined }],
      correctAnswer: 1,
      answerPosition: undefined
    });
  });

  it('reads text-text multiselect', () => {
    const csv = `frage; antwort_1; antwort_2; loesung
                 Frage 1; richtig; falsch; 1
                 Frage 2; antwort 1; antwort2; 0, 1`;
    const questions = csvParser.parseQuestions(csv, 'text', true);
    expect(questions.length).toBe(2);
    expect(questions[0]).toEqual({
      text: 'Frage 1',
      answers: [{ text: 'richtig', splitPosition: undefined }, { text: 'falsch', splitPosition: undefined }],
      correctAnswer: [1],
      answerPosition: undefined
    });
    expect(questions[1]).toEqual({
      text: 'Frage 2',
      answers: [{ text: 'antwort 1', splitPosition: undefined }, { text: 'antwort2', splitPosition: undefined }],
      correctAnswer: [0, 1],
      answerPosition: undefined
    });
  });

  it('reads text-text with split button labels', () => {
    const csv = `frage;   antwort_1; antwort_2; loesung; teilungsposition_2; teilungsposition_1
                 Frage 1; richtig;   falsch;    1;       2;                  3
                 Frage 2; antwort 1; antwort2;  0;       1;                  4`;
    const questions = csvParser.parseQuestions(csv, 'text', true);
    expect(questions.length).toBe(2);
    expect(questions[0]).toEqual({
      text: 'Frage 1',
      answers: [{ text: 'richtig', splitPosition: 3 }, { text: 'falsch', splitPosition: 2 }],
      correctAnswer: [1],
      answerPosition: undefined
    });
  });

  it('throws error with split button labels with missing headers', () => {
    const csv = `frage; antwort_1; antwort_2; loesung; teilungsposition_1; teilungsposition_2
                 Frage 1; richtig; falsch; 1
                 Frage 2; antwort 1; antwort2; 0, 1`;
    expect(() => csvParser.parseQuestions(csv, 'text', true)).toThrow();
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

  it('reads inline-answers format', () => {
    const csv = `frage; antwortpositionsindex; antwort_1; antwort_2; loesung
                 Die lebt im Wald; 1; Oile; Eule; 1`;
    const questions = csvParser.parseQuestions(csv, 'inline-answers');
    expect(questions.length).toBe(1);
    expect(questions[0]).toEqual({
      text: 'Die lebt im Wald',
      answers: [{ text: 'Oile', splitPosition: undefined }, { text: 'Eule', splitPosition: undefined }],
      correctAnswer: 1,
      answerPosition: 1
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
