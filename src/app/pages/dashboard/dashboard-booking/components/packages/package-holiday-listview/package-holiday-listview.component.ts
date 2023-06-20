import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DashboardRequestService } from 'app/pages/dashboard/dashboard-request/services/dashboard-request.service';
import { packageHolidayListView, Holiday_Package } from 'app/pages/dashboard/dashboard-request/url-constants/url-constants';
import { environment } from 'environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-package-holiday-listview',
  templateUrl: './package-holiday-listview.component.html',
  styleUrls: ['./package-holiday-listview.component.scss']
})
export class PackageHolidayListviewComponent implements OnInit , OnDestroy  {

  ngDestroy$ = new Subject();
  packageHolidayList: any;

  myDataAttribute: string;
  isFlightSelected: boolean = true;
  isHotelSelected: boolean = true;
  isActivitiesSelected: boolean = true;
  isAncillarySelected: boolean = true;
  isNotAssignedAncillarySelected: boolean = true;
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
  requestCreationLoading:boolean=false;



  @ViewChild('dayList') dayList: ElementRef;

  flightAddonsHide=[];
  hotelAddonsHide=[];

  showAndHidePassengers=[];
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private toastrService: ToastrService,
    private dashboardRequestService: DashboardRequestService,
    private spinnerService: NgxSpinnerService,
  ) {}

  ngOnInit(): void {
    this.getQueryParams();
    //back button disabled
    history.pushState(null, '');
    fromEvent(window, 'popstate')
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((_) => {

        history.pushState(null, '');
      });
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
    this.showSpinner();
    this.requestCreationLoading=true;
    this.dashboardRequestService
      .getpackageHolidayListView(requestNumber, packageHolidayListView.searchSrPackage)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (res: any) => {
          if (res?.packageHeader) {
            this.requestCreationLoading=false;
            if(res?.packageLines?.length>0){
              res?.packageLines?.forEach((element,mainIndex) => {
                if(element.flight?.length>0){
                  element?.flight?.forEach((subElement,flightIndex) => {
                    const totalIndex=(mainIndex + 1)+flightIndex;

                    this.flightAddonsHide.push(true);
                    /* if(totalIndex){
                      this.flightAddonsHide.push(true);
                    } */



                    // subElement.fromCode=subElement?.originDestinationLocation?.split('-')[0]?.split('(')[1]?.split(')')[0];
                    // subElement.toCode=subElement?.originDestinationLocation?.split('-')[1]?.split('(')[1]?.split(')')[0];
                    // subElement.addons= subElement.addons == '[]'|| subElement.addons == null|| subElement.addons == undefined || subElement.addons == ''?[]:JSON.parse(subElement?.addons);
                    // if(subElement?.addons?.length>0){
                    //   subElement?.addons?.forEach(subAddonsElement => {
                    //     this.flightAddonsHide.push(true);
                    //     if(subAddonsElement?.requiredRoute?.routes?.length>0){
                    //       //subElement.addons=[];
                    //       subAddonsElement?.requiredRoute?.routes?.forEach(routeElement => {
                    //         routeElement.routeFromCode=routeElement?.route?.split('-')[0]?.trim();
                    //         routeElement.routeToCode=routeElement?.route?.split('-')[1]?.trim();
                    //         if(subElement.fromCode === routeElement.routeFromCode && subElement.toCode === routeElement.routeToCode){
                    //           let flightAddons=[];
                    //           flightAddons.push(subAddonsElement);
                    //           subElement.addons= flightAddons;
                    //         }/* else{
                    //           subElement.addons=[];
                    //           console.log('else');
                    //           console.log("subAddonsElement",subAddonsElement);
                    //           console.log("flightAddons",flightAddons);
                    //           console.log(subElement.fromCode === routeElement.routeFromCode );
                    //           console.log(subElement.toCode === routeElement.routeToCode);
                    //         } */
                    //       });
                    //     }
                    //   });
                    // }


                  });
                }

                if(element.hotel?.length>0){
                  element?.hotel?.forEach(subelement => {
                    this.hotelAddonsHide.push(true);
                    subelement.classDays= Number(subelement.classDays);
                  });
                }
              });
              this.packageHolidayList = res;
              this.dayCountList = new Array(this.packageHolidayList?.packageHeader?.totalNoOfDays);



              this.cdr.markForCheck();
              //this.getDataAttribute('all');
            }
           /*  if (res?.packageLines?.length > 0) {
              res.packageLines?.forEach(element => {
                if (element.flight?.length > 0) {
                  element.flight.forEach(subElement => {
                    const originDestinationLocation = subElement?.originDestinationLocation;
                    const [fromLocation, toLocation] = originDestinationLocation?.split('-').map(location => location?.trim()?.split('(')[1]?.split(')')[0]);
                    subElement.fromCode = fromLocation;
                    subElement.toCode = toLocation;
                    subElement.addons = subElement.addons ? JSON.parse(subElement.addons) : [];
                    if (subElement?.addons?.length > 0) {
                      subElement.addons.forEach(subAddonsElement => {
                        if (subAddonsElement?.requiredRoute?.routes?.length > 0) {
                          subAddonsElement?.requiredRoute?.routes?.forEach(routeElement => {
                            const [routeFromCode, routeToCode] = routeElement.route?.split('-').map(route => route.trim());
                            routeElement.routeFromCode = routeFromCode;
                            routeElement.routeToCode = routeToCode;
                            subElement.addons = subElement.fromCode === routeFromCode && subElement.toCode === routeToCode
                              ? subElement.addons
                              : [];
                          });
                        }
                      });
                    }
                  });
                }
                if (element.hotel?.length > 0) {
                  element.hotel.forEach(subElement => {
                    subElement.classDays = Number(subElement.classDays);
                  });
                }
              });
            } */


            // let flightAddonsByRoute = [];
            // let flightAddonsByNonRoute = [];
            // if (res?.packageLines?.length > 0) {
            //   res.packageLines?.forEach(element => {
            //     if (element.flight?.length > 0) {
            //       element.flight.forEach(subElement => {
            //         subElement.addons = subElement.addons ? JSON.parse(subElement.addons) : [];
            //         if ( subElement.addons?.length > 0) {
            //           subElement.addons?.forEach(flightAddonsElement => {
            //             if (flightAddonsElement?.requiredRoute?.routes?.length > 0) {
            //               flightAddonsElement?.requiredRoute?.routes?.forEach(flightAddonsRouteElement => {
            //                 if(flightAddonsRouteElement.route !=''){
            //                   if(flightAddonsByRoute[flightAddonsRouteElement.route] == undefined){ flightAddonsByRoute[flightAddonsRouteElement.route] = []; }
            //                   flightAddonsByRoute[flightAddonsRouteElement.route].push(flightAddonsElement);
            //                 }
            //               });
            //             } else {
            //               flightAddonsByNonRoute.push(flightAddonsElement);
            //             }
            //           });
            //         }
            //       });
            //     }
            //   });


            //   /* let flightAddonsData = res?.packageLines[0]?.flight[0]?.addons ? JSON.parse(res?.packageLines[0]?.flight[0]?.addons) : [];
            //   if (flightAddonsData?.length > 0) {
            //     flightAddonsData?.forEach(flightAddonsElement => {
            //       if (flightAddonsElement?.requiredRoute?.routes?.length > 0) {
            //         flightAddonsElement?.requiredRoute?.routes?.forEach(flightAddonsRouteElement => {
            //           if(flightAddonsRouteElement.route !=''){
            //             if(flightAddonsByRoute[flightAddonsRouteElement.route] == undefined){ flightAddonsByRoute[flightAddonsRouteElement.route] = []; }
            //             flightAddonsByRoute[flightAddonsRouteElement.route].push(flightAddonsElement);
            //           }
            //         });
            //       } else {
            //         flightAddonsByNonRoute.push(flightAddonsElement);
            //       }
            //     });
            //   } */
            //   // res['flightAddonsByRoute'] = flightAddonsByRoute;
            //   // res['flightAddonsByNonRoute'] = flightAddonsByNonRoute;
            // }
            //  console.log("flightAddonsByRoute",flightAddonsByRoute);
            //  console.log("flightAddonsByNonRoute",flightAddonsByNonRoute);

            // res['flightAddonsByRoute'] = flightAddonsByRoute;
            // res['flightAddonsByNonRoute'] = flightAddonsByNonRoute;
            // this.packageHolidayList = res;
            // this.dayCountList = new Array(this.packageHolidayList?.packageHeader?.totalNoOfDays);
            // //this.getDataAttribute('all');
            // this.cdr.markForCheck();
          }
        },
        (error) => {
          this.requestCreationLoading=false;
          this.toastrService.error('oops something  went wrong  please try again', 'Error');
          this.cdr.markForCheck();
        }
      );
  }


  hotelDaysConvert(value:string){
   return Number(value);
  }
  getSegmentDetails(srId: number) {
    this.showSpinner();
    this.requestCreationLoading=true;
    this.dashboardRequestService
      .getPackageRequest(Holiday_Package.getPackageRequest, srId)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (requestResponse: any) => {
          if (requestResponse?.length > 0) {
            this.flightDetailsList = requestResponse;
          }
          this.cdr.markForCheck();
        },
        (error) => {
          if (error == null || error == '') {
            this.requestCreationLoading=false;
            this.toastrService.error('oops something  went wrong  please try again', 'Error');
            this.cdr.markForCheck();
          } else {
            this.requestCreationLoading=false;
            this.toastrService.error(error, 'Error');
            this.cdr.markForCheck();
          }
        }
      );
  }
  public showSpinner(): void {
    this.spinnerService.show();
    /* setTimeout(() => {
      this.spinnerService.hide();
    }, 5000); // 5 seconds */
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
        this.isNotAssignedAncillarySelected = false;
        break;
      case 'hotel':
        this.isHotelSelected = true;
        this.isActivitiesSelected = false;
        this.isFlightSelected = false;
        this.isAncillarySelected = false;
        this.isAllSelected = false;
        this.isNotAssignedAncillarySelected = false;
        break;
      case 'activities':
        this.isActivitiesSelected = true;
        this.isHotelSelected = false;
        this.isFlightSelected = false;
        this.isAncillarySelected = false;
        this.isAllSelected = false;
        this.isNotAssignedAncillarySelected = false;
        break;
      case 'ancillary':
        this.isAncillarySelected = true;
        this.isNotAssignedAncillarySelected = false;
        this.isActivitiesSelected = false;
        this.isHotelSelected = false;
        this.isFlightSelected = false;
        this.isAllSelected = false;
        break;
        case 'notAssignedAncillary':
        this.isNotAssignedAncillarySelected = true;
        this.isAncillarySelected = false;
        this.isActivitiesSelected = false;
        this.isHotelSelected = false;
        this.isFlightSelected = false;
        this.isAllSelected = false;
        break;
        //notAssignedAncillary
      default:
        this.isAllSelected = true;
        this.isNotAssignedAncillarySelected = true;
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
        holidaysLineId: holidaysLineId,
        sources: `request-1`,
      };
      //this.router.navigate(['/dashboard/booking/holidays'], { queryParams });
      const PACKAGE_EDIT = this.router.createUrlTree(['/dashboard/booking/holidays'], { queryParams }).toString();
      window.open(PACKAGE_EDIT, '_blank');
    }


  }


  dayScrollLeft() {
    this.dayList.nativeElement.scrollLeft -= 100;
  }

  dayScrollRight() {
    this.dayList.nativeElement.scrollLeft += 100;
  }



  showAndHideFlightAddons(index:number){


    this.flightAddonsHide[index]= !this.flightAddonsHide[index];


  }

  showAndHideHotelAddons(index:number){
    this.hotelAddonsHide[index]= !this.hotelAddonsHide[index];
  }


  showAndHidePassenger(index:number){
    this.showAndHidePassengers[index]= !this.showAndHidePassengers[index];
  }

}
