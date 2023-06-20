import { environment } from 'environments/environment';
import { DatePipe, formatDate } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/shared/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { SrReportsService } from '../../services/sr-reports.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { BookingResponseData } from '../../models/booking-search-request';
@Component({
  selector: 'app-booking-report',
  templateUrl: './booking-report.component.html',
  styleUrls: ['./booking-report.component.scss', '../../../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BookingReportComponent implements OnInit, OnChanges, OnDestroy {
  ngDestroy$ = new Subject();
  public bookingData: any[] = [];
  public show = false;
  public loading: boolean = false;

  @Input() public ReportsData: BookingResponseData[];
  @Input() customerAndContactDeatils: any = {};
  // today date
  todayDate = new Date();
  todayDate1: string;
  hidePnrIcon: boolean = true;

  public ColumnMode = ColumnMode;
  public rows: BookingResponseData[] = [];

  @ViewChild('tableRowDetails') tableRowDetails: any;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  public limitRef = 10;

  hideme = [];
  @Output() selectedItem = new EventEmitter<boolean>();
  dateOfjourney: string;
  showFilterIcon: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
    private authServices: AuthService,
    private srReports: SrReportsService,
    private modalService: NgbModal,
  ) {
    this.titleService.setTitle('Booking Report');
    this.todayDate1 = formatDate(this.todayDate, 'yyyy-MM-ddThh:mm:ss', 'en-US', '+0530');
  }


  ngOnChanges() {
    if (this.ReportsData) {
      this.bookingData = this.ReportsData;
      this.rows = this.ReportsData;
    } else {
      this.rows = [];
    }
  }
  ngOnInit(): void {
    this.selectBox(0);
    this.getParams();
    this.getQueryParams();
    this.getFilterIconHide();
  }


  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
  getFilterIconHide() {
    if (this.router.url.includes('/dashboard/request/search-result')) {
      this.showFilterIcon = false;
    } else {
      this.showFilterIcon = true;
    }
  }

  getParams() {
    this.route.params.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param && param.view) {
        this.hidePnrIcon = false;
      }
    });
  }

  getQueryParams() {
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param && param.date_of_journey && param.issused) {
        if (param.issused === 'Yes') {
          this.dateOfjourney = `Date of Journey ${param.date_of_journey}`;
        }
        if (param.issused === 'No') {
          this.dateOfjourney = ` Ticket / Voucher Requested Date  ${param.date_of_journey}`;
        }
      }
    });
  }
  selectBox(index: number) {
    this.selectedItem.emit((this.hideme[index] = !this.hideme[index]));
  }
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

    /*  if(supplierReferenceNumber=== null){
      return this.toastr.info('no supplier reference number found','INFO',{progressBar:true});
    } */
    let supplierReference = supplierReferenceNumber;
    let bookingReferenceNumber = bookingReference;

    if (productID && channel && bookingID && bookingReferenceNumber) {
      const redirectRfqUrl = `${environment.RFQREDIRECTOFFLINE}redirect/booking?product=${productID}&channel=${channel}&booking_id=${bookingID}&supplier_reference=${supplierReference}&booking_reference=${bookingReferenceNumber}&from=report`;
      //alert(redirectRfqUrl);
      //console.log(redirectRfqUrl);
      window.open(redirectRfqUrl, '_blank');
    }
  }

  /*  openCustomerVerfication(selectedData: any) {
    const modalRef = this.modalService.open(CustomerVerificationPopupComponent);
    modalRef.componentInstance.name = 'Contact Verification ';
    modalRef.componentInstance.selectedContact = selectedData;
  } */
  /*  redirectToAmendmentsRequestFlight(bookingId: any) {
    if (bookingId) {
      const encryptBookingId = btoa(escape(bookingId));
      this.router.navigate(['/dashboard/amendments/request/flight'], { queryParams: { booking_id: encryptBookingId } });
    }
  } */

  createServiceRequest(
    bookingId: number,
    booking_customer_name: string,
    booking_contact_name: string,
    supplier_reference: string,
    booking_contact_mobile: string,
    product_id: string,
    booking_channel: string,
    booking_reference_no: string,
    selectedRoute: string
  ) {
    if (this.customerAndContactDeatils) {
      const srRequestHeaderData = {
        createdBy: this.authServices.getUser(),
        createdDate: this.todayDate1,
        customerId: this.customerAndContactDeatils?.customerId,
        contactId: this.customerAndContactDeatils?.contactId,
        requestStatus: 1,
        priorityId: 1,
        severityId: 1,
      };
      this.srReports
        .createServiceRequestLine(srRequestHeaderData)
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe(
          (requestResponse: any) => {
            this.redirectToAmendmentsRequestFlight(
              bookingId,
              requestResponse.requestId,
              booking_customer_name,
              booking_contact_name,
              supplier_reference,
              booking_contact_mobile,
              product_id,
              booking_channel,
              booking_reference_no,
              selectedRoute
            );
          },
          (error) => {
            this.toastr.error('Oops! Something went wrong  please try again', 'Error');
          }
        );
    } else {
      return this.toastr.error('Opps Something went wrong please try again');
    }
  }
  redirectToAmendmentsRequestFlight(
    bookingId: any,
    requestId: number,
    customer: string,
    contact: string,
    supplier_reference: string,
    contactNumber: string,
    productId: string,
    channel: string,
    booking_reference: string,
    selectedRoute: string
  ) {
    if (
      bookingId &&
      requestId &&
      customer &&
      contact &&
      productId &&
      channel &&
      supplier_reference &&
      booking_reference &&
      customer &&
      contactNumber &&
      selectedRoute
    ) {
      const encryptBookingId = btoa(escape(bookingId));
      this.router.navigate([`/dashboard/amendments/request/${selectedRoute}`], {
        queryParams: {
          product_id: productId,
          channel: channel,
          booking_id: encryptBookingId,
          supplier_reference: supplier_reference,
          booking_reference: booking_reference,
          request_Id: requestId,
          customer_name: customer,
          contact_name: contact,
          contactNumber: contactNumber,
          from: selectedRoute,
        },
      });
    }
  }

  /**
   * updateLimit
   *
   * @param limit
   */
  updateLimit(limit) {
    this.limitRef = limit.target.value;
    this.cd.markForCheck();
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
}
