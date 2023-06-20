import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { DashboardRequestService } from 'app/pages/dashboard/dashboard-request/services/dashboard-request.service';
import { srsearchList_url } from 'app/pages/dashboard/dashboard-request/url-constants/url-constants';
import { AuthService } from 'app/shared/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-myrequests',
  templateUrl: './myrequests.component.html',
  styleUrls: ['./myrequests.component.scss','../../../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MyrequestsComponent implements OnInit , OnDestroy {
  ngDestroy$ = new Subject();

  public columnMode: ColumnMode.force;

  public rows :any = [];

  sorts=[
    { prop: 'serviceRequestNumber', dir: 'desc' }
  ];
  @ViewChild('tableRowDetails') tableRowDetails: any;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  public limitRef = 10;
  private userDetails:any;
  @Input() isMobile: boolean;
  constructor(
    private router: Router,
    private toastr: ToastrService,
     private cdr: ChangeDetectorRef,
     private authServices: AuthService,
     private dashboardRequestService: DashboardRequestService,
  ) { }

/**
 *
 *
 * @param {*} searchinput
 * @memberof MyrequestsComponent
 */
dynamicParamsList(searchinput:any) {
    this.dashboardRequestService
      .getAllServiceRequestSearch(searchinput, srsearchList_url.srsearchList)
      .pipe(takeUntil(this.ngDestroy$)).subscribe(
        (data: any) => {
          if (data.length === 0) {
            this.toastr.info(`no data found given search criteria`, 'Info');
            this.rows = [];

            this.cdr.markForCheck();
          } else {
            this.rows = data;
            this.cdr.markForCheck();
          }
        },
        (error) => {

          this.toastr.error('oops something  went wrong  please try again', 'Error');
          this.cdr.markForCheck();
        }
      );
  }


  getLinesBySrRequest(requestHeaderId) {
    if (requestHeaderId.product === 'Flight') {
      this.router.navigate(['/dashboard/booking/flight'], {
        queryParams: {
          requestId: requestHeaderId?.serviceRequestNumber,
          contactId: requestHeaderId?.contactId,
          srLineId: requestHeaderId?.serviceRequestLine,
        },
      });

    } else if (requestHeaderId.product === 'Hotel') {
      this.router.navigate(['/dashboard/booking/hotel'], {
        queryParams: {
          requestId: requestHeaderId?.serviceRequestNumber,
          contactId: requestHeaderId?.contactId,
          hotelLineId: requestHeaderId?.serviceRequestLine,
        },
      });
    } else if (requestHeaderId.product ===  'Ancillary') {
      this.router.navigate(['/dashboard/booking/ancillary'], {
        queryParams: {
          requestId: requestHeaderId.serviceRequestNumber,
          contactId: requestHeaderId.contactId,
          serviceTypeId: btoa(escape(requestHeaderId.typeId)),
          anxLineId: requestHeaderId.serviceRequestLine,
        },
      });
    } else if (requestHeaderId.product ===  'Package') {
      this.router.navigate(['/dashboard/booking/holidays'], {
        queryParams: {
          requestId: requestHeaderId.serviceRequestNumber,
          contactId: requestHeaderId.contactId,
          holidaysLineId:requestHeaderId?.serviceRequestLine
        },
      });
    }  else if (requestHeaderId.product ===  'Attractions') {
      this.router.navigate(['/dashboard/booking/activities'], {
        queryParams: {
          requestId: requestHeaderId.serviceRequestNumber,
          contactId: requestHeaderId.contactId,
          activitiesLineId:requestHeaderId?.serviceRequestLine
        },
      });
    } else {
      this.toastr.info('no redirect url found', 'Info');
    }
  }


  toggleExpandRow(row) {
    this.tableRowDetails?.rowDetail?.toggleExpandRow(row);
  }

  onDetailToggle(event) {
    // console.log('Detail Toggled', event);
  }
  ngOnInit(): void {
    this.userDetails=this.authServices.getUserDetails();
    if(this.userDetails){
      const SEARCH_DATA={
        contactId:this.userDetails?.contactId
      };
      this.dynamicParamsList(SEARCH_DATA);
    }
  }
  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
