/* Tests defaultQuestionSpaceRatio from common/constants.ts, which both modules use. It lives here because
   Angular's unit-test builder only discovers spec files under a project's own src folder. */
import { AnswerType, QuestionType } from 'common/interfaces/unit';
import { defaultQuestionSpaceRatio } from 'common/constants';

describe('defaultQuestionSpaceRatio', () => {
  // The question area sizes of the player before the layout rework, by question type and then by text,
  // image, audio and number answers.
  const answerTypes: AnswerType[] = ['text', 'image', 'audio', 'number'];
  const oldPlayer: Record<'column' | 'row', Partial<Record<QuestionType, number[]>>> = {
    column: { text: [50, 50, 50, 50], image: [70, 50, 70, 70], audio: [50, 50, 50, 50] },
    row: { text: [50, 70, 50, 45], image: [70, 70, 70, 45], audio: [50, 50, 50, 45] }
  };

  for (const [layout, byQuestion] of Object.entries(oldPlayer) as ['column' | 'row', typeof oldPlayer.row][]) {
    for (const [questionType, ratios] of Object.entries(byQuestion) as [QuestionType, number[]][]) {
      answerTypes.forEach((answerType, index) => {
        it(`is ${ratios[index]} for ${layout}, ${questionType} question and ${answerType} answers`, () => {
          expect(defaultQuestionSpaceRatio(layout, questionType, answerType)).toBe(ratios[index]);
        });
      });
    }
  }
});
