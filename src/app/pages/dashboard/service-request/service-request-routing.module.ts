import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServiceRequestComponent } from './components/service-request/service-request.component';
import { SERVICE_REQUEST } from 'app/shared/routing-constants/service-request';
import { ServiceRequestPaymentComponent } from './components/service-request-payment/service-request-payment.component';
import { ServiceRequestPaymentReceiptComponent } from './components/service-request-payment-receipt/service-request-payment-receipt.component';
import { AuthGuard } from 'app/shared/auth/auth-guard.service';
import { PERMISSION_KEYS } from 'app/shared/data/app-premission-key';

const routes: Routes = [
  {
    path: '',
    component: ServiceRequestComponent,

    data: {
      title: 'Request Ancillary',
      pageKey: {pageId: PERMISSION_KEYS.BOOKING.ANCILLARY.ANCILLARY_PAGE_NUMBER, key:  PERMISSION_KEYS.BOOKING.ANCILLARY.ANCILLARY_KEY}

    }
    //canActivateChild: [AuthGuard],
   /*  children: [
      {
        path: '',
        component: ServiceRequestComponent,
        data: {
          title: 'Request Ancillary',

        },
      },
      {
        path: SERVICE_REQUEST.SERVICE_REQUEST_DYNAMIC_UPDATE,
        component: ServiceRequestComponent,
        data: {
          title: 'Service'
        },
      },
      {
        path: SERVICE_REQUEST.SERVICE_REQUEST_PAYMENT,
        component: ServiceRequestPaymentComponent,
        data: {
          title: 'Service Request Payment',
        },
      },
      {
        path: SERVICE_REQUEST.SERVICE_REQUEST_RECEIPT,
        component: ServiceRequestPaymentReceiptComponent,
        data: {
          title: 'Service Request Receipt',
        },
      },
    ], */
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServiceRequestRoutingModule {}
