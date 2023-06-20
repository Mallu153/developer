import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RfqApiResponse } from '../../rfq-models/rfq-api-response';
import { RfqService } from '../../rfq-services/rfq.service';
import * as RFQURLS from "../../rfq-url-constants/apiurl";

@Component({
  selector: 'app-supplier-other-contacts',
  templateUrl: './supplier-other-contacts.component.html',
  styleUrls: ['./supplier-other-contacts.component.scss']
})
export class SupplierOtherContactsComponent implements OnInit , OnDestroy{
  ngDestroy$ = new Subject();

  @Input() supplierId: number;
  searchText: any;
  page = 1;
  pageSize = 10;
  collectionSize: number;
  public supplierContactsData:any[]=[];
  constructor(
    public activeModal: NgbActiveModal,
    private rfqServices:RfqService,
    private cdr: ChangeDetectorRef,
    private toastrService: ToastrService,
    private modalService: NgbModal,
    ) {

     }

     trackByFn(index, item) {
      return index;
    }

  ngOnInit(): void {
    if(this.supplierId){
      this.getSupplierContacts(this.supplierId)
    }
  }
  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
  getSupplierContacts(supplierId){
    this.rfqServices.getSupplierContacts(supplierId,RFQURLS.RFQ_URL.supplierContacts).pipe(takeUntil(this.ngDestroy$)).subscribe((res: RfqApiResponse) => {
      const result: RfqApiResponse = res;
      if (result.status === 200) {
        this.supplierContactsData = result.data;
          //this.cdr.detectChanges();
        this.cdr.markForCheck();
      } else {
        if(result?.data?.length===0){
          this.toastrService.info('data not available in our system please try again.', 'INFO');
          this.cdr.markForCheck();
        }else{
          this.toastrService.warning('Oops! Something went wrong while fetching supplier Contacts data please try again.');
        }

      }
    });
  }
}
