import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AncillaryRfqPricePopupComponent } from 'app/pages/dashboard/rfq/components/ancillary-rfq/ancillary-rfq-price-popup/ancillary-rfq-price-popup.component';
import { AttractionPricePopupComponent } from 'app/pages/dashboard/rfq/components/attractions-rfq/attraction-price-popup/attraction-price-popup.component';
import { HotelRfqPricePopUpComponent } from 'app/pages/dashboard/rfq/components/hotel-rfq/hotel-rfq-price-pop-up/hotel-rfq-price-pop-up.component';
import { PricePopupComponent } from 'app/pages/dashboard/rfq/components/price-popup/price-popup.component';
import { RfqMailSendComponent } from 'app/pages/dashboard/rfq/components/rfq-mail-send/rfq-mail-send.component';
import { SupplierOtherContactsComponent } from 'app/pages/dashboard/rfq/components/supplier-other-contacts/supplier-other-contacts.component';
import { RfqApiResponse } from 'app/pages/dashboard/rfq/rfq-models/rfq-api-response';
import { RfqService } from 'app/pages/dashboard/rfq/rfq-services/rfq.service';
import { ALLRFQLIST } from 'app/pages/dashboard/rfq/rfq-url-constants/apiurl';
import { environment } from 'environments/environment';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-request-depends-rfq-popup',
  templateUrl: './request-depends-rfq-popup.component.html',
  styleUrls: ['./request-depends-rfq-popup.component.scss']
})
export class RequestDependsRfqPopupComponent implements OnInit , OnDestroy{
  ngDestroy$ = new Subject();
  @Input() packageRequestNo: number;
  supplierData:any;
  loading:boolean=false;
  constructor(
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private router: Router,
    private route: ActivatedRoute,
    private rfqServices: RfqService,
    private toastrService: ToastrService,
  ) { }
  getSupplierSerachData(searchObj:any,product:number) {
    this.rfqServices.getAllProductRFQList(searchObj, ALLRFQLIST.packageRfqSupplierSearch,product).pipe(takeUntil(this.ngDestroy$)).subscribe(
      (res:any) => {
        const result:RfqApiResponse = res;
        if(result.statusCode===true){
          if (result?.data?.length === 0) {
            this.supplierData = [];
            this.loading=false;
            this.toastrService.info('no data found these parameters please try again another parameters ', 'INFO');
            this.closeModalWindow();
            this.cdr.markForCheck();
          } else{
            this.loading=false;
            this.supplierData = result?.data;
            this.cdr.markForCheck();
          }
        }else{
          this.loading=false;
          this.supplierData = [];
          this.closeModalWindow();
          this.toastrService.error(result?.message, 'Error');
          this.cdr.markForCheck();
        }

      });
  }


  addPrice(selectedProduct:any){
    if(selectedProduct){
     const requestId = selectedProduct?.requestId;
     const reqLineId = selectedProduct?.requestLineId;
     const RFQID=selectedProduct?.rfqId;
     const SupplierID=selectedProduct?.supplierId;
     if(requestId &&reqLineId &&RFQID&&SupplierID){
       if(selectedProduct?.productName === "Flight"){
         const offlineUrl = `${environment.RFQREDIRECTOFFLINE}/redirect?sr_no=${requestId}&sr_line_no=${reqLineId}&rfq_no=${RFQID}&supplier_no=${SupplierID}&product=flight&channel=offline`;
         window.open(offlineUrl, '_blank');
       }
       if(selectedProduct?.productName === "Attraction"){
         const offlineUrl = `${environment.RFQREDIRECTOFFLINE}redirect?sr_no=${requestId}&sr_line_no=${reqLineId}&rfq_no=${RFQID}&supplier_no=${SupplierID}&product=attraction&channel=offline`;
         window.open(offlineUrl, '_blank');
       }
       if(selectedProduct?.productName === "Ancillary"){
         const offlineUrl = `${environment.RFQREDIRECTOFFLINE}redirect?sr_no=${requestId}&sr_line_no=${reqLineId}&rfq_no=${RFQID}&supplier_no=${SupplierID}&product=ancillary&channel=offline`;
         window.open(offlineUrl, '_blank');
       }
       if(selectedProduct?.productName === "Hotel"){
         const offlineUrl = `${environment.RFQREDIRECTOFFLINE}/redirect?sr_no=${requestId}&sr_line_no=${reqLineId}&rfq_no=${RFQID}&supplier_no=${SupplierID}&product=hotel&channel=offline`;
         window.open(offlineUrl, '_blank');
       }
     }
    }
    }
    onEditProducts(selectedProduct:any){
     if(selectedProduct){
       const REQUESTID = selectedProduct?.requestId;
       const REQUESTLINEID = selectedProduct?.requestLineId;
       const CONTACTID = selectedProduct?.contact;
       const RFQID=selectedProduct?.rfqId;
       const ANXLINETYPEID=selectedProduct?.anxLineTypeId;
       if(REQUESTID && REQUESTLINEID&&CONTACTID&&RFQID){
         if(selectedProduct?.productName === "Flight"){
           this.router.navigate(['/dashboard/rfq/flight'], {
             queryParams: {
               requestId:REQUESTID,
               contactId: CONTACTID,
               srLine:REQUESTLINEID,
               rfq_id:RFQID
             },
           });
           this.closeModalWindow();
         }
         if(selectedProduct?.productName === "Ancillary"&&ANXLINETYPEID){
             this.router.navigate(['/dashboard/rfq/ancillary'], {
               queryParams: {
                 requestId:REQUESTID,
                 contactId: CONTACTID,
                 serviceTypeId: btoa(escape(ANXLINETYPEID)),
                 srLine:REQUESTLINEID,
                 rfqAncillary_id:RFQID
               },
             });
             this.closeModalWindow();
         }
         if(selectedProduct?.productName === "Hotel"){
           this.router.navigate(['/dashboard/rfq/hotel'], {
             queryParams: {
               requestId:REQUESTID,
               contactId: CONTACTID,
               srLine:REQUESTLINEID,
               hotelRfq:RFQID
             },
           });
           this.closeModalWindow();
         }
       }
     }
   }


   openServiceRequest(selectedProduct:any){
     if(selectedProduct){
       const REQUESTID = selectedProduct?.requestId;
       const REQUESTLINEID = selectedProduct?.requestLineId;
       const CONTACTID = selectedProduct?.contact;
       const ANXLINETYPEID=selectedProduct?.anxLineTypeId;
       if(REQUESTID&&REQUESTLINEID&&CONTACTID){
         if(selectedProduct?.productName === "Flight"){
           this.router.navigate(['/dashboard/booking/flight'], {
             queryParams: { requestId:REQUESTID, contactId: CONTACTID,srLineId:REQUESTLINEID },
           });
           this.closeModalWindow();
         }
         if(selectedProduct?.productName === "Hotel"){
           this.router.navigate(['/dashboard/booking/hotel'], {
             queryParams: { requestId:REQUESTID, contactId: CONTACTID,hotelLineId:REQUESTLINEID },
           });

           this.closeModalWindow();

         }
         if(selectedProduct?.productName === "Ancillary"&&ANXLINETYPEID){
             this.router.navigate(['/dashboard/booking/ancillary'], {
               queryParams: {
                 requestId:REQUESTID,
                 contactId: CONTACTID,
                 serviceTypeId: btoa(escape(ANXLINETYPEID)),
                 anxLineId:REQUESTLINEID
               },
             });
             this.closeModalWindow();
         }
       }
     }
   }



   openPricePopupRFQId(selectedProduct:any) {
     if(selectedProduct){
       const RFQID=selectedProduct?.rfqId;
       const SUPPLIERNAME=selectedProduct?.supplier;
       if(RFQID){
         if(selectedProduct?.productName === "Flight"){
           const modalRef = this.modalService.open(PricePopupComponent, { size: 'xl' });
           modalRef.componentInstance.name = 'Option Received ';
           modalRef.componentInstance.rfqId = RFQID;
         }
         if(selectedProduct?.productName === "Hotel"&&SUPPLIERNAME){
             const modalRef = this.modalService.open(HotelRfqPricePopUpComponent, { size: 'xl', windowClass: 'my-class'  });
             modalRef.componentInstance.name = 'Option Received ';
             modalRef.componentInstance.rfqId = RFQID;
             modalRef.componentInstance.selectedSupplierName = SUPPLIERNAME;
         }
         if(selectedProduct?.productName === "Ancillary"&&SUPPLIERNAME){
           const modalRef = this.modalService.open(AncillaryRfqPricePopupComponent, { size: 'xl', windowClass: 'my-class'  });
           modalRef.componentInstance.name = 'Option Received ';
           modalRef.componentInstance.rfqId = RFQID;
           modalRef.componentInstance.selectedSupplierName = SUPPLIERNAME;
         }
         if(selectedProduct?.productName === "Attraction"&&SUPPLIERNAME){
           const modalRef = this.modalService.open(AttractionPricePopupComponent, { size: 'xl' });
           modalRef.componentInstance.name = 'Option Received ';
           modalRef.componentInstance.rfqId = RFQID;
           modalRef.componentInstance.selectedSupplierName = SUPPLIERNAME;
         }
       }
     }
   }

   openPricePopupAllParamas(selectedProduct:any){
     if(selectedProduct){
       const REQUESTID = selectedProduct?.requestId;
       const REQUESTLINEID = selectedProduct?.requestLineId;
       const RFQID=selectedProduct?.rfqId;
       const SUPPLIERID=selectedProduct?.supplierId;
       const SUPPLIERNAME=selectedProduct?.supplier;


       if(REQUESTID&&REQUESTLINEID&&RFQID&&SUPPLIERNAME&&SUPPLIERID){
         const  UNICID = {
           srId:REQUESTID,
           srLine:REQUESTLINEID,
           rfqId:RFQID,
           supplierId:SUPPLIERID
         };

         if(selectedProduct?.productName === "Flight"){
           const modalRef = this.modalService.open(PricePopupComponent, { size: 'xl' });
           modalRef.componentInstance.name = 'Option Received ';
           modalRef.componentInstance.unicIDOptions = UNICID;
           modalRef.componentInstance.selectedSupplierName = SUPPLIERNAME;
         }
         if(selectedProduct?.productName === "Hotel"&&SUPPLIERNAME){
           const modalRef = this.modalService.open(HotelRfqPricePopUpComponent, { size: 'xl' ,windowClass: 'my-class'  });
           modalRef.componentInstance.name = 'Option Received ';
           modalRef.componentInstance.unicIDOptions = UNICID;
           modalRef.componentInstance.selectedSupplierName = SUPPLIERNAME;
         }
         if(selectedProduct?.productName === "Ancillary"&&SUPPLIERNAME){
           const modalRef = this.modalService.open(AncillaryRfqPricePopupComponent, { size: 'xl' ,windowClass: 'my-class'  });
           modalRef.componentInstance.name = 'Option Received ';
           modalRef.componentInstance.unicIDOptions = UNICID;
           modalRef.componentInstance.selectedSupplierName = SUPPLIERNAME;
         }
         if(selectedProduct?.productName === "Attraction"&&SUPPLIERNAME){
           const modalRef = this.modalService.open(AttractionPricePopupComponent, { size: 'xl' });
           modalRef.componentInstance.name = 'Option Received ';
           modalRef.componentInstance.unicIDOptions = UNICID;
           modalRef.componentInstance.selectedSupplierName = SUPPLIERNAME;
         }
       }

     }


   }
     openOtherContacts(supplierId:number){
       const modalRef = this.modalService.open(SupplierOtherContactsComponent, { size: 'xl' });
       modalRef.componentInstance.name = 'Contacts';
       modalRef.componentInstance.supplierId = supplierId;
     }

     openEmailForm(srId:number,toName:string){
       const modalRef = this.modalService.open(RfqMailSendComponent, { size: 'xl' });
       modalRef.componentInstance.name = 'Send Email';
       //modalRef.componentInstance.indexNumber = index;
       modalRef.componentInstance.toEmail = toName;
       modalRef.componentInstance.sr_id = srId;
     }

  /**
   * A method to close the route link on clicking go button
   */
   closeModalWindow() {
    if (this.modalService.hasOpenModals()) {
      this.modalService.dismissAll();

    }
  }

  trackByFn(index, item) {
    return index;
  }
  ngOnInit(): void {
    //requestId
    const searchData={
      requestId:this.packageRequestNo
      //fromCreatedDate: "2022-11-29"
    };
    this.loading=true;
    this.getSupplierSerachData(searchData,0);
  }
  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }

}
