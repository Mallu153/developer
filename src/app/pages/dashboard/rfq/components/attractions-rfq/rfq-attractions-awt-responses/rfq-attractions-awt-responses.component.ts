import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbTypeahead, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'app/shared/auth/auth.service';
import { Customer } from 'app/shared/models/pax-customer-response';
import { ToastrService } from 'ngx-toastr';
import { RfqApiResponse } from '../../../rfq-models/rfq-api-response';
import { RfqService } from '../../../rfq-services/rfq.service';
import * as RFQURLS from '../../../rfq-url-constants/apiurl';
import { Observable, of, OperatorFunction, concat, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError, filter, takeUntil } from 'rxjs/operators';
import { Supplier } from '../../../rfq-models/supplier-api-response';
import { environment } from 'environments/environment';
import { RfqMailSendComponent } from '../../rfq-mail-send/rfq-mail-send.component';
import { SupplierOtherContactsComponent } from '../../supplier-other-contacts/supplier-other-contacts.component';
import { AttractionPricePopupComponent } from '../attraction-price-popup/attraction-price-popup.component';

@Component({
  selector: 'app-rfq-attractions-awt-responses',
  templateUrl: './rfq-attractions-awt-responses.component.html',
  styleUrls: ['./rfq-attractions-awt-responses.component.scss'],
})
export class RfqAttractionsAwtResponsesComponent implements OnInit, OnDestroy {
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
  constructor(
    private fb: FormBuilder,
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
    this.titleService.setTitle('Attractions-RFQs-Awaiting Supplier Response');
    this.todayDate1 = this.datepipe.transform(this.todayDate, 'yyyy-MM-dd');
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
      this.getSupplierSerachData(Data);
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
      this.getSupplierSerachData(searchObj);
    }
  }

  getSupplierSerachData(searchObj) {
    this.rfqServices.RFQFlightSearch(searchObj, RFQURLS.RFQAttractions.rfqAttractionsList).pipe(takeUntil(this.ngDestroy$)).subscribe(
      (res:any) => {
        if (res?.length > 0) {
          this.supplierData = res?.reverse();
          this.cdr.markForCheck();
        }else{
          if(res?.message){
            this.toastrService.error(res?.message, 'Error');
          }
        }
        if (res?.length === 0) {
          this.toastrService.info('no data found these parameters please try again another parameters ', 'INFO');
        }
      },
      (error) => {
        this.toastrService.error(error, 'Error');
      }
    );
  }

  offline(supplierId,reqId,reqlineId,rfqId) {
    const requestId = reqId;
    const reqLineId = reqlineId;
    const  RFQID=rfqId;
    const  SupplierID=supplierId;
    if(requestId&&reqLineId&&RFQID&&SupplierID){
      const offlineUrl = `${environment.RFQREDIRECTOFFLINE}redirect?sr_no=${requestId}&sr_line_no=${reqLineId}&rfq_no=${RFQID}&supplier_no=${SupplierID}&product=attraction&channel=offline`;


      window.open(offlineUrl, '_blank');
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

  openPricePopup(srId:number,srLineId:number) {
    const modalRef = this.modalService.open(AttractionPricePopupComponent, { size: 'xl' });
    modalRef.componentInstance.name = 'Option Received ';
    modalRef.componentInstance.srLineId = srLineId;
    modalRef.componentInstance.srId = srId;
    //this.cdr.detectChanges();
  }
  openPricePopupAllParamas(srId:number,srLineId:number,rfqId:number,supplierId:number,supplierName:string){
    const  UNICID = {
      srId:srId,
      srLine:srLineId,
      rfqId:rfqId,
      supplierId:supplierId
    };
    const modalRef = this.modalService.open(AttractionPricePopupComponent, { size: 'xl' });
    modalRef.componentInstance.name = 'Option Received ';
    modalRef.componentInstance.unicIDOptions = UNICID;
    modalRef.componentInstance.selectedSupplierName = supplierName;

  }
  openPricePopupRFQId(srId:number,srLineId:number,rfqId:number,supplierName:string) {
    const  UNICID = {
      srId:srId,
      srLine:srLineId,
      rfqId:rfqId

    };
    const modalRef = this.modalService.open(AttractionPricePopupComponent, { size: 'xl' });
    modalRef.componentInstance.name = 'Option Received ';
    modalRef.componentInstance.rfqId = UNICID;
    modalRef.componentInstance.selectedSupplierName = supplierName;
    //this.cdr.detectChanges();
  }

activitiesFormEdit(requestId:number, contactId:number,srLineId:number,rfqId:number){
  const requestNo=requestId;
  const contactNo=contactId;
  const srLineNo=srLineId;
  const rfqNo=rfqId;
  this.router.navigate(['/dashboard/rfq/activities'], {
    queryParams: {
      requestId: requestNo,
      contactId: contactNo,
      srLine: srLineNo,
      activitiesRfq: rfqNo,
    },
  });
}

openActivitiesRequest(requestId:number, contactId:number,srLineId:number){
  const requestNo=requestId;
  const contactNo=contactId;
  const srLineNo=srLineId;

  this.router.navigate([`/dashboard/booking/activities`], {
    queryParams: {
      requestId: requestNo ,
      contactId: contactNo,
      activitiesLineId: srLineNo,
      sources:`request-1`
    },
  });
}



trackByFn(index, item) {
  return index;
}
  ngOnInit(): void {
    this.initializeForm();
    if (this.todayDate1) {
      const Data = {
        fromCreatedDate: this.todayDate1
      };
      this.getSupplierSerachData(Data);
    }
    this.onChangeCustomer('');
    this.loadUserbyName();
  }
  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
