import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription, fromEvent } from 'rxjs';
import { debounceTime, takeUntil, throttleTime } from 'rxjs/operators';
import { DashboardRequestService } from '../../../services/dashboard-request.service';
import { Holiday_Package, packageHolidayListView } from '../../../url-constants/url-constants';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-open-request-listpopup',
  templateUrl: './open-request-listpopup.component.html',
  styleUrls: ['./open-request-listpopup.component.scss'],
})
export class OpenRequestListpopupComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  packageHolidayList: any;

  myDataAttribute: string;
  isFlightSelected: boolean = true;
  isHotelSelected: boolean = true;
  isActivitiesSelected: boolean = true;
  isAncillarySelected: boolean = true;
  isAllSelected: boolean = true;

  scrollClass: string;

  dayCountList = [];

  daysActive = [];

  rfqBtn = false;

  flightDetailsList = [];

  /*   items = [
    { name: 'item1', value: 10 ,id:1,price :200 },
    { name: 'item2', value: 20 ,id:1,price :400},
    { name: 'item3', value: 20 ,id:2,price :300},
    { name: 'item4', value: 30 ,id:3,price :500},
    { name: 'item5', value: 40 ,id:1,price :200},
    { name: 'item6', value: 40 ,id:1,price :200}
  ]; */

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private toastrService: ToastrService,
    private dashboardRequestService: DashboardRequestService
  ) {}

  ngOnInit(): void {
    this.getQueryParams();
  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }

  getQueryParams() {
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param && param.requestId) {
        this.getPackageHolidayListView(Number(param.requestId));
        this.getSegmentDetails(Number(param.requestId));
      }
      if (param && param.productsAvailability) {
        this.rfqBtn = true;
      }
    });
  }
  getPackageHolidayListView(requestNumber: number) {
    this.dashboardRequestService
      .getpackageHolidayListView(requestNumber, packageHolidayListView.searchSrPackage)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (res: any) => {
          if (res?.packageHeader) {

            this.packageHolidayList = res;

            this.dayCountList = new Array(this.packageHolidayList?.packageHeader?.totalNoOfDays);
            //this.getDataAttribute('all');
            this.cdr.markForCheck();
          }
        },
        (error) => {
          this.toastrService.error('oops something  went wrong  please try again', 'Error');
          this.cdr.markForCheck();
        }
      );
  }

  getSegmentDetails(srId: number) {
    this.dashboardRequestService
      .getPackageRequest(Holiday_Package.getPackageRequest, srId)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (requestResponse: any) => {
          if (requestResponse?.length > 0) {
            this.flightDetailsList = requestResponse;
          }
        },
        (error) => {
          if (error == null || error == '') {
            this.toastrService.error('oops something  went wrong  please try again', 'Error');
          } else {
            this.toastrService.error(error, 'Error');
          }
        }
      );
  }

  getDataAttribute(category: string) {
    this.daysActive = [];
    switch (category) {
      case 'flight':
        this.isFlightSelected = true;
        this.isHotelSelected = false;
        this.isActivitiesSelected = false;
        this.isAncillarySelected = false;
        this.isAllSelected = false;
        break;
      case 'hotel':
        this.isHotelSelected = true;
        this.isActivitiesSelected = false;
        this.isFlightSelected = false;
        this.isAncillarySelected = false;
        this.isAllSelected = false;
        break;
      case 'activities':
        this.isActivitiesSelected = true;
        this.isHotelSelected = false;
        this.isFlightSelected = false;
        this.isAncillarySelected = false;
        this.isAllSelected = false;

        break;
      case 'ancillary':
        this.isAncillarySelected = true;
        this.isActivitiesSelected = false;
        this.isHotelSelected = false;
        this.isFlightSelected = false;
        this.isAllSelected = false;

        break;
      default:
        this.isAllSelected = true;
        this.isFlightSelected = true;
        this.isHotelSelected = true;
        this.isActivitiesSelected = true;
        this.isAncillarySelected = true;

        break;
    }
  }

  scrollToElementById(id: string) {
    const element = this.__getElementById(id);
    this.scrollToElement(element);
  }
  private __getElementById(id: string): HTMLElement {
    //console.log("element id : ", id);
    // const element = <HTMLElement>document.querySelector(`#${id}`);
    const element = document.getElementById(id);
    return element;
  }

  scrollToElement(element: HTMLElement) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
  scrollToId(day: string, dayNumber: number) {
    //console.log(day+'_'+dayNumber);
    //console.log("element id : ", day+'_'+dayNumber);
    this.daysActive = [];
    this.daysActive[dayNumber - 1] = false;
    this.scrollToElementById(day + '_' + dayNumber);
    this.daysActive[dayNumber] = true;

    this.scrollClass = day + '_' + dayNumber;

    setTimeout(() => {
      this.scrollClass = '';
    }, 1000);
  }

  redirectedToItineraryRFQ() {
    const contactId = this.route.snapshot.queryParams.contactId;
    const requestId = this.route.snapshot.queryParams.requestId;
    const holidaysLineId = this.route.snapshot.queryParams.holidaysLineId;
    const productsAvailability = this.route.snapshot.queryParams.productsAvailability;
    if (requestId && holidaysLineId && contactId) {
      const queryParams = {
        requestId: requestId,
        contactId: contactId,
        holidaysLineId: holidaysLineId,
        from: 'package',
        actionType: 'rfq',
        productsAvailability: productsAvailability,
      };
      const PACKAGEITINERARY_URL = this.router
        .createUrlTree(['/dashboard/booking/package-itinerary'], { queryParams })
        .toString();
      window.open(PACKAGEITINERARY_URL, '_blank');
    }
  }

  trackByFn(index, item) {
    return index;
  }

  trackByFnFlight(index, item) {
    return index;
  }

  trackByDayCountFn(index, item) {
    return index;
  }

  trackByTableFn(index, item) {
    return index;
  }


  offline(requestno:number,requestLineNo:number,productName:string) {
    let requestId = requestno;
    let reqLineId = requestLineNo;
    let product = productName.toLowerCase();
    if(product==='attractions'){
      product=productName.toLowerCase().replace("s", "");
    }else{
      product= productName.toLowerCase();
    }

    if(requestId&&reqLineId&&product){
      const offlineUrl = `${environment.RFQREDIRECTOFFLINE}redirect?sr_no=${requestId}&sr_line_no=${reqLineId}&product=${product}&channel=offline`;
      console.log(offlineUrl);

      window.open(offlineUrl, '_blank');
    }

  }
  Online(requestno:number,requestLineNo:number,productName:string) {
    let requestId = requestno;
    let reqLineId = requestLineNo;
    let product = productName.toLowerCase();


    if(requestId&&reqLineId&&product){
      const onlineUrl = `${environment.RFQREDIRECTOFFLINE}redirect?sr_no=${requestId}&sr_line_no=${reqLineId}&product=${product}&channel=online`;
      window.open(onlineUrl, '_blank');
    }
  }
  mptb(requestno:number,requestLineNo:number,productName:string) {
    let requestId = requestno;
    let reqLineId = requestLineNo;
    let product = productName.toLowerCase( ) ;
    if(requestId&&reqLineId&&product){
      //const onlineUrl = `${environment.RFQREDIRECTOFFLINE}redirect?sr_no=${requestId}&sr_line_no=${reqLineId}&product=${product}&channel=mptb`;
      const onlineUrl = `${environment.RFQREDIRECTOFFLINE}redirect?sr_no=${requestId}&sr_line_no=${reqLineId}&product=flight&channel=flight_offers`;
      window.open(onlineUrl, '_blank');
    }
  }


  navigatedToPackageEditMode() {
    const contactId = this.route.snapshot.queryParams.contactId;
    const requestId = this.route.snapshot.queryParams.requestId;
    const holidaysLineId = this.route.snapshot.queryParams.holidaysLineId;

    if (requestId && holidaysLineId && contactId) {
      const queryParams = {
        requestId: requestId,
        contactId: contactId,
        holidaysLineId: holidaysLineId
      };
      this.router.navigate(['/dashboard/booking/holidays'], { queryParams });
    }


  }




}
