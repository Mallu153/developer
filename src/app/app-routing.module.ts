import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules, NoPreloading } from '@angular/router';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ContentLayoutComponent } from './layouts/content/content-layout.component';

import { DASHBOARD_ROUTES } from './pages/dashboard/dashboard.routes';
import { CONTENT_ROUTES } from './shared/routes/content-layout.routes';

import { AuthGuard } from './shared/auth/auth-guard.service';
import { APPROLES } from './shared/data/app-roles';
import { CustomPreloadingStrategyService } from './shared/services/custom-preloading-strategy.service';


const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'pages/login',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    data: {
     title: '',
    //allowedRoles: [APPROLES.ADMIN, APPROLES.CALLCENTERAGENT, APPROLES.SYSTEMADMIN, APPROLES.TRAVELAGENT],
    },
    children: DASHBOARD_ROUTES,
    //canActivate: [AuthGuard],
  },
  { path: '',
  component: ContentLayoutComponent,
   data: {
    title: ''
    //title: 'content Views'
  },
  children: CONTENT_ROUTES
},
  {
    path: '**',
    redirectTo: 'pages/error',
  },
];

@NgModule({
  imports: [
    //, { preloadingStrategy: CustomPreloadingStrategyService, relativeLinkResolution: 'legacy' }
    RouterModule.forRoot(appRoutes, { preloadingStrategy: NoPreloading, relativeLinkResolution: 'legacy' }),
  ],

  exports: [RouterModule],
})
export class AppRoutingModule {}
