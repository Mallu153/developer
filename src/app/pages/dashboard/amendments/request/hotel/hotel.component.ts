import { DatePipe, formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbTypeahead, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'app/shared/auth/auth.service';
import { AirportSearchResponse } from 'app/shared/models/airport-search-response';
import { MasterDataService } from 'app/shared/services/master-data.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ToastrService } from 'ngx-toastr';
import { AMENDMENTS_HOTEL_URL, AMENDMENTS_URL } from '../../amendments.constants';
import { CHECK_LIST_APIRESPONSE, HotelDeatils, HotelDetailsResponse, HotelName, HOTEL_AMENDMENTS_RESPONSE } from '../../amendments.model';
import { AmendmentsService } from '../../amendments.service';
import { concat, Observable, of, OperatorFunction, Subject, Subscription  } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-hotel',
  templateUrl: './hotel.component.html',
  styleUrls: ['./hotel.component.scss']
})
export class HotelComponent implements OnInit, OnDestroy {
  hotelbookingPnrForm: FormGroup;
  submitted: boolean = false;
  hotelPnrData:{}=null;
  //hotel place Global variables to display whether is loading or failed to load the data
  @ViewChild('typeaheadInstance') typeaheadInstance: NgbTypeahead;
  noResults: boolean;
  searchTerm: string;
  searchResult: AirportSearchResponse[];
  formatter = (airport: AirportSearchResponse) => airport?.name;
  hotelDetails:any[] = [];
  //hotel Name  Global variables to display whether is loading or failed to load the data
  @ViewChild('hotelnametypeaheadInstance') hotelnametypeaheadInstance: NgbTypeahead;
  noHotelNameResults: boolean;
  searchHotelNameTerm: string;
  searchHotelNameResult: HotelName[];
  hotelNameFormatter = (hotel: HotelName) => hotel.hotelName;

  room_name_details:any[]=[];
  room_type_details:any[]=[];
    // today date
    todayDate = new Date();
    todayDate1: string;
    //ipaddress
    deviceInfo = null;
    decryptBooingId: any;
    selectedProductNumber:number;
    requestId: number;

    //checkList
    modifyButtonDisabled: boolean = true;
  flightCheckList: any = [];
  isCheckListMasterSelected: boolean;
  checkedAmendmentsList: any;
  generateCheckListButton:boolean=false;
  amendment_request_id:number;
  hotel_destination_code:string=null;
  formSub: Subscription;
  hotel_button_hide:boolean=false;
  ngDestroy$ = new Subject();
  constructor(
    private fb: FormBuilder,
    public masterDataService: MasterDataService,
    private titleService: Title,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toastrService: ToastrService,
    private datepipe: DatePipe,
    private authService: AuthService,
    private deviceService: DeviceDetectorService,
    private amendmentsServices: AmendmentsService
    ) {
      this.titleService.setTitle('Amendments Online Hotel');
      this.todayDate1 = formatDate(this.todayDate, 'yyyy-MM-ddThh:mm:ss', 'en-US', '+0530');
    }
    epicFunction() {
      this.deviceInfo = this.deviceService.getDeviceInfo();
    }
  /**
   * Trigger a call to the API to get the location
   * data for from input
   */
   onSearchLocation: OperatorFunction<string, readonly { name; country; code }[]> = (text$: Observable<string>) =>
   text$.pipe(
     debounceTime(300),
     distinctUntilChanged(),
     tap((term: string) => (this.searchTerm = term)),
     switchMap((term) =>
       term.length >= 3
         ? this.masterDataService.getAirportByName(term).pipe(
             tap((response: AirportSearchResponse[]) => {
               this.noResults = response.length === 0;
               if (this.noResults) {
                 this.toastrService.warning(`no data found given serach string ${term}`);
               }
                this.searchResult = [...response];
             }),
             catchError(() => {
               return of([]);
             })
           )
         : of([])
     ),
     tap(() => this.cdr.markForCheck()),
     tap(() => {
       this.searchTerm === '' || this.searchTerm.length <= 2
         ? []
         : this.searchResult?.filter((v) => v.name.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1);
     })
   );


   bindValueOfPlaceControl($event: NgbTypeaheadSelectItemEvent, index: number, nameOfControl: string) {
    if ($event && index !== undefined && nameOfControl  === 'room_hotel_city') {
     if($event?.item?.code){
      this.hotel_destination_code=$event?.item?.code;
     }

    }else{
      this.hotel_destination_code=null
    }
  }
   typeaheadKeydown($event: KeyboardEvent) {
    if (this.typeaheadInstance.isPopupOpen()) {
      setTimeout(() => {
        const popup = document.getElementById(this.typeaheadInstance.popupId);
        const activeElements = popup.getElementsByClassName('active');
        if (activeElements.length === 1) {
          const elem = activeElements[0] as any;
          if (typeof elem.scrollIntoViewIfNeeded === 'function') {
            // non standard function, but works (in chrome)...
            elem.scrollIntoViewIfNeeded();
          } else {
            //do custom scroll calculation or use jQuery Plugin or ...
            this.scrollIntoViewIfNeededPolyfill(elem as HTMLElement);
          }
        }
      });
    }
  }

  private scrollIntoViewIfNeededPolyfill(elem: HTMLElement, centerIfNeeded = true) {
    var parent = elem.parentElement,
      parentComputedStyle = window.getComputedStyle(parent, null),
      parentBorderTopWidth = parseInt(parentComputedStyle.getPropertyValue('border-top-width')),
      parentBorderLeftWidth = parseInt(parentComputedStyle.getPropertyValue('border-left-width')),
      overTop = elem.offsetTop - parent.offsetTop < parent.scrollTop,
      overBottom =
        elem.offsetTop - parent.offsetTop + elem.clientHeight - parentBorderTopWidth >
        parent.scrollTop + parent.clientHeight,
      overLeft = elem.offsetLeft - parent.offsetLeft < parent.scrollLeft,
      overRight =
        elem.offsetLeft - parent.offsetLeft + elem.clientWidth - parentBorderLeftWidth >
        parent.scrollLeft + parent.clientWidth,
      alignWithTop = overTop && !overBottom;

    if ((overTop || overBottom) && centerIfNeeded) {
      parent.scrollTop =
        elem.offsetTop - parent.offsetTop - parent.clientHeight / 2 - parentBorderTopWidth + elem.clientHeight / 2;
    }

    if ((overLeft || overRight) && centerIfNeeded) {
      parent.scrollLeft =
        elem.offsetLeft - parent.offsetLeft - parent.clientWidth / 2 - parentBorderLeftWidth + elem.clientWidth / 2;
    }

    if ((overTop || overBottom || overLeft || overRight) && !centerIfNeeded) {
      elem.scrollIntoView(alignWithTop);
    }
  }

  /**
   * Trigger a call to the API to get the hotel name
   * data for from input
   */

   onSearchHotelName(destinationCode: string): (text: Observable<string>) => Observable<any[]> {
    return (text$: Observable<string>) => text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap((term: string) => (this.searchHotelNameTerm = term)),
      switchMap((term) =>
        term.length >= 3
          ? this.amendmentsServices.getHotelDeatils(term, this.hotel_destination_code,AMENDMENTS_HOTEL_URL.getHotelDetails).pipe(
              tap((response: HotelName[]) => {
                this.noHotelNameResults = response.length === 0;
                if (this.noHotelNameResults) {
                  this.toastrService.warning(`no data found given serach string ${term}`);
                }
                 this.searchHotelNameResult = [...response];
              }),
              catchError(() => {
                return of([]);
              })
            )
          : of([])
      ),
      tap(() => this.cdr.markForCheck()),
      tap(() => {
        this.searchHotelNameTerm === '' || this.searchHotelNameTerm.length <= 2
          ? []
          : this.searchHotelNameResult?.filter((v) => v.hotelName.toLowerCase().indexOf(this.searchHotelNameTerm.toLowerCase()) > -1);
      })
    );
  }

  bindValueOfRoomHotelControl($event: NgbTypeaheadSelectItemEvent, index: number, nameOfControl: string) {

    if ($event && index !== undefined && nameOfControl) {
      if (nameOfControl === 'room_hotel') {
           if($event?.item?.code){
            const selectedHotelCode={
              code: Number($event?.item?.code)
            };
            this.getRoomNameData(selectedHotelCode);
           }
      }
    }else{
      this.room_name_details=[];
      this.room_type_details=[];
    }
  }

  onHotelNameBlur(event:any){
    if(event.target.value === ""){
      this.room_name_details=[];
      this.room_type_details=[];
    }
    this.cdr.markForCheck();
  }
  getRoomNameData(selectedHotelCode:HotelDeatils){
    this.amendmentsServices.getHotelRoom(selectedHotelCode, AMENDMENTS_HOTEL_URL.getHotelDetails).pipe(takeUntil(this.ngDestroy$)).subscribe(
      (res: any) => {
        const result: HotelDetailsResponse = res;
        if (result.status == true) {

           if(result.data?.length>0){
            for (let index = 0; index < result.data?.length; index++) {
              const element = result.data[index];
              if(element.room_type_details.length>0){
                for (let sub_index = 0; sub_index < element.room_type_details.length; sub_index++) {
                  const sub_element = element.room_type_details[sub_index];
                  this.room_name_details.push(sub_element);
                }
              }
              if(element.board_code_details.length>0){
                for (let sub_room_type_index = 0; sub_room_type_index < element.board_code_details.length; sub_room_type_index++) {
                  const sub_room_type_element = element.board_code_details[sub_room_type_index];
                  this.room_type_details.push(sub_room_type_element);
                }
              }
             }
           }


           this.cdr.markForCheck();
        }
      },(error)=>{this.toastrService.error('Oops! Something went wrong while fetching the Room Data Please try again', 'Error')});
  }
    initializeForm(){
      this.hotelbookingPnrForm=this.fb.group({
        room_number: this.fb.array([this.newroom_number()]),
        room_hotel: this.fb.array([this.newroom_hotel()]),
        room_hotel_city: this.fb.array([this.newroom_hotel_city()]),
        room_hotel_city_code: this.fb.array([this.newroom_hotel_city_code()]),
        room_check_in_date: this.fb.array([this.newroom_check_in_date()]),
        room_check_out_date: this.fb.array([this.newroom_check_out_date()]),
        room_name: this.fb.array([this.newroom_name()]),
        room_type: this.fb.array([this.newroom_type()]),
        room_nights: this.fb.array([this.newroom_nights()]),
        room_adults: this.fb.array([this.newroom_adults()]),
        room_childs: this.fb.array([this.newroom_childs()]),
        room_hotel_code: this.fb.array([this.newroom_hotel_code()]),
      });
    }
    pnr_hotel_code(): FormArray {
      return this.hotelbookingPnrForm?.get('room_hotel_code') as FormArray;
    }
    addHotelCode() {
      this.pnr_hotel_code()?.push(this.newroom_hotel_code());
    }
    newroom_hotel_code() {
      return this.fb.group({
        room_hotel_code: '',
        previous_room_hotel_code: '',
        room_number:''
      });
    }
    pnr_room_number(): FormArray {
      return this.hotelbookingPnrForm?.get('room_number') as FormArray;
    }
    addRoomNumber() {
      this.pnr_room_number()?.push(this.newroom_number());
    }
    newroom_number() {
      return this.fb.group({
        room_number: '',
        //previous_room_number: '',
        cancel_flag:''
      });
    }
    pnr_room_hotel(): FormArray {
      return this.hotelbookingPnrForm?.get('room_hotel') as FormArray;
    }
    addRoomHotel() {
      this.pnr_room_hotel()?.push(this.newroom_hotel());
    }
    newroom_hotel() {
      return this.fb.group({
        room_hotel: '',
        previous_room_hotel: '',
        room_number:''
      });
    }
    pnr_room_hotel_city(): FormArray {
      return this.hotelbookingPnrForm?.get('room_hotel_city') as FormArray;
    }
    addRoomHotelCity() {
      this.pnr_room_hotel_city()?.push(this.newroom_hotel_city());
    }
    newroom_hotel_city() {
      return this.fb.group({
        room_hotel_city: '',
        previous_room_hotel_city: '',
        room_number:''
      });
    }
    pnr_room_hotel_city_code(): FormArray {
      return this.hotelbookingPnrForm?.get('room_hotel_city_code') as FormArray;
    }
    addRoomHotelCityCode() {
      this.pnr_room_hotel_city_code()?.push(this.newroom_hotel_city_code());
    }
    newroom_hotel_city_code() {
      return this.fb.group({
        room_hotel_city_code: '',
        previous_room_hotel_city_code: '',
        room_number:''
      });
    }
    pnr_room_check_in_date(): FormArray {
      return this.hotelbookingPnrForm?.get('room_check_in_date') as FormArray;
    }
    addRoomCheckInDate() {
      this.pnr_room_check_in_date()?.push(this.newroom_check_in_date());
    }
    newroom_check_in_date() {
      return this.fb.group({
        room_check_in_date: '',
        previous_room_check_in_date: '',
        room_number:''
      });
    }
    pnr_room_check_out_date(): FormArray {
      return this.hotelbookingPnrForm?.get('room_check_out_date') as FormArray;
    }
    addRoomCheckOutDate() {
      this.pnr_room_check_out_date()?.push(this.newroom_check_out_date());
    }
    newroom_check_out_date() {
      return this.fb.group({
        room_check_out_date: '',
        previous_room_check_out_date: '',
        room_number:''
      });
    }
    pnr_room_name(): FormArray {
      return this.hotelbookingPnrForm?.get('room_name') as FormArray;
    }
    addRoomName() {
      this.pnr_room_name()?.push(this.newroom_name());
    }
    newroom_name() {
      return this.fb.group({
        room_name: '',
        previous_room_name: '',
        room_number:''
      });
    }
    pnr_room_type(): FormArray {
      return this.hotelbookingPnrForm?.get('room_type') as FormArray;
    }
    addRoomType() {
      this.pnr_room_type()?.push(this.newroom_type());
    }
    newroom_type() {
      return this.fb.group({
        room_type: '',
        previous_room_type: '',
        room_number:''
      });
    }
    pnr_room_nights(): FormArray {
      return this.hotelbookingPnrForm?.get('room_nights') as FormArray;
    }
    addRoomNights() {
      this.pnr_room_nights()?.push(this.newroom_nights());
    }
    newroom_nights() {
      return this.fb.group({
        room_nights: '',
        previous_room_nights: '',
        room_number:''
      });
    }
    pnr_room_adults(): FormArray {
      return this.hotelbookingPnrForm?.get('room_adults') as FormArray;
    }
    addRoomAdults() {
      this.pnr_room_adults()?.push(this.newroom_adults());
    }
    newroom_adults() {
      return this.fb.group({
        room_adults: '',
        previous_room_adults: '',
        room_number:''
      });
    }
    pnr_room_childs(): FormArray {
      return this.hotelbookingPnrForm?.get('room_childs') as FormArray;
    }
    addRoomChilds() {
      this.pnr_room_childs()?.push(this.newroom_childs());
    }
    newroom_childs() {
      return this.fb.group({
        room_childs: '',
        previous_room_childs: '',
        room_number:''
      });
    }
    getHotelBookingData(objectData) {
      this.amendmentsServices.getHotelBookingData(objectData, AMENDMENTS_HOTEL_URL.hotelBookingDataForAmendments).pipe(takeUntil(this.ngDestroy$)).subscribe(
        (res: any) => {
          const result: HOTEL_AMENDMENTS_RESPONSE = res;
          if (result.status == true) {

          this.hotelPnrData=result.booking_data_array;
          if (result.booking_data_array?.room_hotel_code?.length > 0) {
            const room_hotel_code_array=result.booking_data_array?.room_hotel_code;
            const selectedHotelCode={
              code: Number(room_hotel_code_array[0])
            };
            this.getRoomNameData(selectedHotelCode);
            for (let room_hotel_code_index = 0; room_hotel_code_index < room_hotel_code_array?.length; room_hotel_code_index++) {
              const pnr_room_hotel_code_element = room_hotel_code_array[room_hotel_code_index];
              if (room_hotel_code_index > 0) {
                this.addHotelCode();
              }

              ((this.hotelbookingPnrForm.get('room_hotel_code') as FormArray).at(room_hotel_code_index) as FormGroup).patchValue({
                room_hotel_code: pnr_room_hotel_code_element,
                previous_room_hotel_code: pnr_room_hotel_code_element,
                room_number:room_hotel_code_index+1
              });
            }
          }

          if (result.booking_data_array?.room_number?.length > 0) {
            const room_number_array=result.booking_data_array?.room_number;
            for (let room_number_index = 0; room_number_index < room_number_array?.length; room_number_index++) {
              const pnr_room_number_element = room_number_array[room_number_index];
              if (room_number_index > 0) {
                this.addRoomNumber();
              }
              ((this.hotelbookingPnrForm.get('room_number') as FormArray).at(room_number_index) as FormGroup).patchValue({
                room_number: pnr_room_number_element,
                //previous_room_number: pnr_room_number_element,
                cancel_flag:false
              });
            }
          }
          if (result.booking_data_array?.room_hotel?.length > 0) {
            const room_hotel_array=result.booking_data_array?.room_hotel;
            for (let room_hotel_index = 0; room_hotel_index < room_hotel_array?.length; room_hotel_index++) {
              const pnr_room_hotel_element = room_hotel_array[room_hotel_index];
              if (room_hotel_index > 0) {
                this.addRoomHotel();
              }
              const hotel_name={
                code: null,
                name: {
                    content: null
                },
                destinationCode: null,
                city: {
                    content: null
                },
                hotelName: pnr_room_hotel_element,
                cityName: null
            };
              ((this.hotelbookingPnrForm.get('room_hotel') as FormArray).at(room_hotel_index) as FormGroup).patchValue({
                room_hotel:hotel_name,
                previous_room_hotel: pnr_room_hotel_element,
                room_number:room_hotel_index+1
              });
            }
          }
          if (result.booking_data_array?.room_hotel_city?.length > 0) {
            const room_hotel_city_array=result.booking_data_array?.room_hotel_city;
            for (let room_hotel_city_index = 0; room_hotel_city_index < room_hotel_city_array?.length; room_hotel_city_index++) {
              const pnr_room_hotel_city_element = room_hotel_city_array[room_hotel_city_index];
              if (room_hotel_city_index > 0) {
                this.addRoomHotelCity();
              }
               const hotel_place_object={
                id:null,
                name:pnr_room_hotel_city_element,
                code:null,
                countryCode:null,
                country:null,
                type:null,
                cityCode:null,
                city:null,
                status:null,
                timeZone:null,
                createdBy:null,
                createdDate:null,
                updatedBy:null,
                updatedDate:null,
             };

              ((this.hotelbookingPnrForm.get('room_hotel_city') as FormArray).at(room_hotel_city_index) as FormGroup).patchValue({
                room_hotel_city: hotel_place_object,
                previous_room_hotel_city: pnr_room_hotel_city_element,
                room_number:room_hotel_city_index+1
              });
            }
          }
          if (result.booking_data_array?.room_hotel_city_code?.length > 0) {
            const room_hotel_city_code_array=result.booking_data_array?.room_hotel_city_code;
            for (let room_hotel_city_code_index = 0; room_hotel_city_code_index < room_hotel_city_code_array?.length; room_hotel_city_code_index++) {
              const pnr_room_hotel_city_code_element = room_hotel_city_code_array[room_hotel_city_code_index];
              if (room_hotel_city_code_index > 0) {
                this.addRoomHotelCityCode();
              }
              ((this.hotelbookingPnrForm.get('room_hotel_city_code') as FormArray).at(room_hotel_city_code_index) as FormGroup)?.patchValue({
                room_hotel_city_code: pnr_room_hotel_city_code_element,
                previous_room_hotel_city_code: pnr_room_hotel_city_code_element,
                room_number:room_hotel_city_code_index+1
              });
            }
          }
          if (result.booking_data_array?.room_check_in_date?.length > 0) {
            const room_check_in_date_array=result.booking_data_array?.room_check_in_date;
            for (let room_check_in_date_index = 0; room_check_in_date_index < room_check_in_date_array?.length; room_check_in_date_index++) {
              const pnr_room_check_in_date_element = room_check_in_date_array[room_check_in_date_index];
              if (room_check_in_date_index > 0) {
                this.addRoomCheckInDate();
              }
              ((this.hotelbookingPnrForm.get('room_check_in_date') as FormArray).at(room_check_in_date_index) as FormGroup)?.patchValue({
                room_check_in_date:  this.datepipe.transform(pnr_room_check_in_date_element, 'yyyy-MM-dd'),
                previous_room_check_in_date: this.datepipe.transform(pnr_room_check_in_date_element, 'yyyy-MM-dd'),
                room_number:room_check_in_date_index+1
              });
            }
          }
          if (result.booking_data_array?.room_check_out_date?.length > 0) {
            const room_check_out_date_array=result.booking_data_array?.room_check_out_date;
            for (let room_check_out_date_index = 0; room_check_out_date_index < room_check_out_date_array?.length; room_check_out_date_index++) {
              const pnr_room_check_out_date_element = room_check_out_date_array[room_check_out_date_index];
              if (room_check_out_date_index > 0) {
                this.addRoomCheckOutDate();
              }
              ((this.hotelbookingPnrForm.get('room_check_out_date') as FormArray).at(room_check_out_date_index) as FormGroup)?.patchValue({
                room_check_out_date:  this.datepipe.transform(pnr_room_check_out_date_element, 'yyyy-MM-dd'),
                previous_room_check_out_date: this.datepipe.transform(pnr_room_check_out_date_element, 'yyyy-MM-dd'),
                room_number:room_check_out_date_index+1
              });
            }
          }
          if (result.booking_data_array?.room_name?.length > 0) {
            const room_name_array=result.booking_data_array?.room_name;
            for (let room_name_index = 0; room_name_index < room_name_array?.length; room_name_index++) {
              const pnr_room_name_element = room_name_array[room_name_index];
              if (room_name_index > 0) {
                this.addRoomName();
              }
              ((this.hotelbookingPnrForm.get('room_name') as FormArray).at(room_name_index) as FormGroup)?.patchValue({
                room_name:  pnr_room_name_element,
                previous_room_name: pnr_room_name_element,
                room_number:room_name_index+1
              });
            }
          }
          if (result.booking_data_array?.room_type?.length > 0) {
            const room_type_array=result.booking_data_array?.room_type;
            for (let room_type_index = 0; room_type_index < room_type_array?.length; room_type_index++) {
              const pnr_room_type_element = room_type_array[room_type_index];
              if (room_type_index > 0) {
                this.addRoomType();
              }
              ((this.hotelbookingPnrForm.get('room_type') as FormArray).at(room_type_index) as FormGroup)?.patchValue({
                room_type:  pnr_room_type_element,
                previous_room_type: pnr_room_type_element,
                room_number:room_type_index+1
              });
            }
          }
          if (result.booking_data_array?.room_nights?.length > 0) {
            const room_nights_array=result.booking_data_array?.room_nights;
            for (let room_nights_index = 0; room_nights_index < room_nights_array?.length; room_nights_index++) {
              const pnr_room_nights_element = room_nights_array[room_nights_index];
              if (room_nights_index > 0) {
                this.addRoomNights();
              }
              ((this.hotelbookingPnrForm.get('room_nights') as FormArray).at(room_nights_index) as FormGroup)?.patchValue({
                room_nights:  pnr_room_nights_element,
                previous_room_nights: pnr_room_nights_element,
                room_number:room_nights_index+1
              });
            }
          }
          if (result.booking_data_array?.room_adults?.length > 0) {
            const room_adults_array=result.booking_data_array?.room_adults;
            for (let room_adults_index = 0; room_adults_index < room_adults_array?.length; room_adults_index++) {
              const pnr_room_adults_element = room_adults_array[room_adults_index];
              if (room_adults_index > 0) {
                this.addRoomAdults();
              }
              ((this.hotelbookingPnrForm.get('room_adults') as FormArray).at(room_adults_index) as FormGroup)?.patchValue({
                room_adults:  pnr_room_adults_element,
                previous_room_adults: pnr_room_adults_element,
                room_number:room_adults_index+1
              });
            }
          }
          if (result.booking_data_array?.room_childs?.length > 0) {
            const room_childs_array=result.booking_data_array?.room_childs;
            for (let room_childs_index = 0; room_childs_index < room_childs_array?.length; room_childs_index++) {
              const pnr_room_childs_element = room_childs_array[room_childs_index];
              if (room_childs_index > 0) {
                this.addRoomChilds();
              }
              ((this.hotelbookingPnrForm.get('room_childs') as FormArray).at(room_childs_index) as FormGroup)?.patchValue({
                room_childs:  pnr_room_childs_element,
                previous_room_childs: pnr_room_childs_element,
                room_number:room_childs_index+1
              });
            }
          }

          this.cdr.markForCheck();
          }else{
            this.hotelPnrData=null;
          }
        },
        (error) => this.toastrService.error(error, 'Error')
      );
    }



onSubmitHotelPnrForm(){
  this.submitted=true;

  let hotelPnrData: { room_number: any[] };
  hotelPnrData = {
        room_number: [...this.hotelbookingPnrForm.value.room_number],
      };
      hotelPnrData?.room_number?.forEach((room_no: any) => {
        //room_no.room_details = {};
        room_no.room_check_in = {};
        room_no.room_check_out = {};
        room_no.room_type = {};
        room_no.room_name = {};
        room_no.room_hotel_name = {};
        room_no.room_hotel_place = {};
        /* const room_data = {
          room_number: room_no?.room_number,
          previous_room_number: room_no?.previous_room_number
        }; */
        //room_no.room_details = room_data;
        if (this.hotelbookingPnrForm.value.room_check_in_date.length > 0) {
          this.hotelbookingPnrForm.value.room_check_in_date?.forEach((check_in: any) => {
            if(Number(room_no?.room_number) ===check_in?.room_number){
              if (check_in?.room_check_in_date!== check_in?.previous_room_check_in_date) {
                const check_in_dates__data = {
                  room_check_in_date: check_in?.room_check_in_date,
                  previous_room_check_in_date: check_in?.previous_room_check_in_date
                };
                room_no.room_check_in = check_in_dates__data;

              }
            }
          });
        }
        if (this.hotelbookingPnrForm.value.room_check_out_date.length > 0) {
          this.hotelbookingPnrForm.value.room_check_out_date?.forEach((check_out: any) => {
            if( Number(room_no?.room_number) ===check_out?.room_number){
              if (check_out?.room_check_out_date!== check_out?.previous_room_check_out_date) {
                const check_out_dates__data = {
                  room_check_out_date: check_out?.room_check_out_date,
                  previous_room_check_out_date: check_out?.previous_room_check_out_date
                };
                room_no.room_check_out = check_out_dates__data;

              }
            }
          });
        }
        if (this.hotelbookingPnrForm.value.room_type.length > 0) {
          this.hotelbookingPnrForm.value.room_type?.forEach((room_type_data: any) => {
            if( Number(room_no?.room_number) ===room_type_data?.room_number){
              if (room_type_data?.room_type !== room_type_data?.previous_room_type) {
                const room_types__data = {
                  room_type: room_type_data?.room_type,
                  previous_room_type: room_type_data?.previous_room_type
                };


                room_no.room_type = room_types__data;
              }
            }
          });
        }
        if (this.hotelbookingPnrForm.value.room_name.length > 0) {
          this.hotelbookingPnrForm.value.room_name?.forEach((room_name_data: any) => {
            if( Number(room_no?.room_number) ===room_name_data?.room_number){
              if (room_name_data?.room_name !== room_name_data?.previous_room_name) {
                const room_names__data = {
                  room_name: room_name_data?.room_name,
                  previous_room_name: room_name_data?.previous_room_name
                };
                room_no.room_name = room_names__data;

              }
            }
          });
        }
        if (this.hotelbookingPnrForm.value.room_hotel.length > 0) {
          this.hotelbookingPnrForm.value.room_hotel?.forEach((room_hotel_name_data: any) => {
            if(Number(room_no?.room_number) ===room_hotel_name_data?.room_number){
              if (room_hotel_name_data?.room_hotel?.hotelName !== room_hotel_name_data?.previous_room_hotel) {
                if(room_hotel_name_data?.room_hotel?.code){
                  const room_hotel_names__data = {
                    room_hotel: room_hotel_name_data?.room_hotel?.hotelName,
                    previous_room_hotel: room_hotel_name_data?.previous_room_hotel,
                    code:room_hotel_name_data?.room_hotel?.code,
                  };
                  room_no.room_hotel_name = room_hotel_names__data;

                }else{
                  const room_hotel_names__data = {
                    room_hotel: room_hotel_name_data?.room_hotel?.hotelName,
                    previous_room_hotel: room_hotel_name_data?.previous_room_hotel
                  };
                  room_no.room_hotel_name = room_hotel_names__data;

                }

              }

            }
          });
        }
        if (this.hotelbookingPnrForm.value.room_hotel_city.length > 0) {
          this.hotelbookingPnrForm.value.room_hotel_city?.forEach((room_hotel_place_data: any) => {
            if( Number(room_no?.room_number) ===room_hotel_place_data?.room_number){
              if (room_hotel_place_data?.room_hotel_city?.name !== room_hotel_place_data?.previous_room_hotel_city) {
                if(room_hotel_place_data?.room_hotel_city?.code){
                  const room_hotel_place__data = {
                    room_hotel_city: room_hotel_place_data?.room_hotel_city?.name,
                    previous_room_hotel_city: room_hotel_place_data?.previous_room_hotel_city,
                    code:room_hotel_place_data?.room_hotel_city?.code,
                  };
                  room_no.room_hotel_place = room_hotel_place__data;

                }else{
                  const room_hotel_place__data = {
                    room_hotel_city: room_hotel_place_data?.room_hotel_city?.name,
                    previous_room_hotel_city: room_hotel_place_data?.previous_room_hotel_city
                  };
                  room_no.room_hotel_place = room_hotel_place__data;

                }
              }
            }
          });
        }
      });
   const room_data = {
    room_details: hotelPnrData.room_number,
    booking_info: this.hotelPnrData,
  };
  let at_least_one_array:any[]=[];
  if(room_data?.room_details.length>0){
    /* for (let index = 0; index <  room_data?.room_details.length; index++) {
      const element =  room_data?.room_details[index];
      at_least_one_array.push(element.cancel_flag);
    } */

    //let  at_least_one_true = at_least_one_array?.some((value)=> value);
    const saveData = {
      amendmentCreatedBy: this.authService.getLoginttuserId(),
      amendmentCreatedDate: this.todayDate1,
      amendmentCreatedDevice: this.deviceInfo?.userAgent,
      amendmentCreatedIp: null,
      amendmentDetails: JSON.stringify(room_data),
      amendmentExtraCost: 0,
      amendmentId: 7,
      amendmentName: 'MODIFY',
      amendmentPriority: 1,
      amendmentRemarks: null,
      amendmentSeverity: 1,
      amendmentStatus: 1,
      bookingId: this.decryptBooingId,
      productId: Number(this.selectedProductNumber),
      serviceRequestId: Number(this.requestId),
    };

    this.amendmentsServices.createReissueRequest(saveData, AMENDMENTS_URL.reIssueRequest) .pipe(takeUntil(this.ngDestroy$)).subscribe(
      (data: any) => {
        if (data) {
           const booking_id = this.route.snapshot.queryParams.booking_id;
          const requestId = this.route.snapshot.queryParams.request_Id;
          const customer_name = this.route.snapshot.queryParams.customer_name;
          const contact_name = this.route.snapshot.queryParams.contact_name;
          const supplier_reference = this.route.snapshot.queryParams.supplier_reference;
          const contactNumber = this.route.snapshot.queryParams.contactNumber;
          const productID = this.route.snapshot.queryParams.product_id;
          const channel = this.route.snapshot.queryParams.channel;
          const bookingReferenceNumber=this.route.snapshot.queryParams.booking_reference;
          const amendment_request_id=data?.id;
          const from=this.route.snapshot.queryParams.from;
          this.router.routeReuseStrategy.shouldReuseRoute = () => false;
          this.router.onSameUrlNavigation = 'reload';
          this.router.navigate([`/dashboard/amendments/request/hotel`], {
            queryParams: {
              product_id:productID,
              channel:channel,
              booking_id: booking_id,
              supplier_reference: supplier_reference,
              booking_reference: bookingReferenceNumber,
              request_Id: requestId,
              customer_name: customer_name,
              contact_name: contact_name,
              contactNumber: contactNumber,
              amendment_request_id:amendment_request_id,
              from:from,
            },
          });

          this.toastrService.success('The service request has been sent successfuly !', 'Success');
        }
      },
      (error) => {
        this.toastrService.error(error, 'Error');
      }
    );
   /*  if(at_least_one_true===true){
      const saveData = {
        amendmentCreatedBy: this.authService.getLoginttuserId(),
        amendmentCreatedDate: this.todayDate1,
        amendmentCreatedDevice: this.deviceInfo?.userAgent,
        amendmentCreatedIp: null,
        amendmentDetails: JSON.stringify(room_data),
        amendmentExtraCost: 0,
        amendmentId: 7,
        amendmentName: 'MODIFY',
        amendmentPriority: 1,
        amendmentRemarks: null,
        amendmentSeverity: 1,
        amendmentStatus: 1,
        bookingId: this.decryptBooingId,
        productId: Number(this.selectedProductNumber),
        serviceRequestId: Number(this.requestId),
      };

      this.amendmentsServices.createReissueRequest(saveData, AMENDMENTS_URL.reIssueRequest).pipe(takeUntil(this.ngDestroy$)).subscribe(
        (data: any) => {
          if (data) {
             const booking_id = this.route.snapshot.queryParams.booking_id;
            const requestId = this.route.snapshot.queryParams.request_Id;
            const customer_name = this.route.snapshot.queryParams.customer_name;
            const contact_name = this.route.snapshot.queryParams.contact_name;
            const supplier_reference = this.route.snapshot.queryParams.supplier_reference;
            const contactNumber = this.route.snapshot.queryParams.contactNumber;
            const productID = this.route.snapshot.queryParams.product_id;
            const channel = this.route.snapshot.queryParams.channel;
            const bookingReferenceNumber=this.route.snapshot.queryParams.booking_reference;
            const amendment_request_id=data?.id;
            const from=this.route.snapshot.queryParams.from;
            this.router.routeReuseStrategy.shouldReuseRoute = () => false;
            this.router.onSameUrlNavigation = 'reload';
            this.router.navigate([`/dashboard/amendments/request/hotel`], {
              queryParams: {
                product_id:productID,
                channel:channel,
                booking_id: booking_id,
                supplier_reference: supplier_reference,
                booking_reference: bookingReferenceNumber,
                request_Id: requestId,
                customer_name: customer_name,
                contact_name: contact_name,
                contactNumber: contactNumber,
                amendment_request_id:amendment_request_id,
                from:from,
              },
            });

            this.toastrService.success('The service request has been sent successfuly !', 'Success');
          }
        },
        (error) => {
          this.toastrService.error(error, 'Error');
        }
      );
    }else{
      return this.toastrService.error("Please change the deatils and processed","Error");
    } */
  }

}

getCheckListData(requestId:any,amendment_request_id:any) {
  const checklist_params = {
    amendment_request_id: Number(amendment_request_id),
    service_request_id: Number(requestId),
  };
  this.amendmentsServices.getAmendmentsForChecklist(checklist_params, AMENDMENTS_URL.checkList).pipe(takeUntil(this.ngDestroy$)).subscribe(
    (res: any) => {
      const result: CHECK_LIST_APIRESPONSE = res;
      if (result.status == true) {
        this.flightCheckList = result.check_list;
        this.generateCheckListButton=false;
        this.cdr.markForCheck();
      }
    },
    (error) => {
      this.toastrService.error(error, 'Error');
    }
  );
}


reloadComponent() {
  const booking_id = this.route.snapshot.queryParams.booking_id;
  const requestId = this.route.snapshot.queryParams.request_Id;
  const customer_name = this.route.snapshot.queryParams.customer_name;
  const contact_name = this.route.snapshot.queryParams.contact_name;
  const supplier_reference = this.route.snapshot.queryParams.supplier_reference;
  const contactNumber = this.route.snapshot.queryParams.contactNumber;
  const productID = this.route.snapshot.queryParams.product_id;
  const channel = this.route.snapshot.queryParams.channel;
  const bookingReferenceNumber=this.route.snapshot.queryParams.booking_reference;
  const from=this.route.snapshot.queryParams.from;
  //const amendment_request_id=this.route.snapshot.queryParams.amendment_request_id;

  this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  this.router.onSameUrlNavigation = 'reload';
  this.router.navigate([`/dashboard/amendments/request/hotel`], {
    queryParams: {
      product_id:productID,
      channel:channel,
      booking_id: booking_id,
      supplier_reference: supplier_reference,
      booking_reference: bookingReferenceNumber,
      request_Id: requestId,
      customer_name: customer_name,
      contact_name: contact_name,
      contactNumber: contactNumber,
      from: from,

    },
  });


}


formValueChanged(){
  this.hotelbookingPnrForm.valueChanges.pipe(takeUntil(this.ngDestroy$)).subscribe(x => {
    this.hotel_button_hide=true;
   // console.log('form value changed')
    //console.log(x)
});
}


trackByFn(index, item) {
  return index;
}
  ngOnInit(): void {
    this.initializeForm();
    this.epicFunction();
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
     if(param&&param.booking_reference){
       const hotel_booking_data={
        booking_reference:param.booking_reference
        //booking_reference:'TTBONH20221017011'
       };
       this.getHotelBookingData(hotel_booking_data);
     }
     if(param&&param.product_id &&param.booking_id&&param.request_Id){
      this.selectedProductNumber=param.product_id;
      this.requestId=param.request_Id;
      this.decryptBooingId=Number(atob(unescape(param.booking_id)));
     }
     if (param && param.amendment_request_id) {
      this.amendment_request_id=param.amendment_request_id;
      this.modifyButtonDisabled=false;
      this.generateCheckListButton=true;
    }
    });
    this.formValueChanged();

  }
  ngOnDestroy(): void {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
