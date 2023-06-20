import { Pipe, PipeTransform } from '@angular/core';
/**
 * Phone pipe to conver phone number with dash symbol
 */
@Pipe({
  name: 'phone',
})
export class PhonePipe implements PipeTransform {
  transform(rawNum) {
    rawNum = rawNum.toString();
    rawNum = rawNum.charAt(0) != 0 ? '0' + rawNum : '' + rawNum;

    let newStr = '';
    let i = 0;

    for (; i < Math.floor(rawNum.length / 2) - 1; i++) {
      newStr = newStr + rawNum.substr(i * 2, 2) + '-';
    }

    return newStr + rawNum.substr(i * 2);
  }
}
