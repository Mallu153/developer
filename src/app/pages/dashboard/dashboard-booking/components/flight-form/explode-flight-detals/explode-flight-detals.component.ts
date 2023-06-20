import { ToastrService } from 'ngx-toastr';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FlexRequest, FlexResponse, FlexRoute, FlexRouteInfo } from 'app/shared/models/flex-response';
import { DashboardRequestService } from 'app/pages/dashboard/dashboard-request/services/dashboard-request.service';
import { forEach } from 'core-js/core/array';
import { environment } from 'environments/environment';
import { PriceBreakupDeatilsComponent } from '../price-breakup-deatils/price-breakup-deatils.component';
import { FlexPrice } from 'app/shared/models/flex-price';
import { PriceAccessDeatils } from 'app/shared/models/price-auth-response';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-explode-flight-detals',
  templateUrl: './explode-flight-detals.component.html',
  styleUrls: ['./explode-flight-detals.component.scss'],
})
export class ExplodeFlightDetalsComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  @Input() explodeList: any[] = [];
  @Input() explodeHeaderInfo: {
    product: number;
    requester: number;
    service_request: number;
    service_request_line: number;
  };
  masterSelected: boolean = false;
  loading = false;
  showPriceData=false;
  price_access_token:string;
  constructor(
    public activeModal: NgbActiveModal,
    private toastr: ToastrService,
    private dashboardRequestService: DashboardRequestService,
    private modalService: NgbModal,

  ) {}



  trackByFn(index, item) {
    return index;
  }
  ngOnInit(): void {
    //this.loading = true;
    //this.getPriceData(this.explodeList);
    if(this.explodeList) {
      this.explodeList.forEach((v, index) => {
        //console.log("data" + index, v);
        this.getPriceToken(v,index);
        //if(this.price_access_token){
          //this.getPriceData(v,index,this.price_access_token);
        //}
      });
    }
  }
  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
  getPriceToken(data,index){
    this.dashboardRequestService.priceToken().pipe(takeUntil(this.ngDestroy$)).subscribe((resData:PriceAccessDeatils) => {
      const result: PriceAccessDeatils = resData;
      if(result){
        this.price_access_token=result?.access_token;
        this.getPriceData(data,index,result?.access_token);
        //sessionStorage.setItem('price_token',result?.access_token);
      }
    },(error)=>{
      console.log(error);
    });
  }

  // The master checkbox will check/ uncheck all items
  checkUncheckAll() {
    for (var i = 0; i < this.explodeList.length; i++) {
      this.explodeList[i].isSelected = this.masterSelected;
    }
    // this.getCheckedItemList();
  }

  // Check All Checkbox Checked
  isAllSelected() {
    this.masterSelected = this.explodeList.every(function (item: any) {
      return item.isSelected == true;
    });
    //  this.getCheckedItemList();
  }

  onSubmit() {
    const selectedData = this.explodeList.filter((v) => {
      if (v.isSelected === true) {
        return v;
      }
    });
    if (selectedData && selectedData.length === 0) {
      this.toastr.error('Please select any one combination to submit');
    }
    const flexData: FlexRequest = {
      product: this.explodeHeaderInfo.product,
      requester: this.explodeHeaderInfo.requester,
      service_request: this.explodeHeaderInfo.service_request,
      service_request_line: this.explodeHeaderInfo.service_request_line,
      flex_request: [],
    };
    selectedData.forEach((flex) => {
      const flexRouteInfo: FlexRouteInfo = {
        city_departure: flex.flexFromCode,
        city_arrival: flex.flexToCode,
        date_departure: flex.flexDepature?.flexDepatureDate,
        time_departure: flex.flexDepature?.flexDepatureTime,
        carrier: flex.flexAirLineCode,
        class: flex.flexClassName?.code,
        rbd: flex.flexFromCode,
      };
      const flexRoute: FlexRoute = {
        route: [flexRouteInfo],
      };
      flexData.flex_request.push(flexRoute);
    });
    this.dashboardRequestService.flexInsert(flexData).pipe(takeUntil(this.ngDestroy$)).subscribe((res: FlexResponse) => {
      const result = res;
      if (!result.status) {
        this.toastr.error(result.message);
        return;
      }
      this.toastr.success(result.message);
      let url = `${environment.RFQREDIRECTOFFLINE}redirect/flex?sr_no=${flexData.service_request}&sr_line_no=${flexData.service_request_line}&product=${flexData.product}&flex_request_id=${result.flex_request_id}`;
      //open new tabs
      for (const route of result.flex_request_lines) {
        window.open(url + `&route_id=${route._id}`, '_blank');
      }
    });
  }




getPriceBreakupDeatilsData(flexInfo,paxType){
//console.log(flexInfo,paxType);
//console.log('flexInfo',flexInfo);
//const htmlElement:any = event.target || event.srcElement || event.currentTarget;
//console.log('divEl',htmlElement);
//console.log('divEl',htmlElement?.id);
const modalRef = this.modalService.open(PriceBreakupDeatilsComponent, { size: 'xl' });
modalRef.componentInstance.name = 'Price Breakup Details';
modalRef.componentInstance.selectedEventData = flexInfo;
modalRef.componentInstance.selectedPaxType = paxType;

}

getPriceData(data, index,token){
  //console.log(token);
  //console.log('flexInfo',data);
  let searchObj = {};
  if(data?.returnDate){
    searchObj['returnDate'] = data?.returnDate;
  }
  searchObj['originLocationCode'] = data?.flexFromCode;
  searchObj['destinationLocationCode'] = data?.flexToCode;
  searchObj['departureDate'] = data?.flexDepature?.flexDepatureDate;
  searchObj['adults'] = 1;
  searchObj['children'] = 1;
  searchObj['infants'] = 1;
  searchObj['nonStop'] = false;
  searchObj['max'] = 2;
  searchObj['currencyCode'] = 'AED';

  this.dashboardRequestService.getFlexPrice(searchObj,token).pipe(takeUntil(this.ngDestroy$)).subscribe((resData:FlexPrice) => {
    const result: FlexPrice = resData;
    if (result.data.length>0) {
      //console.log('data' + index, resData.data[0]);
      this.explodeList[index].priceData = resData.data[0];
    }
  },(error)=>{
    //console.log(error);
    this.toastr.error(
      error,
      'Error'
    );


  });
}

}
