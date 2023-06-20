import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { QUOTE_AGING } from '../../../cash-url-constants/api-url-constants';
import { CashManagementApiResponse } from '../../../models/cash-management-response';
import { CashManagementService } from '../../../services/cash-management.service';
import { environment } from 'environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quote-ageing',
  templateUrl: './quote-ageing.component.html',
  styleUrls: ['./quote-ageing.component.scss'],
})
export class QuoteAgeingComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  quoteAgeingList = [];
  loading: boolean = true;
  constructor(
    private storeManagementService: CashManagementService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getQuoteAgingReport();
  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
  trackByFn(index, item) {
    return index;
  }
  getQuoteAgingReport() {
    this.loading = true;
    this.quoteAgeingList = [];
    const data = {
      limit: 9,
    };
    this.storeManagementService
      .getQuoteAgeingReport(data, QUOTE_AGING.getQouoteAgeingReport)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        const result: CashManagementApiResponse = res;
        if (result.status === 200) {
          this.loading = false;
          this.quoteAgeingList = res.data;
          this.cdr.markForCheck();
        } else {
          if (result.status === 400 || result.status === 404 || result.status === 500 || result.status === 401) {
            this.toastr.error(result.message, 'Error');
          } else {
            this.toastr.error('Oops! Something went wrong   please try again', 'Error');
          }
          this.quoteAgeingList = [];
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  redirectToQuote(srId: number) {
    if (srId) {
      const redirectQuoteUrl = `${environment.Quote}quote/info/${srId}`;
      window.open(redirectQuoteUrl, '_blank');
    }
  }

  navigatedToOpenQuotes() {
    const OPEN_QUOTES = this.router.createUrlTree(['/dashboard/quotes/open']).toString();
    window.open(OPEN_QUOTES, '_blank');
  }


}
