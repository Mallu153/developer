import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { QUOTE_AGING } from '../../../cash-url-constants/api-url-constants';
import { CashManagementApiResponse } from '../../../models/cash-management-response';
import { CashManagementService } from '../../../services/cash-management.service';
import { environment } from 'environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-issued-vourcher',
  templateUrl: './not-issued-vourcher.component.html',
  styleUrls: ['./not-issued-vourcher.component.scss']
})
export class NotIssuedVourcherComponent implements OnInit  , OnDestroy {

  ngDestroy$ = new Subject();
  notIssuedvourcherAgeingList=[];
  loading:boolean=true;
  constructor(
    private storeManagementService: CashManagementService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {this.getBookingAgeingReport(); }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
  trackByFn(index, item) {
    return index;
  }
  getBookingAgeingReport() {
    this.loading=true;
    this.notIssuedvourcherAgeingList =[];
    const data = {
      limit: 9,
    };
    this.storeManagementService
      .getQuoteAgeingReport(data, QUOTE_AGING.getBookingAgeingReport)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        const result: CashManagementApiResponse = res;
        if (result.status === 200) {
          this.notIssuedvourcherAgeingList = res.data;
          this.loading=false;
          this.cdr.markForCheck();
        } else {
          if (result.status === 400 || result.status === 404 || result.status === 500 || result.status === 401) {
            this.toastr.error(result.message, 'Error');
          } else {
            this.toastr.error('Oops! Something went wrong   please try again', 'Error');
          }
          this.notIssuedvourcherAgeingList =[];
          this.loading=false;
          this.cdr.markForCheck();
        }
      });
  }

  navigatedByPnr(
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
      window.open(redirectRfqUrl, '_blank');
    }
  }

  navigatedToBookingReoprt() {
    const queryParams = {
      sourceType: 'dashboard-widgets',
      unIssued: "No",

    };
    const BOOKING_REPORT_URL = this.router.createUrlTree(['/dashboard/reports/booking/view'], { queryParams }).toString();
    window.open(BOOKING_REPORT_URL, '_blank');
  }

}
