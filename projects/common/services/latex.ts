/* Tests live in player/src/app/latex.spec.ts: Angular's unit-test builder only picks up spec files
   under a project's own src folder, so a spec next to this file would never run. */
import katex from 'katex';

/* Either a formula between unescaped $ signs, or an escaped \$ outside of one. Inside a formula, any
   backslash pair is skipped as a whole, so \$ there stays part of the formula, where it is LaTeX's own
   dollar sign. A $ without a closing partner matches neither and is kept as text. */
const MATH_OR_ESCAPED_DOLLAR = /\$((?:\\.|[^\\$])+)\$|\\\$/g;

/* Turns a text with formulas between $ signs into HTML: formulas rendered by KaTeX, everything else
   escaped. A formula KaTeX cannot parse is shown as its source in red instead of failing. */
export function renderLatex(text: string): string {
  let html = '';
  let textStart = 0;
  for (const match of text.matchAll(MATH_OR_ESCAPED_DOLLAR)) {
    html += escapeHtml(text.slice(textStart, match.index));
    html += match[1] === undefined ? '$' : katex.renderToString(match[1], { throwOnError: false });
    textStart = match.index + match[0].length;
  }
  return html + escapeHtml(text.slice(textStart));
}

export function containsFormula(text: string): boolean {
  return [...text.matchAll(MATH_OR_ESCAPED_DOLLAR)].some(match => match[1] !== undefined);
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
