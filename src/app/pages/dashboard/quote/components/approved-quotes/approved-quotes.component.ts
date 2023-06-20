import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { QuotesService } from '../../services/quotes.service';
import { QuotesApiResponse } from '../../models/quotes-api-response';
import * as QuotesConstants from '../../constants/quotes-url';
import { NgbTypeahead, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of, OperatorFunction, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError, takeUntil } from 'rxjs/operators';

import { Customer } from 'app/shared/models/pax-customer-response';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { environment } from 'environments/environment';
@Component({
  selector: 'app-approved-quotes',
  templateUrl: './approved-quotes.component.html',
  styleUrls: ['./approved-quotes.component.scss','../../../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ApprovedQuotesComponent implements OnInit, OnDestroy  {
  ngDestroy$ = new Subject();
  approvedQuotesForm: FormGroup;
  submitted = false;
  // Global variables to display whether is loading or failed to load the data
  noResults: boolean;
  searchTerm: string;
  searchResult: any[];
  formatter = (customer: Customer) => customer?.businessName;
  @ViewChild('typeaheadInstance') typeaheadInstance: NgbTypeahead;
  customerId: any;
  contactList: any[];
  loading:boolean=false;

  public isCollapsed = false;
  public ColumnMode = ColumnMode;
  // row data
  public rows :any = [];
  // column header
  sorts=[
    { prop: 'sr_id', dir: 'desc' }
  ];
  public columns = [
    { name: "SR ID", prop: "sr_id" },
    { name: "Customer Name", prop: "customerName" },
    { name: "Contact Name", prop: "contactName" },
    { name: "Lines Count", prop: "linesCount" },
    { name: "Agent Name", prop: "agentName" },
    { name: "Created Date", prop: "created_date" }

  ];
  @ViewChild('tableRowDetails') tableRowDetails: any;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  public limitRef = 10;
  constructor(
    private fb: FormBuilder,
    private titleService: Title,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef,
    private datepipe: DatePipe,
    private quotesServices:QuotesService,

  ) {
    this.titleService.setTitle('Quotes Approved List');

  }

  ngOnInit(): void {
    this.initializeForm();
    this.onChangeCustomer('');
    this.onSubmittedSearchForm();
  }

  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
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
         ? this.quotesServices.getCustomerData(term).pipe(
           tap((response:Customer[]) => {
             this.noResults = response.length === 0;
             if(this.noResults){
             this.toastr.error(`no data found given search ${term} `,"Error");
             }
             this.searchResult = [...response];
           }),
           catchError(() => {
             return of([]);
           })
         )
         : of([])
     ),
     tap(() => this.cd.markForCheck()),
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

  customerDependsOnContactList(customerNumber: number) {
    this.quotesServices.getContactData(customerNumber, QuotesConstants.quotes_search.contact).pipe(takeUntil(this.ngDestroy$)).subscribe((data: any) => {
      if(data){
        this.contactList = data;
        this.cd.detectChanges();
      }else{
        this.toastr.error('Oops! Something went wrong  while fetching the contact data please try again', 'Error');
      }

    });
  }
  onChangeCustomer(value) {
    if (value === '') {
      this.contactList = [];
      this.approvedQuotesForm.get('contactId').disable();
      //this.cd.detectChanges();
    } else {
      this.approvedQuotesForm.get('contactId').enable();
      //this.cd.detectChanges();
    }
  }


  initializeForm(){
    this.approvedQuotesForm= this.fb.group({
      //quoteStatus:'',
      agentId:'',
      customerId:'',
      contactId:'',
      srId:'',
      srCreationDate:'',
      quoteCreationDate:''
    })
   }
   get f() {
    return this.approvedQuotesForm.controls;
  }
  reset(){
    this.submitted = false;
    this.approvedQuotesForm.reset();
    this.contactList = [];
    this.approvedQuotesForm.controls.contactId.setValue('');
    this.approvedQuotesForm.controls.customerId.setValue('');
    this.approvedQuotesForm.get('contactId').disable();
    const defaultData={
      agentId:0,
      customerId:0,
      contactId:0,
      srId:0,

    };
    this.onSearchForm(defaultData);
  }
  onSubmittedSearchForm(){
    this.submitted = true;
    if(this.approvedQuotesForm.valid){
      let searchObj = {};
      /* if (this.approvedQuotesForm.value.quoteStatus === '') {
        searchObj['quoteStatus'] = "open";
      }else{
        searchObj['quoteStatus'] = "open";
      } */
      if (this.approvedQuotesForm.value.agentId === '' || this.approvedQuotesForm.value.agentId ===  null) {
        searchObj['agentId'] = 0;
      }else{
        searchObj['agentId'] = this.approvedQuotesForm.value.agentId;
      }

      if (this.approvedQuotesForm.value.customerId === '' || this.approvedQuotesForm.value.customerId === undefined ||  typeof this.approvedQuotesForm.value.customerId !=='object') {
        searchObj['customerId'] = 0;
      }else{
        searchObj['customerId'] = Number(this.approvedQuotesForm.value.customerId?.customerId);
      }
      if (this.approvedQuotesForm.value.contactId === '' || this.approvedQuotesForm.value.contactId === undefined || this.approvedQuotesForm.value.contactId ===  'NaN') {
        searchObj['contactId'] = 0;
      }else{
        searchObj['contactId'] = Number(this.approvedQuotesForm.value.contactId);
      }
      if (this.approvedQuotesForm.value.srId === '') {
        searchObj['srId'] = 0;
      }else{
        searchObj['srId'] = Number(this.approvedQuotesForm.value.srId);
      }
      if (this.approvedQuotesForm.value.srCreationDate === '' || this.approvedQuotesForm.value.srCreationDate === null) {
        //searchObj['srCreationDate'] = 0;
      }else{
        searchObj['srCreationDate'] = this.approvedQuotesForm.value.srCreationDate;
      }
      if (this.approvedQuotesForm.value.quoteCreationDate === '' || this.approvedQuotesForm.value.quoteCreationDate === null) {
        //searchObj['quoteCreationDate'] = 0;
      }else{
        searchObj['quoteCreationDate'] = this.approvedQuotesForm.value.quoteCreationDate;
      }
      if(searchObj){

        this.onSearchForm(searchObj);
      }

    }

  }

onSearchForm(searchObj){
  this.quotesServices.getquotes(searchObj, QuotesConstants.quotes_search.approvedQuotes).pipe(takeUntil(this.ngDestroy$)).subscribe((res) => {
    const result:any = res;
    if (result.status === 200) {
      //this.cd.detectChanges();

      this.rows =result.data[0];
      this.isCollapsed = true;
      this.cd.markForCheck();
      //this.apiResponseData=result.data;
    } else {
      if (result.status === 204 || result.status === 404) {
        this.toastr.info(result.message, 'INFO');
        this.rows=[];
        this.cd.markForCheck();
      } else {
        this.rows=[];
        this.toastr.error('Oops! Something went wrong  Please try again', 'Error');
        this.cd.markForCheck();
      }
    }
  });
}





 /**
   * updateLimit
   *
   * @param limit
   */
  updateLimit(limit) {
    this.limitRef = limit.target.value;
    this.cd.markForCheck();
  }

  redirectQuote(srId){
    if(srId){
     const redirectRfqUrl = `${environment.Quote}quote/approvedquotes/${srId}`;
     //alert(redirectRfqUrl);
     window.open(redirectRfqUrl, '_blank');
   }
   }

}
