import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { CashManagementService } from '../../services/cash-management.service';
import { Quote } from '../../cash-url-constants/api-url-constants';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiResponse } from 'app/shared/models/api-response';
@Component({
  selector: 'app-quote-not-fulfilled',
  templateUrl: './quote-not-fulfilled.component.html',
  styleUrls: ['./quote-not-fulfilled.component.scss', '../../../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class QuoteNotFulfilledComponent implements OnInit, OnDestroy {
  private ngUnSubscribe: Subject<void>;
  AgentList: any;
  rows: any = [];
  quotesNotFulfilledForm: FormGroup;
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
    this.onChangeAgent();
  }

  initializeForm() {
    this.quotesNotFulfilledForm = this.fb.group({
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
  onChangeAgent() {
    if (this.quotesNotFulfilledForm.valid) {
      this.storeManagementApi
        .getCountByAgent(this.quotesNotFulfilledForm.value.agent, Quote.getAgeingNotFulfilledReport)
        .pipe(takeUntil(this.ngUnSubscribe))
        .subscribe(
          (res) => {
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
