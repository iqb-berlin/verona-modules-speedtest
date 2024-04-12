export interface Unit {
  type: string;
  version: string;
  questions: Question[];
  defaultVariablePrefix: string;
}

export interface Question {
  layout: 'column' | 'row';
  text?: string;
  imgSrc?: string;
  anwers: Answer[];
}

export interface Answer {
  text: string;
}
