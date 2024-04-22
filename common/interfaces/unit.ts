export interface Unit {
  type: string;
  version: string;
  questions: Question[];
  layout: 'column' | 'row';
  buttonColor?: string;
}

export interface Question {
  text?: string;
  imgSrc?: string;
  answers: string[];
}
