import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddPriceComponent } from './components/add-price/add-price.component';
import { AddPriceListComponent } from './components/add-price-list/add-price-list.component';
import { PERMISSION_KEYS } from 'app/shared/data/app-premission-key';
import { AuthGuard } from 'app/shared/auth/auth-guard.service';

const routes: Routes = [
  {
    path: 'add-price',
    component: AddPriceComponent,
    data: {
      title: 'Add Price',
      pageKey: {
        pageId: PERMISSION_KEYS.PACKAGEPRICE.CREATE_ADD_PACKAGE_PRICE_PAGE_NUMBER,
        key: PERMISSION_KEYS.PACKAGEPRICE.CREATE_ADD_PACKAGE_PRICE_KEY,
      }
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'add-price/:headerId',
    component: AddPriceComponent,
    data: {
      title: 'Edit Add Price',
      pageKey: {
        pageId: PERMISSION_KEYS.PACKAGEPRICE.CREATE_ADD_PACKAGE_PRICE_PAGE_NUMBER,
        key: PERMISSION_KEYS.PACKAGEPRICE.CREATE_ADD_PACKAGE_PRICE_KEY,
      }
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'price-list',
    component: AddPriceListComponent,
    data: {
      title: 'Price List',
      pageKey: {
        pageId: PERMISSION_KEYS.PACKAGEPRICE.CREATE_ADD_PACKAGE_PRICE_LIST_PAGE_NUMBER,
        key: PERMISSION_KEYS.PACKAGEPRICE.CREATE_ADD_PACKAGE_PRICE_LIST_KEY,
      }
    },
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PackagePriceRoutingModule {}
