import { LoginApiResonse } from './../../../../../shared/models/login-After-Hit-model';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { environment } from 'environments/environment';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OpenQuoteList } from '../../models/open-quote-list';
import { LoginResponse } from 'app/shared/models/login-response';
import { Page } from '../../models/paging';
import { AuthService } from 'app/shared/auth/auth.service';
import { CBT_API_URL } from '../../constants/cbt-api-url';
import { CbtService } from '../../services/cbt.service';

@Component({
  selector: 'app-myquotes',
  templateUrl: './myquotes.component.html',
  styleUrls: ['./myquotes.component.scss','../../../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MyquotesComponent implements OnInit, OnDestroy {

  @ViewChild("openQuotesTable") openQuotesTable: any;
  @Input() isMobile: boolean;
  @Input() private user: LoginResponse;
  private ngUnSubscribe: Subject<void>;
  public columnMode: ColumnMode.force;
  public page = new Page();
  openQuotes: OpenQuoteList[];
  constructor(
    private cd: ChangeDetectorRef,
    private toastr: ToastrService,
    private cbtServices:CbtService
  ) {}

  ngOnInit(): void {

    this.ngUnSubscribe = new Subject<void>();
    this.page.pageNumber = 0;
    this.page.size = 5;
    this.page.sortBy = "id";
    this.page.sortType = "desc";
    this.setPage({ offset: this.page.pageNumber });
  }
  ngOnDestroy(): void {
    this.ngUnSubscribe.next();
    this.ngUnSubscribe.complete();
  }
  setPage(pageInfo) {
    this.page.pageNumber = pageInfo.offset;
    const pageInfoToSend = {
      pageNo: this.page.pageNumber,
      pageSize: this.page.size,
      sortBy: this.page.sortBy,
      sortType: this.page.sortType,
    };
    this.getQuotes(pageInfoToSend);
  }
  onSort(event) {
    this.page.sortBy = event?.sorts[0]?.prop;
    this.page.sortType = event.sorts[0].dir;
    const pageInfoToSend = {
      pageNo: this.page.pageNumber,
      pageSize: this.page.size,
      sortBy: this.page.sortBy,
      sortType: this.page.sortType,
    };
    this.getQuotes(pageInfoToSend);
  }

  /**
   * Populate the user data based on the page number
   * @param page The page to select
   */
  getQuotes(params: any) {
    params.customerId = this.user.bizId;
    this.cbtServices
      .getActiveQuotesWithPagination(
        CBT_API_URL.QUOTE_OPEN_LIST,
        params
      )
      .pipe(takeUntil(this.ngUnSubscribe))
      .subscribe(
        (response) => {
          const result = response;
          if (result?.status === 200) {
            let page: Page = {
              pageNumber: result.currentPage,
              totalPages: result.totalPages,
              totalElements: result.totalElements,
              size: this.page.size,
              sortBy: this.page.sortBy,
              sortType: this.page.sortType,
            };
            this.page = page;
            this.openQuotes = result.data;
            this.cd.markForCheck();
          } else {
            this.toastr.error(result?.message);
            this.cd.markForCheck();
          }
        },
        (err) => {
          this.toastr.error("Error occurring while getting active quotes data");
        }
      );
  }
  toggleExpandRow(row) {
    this.openQuotesTable.rowDetail.toggleExpandRow(row);
  }

  onDetailToggle(event) {
    // console.log('Detail Toggled', event);
  }

  gotoQuotesOptions(quote: OpenQuoteList, type: string) {
    if (quote && quote.srId) {
      if (type === "line") {
        window.open(
          `${environment.CBTUSER}quotes/quote/getQuotesSrLineOptionsData/${quote.srId}/${quote.srLineId}`,
          "_blank"
        );
      } else if (type === "sr") {
        window.open(
          `${environment.CBTUSER}quotes/quote/info/${quote.srId}`,
          "_blank"
        );
      } else {
        return "";
      }

    } else {
      this.toastr.error("sr Id not found");
    }
  }

  /**
   * open travpx as new window
   * @param quote
   */
  openQuoteChat = (quote: OpenQuoteList) => {
    const url = `${environment.TTCHAT}chat/startTalk?userId=${this.user.userId}&usertype=1&sr=${quote.srId}&srlineId=${quote.srLineId}&moduleId=10&quoteId=${quote.id}`;
    window.open(url, "_blank");
  };


}
