import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FilterPipe } from './filter.pipe';
import { SearchPipe } from './search.pipe';
import { ShortNamePipe } from './short-name.pipe';
import { PhonePipe } from './phone-pipe';
import { GroupByPipe } from './group-by.pipe';
import { GroupByWithSumPipe } from './group-by-with-sum.pipe';
import { GetValueBWBrackets } from './get-value-bw-brackets';
import { DateAgoPipe } from './date-ago.pipe';
import { OrdinalPipe } from './ordinal.pipe';
@NgModule({
  declarations: [
    FilterPipe,
    SearchPipe,
    ShortNamePipe,
    PhonePipe,
    GroupByPipe,
    GroupByWithSumPipe,
    GetValueBWBrackets,
    DateAgoPipe,
    OrdinalPipe
  ],
  imports: [CommonModule],
  exports: [
    FilterPipe,
    SearchPipe,
    ShortNamePipe,
    PhonePipe,
    GroupByPipe,
    GroupByWithSumPipe,
    GetValueBWBrackets,
    DateAgoPipe,
    OrdinalPipe
  ],
})
export class PipeModule {}
