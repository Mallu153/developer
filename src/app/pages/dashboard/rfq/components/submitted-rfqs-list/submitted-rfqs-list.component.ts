import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbTypeahead, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

import { Observable, of, OperatorFunction, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError, takeUntil } from 'rxjs/operators';
import { RfqService } from '../../rfq-services/rfq.service';
import * as RFQURLS from "../../rfq-url-constants/apiurl";
import { RfqApiResponse } from '../../rfq-models/rfq-api-response';
import { Supplier } from '../../rfq-models/supplier-api-response';
import { Customer } from 'app/shared/models/pax-customer-response';

@Component({
  selector: 'app-submitted-rfqs-list',
  templateUrl: './submitted-rfqs-list.component.html',
  styleUrls: ['./submitted-rfqs-list.component.scss']
})
export class SubmittedRfqsListComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  openRFQForm: FormGroup;
  submitted = false;
  // Global variables to display whether is loading or failed to load the data
  noResults: boolean;
  searchTerm: string;
  searchResult: Customer[];
  formatter = (customer: Customer) => customer?.businessName;
  @ViewChild('typeaheadInstance') typeaheadInstance: NgbTypeahead;
  customerId: any;
  contactList: any[];
  loading:boolean=false;

  @ViewChild('suppliertypeaheadInstance') suppliertypeaheadInstance: NgbTypeahead;
  noSupplierResults: boolean;
  searchSupplierTerm: string;
  searchSupplierResult: Supplier[];
  Supplierformatter = (supplier: Supplier) => supplier.businessName;
  public apiResponseData:[]=[];
  supplierContactList:any=[];
  //search setup
  searchText: any;
  page = 1;
  pageSize = 10;
  collectionSize: number;
  priceData:any[]=[];
  public isCollapsed = false;
  constructor(
    private fb:FormBuilder,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private route: ActivatedRoute,
    private datepipe: DatePipe,
    private toastrService: ToastrService,
    private cdr: ChangeDetectorRef,
    private titleService: Title,
    private spinnerService: NgxSpinnerService,
    private rfqServices:RfqService,
  ) {
    this.titleService.setTitle('Submitted RFQ List');
  }



 /**
  * Trigger a call to the API to get the customer
  * data for from input
  */
  onSearchCustomer: OperatorFunction<string, readonly { name; country, code }[]> = (text$: Observable<string>) =>
  text$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    tap((term: string) => (this.searchTerm = term)),
    switchMap((term) =>
      term.length >= 3
        ? this.rfqServices.getCustomerData(term).pipe(
          tap((response:Customer[]) => {
            this.noResults = response.length === 0;
            if(this.noResults){
            this.toastrService.error(`no data found given search ${term} `,"Error");
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
        : this.searchResult?.filter((v) => v.businessName.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1)
    }));


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

 bindValueOfControlSupplier($event: NgbTypeaheadSelectItemEvent, nameOfControl: string) {
  if ($event !== undefined && nameOfControl) {
    if (nameOfControl === 'supplierId') {
      this.customerId = Number($event.item?.customerId);
      if (this.customerId) {
        this.supplierDependsOnContactList(this.customerId);
        this.openRFQForm.get('supplierContactId').enable();
      }
    }else{
     this.openRFQForm.get('supplierContactId').disable();
    }
  }
}
 customerDependsOnContactList(customerNumber: number) {
   this.rfqServices.getContactData(customerNumber, RFQURLS.RFQ_List.contact).pipe(takeUntil(this.ngDestroy$)).subscribe((data: any) => {
     if(data){
       this.contactList = data;
       this.cdr.detectChanges();
     }else{
       this.toastrService.error('Oops! Something went wrong  while fetching the contact data please try again', 'Error');
     }

   });
 }
 supplierDependsOnContactList(customerNumber: number) {
  this.rfqServices.getContactData(customerNumber, RFQURLS.RFQ_List.contact).pipe(takeUntil(this.ngDestroy$)).subscribe((data: any) => {
    if(data){
      this.supplierContactList = data;
      this.cdr.detectChanges();
    }else{
      this.toastrService.error('Oops! Something went wrong  while fetching the Supplier contact data please try again', 'Error');
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
                this.toastrService.error(`no supplier found given  ${term}`, "Error");
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
          : this.searchSupplierResult.filter((v) => v.businessName.toLowerCase().indexOf(this.searchSupplierTerm.toLowerCase()) > -1)
      )
    );
 ngOnInit(): void {
  this.initializeForm();
  this.onChangeCustomer("");
  this.onChangeSupplier("");
}
ngOnDestroy(){
  this.ngDestroy$.next(true);
  this.ngDestroy$.complete();
}
initializeForm(){
  this.openRFQForm= this.fb.group({
    agentId:'',
    customerId:'',
    customerContactId:'',
    supplierId:'',
    srId:'',
    srCreationDate:'',
    rfqCreationDate:'',
    supplierContactId:''
  })
 }
 get f() {
  return this.openRFQForm.controls;
}
reset(){
  this.submitted = false;
  this.openRFQForm.reset();
  this.contactList = [];
  this.openRFQForm.controls.customerContactId.setValue('');
  this.openRFQForm.controls.customerId.setValue('');
  this.openRFQForm.get('customerContactId').disable();
  this.apiResponseData=null;
}
onChangeCustomer(value) {
  if (value === '') {
    this.contactList = [];
    this.openRFQForm.get('customerContactId').disable();
    //this.cd.detectChanges();
  } else {
    this.openRFQForm.get('customerContactId').enable();
    //this.cd.detectChanges();
  }
}
onChangeSupplier(value) {
  if (value === '') {
    this.contactList = [];
    this.openRFQForm.get('supplierContactId').disable();
    //this.cd.detectChanges();
  } else {
    this.openRFQForm.get('supplierContactId').enable();
    //this.cd.detectChanges();
  }
}
onSubmittedSearchForm(){
  this.submitted = true;
  if(this.openRFQForm.valid){
    let searchObj = {};
    if (this.openRFQForm.value.agentId === '' || this.openRFQForm.value.agentId ===  null) {
      searchObj['agentId'] = 0;
    }else{
      searchObj['agentId'] = this.openRFQForm.value.agentId;
    }
    if (this.openRFQForm.value.supplierId === '' || this.openRFQForm.value.supplierId ===  null
    ||this.openRFQForm.value.supplierId === undefined || typeof this.openRFQForm.value.supplierId !=='object') {
      searchObj['supplierId'] = 0;
    }else{
      searchObj['supplierId'] = this.openRFQForm.value.supplierId.customerId;
    }

    if (this.openRFQForm.value.customerId === '' || this.openRFQForm.value.customerId === undefined || Number.isNaN(this.openRFQForm.value.customerId) || typeof this.openRFQForm.value.customerId !=='object') {
      searchObj['customerId'] = 0;
    }else{
      searchObj['customerId'] = Number(this.openRFQForm.value.customerId?.customerId);
    }
    if (this.openRFQForm.value.customerContactId === '' || this.openRFQForm.value.customerContactId === undefined || Number.isNaN(this.openRFQForm.value.customerContactId)) {
      searchObj['customerContactId'] = 0;
    }else{
      searchObj['customerContactId'] = Number(this.openRFQForm.value.customerContactId);
    }
    if (this.openRFQForm.value.supplierContactId === '' || this.openRFQForm.value.supplierContactId === undefined || Number.isNaN(this.openRFQForm.value.supplierContactId)) {
      searchObj['supplierContactId'] = 0;
    }else{
      searchObj['supplierContactId'] = Number(this.openRFQForm.value.supplierContactId);
    }
    if (this.openRFQForm.value.srId === '') {
      searchObj['srId'] = 0;
    }else{
      searchObj['srId'] = Number(this.openRFQForm.value.srId);
    }
    if (this.openRFQForm.value.srCreationDate === '' || this.openRFQForm.value.srCreationDate === null) {
      //searchObj['srCreationDate'] = 0;
    }else{
      searchObj['srCreationDate'] = this.openRFQForm.value.srCreationDate;
    }
    if (this.openRFQForm.value.rfqCreationDate === '' || this.openRFQForm.value.rfqCreationDate === null) {
      //searchObj['rfqCreationDate'] = 0;
    }else{
      searchObj['rfqCreationDate'] = this.openRFQForm.value.rfqCreationDate;
    }

    if(searchObj){
      this.showSpinner();
      this.loading=true;
      this.onSearchForm(searchObj);
    }

  }

}
public showSpinner(): void {
  this.spinnerService.show();
  /* setTimeout(() => {
    this.spinnerService.hide();
  }, 5000); // 5 seconds */
}
onSearchForm(searchObj){
  this.rfqServices.getRFQList(searchObj, RFQURLS.RFQ_List.openRFQList).pipe(takeUntil(this.ngDestroy$)).subscribe((res) => {
    const result:any = res;
    if (result.status === 200) {
      //this.cd.detectChanges();
      this.loading=false;
      this.spinnerService.hide();
      this.apiResponseData=result.data[0];
      this.isCollapsed = true;
      //this.apiResponseData=result.data;
    } else {

      if (result.status === 204 || result.status === 409 || result.status === 400 || result.status === 500  || result.status === 404 ) {
        this.toastrService.error(result.message, 'Error');
        this.apiResponseData=[];
        this.loading=false;
        this.spinnerService.hide();
      } else {
        this.loading=false;
        this.apiResponseData=[];
        this.spinnerService.hide();
        this.toastrService.error('Oops! Something went wrong  Please try again', 'Error');
      }
    }
  });
}



trackByFn(index, item) {
  return index;
}

}
