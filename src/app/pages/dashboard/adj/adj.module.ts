import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdjRoutingModule } from './adj-routing.module';
import { CorporateToRetailComponent } from './components/corporate-to-retail/corporate-to-retail.component';
import { RetailToCorporateComponent } from './components/retail-to-corporate/retail-to-corporate.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SharedModule } from 'app/shared/shared.module';
import { HeaderFormComponent } from './components/header-form/header-form.component';
import { RTCHeaderComponent } from './components/r-t-c-header/r-t-c-header.component';


@NgModule({
  declarations: [CorporateToRetailComponent, RetailToCorporateComponent, HeaderFormComponent, RTCHeaderComponent],
  imports: [
    CommonModule,
    AdjRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    SharedModule,
    NgSelectModule,
    Ng2SearchPipeModule,
    NgxSpinnerModule,
  ]
})
export class AdjModule { }
