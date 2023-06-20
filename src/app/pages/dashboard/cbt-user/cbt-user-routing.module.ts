import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'app/shared/auth/auth-guard.service';
import { PERMISSION_KEYS } from 'app/shared/data/app-premission-key';
import { DashboardComponent } from './component/dashboard/dashboard.component';

const routes: Routes = [
  {
    path:"dashboard",
    component:DashboardComponent,
    data: {
      title: 'CBT Dashboard',
      pageKey: {
        pageId: PERMISSION_KEYS.CBT_DASHBOARD.CBT_DASHBOARD_PAGE_KEY,
        key: PERMISSION_KEYS.CBT_DASHBOARD.CBT_DASHBOARD_KEY,
      }
    },
    canActivate: [AuthGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CbtUserRoutingModule { }
