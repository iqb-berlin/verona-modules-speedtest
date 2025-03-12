export interface Unit {
  type: string;
  version: string;
  questions: Question[];
  layout: 'column' | 'row';
  buttonColor?: string;
  instructionText?: string;
  questionType: 'text' | 'image' | 'audio'; // image may also have a subtext
  answerType: 'text' | 'image';
}

export interface Question {
  text?: string;
  src?: string;
  // imgSrc?: string;
  // audioSrc?: string;
  answers: string[];
  // answers: Answer[];
  correctAnswerIndex?: number;
}

// export interface Answer {
//   type: 'text' | 'image';
//   value: string;
// }
