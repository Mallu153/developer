import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { ToastrService } from 'ngx-toastr';
import { SrSummaryDetailsBySrAndSrLine } from '../../../models/sr-summary-details-by-sr-srline';
import { SrReportsService } from '../../../services/sr-reports.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-sr-summary-deatils-by-sr-srline',
  templateUrl: './sr-summary-deatils-by-sr-srline.component.html',
  styleUrls: ['./sr-summary-deatils-by-sr-srline.component.scss'],
})
export class SrSummaryDeatilsBySrSrlineComponent implements OnInit , OnDestroy {
  @Input() srSummaryDetailsData: any = {};

  invoiceData = [];
  paymentData = [];
  purchaseOrderData = [];
  receiptData = [];
  referenceData = [];
  subReferenceData = [];
  quote=[];

   //search setup
   public searchText: any;
   //pagination
   public page = 1;
   public pageSize = 10;
   public collectionSize: number;

   private ngUnSubscribe: Subject<void>;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private srReports: SrReportsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.ngUnSubscribe = new Subject<void>();
    //console.log(this.srSummaryDetailsData);
    if (this.srSummaryDetailsData) {
      const SR = parseInt(this.srSummaryDetailsData.service_request);
      const SRLINE = parseInt(this.srSummaryDetailsData.service_request_line);
      const PRODUCT = parseInt(this.srSummaryDetailsData.product_id);
      if (SR && SRLINE && PRODUCT) {
        this.getSrSummaryDeatilsBySrAndSrline(SR, SRLINE, PRODUCT);
      }
    }
  }
  ngOnDestroy(): void {
    this.ngUnSubscribe.next();
    this.ngUnSubscribe.complete();
  }
  getSrSummaryDeatilsBySrAndSrline(SR: number, SRLINE: number, PRODUCT: number) {

    this.srReports.getSrSummaryDeatilsBySrLine(SR, SRLINE, PRODUCT).pipe(takeUntil(this.ngUnSubscribe)).subscribe(
      (res) => {
        const result: SrSummaryDetailsBySrAndSrLine = res;
        if (result.status === true) {


          if (result.reference_data.length > 0) {
            this.referenceData = result.reference_data;
          } else {
            this.referenceData = [];
          }
          if (result.sub_reference_data.length > 0) {
            this.subReferenceData = result.sub_reference_data;
          } else {
            this.subReferenceData = [];
          }

          if (result.purchase_order_data.length > 0) {
            this.purchaseOrderData = result.purchase_order_data;
          } else {
            this.purchaseOrderData = [];
          }
          if (result.receipt_data.length > 0) {
            this.receiptData = result.receipt_data;
          } else {
            this.receiptData = [];
          }
          if (result.payment_data.length > 0) {
            this.paymentData = result.payment_data;
          } else {
            this.paymentData = [];
          }
          if (result.invoice_data.length > 0) {
            this.invoiceData = result.invoice_data;
          } else {
            this.invoiceData = [];
          }
          if(result.quote_data.length > 0){
            this.quote = result.quote_data;
          }else{
            this.quote=[];
          }
          this.cdr.markForCheck();
        } /* else {
        this.toastrService.error('Oops! Something went wrong  please try again', 'Error');
      } */
      },
      (error) => {
        this.toastrService.error(error, 'Error');
      }
    );
  }



  refernceNumberToRedirect(channelName:string,bookingIDNumber:number,supplierReferenceNumber:string){
    let productID = parseInt(this.srSummaryDetailsData.product_id);
    let channel = channelName;
    let bookingID = bookingIDNumber;
    let supplierReference=supplierReferenceNumber;

    if(productID&&channel&&bookingID&&supplierReference){
      const redirectRfqUrl = `${environment.RFQREDIRECTOFFLINE}redirect/booking?product=${productID}&channel=${channel}&booking_id=${bookingID}&supplier_reference=${supplierReference}&from=report`;
      //alert(redirectRfqUrl);
      window.open(redirectRfqUrl, '_blank');
    }
  }


  receiptRedirect(receiptNumber:string){
  let receipt=receiptNumber;
  if(receipt){
    const redirectRfqUrl = `${environment.RFQREDIRECTOFFLINE}redirect/finance?redirect_type=receipt&redirect_reference=${receipt}&from=sr_summary`;
    //alert(redirectRfqUrl);
    window.open(redirectRfqUrl, '_blank');
  }
  }


  paymentRedirect(paymentNumber:string){
    let payment=paymentNumber;
    if(payment){
      const redirectRfqUrl = `${environment.RFQREDIRECTOFFLINE}redirect/finance?redirect_type=payment&redirect_reference=${payment}&from=sr_summary`;
      //alert(redirectRfqUrl);
      window.open(redirectRfqUrl, '_blank');
    }
    }


    redirectQuote(srId){
      if(srId){
       const redirectRfqUrl = `${environment.Quote}quote/info/${srId}`;
       window.open(redirectRfqUrl, '_blank');
     }

     }




  trackByFn(index, item) {
    return index;
  }

}


