import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { escapeHtml, renderLatex } from 'common/services/latex';

/* HTML for an [innerHTML] binding: the text with its formulas rendered if the unit uses LaTeX, otherwise
   just the text. Angular's sanitizer would strip the inline styles KaTeX positions its output with, so it
   is bypassed; renderLatex escapes everything that is not KaTeX output. */
@Pipe({
  name: 'latex'
})
export class LatexPipe implements PipeTransform {
  private sanitizer = inject(DomSanitizer);

  transform(text: string, enabled: boolean): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(enabled ? renderLatex(text) : escapeHtml(text));
  }
}
