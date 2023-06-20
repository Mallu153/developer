import { RTCHeaderComponent } from './components/r-t-c-header/r-t-c-header.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CorporateToRetailComponent } from './components/corporate-to-retail/corporate-to-retail.component';
import { RetailToCorporateComponent } from './components/retail-to-corporate/retail-to-corporate.component';
import { HeaderFormComponent } from './components/header-form/header-form.component';
import { PERMISSION_KEYS } from 'app/shared/data/app-premission-key';
import { AuthGuard } from 'app/shared/auth/auth-guard.service';

const routes: Routes = [
  {
    path: 'corporate-to-retail',
    component: CorporateToRetailComponent,
    data: {
      title: 'Corporate To Retail',
      pageKey: {
        pageId: PERMISSION_KEYS.ADJUSTMENTS.CORPORATE_TO_RETAIL_PAGE_NUMBER,
        key: PERMISSION_KEYS.ADJUSTMENTS.CORPORATE_TO_RETAIL_KEY,
      }
    },
    canActivate: [AuthGuard],

  },
  {
    path: 'retail-to-corporate',
     component: RetailToCorporateComponent,
     data: {
      title: ' Retail To Corporate ',
      pageKey: {
        pageId: PERMISSION_KEYS.ADJUSTMENTS.RETAIL_TO_CORPORATE_PAGE_NUMBER,
        key: PERMISSION_KEYS.ADJUSTMENTS.RETAIL_TO_CORPORATE_KEY,
      }
    },
    canActivate: [AuthGuard],
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdjRoutingModule { }
