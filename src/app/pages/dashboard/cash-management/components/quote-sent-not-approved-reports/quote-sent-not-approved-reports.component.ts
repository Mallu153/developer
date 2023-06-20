import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { CashManagementService } from '../../services/cash-management.service';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { Quote } from '../../cash-url-constants/api-url-constants';
import { takeUntil } from 'rxjs/operators';
import { ApiResponse } from 'app/shared/models/api-response';
@Component({
  selector: 'app-quote-sent-not-approved-reports',
  templateUrl: './quote-sent-not-approved-reports.component.html',
  styleUrls: ['./quote-sent-not-approved-reports.component.scss', '../../../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class QuoteSentNotApprovedReportsComponent implements OnInit {
  private ngUnSubscribe: Subject<void>;
  AgentList: any;
  rows: any = [];
  quoteSentNotApprovedForm: FormGroup;
  public ColumnMode = ColumnMode;
  public columns = [
    { name: 'AgentName', prop: 'agentName' },
    { name: '<5 Mins', prop: 'lessThan5Min' },
    { name: '5-10 Mins', prop: 'between5MinAnd10Min' },
    { name: '10-30 Mins', prop: 'between10MinAnd30Min' },
    { name: '30-60 Mins', prop: 'between30MinAnd60Min' },
    { name: '>60 Mins', prop: 'greaterThan60Min' },
  ];
  public limitRef = 10;
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private storeManagementApi: CashManagementService
  ) {}

  ngOnInit(): void {
    this.ngUnSubscribe = new Subject<void>();
    this.initializeForm();
    this.getAgents();
    this.onChangeNotApproved();
  }

  initializeForm() {
    this.quoteSentNotApprovedForm = this.fb.group({
      agent: '',
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
  onChangeNotApproved() {
    if (this.quoteSentNotApprovedForm.valid) {
      this.storeManagementApi
        .getCountByAgent(this.quoteSentNotApprovedForm.value.agent, Quote.getQuoteSentNotApproved)
        .pipe(takeUntil(this.ngUnSubscribe))
        .subscribe(
          (res) => {
            console.log(res);
            const result: ApiResponse = res;
            if (result.status === 200) {
              this.rows = result.data;
              this.cdr.markForCheck();
            }
          },
          (error) => {
            this.toastr.error(error, 'Error', { progressBar: true });
          }
        );
    }
  }
  getAgents() {
    this.storeManagementApi
      .readAgent(Quote.getAgents)
      .pipe(takeUntil(this.ngUnSubscribe))
      .subscribe((res) => {
        const result: ApiResponse = res;
        console.log(result);
        if (res.length > 0) {
          this.AgentList = res;
          this.cdr.markForCheck();
        }
      });
  }
  ngOnDestroy(): void {
    this.ngUnSubscribe.next();
    this.ngUnSubscribe.complete();
  }
}
