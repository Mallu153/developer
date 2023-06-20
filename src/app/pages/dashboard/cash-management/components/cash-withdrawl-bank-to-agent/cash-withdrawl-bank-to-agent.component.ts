import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { BankAccount } from 'app/shared/models/bank-account-response';
import { MasterDataService } from 'app/shared/services/master-data.service';
import { ToastrService } from 'ngx-toastr';
import * as CASHMANAGEMENT_URLS from '../../cash-url-constants/api-url-constants';
import { Observable, of, OperatorFunction, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError, map, takeUntil } from 'rxjs/operators';
import { AuthService } from 'app/shared/auth/auth.service';
import { CashManagementService } from '../../services/cash-management.service';
import * as CASHMANAGEMENTModel  from '../../models/cash-management-models';
import { CashManagementApiResponse }   from '../../models/cash-management-response';
@Component({
  selector: 'app-cash-withdrawl-bank-to-agent',
  templateUrl: './cash-withdrawl-bank-to-agent.component.html',
  styleUrls: ['./cash-withdrawl-bank-to-agent.component.scss']
})
export class CashWithdrawlBankToAgentComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
    // customer Global variables to display whether is loading or failed to load the data
    @ViewChild('typeaheadInstance') typeaheadInstance: NgbTypeahead;
    noBankDetailsResults: boolean;
    searchBankDetailsTerm: string;
    searchBankDetailsResult: BankAccount[];
    bankFormatter = (BankAccountDeatils: BankAccount) => BankAccountDeatils.bankInfo;
  //mulitiple file array method
  public myArrayFiles: any[] = [];
  public imageResponseArray: any = [];
  public isloading = false;
  withdrawBankToAgentForm: FormGroup;
  submitted = false;
  constructor(
    private fb: FormBuilder,
    private titleService: Title,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private datepipe: DatePipe,
    private cdr: ChangeDetectorRef,
    private masterApiServices:MasterDataService,
    private authService:AuthService,
    private storeManagementApi:CashManagementService
    ) { this.titleService.setTitle('Cash Withdrawl - Bank to Agent');}



goToDashBoard(){
  this.router.navigate(['/dashboard/cash-management/cash-dashboard']);
}

numberOnly(event): boolean {
  const charCode = (event.which) ? event.which : event.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    return false;
  }
  return true;
}


  //mulitiple file change
  onFileChange(event: any) {
    for (var i = 0; i < event.target.files.length; i++) {
      this.myArrayFiles.push(event.target.files[i]);
    }

  }

  removeMultipleFiles(i, name) {
    if (confirm(`Are sure you want to delete ${name} ?`) == true) {
      if (this.myArrayFiles.length > 0) {
        this.myArrayFiles.splice(i, 1);
      }

    }
  }



/**
   * Trigger a call to the API to get the Agent
   * data for from input
   */
 onSearchBankDetails: OperatorFunction<string, readonly { fullName }[]> = (text$: Observable<string>) =>
 text$.pipe(
   debounceTime(300),
   distinctUntilChanged(),
   tap((term: string) => (this.searchBankDetailsTerm = term)),
   switchMap((term) =>
     term.length >= 3
       ? this.masterApiServices.getBankAccountDeatils(CASHMANAGEMENT_URLS.SEARCH_URL.BANK_ACCOUNT_URL, term).pipe(
         tap((response: BankAccount[]) => {
           this.noBankDetailsResults = response.length === 0;
           if (this.noBankDetailsResults) {
             this.toastr.error(`no Bank Details found given   ${term}`, "Error");
           }
           this.searchBankDetailsResult = [...response];
         }),
         catchError(() => {
           return of([]);
         })
       )
       : of([])
   ),
   tap(() => this.cdr.markForCheck()),
   tap(() =>
     this.searchBankDetailsTerm === '' || this.searchBankDetailsTerm.length <= 2
       ? []
       : this.searchBankDetailsResult.filter((v) => v?.bankInfo.toLowerCase().indexOf(this.searchBankDetailsTerm.toLowerCase()) > -1)
   )
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
         } else {
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
 ngOnInit(): void {
  this.initializeForm();
}
ngOnDestroy(){
  this.ngDestroy$.next(true);
  this.ngDestroy$.complete();
}
 initializeForm() {
  this.withdrawBankToAgentForm = this.fb.group({
    bankTransactionType: '',
    referenceNo: ['', [Validators.required]],
    transferAmount: ['', [Validators.required]],
    transferFromBankInfo: '',
    transferFromId: ['', [Validators.required]],
    transferToBankInfo: '',
    transferToId: '',
    remarks:['', [Validators.required]]
  });
}
/**
 * html formcontrol
 * gets here
 */
get f() {
  return this.withdrawBankToAgentForm.controls;
}

reset(){
  this.withdrawBankToAgentForm.reset();
  this.submitted = false;
}

onSubmitForm(){
  this.submitted = true;
  if (this.withdrawBankToAgentForm.invalid) {
    return this.toastr.error('Please fill the required fields and submit the form', 'Error');
  }
  if(typeof this.withdrawBankToAgentForm.value.transferFromId !== 'object'){
    return this.toastr.error('Please select account details ', 'Error');
  }

  if(this.withdrawBankToAgentForm.valid){
   const saveData={
    bankTransactionType: 'FromBank',
    referenceNo: this.withdrawBankToAgentForm.value.referenceNo,
    transferAmount: Number(this.withdrawBankToAgentForm.value.transferAmount),
    transferFromBankInfo: this.withdrawBankToAgentForm.value.transferFromId?.bankInfo,
    transferFromId: this.withdrawBankToAgentForm.value.transferFromId?.id,
    transferToBankInfo: this.withdrawBankToAgentForm.value.transferToBankInfo,
    transferToId: this.authService.getUser(),
    remarks:this.withdrawBankToAgentForm.value.remarks
   };
   this.storeManagementApi.saveStoreTransactions(this.authService.getUser(),saveData, CASHMANAGEMENT_URLS.Store_Management_url.storeTransactions).pipe(takeUntil(this.ngDestroy$)).subscribe((res:CashManagementApiResponse) => {
    const result: CashManagementApiResponse = res;
    if (result.status === 200) {
      this.toastr.success(result.message, "Success");
      this.reset();
    } else {
      if(result.message=== ""){
        this.toastr.error('Oops! Something went wrong please try again', 'Error');
      }else{
        this.toastr.error(result.message, 'Error');
      }
    }
  });

  }else{
    return this.toastr.error('Please fill the required fields and submit the form ', 'Error');
  }
}




}
