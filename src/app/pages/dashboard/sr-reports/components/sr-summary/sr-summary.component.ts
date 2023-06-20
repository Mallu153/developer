import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbTypeahead, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { Customer } from 'app/shared/models/pax-customer-response';
import { ToastrService } from 'ngx-toastr';
import { OperatorFunction, Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, switchMap, catchError, takeUntil } from 'rxjs/operators';
import { SrSummary_Url } from '../../constants/sr-reports-url-constants';
import { SystemMasterApiResponse } from '../../models/system-api-response';
import { SrReportsService } from '../../services/sr-reports.service';
import { ColumnMode, DatatableComponent } from "@swimlane/ngx-datatable";
import { MasterDataService } from 'app/shared/services/master-data.service';
import { RFQ_List } from 'app/pages/dashboard/rfq/rfq-url-constants/apiurl';
import { RfqService } from 'app/pages/dashboard/rfq/rfq-services/rfq.service';
@Component({
  selector: 'app-sr-summary',
  templateUrl: './sr-summary.component.html',
  styleUrls: ['./sr-summary.component.scss','../../../../../../assets/sass/libs/datatables.scss','../../../../../../assets/sass/libs/select.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SrSummaryComponent implements OnInit  , OnDestroy{
  ngDestroy$ = new Subject();
  pageTitle = 'Sr Summary List';
  srSummaryForm: FormGroup;
  submitted = false;

  srSummaryList:any=[];
  //Global variables to display whether is loading or failed to load the data
  noCustomerResults: boolean;
  searchCustomerTerm: string;
  searchCustomerResult: Customer[];
  formatter = (customer: Customer) => customer?.businessName;
  @ViewChild('typeaheadInstance') typeaheadInstance: NgbTypeahead;


  public ColumnMode = ColumnMode;
  // row data
  public rows :any = [];
  // column header
  reorderable = true;
  sorts=[
    { prop: 'service_request', dir: 'desc' },
    { prop: 'service_request_line', dir: 'desc' },
  ];
  public columns = [
    { name: "SR", prop: "service_request" },
    { name: "Product", prop: "productName" },
    { name: "Contact", prop: "contact_name" },
    { name: "RFQ", prop: "request_for_quote_count" },
    { name: "Quote", prop: "quote_count" },
    { name: "PNR / Booking", prop: "pnr_or_booking_count" },
    { name: "PNR / Booking Passenger", prop: "pnr_or_booking_passenger_count" },
    { name: "Ticket / Room", prop: "issued_ticket_or_room_count" },
    { name: "Ticket / Room Amount", prop: "issued_ticket_or_room_total" },
    { name: "Cancel Ticket/ Room", prop: "cancelled_ticket_or_room_count" },
    { name: "Cancel Ticket / Room Total", prop: "cancelled_ticket_or_room_total" },
    { name: "Receipt", prop: "receipt_count" },
    { name: "Receipt Amount", prop: "receipt_total" },
    { name: " Payment", prop: "payment_count" },
    { name: "Payment Amount", prop: "payment_total" },
    { name: "Purchase Order", prop: "purchase_order_count" },
    { name: "Purchase Order Amount", prop: "purchase_order_total" },
    { name: "Invoice", prop: "invoice_count" },
    { name: "Invoice Amount", prop: "invoice_total" },
  ];
  @ViewChild('tableRowDetails') tableRowDetails: any;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  rowHeight:any;
  linesLength:number;

public limitRef = 10;
 private tempData:any = [];
 public productList:any = [];
 public contactList:any = [];

 public loading:boolean=false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private datepipe: DatePipe,
    private toastrService: ToastrService,
    private srReports: SrReportsService,
    private cdr: ChangeDetectorRef,
    public masterDataService: MasterDataService,
    private rfqServices: RfqService,
  ) {}
  /**
   * Trigger a call to the API to get the customer
   * data for from input
   */
  onSearchCustomer: OperatorFunction<string, readonly { name; customerId }[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap((term: string) => (this.searchCustomerTerm = term)),
      switchMap((term) =>
        term.length >= 3
          ? this.srReports.getCustomerByName(term).pipe(
              tap((response: Customer[]) => {
                this.noCustomerResults = response.length === 0;
                if (this.noCustomerResults) {
                  this.toastrService.info(`no data found given search ${term}`, 'INFO', { progressBar: true });
                }
                this.searchCustomerResult = [...response];
              }),
              catchError(() => {
                return of([]);
              })
            )
          : of([])
      ),
      tap(() => this.cdr.markForCheck()),
      tap(() => {
        this.searchCustomerTerm === '' || this.searchCustomerTerm.length <= 2
          ? []
          : this.searchCustomerResult?.filter(
              (v) => v.businessName.toLowerCase().indexOf(this.searchCustomerTerm.toLowerCase()) > -1
            );
      })
    );

  typeaheadKeydown($event: KeyboardEvent) {
    if (this.typeaheadInstance.isPopupOpen()) {
      setTimeout(() => {
        const popup = document.getElementById(this.typeaheadInstance.popupId);
        const activeElements = popup.getElementsByClassName('active');
        if (activeElements.length === 1) {
          const elem = activeElements[0] as any;
          if (typeof elem.scrollIntoViewIfNeeded === 'function') {
            // non standard function, but works (in chrome)...
            elem.scrollIntoViewIfNeeded();
          } {
            //do custom scroll calculation or use jQuery Plugin or ...
            this.scrollIntoViewIfNeededPolyfill(elem as HTMLElement);
          }
        }
      });
    }
  }

  private scrollIntoViewIfNeededPolyfill(elem: HTMLElement, centerIfNeeded = true) {
    var parent = elem.parentElement,
      parentComputedStyle = window.getComputedStyle(parent, null),
      parentBorderTopWidth = parseInt(parentComputedStyle.getPropertyValue('border-top-width')),
      parentBorderLeftWidth = parseInt(parentComputedStyle.getPropertyValue('border-left-width')),
      overTop = elem.offsetTop - parent.offsetTop < parent.scrollTop,
      overBottom =
        elem.offsetTop - parent.offsetTop + elem.clientHeight - parentBorderTopWidth >
        parent.scrollTop + parent.clientHeight,
      overLeft = elem.offsetLeft - parent.offsetLeft < parent.scrollLeft,
      overRight =
        elem.offsetLeft - parent.offsetLeft + elem.clientWidth - parentBorderLeftWidth >
        parent.scrollLeft + parent.clientWidth,
      alignWithTop = overTop && !overBottom;

    if ((overTop || overBottom) && centerIfNeeded) {
      parent.scrollTop =
        elem.offsetTop - parent.offsetTop - parent.clientHeight / 2 - parentBorderTopWidth + elem.clientHeight / 2;
    }

    if ((overLeft || overRight) && centerIfNeeded) {
      parent.scrollLeft =
        elem.offsetLeft - parent.offsetLeft - parent.clientWidth / 2 - parentBorderLeftWidth + elem.clientWidth / 2;
    }

    if ((overTop || overBottom || overLeft || overRight) && !centerIfNeeded) {
      elem.scrollIntoView(alignWithTop);
    }
  }

  /**
   * A method to bind the value of seclected element from the dropdown
   * @param $event dropdown selected option
   * @param nameOfControl name of the form control in the dynamic form
   */
  bindValueOfControl($event: NgbTypeaheadSelectItemEvent, nameOfControl: string) {
    if ($event !== undefined && nameOfControl) {
      if (nameOfControl === 'customerId') {

        if ($event.item?.customerId) {
          this.customerDependsOnContactList(Number($event.item?.customerId));
        }
      }
    }
  }
  customerDependsOnContactList(customerNumber: number) {
    this.rfqServices.getContactData(customerNumber, RFQ_List.contact).pipe(takeUntil(this.ngDestroy$)).subscribe((data: any) => {
      if (data.length>0) {
        this.contactList = data;
        this.cdr.markForCheck();
      }else {
        this.toastrService.error(
          'Oops! Something went wrong  while fetching the contact data please try again',
          'Error'
        );
      }
    });
  }
  onChangeCustomer(value) {
    if (value === '') {
      this.contactList = [];
    }
  }

  getProduct() {
    this.masterDataService.getGenMasterDataByTableName('master_products').pipe(takeUntil(this.ngDestroy$)).subscribe((res) => {
      if (res?.length>0) {
        this.productList = res;
        this.cdr.markForCheck();
      }else {
        this.toastrService.error('Oops! Something went wrong while fetching the Product type data please try again ','Error');
        this.cdr.markForCheck();
      }
    });
  }
  initializeForm() {
    this.srSummaryForm = this.fb.group({
      customerId: '',
      cancelledTicketOrRoomCount:'',
      contactEmailId:'',
      contactId:null,
      contactName:'',
      contactPhone:'',
      issuedTicketOrRoomCount:'',
      pnrOrBookingCount:'',
      productId:null,
      quoteCount:'',
      srFromCreationDate:'',
      srToCreationDate:'',
      srId:'',
      srLineId:'',
    });
  }
  /**
   * html formcontrol
   * gets here
   */
  get f() {
    return this.srSummaryForm.controls;
  }

  reset() {
    this.submitted = false;
    this.srSummaryForm.reset();
    this.srSummaryForm.controls.customerId.setValue('');
    this.rows =[];
  }

  onSubmitCustomerForm() {
    this.submitted = true;
    let searchObj = {};


    if (this.srSummaryForm.value.customerId === '' ||
    this.srSummaryForm.value.customerId === null||
    (typeof this.srSummaryForm.value.customerId ==='string') ||
    (typeof this.srSummaryForm.value.customerId !=='object') ) {
      return this.toastrService.error('Please select the customer then search', 'Error', { progressBar: true });
    }


   const customerId=this.srSummaryForm.value.customerId;
   const  cancelledTicketOrRoomCount=this.srSummaryForm.value.cancelledTicketOrRoomCount;
   const contactEmailId=this.srSummaryForm.value.contactEmailId;
   const contactId=this.srSummaryForm.value.contactId;
   const contactName=this.srSummaryForm.value.contactName;
   const contactPhone=this.srSummaryForm.value.contactPhone;
   const issuedTicketOrRoomCount=this.srSummaryForm.value.issuedTicketOrRoomCount;
   const pnrOrBookingCount=this.srSummaryForm.value.pnrOrBookingCount;
   const  productId=this.srSummaryForm.value.productId;
   const  quoteCount=this.srSummaryForm.value.quoteCount;
   const  srFromCreationDate=this.srSummaryForm.value.srFromCreationDate;
   const   srToCreationDate=this.srSummaryForm.value.srToCreationDate;
   const    srId=this.srSummaryForm.value.srId;
   const   srLineId=this.srSummaryForm.value.srLineId;

   if(srId !== "" &&  srId !== null){
    searchObj['srId'] = srId;
   }
   if(srLineId !== "" &&  srLineId !== null){
    searchObj['srLineId'] = srLineId;
   }
    if(cancelledTicketOrRoomCount !== "" &&  cancelledTicketOrRoomCount !== null){
    searchObj['cancelledTicketOrRoomCount'] = cancelledTicketOrRoomCount;
   }
    if(contactEmailId !== "" &&  contactEmailId !== null){
    searchObj['contactEmailId'] = contactEmailId;
   }
   if(contactId !== "" &&  contactId !== null){
    searchObj['contactId'] = contactId;
   }
   if(contactName !== "" &&  contactName !== null){
    searchObj['contactName'] = contactName;
   }
   if(contactPhone !== "" &&  contactPhone !== null){
    searchObj['contactPhone'] = contactPhone;
   }
   if(issuedTicketOrRoomCount !== "" &&  issuedTicketOrRoomCount !== null){
    searchObj['issuedTicketOrRoomCount'] = issuedTicketOrRoomCount;
   }
   if(pnrOrBookingCount !== "" &&  pnrOrBookingCount !== null){
    searchObj['pnrOrBookingCount'] = pnrOrBookingCount;
   }
   if(productId !== "" &&  productId !== null){
    searchObj['productId'] = productId;
   }
   if(quoteCount !== "" && quoteCount !== null){
    searchObj['quoteCount'] = quoteCount;
   }
   if(srFromCreationDate !== "" && srFromCreationDate !== null){
    searchObj['srFromCreationDate'] = srFromCreationDate;
   }
   if(srToCreationDate !== "" && srToCreationDate !== null){
    searchObj['srToCreationDate'] = srToCreationDate;
   }/* else{
    if(customerId !== "" &&  customerId !== null){
      searchObj['customerId'] = customerId?.customerId;
     }
   } */

    if (this.srSummaryForm.valid) {
      // const CUSTOMERID = this.srSummaryForm.value.customerId?.customerId;
      this.loading=true;
      this.srReports
        .getSrSummaryList(customerId?.customerId,searchObj, SrSummary_Url.srSummaryList)
        .pipe(takeUntil(this.ngDestroy$)).subscribe((res: SystemMasterApiResponse) => {
          const result: SystemMasterApiResponse = res;
          if (result.statusCode === true) {
            //console.log('sr summary list', result.data[0]);
            if (result.data?.length === 0 || result.data[0]?.length === 0) {
              return;
            }


            this.rows =result.data[0];
            this.tempData = result.data[0];
            this.loading=false;
            this.cdr.markForCheck();
          }else{
            this.toastrService.error(result.message, 'Error', { progressBar: true });
            this.loading=false;
            this.rows =[];
            /* if (result.status === 404) {
              this.toastrService.info(result.message, 'INFO', { progressBar: true });
              this.loading=false;
              this.rows =[];
            } {
              this.toastrService.error(result.message, 'Error', { progressBar: true });
              this.loading=false;
              this.rows =[];
            } */

          }
        });
    }
  }
 /**
   * rowDetailsToggleExpand
   *
   * @param row
   */
  rowDetailsToggleExpand(row,expanded,rowIndex) {
    this.tableRowDetails.rowDetail.toggleExpandRow(row);

  }

/**
   * filterUpdate
   *
   * @param event
   */
 filterUpdate(event) {
  const val = event.target.value.toLowerCase();
  // filter our data
  const temp = this.tempData.filter(function (d) {
    return d.productName.toLowerCase().indexOf(val) !== -1 ||
            d.contact_name?.toLowerCase().indexOf(val) !== -1 ||
            d.service_request?.toLowerCase().indexOf(val) !== -1 ||
            d.service_request_line?.toLowerCase().indexOf(val) !== -1 ||
            d.request_for_quote_count?.toLowerCase().indexOf(val) !== -1 ||
            d.quote_count?.toLowerCase().indexOf(val) !== -1 ||
            d.pnr_or_booking_count?.toLowerCase().indexOf(val) !== -1 ||
            d.pnr_or_booking_passenger_count?.toLowerCase().indexOf(val) !== -1 ||
            d.issued_ticket_or_room_count?.toLowerCase().indexOf(val) !== -1 ||
            d.issued_ticket_or_room_total?.toLowerCase().indexOf(val) !== -1 ||
            d.cancelled_ticket_or_room_count?.toLowerCase().indexOf(val) !== -1 ||
            d.cancelled_ticket_or_room_total?.toLowerCase().indexOf(val) !== -1 ||
            d.receipt_count?.toLowerCase().indexOf(val) !== -1 ||
            d.receipt_total?.toLowerCase().indexOf(val) !== -1 ||
            d.payment_count?.toLowerCase().indexOf(val) !== -1 ||
            d.payment_total?.toLowerCase().indexOf(val) !== -1 ||
            d.purchase_order_count?.toLowerCase().indexOf(val) !== -1 ||
            d.purchase_order_total?.toLowerCase().indexOf(val) !== -1 ||
            d.invoice_count?.toLowerCase().indexOf(val) !== -1 ||
            d.invoice_total?.toLowerCase().indexOf(val) !== -1 ||
            !val;
  });
  // update the rows
  this.rows = temp;
  // Whenever the filter changes, always go back to the first page
  this.table.offset = 0;
  this.cdr.markForCheck();
}
  /**
   * updateLimit
   *
   * @param limit
   */
   updateLimit(limit) {
    this.limitRef = limit.target.value;
    this.cdr.markForCheck();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.getProduct();
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param && param.contact_number &&param.mail &&param.customer_no&&param.customer_name) {
        const ContactPhoneNo=atob(unescape(param.contact_number));
        const ContactEmail=atob(unescape(param.mail));
        const CustomerNo=atob(unescape(param.customer_no));
        const CustomerName=atob(unescape(param.customer_name));
        this.srSummaryForm.patchValue({
          contactEmailId:ContactEmail,
          contactPhone:ContactPhoneNo,
          customerId:{
            customerId:Number(CustomerNo),
            businessName:CustomerName
          }
        });
        this.customerDependsOnContactList(Number(CustomerNo));
        this.onSubmitCustomerForm();
      }
    });

  }
  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }

}
