import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { CashManagementService } from '../../services/cash-management.service';
import { takeUntil } from 'rxjs/operators';
import { ApiResponse } from 'app/shared/models/api-response';
import { Quote } from '../../cash-url-constants/api-url-constants';
@Component({
  selector: 'app-quote-added-reports',
  templateUrl: './quote-added-reports.component.html',
  styleUrls: ['./quote-added-reports.component.scss', '../../../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class QuoteAddedReportsComponent implements OnInit {
  private ngUnSubscribe: Subject<void>;
  AgentList: any;
  rows: any = [];
  quotesAddedForm: FormGroup;
  public ColumnMode = ColumnMode;
  public columns = [
    { name: 'Request ID', prop: 'serviceRequestNumber' },
    { name: 'Product', prop: 'product' },
    { name: 'Customer Name', prop: 'businessName' },
    { name: 'Contact Name', prop: 'contactName' },
    { name: 'Origin/ Destination', prop: 'originDestinationLocation' },
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
    this.onChangeAddedAgent();
  }

  initializeForm() {
    this.quotesAddedForm = this.fb.group({
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
  onChangeAddedAgent() {
    if (this.quotesAddedForm.valid) {
      this.storeManagementApi
        .getCountByAgent(this.quotesAddedForm.value.agent, Quote.getQuoteButNotSentAgeingReport)
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
