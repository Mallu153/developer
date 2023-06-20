import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'app/shared/auth/auth-guard.service';
import { PERMISSION_KEYS } from 'app/shared/data/app-premission-key';
import { AncillaryRfqComponent } from './components/ancillary-rfq/ancillary-rfq.component';
import { AncillaryRfqsAwtResponsesComponent } from './components/ancillary-rfq/ancillary-rfqs-awt-responses/ancillary-rfqs-awt-responses.component';
import { AttractionsRfqSupplierMappingFormComponent } from './components/attractions-rfq/attractions-rfq-supplier-mapping-form/attractions-rfq-supplier-mapping-form.component';
import { RfqAttractionsAwtResponsesComponent } from './components/attractions-rfq/rfq-attractions-awt-responses/rfq-attractions-awt-responses.component';
import { FlightRfqComponent } from './components/flight-rfq/flight-rfq.component';
import { HotelRfqComponent } from './components/hotel-rfq/hotel-rfq.component';
import { HotelRfqsAwtResponsesComponent } from './components/hotel-rfq/hotel-rfqs-awt-responses/hotel-rfqs-awt-responses.component';
import { OpenRfqsListComponent } from './components/open-rfqs-list/open-rfqs-list.component';
import { PackageRfqComponent } from './components/package-rfq/package-rfq.component';
import { RfqListComponent } from './components/rfq-list/rfq-list.component';
import { SubmittedRfqsListComponent } from './components/submitted-rfqs-list/submitted-rfqs-list.component';
import { SupplierInformationComponent } from './components/supplier-information/supplier-information.component';

const routes: Routes = [
  {
    path: 'product-based-list',
    component: RfqListComponent,
    data: {
      title: 'RFQ List',
      pageKey: {
        pageId: PERMISSION_KEYS.RFQ.RFQ_LIST_PAGE_NUMBER,
        key: PERMISSION_KEYS.RFQ.RFQ_LIST_KEY,
      },
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'flight',
    component: FlightRfqComponent,
    data: {
      title: 'Flight RFQ Request',
      pageKey: {
        pageId: PERMISSION_KEYS.RFQ_FLIGHT_SUPPLIER_MAPPING_REQUEST.RFQ_FLIGHT_SUPPLIER_MAPPING_REQUEST_PAGE_KEY,
        key: PERMISSION_KEYS.RFQ_FLIGHT_SUPPLIER_MAPPING_REQUEST.RFQ_FLIGHT_SUPPLIER_MAPPING_REQUEST_KEY,
      },
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'hotel',
    component: HotelRfqComponent,
    data: {
      title: 'Hotel RFQ Request',
      pageKey: {
        pageId: PERMISSION_KEYS.RFQ_HOTEL_SUPPLIER_MAPPING_REQUEST.RFQ_HOTEL_SUPPLIER_MAPPING_REQUEST_PAGE_KEY,
        key: PERMISSION_KEYS.RFQ_HOTEL_SUPPLIER_MAPPING_REQUEST.RFQ_HOTEL_SUPPLIER_MAPPING_REQUEST_KEY,
      },
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'supplier-information',
    component: SupplierInformationComponent,
    data: {
      title: 'Flight RFQ List',
      pageKey: {
        pageId: PERMISSION_KEYS.RFQ.RFQ_FLIGHT_LIST_PAGE_NUMBER,
        key: PERMISSION_KEYS.RFQ.RFQ_FLIGHT_LIST_KEY,
      },
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'hotel-rfqs-awt-response',
    component: HotelRfqsAwtResponsesComponent,
    data: {
      title: 'Hotel RFQ List',
      pageKey: {
        pageId: PERMISSION_KEYS.RFQ.RFQ_HOTEL_LIST_PAGE_NUMBER,
        key: PERMISSION_KEYS.RFQ.RFQ_HOTEL_LIST_KEY,
      },
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'open',
    component: OpenRfqsListComponent,
    data: {
      title: 'Open RFQ List',
      pageKey: {
        pageId: PERMISSION_KEYS.RFQ.RFQ_OPEN_LIST_PAGE_NUMBER,
        key: PERMISSION_KEYS.RFQ.RFQ_OPEN_LIST_KEY,
      },
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'submitted',
    component: SubmittedRfqsListComponent,
    data: {
      title: 'Submitted RFQ List',
      pageKey: {
        pageId: PERMISSION_KEYS.RFQ.RFQ_SUBMITTED_LIST_PAGE_NUMBER,
        key: PERMISSION_KEYS.RFQ.RFQ_SUBMITTED_LIST_KEY,
      },
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'ancillary',
    component: AncillaryRfqComponent,
    data: {
      title: 'Ancillary RFQ Request',
      pageKey: {
        pageId: PERMISSION_KEYS.RFQ_ANCILLARY_SUPPLIER_MAPPING_REQUEST.RFQ_ANCILLARY_SUPPLIER_MAPPING_REQUEST_PAGE_KEY,
        key: PERMISSION_KEYS.RFQ_ANCILLARY_SUPPLIER_MAPPING_REQUEST.RFQ_ANCILLARY_SUPPLIER_MAPPING_REQUEST_KEY,
      },
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'activities',
    component: AttractionsRfqSupplierMappingFormComponent,
    data: {
      title: 'Activities RFQ Request',
      pageKey: {
        pageId: PERMISSION_KEYS.RFQ_ACTIVITIES_SUPPLIER_MAPPING_REQUEST.RFQ_ACTIVITIES_SUPPLIER_MAPPING_REQUEST_PAGE_KEY,
        key: PERMISSION_KEYS.RFQ_ACTIVITIES_SUPPLIER_MAPPING_REQUEST.RFQ_ACTIVITIES_SUPPLIER_MAPPING_REQUEST_KEY,
      },
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'ancillary-rfqs-awt-response',
    component: AncillaryRfqsAwtResponsesComponent,
    data: {
      title: 'Ancillary RFQ List',
      pageKey: {
        pageId: PERMISSION_KEYS.RFQ.RFQ_ANCILLARY_LIST_PAGE_NUMBER,
        key: PERMISSION_KEYS.RFQ.RFQ_ANCILLARY_LIST_KEY,
      },
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'attractions-awt-response',
    component: RfqAttractionsAwtResponsesComponent,
    data: {
      title: 'Attractions RFQ List',
      pageKey: {
        pageId: PERMISSION_KEYS.RFQ.RFQ_ATTRACTIONS_LIST_PAGE_NUMBER,
        key: PERMISSION_KEYS.RFQ.RFQ_ATTRACTIONS_LIST_KEY,
      },
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'package-rfq',
    component: PackageRfqComponent,
    data: {
      title: 'Package RFQ List',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RfqRoutingModule {}
