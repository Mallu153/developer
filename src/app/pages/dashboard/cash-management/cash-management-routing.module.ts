import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'app/shared/auth/auth-guard.service';
import { PERMISSION_KEYS } from 'app/shared/data/app-premission-key';
import { AgentCashListComponent } from './components/agent-cash-list/agent-cash-list.component';
import { AgentLiabilityListComponent } from './components/agent-liability-list/agent-liability-list.component';
import { CashDashboardComponent } from './components/cash-dashboard/cash-dashboard.component';
import { CashDepositAgentToBankComponent } from './components/cash-deposit-agent-to-bank/cash-deposit-agent-to-bank.component';
import { CashTransferAgentToAgentComponent } from './components/cash-transfer-agent-to-agent/cash-transfer-agent-to-agent.component';
import { CashTransferApprovalComponent } from './components/cash-transfer-approval/cash-transfer-approval.component';
import { CashWithdrawlBankToAgentComponent } from './components/cash-withdrawl-bank-to-agent/cash-withdrawl-bank-to-agent.component';
import { BookingsDashboardComponent } from './components/bookings-dashboard/bookings-dashboard.component';
import { QuotesDashboardComponent } from './components/quotes-dashboard/quotes-dashboard.component';

const routes: Routes = [
  {
    path: 'cash-dashboard',
    component: CashDashboardComponent,
    data: {
      title: 'Cash Dashboard',
      pageKey: { pageId: PERMISSION_KEYS.DASHBOARD.AGENT_PAGE_KEY, key: PERMISSION_KEYS.DASHBOARD.AGENT_KEY },
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'bookings-dashboard',
    component: BookingsDashboardComponent,
    data: {
      title: 'Bookings  Dashboard',
      pageKey: { pageId: PERMISSION_KEYS.DASHBOARD.AGENT_PAGE_KEY, key: PERMISSION_KEYS.DASHBOARD.AGENT_KEY },
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'quotes-dashboard',
    component: QuotesDashboardComponent,
    data: {
      title: 'Quotes  Dashboard',
      pageKey: { pageId: PERMISSION_KEYS.DASHBOARD.AGENT_PAGE_KEY, key: PERMISSION_KEYS.DASHBOARD.AGENT_KEY },
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'cash-transfer-agent-to-agent',
    component: CashTransferAgentToAgentComponent,
    data: {
      title: 'Cash Transfer Agent To Agent',
    },
  },
  {
    path: 'cash-withdraw-bank-to-agent',
    component: CashWithdrawlBankToAgentComponent,
    data: {
      title: 'Cash Withdraw Bank To Agent',
    },
  },
  {
    path: 'cash-deposit-agent-to-bank',
    component: CashDepositAgentToBankComponent,
    data: {
      title: 'Cash Deposit Agent To Bank',
    },
  },
  {
    path: 'cash-transfer-approval',
    component: CashTransferApprovalComponent,
    data: {
      title: 'Cash Transfer Approval',
    },
  },
  {
    path: 'agent-cash',
    component: AgentCashListComponent,
    data: {
      title: 'Agent Cash',
    },
  },
  {
    path: 'agent-liability',
    component: AgentLiabilityListComponent,
    data: {
      title: 'Agent Liability',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CashManagementRoutingModule {}
