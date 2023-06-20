
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiResponse } from 'app/shared/models/api-response';
import { MasterDataService } from 'app/shared/services/master-data.service';
import { environment } from 'environments/environment';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-flight-suggestions-list',
  templateUrl: './flight-suggestions-list.component.html',
  styleUrls: ['./flight-suggestions-list.component.scss'],

})
export class FlightSuggestionsListComponent implements OnInit , OnDestroy  {
  ngDestroy$ = new Subject();
  @Input() public flightSuggestionsList :any[];
  flightClass=[];
  initialDataShown=[];
  initialCount: number=0;
  iTestData: number;

  imageUrl=environment.RFQREDIRECTOFFLINE;

  requestId:number;
  srLineId:number;
  constructor(
    public masterDataService: MasterDataService,
    private cdr: ChangeDetectorRef,
    private toastrService: ToastrService,
    private route: ActivatedRoute,
  ) {
    this.iTestData = 0;
    this.initialCount=0;
    //let mySplitString = this.stringSplitter('0205', 2);
    //console.log(mySplitString);
  }


  getMasterClass() {
    this.masterDataService
      .getMasterDataByTableName('master_class')
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((data) => {
        if (data?.length>0) {
          this.flightClass=data;
         this.cdr.markForCheck();

        } else {
          this.toastrService.error('Oops! Something went wrong while fetching the Class Data', 'Error');
          this.cdr.markForCheck();
        }
      });
  }

  getFlightCode(suggestionsCode:string){
    if(this.flightClass.length>0){
      const flightCode =  this.flightClass.find((v)=>v.code === suggestionsCode);

     if(flightCode===undefined){
      return "Economy";
     }else{
      return flightCode?.name;
     }

    }else{
      return "Economy";
    }

  }

  getAirLineFullCode(code:string,index:number){

    this.masterDataService.getAirLineData(code).pipe(takeUntil(this.ngDestroy$)).subscribe((res:ApiResponse) => {
     const result:ApiResponse=res;
     if(result.status === 200){
      const fullCode=result.data.find((v)=>v.shortCode2Digit === code);
      this.flightSuggestionsList.forEach((element:any,index) => {
        element.airLineName= fullCode?.name;
      });
      this.cdr.markForCheck();
     }else {
      this.toastrService.error('Oops! Something went wrong while fetching the Air Line Data', 'Error');
      this.flightSuggestionsList.forEach((element:any,index) => {
        element.airLineName='NA';
      });
      this.cdr.markForCheck();
    }
    });

  }
  stringSplitter(myString, chunkSize) {
    let splitString = [];
    for (let i = 0; i < myString?.length; i = i + chunkSize) {
        splitString.push(myString?.slice(i, i + chunkSize));
    }
    return splitString[0]+':'+splitString[1];
}

Online(requestId:string,reqLineId:string,bookingId  :string) {
  const onlineUrl = `${environment.RFQREDIRECTOFFLINE}redirect?sr_no=${requestId}&sr_line_no=${reqLineId}&product=flight&channel=online&bkid=${bookingId}`;

  window.open(onlineUrl, '_blank');
}





setShownData() {

  this.initialDataShown = this.flightSuggestionsList.slice(
    this.iTestData * 3,
    (this.iTestData + 1) * 3
  );

  this.cdr.markForCheck();
}

previous() {
  if (this.iTestData != 0) {
    this.iTestData = this.iTestData - 1;
    this.setShownData();
  }
  this.cdr.markForCheck();
}

next() {
  if ((this.iTestData + 1) * 3 < this.flightSuggestionsList.length) {
    this.iTestData = this.iTestData + 1;
    this.setShownData();
  }
  this.cdr.markForCheck();
}

twoDatesDifference(apiDate1:string,apiDate2:string) {
  const date1 = new Date(apiDate1);
  const date2 = new Date(apiDate2);
  const diffInMs = Math.abs(date2.getTime() - date1.getTime());
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInMinutes = Math.floor((diffInMs % 3600000) / 60000);

  return [diffInHours , diffInMinutes];
}



trackByFn(index, item) {
  return index;
}
  ngOnInit(): void {
    this.getMasterClass();
    if(this.flightSuggestionsList.length>0){
      this.flightSuggestionsList.forEach((element,index) => {
       //this.getAirLineFullCode(element.TktAirlineCode,index);
       element.segmentData= JSON.parse(element.bookingSegments),
       element.airlineLogo=`${environment.RFQREDIRECTOFFLINE}tt-pub/airline-logos/v1/airline_logo/${ element.TktAirlineCode}.gif`

      });
      this.setShownData();
    }

    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param && param.requestId&& param.srLineId) {
        this.requestId = Number(param.requestId);
        this.srLineId = Number(param.srLineId);
      }
    });

  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }

}
