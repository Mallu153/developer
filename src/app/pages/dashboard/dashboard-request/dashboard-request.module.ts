import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DashboardRequestComponent } from './dashboard-request.component';
import { DashboardRequestRoutingModule } from './routers/dashboard-request-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { CustomizableTableService } from 'app/shared/components/customizable-table/service/customizable-table.service';
import { PaxSearchComponent } from './components/pax-search/pax-search.component';
import { PaxComponent } from './components/pax/pax.component';
import { SearchPaxDataService } from './services/search-pax-data.service';
import { SearchResultComponent } from './components/search-result/search-result.component';
import { SearchResponsesService } from './services/search-responses.service';
import { AllServiceRequestsComponent } from './components/all-service-requests/all-service-requests.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { ContactComponent } from './components/contact/contact.component';
import { SharedModule } from 'app/shared/shared.module';
import { AncillarySelectComponent } from './components/search-result/ancillary-select/ancillary-select.component';
import { SrReportsModule } from '../sr-reports/sr-reports.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { PackageRequestListComponent } from './components/package-request-list/package-request-list.component';
import { OpenRequestListpopupComponent } from './components/package-request-list/open-request-listpopup/open-request-listpopup.component';
import { RequestDependsRfqPopupComponent } from './components/package-request-list/request-depends-rfq-popup/request-depends-rfq-popup.component';
import { QuillModule } from 'ngx-quill';
import { PipeModule } from 'app/shared/pipes/pipe.module';
import { ImportsComponent } from './components/search-result/imports/imports.component';

@NgModule({
  declarations: [
    DashboardRequestComponent,
    PaxSearchComponent,
    PaxComponent,
    SearchResultComponent,
    AllServiceRequestsComponent,
    ContactComponent,
    AncillarySelectComponent,
    PackageRequestListComponent,
    OpenRequestListpopupComponent,
    RequestDependsRfqPopupComponent,
    ImportsComponent,
  ],
  imports: [
    DashboardRequestRoutingModule,
    NgSelectModule,
    CommonModule,
    NgbModule,
    FormsModule,
    NgbDatepickerModule,
    ReactiveFormsModule,
    Ng2SearchPipeModule,
    SrReportsModule,
    SharedModule,
    PipeModule,
    NgxDatatableModule,
    QuillModule.forRoot(),
  ],
  providers: [DatePipe, CustomizableTableService, SearchPaxDataService, SearchResponsesService],
  exports: [DashboardRequestComponent, AncillarySelectComponent],
})
export class DashboardRequestModule {}
