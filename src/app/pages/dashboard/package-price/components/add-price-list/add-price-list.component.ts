import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { concat, Observable, of, Subject } from 'rxjs';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AddpricePackageService, PackagesAddPrice } from '../../services/addprice-package.service';
import { CREATEPACKAGEPRICE, ITINERARAYLIST } from '../../constants/addPrice-packages-url';
import { catchError, debounceTime, distinctUntilChanged, filter, switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-add-price-list',
  templateUrl: './add-price-list.component.html',
  styleUrls: ['./add-price-list.component.scss', '../../../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AddPriceListComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  public ColumnMode = ColumnMode;
  public rows: any = [];
  public resultMessage: string = null;
  public sorts = [{ prop: 'createdDate', dir: 'desc' }];
  @ViewChild('tableRowDetails') tableRowDetails: any;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  public limitRef = 10;

  //itinerary serach
  itinerary$: Observable<any>;
  itineraryLoading = false;
  itineraryInput$ = new Subject<string>();
  minLengthItineraryTerm = 3;

  constructor(
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private addPriceServices: AddpricePackageService
  ) {}

  loadItineraryList() {
    this.itinerary$ = concat(
      of([]), // default items
      this.itineraryInput$.pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthItineraryTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.cdr.markForCheck(), (this.itineraryLoading = true))),
        switchMap((term) => {
          return this.addPriceServices.getItineraryList(ITINERARAYLIST.get, term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.itineraryLoading = false))
          );
        })
      )
    );
  }

  getPriceList() {
    this.addPriceServices
      .getPackagePricingList(CREATEPACKAGEPRICE.get)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (res: PackagesAddPrice) => {
          const result = res;
          if (result.status === 200 && result.data.length > 0) {
            this.rows = result.data;
            this.cdr.markForCheck();
          } else {
            this.rows = [];
            this.resultMessage=result.message;
            this.toastr.error(result.message, 'Error',{progressBar:true});
            this.cdr.markForCheck();
          }
        },
        (error) => {
          this.rows = [];
          this.toastr.error(error, 'Error',{progressBar:true});
          this.cdr.markForCheck();
        }
      );
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



  ngOnInit(): void {
    this.getPriceList();
    this.loadItineraryList();
  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
