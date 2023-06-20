import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ServiceRequestCommunicationResponse } from 'app/pages/dashboard/dashboard-request/model/service-request-communication-time-line-api-res';
import { DashboardRequestService } from 'app/pages/dashboard/dashboard-request/services/dashboard-request.service';
import { serviceRequestCommvnicationtimeLine } from 'app/pages/dashboard/dashboard-request/url-constants/url-constants';


import { ToastrService } from 'ngx-toastr';
import { fromEvent, Subject, Subscription, timer } from 'rxjs';
import { debounceTime, takeUntil, throttleTime } from 'rxjs/operators';

@Pipe({ name: 'safeHtml'})
export class SafeHtmlPipe implements PipeTransform  {
    constructor(private sanitized: DomSanitizer) {}
    transform(value) {
        return this.sanitized.bypassSecurityTrustHtml(value);
    }
}

@Component({
  selector: 'app-service-request-communication-time-line',
  templateUrl: './service-request-communication-time-line.component.html',
  styleUrls: ['./service-request-communication-time-line.component.scss'],
})
export class ServiceRequestCommunicationTimeLineComponent implements OnInit, OnDestroy {
  private ngUnSubscribe: Subject<void>;
  public timeline = [];
  private _dateFormat: string = 'MMMM d, y';
  private _dateFormatTop: string = 'dd MMM';
  public showTimeInfo=[];

  public loading:boolean=false;

  @ViewChild('horizontalScrollElem', { static: true })
  horizontalScrollElem: ElementRef | null = null

  enablePrev = false;
  enableNext = false;
  private scrollObserver: Subscription | null = null;
  constructor(
    private route: ActivatedRoute,
    private toastrService: ToastrService,
    private cdr: ChangeDetectorRef,
    private dashboardRequestService: DashboardRequestService
  ) {

  }
  get dateFormat(): string {
    return this._dateFormat;
  }
  get dateFormatTop(): string {
    return this._dateFormatTop;
  }


  getActiveQueryParams() {
    this.route.queryParams.pipe(takeUntil(this.ngUnSubscribe)).subscribe((param) => {
      if (param && param.requestId) {
        this.getTimeLineData(Number(param.requestId));
      }
    });
  }

  getTimeLineData(srNumber: number) {
    this.dashboardRequestService.getRequestTimeLineData(srNumber, serviceRequestCommvnicationtimeLine.get)
      .pipe(takeUntil(this.ngUnSubscribe)).subscribe((res: ServiceRequestCommunicationResponse) => {
        const result = res;
        if (result.status === true) {
          this.timeline=result.data;
          //this.setShownData();
          this.loading=false;
          this.showTimeLineDetailsInfo(0);
          this.cdr.markForCheck();
        } else {
          this.timeline=[];
          this.loading=true;
          this.toastrService.info(result.message, 'INFO', { progressBar: true });
          this.cdr.markForCheck();
        }
      },(error)=>{    this.cdr.markForCheck();  this.loading=true;this.toastrService.info(error, 'INFO', { progressBar: true });});
  }

  showTimeLineDetailsInfo(index:number) {

    this.showTimeInfo=[false];
    this.showTimeInfo[index] = !this.showTimeInfo[index];


  }




  ngOnInit(): void {
    this.ngUnSubscribe = new Subject<void>();
    this.getActiveQueryParams();

    if (this.horizontalScrollElem) {
      const horizontalScrollElem = this.horizontalScrollElem;


      this.scrollObserver = fromEvent(
        horizontalScrollElem.nativeElement,
        'scroll',
      )
        .pipe(debounceTime(100), throttleTime(100))
       .subscribe(_ => {
          this.updateNavigationBtnStatus(horizontalScrollElem
            .nativeElement as HTMLElement)
        })
    }
  }

  ngOnDestroy(): void {
    this.ngUnSubscribe.next();
    this.ngUnSubscribe.complete();

    if (this.scrollObserver) {
      this.scrollObserver.unsubscribe();
      this.scrollObserver = null;
    }
  }

  ngOnChanges() {
    timer(100).pipe(takeUntil(this.ngUnSubscribe)).subscribe(() => {
      if (this.horizontalScrollElem) {
        this.updateNavigationBtnStatus(this.horizontalScrollElem
          .nativeElement as HTMLElement)
      }
    })
  }


  showPrev() {
    if (this.horizontalScrollElem) {
      if (this.horizontalScrollElem) {
        const clientWidth = (this.horizontalScrollElem.nativeElement.clientWidth * 0.24)

        this.horizontalScrollElem.nativeElement.scrollTo({
          left: this.horizontalScrollElem.nativeElement.scrollLeft - clientWidth,
          behavior: 'smooth',
        })
      }
    }
  }
  showNext() {
    if (this.horizontalScrollElem) {
      if (this.horizontalScrollElem) {
        const clientWidth = (this.horizontalScrollElem.nativeElement.clientWidth * 0.24)


        this.horizontalScrollElem.nativeElement.scrollTo({
          left: this.horizontalScrollElem.nativeElement.scrollLeft + clientWidth,
          behavior: 'smooth',
        })
      }
    }
  }
  private updateNavigationBtnStatus(elem: HTMLElement) {
    this.enablePrev = true;
    this.enableNext = true;
    if (elem.scrollLeft === 0) {
      this.enablePrev = false
    }
    if (elem.scrollWidth === elem.clientWidth + elem.scrollLeft) {
      this.enableNext = false
    }
  }

  viewFile(data) {
    window.open(data, "_blank");
  }


  trackByFn(index, item) {
    return index;
  }
}
