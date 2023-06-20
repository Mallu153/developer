import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardBookingRoutingModule } from './routers/dashboard-booking-routing.module';
import { NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DashboardBookingComponent } from './dashboard-booking.component';
import { FlightFormComponent } from './components/flight-form/flight-form.component';
import { AddPersonModalComponent } from './components/add-person-modal/add-person-modal.component';
import { AddPassengerFormComponent } from './components/add-passenger-form/add-passenger-form.component';
import { PassengerSearchComponent } from './components/passenger-search/passenger-search.component';
import { SelectedPassengersService } from './share-data-services/selected-passenger.service';
import { ExplodeFlightDetalsComponent } from './components/flight-form/explode-flight-detals/explode-flight-detals.component';
import { ShareRequestIdService } from './share-data-services/share-requestId.service';
import { HotelFormComponent } from './components/hotel-form/hotel-form.component';
import { HotelPassengersComponent } from './components/hotel-passengers/hotel-passengers.component';
import { AddonsFormComponent } from './components/addons-form/addons-form.component';
import { AddonsModelComponent } from './components/addons-model/addons-model.component';
import { SharedModule } from 'app/shared/shared.module';
import { ServiceRequestIdLinesListComponent } from './components/service-request-id-lines-list/service-request-id-lines-list.component';
import { PackageFormComponent } from './components/packages/package-form/package-form.component';
import { PopoverModule } from 'ngx-smart-popover';
import { GetSrMailBoxComponent } from './components/flight-form/get-sr-mail-box/get-sr-mail-box.component';
import { TaskStatusConfigurationComponent } from './components/flight-form/task-status-configuration/task-status-configuration.component';
import { AllServiceRequestListComponent } from './components/all-service-request-list/all-service-request-list.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { SrSummaryDataService } from './share-data-services/srsummarydata.service';
import { ProductsNavigationsComponent } from './products-navigations/products-navigations.component';
import { TeamDataDataService } from './share-data-services/team-data.service';
import { PriceBreakupDeatilsComponent } from './components/flight-form/price-breakup-deatils/price-breakup-deatils.component';
import { DashboardRequestModule } from '../dashboard-request/dashboard-request.module';
import { PackageItineraryComponent } from './components/packages/package-itinerary/package-itinerary.component';
import { PackagePaxInfoComponent } from './components/packages/package-pax-info/package-pax-info.component';
import { ProductsDataService } from './share-data-services/products-data';
import { FlightSuggestionsListComponent } from './components/flight-form/flight-suggestions-list/flight-suggestions-list.component';
import { ActivitiesComponent } from './components/activities/activities.component';
import { SafeHtmlPipe, ServiceRequestCommunicationTimeLineComponent } from './components/service-request-communication-time-line/service-request-communication-time-line.component';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { ForexDecimalDirective } from './directives/forexdecimal.directive';
import { DynamicFormBuilderModule } from '../service-request/dynamic-form-builder/dynamic-form-builder.module';
import { PackageDynamicFormComponent } from './components/packages/package-dynamic-form/package-dynamic-form.component';
import { PolicyQualifyProcessStage1Component } from './components/policy-qualify-process-stage1/policy-qualify-process-stage1.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { PackageHolidayListviewComponent } from './components/packages/package-holiday-listview/package-holiday-listview.component';
import { PipeModule } from 'app/shared/pipes/pipe.module';
import { PreviewPackageHolidaysComponent } from './components/packages/preview-package-holidays/preview-package-holidays.component';
import { PackageSegmentDetailsComponent } from './components/packages/package-segment-details/package-segment-details.component';
import { ProductPricingComponent } from './components/product-pricing/product-pricing.component';
import { MultipleProductFormsComponent } from './components/product-pricing-multi-forms/multiple-product-forms/multiple-product-forms.component';
import { ProductPriceFlightFormComponent } from './components/product-pricing-multi-forms/product-price-flight-form/product-price-flight-form.component';
import { ProductPriceHotelFormComponent } from './components/product-pricing-multi-forms/product-price-hotel-form/product-price-hotel-form.component';


@NgModule({
  declarations: [
    DashboardBookingComponent,
    FlightFormComponent,
    AddPersonModalComponent,
    AddPassengerFormComponent,
    PassengerSearchComponent,
    ExplodeFlightDetalsComponent,
    HotelFormComponent,
    HotelPassengersComponent,
    AddonsFormComponent,
    AddonsModelComponent,
    ServiceRequestIdLinesListComponent,
    PackageFormComponent,
    GetSrMailBoxComponent,
    TaskStatusConfigurationComponent,
    AllServiceRequestListComponent,
    ProductsNavigationsComponent,
    PriceBreakupDeatilsComponent,
    PackageItineraryComponent,
    PackagePaxInfoComponent,
    FlightSuggestionsListComponent,
    ActivitiesComponent,
    SafeHtmlPipe,
    ServiceRequestCommunicationTimeLineComponent,
    ForexDecimalDirective,
    PackageDynamicFormComponent,
    PolicyQualifyProcessStage1Component,
    PackageHolidayListviewComponent,
    PreviewPackageHolidaysComponent,
    PackageSegmentDetailsComponent,
    ProductPricingComponent,
    MultipleProductFormsComponent,
    ProductPriceFlightFormComponent,
    ProductPriceHotelFormComponent
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    NgbDatepickerModule,
    NgbModule,
    GooglePlaceModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    FormsModule,
    DashboardBookingRoutingModule,
    SharedModule,
    PopoverModule,
    PipeModule,
    Ng2SearchPipeModule,
    DashboardRequestModule,
    DynamicFormBuilderModule,
    NgxSpinnerModule,
  ],
  exports: [
    DashboardBookingComponent,
    ProductsNavigationsComponent,
    // SrSummaryDataService,
  ],
  providers: [
    SelectedPassengersService,
    ShareRequestIdService,
    SrSummaryDataService,
    TeamDataDataService,
    ProductsDataService
  ],
})
export class DashboardBookingModule {}
export class NgbdDropdownForm {}
