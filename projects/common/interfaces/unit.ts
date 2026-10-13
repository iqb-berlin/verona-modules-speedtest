export interface Unit {
  type: string;
  version: string;
  questions: Question[];
  layout: 'column' | 'row';
  buttonColor?: string;
  instructionText?: string;
  questionType: QuestionType;
  answerType: AnswerType;
  multipleSelection?: boolean;
  questionSpaceRatio?: number; // Determines of much screen space is reserved for question part
}

export type QuestionType = 'text' | 'image' | 'audio' | 'word-select' | 'inline-answers';
export type AnswerType = 'text' | 'image' | 'number' | 'audio';

export interface Question {
  text?: string;
  src?: string; // can be src for image or audio
  answers: Answer[];
  correctAnswer?: number | number[]; // number for selected index or number result; multiple numbers for multi-choice
  answerPosition?: number; // Used to position inline-buttons
}

export interface Answer {
  text: string;
  src?: string; // can be src for image or audio
  splitPosition?: number; // if set the button label will be split and colored
}
