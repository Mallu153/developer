import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { concat, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ApiResponse } from '../../model/api-response';
import { Customer } from '../../model/pax-customer-by-name';
import { DashboardRequestService } from '../../services/dashboard-request.service';
import { PackageRequestList, srsearchList_url } from '../../url-constants/url-constants';
import { RequestDependsRfqPopupComponent } from './request-depends-rfq-popup/request-depends-rfq-popup.component';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-package-request-list',
  templateUrl: './package-request-list.component.html',
  styleUrls: ['./package-request-list.component.scss','../../../../../../assets/sass/libs/datatables.scss','../../../../../../assets/sass/libs/select.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PackageRequestListComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  pageTitle:string='Package  Requests List';
  packageSearchForm:FormGroup;
  submitted:boolean=false;
  public ColumnMode = ColumnMode;
  public rows :any[] = [];
  @ViewChild('tableRowDetails') tableRowDetails: any;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  public limitRef = 10;
  //customer
  customer$: Observable<any>;
  customerLoading = false;
  customerInput$ = new Subject<string>();
  minLengthcustomerTerm = 2;
  //contact
  contactList=[];
  requestInfo=[];
  loading:boolean=false;
  productsAvailability:boolean=false;


  todayDate = new Date();
  todayDate1: string;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private titleService: Title,
    private toastrService: ToastrService,
    private dashboardRequestService: DashboardRequestService,
    private datepipe: DatePipe,
    private cdr: ChangeDetectorRef,
  ) {
    this.titleService.setTitle('Package  Requests List');
    this.todayDate1 = this.datepipe.transform(this.todayDate, 'yyyy-MM-dd');
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
   loadCustomer() {
    this.customer$ = concat(
      of([]), // default items
      this.customerInput$.pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthcustomerTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.cdr.markForCheck(),this.customerLoading = true)),
        switchMap((term) => {
          return this.dashboardRequestService.getCustmerByName(PackageRequestList.customer, term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.customerLoading = false))
          );
        })
      )
    );
  }

  onChangeCustomer(selectedCustomer:Customer){
    if(selectedCustomer){
      const customerNumber=selectedCustomer.customerId;
      this.customerDependsOnContactList(customerNumber);
    }else{
      this.contactList=[];
    }
   }
   customerDependsOnContactList(customerNumber: number) {
    this.dashboardRequestService.getContactData(customerNumber,srsearchList_url.searchContact).pipe(takeUntil(this.ngDestroy$)).subscribe(
      (data: any) => {
        if(data){
          this.contactList = data;
          this.cdr.markForCheck();
        }else{
          this.contactList=[];
        }

      },
      (error) => {
        this.contactList=[];
        this.toastrService.error(
          'Oops! Something went wrong  while fetching the contact data please try again',
          'Error'
        );
        this.cdr.markForCheck();
      }
    );
  }
initializeForm(){
  this.packageSearchForm=this.fb.group({
    srId: '',
    customerId: '',
    customerEmail: '',
    customerPhone: '',
    contactId: '',
    //srCreationDate: '',
    srFromCreationDate: this.todayDate1 ,
    srToCreationDate: '',
  });
}


get f(){
  return this.packageSearchForm.controls;
}


onResetForm(){
  this.submitted=false;
  this.packageSearchForm.reset();
  this.contactList=[];
}
onSearchForm(){
  this.submitted=false;
  let searchObj = {};
  if(this.packageSearchForm.valid){
  const srNumber=this.packageSearchForm.value.srId;
  const customerNumber=this.packageSearchForm.value.customerId;
  const customerEmail=this.packageSearchForm.value.customerEmail;
  const customerPhoneNumber=this.packageSearchForm.value.customerPhone;
  const contactNumber=this.packageSearchForm.value.contactId;
  const srFrom=this.packageSearchForm.value.srFromCreationDate;
  const srTo=this.packageSearchForm.value.srToCreationDate;
  if(srNumber !==''){
    searchObj['srId'] = srNumber;
  }else{
    searchObj['srId'] = 0;
  }
  if(customerNumber !==''){
    searchObj['customerId'] = customerNumber;
  }else{
    searchObj['customerId'] = 0;
  }
  if(customerEmail !==''){
    searchObj['customerEmail'] = customerEmail;
  }else{
    searchObj['customerEmail'] = null;
  }
  if(customerPhoneNumber !==''){
    searchObj['customerPhone'] = customerPhoneNumber;
  }else{
    searchObj['customerPhone'] = null;
  }
  if(contactNumber !==''){
    searchObj['contactId'] = Number(contactNumber);
  }else{
    searchObj['contactId'] = 0;
  }
   if(srFrom !==''){
    searchObj['srFromCreationDate'] = srFrom;
  }else{
    searchObj['srFromCreationDate'] = null;
  }
  if(srTo !==''){
    searchObj['srToCreationDate'] = srTo;
  }else{
    searchObj['srToCreationDate'] = null;
  }
  this.loading=true;

  this.sendDataToApi(searchObj);
  }else{
    this.loading=false;
    this.toastrService.error('Please fill the required fields','Error');
  }
}

sendDataToApi(searchDeatils){
  this.dashboardRequestService.customerByPackageList(searchDeatils,PackageRequestList.PackageRequestSearch).pipe(takeUntil(this.ngDestroy$)).subscribe((res:ApiResponse)=>{
    const result:ApiResponse=res;
    if(result.statusCode=== true){
      this.rows=result.data;
      this.loading=false;
      this.cdr.markForCheck();
    }else{
      this.loading=false;
      this.toastrService.error(result.message,'Error');
      this.cdr.markForCheck();
    }
  })

}
openRequestList(requestNumber:number,contactId:number){

if(requestNumber){
  const queryParams = {
    requestId: requestNumber,
    contactId:contactId,
    holidaysLineId:5501
  };
  const HOLIDAY_LIST_VIEW = this.router.createUrlTree(['/dashboard/booking/package-holidays-listview'], { queryParams }).toString();
  window.open(HOLIDAY_LIST_VIEW, '_blank');
}


}


openRfqList(requestNumber:number){
  //,scrollable: true,windowClass: 'my-class'
  const modalRef = this.modalService.open(RequestDependsRfqPopupComponent, { size: 'xl' ,windowClass: 'my-class'} );
  modalRef.componentInstance.name = 'Rfq List';
  modalRef.componentInstance.packageRequestNo = requestNumber;
}
ngOnInit(): void {
  this.initializeForm();
  this.loadCustomer();
  this.onSearchForm();
}
ngOnDestroy(){
  this.ngDestroy$.next(true);
  this.ngDestroy$.complete();
}



}
