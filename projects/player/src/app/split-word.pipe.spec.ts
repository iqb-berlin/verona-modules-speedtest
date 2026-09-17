import { SplitWordPipe } from './split-word.pipe';

describe('SplitWordPipe', () => {
  const pipe = new SplitWordPipe();

  it('splits a word at the given position', () => {
    expect(pipe.transform('Sonnenblume', 6)).toEqual(['Sonnen', 'blume']);
  });

  it('counts the position in characters, not bytes', () => {
    expect(pipe.transform('Füße', 2)).toEqual(['Fü', 'ße']);
  });

  it('puts the whole word in the first part when the position is past its end', () => {
    expect(pipe.transform('Haus', 10)).toEqual(['Haus', '']);
  });

  it('puts the whole word in the second part for position 0', () => {
    expect(pipe.transform('Haus', 0)).toEqual(['', 'Haus']);
  });
});
