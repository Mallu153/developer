import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuillModule } from 'ngx-quill';
import { RfqRoutingModule } from './rfq-routing.module';
import { FlightRfqComponent } from './components/flight-rfq/flight-rfq.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'app/shared/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { CustomerDetailsComponent } from './components/customer-details/customer-details.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { SupplierInformationComponent } from './components/supplier-information/supplier-information.component';
import { PricePopupComponent } from './components/price-popup/price-popup.component';
import { OpenRfqsListComponent } from './components/open-rfqs-list/open-rfqs-list.component';
import { SubmittedRfqsListComponent } from './components/submitted-rfqs-list/submitted-rfqs-list.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SupplierOtherContactsComponent } from './components/supplier-other-contacts/supplier-other-contacts.component';
import { RfqMailSendComponent } from './components/rfq-mail-send/rfq-mail-send.component';
import { HotelRfqComponent } from './components/hotel-rfq/hotel-rfq.component';
import { HotelRfqAddonsComponent } from './components/hotel-rfq/hotel-rfq-addons/hotel-rfq-addons.component';
import { HotelRfqPassengersComponent } from './components/hotel-rfq/hotel-rfq-passengers/hotel-rfq-passengers.component';
import { HotelRfqPassengersPopupComponent } from './components/hotel-rfq/hotel-rfq-passengers-popup/hotel-rfq-passengers-popup.component';
import { HotelRfqsAwtResponsesComponent } from './components/hotel-rfq/hotel-rfqs-awt-responses/hotel-rfqs-awt-responses.component';
import { HotelRfqPricePopUpComponent } from './components/hotel-rfq/hotel-rfq-price-pop-up/hotel-rfq-price-pop-up.component';
import { SelectedPassengersService } from '../dashboard-booking/share-data-services/selected-passenger.service';
import { DynamicFormBuilderModule } from '../service-request/dynamic-form-builder/dynamic-form-builder.module';
import { ServiceRequestModule } from '../service-request/service-request.module';
import { AncillaryRfqComponent } from './components/ancillary-rfq/ancillary-rfq.component';
import { AncillaryRfqsAwtResponsesComponent } from './components/ancillary-rfq/ancillary-rfqs-awt-responses/ancillary-rfqs-awt-responses.component';
import { AncillaryRfqPricePopupComponent } from './components/ancillary-rfq/ancillary-rfq-price-popup/ancillary-rfq-price-popup.component';
import { GroupByPipe } from 'app/shared/pipes/group-by.pipe';
import { PipeModule } from 'app/shared/pipes/pipe.module';
import { RfqAttractionsAwtResponsesComponent } from './components/attractions-rfq/rfq-attractions-awt-responses/rfq-attractions-awt-responses.component';
import { RfqListComponent } from './components/rfq-list/rfq-list.component';
import { AttractionPricePopupComponent } from './components/attractions-rfq/attraction-price-popup/attraction-price-popup.component';
import { PackageRfqComponent } from './components/package-rfq/package-rfq.component';
import { AttractionsRfqSupplierMappingFormComponent } from './components/attractions-rfq/attractions-rfq-supplier-mapping-form/attractions-rfq-supplier-mapping-form.component';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';



@NgModule({
  declarations: [
    FlightRfqComponent,
    CustomerDetailsComponent,
    SupplierInformationComponent,
    PricePopupComponent,
    OpenRfqsListComponent,
    SubmittedRfqsListComponent,
    SupplierOtherContactsComponent,
    RfqMailSendComponent,
    HotelRfqComponent,
    HotelRfqAddonsComponent,
    HotelRfqPassengersComponent,
    HotelRfqPassengersPopupComponent,
    HotelRfqsAwtResponsesComponent,
    HotelRfqPricePopUpComponent,
    AncillaryRfqComponent,
    AncillaryRfqsAwtResponsesComponent,
    AncillaryRfqPricePopupComponent,
    RfqAttractionsAwtResponsesComponent,
    RfqListComponent,
    AttractionPricePopupComponent,
    PackageRfqComponent,
    AttractionsRfqSupplierMappingFormComponent,
  ],
  imports: [
    CommonModule,
    RfqRoutingModule,
    FormsModule,
    GooglePlaceModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    NgbModule,
    SharedModule,
    PipeModule,
    NgSelectModule,
    NgbDatepickerModule,
    Ng2SearchPipeModule,
    NgxSpinnerModule,
    QuillModule.forRoot(),
    ServiceRequestModule,
    DynamicFormBuilderModule,
  ],
  providers: [
    SelectedPassengersService,
  ],

})
export class RfqModule { }
