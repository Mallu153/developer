import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { ApiResponse } from 'app/shared/models/api-response';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { CashManagementService } from '../../services/cash-management.service';
import { takeUntil } from 'rxjs/operators';
import { Quote } from '../../cash-url-constants/api-url-constants';
@Component({
  selector: 'app-quote-count-report',
  templateUrl: './quote-count-report.component.html',
  styleUrls: ['./quote-count-report.component.scss', '../../../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class QuoteCountReportComponent implements OnInit {
  private ngUnSubscribe: Subject<void>;
  AgentList: any;
  rows: any = [];
  quotesCountReportForm: FormGroup;
  public ColumnMode = ColumnMode;
  public columns = [
    { name: 'AgentName', prop: 'agentName' },
    { name: 'SR#', prop: 'sr' },
    { name: 'Quotes', prop: 'quotes' },
    { name: 'Approved Quotes', prop: 'approvedQuotes' },
    { name: 'Bookings', prop: 'bookings' },
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
    this.onChangeAgents();
  }

  initializeForm() {
    this.quotesCountReportForm = this.fb.group({
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
  onChangeAgents() {
    if (this.quotesCountReportForm.valid) {
      this.storeManagementApi
        .getCountByAgent(this.quotesCountReportForm.value.agent, Quote.getCount_Report_By_Agent)
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
