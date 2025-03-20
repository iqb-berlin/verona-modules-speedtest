export interface Unit {
  type: string;
  version: string;
  questions: Question[];
  layout: 'column' | 'row';
  buttonColor?: string;
  instructionText?: string;
  questionType: 'text' | 'image' | 'audio'; // image may also have a subtext
  answerType: 'text' | 'image' | 'number';
}

export interface Question {
  text?: string;
  src?: string;
  answers: string[];
  correctAnswer?: number;
}

