import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'app/shared/auth/auth-guard.service';
import { PERMISSION_KEYS } from 'app/shared/data/app-premission-key';
import { BookingDetailsMicroAccountDataComponent } from './components/booking-details-micro-account-data/booking-details-micro-account-data.component';

import { BookingSearchComponent } from './components/booking-search/booking-search.component';
import { SrSummaryComponent } from './components/sr-summary/sr-summary.component';
import { BookingSearchSupplierReferenceComponent } from './components/booking-search-supplier-reference/booking-search-supplier-reference.component';

const routes: Routes = [
  {
    path:'booking',
    component:BookingSearchComponent,
    data: {
      title: 'Booking List',
      pageKey: {
        pageId: PERMISSION_KEYS.REPORTS.BOOKING_REPORT_PAGE_NUMBER,
        key: PERMISSION_KEYS.REPORTS.BOOKING_REPORT_KEY,
      }
    },
    canActivate: [AuthGuard],
  },
  {
    path:'booking/:view',
     component:BookingSearchComponent,
     data: {
      title: 'Booking List',
      pageKey: {
        pageId: PERMISSION_KEYS.REPORTS.BOOKING_REPORT_PAGE_NUMBER,
        key: PERMISSION_KEYS.REPORTS.BOOKING_REPORT_KEY,
      }
    },
    canActivate: [AuthGuard],
    },
  {
    path:'sr-summary-list',
    component:SrSummaryComponent,
    data: {
      title: 'Sr Summary List',
      pageKey: {
        pageId: PERMISSION_KEYS.REPORTS.SR_SUMMARY_PAGE_NUMBER,
        key: PERMISSION_KEYS.REPORTS.SR_SUMMARY_KEY,
      }
    },
    canActivate: [AuthGuard],
  },
  {
    path:'micro-account-view',
    component:BookingDetailsMicroAccountDataComponent,
    data: {
      title: 'Micro Account',
      pageKey: {
        pageId: PERMISSION_KEYS.REPORTS.MICRO_ACCOUNT_PAGE_NUMBER,
        key: PERMISSION_KEYS.REPORTS.MICRO_ACCOUNT_KEY,
      }
    },
    canActivate: [AuthGuard],
  },
  {
    path:'booking-by-supplier-reference/:view',
     component:BookingSearchSupplierReferenceComponent,
     data: {
      title: 'Retail Booking List',
      pageKey: {
        pageId: PERMISSION_KEYS.REPORTS.RETAIL_BOOKING_REPORT_PAGE_NUMBER,
        key: PERMISSION_KEYS.REPORTS.RETAIL_BOOKING_REPORT_KEY,
      }
    },
    canActivate: [AuthGuard],
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SrReportsRoutingModule { }
