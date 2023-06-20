import { ToastrService } from 'ngx-toastr';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { sr_reports } from 'app/pages/dashboard/sr-reports/constants/sr-reports-url-constants';
import { BookingReportsApiResponse } from 'app/pages/dashboard/sr-reports/models/invoice-api-response';
import { SrReportsService } from 'app/pages/dashboard/sr-reports/services/sr-reports.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'app/shared/auth/auth.service';
import { environment } from 'environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-mybookings',
  templateUrl: './mybookings.component.html',
  styleUrls: ['./mybookings.component.scss', '../../../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MybookingsComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  public columnMode: ColumnMode.force;
  public rows: any = [];
  @ViewChild('tableRowDetails') tableRowDetails: any;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  public limitRef = 10;
  private userId = [];
  todayDate = new Date();
  todayDate1: string;

  userDetails: any;
  @Input() isMobile: boolean;
  constructor(
    private router: Router,
    private srReportsService: SrReportsService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
    private authServices: AuthService,
  ) {
    this.todayDate1 = formatDate(this.todayDate, 'yyyy-MM-ddThh:mm:ss', 'en-US', '+0530');
  }

  getBookingData(userNo: any) {
    const search_data = {
      booking_user_id: userNo,
      limitstart: 0,
      limitlength: 10,
    };
    this.srReportsService
      .getBookingReport(search_data, sr_reports.bookingReport)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (res) => {
          const result: BookingReportsApiResponse = res;
          if (result.status === true) {
            this.rows = result.data;

            this.cd.markForCheck();
          } else {
            this.toastr.error('Oops! Something went wrong  please try again', 'Error');
            this.cd.markForCheck();
          }
        },
        (error) => {
          this.rows = [];

          this.toastr.warning(error, 'Error');
          this.cd.markForCheck();
        }
      );
  }
  /**
   *
   *
   * @param {number} product_id
   * @param {string} channelName
   * @param {number} bookingIDNumber
   * @param {string} supplierReferenceNumber
   * @param {string} bookingReference
   * @redirect to pnr  MybookingsComponent
   */
  refernceNumberToRedirect(
    product_id: number,
    channelName: string,
    bookingIDNumber: number,
    supplierReferenceNumber: string,
    bookingReference: string
  ) {
    let productID = product_id;
    let channel = channelName;
    let bookingID = bookingIDNumber;

    let supplierReference = supplierReferenceNumber;
    let bookingReferenceNumber = bookingReference;

    if (productID && channel && bookingID && bookingReferenceNumber) {
      const redirectRfqUrl = `${environment.RFQREDIRECTOFFLINE}redirect/booking?product=${productID}&channel=${channel}&booking_id=${bookingID}&supplier_reference=${supplierReference}&booking_reference=${bookingReferenceNumber}&from=report`;
      window.open(redirectRfqUrl, '_blank');
    }
  }


  toggleExpandRow(row) {
    this.tableRowDetails?.rowDetail?.toggleExpandRow(row);
  }

  onDetailToggle(event) {
    // console.log('Detail Toggled', event);
  }


  getLinesBySrRequest(requestHeaderId: any) {
    if (requestHeaderId?.product_name === 'Flight') {
      const queryParams = {
        requestId: requestHeaderId?.service_request,
        contactId: requestHeaderId?.booking_contact_id,
        srLineId: requestHeaderId?.service_request_line,
      };
      const FLIGHT_URL = this.router.createUrlTree(['/dashboard/booking/flight'], { queryParams }).toString();
      window.open(FLIGHT_URL, '_blank');
    } else if (requestHeaderId?.product_name === 'Hotel') {
      const queryParams = {
        requestId: requestHeaderId?.service_request,
        contactId: requestHeaderId?.booking_contact_id,
        hotelLineId: requestHeaderId?.service_request_line,
      };
      const HOTEL_URL = this.router.createUrlTree(['/dashboard/booking/hotel'], { queryParams }).toString();
      window.open(HOTEL_URL, '_blank');
    } /* else if (requestHeaderId.product_name ===  'Ancillary') {
      this.router.navigate(['/dashboard/booking/ancillary'], {
        queryParams: {
          requestId: requestHeaderId.service_request,
          contactId: requestHeaderId.booking_contact_id,
          serviceTypeId: btoa(escape(requestHeaderId.typeId)),
          anxLineId: requestHeaderId.service_request_line,
        },
      });
    } */ else if (requestHeaderId?.product_name === 'Attractions' || requestHeaderId.product_name === 'Attraction') {
      const queryParams = {
        requestId: requestHeaderId?.service_request,
        contactId: requestHeaderId?.booking_contact_id,
        activitiesLineId: requestHeaderId?.service_request_line,
      };
      const ACTIVITIES_URL = this.router.createUrlTree(['/dashboard/booking/activities'], { queryParams }).toString();
      window.open(ACTIVITIES_URL, '_blank');
    } else {
      this.toastr.info('no redirect url found', 'Info');
    }
  }
  ngOnInit(): void {

    const userNo = this.authServices.getUser();
    this.userDetails=this.authServices.getUserDetails();
    this.userId.push(userNo);
    this.getBookingData(this.userId);

  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
