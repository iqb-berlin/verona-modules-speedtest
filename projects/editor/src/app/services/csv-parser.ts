import {
  Answer, Question, QuestionType
} from 'common/interfaces/unit';

export type CSVHeaderLabels = 'frage' | 'loesung' | `antwort_${number}`;

export function parseQuestions(csv: string, questionType: QuestionType, multiSelect: boolean = false): Question[] {
  const headerItems = csv.split(/\n/)[0].split(';').map(h => h.trim());
  const invalidHeaders = getInvalidHeaderLabels(headerItems);
  if (invalidHeaders.length > 0) throw Error(`Nicht erlaubte Kopfzeilenelement(e): ${invalidHeaders}`);

  return csv.split(/\n/)
    .filter(text => text.trim())
    .slice(1) // skip header line
    .map((line: string) => {
      const cellValues: string[] = line.split(';');
      if (cellValues.length !== headerItems.length) {
        throw Error(`Zeilenlänge passt nicht zur Kopfzeile!
                     Länge Kopfzeile: ${headerItems.length}; Zeilenlänge: ${cellValues.length}`);
      }
      return {
        text: cellValues[headerItems.indexOf('frage')].trim(),
        correctAnswer: multiSelect || questionType === 'word-select' ?
          cellValues[headerItems.indexOf('loesung')]
            .split(',').map(val => parseInt(val, 10)) :
          parseInt(cellValues[headerItems.indexOf('loesung')].trim(), 10),
        answers: generateAnswers(headerItems, cellValues),
        answerPosition: questionType === 'inline-answers' ?
          parseInt(cellValues[headerItems.indexOf('antwortpositionsindex')], 10) :
          undefined
      };
    });
}

function generateAnswers(headers: string[], cellValues: string[]): Answer[] {
  return headers
    .filter((header: string) => /^antwort_\d+$/.test(header))
    .map(header => {
      const splitHeaderName = `teilungsposition_${header.split('_')[1]}`;
      return {
        text: cellValues[headers.indexOf(header)].trim(),
        splitPosition: headers.includes(splitHeaderName) ?
          parseInt(cellValues[headers.indexOf(splitHeaderName)].trim(), 10) :
          undefined
      };
    });
}

function getInvalidHeaderLabels(headerItems: string[]): string[] {
  return headerItems.filter(
    item => item !== 'frage' &&
      item !== 'loesung' &&
      item !== 'antwortpositionsindex' &&
      !/^antwort_\d+$/.test(item) &&
      !/^teilungsposition_\d+$/.test(item)
  );
}
