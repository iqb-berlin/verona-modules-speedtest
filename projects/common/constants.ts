import { AnswerType, QuestionType } from 'common/interfaces/unit';

export const textOnly = 50;
export const imageAndText = 70;
export const imageAndImage = 50;

/* Share of the screen (in percent) the question area gets when a unit does not set questionSpaceRatio. */
export function defaultQuestionSpaceRatio(questionType: QuestionType, answerType: AnswerType): number {
  if (questionType === 'image' && answerType === 'text') return imageAndText;
  if (questionType === 'image' && answerType === 'image') return imageAndImage;
  return textOnly;
}
