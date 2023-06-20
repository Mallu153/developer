import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getvaluebwbrackets'
})
export class GetValueBWBrackets implements PipeTransform {
  transform(val:any):any[] {
    return val.match(/\(([^)]+)\)/)[1];
  }
}
