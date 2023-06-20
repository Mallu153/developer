import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbTypeahead, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'app/shared/auth/auth.service';
import { Customer } from 'app/shared/models/pax-customer-response';
import { ToastrService } from 'ngx-toastr';
import { RfqApiResponse } from '../../rfq-models/rfq-api-response';
import { RfqService } from '../../rfq-services/rfq.service';
import * as RFQURLS from '../../rfq-url-constants/apiurl';
import { Observable, of, OperatorFunction, concat, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError, filter, takeUntil } from 'rxjs/operators';
import { Supplier } from '../../rfq-models/supplier-api-response';
import { DatePipe } from '@angular/common';
import { SupplierOtherContactsComponent } from '../supplier-other-contacts/supplier-other-contacts.component';
import { RfqMailSendComponent } from '../rfq-mail-send/rfq-mail-send.component';
import { environment } from 'environments/environment';
import { MasterDataService } from 'app/shared/services/master-data.service';
import { PricePopupComponent } from '../price-popup/price-popup.component';
import { HotelRfqPricePopUpComponent } from '../hotel-rfq/hotel-rfq-price-pop-up/hotel-rfq-price-pop-up.component';
import { AncillaryRfqPricePopupComponent } from '../ancillary-rfq/ancillary-rfq-price-popup/ancillary-rfq-price-popup.component';
import { AttractionPricePopupComponent } from '../attractions-rfq/attraction-price-popup/attraction-price-popup.component';
@Component({
  selector: 'app-rfq-list',
  templateUrl: './rfq-list.component.html',
  styleUrls: ['./rfq-list.component.scss']
})
export class RfqListComponent implements OnInit , OnDestroy{

  ngDestroy$ = new Subject();
  public supplierData: any;
  public contactData: any;
  public usersData: any;
  public supplierDeatils: any;
  //search setup
  searchText: any;
  page = 1;
  pageSize = 10;
  collectionSize: number;
  supplierFilterForm: FormGroup;
  submitted = false;
  //date
  todayDate = new Date();
  todayDate1: string;
  // Global variables to display whether is loading or failed to load the data
  noResults: boolean;
  searchTerm: string;
  searchResult: Customer[];
  formatter = (customer: Customer) => customer?.businessName;
  @ViewChild('typeaheadInstance') typeaheadInstance: NgbTypeahead;
  customerId: any;
  contactList: any[];
  loading: boolean = false;

  //supplier
  @ViewChild('suppliertypeaheadInstance') suppliertypeaheadInstance: NgbTypeahead;
  noSupplierResults: boolean;
  searchSupplierTerm: string;
  searchSupplierResult: Supplier[];
  Supplierformatter = (supplier: Supplier) => supplier.businessName;

  //Created by
  userName$: Observable<any>;
  userNameLoading = false;
  userNameInput$ = new Subject<string>();
  minLengthUserNameTerm = 2;
  //supplier info
  supplierResponse: [] = [];
  productList: any[] = [];


  constructor(
    private fb: FormBuilder,
    public masterDataService: MasterDataService,
    private route: ActivatedRoute,
    private router: Router,
    private toastrService: ToastrService,
    private cdr: ChangeDetectorRef,
    private datepipe: DatePipe,
    private titleService: Title,
    private rfqServices: RfqService,
    private authService: AuthService,
    private modalService: NgbModal
  ) {
    this.titleService.setTitle('RFQ List');
    this.todayDate1 = this.datepipe.transform(this.todayDate, 'yyyy-MM-dd');
  }
  getProduct() {
    this.masterDataService.getGenMasterDataByTableName('master_products').pipe(takeUntil(this.ngDestroy$)).subscribe((res) => {
      if (res?.length>0) {
        this.productList = res;
        this.cdr.markForCheck();
      } else {
        this.toastrService.error('Oops! Something went wrong while fetching the Product type data please try again ','Error');
        this.cdr.markForCheck();
      }
    });
  }
  /**
   * Trigger a call to the API to get the customer
   * data for from input
   */
  onSearchCustomer: OperatorFunction<string, readonly { name; country; code }[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap((term: string) => (this.searchTerm = term)),
      switchMap((term) =>
        term.length >= 3
          ? this.rfqServices.getCustomerData(term).pipe(
              tap((response: Customer[]) => {
                this.noResults = response.length === 0;
                if (this.noResults) {
                  this.toastrService.error(`no data found given search ${term} `, 'Error');
                }
                this.searchResult = [...response];
              }),
              catchError(() => {
                return of([]);
              })
            )
          : of([])
      ),
      tap(() => this.cdr.markForCheck()),
      tap(() => {
        this.searchTerm === '' || this.searchTerm.length <= 2
          ? []
          : this.searchResult?.filter((v) => v.businessName.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1);
      })
    );

  /**
   * A method to bind the value of seclected element from the dropdown
   * @param $event dropdown selected option
   * @param nameOfControl name of the form control in the dynamic form
   */
  bindValueOfControl($event: NgbTypeaheadSelectItemEvent, nameOfControl: string) {
    if ($event !== undefined && nameOfControl) {
      if (nameOfControl === 'customerId') {
        this.customerId = Number($event.item?.customerId);
        if (this.customerId) {
          this.customerDependsOnContactList(this.customerId);
        }
      }
    }
  }
  onChangeCustomer(value) {
    if (value === '') {
      this.contactList = [];
      this.supplierFilterForm.get('customerContactId').disable();

    } else {
      this.supplierFilterForm.get('customerContactId').enable();

    }
  }
  customerDependsOnContactList(customerNumber: number) {
    this.rfqServices.getContactData(customerNumber, RFQURLS.RFQ_List.contact).pipe(takeUntil(this.ngDestroy$)).subscribe((data: any) => {
      if (data) {
        this.contactList = data;
        this.cdr.markForCheck();
      } else {
        this.toastrService.error(
          'Oops! Something went wrong  while fetching the contact data please try again',
          'Error'
        );
      }
    });
  }
  /**
   * Trigger a call to the API to get the supplier
   * data for from input
   */
  onSearchSupplier: OperatorFunction<string, readonly { name; code }[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap((term: string) => (this.searchSupplierTerm = term)),
      switchMap((term) =>
        term.length >= 3
          ? this.rfqServices.getSupplierByName(RFQURLS.RFQ_List.supplier, term).pipe(
              tap((response: Supplier[]) => {
                this.noSupplierResults = response.length === 0;
                if (this.noSupplierResults) {
                  this.toastrService.error(`no supplier found given  ${term}`, 'Error');
                }
                this.searchSupplierResult = [...response];
              }),
              catchError(() => {
                return of([]);
              })
            )
          : of([])
      ),
      tap(() => this.cdr.markForCheck()),
      tap(() =>
        this.searchSupplierTerm === '' || this.searchSupplierTerm.length <= 2
          ? []
          : this.searchSupplierResult.filter(
              (v) => v.businessName.toLowerCase().indexOf(this.searchSupplierTerm.toLowerCase()) > -1
            )
      )
    );

  loadUserbyName() {
    this.userName$ = concat(
      of([]), // default items
      this.userNameInput$.pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthUserNameTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.cdr.markForCheck(), (this.userNameLoading = true))),
        switchMap((term) => {
          return this.rfqServices.getUsersByName(RFQURLS.RFQ_List.getUsersByName, term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.userNameLoading = false))
          );
        })
      )
    );
  }
  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  initializeForm() {
    this.supplierFilterForm = this.fb.group({
      createdBy: '',
      fromCreatedDate: this.todayDate1,
      toCreatedDate: '',
      requestId: '',
      requestLineId: '',
      rfqId: '',
      //sno:'',
      status: '1',
      supplierId: '',
      //updatedBy:'',
      //updatedDate:'',
      customerId: '',
      customerContactId: '',
      productId:''
    });
  }

  get f() {
    return this.supplierFilterForm.controls;
  }
  reset() {
    this.supplierFilterForm.reset();
    this.supplierFilterForm.controls.status.setValue('1');
    this.supplierFilterForm.controls.fromCreatedDate.setValue(this.todayDate1);
    if (this.todayDate1) {
      const Data = {
        fromCreatedDate: this.todayDate1,
        //createdDate:this.todayDate1
      };
      this.getSupplierSerachData(Data,0);
    }
    //this.supplierData=[];
  }
  checkStartDateAndEndDate(startDate, enddate): boolean {
    if (startDate && enddate) {
      if (startDate != null && enddate != null && enddate < startDate) {
        this.toastrService.error('To Created Date should be greater than  From Created Date', 'Error');
        return false;
      } else {
        return true;
      }
    }
    return false;
  }
  onApplySerachForm() {
    this.submitted = true;
    let searchObj = {};
    const createdBy = this.supplierFilterForm.value.createdBy;
    const fromCreatedDate = this.supplierFilterForm.value.fromCreatedDate;
    const toCreatedDate = this.supplierFilterForm.value.toCreatedDate;
    const requestId = this.supplierFilterForm.value.requestId;
    const requestLineId = this.supplierFilterForm.value.requestLineId;
    const rfqId = this.supplierFilterForm.value.rfqId;
    const status = 1;
    const supplierId = this.supplierFilterForm.value.supplierId?.customerId;
    const customerId = this.supplierFilterForm.value.customerId?.customerId;
    const contactId = this.supplierFilterForm.value.customerContactId;
    const productId = this.supplierFilterForm.value.productId===''|| this.supplierFilterForm.value.productId===null?0:this.supplierFilterForm.value.productId;

    if (customerId) {
      searchObj['customerId'] = customerId;
    }
    if (contactId) {
      searchObj['contactId'] = Number(contactId);
    }
    if (createdBy) {
      searchObj['createdBy'] = Number(createdBy);
    }
    if (fromCreatedDate) {
      searchObj['fromCreatedDate'] = fromCreatedDate;
    }
    if (fromCreatedDate && toCreatedDate) {
      if (fromCreatedDate && toCreatedDate) {
        if (fromCreatedDate && toCreatedDate) {
          const data: boolean = this.checkStartDateAndEndDate(fromCreatedDate, toCreatedDate);
          if (!data) {
            return;
          }
        }
        searchObj['toCreatedDate'] = toCreatedDate;
      }
    }

    if (requestId) {
      searchObj['requestId'] = Number(requestId);
    }
    if (requestLineId) {
      searchObj['requestLineId'] = Number(requestLineId);
    }
    if (rfqId) {
      searchObj['rfqId'] = Number(rfqId);
    }
    if (status) {
      searchObj['status'] = Number(status);
    }
    if (supplierId) {
      searchObj['supplierId'] = Number(supplierId);
    }
    if (Object.keys(searchObj).length === 0) {
      this.toastrService.error('Please give any of field and search', 'Error');
    } else {
      this.getSupplierSerachData(searchObj,productId);
    }
  }

  getSupplierSerachData(searchObj:any,product:number) {
    this.rfqServices.getAllProductRFQList(searchObj, RFQURLS.ALLRFQLIST.packageRfqSupplierSearch,product).pipe(takeUntil(this.ngDestroy$)).subscribe(
      (res:any) => {
        const result:RfqApiResponse = res;
        if(result.status===200){
          if (result?.data?.length === 0) {
            this.supplierData = [];
            this.toastrService.info('no data found these parameters please try again another parameters ', 'INFO');
            this.cdr.markForCheck();
          } else{
            this.supplierData = result?.data;
            this.cdr.markForCheck();
          }
        }else{
          this.toastrService.error(result?.message, 'Error');
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
      }
      if(selectedProduct?.productName === "Hotel"){
        this.router.navigate(['/dashboard/booking/hotel'], {
          queryParams: { requestId:REQUESTID, contactId: CONTACTID,hotelLineId:REQUESTLINEID },
        });
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

  trackByFn(index, item) {
    return index;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.getProduct();
    if (this.todayDate1) {
      const Data = {
        fromCreatedDate: this.todayDate1
      };
      this.getSupplierSerachData(Data,0);
    }
    this.onChangeCustomer('');
    this.loadUserbyName();
  }
  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }

}
