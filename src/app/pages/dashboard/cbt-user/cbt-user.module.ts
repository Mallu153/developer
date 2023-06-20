import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CbtUserRoutingModule } from './cbt-user-routing.module';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { MybookingsComponent } from './component/mybookings/mybookings.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
//import { CashManagementModule } from '../cash-management/cash-management.module';
import { MyrequestsComponent } from './component/myrequests/myrequests.component';
import { MyrequestsbtnComponent } from './component/myrequestsbtn/myrequestsbtn.component';
import { DashboardRequestModule } from '../dashboard-request/dashboard-request.module';
import { MyquotesComponent } from './component/myquotes/myquotes.component';


@NgModule({
  declarations: [
    DashboardComponent,
    MybookingsComponent,
    MyrequestsComponent,
    MyrequestsbtnComponent,
    MyquotesComponent,

  ],
  imports: [
    CommonModule,
    CbtUserRoutingModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    NgxDatatableModule,
    //CashManagementModule,
    DashboardRequestModule
  ]
})
export class CbtUserModule { }
