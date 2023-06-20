import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'app/shared/auth/auth-guard.service';
import { PERMISSION_KEYS } from 'app/shared/data/app-premission-key';
import { ApprovedQuotesComponent } from './components/approved-quotes/approved-quotes.component';
import { MptbComponent } from './components/mptb/mptb.component';
import { OpenQuotesComponent } from './components/open-quotes/open-quotes.component';
import { SubmittedQuotesComponent } from './components/submitted-quotes/submitted-quotes.component';
import { AncillaryQuoteComponent } from './components/ancillary-quote/ancillary-quote.component';

const routes: Routes = [
  {
    path: 'open',
    component: OpenQuotesComponent,
    data: {
      title: 'Open Quotes List',
      pageKey: {
        pageId: PERMISSION_KEYS.QUOTES.QUOTES_OPEN_PAGE_NUMBER,
        key: PERMISSION_KEYS.QUOTES.QUOTES_OPEN_KEY,
      }
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'submitted',
    component: SubmittedQuotesComponent,
    data: {
      title: 'Submitted Quotes List',
      pageKey: {
        pageId: PERMISSION_KEYS.QUOTES.QUOTES_SENT_PAGE_NUMBER,
        key: PERMISSION_KEYS.QUOTES.QUOTES_SENT_KEY,
      }
    },
    canActivate: [AuthGuard],
  },

  {
    path: 'ancillary-quote',
    component: AncillaryQuoteComponent,
    data: {
      title: 'Ancillary Quotes',
      pageKey: {
        pageId: PERMISSION_KEYS.QUOTES.QUOTES_OPEN_PAGE_NUMBER,
        key: PERMISSION_KEYS.QUOTES.QUOTES_OPEN_KEY,
      }
    },
    canActivate: [AuthGuard]
  },
  {
    path: 'approved',
    component: ApprovedQuotesComponent,
    data: {
      title: 'Approved Quotes List',
      pageKey: {
        pageId: PERMISSION_KEYS.QUOTES.QUOTES_APPROVED_PAGE_NUMBER,
        key: PERMISSION_KEYS.QUOTES.QUOTES_APPROVED_KEY,
      }
    },
    canActivate: [AuthGuard],
  }/* ,
  {path:'mptb',
  component:MptbComponent,
  data: {
    title: 'MPTB',
    pageKey: {
      pageId: PERMISSION_KEYS.QUOTES.QUOTES_APPROVED_PAGE_NUMBER,
      key: PERMISSION_KEYS.QUOTES.QUOTES_APPROVED_KEY,
    }
  },
  canActivate: [AuthGuard],
} */
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuoteRoutingModule {}
