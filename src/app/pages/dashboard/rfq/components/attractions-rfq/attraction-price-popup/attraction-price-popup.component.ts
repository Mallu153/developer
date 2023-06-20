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
import { addToQuote, attraction_Booking_Price_url } from '../../../rfq-url-constants/apiurl';

@Component({
  selector: 'app-attraction-price-popup',
  templateUrl: './attraction-price-popup.component.html',
  styleUrls: ['./attraction-price-popup.component.scss']
})
export class AttractionPricePopupComponent implements OnInit, OnDestroy  {
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
  getPriceDetailesAllParamas(object){
    this.rfqServices.getbookingInfoAllParamas(object,attraction_Booking_Price_url.attractionbookinginfo).pipe(takeUntil(this.ngDestroy$)).subscribe((priceData: RfqApiResponse) => {
      const result: RfqApiResponse = priceData;
      if (result.status === 200) {


        this.cdr.markForCheck();
        if(result.data.length>0){
          this.priceApiResponseData = result.data;
        }else{
          this.closePopup();

          this.cdr.markForCheck();
        }
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



  trackByFn(index, item) {
    return index;
  }

}
