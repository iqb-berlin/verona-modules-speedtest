import {
  Answer, Question, QuestionType
} from 'common/interfaces/unit';

export type CSVHeaderLabels = 'frage' | 'loesung' | `antwort_${number}`;

export function parseQuestions(csv: string, questionType: QuestionType, multiSelect: boolean = false): Question[] {
  const cleanedCsv = csv.replace(/\r/g, '');
  if (cleanedCsv.includes('\uFFFD')) {
    throw new Error('Datei ist nicht UTF-8 kodiert.');
  }
  const headerItems = cleanedCsv.split(/\n/)[0].split(';').map(h => h.trim());
  const invalidHeaders = getInvalidHeaderLabels(headerItems);
  if (invalidHeaders.length > 0) throw Error(`Nicht erlaubte Kopfzeilenelement(e): ${invalidHeaders}`);

  return cleanedCsv.split(/\n/)
    .filter(text => text.trim())
    .slice(1) // skip header line
    .map((line: string) => {
      const cellValues: string[] = line.split(';');
      if (cellValues.length !== headerItems.length) {
        throw Error(`Zeilenlänge passt nicht zur Kopfzeile!
                     Länge Kopfzeile: ${headerItems.length}; Zeilenlänge: ${cellValues.length}`);
      }
      const question: Question = {
        text: cellValues[headerItems.indexOf('frage')].trim(),
        answers: generateAnswers(headerItems, cellValues)
      };
      if (headerItems.includes('loesung')) {
        if (multiSelect || questionType === 'word-select') {
          question.correctAnswer = cellValues[headerItems.indexOf('loesung')].split(',').map(val => parseInt(val, 10));
        } else {
          question.correctAnswer = parseInt(cellValues[headerItems.indexOf('loesung')].trim(), 10);
        }
      }
      if (headerItems.includes('antwortpositionsindex') && questionType === 'inline-answers') {
        question.answerPosition = parseInt(cellValues[headerItems.indexOf('antwortpositionsindex')], 10);
      }
      return question;
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
