/* The digits typed into the result boxes and the box the next digit goes into. One box per digit of the
   correct answer, so the box count gives nothing away beyond the length. */
export class NumberEntry {
  digits: (number | undefined)[];
  activeIndex = 0;

  constructor(length: number) {
    this.digits = new Array<number | undefined>(Math.max(length, 1)).fill(undefined);
  }

  static forAnswer(correctAnswer: number | number[] | undefined): NumberEntry {
    return new NumberEntry(correctAnswer?.toString().length ?? 1);
  }

  /* Fills the active box and moves on; the last box keeps the focus and is overwritten. */
  enter(digit: number): void {
    this.digits[this.activeIndex] = digit;
    this.moveForward();
  }

  /* Empties the active box, or, if it is empty already, the one before it — like backspace in a text field. */
  delete(): void {
    if (this.digits[this.activeIndex] === undefined) this.moveBack();
    this.digits[this.activeIndex] = undefined;
  }

  select(index: number): void {
    this.activeIndex = index;
  }

  moveBack(): void {
    if (this.activeIndex > 0) this.activeIndex -= 1;
  }

  moveForward(): void {
    if (this.activeIndex < this.digits.length - 1) this.activeIndex += 1;
  }

  /* Empty boxes are skipped; nothing entered gives NaN, as in the old view. */
  value(): number {
    return parseInt(this.digits.join(''), 10);
  }
}
