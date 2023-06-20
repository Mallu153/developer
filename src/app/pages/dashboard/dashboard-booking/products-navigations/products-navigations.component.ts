import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, NavigationEnd, Route } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'app/shared/auth/auth.service';
import { PERMISSION_KEYS } from 'app/shared/data/app-premission-key';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AncillarySelectComponent } from '../../dashboard-request/components/search-result/ancillary-select/ancillary-select.component';
import { DashboardRequestService } from '../../dashboard-request/services/dashboard-request.service';
import { ShareRequestIdService } from '../share-data-services/share-requestId.service';
import { SrSummaryDataService } from '../share-data-services/srsummarydata.service';

@Component({
  selector: 'app-products-navigations',
  templateUrl: './products-navigations.component.html',
  styleUrls: ['./products-navigations.component.scss']
})
export class ProductsNavigationsComponent implements OnInit , OnDestroy{
  ngDestroy$ = new Subject();
  @Input() activeId: number; // Basic Navs
  pageTitle: string;
  shareReqId: any;
  shareContactId: any;
  requestId: number;
  contactId: any;
  color = "#f1f1f1";

  @Input()  flightLink:string;
  @Input()  hotelLink:string;
  @Input()  ancillaryLink:string;
  @Input()  holidayLink:string;
  @Input() activityLink:string;
  keys=[];
  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private route: ActivatedRoute,
    private toastrService: ToastrService,
    private shareRequestId: ShareRequestIdService,
    private modalService: NgbModal,
    private authService: AuthService
  ) {


   // this.getActiveRouter();
  }


   /**
   * Get active children url path and update the active id in the tabs
   */
    getActiveRouter(): void {
      this.router.events.pipe(filter((evt) => evt instanceof NavigationEnd)).pipe(takeUntil(this.ngDestroy$)).subscribe(() => {
        if (this.activeRoute.firstChild && this.activeRoute.firstChild.routeConfig) {
          const activeRouter: Route = this.activeRoute.firstChild.routeConfig;
          if (activeRouter && activeRouter.path === 'flight') {
            this.activeId = 1;
            this.pageTitle = 'Flight Request ';
          } else if (activeRouter && activeRouter.path === 'hotel') {
            this.activeId = 2;
            this.pageTitle = 'Hotel Request ';
          } else if (activeRouter && activeRouter.path === 'ancillary') {
            this.activeId = 3;
            this.pageTitle = 'Ancillary Request ';
          } else if (activeRouter && activeRouter.path === 'holidays') {
            this.activeId = 4;
            this.pageTitle = 'Holiday Packages Request ';
          } else if (activeRouter && activeRouter.path === 'activities') {
            this.activeId = 5;
            this.pageTitle = 'Activities Request ';
          }else {
            this.activeId = 1;
            this.pageTitle = 'Flight Request ';
          }
        }
      });
    }

    onActiveIdChangeChange(activeId: number): void {

      switch (activeId) {
        case 1:
          this.router.navigate(['/dashboard/booking/flight'], {
            queryParams: { requestId: this.shareReqId, contactId: this.shareContactId },
          });
          this.flightLink=PERMISSION_KEYS.BOOKING.FLIGHT.PRODUCT_LINK_FLIGHT;
          this.hotelLink=PERMISSION_KEYS.BOOKING.FLIGHT.PRODUCT_LINK_HOTEL;
          this.ancillaryLink=PERMISSION_KEYS.BOOKING.FLIGHT.PRODUCT_LINK_ANCILLARY;
          this.holidayLink=PERMISSION_KEYS.BOOKING.FLIGHT.PRODUCT_LINK_HOLIDAY;
          this.activityLink=PERMISSION_KEYS.BOOKING.FLIGHT.PRODUCT_LINK_ACTIVITY;
          break;
        case 2:
          this.router.navigate(['/dashboard/booking/hotel'], {
            queryParams: { requestId: this.shareReqId, contactId: this.shareContactId },
          });
          break;
        case 3:
          //this.activeId=2;


          const modalRef = this.modalService.open(AncillarySelectComponent, {
            size: 'xl',
            backdrop: 'static',
            animation: true,
          });
          modalRef.componentInstance.name = 'Select Ancillary';
          modalRef.result.then(
            (result) => {
              if (result) {

                this.router.navigate(['/dashboard/booking/ancillary'], {
                  queryParams: {
                    requestId: this.shareReqId,
                    contactId: this.shareContactId,
                    serviceTypeId: btoa(escape(result)),
                  },
                });
                //  this.onSubmit('ancillary', result);
              } else {
                this.toastrService.error('Please select Ancillary');
              }
            },
            (err) => {}
          );

          break;
        case 4:
          this.router.navigate(['/dashboard/booking/holidays'], {
            queryParams: { requestId: this.shareReqId, contactId: this.shareContactId },
          });
          break;
          case 5:
          this.router.navigate(['/dashboard/booking/activities'], {
            queryParams: { requestId: this.shareReqId, contactId: this.shareContactId },
          });
          break;
        default:

          this.router.navigate(['/dashboard/booking/flight'], {
            queryParams: { requestId: this.shareReqId, contactId: this.shareContactId },
          });
          break;
      }
    }


  ngOnInit(): void {
    this.keys= this.authService.getPageKeys();
     /*get The params and call the find by contact service */
     this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param && param.contactId && param.requestId) {
        this.contactId = param.contactId;
        this.requestId = param.requestId;
        if (this.requestId) {
          //service request api service call
         this.shareRequestId.nextCount(this.requestId);
        }
        if (this.contactId) {
         this.shareRequestId.nextCountContactId(this.contactId);
        }
      }
    });

    //request id share the hotel and  ancillary
    this.shareRequestId.shareRequestId.pipe(takeUntil(this.ngDestroy$)).subscribe((reqId) => {
      this.shareReqId = reqId;
    });
    this.shareRequestId.shareContactId.pipe(takeUntil(this.ngDestroy$)).subscribe((contactId) => {
      this.shareContactId = contactId;
      /*  if (this.shareContactId) {
        this.getContactDetails(this.shareContactId)
      } */
    });
  }
  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
