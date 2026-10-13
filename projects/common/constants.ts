import { AnswerType, QuestionType } from 'common/interfaces/unit';

const textOnly = 50;
const imageAndText = 70;
const imageAndImage = 50;

/* Share of the screen (in percent) the question area gets when a unit does not set questionSpaceRatio. */
export function defaultQuestionSpaceRatio(questionType: QuestionType, answerType: AnswerType): number {
  if (questionType === 'image' && answerType === 'text') return imageAndText;
  if (questionType === 'image' && answerType === 'image') return imageAndImage;
  return textOnly;
}

/* Shown after the last question when a unit does not set outroText. */
export const defaultOutroText = 'Keine weiteren Seiten. Weiterleitung zur nächsten Unit...';
