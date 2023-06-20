import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SrReportsRoutingModule } from './sr-reports-routing.module';
import { BookingReportComponent } from './components/booking-report/booking-report.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { SharedModule } from 'app/shared/shared.module';
import { BookingSearchComponent } from './components/booking-search/booking-search.component';
import { SrSummaryComponent } from './components/sr-summary/sr-summary.component';
import { SrSummaryDeatilsBySrSrlineComponent } from './components/sr-summary/sr-summary-deatils-by-sr-srline/sr-summary-deatils-by-sr-srline.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BookingDetailsMicroAccountDataComponent } from './components/booking-details-micro-account-data/booking-details-micro-account-data.component';
import { CustomerVerificationPopupComponent } from './components/customer-verification-popup/customer-verification-popup.component';
import { BookingReportSupplierReferenceComponent } from './components/booking-report-supplier-reference/booking-report-supplier-reference.component';
import { BookingSearchSupplierReferenceComponent } from './components/booking-search-supplier-reference/booking-search-supplier-reference.component';


@NgModule({
  declarations: [
    BookingReportComponent,
    BookingSearchComponent,
     SrSummaryComponent,
     SrSummaryDeatilsBySrSrlineComponent,
     BookingDetailsMicroAccountDataComponent,
     CustomerVerificationPopupComponent,
     BookingReportSupplierReferenceComponent,
     BookingSearchSupplierReferenceComponent
    ],
  imports: [
    CommonModule,
    SrReportsRoutingModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    NgSelectModule,
    Ng2SearchPipeModule,
    SharedModule,
    NgxDatatableModule,

  ],
  exports:[
    BookingReportComponent
  ]
})
export class SrReportsModule { }
