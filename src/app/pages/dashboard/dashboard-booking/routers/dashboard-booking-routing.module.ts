import { ServiceRequestCommunicationTimeLineComponent } from './../components/service-request-communication-time-line/service-request-communication-time-line.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ActivitiesComponent } from '../components/activities/activities.component';
import { FlightFormComponent } from '../components/flight-form/flight-form.component';
import { HotelFormComponent } from '../components/hotel-form/hotel-form.component';
import { PackageFormComponent } from '../components/packages/package-form/package-form.component';
import { PackageItineraryComponent } from '../components/packages/package-itinerary/package-itinerary.component';
import { DashboardBookingComponent } from '../dashboard-booking.component';
import { AuthGuard } from 'app/shared/auth/auth-guard.service';
import { PERMISSION_KEYS } from 'app/shared/data/app-premission-key';
import { PackageHolidayListviewComponent } from '../components/packages/package-holiday-listview/package-holiday-listview.component';
import { PreviewPackageHolidaysComponent } from '../components/packages/preview-package-holidays/preview-package-holidays.component';



const routes: Routes = [
  {
    path: '',
    component: DashboardBookingComponent,
   /*  resolve: {
      resolvedData: SrDataResolverService,
    }, */
    children: [
      {
        path: 'flight',
        component: FlightFormComponent,

        data: {
          title: 'Flight Request ',
          pageKey: {
            pageId: PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_PAGE_NUMBER,
            key: PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_KEY,
          },
        },
        canActivate: [AuthGuard],
      },
      {
        path: 'flight/:id',
        component: FlightFormComponent,

        data: {
          title: 'Flight Request ',
          pageKey: {
            pageId: PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_PAGE_NUMBER,
            key: PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_KEY,
          },
        },
        canActivate: [AuthGuard],
      },
      {
        path: 'hotel',
        component: HotelFormComponent,

        data: {
          title: 'Hotel Request ',
          pageKey: {
            pageId: PERMISSION_KEYS.BOOKING.HOTEL.HOTEL_PAGE_NUMBER,
            key: PERMISSION_KEYS.BOOKING.HOTEL.HOTEL_KEY,
          },
        },
        canActivate: [AuthGuard],
      },
      {
        path: 'hotel/:id',
        component: HotelFormComponent,

        data: {
          title: 'Hotel Request ',
          pageKey: {
            pageId: PERMISSION_KEYS.BOOKING.HOTEL.HOTEL_PAGE_NUMBER,
            key: PERMISSION_KEYS.BOOKING.HOTEL.HOTEL_KEY,
          },
        },
        canActivate: [AuthGuard],
      },
      {
        path: 'holidays',
        component: PackageFormComponent,

        data: {
          title: 'Holidays Request ',
          pageKey: {
            pageId: PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_PAGE_NUMBER,
            key: PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_KEY,
          },
        },
        canActivate: [AuthGuard],
      },
      {
        path: 'holidays/:id',
        component: PackageFormComponent,

        data: {
          title: 'Holidays Request ',
          pageKey: {
            pageId: PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_PAGE_NUMBER,
            key: PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_KEY,
          },
        },
        canActivate: [AuthGuard],
      },
      {
        path: 'ancillary',

        data: {
          title: 'Request Ancillary ',
          pageKey: {
            pageId: PERMISSION_KEYS.BOOKING.ANCILLARY.ANCILLARY_PAGE_NUMBER,
            key: PERMISSION_KEYS.BOOKING.ANCILLARY.ANCILLARY_KEY,
          },
        },
        canActivate: [AuthGuard],

        //loadChildren: () => import('../../service-request/service-request.module').then((v) => v.ServiceRequestModule),
        loadChildren: async () => (await import('../../service-request/service-request.module')).ServiceRequestModule
      },
      {
        path: 'package-itinerary',
        component: PackageItineraryComponent,

        data: {
          title: 'Package Itinerary',
          pageKey: {
            pageId: PERMISSION_KEYS.BOOKING.PACKAGE_ITINERARY.PACKAGE_ITINERARY_PAGE_NUMBER,
            key: PERMISSION_KEYS.BOOKING.PACKAGE_ITINERARY.PACKAGE_ITINERARY_KEY,
          },
        },
        canActivate: [AuthGuard],
      },
      {
        path: 'activities',
        component: ActivitiesComponent,

        data: {
          title: 'Activities Request ',
          pageKey: {
            pageId: PERMISSION_KEYS.BOOKING.ACTIVITIES.ACTIVITIES_PAGE_NUMBER,
            key: PERMISSION_KEYS.BOOKING.ACTIVITIES.ACTIVITIES_KEY,
          },
        },
        canActivate: [AuthGuard],
      },
      {
        path: 'service-request-communication-time-line',
        component: ServiceRequestCommunicationTimeLineComponent,

        data: {
          title: 'Service Request Communication TimeLine',
          pageKey: {
            pageId: PERMISSION_KEYS.BOOKING.TIME_LINE.TIME_LINE_PAGE_NUMBER,
            key: PERMISSION_KEYS.BOOKING.TIME_LINE.TIME_LINE_KEY,
          },
        },
        canActivate: [AuthGuard],
      },

      {
        path: 'package-holidays-listview',
        component: PackageHolidayListviewComponent,

        data: {
          title: 'Package Holiday  List',
          pageKey: {
            pageId: PERMISSION_KEYS.REQUEST.CREATE_PACKAGE_REQUEST_LIST_PAGE_NUMBER,
            key: PERMISSION_KEYS.REQUEST.CREATE_PACKAGE_REQUEST_PAGE_KEY,
          },
        },
        canActivate: [AuthGuard],
      },
      {
        path: 'preview-package',
        component: PreviewPackageHolidaysComponent,

        data: {
          title: 'Package Holiday  List',
          pageKey: {
            pageId: PERMISSION_KEYS.REQUEST.CREATE_PACKAGE_REQUEST_LIST_PAGE_NUMBER,
            key: PERMISSION_KEYS.REQUEST.CREATE_PACKAGE_REQUEST_PAGE_KEY,
          },
        },
        canActivate: [AuthGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardBookingRoutingModule {}
