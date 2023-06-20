import { ChangeDetectorRef, Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { DashboardRequestService } from 'app/pages/dashboard/dashboard-request/services/dashboard-request.service';
import { ToastrService } from 'ngx-toastr';
import { FlexPrice } from '../models/flex-price';
import { PriceAccessDeatils } from '../models/price-auth-response';

@Directive({
  selector: '[appFlexprice]'
})
export class FlexpriceDirective {
  price_info_data:any[]=[];
  priceData:any[]=[];
  adult_count:any=0;
  child_count:any=0;
  infant_count:any=0;
  //loading:boolean=false;
  @Input('appFlexprice')
  set count(flexInfo: any) {
    //console.log('flexInfo',flexInfo);
    this.adult_count=flexInfo?.noofADT;
    this.child_count=flexInfo?.noofCHD;
    this.infant_count=flexInfo?.noofINF;
    //this.loading=true;
    //this.getPriceData(flexInfo);
  }
  constructor(
    private dashboardRequestService: DashboardRequestService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private readonly elementRef: ElementRef,
    private readonly renderer: Renderer2,
    ) {

   }

   getPriceToken(){
    this.dashboardRequestService.priceToken().subscribe((resData:PriceAccessDeatils) => {
      const result: PriceAccessDeatils = resData;
      if(result){
        sessionStorage.setItem('price_token',result?.access_token);
      }
    },(error)=>{
      console.log(error);
    });
  }
   getPriceData(data){
    //console.log('flexInfo',data);
    let searchObj = {};
    this.getPriceToken();
   /*  const OBJECT_DATA={
      originLocationCode:data?.flexFromCode,
      destinationLocationCode:data?.flexToCode,
      departureDate:data?.flexDepature?.flexDepatureDate,
      adults:data?.noofADT,
      nonStop:false,
      max:2,
      currencyCode:'INR'
    }; */
    //returnDate
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
   /*  this.renderer.setProperty(
      this.elementRef.nativeElement,
      'innerHTML',
      `<div *ngIf="loading" >
      <span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
       Loading Please wait...
     </div>`

    ); */
    this.dashboardRequestService.getFlexPrice(searchObj,'abc').subscribe((resData:FlexPrice) => {
      const result: FlexPrice = resData;
      if (result.data.length>0) {
        //console.log(resData.data[0]);
        this.price_info_data.push(resData.data[0]);
        for (let index = 0; index <  this.price_info_data.length; index++) {
          const element =  this.price_info_data[index];
         // console.log(element.travelerPricings);
          if(this.price_info_data[index].travelerPricings?.length >0){
            let ADTAmount:any =0;
            let CHDAmount:any =0;
            let INFAmount:any =0;
            for (let subindex = 0; subindex < this.price_info_data[index].travelerPricings?.length; subindex++) {
              if(this.price_info_data[index].travelerPricings[subindex].travelerType==="ADULT"){
                if(this.adult_count>1){
                  ADTAmount = (this.price_info_data[index].travelerPricings[subindex]?.price.total *this.adult_count).toFixed(2) ;
                  //console.log('adt if');
                }else{
                 // console.log('adt else');
                  ADTAmount = this.price_info_data[index].travelerPricings[subindex]?.price.total ;
                }

              }
               if(this.price_info_data[index].travelerPricings[subindex].travelerType==="CHILD"){
                if(this.child_count>1){
                 // console.log('chd if');
                  CHDAmount = (this.price_info_data[index].travelerPricings[subindex]?.price.total *this.child_count).toFixed(2) ;
                }else{
                  //console.log('chd else');

                  if(this.child_count>0){
                    CHDAmount =  this.price_info_data[index].travelerPricings[subindex]?.price.total;
                  }

                }
              }
               if(this.price_info_data[index].travelerPricings[subindex].travelerType === "HELD_INFANT"){
                if(this.infant_count>1){
                  INFAmount = (this.price_info_data[index].travelerPricings[subindex]?.price.total * this.infant_count).toFixed(2) ;
                }else{
                  //console.log(' inft else');
                  if(this.infant_count>0){
                    INFAmount =  this.price_info_data[index].travelerPricings[subindex]?.price.total;
                  }

                }
              }
            }

            const data={
              ADT:ADTAmount,
              CHD:CHDAmount,
              INF:INFAmount
            }
            this.priceData.push(data);
            //console.log(this.priceData);
            /* this.renderer.setProperty(
              this.elementRef.nativeElement,
              'innerHTML',
              this.priceData[0].ADT

            ); */
            //this.loading=false;
            this.priceData.forEach(
              (e) =>{

                (
                  this.elementRef.nativeElement.innerHTML += `
                  <div class="text-primary cursor-pointer" (click)="getData(${this.price_info_data})" id="ADULT" #ADULT >
                  ADT - ${e.ADT}
                </div>
                `)
                if(e.CHD === 0){
                }else{

                  (
                    this.elementRef.nativeElement.innerHTML += `
                    <div class="text-primary cursor-pointer" id="CHILD" #CHILD>
                    CHD - ${e.CHD}
                    </div>
                  `)
                }
                if(e.INF === 0){
                }else{

                  (
                    this.elementRef.nativeElement.innerHTML += `
                  <div class="text-primary cursor-pointer" id="HELD_INFANT" #HELD_INFANT>
                  INF - ${e.INF}
                  </div>
                  `)
                }

              }
              );
          }else{
            this.priceData=[];

          }
        }
        this.cdr.markForCheck();
      } /* else {
        this.toastr.error(
          result.errors[0].detail,
          'Error'
        );
        this.cdr.markForCheck();
      } */
    },(error)=>{
      console.log(error);
      this.toastr.error(
        error,
        'Error'
      );

      this.getPriceToken();
      this.cdr.markForCheck();
    });
  }
}
