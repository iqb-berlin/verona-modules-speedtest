/* Tests common/services/latex.ts, which both modules use. It lives here because Angular's unit-test
   builder only discovers spec files under a project's own src folder. */
import katex from 'katex';
import { containsFormula, renderLatex } from 'common/services/latex';

describe('renderLatex', () => {
  const formula = (source: string) => katex.renderToString(source, { throwOnError: false });

  it('leaves a text without $ signs as it is', () => {
    expect(renderLatex('Wie viel ist 3 + 4?')).toBe('Wie viel ist 3 + 4?');
  });

  it('renders the text between $ signs as a formula', () => {
    expect(renderLatex('Berechne $\\frac{1}{2}$ bitte'))
      .toBe(`Berechne ${formula('\\frac{1}{2}')} bitte`);
  });

  it('renders several formulas in one text', () => {
    expect(renderLatex('$a$ und $b$')).toBe(`${formula('a')} und ${formula('b')}`);
  });

  it('turns an escaped \\$ outside of a formula into a $ sign', () => {
    expect(renderLatex('Das kostet 5\\$.')).toBe('Das kostet 5$.');
  });

  it('does not start a formula at an escaped \\$', () => {
    expect(renderLatex('\\$5 und $x$')).toBe(`$5 und ${formula('x')}`);
  });

  it('keeps an escaped \\$ inside a formula as part of it', () => {
    expect(renderLatex('$5\\$ + 3\\$$')).toBe(formula('5\\$ + 3\\$'));
  });

  it('keeps a $ without a closing partner as text', () => {
    expect(renderLatex('nur ein $ Zeichen')).toBe('nur ein $ Zeichen');
  });

  it('keeps an empty pair of $ signs as text', () => {
    expect(renderLatex('$$')).toBe('$$');
  });

  it('escapes HTML in the text around formulas', () => {
    expect(renderLatex('<b>&"</b> $x$')).toBe(`&lt;b&gt;&amp;&quot;&lt;/b&gt; ${formula('x')}`);
  });

  it('escapes HTML in a formula KaTeX cannot parse', () => {
    const html = renderLatex('$\\frac{<img>$');

    expect(html).not.toContain('<img>');
    expect(html).toContain('katex-error');
  });
});

describe('containsFormula', () => {
  it('finds a formula between $ signs', () => {
    expect(containsFormula('Ergebnis: $x^2$')).toBe(true);
  });

  it('does not count escaped or unpaired $ signs as a formula', () => {
    expect(containsFormula('5\\$ oder 3$')).toBe(false);
  });
});
