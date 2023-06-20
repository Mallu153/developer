import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { ServiceRequestRoutingModule } from './service-request-routing.module';
import { ServiceRequestComponent } from './components/service-request/service-request.component';

import { ServiceRequestPricingComponent } from './components/service-request-pricing/service-request-pricing.component';
import { ServiceRequestPricingTaxDetailsComponent } from './components/service-request-pricing/service-request-pricing-tax-details/service-request-pricing-tax-details.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { DynamicFormBuilderModule } from './dynamic-form-builder/dynamic-form-builder.module';
import { ServiceRequestAttachmentsComponent } from './components/service-request/service-request-attachments/service-request-attachments.component';
import { ServiceRequestPaymentComponent } from './components/service-request-payment/service-request-payment.component';
import { ServiceRequestPaymentReceiptComponent } from './components/service-request-payment-receipt/service-request-payment-receipt.component';
import { ServiceRequestSharingModule } from '../service-request-sharing/service-request-sharing.module';
import { DashboardBookingModule } from '../dashboard-booking/dashboard-booking.module';
import { SelectedPassengersService } from '../dashboard-booking/share-data-services/selected-passenger.service';
import { AncillaryAddonsComponent } from './components/service-request/ancillary-addons/ancillary-addons.component';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [
    ServiceRequestComponent,
    ServiceRequestPricingComponent,
    ServiceRequestPricingTaxDetailsComponent,
    ServiceRequestAttachmentsComponent,
    ServiceRequestPaymentComponent,
    ServiceRequestPaymentReceiptComponent,
    AncillaryAddonsComponent,
  ],
  imports: [
    CommonModule,
    ServiceRequestRoutingModule,
    DynamicFormBuilderModule,
    NgbModule,
    FormsModule,
    NgSelectModule,
    ReactiveFormsModule,
    ServiceRequestSharingModule,
    DashboardBookingModule
  ],
  providers: [
    SelectedPassengersService,
    DatePipe
  ],
})
export class ServiceRequestModule {}
