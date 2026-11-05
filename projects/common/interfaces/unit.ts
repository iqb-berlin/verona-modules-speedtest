export interface Unit {
  type: string;
  version: string;
  questions: Item[]; // Named before items were called items; renaming the key would break stored units
  layout: 'column' | 'row';
  buttonColor?: string;
  instructionText?: string;
  questionType: QuestionType;
  answerType: AnswerType;
  multipleSelection?: boolean;
  questionSpaceRatio?: number; // Determines of much screen space is reserved for question part
  latex?: boolean; // Renders $…$ in question and answer texts as LaTeX
  outroText?: string; // Shown after the last item; without it, defaultOutroText
  audioRequired?: boolean; // Answers are locked until the question audio has been played
}

export type QuestionType = 'text' | 'image' | 'audio' | 'word-select' | 'inline-answers';
export type AnswerType = 'text' | 'image' | 'number' | 'audio';

/* One task of the unit: a question and its answers. "Question" alone means only the question part,
   as in questionType and questionSpaceRatio; text and src belong to it. */
export interface Item {
  text?: string; // question text
  src?: string; // question image or audio
  answers: Answer[];
  correctAnswer?: number | number[]; // number for selected index or number result; multiple numbers for multi-choice
  answerPosition?: number; // Used to position inline-buttons
}

export interface Answer {
  text: string;
  src?: string; // can be src for image or audio
  splitPosition?: number; // if set the button label will be split and colored
}
