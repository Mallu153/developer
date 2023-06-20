import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardRequestService } from 'app/pages/dashboard/dashboard-request/services/dashboard-request.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-service-request-id-lines-list',
  templateUrl: './service-request-id-lines-list.component.html',
  styleUrls: ['./service-request-id-lines-list.component.scss']
})
export class ServiceRequestIdLinesListComponent implements OnInit , OnDestroy {
  ngDestroy$ = new Subject();
  requestID: number;
  contactID: number;
  SrRequestLineApiResponse: any[] = [];

  //pagination
  page = 1;
  pageSize = 10;
  collectionSize: number;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastrService: ToastrService,
    private dashboardRequestService: DashboardRequestService,
    private cdr: ChangeDetectorRef,
    private datepipe: DatePipe,
    private titleService: Title
  ) {

    //this.titleService.setTitle('Request Flight');

  }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param && param.requestId && param.contactId) {
        this.requestID = param.requestId;
        this.contactID = param.contactId;
      }
    });
    if (this.requestID) {
      this.getAllServiceRequestsLine(this.requestID);
    }
  }

  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
  /*
  *
  *Add button clicked after response request line
  *find call to service
  */
  getAllServiceRequestsLine(requestId) {
    this.dashboardRequestService.getLinesBySrRequest(requestId).pipe(takeUntil(this.ngDestroy$)).subscribe(
      (resdata: any) => {
        this.SrRequestLineApiResponse = resdata;
        this.collectionSize = this.SrRequestLineApiResponse?.length;
        this.cdr.detectChanges();
      },
      (error) => {
        this.toastrService.error('Oops! Something went wrong ', 'Error');
      }
    );
  }

  findByRequestId(selectedRowData) {
    const requestId = selectedRowData?.requestId;
    let LineId = '';
    if (selectedRowData?.requestLineId) {
      LineId = selectedRowData?.requestLineId;
      this.router.navigate(['/dashboard/booking/flight'], {
        queryParams: { requestId: requestId, contactId: this.contactID, srLineId: LineId },
      });
    } else {

      this.toastrService.info('Service Request Lines is not Found Here', 'Info');
      return;
    }

  }
}
