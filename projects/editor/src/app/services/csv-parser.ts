import {
  Answer, Question, QuestionType
} from 'common/interfaces/unit';

export type CSVHeaderLabels = 'frage' | 'loesung' | `antwort_${number}`;

export function parseQuestions(csv: string, questionType: QuestionType): Question[] {
  const headerItems = csv.split(/\n/)[0].split(';').map(h => h.trim());
  const invalidHeaders = getInvalidHeaderLabels(headerItems);
  if (invalidHeaders.length > 0) throw Error(`Invalid header label(s): ${invalidHeaders}`);

  return csv.split(/\n/)
    .filter(text => text.trim())
    .slice(1) // skip header line
    .map((line: string) => {
      const cellValues: string[] = line.split(';');
      if (cellValues.length !== headerItems.length) {
        throw Error(`Item numbers do not match!
          header length: ${headerItems.length} - items length: ${cellValues.length}`);
      }
      return {
        text: cellValues[headerItems.indexOf('frage')].trim(),
        correctAnswer: questionType === 'word-select' ?
          cellValues[headerItems.indexOf('loesung')]
            .split(',').map(val => parseInt(val, 10)) :
          parseInt(cellValues[headerItems.indexOf('loesung')].trim(), 10),
        answers: generateAnswers(headerItems, cellValues),
        answerPosition: questionType === 'inline-answers' ? parseInt(cellValues[1], 10) : undefined
      };
    });
}

function generateAnswers(headers: string[], cellValues: string[]): Answer[] {
  const answerColIndices = getAnswerColIndices(headers);
  return answerColIndices
    .map(answerIndex => ({ text: cellValues[answerIndex].trim() }));
}

/** Get indices of columns containing answers. */
function getAnswerColIndices(headers: string[]): number[] {
  return headers
    .filter((header: string) => /^antwort_\d+$/.test(header))
    .map(answerHeader => headers.indexOf(answerHeader));
}

function getInvalidHeaderLabels(headerItems: string[]): string[] {
  return headerItems.filter(
    item => item !== 'frage' && item !== 'loesung' && !/^antwort_\d+$/.test(item)
  );
}
