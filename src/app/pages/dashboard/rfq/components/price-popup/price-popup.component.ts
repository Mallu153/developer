import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RfqApiResponse } from '../../rfq-models/rfq-api-response';
import { RfqService } from '../../rfq-services/rfq.service';
import * as RFQURLS from "../../rfq-url-constants/apiurl";
import { AuthService } from 'app/shared/auth/auth.service';
import { DatePipe, formatDate } from '@angular/common';
@Component({
  selector: 'app-price-popup',
  templateUrl: './price-popup.component.html',
  styleUrls: ['./price-popup.component.scss']
})
export class PricePopupComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  @Input() srLineId: number;
  @Input() srId: number;
  @Input() rfqId: any;
  @Input() unicIDOptions: number;
  @Input() selectedSupplierName: string;
  public priceApiResponseData:any[]=[];
  public bookingInformationData:any[]=[];
  public supplierData:any[]=[];
  public routeData:any[]=[];
  public priceData:any[]=[];
  public noData:boolean=false;

   //today date
   todayDate = new Date();
   todayDate1: string;
   todaydateAndTimeStamp: string;
  constructor(
    public activeModal: NgbActiveModal,
    private rfqServices:RfqService,
    private cdr: ChangeDetectorRef,
    private toastrService: ToastrService,
    private modalService: NgbModal,
    private authService:AuthService,
    private datepipe: DatePipe,
    ) {
      this.todayDate1 = this.datepipe.transform(this.todayDate, 'yyyy-MM-dd');
      this.todaydateAndTimeStamp = formatDate(this.todayDate, 'yyyy-MM-ddThh:mm:ss', 'en-US', '+0530');
      //let mySplitString = this.stringSplitter('040821', 2);
      //console.log(mySplitString);

     }



  ngOnInit(): void {
    if(this.srId && this.srLineId){
      const sr_data={
        srId:this.srId,
        srLine:this.srLineId
      };
      this.getPriceDetailesAllParamas(sr_data);
    }
    if(this.rfqId){

      this.getPriceDetailesAllParamas(this.rfqId);
    }
    if(this.unicIDOptions){
      this.getPriceDetailesAllParamas(this.unicIDOptions);
    }

  }
  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }

  trackByFn(index, item) {
    return index;
  }
  getPriceDetailesAllParamas(object){
    this.rfqServices.getbookingInfoAllParamas(object,RFQURLS.flightBooking_Price_url.bookingInfo).pipe(takeUntil(this.ngDestroy$)).subscribe((priceData: RfqApiResponse) => {
      const result: RfqApiResponse = priceData;
      if (result.status === 200) {
        if(result?.data?.length>0){
          this.priceApiResponseData = result.data;
          this.cdr.markForCheck();
        }else{
          this.closePopup();
          this.toastrService.info('data not available in our system please try again.', 'INFO');
          this.cdr.markForCheck();
        }

        //this.cdr.markForCheck();
      } else {
        if(result.status===204){
          this.toastrService.info('data not available in our system please try again.', 'INFO');
          this.closePopup();
          //this.noData=true;
          this.cdr.markForCheck();
        }else{
          this.closePopup();
          this.toastrService.info('Oops! Something went wrong while fetching the Price data please try again.', 'INFO');
        }

      }
    });
  }



   closePopup() {
    if (this.modalService.hasOpenModals()) {
      this.modalService.dismissAll();
    }
  }

  stringSplitter(myString, chunkSize) {
    let splitString = [];
    for (let i = 0; i < myString?.length; i = i + chunkSize) {
        splitString.push(myString?.slice(i, i + chunkSize));
    }
    return splitString;
}


offline(bookingId:number,priceData:any) {
  const  BOOKINGID=bookingId;
  if(BOOKINGID&&priceData?.length>0){
    const offlineUrl = `${environment.RFQREDIRECTOFFLINE}redirect/rfq?booking_id=${BOOKINGID}&from=rfq&options=yes`;
    window.open(offlineUrl, '_blank');

  }else{
    const offlineUrlNoOpen = `${environment.RFQREDIRECTOFFLINE}redirect/rfq?booking_id=${BOOKINGID}&from=rfq`;
    window.open(offlineUrlNoOpen, '_blank');
  }
}



onSaveQuote(bookingID:number,productID:number,bookingRefernce:string){

  if(bookingID&&productID&&bookingRefernce){
    const saveQuotesData={
      bookingReferenceNo: bookingRefernce,
      bookingId: bookingID,
      productId: productID,
      createdBy: this.authService.getUser(),
      createdDate: this.todaydateAndTimeStamp
    };
    this.rfqServices.saveQuotes(saveQuotesData,RFQURLS.addToQuote.saveQuoteInfo).pipe(takeUntil(this.ngDestroy$)).subscribe((res: RfqApiResponse) => {
      const result: RfqApiResponse = res;
      if (result.status === 200) {
        this.toastrService.success(result.message, 'Success');
        this.cdr.markForCheck();
      } else {
        this.toastrService.error(result.message, 'Error');
        this.cdr.markForCheck();
      }
    });
  }
}

}
