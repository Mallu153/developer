import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MicroAccountView } from 'app/shared/models/micro-account-view';
import { MasterDataService } from 'app/shared/services/master-data.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Micro_account_url } from '../../constants/sr-reports-url-constants';
import { BookingReportsApiResponse } from '../../models/invoice-api-response';

@Component({
  selector: 'app-booking-details-micro-account-data',
  templateUrl: './booking-details-micro-account-data.component.html',
  styleUrls: ['./booking-details-micro-account-data.component.scss']
})
export class BookingDetailsMicroAccountDataComponent implements OnInit , OnDestroy{
microAccountData:any[];
view_type_str : string;
ngDestroy$ = new Subject();
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private masterData:MasterDataService,
    private cd: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param && param.booking_id &&param.passenger_id&&param.product_id&&param.view_type) {
        this.view_type_str=param.view_type;
     const MICRO_ACCOUNT_DATA={
       "booking_id" :Number(param.booking_id),
       "passenger_id" : Number(param.passenger_id),
       "product_id" : Number(param.product_id)
      };

      this.getMicroAccountData(MICRO_ACCOUNT_DATA);
      }
    });
  }
  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
  getMicroAccountData(Data:MicroAccountView){
    this.masterData.getMicroAccountDetails(Data,Micro_account_url.get_micro_account).pipe(takeUntil(this.ngDestroy$)).subscribe((res:BookingReportsApiResponse) => {
      const result: BookingReportsApiResponse = res;
      if (result.status === true) {
      this.microAccountData=result.data;
      this.cd.markForCheck();
      } else {
        //this.toastr.error('Oops! Something went wrong while send the data please try again', 'Error');
        this.toastr.error(result.message, 'Error');
        this.cd.markForCheck();
      }
    },(error)=>{ this.toastr.error(error, 'Error');});
  }


  microTable(){

    const BOOKING_ID = this.route.snapshot.queryParams.booking_id;
    const PASSENGER_ID = this.route.snapshot.queryParams.passenger_id;
    const PRODUCT_ID = this.route.snapshot.queryParams.product_id;
    this.router.navigate(['/dashboard/reports/micro-account-view'], { queryParams: { booking_id: BOOKING_ID,passenger_id:PASSENGER_ID,product_id:PRODUCT_ID ,view_type:'table'} });
  }
  microTimeLine(){
    const BOOKING_ID = this.route.snapshot.queryParams.booking_id;
    const PASSENGER_ID = this.route.snapshot.queryParams.passenger_id;
    const PRODUCT_ID = this.route.snapshot.queryParams.product_id;
    this.router.navigate(['/dashboard/reports/micro-account-view'], { queryParams: { booking_id: BOOKING_ID,passenger_id:PASSENGER_ID,product_id:PRODUCT_ID ,view_type:'timeline'} });
  }
}
