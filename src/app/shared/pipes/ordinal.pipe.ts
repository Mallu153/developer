import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'ordinal'})
export class OrdinalPipe implements PipeTransform {
  transform(value: number): string {
    let suffix = '';
    if (value >= 11 && value <= 13) {
      suffix = 'th';
    } else {
      const lastDigit = value % 10;
      switch (lastDigit) {
        case 1:
          suffix = 'st';
          break;
        case 2:
          suffix = 'nd';
          break;
        case 3:
          suffix = 'rd';
          break;
        default:
          suffix = 'th';
          break;
      }
    }
    return value + suffix;
  }
}
