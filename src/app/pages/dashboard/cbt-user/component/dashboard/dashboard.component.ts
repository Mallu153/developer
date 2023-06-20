import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from 'app/shared/auth/auth.service';
import { LoginResponse } from 'app/shared/models/login-response';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CBT_API_URL } from '../../constants/cbt-api-url';
import {
  CreditLimitCount,
  CreditLimitCounts,
  UnInvoicedTicket,
  UnInvoicedTickets,
  UnissuedSalesOrder,
  UnissuedSalesOrders,
} from '../../models/dashboard-interfaces';
import { CbtService } from '../../services/cbt.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  isMobile: boolean;
  user: LoginResponse;
  ngDestroy$ = new Subject();
  creditLimitCounts: CreditLimitCounts;
  unIssuedSalesOrders: UnissuedSalesOrders;
  unInvoicedTicketCounts: UnInvoicedTickets;
  constructor(
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
    private cbtServices: CbtService,
    private deviceService: DeviceDetectorService,
    private authServices: AuthService
  ) {
    this.isMobile = this.deviceService.isMobile();
  }

  ngOnInit(): void {
    this.user = this.authServices.getUserDetails();
    if (this.user && this.user?.bizId) {
      this.getCreditLimitCounts(this.user?.bizId?.toString(), 'customer');
      this.getUnissuedSalesOrders(this.user.bizId?.toString());
      this.getUnInvoicedTicketCounts(this.user.bizId?.toString());
    }
  }
  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }

  /**
   *
   *
   * @param {string} customerId
   * @param {string} userType
   * @memberof DashboardComponent
   */
  getCreditLimitCounts(customerId: string, userType: string) {
    this.cbtServices
      .getCbtWidgetsCount(CBT_API_URL.CREDIT_LIMIT_COUNT + userType + '/' + customerId)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((response: CreditLimitCount) => {
        const result: CreditLimitCount = response;
        if (result.status === 200 && result?.data && result?.data?.length == 1) {
          this.creditLimitCounts = result.data[0];
          this.cd.markForCheck();
        } else {
          this.toastr.error('No Credit Limit Data Found',"Error",{progressBar:true});
          this.cd.markForCheck();
        }
      });
  }

  /**
   *
   *
   * @param {string} customerId
   * @memberof DashboardComponent
   */
  getUnissuedSalesOrders(customerId: string) {
    this.cbtServices
      .getCbtWidgetsCount(CBT_API_URL.UNISSUED_SALES_ORDERS_COUNT + customerId)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((response: UnissuedSalesOrder) => {
        const result = response;
        if (result.status === 200 && result.data && result.data?.length == 1) {
          this.unIssuedSalesOrders = result.data[0];
          this.cd.markForCheck();
        } else {
          this.toastr.error('No Unissued Sales Orders Found',"Error",{progressBar:true});
          this.cd.markForCheck();
        }
      });
  }

  /**
   *
   *
   * @param {string} customerId
   * @memberof DashboardComponent
   */
  getUnInvoicedTicketCounts(customerId: string) {
    this.cbtServices
      .getCbtWidgetsCount(CBT_API_URL.UN_INVOICED_TICKET_COUNT + customerId)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((response: UnInvoicedTicket) => {
        const result: UnInvoicedTicket = response;
        if (result.status === 200 && result.data && result.data?.length == 1) {
          this.unInvoicedTicketCounts = result.data[0];
          this.cd.markForCheck();
        } else {
          this.toastr.error('No UnInvoiced Tickets Found',"Error",{progressBar:true});
          this.cd.markForCheck();
        }
      });
  }
}
