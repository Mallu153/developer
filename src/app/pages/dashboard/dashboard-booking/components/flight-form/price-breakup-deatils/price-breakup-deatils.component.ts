import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardRequestService } from 'app/pages/dashboard/dashboard-request/services/dashboard-request.service';
import { master_data_url } from 'app/pages/dashboard/dashboard-request/url-constants/url-constants';
import { AuthService } from 'app/shared/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { formatDate } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-price-breakup-deatils',
  templateUrl: './price-breakup-deatils.component.html',
  styleUrls: ['./price-breakup-deatils.component.scss']
})
export class PriceBreakupDeatilsComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  @Input() selectedEventData: any[];
  @Input() selectedPaxType: string;
  priceBreakupDeatils:any[]=[];
  lastTicketDate:string;
  loading:boolean=true;
  private customerDetailsBySrId: any={};
  markupPaxType:string;
  constructor(
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef,
    private toastrService: ToastrService,
    private modalService: NgbModal,
    private dashboardRequestService: DashboardRequestService,
    private authService:AuthService,
    private route: ActivatedRoute,
    private router: Router,

  ) { }


  trackByFn(index, item) {
    return index;
  }

  ngOnInit(): void {
    //console.log('price breakup deatils',this.selectedEventData);
    if(this.selectedEventData){
      this.loading= false;
      this.priceBreakupDeatils=[this.selectedEventData];
      this.lastTicketDate=this.priceBreakupDeatils[0]?.lastTicketingDate;
    }
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param && param.requestId) {
        this.fetchCustomerDetailsBySrId(param.requestId);
      }
    });
    //this.applyMarkup();
  }
  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }

  fetchCustomerDetailsBySrId(requestId) {
    this.dashboardRequestService
      .getCustomerDetailsBySrId(requestId, master_data_url.fetchCustomerDetailsBySrId)
      .pipe(takeUntil(this.ngDestroy$)).subscribe((res: any) => {
        if (res) {
          this.customerDetailsBySrId = res;
        } else {
          this.toastrService.error(
            'Oops! Something went wrong while fetching the customer Details please try again  ',
            'Error'
          );
        }
      });
  }
applyMarkup(){
  let segmentData=[];
  let flightNumberData=[];
  let depatureTimeData=[];
  let rbdData=[];
if( this.priceBreakupDeatils.length>0){
  for (let index1 = 0; index1 <  this.priceBreakupDeatils.length; index1++) {
    //const element =  this.priceBreakupDeatils[index];

    for (let index2 = 0; index2 < this.priceBreakupDeatils[index1].itineraries.length; index2++) {
      //const element = this.priceBreakupDeatils[index1].itineraries[index2];
      for (let index3 = 0; index3 < this.priceBreakupDeatils[index1].itineraries[index2].segments.length; index3++) {
        const element = this.priceBreakupDeatils[index1].itineraries[index2].segments[index3];
        //console.log(element);
        const SEGMENT_DATA={
          fromCity: element.departure.iataCode,
          toCity: element.arrival.iataCode,
          marketingCarrier: element.carrierCode,
          operatingCarrier: element.operating.carrierCode
        };
        const FLIGHt_NUMBERS={flightNumber:element.number};
        //flightNumberData.push(Object?.values(FLIGHt_NUMBERS)?.join(','));
        segmentData.push(SEGMENT_DATA);
        //2022-08-15T08:40:00
        const DEPATURE_Data={
         time:  formatDate(element.departure.at,'hh:mm',"en-US","+0530")

        }
        //depatureTimeData.push(Object?.values(DEPATURE_Data)?.join(','));
      }
    }

  }
}

//console.log('flight',flightNumberData?.join(','));
//console.log('depatureTimeData',depatureTimeData?.join(','));



if(this.selectedPaxType=== "ADULT"){
  this.markupPaxType="ADT";
}else if(this.selectedPaxType=== "CHILD"){
  this.markupPaxType="CHD";
}else if(this.selectedPaxType=== "HELD_INFANT"){
  this.markupPaxType="INF";
}else{
  this.markupPaxType="";
}
  const MARKUP_DATA={
  productId: "1",
  loggedInUserId: this.authService.getUser(),
  bookingType: "4",
  customerId: this.customerDetailsBySrId?.customerId,
  customerSiteId: 0,
  customerType: this.customerDetailsBySrId?.customerTypeId,
  customerCategoryId: this.customerDetailsBySrId?.custcategoryId,
  customerRating: this.customerDetailsBySrId?.customerRating,
  codeShare: "No",
  offlineRoute: "No",
  dealEffectOnType: "ticket",
  supplierId: "1",
  airlineCode: 128,
  locationId: this.authService.getUserLocation(),
  costCenterId: this.authService.getUserCostCenter(),
  companyId: this.authService.getUserOrganization(),
  fareType: 2,
  iataId: "1",
  officeId: "",
  typeOfJourny: segmentData?.length>1? "MULTICITY" :"ONEWAY",
  offlineFlight: "No",
  paxType: this.markupPaxType,
  bookingClass: "Y,C,C",
  segments:segmentData,
  flightNumbers: flightNumberData?.join(','),
  depatureTimes: depatureTimeData?.join(','),
  rbds: "A,B,C",
  flightTravelDays: ""
  }
}



}
