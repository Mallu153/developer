import { DatePipe, formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'app/shared/auth/auth.service';
import { environment } from 'environments/environment';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RfqApiResponse } from '../../../rfq-models/rfq-api-response';
import { RfqService } from '../../../rfq-services/rfq.service';
import { addToQuote, hotel_Booking_Price_url, RFQ_Ancillary } from '../../../rfq-url-constants/apiurl';

@Component({
  selector: 'app-ancillary-rfq-price-popup',
  templateUrl: './ancillary-rfq-price-popup.component.html',
  styleUrls: ['./ancillary-rfq-price-popup.component.scss']
})
export class AncillaryRfqPricePopupComponent implements OnInit, OnDestroy  {
  ngDestroy$ = new Subject();
  @Input() srLineId: number;
  @Input() srId: number;
  @Input() rfqId: any;
  @Input() unicIDOptions: number;
  @Input() selectedSupplierName: string;
  priceApiResponseData:any[];
 /*   ADTTotal =0;
   CHDTotal =0;
   INFTotal =0; */
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
  }



  closePopup() {
    if (this.modalService.hasOpenModals()) {
      this.modalService.dismissAll();
    }
  }

  trackByFn(index, item) {
    return index;
  }

  ngOnInit(): void {
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
  getPriceDetailesAllParamas(selectedObj){
    this.rfqServices.getbookingInfoAllParamas(selectedObj,RFQ_Ancillary.ancillarybookingInfo).pipe(takeUntil(this.ngDestroy$)).subscribe((priceData: RfqApiResponse) => {
      const result: RfqApiResponse = priceData;
      if (result.status === 200) {
        if(result.data.length>0){
          this.priceApiResponseData = result.data;
          this.cdr.markForCheck();
        }else{
          this.closePopup();
          this.cdr.markForCheck();
        }

      } else {
        if(result.status===204){
          this.toastrService.info(result.message, 'INFO');
          this.closePopup();
          this.cdr.markForCheck();
        }
      }
    });
  }


  getPaxCount(paxInfo:any[]) {
    let ADTTotal =0;
    let CHDTotal =0;
    let INFTotal =0;
    let paxArray=[];
    for (let index = 0; index < paxInfo.length; index++) {
      const element = paxInfo[index];
      if(element.paxType =='AD'){
        ADTTotal = ADTTotal+index;
      }
       if(element.paxType =='CH'){
        CHDTotal = CHDTotal+index;
      }
      if(element.paxType =='IN'){
        INFTotal = INFTotal+index;
      }
      const MODIFY_PAX_COUNT={
        ADT:'ADT - '+ADTTotal,
        CHD:'CHD - '+CHDTotal,
        INF:'INF - '+INFTotal
      };
      //console.log(MODIFY_PAX_COUNT);
      paxArray.push(MODIFY_PAX_COUNT);
    }

    return [];
  }
  offline(productID:number,channel:string,bookingID:number,bookingReferenceNumber:string) {

    if(productID&&channel&&bookingID&&bookingReferenceNumber){
      const redirectRfqUrl = `${environment.RFQREDIRECTOFFLINE}redirect/booking?product=${productID}&channel=${channel}&booking_id=${bookingID}&booking_reference=${bookingReferenceNumber}&from=report`;
      window.open(redirectRfqUrl, '_blank');
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
      this.rfqServices.saveQuotes(saveQuotesData,addToQuote.saveQuoteInfo).pipe(takeUntil(this.ngDestroy$)).subscribe((res: RfqApiResponse) => {
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
