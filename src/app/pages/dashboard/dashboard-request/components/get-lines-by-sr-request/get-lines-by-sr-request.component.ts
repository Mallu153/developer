import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DashboardRequestService } from '../../services/dashboard-request.service';

@Component({
  selector: 'app-get-lines-by-sr-request',
  templateUrl: './get-lines-by-sr-request.component.html',
  styleUrls: ['./get-lines-by-sr-request.component.scss']
})
export class GetLinesBySrRequestComponent implements OnInit , OnDestroy{
  SrRequestLineApiResponse: any;
  requestHeaderId: number;
  contactid: number;
  ngDestroy$ = new Subject();
  productName:string;
  //search setup
  searchText: any;
  //pagination
  page = 1;
  pageSize = 10;
  collectionSize: number;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastrService: ToastrService,
    private dashboardRequestService: DashboardRequestService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // request id get the paramas
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param && param.requestHeaderId && param.contactId &&param.product) {
        this.requestHeaderId = param.requestHeaderId;
        this.contactid = param.contactId;
        this.productName=param.product;
      }

    });
    if (this.requestHeaderId) {
      this.getAllServiceRequestsLine(this.requestHeaderId);
    }

  }

  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
  getAllServiceRequestsLine(requestHeaderId) {
    this.dashboardRequestService.getLinesBySrRequest(requestHeaderId) .pipe(takeUntil(this.ngDestroy$)).subscribe(
      (data: any) => {
        let result = data;
        result.forEach((element) => {
          if( element.tripTypeId=== 1){
            element.tripTypeId  ='OneWay';
          }else if( element.tripTypeId=== 69){
            element.tripTypeId  ='Round';
          }else if( element.tripTypeId=== 11){
            element.tripTypeId  ='Muliticity';
          }else{
            element.tripTypeId  =null;
          }
        });
        this.SrRequestLineApiResponse = result;
        //this.SrRequestLineApiResponse = data;
        this.cdr.detectChanges();
        //this.collectionSize = this.SrRequestLineApiResponse.length;
      },
      (error) => {
        //console.log(error.error.message);
        this.toastrService.error(error, 'Error');
      }
    );
  }

  /**Find By Request Id Passing the corporate form */
  findByRequestId(selectedRowData) {
    const requestId = selectedRowData?.requestId;
    let LineId = '';
    if (selectedRowData?.requestLineId) {
      LineId = selectedRowData?.requestLineId;
    } else {
      this.toastrService.info("Service Request Lines is not Found Here", "Info")
      return;
    }
    if(this.productName==="Flight"){
      this.router.navigate(['/dashboard/booking/flight'], {
        queryParams: { requestId: requestId, contactId: this.contactid, srLineId: LineId },
      });
    }else if(this.productName==="Hotel"){
      this.router.navigate(['/dashboard/booking/hotel'], {
        queryParams: { requestId: requestId, contactId: this.contactid, hotelLineId: LineId },
      });
    }else{
      this.toastrService.info("Service Request Lines is not Found Here", "Info")
    }
  }
}
