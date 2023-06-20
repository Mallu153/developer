
import { AllServiceRequestsComponent } from './../components/all-service-requests/all-service-requests.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PaxSearchComponent } from '../components/pax-search/pax-search.component';
import { PaxComponent } from '../components/pax/pax.component';
import { SearchResultComponent } from '../components/search-result/search-result.component';
import { DashboardRequestComponent } from '../dashboard-request.component';
import { ContactComponent } from '../components/contact/contact.component';
import { PackageRequestListComponent } from '../components/package-request-list/package-request-list.component';
import { AuthGuard } from 'app/shared/auth/auth-guard.service';
import { PERMISSION_KEYS } from 'app/shared/data/app-premission-key';

const routes: Routes = [
  {
    path: '',
    component: DashboardRequestComponent,
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'pax-search',
        component: PaxSearchComponent,
        data: {
          title: 'Pax Search',
          pageKey: {pageId: PERMISSION_KEYS.REQUEST.CREATE_REQUEST_PAGE_NUMBER, key: PERMISSION_KEYS.REQUEST.CREATE_REQUEST_PAGE_KEY}
          },
      },
      {
        path: 'new-create-pax',
        component: PaxComponent,
        data: {
          title: 'Create Pax',
          pageKey: {pageId: PERMISSION_KEYS.REQUEST.NEW_CREATE_PAX_PAGE_NUMBER, key: PERMISSION_KEYS.REQUEST.NEW_CREATE_PAX_KEY}
           },
      },
      {
        path: 'search-result',
        component: SearchResultComponent,
        data: {
          title: 'Pax Search Result',
          pageKey: {pageId: PERMISSION_KEYS.REQUEST.PAX_SEARCH_PAGE_NUMBER, key: PERMISSION_KEYS.REQUEST.PAX_SEARCH_KEY}
           },
      },
      {
        path: 'contact',
        component: ContactComponent,
        data: {
          title: 'Create Contact',
          pageKey: {pageId: PERMISSION_KEYS.REQUEST.NEW_CREATE_CONTACT_PAGE_NUMBER, key: PERMISSION_KEYS.REQUEST.NEW_CREATE_CONTACT_KEY}
           },
      }
    ],
  },
  {
    path: 'all-service-requests',
    component: AllServiceRequestsComponent,

    data: {
      title: 'All Service Requests',
      pageKey: {pageId: PERMISSION_KEYS.REQUEST.CREATE_REQUEST_LIST_PAGE_NUMBER, key: PERMISSION_KEYS.REQUEST.CREATE_REQUEST_LIST_PAGE_KEY}
       },
       canActivate: [AuthGuard],
  },
  {
    path:'package-request-list',
    component:PackageRequestListComponent,

    data: {
      title: 'Package Request List',
      pageKey: {pageId: PERMISSION_KEYS.REQUEST.CREATE_PACKAGE_REQUEST_LIST_PAGE_NUMBER, key: PERMISSION_KEYS.REQUEST.CREATE_PACKAGE_REQUEST_PAGE_KEY}
       },
       canActivate: [AuthGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRequestRoutingModule { }
