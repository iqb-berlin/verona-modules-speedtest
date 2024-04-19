export interface Unit {
  type: string;
  version: string;
  questions: Question[];
  globalLayout: 'column' | 'row' | undefined;
  buttonColor?: string;
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
