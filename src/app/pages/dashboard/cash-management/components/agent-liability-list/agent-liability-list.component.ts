import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { AuthService } from 'app/shared/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { getAgentAllCashTransactions } from '../../cash-url-constants/api-url-constants';
import { CashManagementApiResponse } from '../../models/cash-management-response';
import { CashManagementService } from '../../services/cash-management.service';

@Component({
  selector: 'app-agent-liability-list',
  templateUrl: './agent-liability-list.component.html',
  styleUrls: ['./agent-liability-list.component.scss','../../../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AgentLiabilityListComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();

  public ColumnMode = ColumnMode;
  // row data
  public rows :any = [];
  // column header
  reorderable = true;
  sorts=[
    { prop: 'created_date', dir: 'desc' },
  ];
  public columns = [
    { name: "Agent Name", prop: "agentName" },
    { name: "SR ID", prop: "sr_id" },
    { name: "Transaction Type", prop: "transaction_type" },
    { name: "Transaction Ref.No", prop: "transaction_refno" },
    { name: "Total Amount", prop: "total_amount" },
    { name: "Prevoius Balance", prop: "agent_credit_limit" },
    { name: "Current Balance", prop: "agent_credit_limit_balance" },
    { name: "Product", prop: "productName" },
    { name: "Micro Account Ref", prop: "micro_account_id" },
    { name: "Transaction Date", prop: "created_date" },

  ];
  @ViewChild('tableRowDetails') tableRowDetails: any;
  @ViewChild(DatatableComponent) table: DatatableComponent;

  public limitRef = 10;
  private tempData:any = [];
  loading:boolean=false;
  constructor(
    private titleService: Title,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private datepipe: DatePipe,
    private cdr: ChangeDetectorRef,
    private authService:AuthService,
    private storeManagementApi:CashManagementService
    ) {
      this.titleService.setTitle('Agent Liability Transactions');
    }

  ngOnInit(): void {
    this.agentCashData();
  }
  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }

  agentCashData(){
    this.loading=true;
    this.storeManagementApi.getAgentCashData(this.authService.getUser(),getAgentAllCashTransactions.LIABILITY_URL).pipe(takeUntil(this.ngDestroy$)).subscribe((res:CashManagementApiResponse) => {
      const result: CashManagementApiResponse = res;
      if (result.status === 200) {

      this.rows=result.data;
      this.loading=false;
      this.cdr.markForCheck();
      } else {
        this.loading=false;
        this.toastr.warning(result.message);
        this.cdr.markForCheck();
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
    this.cdr.markForCheck();
  }
  goToDashBoard(){
    this.router.navigate(['/dashboard/cash-management/cash-dashboard']);
    }

}
