import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { DashboardRequestService } from 'app/pages/dashboard/dashboard-request/services/dashboard-request.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiResponse } from '../../../dashboard-request/model/api-response';
import * as apiUrls from '../../../dashboard-request/url-constants/url-constants'
@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.scss']
})
export class CustomerDetailsComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  public contactId: number;
  public requestId: number;
  public srLineId: number;
  public serviceRequestData: any;
  public  contactsData: any;
  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private route: ActivatedRoute,
    private datepipe: DatePipe,
    private dashboardRequestService: DashboardRequestService,
    private toastrService: ToastrService,
    private cdr: ChangeDetectorRef,
    private titleService: Title
  ) {


  }

  ngOnInit(): void {

    /*get The params and call the find by contact service */
    this.route.queryParams .pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param && param.contactId && param.requestId ) {
        this.contactId = param.contactId;
        this.requestId = param.requestId;
        if (this.requestId) {
          this.getServiceData(this.requestId);
        }
        /* if (this.contactId) {
          this.getContactDetails(this.contactId);
        } */
      }


       if(param && param.rfq_id){
        this.srLineId= Number(param.rfq_id);
       }
       if(param && param.hotelRfq){
        this.srLineId= Number(param.hotelRfq);
       }
       if(param && param.rfqAncillary_id){
        this.srLineId= Number(param.rfqAncillary_id);
       }
       if(param && param.activitiesRfq){
        this.srLineId= Number(param.activitiesRfq);
       }

    });
  }
  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
  //get-service-request due to contact id purposes
  getServiceData(requestId) {
    this.dashboardRequestService.getSrRequest(requestId).pipe(takeUntil(this.ngDestroy$)).subscribe((resHeaderdata: any) => {
      this.serviceRequestData = resHeaderdata;
      this.cdr.detectChanges();
    },
      (error) => {
        this.toastrService.error('Oops! Something went wrong while fetching the SR Data  ', 'Error');
      }
    );
  }
  getContactDetails(contactId: number) {
    this.dashboardRequestService.findContactById(contactId, apiUrls.newPax_create_url.find).pipe(takeUntil(this.ngDestroy$)).subscribe((updatedata: ApiResponse) => {
      const result: ApiResponse = updatedata;
      if (result.status === 200) {
        this.contactsData = result.data[0];
        this.cdr.detectChanges();
      } else {
        this.toastrService.error('Oops! Something went wrong while fetching the contact data ', 'Error');
      }
    });
  }

gotoBookingPage(){
  this.router.navigate(['/dashboard/booking/flight'], {
    queryParams: { requestId: this.requestId, contactId:  this.contactId  },
  });
}

}
