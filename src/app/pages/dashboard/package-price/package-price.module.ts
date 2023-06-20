import { NgModule } from '@angular/core';
import { CommonModule} from '@angular/common';

import { PackagePriceRoutingModule } from './package-price-routing.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
//components
import { AddPriceComponent } from './components/add-price/add-price.component';
import { AddPriceListComponent } from './components/add-price-list/add-price-list.component';
import { DecimalDirective } from './components/directives/decimal.directive';

@NgModule({
  declarations: [
    DecimalDirective,
    AddPriceComponent,
    AddPriceListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgxDatatableModule,
    PackagePriceRoutingModule
  ],

})
export class PackagePriceModule { }
