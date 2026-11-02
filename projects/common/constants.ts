import { AnswerType, QuestionType, Unit } from 'common/interfaces/unit';

/* Share of the screen (in percent) the question area gets when a unit does not set questionSpaceRatio. These
   are the values the player used before the layout rework, so units relying on them keep their look. */
export function defaultQuestionSpaceRatio(
  layout: Unit['layout'], questionType: QuestionType, answerType: AnswerType
): number {
  if (layout === 'column') return questionType === 'image' && answerType !== 'image' ? 70 : 50;
  if (answerType === 'number') return 45;
  return questionType === 'image' || (questionType === 'text' && answerType === 'image') ? 70 : 50;
}

/* Shown after the last question when a unit does not set outroText. */
export const defaultOutroText = 'Keine weiteren Seiten. Weiterleitung zur nächsten Unit...';
