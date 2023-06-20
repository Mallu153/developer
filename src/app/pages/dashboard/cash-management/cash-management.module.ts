import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CashManagementRoutingModule } from './cash-management-routing.module';
import { CashDashboardComponent } from './components/cash-dashboard/cash-dashboard.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CashTransferAgentToAgentComponent } from './components/cash-transfer-agent-to-agent/cash-transfer-agent-to-agent.component';
import { CashWithdrawlBankToAgentComponent } from './components/cash-withdrawl-bank-to-agent/cash-withdrawl-bank-to-agent.component';
import { CashDepositAgentToBankComponent } from './components/cash-deposit-agent-to-bank/cash-deposit-agent-to-bank.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CashTransferApprovalComponent } from './components/cash-transfer-approval/cash-transfer-approval.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { SharedModule } from 'app/shared/shared.module';
import { AgentCashListComponent } from './components/agent-cash-list/agent-cash-list.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AgentLiabilityListComponent } from './components/agent-liability-list/agent-liability-list.component';

import { NgbModalModule, NgbDatepickerModule, NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { RequestsCalendarComponent } from './components/requests-calendar/requests-calendar.component';
import { BookingsDashboardComponent } from './components/bookings-dashboard/bookings-dashboard.component';
import { QuoteAgeingComponent } from './components/dashboard-widgets/quote-ageing/quote-ageing.component';
import { NotIssuedVourcherComponent } from './components/dashboard-widgets/not-issued-vourcher/not-issued-vourcher.component';
import { ReceiptPaymentComponent } from './components/dashboard-widgets/receipt-payment/receipt-payment.component';
import { QuotesDashboardComponent } from './components/quotes-dashboard/quotes-dashboard.component';
import { QuoteAddedReportsComponent } from './components/quote-added-reports/quote-added-reports.component';
import { QuoteApprovedNotFulfilledReportsComponent } from './components/quote-approved-not-fulfilled-reports/quote-approved-not-fulfilled-reports.component';
import { QuoteCountReportComponent } from './components/quote-count-report/quote-count-report.component';
import { QuoteNotFulfilledComponent } from './components/quote-not-fulfilled/quote-not-fulfilled.component';
import { QuoteSentNotApprovedReportsComponent } from './components/quote-sent-not-approved-reports/quote-sent-not-approved-reports.component';

@NgModule({
  declarations: [
    CashDashboardComponent,
    CashTransferAgentToAgentComponent,
    CashWithdrawlBankToAgentComponent,
    CashDepositAgentToBankComponent,
    CashTransferApprovalComponent,
    AgentCashListComponent,
    AgentLiabilityListComponent,
    RequestsCalendarComponent,
    BookingsDashboardComponent,
    QuoteAgeingComponent,
    NotIssuedVourcherComponent,
    ReceiptPaymentComponent,
    QuotesDashboardComponent,
    QuoteAddedReportsComponent,
    QuoteApprovedNotFulfilledReportsComponent,
    QuoteCountReportComponent,
    QuoteNotFulfilledComponent,
    QuoteSentNotApprovedReportsComponent,
  ],
  imports: [
    CommonModule,
    CashManagementRoutingModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    Ng2SearchPipeModule,
    NgxDatatableModule,
    SharedModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    NgbModalModule,
    NgbDatepickerModule,
    NgbTimepickerModule,
  ],
  exports: [RequestsCalendarComponent],
})
export class CashManagementModule {}
