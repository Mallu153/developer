import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomizableTableComponent } from './customizable-table.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbdSortableHeader } from './directive/sortable.directive';
import { PipeModule } from 'app/shared/pipes/pipe.module';

@NgModule({
  declarations: [CustomizableTableComponent, NgbdSortableHeader],
  imports: [NgbModule, FormsModule, ReactiveFormsModule, CommonModule, PipeModule],
  exports: [CustomizableTableComponent],
})
export class CustomizableTableModule {}
