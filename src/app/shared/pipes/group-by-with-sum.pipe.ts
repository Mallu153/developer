import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'groupByWithSum'
})
export class GroupByWithSumPipe implements PipeTransform {
  transform(collection: object[], property: string, sum: string): object[] {
    // prevents the application from breaking if the array of objects doesn't exist yet
    if(!collection) { return null; }

    const groupedCollection = collection.reduce((previous, current)=> {
      if(!previous[current[property]]) {
          previous[current[property]] = [current];
      } else {
          previous[current[property]].push(current);
      }

      return previous;
    }, {});

    // this will return an array of objects, each object containing a group of objects
    return Object.keys(groupedCollection).map(key => ({
      key,
      sum: groupedCollection[key].reduce((a, b) => a + parseInt(b[sum]), 0),
      value: groupedCollection[key]
    }));
  }
}
