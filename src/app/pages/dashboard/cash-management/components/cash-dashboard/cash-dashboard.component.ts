import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/shared/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CashManagementService } from '../../services/cash-management.service';
import { CashManagementApiResponse } from '../../models/cash-management-response';
import * as CASHMANAGEMENTModel from '../../models/cash-management-models';
import * as STOREMANAGEMENT_Url from '../../cash-url-constants/api-url-constants';
import { environment } from 'environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-cash-dashboard',
  templateUrl: './cash-dashboard.component.html',
  styleUrls: ['./cash-dashboard.component.scss'],
})
export class CashDashboardComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  public userName: string = null;
  private loginId: number;
  public storeInfo: any;
  cash_in_hand_val: number = 0;
  amount_outstanding_val: number = 0;
  duration = 1000;
  petty_cash_percentage: any;
  registeredMailsSR: number = 0;
  registeredMailsGEN: number = 0;
  nonRegisteredMails: number = 0;
  transactionApprovalsCountData: number = 0;
  constructor(
    private fb: FormBuilder,
    private titleService: Title,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private datepipe: DatePipe,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private storeManagementApi: CashManagementService
  ) {
    this.titleService.setTitle('Cash Dashboard');
  }

  ngOnInit(): void {
    this.userName = this.authService.getUserName();
    this.loginId = this.authService.getUser();
    if (this.loginId) {
      this.storeInformation(this.loginId);
    } else {
      this.toastr.error('Oops! Something went wrong   please try again', 'Error');
    }

    this.getMailCountData();

    /*  setInterval(() => {

      this.getMailCountData()
    },  50000); */



  }
  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
  gotoCashTransferAgenttoAgent() {
    this.router.navigate(['/dashboard/cash-management/cash-transfer-agent-to-agent']);
  }

  gotoCashWithDrawBankToAgent() {
    this.router.navigate(['/dashboard/cash-management/cash-withdraw-bank-to-agent']);
  }

  gotoCashDepositAgentToBank() {
    this.router.navigate(['/dashboard/cash-management/cash-deposit-agent-to-bank']);
  }
  gotoCashTransferApproval() {
    this.router.navigate(['/dashboard/cash-management/cash-transfer-approval']);
  }

  storeInformation(id: number) {
    this.storeManagementApi
      .getAgentCashInfo(id, STOREMANAGEMENT_Url.Store_Management_url.storeInfo)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res: CashManagementApiResponse) => {
        const result: CashManagementApiResponse = res;
        if (result.status === 200) {
          this.storeInfo = result.data[0];

          this.cash_in_hand_val = this.storeInfo?.grassCashAmount;
          this.amount_outstanding_val = this.storeInfo?.outStandingAmount;
          this.transactionApprovalsCountData = this.storeInfo?.transactionApprovalsCount;
          this.petty_cash_percentage = (
            (this.storeInfo?.pettyCashOpeningAmount / this.storeInfo?.pettyCashAmount) *
            100
          ).toFixed(2);

          this.cdr.markForCheck();
        } else {
          if (result.status === 400) {
            this.toastr.error(result.message, 'Error');
          } else {
            this.toastr.error('Oops! Something went wrong   please try again', 'Error');
          }
        }
      });
  }

  gotoAgentCashList() {
    this.router.navigate(['/dashboard/cash-management/agent-cash']);
  }
  gotoAgentLiabilityList() {
    this.router.navigate(['/dashboard/cash-management/agent-liability']);
  }

  getMailCountData() {
    this.storeManagementApi
      .getMailCount(STOREMANAGEMENT_Url.Store_Management_url.mailCount_url)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res: CashManagementApiResponse) => {
        const result: CashManagementApiResponse = res;
        if (result.status === 200) {
          if (result.data[0]?.nonRegisteredMails?.length > 0) {
            this.nonRegisteredMails = result.data[0]?.nonRegisteredMails[0]?.mailCount;
          } else {
            this.nonRegisteredMails = 0;
          }
          if (result.data[0]?.registeredMailsGEN.length > 0) {
            this.registeredMailsGEN = result.data[0]?.registeredMailsGEN[0]?.mailCount;
          } else {
            this.registeredMailsGEN = 0;
          }
          if (result.data[0]?.registeredMailsSR.length > 0) {
            this.registeredMailsSR = result.data[0]?.registeredMailsSR[0]?.mailCount;
          } else {
            this.registeredMailsSR = 0;
          }

          this.cdr.markForCheck();
        } else {
          if (result.status === 400) {
            this.toastr.error(result.message, 'Error');
          } else {
            this.toastr.error('Oops! Something went wrong   please try again', 'Error');
          }
        }
      });
  }

  go_to_registeredMailsSR() {
    const reg_mail_Url = `${environment.TT_MAIL_BOX}mailbox/account_mailbox/customer_sr/c3VwcG9ydEB0cmF2dHJvbmljcy5jb20=#`;
    //console.log(reg_mail_Url);

    window.open(reg_mail_Url, '_blank');
  }

  go_to_registeredMailsGEN() {
    const reg_mail_Url = `${environment.TT_MAIL_BOX}mailbox/account_mailbox/customer_nosr/c3VwcG9ydEB0cmF2dHJvbmljcy5jb20=#!`;
    window.open(reg_mail_Url, '_blank');
  }

  go_to_nonRegisteredMails() {
    const reg_mail_Url = `${environment.TT_MAIL_BOX}mailbox/account_mailbox/non_customer/c3VwcG9ydEB0cmF2dHJvbmljcy5jb20=#!`;
    window.open(reg_mail_Url, '_blank');
  }

  redirectToPayments() {
    const payment_url = `${environment.RFQREDIRECTOFFLINE}redirect/finance?redirect_type=payments&from=spendlink`;
    window.open(payment_url, '_blank');
  }
  redirectToPayment_report() {
    const payment_url = `${environment.RFQREDIRECTOFFLINE}redirect/finance?redirect_type=payment_report&from=dashboardspend&source=10`;
    window.open(payment_url, '_blank');
  }





}
