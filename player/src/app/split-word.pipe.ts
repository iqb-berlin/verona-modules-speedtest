import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'splitWord',
  standalone: true
})
export class SplitWordPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(text: string, pos: number): [string, string] {
    const firstPart = text.slice(0, pos);
    const secondPart = text.slice(pos);
    return [firstPart, secondPart];
  }
}
