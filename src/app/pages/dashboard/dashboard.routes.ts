import { Routes } from '@angular/router';
import { AuthGuard } from 'app/shared/auth/auth-guard.service';

//Route for content layout with sidebar, navbar and footer.

export const DASHBOARD_ROUTES: Routes = [
  {
    path: 'home',
    //loadChildren: () => import('../../page/page.module').then((m) => m.PageModule),
    loadChildren: async () => (await import('../../page/page.module')).PageModule
  },
  {
    path: 'request',
    data: { preload: true },
    //loadChildren: () => import('./dashboard-request/dashboard-request.module').then((m) => m.DashboardRequestModule),
    loadChildren: async () => (await import('./dashboard-request/dashboard-request.module')).DashboardRequestModule
  },
  {
    path: 'booking',
    data: { preload: true },
    // loadChildren: () => import('./dashboard-booking/dashboard-booking.module').then((m) => m.DashboardBookingModule),
    loadChildren: async () => (await import('./dashboard-booking/dashboard-booking.module')).DashboardBookingModule
  },
  {
    path: 'cash-management',
    data: { preload: true },
    //loadChildren: () => import('./cash-management/cash-management.module').then((m) => m.CashManagementModule),
    loadChildren: async () => (await import('./cash-management/cash-management.module')).CashManagementModule
  },
  {
    path: 'rfq',
    data: { preload: true },
    //loadChildren: () => import('./rfq/rfq.module').then((m) => m.RfqModule),
    loadChildren: async () => (await import('./rfq/rfq.module')).RfqModule
  },
  {
    path: 'quotes',
    data: { preload: true },
    //loadChildren: () => import('./quote/quote.module').then((m) => m.QuoteModule),
    loadChildren: async () => (await import('./quote/quote.module')).QuoteModule
  },
  {
    path: 'reports',
    data: { preload: true },
    //loadChildren: () => import('./sr-reports/sr-reports.module').then((m) => m.SrReportsModule),
    loadChildren: async () => (await import('./sr-reports/sr-reports.module')).SrReportsModule
  },
  {
    path: 'adj',
    data: { preload: true },
    //loadChildren: () => import('./adj/adj.module').then((m) => m.AdjModule),
    loadChildren: async () => (await import('./adj/adj.module')).AdjModule
  },
  {
    path: 'amendments',
    data: { preload: true },
    //loadChildren: () => import('./amendments/amendments.module').then((m) => m.AmendmentsModule),
    loadChildren: async () => (await import('./amendments/amendments.module')).AmendmentsModule
  },
  {
    path:'packages',
    data:{preload: true },
    //loadChildren:()=> import('./package-price/package-price.module').then((m)=>m.PackagePriceModule)
    loadChildren: async () => (await import('./package-price/package-price.module')).PackagePriceModule
  },
  {
    path:'cbt',
    data:{preload: true },
    //loadChildren:()=> import('./cbt-user/cbt-user.module').then((m)=>m.CbtUserModule)
    loadChildren: async () => (await import('./cbt-user/cbt-user.module')).CbtUserModule
  },

];
