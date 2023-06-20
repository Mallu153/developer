import { Injectable } from '@angular/core';
import { DashboardBookingAsyncService } from './dashboard-booking-async.service';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ServiceRequestLine } from '../../dashboard-request/model/service-request-line';
import { srsearchList_url } from '../../dashboard-request/url-constants/url-constants';


@Injectable({
  providedIn: 'root'
})


export class SrDataResolverService implements Resolve<ServiceRequestLine | null> {
  constructor(private dataService: DashboardBookingAsyncService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<ServiceRequestLine | null> {
    let id = route.queryParams?.requestId;
    // console.log('Resolving for person id:' + id);

    return this.dataService.fetchSrRequest(id);
  }
}


@Injectable({
  providedIn: 'root'
})


export class AllProductsDataResolverService implements Resolve<any | null> {
  constructor(private dataService: DashboardBookingAsyncService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<any | null> {
    let id = route.queryParams?.requestId;
    const REQUESTDATA = {
      serviceRequestNumber:id,
    };
    return this.dataService.fetchAllProductsList(REQUESTDATA,srsearchList_url.srsearchList);
  }
}

