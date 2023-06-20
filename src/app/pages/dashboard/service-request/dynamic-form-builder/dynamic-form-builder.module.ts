import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicFormBuilderComponent } from './components/dynamic-form-builder/dynamic-form-builder.component';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InputComponent } from './components/input/input.component';

@NgModule({
  declarations: [DynamicFormBuilderComponent, InputComponent],
  exports: [DynamicFormBuilderComponent],
  imports: [CommonModule, ToastrModule.forRoot(), FormsModule, NgbModule, ReactiveFormsModule],
})
export class DynamicFormBuilderModule {}
