import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { QuotesService, mptbResponse } from '../../services/quotes.service';


@Component({
  selector: 'app-mptb',
  templateUrl: './mptb.component.html',
  styleUrls: ['./mptb.component.scss','../../../../../../assets/sass/libs/select.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MptbComponent implements OnInit , OnDestroy  {
  ngDestroy$ = new Subject();

  filterAirport = [];
  filterAirline = [];
  filterStops = [];
  filterBaggages = [];
  flightOfferList = [];
  emptyResultflightOfferList = [];

  airLineNamesList: any;
  airportsMaster: any;

  airLineImageUrl = 'http://travpx.dev.com/tt-ci-app_v1/';

  filterForm: FormGroup;
  submitted: boolean = false;

  //filters
  airLineList = [];
  airPortList = [];
  stopsList = [
    {
      value: 0,
      name: 'Non Stop',
    },
    {
      value: 1,
      name: '1 Stop(s)',
    },
    {
      value: 2,
      name: '2 Stop(s)',
    },
    {
      value: 3,
      name: '3 Stop(s)',
    },
  ];
  timesList = [
    {
      text: 'Depature Time',
      group:'depature',
      name: 'Before 10.00',
      value: '10.00',
    },
    {
      text: 'Depature Time',
      group:'depature',
      name: '10.00 to 15:00',
      value: '10.00 - 15:00',
    },
    {
      text: 'Depature Time',
      group:'depature',
      name: '15.00 to 20:00',
      value: '15.00 - 20:00',
    },
    {
      text: 'Depature Time',
      name: '20.00 to 00:00',
      group:'depature',
      value: '20.00 - 00:00',
    },
    {
      text: 'Arrival Time',
      name: 'Before 10.00',
      group:'arrival',
      value: '10.00',
    },
    {
      text: 'Arrival Time',
      name: '10.00 to 15:00',
      group:'arrival',
      value: '10.00 - 15:00',
    },
    {
      text: 'Arrival Time',
      group:'arrival',
      name: '15.00 to 20:00',
      value: '15.00 - 20:00',
    },
    {
      text: 'Arrival Time',
      name: '20.00 to 00:00',
      group:'arrival',
      value: '20.00 - 00:00',
    },
  ];
  baggageList = [];

  noFilterFound:boolean=false;
  resultShow:boolean=false;
  constructor(
    private fb: FormBuilder,
    private mptbApiServices: QuotesService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}

  trackByFn(index, item) {
    return item.id;
  }
  getFlightList() {
    const data = {
      adt: 2,
      chd: 2,
      inf: 2,
      depature_code: 'MAA',
      arrival_code: 'YYC',
      depature_date: '2023-03-06',
      return_date: '2023-04-06',
      //request_no: 'AFOS20230214000049',
      //request_no: 'AFOS20230303000007',
      request_no: 'AFOS20230306000015',
    };
    this.mptbApiServices
      .mptbFlightSearch(data, 'flight_api/flight_offers/search')
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (res: mptbResponse) => {
          const result = res;
          if (result.status === true) {
            if(result.amadeus_flight_offer_data?.length>0){
              result.amadeus_flight_offer_data?.forEach(element => {
                if(element.travelerPricings[0].fareDetailsBySegment[0].segmentId === element.itineraries[0].segments[0].id){
                  element.firstDeptbaggage=element.travelerPricings[0].fareDetailsBySegment[0];
                }

              if(element.itineraries?.length>0){
                element.itineraries.forEach(subelement => {

                  if(subelement.segments?.length>0){
                    subelement.segments.forEach(segmentselement => {
                      //departure
                      const modifiedDept= subelement.segments[0]?.departure.at.split('T')[1].split(':')[0] +':'+subelement.segments[0]?.departure.at.split('T')[1].split(':')[1];
                      //segmentselement.deptTime=segmentselement.departure.at.split('T')[1];
                      segmentselement.deptTime=modifiedDept;
                      const modifiedArraival=subelement.segments[subelement.segments?.length - 1]?.arrival.at.split('T')[1].split(':')[0] +':'+subelement.segments[subelement.segments?.length - 1]?.arrival.at.split('T')[1].split(':')[1];
                      //segmentselement.arrivalTime=segmentselement.arrival.at.split('T')[1];
                      segmentselement.arrivalTime=modifiedArraival;
                    });
                  }
                });
              }
             });
            }




            this.flightOfferList = result.amadeus_flight_offer_data;
            this.filterAirline = result.amadeus_flight_offer_data;
            this.emptyResultflightOfferList = result.amadeus_flight_offer_data;

            this.filterStops = result.amadeus_flight_offer_data;
            this.filterAirport = result.amadeus_flight_offer_data;
            this.filterBaggages = result.amadeus_flight_offer_data;

            this.airportsMaster = result.airports_master;
            if (result.airports_master) {
              for (const key in result.airports_master) {
                const value = result.airports_master[key];
                this.airPortList.push(value);
              }
            }

            if (result?.amadeus_flight_offer_dictionaries?.length > 0) {
              for (let index = 0; index < result?.amadeus_flight_offer_dictionaries?.length; index++) {
                const element = result?.amadeus_flight_offer_dictionaries[index];
                this.airLineNamesList = element.carriers;
                for (const key in element.carriers) {
                  const value = element.carriers[key];
                  //console.log(`${key}: ${value}`);
                  const data = {
                    code: key,
                    name: `${key} - ${value}`,
                  };
                  this.airLineList.push(data);
                }
              }
            }
            if (result?.baggage_group_data?.length > 0) {
              for (let index = 0; index < result?.baggage_group_data.length; index++) {
                const element = result?.baggage_group_data[index];
                if (element.values.length > 0) {

                  for (let subindex = 0; subindex < element.values.length; subindex++) {
                    const subelement = element.values[subindex];

                    let data;
                    if(subelement.quantity){
                      data = {
                        value: subelement.quantity,
                        name: subelement.quantity + 'P',
                      };
                      this.baggageList.push(data);

                    }else if(subelement.weight){
                      data = {
                        value: subelement.weight,
                        name: subelement.weight+''+subelement.weightUnit ,
                      };
                      this.baggageList.push(data);
                    }

                  }
                }
              }
            }

            this.resultShow=true;
            this.cdr.markForCheck();
          }
        },
        (error) => {
          this.resultShow=false;
          this.toastr.error(`Something bad happened please try again later`, 'Error', { progressBar: true });
          this.cdr.markForCheck();
          /*  if(error === 'undefined'){
        this.toastr.error(`Something bad happened please try again later`,"Error",{progressBar:true});
        this.cdr.markForCheck();
      }else{
        this.toastr.error(error,"Error",{progressBar:true});
        this.cdr.markForCheck();
      } */
        }
      );
  }

  initializeForm() {
    this.filterForm = this.fb.group({
      airLine: '',
      airport: '',
      stops: '',
      time: '',
      baggage: '',
    });
  }
  reset(){
    this.submitted=false;
    this.filterForm.reset();
    this.flightOfferList =this.emptyResultflightOfferList;
  }
  onChangeFilters() {
    if(this.filterForm.value.airport.length>0){
        this.flightOfferList = this.filterAirline.filter((obj) =>
        obj.itineraries.some((item) => item.segments.some((subItem) => this.filterForm.value.airport?.includes(subItem?.departure?.iataCode)))
      );
      console.log('airport',this.filterForm.value.airport);
      console.log('airport result', this.flightOfferList);

    }else if(this.filterForm.value.airLine.length>0){
      this.flightOfferList = this.filterAirline.filter((flight) =>
      flight.validatingAirlineCodes?.some((carrier: string) => this.filterForm.value.airLine?.includes(carrier))
    );
    console.log('airLine',this.filterForm.value.airLine);
    console.log('airline result', this.flightOfferList);
    }else if(this.filterForm.value.stops.length>0){
      this.flightOfferList = this.filterAirline.filter((obj) =>
      obj.itineraries.some((item) => item.segments.some((subItem) => this.filterForm.value.stops?.includes(item.segments.length - 1)))
    );
    console.log('stops',this.filterForm.value.stops);
    console.log('stops result', this.flightOfferList);
    }else if(this.filterForm.value.baggage.length>0){
      this.flightOfferList = this.filterAirline.filter((obj) =>
      obj.travelerPricings.some((item) => item.fareDetailsBySegment.some((subItem) =>
      //|| subItem?.includedCheckedBags?.weight
      this.filterForm.value.baggage?.includes(subItem?.includedCheckedBags?.quantity || subItem?.includedCheckedBags?.weight)
      ))
    );
    console.log('baggage',this.filterForm.value.baggage);
    console.log('baggage result', this.flightOfferList);
    }else{
      this.flightOfferList =this.emptyResultflightOfferList;
      console.log('else',this.flightOfferList);
    }

    /* else if(this.filterForm.value.time.length>0){
    } */

  }

  onChangeAirLine(value: any) {
    if (value?.length > 0) {
      //this.flightOfferList =this.filterAirline?.filter((v)=>v?.validatingAirlineCodes[0]===value[0]);
      //this.carriers.indexOf(carrier) > -1
     const result = this.filterAirport.filter((flight) =>
        flight.validatingAirlineCodes?.some((carrier: string) => value?.includes(carrier))
      );
      console.log('result',result);

      if(result.length==0){
        this.noFilterFound=true;
        this.resultShow=false;
        this.cdr.markForCheck();
      }else{
        this.resultShow=true;
        this.flightOfferList=result;
        this.cdr.markForCheck();
      }

    } else {
      this.resultShow=true;
      this.flightOfferList = this.emptyResultflightOfferList;
      this.cdr.markForCheck();
    }
  }



  onChangeStops(value: any) {
    if (value?.length > 0) {
      this.flightOfferList = this.filterStops.filter((obj) =>
        obj.itineraries.some((item) => item.segments.some((subItem) => value?.includes(item.segments.length - 1)))
      );

      this.cdr.markForCheck();
    } else {
      this.flightOfferList = this.filterStops;

      this.cdr.markForCheck();
    }
  }

  onChangeBaggages(value: any){
    if (value?.length > 0) {

      this.flightOfferList = this.filterBaggages.filter((obj) =>
      obj.travelerPricings.some((item) => item.fareDetailsBySegment.some((subItem) =>
      //|| subItem?.includedCheckedBags?.weight
      value?.includes(subItem?.includedCheckedBags?.quantity )
      ))
    );
      this.cdr.markForCheck();
    } else {
      this.flightOfferList = this.filterBaggages;

      this.cdr.markForCheck();
    }
  }



  sortByAirline() {
    if (this.filterForm.value.airLine?.length > 0) {
      this.flightOfferList = this.flightOfferList.reverse();
      this.cdr.markForCheck();
    } else {
      this.flightOfferList = this.filterAirline.reverse();
      this.cdr.markForCheck();
    }
  }
  ngOnInit(): void {
    this.ngDestroy$ = new Subject<void>();
    this.getFlightList();
    this.initializeForm();
  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
