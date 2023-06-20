import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { QUOTE_AGING } from '../../../cash-url-constants/api-url-constants';
import { CashManagementApiResponse } from '../../../models/cash-management-response';
import { CashManagementService } from '../../../services/cash-management.service';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-receipt-payment',
  templateUrl: './receipt-payment.component.html',
  styleUrls: ['./receipt-payment.component.scss']
})
export class ReceiptPaymentComponent implements OnInit , OnDestroy  {

  ngDestroy$ = new Subject();
  receiptPaymentAgeingList=[];
  loading:boolean=true;
  constructor(
    private storeManagementService: CashManagementService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {this.getReceiptPaymentAgeingReport(); }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
  trackByFn(index, item) {
    return index;
  }
  getReceiptPaymentAgeingReport() {
    this.loading=true;
    this.receiptPaymentAgeingList =[];
    const data = {
      limit: 9,
    };
    this.storeManagementService
      .getQuoteAgeingReport(data, QUOTE_AGING.getReceiptPaymentAgeingReport)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        const result: CashManagementApiResponse = res;
        if (result.status === 200) {
          this.receiptPaymentAgeingList = res.data;
          this.loading=false;
          this.cdr.markForCheck();
        } else {
          if (result.status === 400 || result.status === 404 || result.status === 500 || result.status === 401) {
            this.toastr.error(result.message, 'Error');
          } else {
            this.toastr.error('Oops! Something went wrong   please try again', 'Error');
          }
          this.receiptPaymentAgeingList =[];
          this.loading=false;
          this.cdr.markForCheck();
        }
      });
  }


  navigatedToRetailsBookingReoprt() {
    const queryParams = {
      sourceType: 'dashboard-widgets',
      unIssued: "No",
    };
    const RETAILS_BOOKING_REPORT_URL = this.router.createUrlTree(['/dashboard/reports/booking-by-supplier-reference/view'], { queryParams }).toString();
    window.open(RETAILS_BOOKING_REPORT_URL, '_blank');
  }

  navigatedToReceipt(
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
      const redirectRfqUrl = `${environment.RFQREDIRECTOFFLINE}redirect/redirect_action_finance?product=${productID}&channel=${channel}&booking_id=${bookingID}&supplier_reference=${supplierReference}&booking_reference=${bookingReferenceNumber}&from=receipt_report_dashboard`;
      window.open(redirectRfqUrl, '_blank');


    }
  }

}
