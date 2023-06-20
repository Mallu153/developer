import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/shared/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CashManagementService } from '../../services/cash-management.service';
import { CashManagementApiResponse }   from '../../models/cash-management-response';
import * as CASHMANAGEMENTModel  from '../../models/cash-management-models';
import * as STOREMANAGEMENT_Url  from '../../cash-url-constants/api-url-constants';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-cash-transfer-approval',
  templateUrl: './cash-transfer-approval.component.html',
  styleUrls: ['./cash-transfer-approval.component.scss','../../../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CashTransferApprovalComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  public TransferApprovalList:any;
  private loginId: number;
  //pagination
  public page = 1;
  public pageSize = 10;
  public collectionSize: number;
  //search
  public searchText: any;

  rejectTransitionForm:FormGroup;
  submitted = false;

  public ColumnMode = ColumnMode;
  public rows :any[] = [];
  public columns = [
    { name: "Agent Or Bank Name", prop: "agentOrBankName" },
    { name: "Amount", prop: "amount" },
    { name: "Reference", prop: "reference" },
    { name: "Remarks", prop: "remarks" },

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
    private datepipe: DatePipe,
    private cdr: ChangeDetectorRef,
    private authService:AuthService,
    private storeManagementApi:CashManagementService,
    private modalService: NgbModal
  ) { this.titleService.setTitle(' Cash Transfer Approval'); }


 updateLimit(limit) {
  this.limitRef = limit.target.value;
  this.cdr.markForCheck();
}
  goToDashBoard() {
    this.router.navigate(['/dashboard/cash-management/cash-dashboard']);
  }

  ngOnInit(): void {

    this.loginId=this.authService.getUser();
    if(this.loginId){
      this.getCashTransferApprovalList(this.loginId);
    }else{
      this.toastr.error('Oops! Something went wrong   please try again', 'Error');
    }
    this.initializeForm();
  }

  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
  getCashTransferApprovalList(id){
    this.storeManagementApi.getCashTransactionsApprovalsListInfo(id,STOREMANAGEMENT_Url.Store_Management_url.transactionsApprovals).pipe(takeUntil(this.ngDestroy$)).subscribe((res: CashManagementApiResponse) => {
      const result: CashManagementApiResponse = res;
      if (result.status === 200) {
        this.TransferApprovalList= result.data;
        this.rows= result.data;
        this.cdr.markForCheck();
      } else {
        if(result.status === 400 || result.status === 200 || result.status === 401 || result.status === 404 || result.status === 500){
          this.toastr.warning(result.message);
        }else{
          this.toastr.warning('Oops! Something went wrong   please try again');
        }
        this.rows= [];
      }
    });
  }



  updateStatusOfCashTransactionLine(transactionId,transactionStatus,amount){
    if(transactionId&&transactionStatus&&amount){
      if (confirm(`Are sure you want to approved  these transition amount ${amount}`) == true) {
        const Data={
         rejectedRemarks: "",
         transactionId: transactionId,
         transactionStatus: transactionStatus
        };
        this.StatusOfCashTransactionLine(this.authService.getUser(),Data);
       }
    }else{
      this.toastr.error('Oops! Something went wrong   please try again', 'Error');
    }

  }

  updateStatusOfCashTransactionLineReject(transactionId,transactionStatus,amount){
    if(transactionId&&transactionStatus&&amount){
    if (confirm(`Are sure you want to rejected  these transition amount ${amount}`) == true) {
     const Data={
      rejectedRemarks: null,
      transactionId: transactionId,
      transactionStatus: transactionStatus
     };
    }
  }else{
    this.toastr.error('Oops! Something went wrong   please try again', 'Error');
  }
}
reloadCurrentRoute() {
  let currentUrl = this.router.url;
  this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      this.router.navigate([currentUrl]);
     // console.log(currentUrl);
  });
}

StatusOfCashTransactionLine(id,data){
  this.storeManagementApi.updateStatusOfCashTransactionLine(id,data,STOREMANAGEMENT_Url.Store_Management_url.actionOnCashTransactionLine).pipe(takeUntil(this.ngDestroy$)).subscribe((res: CashManagementApiResponse) => {
    const result: CashManagementApiResponse = res;
    if (result.status === 200) {
      this.toastr.success(result.message, 'Success');
      //this.reloadCurrentRoute();
      //this.getCashTransferApprovalList(this.loginId);
      let updateValue=1;
      updateValue+=Number(this.route.snapshot.queryParams?.sources?.split('-')[1]);
        this.router.navigate([`/dashboard/cash-management/cash-transfer-approval`], {
          queryParams: {

            sources:`approved-${Number.isNaN(updateValue) ? 1:updateValue}`
          },
        });
        this.getCashTransferApprovalList(this.loginId);
      this.cdr.markForCheck();
    } else {
      if(result.status === 400 || result.status === 404 || result.status === 500 || result.status === 401){
        this.toastr.error(result.message, 'Error');
      }else{
        this.toastr.error('Oops! Something went wrong   please try again', 'Error');
      }
    }
  });
}

openWindowCustomClass(content,transactionId) {
  this.rejectTransitionForm.patchValue({
    transactionId:transactionId
  });
  this.modalService.open(content,transactionId);
}
initializeForm(){
  this.rejectTransitionForm =this.fb.group({
    rejectedRemarks: ['', [Validators.required]],
    transactionId: '',
    transactionStatus: ''
  });
}
get f() {
  return this.rejectTransitionForm.controls;
}
closePopup() {
  if (this.modalService.hasOpenModals()) {
    this.modalService.dismissAll();
    this.submitted=false;
    this.rejectTransitionForm.reset();
  }
}
onSubmitRejectTransitionForm(){
  this.submitted=true;
  if(this.rejectTransitionForm.invalid){
    //this.toastr.error('Please fill the required fields', 'Error')
      return;
  }
  if(this.rejectTransitionForm.valid){
    const updateData={
      rejectedRemarks: this.rejectTransitionForm.value.rejectedRemarks,
      transactionId: this.rejectTransitionForm.value.transactionId,
      transactionStatus: 'Rejected'
    };
    this.StatusOfCashTransactionLine(this.loginId,updateData);
    this.closePopup();
  }
}

}
