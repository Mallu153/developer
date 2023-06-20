import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbTypeahead, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe, formatDate } from '@angular/common';
import { Passengers } from 'app/pages/dashboard/dashboard-request/model/selectedPassengers';
import { DeviceDetectorService } from 'ngx-device-detector';
import { AirportSearchResponse } from 'app/shared/models/airport-search-response';
import { MasterDataService } from 'app/shared/services/master-data.service';
import { Observable, of, OperatorFunction, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError, takeUntil } from 'rxjs/operators';
import { City } from 'app/shared/models/city-search-response';
import { Meals } from 'app/shared/models/meals-search-response';
import { Property } from 'app/shared/models/property-search-response';
import { HotelNames } from 'app/shared/models/hotel-names-search-response';
import { AuthService } from 'app/shared/auth/auth.service';
import { RfqService } from '../../rfq-services/rfq.service';
import * as RFQURLS from "../../rfq-url-constants/apiurl";
import { RfqApiResponse } from '../../rfq-models/rfq-api-response';
import { DashboardRequestService } from 'app/pages/dashboard/dashboard-request/services/dashboard-request.service';
import * as apiUrls from '../../../dashboard-request/url-constants/url-constants';
import { ApiResponse } from '../../../dashboard-request/model/api-response';
import { HotelRfqPassengersPopupComponent } from './hotel-rfq-passengers-popup/hotel-rfq-passengers-popup.component';
import { SelectedPassengersService } from '../../../dashboard-booking/share-data-services/selected-passenger.service';
import { SendMessage, WaApiResponse } from '../../rfq-models/sendMessage';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-hotel-rfq',
  templateUrl: './hotel-rfq.component.html',
  styleUrls: ['./hotel-rfq.component.scss'],
 /*  ,'../../../../../../assets/sass/libs/select.scss'
  encapsulation: ViewEncapsulation.None, */
})
export class HotelRfqComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  pageTitle = "Hotel RFQ";
  hotelForm: FormGroup;
  isEdit = false;
  submitted = false;
  // array purpose used
  isValidFormSubmitted = null;
  //advanced serach defalut hide
  public isCollapsed = true;
  //today date
  todayDate = new Date();
  todayDate1: string;
  todaydateAndTimeStamp:string;
  //passengers list
  passengersList: Passengers[] = [];
  //pax ids for array
  paxId = [];
  //selected persons
  public rowsControls: any = [{
    isCollapsedSelectedPersons: true
  }];
  //pagination
  //page = 1;
  //pageSize = 10;
  //collectionSize: number;
  //rooms details defalut hide
  public isCollapsedRooms = true;
  //model define
  public countryListLov: any;

  public hotelRatingListLov: any;
  public NationalityListLov: any;

  contactId: number;
  requestId: number;
  paramsHotelLineId: number;
  responseRFQId: string;
  updateContactdata: any[] = [];
  //ipaddress
  deviceInfo = null;
  isDesktopDevice: boolean;
  isTablet: boolean;
  isMobile: boolean;
  //total adults, childs count
  totalAdultsData: number;
  totalCHDData: number;
  totalInfantsData: number;
  hotelLineId: number;
  roomLineId: number;
  passengerId: number;
  saveAfterDisplay = false;
  //online and ofline buttons
  addonsData: any;
  // Global variables to display whether is loading or failed to load the data
  noResults: boolean;
  searchTerm: string;
  searchResult: AirportSearchResponse[];
  noCityResults: boolean;
  searchCityTerm: string;
  searchCityResult: City[];
  noMealsResults: boolean;
  searchMealsTerm: string;
  searchMealsResult: Meals[];
  noPropertyResults: boolean;
  searchPropertyTerm: string;
  searchPropertyResult: Property[];
  noHotelNamesResults: boolean;
  searchHotelNamesTerm: string;
  searchHotelNamesResult: HotelNames[];
  formatter = (airport: AirportSearchResponse) => airport?.name;
  cityformatter = (city: City) => city?.name;
  mealsformatter = (meals: Meals) => meals?.name;
  propertyformatter = (property: Property) => property?.name;
  hotelNamesformatter = (hotelname: HotelNames) => hotelname?.name;
  //+ ' ' + airport?.country + ' (' + airport?.code + ')';
  @ViewChild('typeaheadInstance') typeaheadInstance: NgbTypeahead;
  //response data
  roomIds: any[] = [];
  roomsInfo: any[] = [];
  passengersData: any[] = [];
  adultsCount: any = [];
  childCount: any = [];
  //response send to addons form
  displayData: any = [];
  countForPersons: any = [];
  roomCountsValue: any = [];
  addonsPopData: any[] = [];
  //patch data
  hotelLinesData: any = [];
  hotelRoomsData: any = [];
  roomMembers: any = [];
  //markup type inputs show and hide
  amountInutShow = false;
  percentageshow = false;
  inactivePassenger = [];
  inactiveRooms = [];
  roomsDeleteflag = [];
  public isLPODeatilsCollapsed = true;
  public isAddonsCollapsed = true;
  //supplier details
  public supplierDeatils:any;
  isMasterSelected:boolean;
  checkedSupplierList:any;
   //search setup
   searchText: any;
   //pagination
   page = 1;
   pageSize = 10;
   collectionSize: number;

   contactDeatils=[];
   messageModuleID=RFQURLS.sendWaMessage.moduleId;
   messageModuleName=RFQURLS.sendWaMessage.moduleName;

   requestCreationLoading:boolean=false;
  constructor(
    private fb: FormBuilder,
    private titleService: Title,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private datepipe: DatePipe,
    private deviceService: DeviceDetectorService,
    public masterDataService: MasterDataService,
    private authService:AuthService,
    private dashboardRequestService: DashboardRequestService,
    private rfqServices:RfqService,
    private SelectedPassengersService: SelectedPassengersService,
    private spinnerService: NgxSpinnerService,
  ) {
    this.titleService.setTitle('Hotel RFQ');
    this.todayDate1 = this.datepipe.transform(this.todayDate, 'yyyy-MM-dd');
    this.todaydateAndTimeStamp = formatDate(this.todayDate, 'yyyy-MM-ddThh:mm:ss', 'en-US', '+0530');
      //passengers list
    this.selectedPassengers();
    this.getAddonsResponseData();
  }



  initializeForm() {
    this.hotelForm = this.fb.group({
      id: '',
      lineLatitude: '',
      lineLongitude: '',
      lineRadius: '',
      lineSrId: '',
      lineCountry: '',
      lineCity: '',
      lineLocation: ['', [Validators.required]],
      lineHotelName: '',
      linePropertyType: '',
      lineMealType: '',
      lineCheckInDate: ['', [Validators.required]],
      lineCheckOutDate: ['', [Validators.required]],
      lineNoOfNights: '',
      lineRoomCount: ['1', [Validators.required]],
      lineCountryResidency: '',
      lineNationality: '',
      lineRatings: '',
      lineMarkUpType: 'P',
      lineMarkupAmount: '',
      lineMarkupPercentage: '',
      lineAdultCount: '',
      lineChildCount: '',
      lineInfantCount: '',
      lineTotalDays: '',
      lineSearchType: false,
      lineAddonsRequired: '',
      lineApis: '',
      lineUuid:'',
      lpoDate:'',
      lpoAmount:'',
      lpoNumber:'',
      roomsData: this.fb.array([this.createFormGroup()])
    });
  }
  get f() {
    return this.hotelForm.controls;
  }
  createFormGroup() {
    return this.fb.group({
      id: '',
      roomSrId: '',
      roomLineUuid:'',
      roomLineId: '',
      roomNumber: '',
      roomAddonsRequired: '',
      roomAdultCount: '1',
      roomChildCount: '0',
      roomInfantCount: '',
      //roomChildAges: '',
      roomInfantAges: '',
      roomStatus: 0,
      roomsPersonList: this.fb.array([]),
      childAge: this.fb.array([])
    });
    //this.createAgeFormGroup()
  }
  createAgeFormGroup() {
    return this.fb.group({
      roomChildAges: '1'
    });
  }

  roomsData(): FormArray {
    return this.hotelForm.get('roomsData') as FormArray;
  }
  childAge(mainIndex: number): FormArray {
    return this.roomsData().at(mainIndex)?.get('childAge') as FormArray;
  }

  roomsPersonListData(i: number): FormArray {
    return this.roomsData().at(i).get('roomsPersonList') as FormArray;
  }
  roomsInputDependsOnAddRooms(count) {
    if (count === this.roomsData()?.length) {
      return;
    } else if (count > this.roomsData()?.length) {
      let a = count - this.roomsData()?.length;
      this.OnSelectAddRooms(a);
    } else if (count < this.roomsData()?.length) {
      let b = this.roomsData()?.length - count;
      /* if (this.isEdit === true) {
        this.onInactiveRoomHotelForm();
      } */
      this.OnSelectRemoveRooms(b);
    }
    /* if (this.roomsData()?.length < count) {
      for (let i = this.roomsData()?.length; i < count; i++) {
        const fg = this.createFormGroup();
        this.roomsData().push(fg);
        this.rowsControls.push({
          isCollapsedSelectedPersons: false
        });
      }
    } else {
      for (let i = this.roomsData()?.length; i >= count; i--) {
        this.roomsData().removeAt(i);
        this.rowsControls.pop(i);
      }
    } */
  }

  EditroomsInputDependsOnAddRooms(count) {
    if (this.roomsData()?.length < count) {
      for (let i = this.roomsData()?.length; i < count; i++) {
        const fg = this.createFormGroup();
        this.roomsData().push(fg);
        this.rowsControls.push({
          isCollapsedSelectedPersons: true
        });
      }
    } else {
      let arr = [];
      for (let i = this.roomsData()?.length; i >= count; i--) {
        arr.push(this.roomsData()?.at(i)?.value === undefined ? {} : this.roomsData()?.at(i)?.value);
        //this.onInactiveRoomHotelForm();
        this.roomsData().removeAt(i);
        this.rowsControls.pop(i);
      }
      this.roomsDeleteflag = arr.filter(element => {
        if (Object.keys(element).length !== 0) {
          return true;
        }
        return false;
      });

    }
  }

  OnSelectAddRooms(count) {
    for (let i = 0; i < count; i++) {
      const fg = this.createFormGroup();
      this.roomsData().push(fg);
      this.rowsControls.push({
        isCollapsedSelectedPersons: true
      });
    }

  }
  OnSelectRemoveRooms(count) {
    for (let i = count; i > 0; i--) {
      this.roomsData().removeAt(i);
      this.rowsControls.pop(i);
    }
  }

  childDependsOnAgeInput(value, mainindex) {
    if (Number(value) === this.childAge(mainindex)?.length) {
      return;
    } else if (Number(value) > this.childAge(mainindex)?.length) {
      let ageAdd = Number(value) - this.childAge(mainindex)?.length;
      this.addChildAge(mainindex, ageAdd);
    } else if (Number(value) < this.childAge(mainindex)?.length) {
      if (Number(value) === 0) {
        this.clearChildAges(mainindex);
      }
      let ageRemove = this.childAge(mainindex)?.length - Number(value);
      this.removeChildAge(mainindex, ageRemove)
    }

  }
  addChildAge(mainIndex: number, ageAdd: number) {
    for (let i = 0; i < ageAdd; i++) {
      this.childAge(mainIndex).push(this.createAgeFormGroup());
    }
  }
  clearChildAges(mainIndex: number) {
    for (let i = this.childAge(mainIndex)?.length - 1; i >= 0; i--) {
      this.childAge(mainIndex).removeAt(i);
    }
  }
  removeChildAge(mainIndex: number, ageRemove: number) {
    for (let i = ageRemove; i > 0; i--) {
      this.childAge(mainIndex).removeAt(i);
    }
  }



  // remove list
  delete(j: number, index: number) {
    if (this.roomsPersonListData(j).length > 0) {
      this.roomsPersonListData(j).removeAt(index);
    }
    if (this.passengersList.length > 0) {
      this.passengersList.splice(index, 1);
      this.paxId = this.passengersList?.map(v => v);
    }
  }

  getCountry() {
    this.dashboardRequestService.readCompanyMasterLov(apiUrls.request_hotel_url.getCountryMaster).pipe(takeUntil(this.ngDestroy$)).subscribe((countryListLov: ApiResponse) => {
      const result: ApiResponse = countryListLov;
      if (result.status === 200) {
        this.countryListLov = result.data;
        this.cdr.detectChanges();
      } else {
        this.toastr.error('Oops! Something went wrong while fetching the country data', 'Error');
      }
    });
  }
  getNationalityLov() {
    this.dashboardRequestService.readCompanyMasterLov(apiUrls.request_hotel_url.getNationaltyMaster).pipe(takeUntil(this.ngDestroy$)).subscribe((NationalityListLov: ApiResponse) => {
      const result: ApiResponse = NationalityListLov;
      if (result.status === 200) {
        this.NationalityListLov = result.data;
        this.cdr.detectChanges();
      } else {
        this.toastr.error('Oops! Something went wrong while fetching the nationality data', 'Error');
      }
    });
  }
  getHotelRating() {
    this.dashboardRequestService.readMasterLov(apiUrls.request_hotel_url.hotelrating).pipe(takeUntil(this.ngDestroy$)).subscribe((hotelRatingListLov: ApiResponse) => {
      const result: ApiResponse = hotelRatingListLov;
      if (result.status === 200) {
        this.hotelRatingListLov = result.data;
        this.cdr.detectChanges();
      } else {
        this.toastr.error('Oops! Something went wrong while fetching the hotel rating data', 'Error');
      }
    });
  }

  epicFunction() {
    this.deviceInfo = this.deviceService.getDeviceInfo();
    this.isMobile = this.deviceService.isMobile();
    this.isTablet = this.deviceService.isTablet();
    this.isDesktopDevice = this.deviceService.isDesktop();

  }
  getDiffDays(sDate, eDate) {
    let startDate = new Date(sDate);
    let endDate = new Date(eDate);
    let Time = endDate.getTime() - startDate.getTime();
    return Time / (1000 * 3600 * 24);
  }
  CheckInDateAndCheckOutDateCalculate(lineCheckInDate, lineCheckOutDate) {
    if (lineCheckInDate && lineCheckOutDate) {
      if (lineCheckInDate > lineCheckOutDate) {
        this.hotelForm.patchValue({
          lineCheckOutDate: '',
          lineNoOfNights: '',
          lineTotalDays: '',
        });
        return this.toastr.error("Check-out date must be after check-in date!", "Error");
      } else {
        const totalDays = this.getDiffDays(lineCheckInDate, lineCheckOutDate);
        //const noofNights = totalDays;
        //totalDays - 1;
        if (totalDays) {
          this.hotelForm.patchValue({
            lineNoOfNights: totalDays,
            lineTotalDays: totalDays,

          });
        }
      }
    }
    this.cdr.markForCheck();
  }

  totalAdults() {
    this.totalAdultsData = 0;
    for (let i = 0; i < this.roomsData().value.length; i++) {
      this.totalAdultsData += Number(this.hotelForm.value.roomsData[i].roomAdultCount);
    }
    return this.totalAdultsData;
  }
  totalChilderns() {
    this.totalCHDData = 0;
    //this.flights().controls.length
    for (let i = 0; i < this.roomsData().value.length; i++) {
      this.totalCHDData += Number(this.hotelForm.value.roomsData[i].roomChildCount);
    }
    return this.totalCHDData;
  }

  RoomsData() {
    let roomsDummyArray = [];
    let roomArray = this.roomsData().value;
    roomArray.forEach((val) =>
      roomsDummyArray.push(Object.assign({}, val))
    );
    roomsDummyArray.forEach((element, roomindex) => {

      element.id = element.id,
        element.roomSrId = Number(this.requestId),
        //element.roomLineId = element.roomLineId;
        element.roomLineId = Number(this.paramsHotelLineId);
      element.roomNumber = roomindex + 1;
      element.roomAddonsRequired = 0;
      element.roomAdultCount = Number(element.roomAdultCount);
      element.roomChildCount = Number(element.roomChildCount);
      element.roomInfantCount = 0;
      //this.totalInfantsData;
      element.roomStatus = element.roomStatus;
      element.roomLineUuid = element.roomLineUuid;
      element.roomUpdatedBy = this.authService.getUser();
      element.roomUpdatedDate = this.todaydateAndTimeStamp;
      element.roomUpdatedDevice = this.deviceInfo?.userAgent;
      let childAge;
      element.childAge.forEach((ele, idx) => {
        if (childAge) {
          childAge = childAge + "," + ele.roomChildAges?.toString();
        } else {
          childAge = ele.roomChildAges?.toString();
        }
      });
      element.roomChildAges = childAge;
      element.roomUpdatedIp = null;
      //element.roomPassengersInfo = this.paxId[index];
      /*  let roomsPersonList;
       element.roomsPersonList.forEach((element, roomindex, roomPassengerindex) => {
         if (roomsPersonList) {
           roomsPersonList = this.paxId[roomindex][roomPassengerindex]
         }
       }); */
      element.roomsPersonList.forEach(element => {
        element.passengerSrId = Number(this.requestId);
        element.passengerStatus = 0;
      });
      element.roomPassengersInfo = element.roomsPersonList;
      delete element.roomsPersonList;
      delete element.childAge;
    });
    return roomsDummyArray;
  }

  //markup type depends on input shows
  changeMarkupType(e) {
    // *ngIf="hotelForm.value.lineMarkUpType === 'A' || hotelForm.value.lineMarkUpType === 'B'"
    // *ngIf="hotelForm.value.lineMarkUpType === 'P' || hotelForm.value.lineMarkUpType === 'B'"
    switch (e) {
      case 'A':
        this.amountInutShow = true;
        this.percentageshow = false;
        break;
      case 'P':
        this.amountInutShow = false;
        this.percentageshow = true;
        break;
      case 'B':
        this.amountInutShow = true;
        this.percentageshow = true;
        break;
      default:
        this.amountInutShow = false;
        this.percentageshow = false;
    }
  }
  /**
 * Trigger a call to the API to get the location
 * data for from input
 */
   onSearchLocation: OperatorFunction<string, readonly { name; country, code }[]> = (text$: Observable<string>) =>
   text$.pipe(
     debounceTime(300),
     distinctUntilChanged(),
     tap((term: string) => (this.searchTerm = term)),
     switchMap((term) =>
       term.length >= 3
         ? this.masterDataService.getAirportByName(term).pipe(
           tap((response: AirportSearchResponse[]) => {
             this.noResults = response.length === 0;
             let data = response
             data.forEach((element) => {
               element.name = element?.name + ' , ' + element?.country + '(' + element?.code + ")"
             });
             this.searchResult = [...data];
             if( this.noResults){
              this.toastr.warning(`no data found given  search string ${term}`);
            }
             //  this.searchResult = [...response];
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
         : this.searchResult.filter((v) => v.name.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1)
     }
     )
   );

 /**
 * Trigger a call to the API to get the location
 * data for from input
 */
 onSearchCity: OperatorFunction<string, readonly { name; }[]> = (text$: Observable<string>) =>
   text$.pipe(
     debounceTime(300),
     distinctUntilChanged(),
     tap((term: string) => (this.searchCityTerm = term)),
     switchMap((term) =>
       term.length >= 3
         ? this.masterDataService.getCityMasterData(term).pipe(
           tap((response: City[]) => {
             this.noCityResults = response.length === 0;
             this.searchCityResult = [...response];
             if( this.noCityResults){
              this.toastr.warning(`no data found given city search string ${term}`);
            }
           }),
           catchError(() => {
             return of([]);
           })
         )
         : of([])
     ),
     tap(() => this.cdr.markForCheck()),
     tap(() => {
       this.searchCityTerm === '' || this.searchCityTerm.length <= 2
         ? []
         : this.searchCityResult.filter((v) => v.name.toLowerCase().indexOf(this.searchCityTerm.toLowerCase()) > -1)
     }
     )
   );

 /**
  * Trigger a call to the API to get the Meals
  * data for from input
  */
 onSearchMeals: OperatorFunction<string, readonly { name; }[]> = (text$: Observable<string>) =>
   text$.pipe(
     debounceTime(300),
     distinctUntilChanged(),
     tap((term: string) => (this.searchMealsTerm = term)),
     switchMap((term) =>
       term.length >= 3
         ? this.masterDataService.getMealsMasterData(term).pipe(
           tap((response: Meals[]) => {
             this.noMealsResults = response.length === 0;
             this.searchMealsResult = [...response];
             if( this.noMealsResults){
              this.toastr.warning(`no data found given meal type search string ${term}`);
            }
           }),
           catchError(() => {
             return of([]);
           })
         )
         : of([])
     ),
     tap(() => this.cdr.markForCheck()),
     tap(() => {
       this.searchMealsTerm === '' || this.searchMealsTerm.length <= 2
         ? []
         : this.searchMealsResult.filter((v) => v.name.toLowerCase().indexOf(this.searchMealsTerm.toLowerCase()) > -1)
     }
     )
   );


 /**
* Trigger a call to the API to get the Property
* data for from input
*/
 onSearchProperty: OperatorFunction<string, readonly { name; }[]> = (text$: Observable<string>) =>
   text$.pipe(
     debounceTime(300),
     distinctUntilChanged(),
     tap((term: string) => (this.searchPropertyTerm = term)),
     switchMap((term) =>
       term.length >= 3
         ? this.masterDataService.getPropertyMasterData(term).pipe(
           tap((response: Meals[]) => {
             this.noPropertyResults = response.length === 0;
             this.searchPropertyResult = [...response];
             if( this.noPropertyResults){
              this.toastr.warning(`no data found given property type search string ${term}`);
            }
           }),
           catchError(() => {
             return of([]);
           })
         )
         : of([])
     ),
     tap(() => this.cdr.markForCheck()),
     tap(() => {
       this.searchPropertyTerm === '' || this.searchPropertyTerm.length <= 2
         ? []
         : this.searchPropertyResult.filter((v) => v.name.toLowerCase().indexOf(this.searchPropertyTerm.toLowerCase()) > -1)
     }
     )
   );



 /**
* Trigger a call to the API to get the Hotel Name
* data for from input
*/
 onSearchHotelNames: OperatorFunction<string, readonly { name; }[]> = (text$: Observable<string>) =>
   text$.pipe(
     debounceTime(300),
     distinctUntilChanged(),
     tap((term: string) => (this.searchHotelNamesTerm = term)),
     switchMap((term) =>
       term.length >= 3
         ? this.masterDataService.getHotelNamesMasterData(term).pipe(
           tap((response: HotelNames[]) => {
             this.noHotelNamesResults = response.length === 0;
             this.searchHotelNamesResult = [...response];
             if( this.noHotelNamesResults){
               this.toastr.warning(`no data found given hotel name search string ${term}`);
             }
           }),
           catchError(() => {
             return of([]);
           })
         )
         : of([])
     ),
     tap(() => this.cdr.markForCheck()),
     tap(() => {
       this.searchHotelNamesTerm === '' || this.searchHotelNamesTerm.length <= 2
         ? []
         : this.searchHotelNamesResult.filter((v) => v.name.toLowerCase().indexOf(this.searchHotelNamesTerm.toLowerCase()) > -1)
     }
     )
   );
 /**
  * A method to bind the value of seclected element from the dropdown
  * @param $event dropdown selected option
  * @param index  index of the dynamic form
  * @param nameOfControl name of the form control in the dynamic form
  */
 bindValueOfControl($event: NgbTypeaheadSelectItemEvent, nameOfControl: string) {
   if ($event !== undefined && nameOfControl) {
     if (nameOfControl === 'lineLocation') {

       this.hotelForm.patchValue({
         lineLocation: $event.item?.name + ' ' + $event.item?.country + '(' + $event.item?.code + ")",
       });
     }
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
 getSupplierDetailes(){
  this.rfqServices.getAllSupplierData(RFQURLS.SUPPLIPER_URL.getAllSupplier).pipe(takeUntil(this.ngDestroy$)).subscribe((supplierData: RfqApiResponse) => {
    const result: RfqApiResponse = supplierData;
    if (result.status === 200) {
      //this.supplierDeatils = result.data;
      let data:any = result.data;
      data?.forEach((element) => {
        element.isSelected = false;
      });
      this.supplierDeatils = result.data;

      //this.collectionSize = this.supplierDeatils.length;
      this.cdr.markForCheck();
    } else {
      this.toastr.error('Oops! Something went wrong while fetching the supplier data please try again.', 'Error');
    }
  });
}

/**
  * Open person modal component to add more people to the form
  */
 openPersonModal(roomIndex: number) {
  const modalRef = this.modalService.open(HotelRfqPassengersPopupComponent, { size: 'xl' });
  modalRef.componentInstance.name = 'Add Passengers';
  modalRef.componentInstance.roomIndex = roomIndex;
}

 /**
  *
  * selected passengers
  * selectedUsers: Passengers[]
  */
  selectedPassengers() {
    this.SelectedPassengersService.getHotelData().pipe(takeUntil(this.ngDestroy$)).subscribe((res) => {
      for (let r = 0; r < res?.passengers?.length; r++) {
        this.passengersList.push(res?.passengers[r]);
        (this.roomsData().at(res?.roomIndex)?.get('roomsPersonList') as FormArray).push(this.fb.group(res?.passengers[r]));
      }
      this.cdr.detectChanges();
    });
  }
  getAddonsResponseData() {
    this.SelectedPassengersService.getAddonsData().subscribe((res) => {
      this.addonsPopData = res;
      this.cdr.detectChanges();
    });
  }


  //get Hotel lines Data
  FindById(rfqLineId:number,srId:number,srLine:number) {
    this.isEdit = true;
    this.rfqServices.findRFQHotelLinesData(rfqLineId, RFQURLS.HOTEL_RFQ_LIST.getHotelRfqInfo,srId,srLine).pipe(takeUntil(this.ngDestroy$)).subscribe((updatedata: any) => {
      const result:RfqApiResponse=updatedata;
      if(result.statusCode=== true){

         /*  this.hotelLinesData = result.data[0]?.rfqHotelLines[0];
          this.roomMembers = result.data[0]?.rfqHotelPassengers;
          this.addonsPopData = result.data[0]?.rfqHotelAddons; */
          if(result.data[0]?.rfqHotelLines?.length>0){
            this.hotelLinesData = result.data[0]?.rfqHotelLines[0];
          }else{
            this.hotelLinesData = null;
          }
          if(result.data[0]?.rfqHotelPassengers?.length>0){
            this.roomMembers = result.data[0]?.rfqHotelPassengers;
          }else{
            this.roomMembers = [];
          }
          if( result.data[0]?.rfqHotelAddons?.length>0){
            this.addonsPopData = result.data[0]?.rfqHotelAddons;
          }else{
            this.addonsPopData = [];
          }
         if(result.data[0]?.rfqHotelRooms?.length>0){
          this.hotelRoomsData = result.data[0]?.rfqHotelRooms;
         }else{
          this.hotelRoomsData = []
         }
          this.addonsData = {
            lineSrId: Number(this.requestId),
            //lineRoomCount: Number(this.hotelForm.value.lineRoomCount),
            lineNoOfNights: this.hotelLinesData?.lineNoOfNights,
            hotelLineId: this.hotelLinesData?.id,
            //totalData: response,
            //roomId: this.roomLineId,
            //passengerId: this.passengerId,
            roomsInfo: this.hotelRoomsData,
            //roomId: this.roomIds,
            //adultsCount: this.adultsCount,
            //childcount: this.childCount,
            passengersInfo:  this.roomMembers
          };

          if (this.hotelLinesData) {
            const lineLocation = {
              code: null,
              city: null,
              cityCode: null,
              country: null,
              countryCode: null,
              createdBy: null,
              createdDate: null,
              id: null,
              name: this.hotelLinesData?.lineLocation,
              status: null,
              timeZone: null,
              type: null,
              updatedBy: 0,
              updatedDate: null,
            };
            const city = {
              id: null,
              name: this.hotelLinesData?.lineCity,
              code: null,
              description: null,
              geoCityName: null,
              cityNameUnique: null,
              countryCode: null,
              countryName: null,
              createdBy: null,
              createdDate: null,
              updatedBy: null,
              updatedDate: null,
              status: null,
            };

            const hotelName = {
              createdBy: null,
              createdDate: null,
              udatedBy: null,
              updatedDate: null,
              id: null,
              name: this.hotelLinesData?.lineHotelName,
              code: null,
              description: null,
              groupId: null,
              status: null,
            };

            const propertyType = {
              id: null,
              name: this.hotelLinesData?.linePropertyType,
              code: null,
              description: null,
              status: null,
            };
            const mealsType = {
              createdBy: null,
              createdDate: null,
              udatedBy: null,
              updatedDate: null,
              id: null,
              name: this.hotelLinesData?.lineMealType,
              code: null,
              description: null,
              airline: null,
              status: null,
            };
            this.hotelForm.patchValue({
              id: Number(this.hotelLinesData?.id),
              //lineLocation: lineLocation,
              lineCity: city,
              lineHotelName: hotelName,
              linePropertyType: propertyType,
              lineMealType: mealsType,
              lineRoomCount: this.hotelLinesData?.lineRoomCount,
              lineCountry: Number(this.hotelLinesData?.lineCountry) === 0 ? '' : Number(this.hotelLinesData?.lineCountry),
              lineNoOfNights: this.hotelLinesData?.lineNoOfNights,
              lineRatings: this.hotelLinesData?.lineRatings,
              lineCountryResidency: Number(this.hotelLinesData?.lineCountryResidency) === 0 ? '' : Number(this.hotelLinesData?.lineCountryResidency),
              lineNationality: Number(this.hotelLinesData?.lineNationality) === 0 ? '' : Number(this.hotelLinesData?.lineNationality),
              lineCheckInDate: this.datepipe.transform(this.hotelLinesData?.lineCheckInDate, 'yyyy-MM-dd'),
              lineCheckOutDate: this.datepipe.transform(this.hotelLinesData?.lineCheckOutDate, 'yyyy-MM-dd'),
              lineMarkUpType: this.hotelLinesData?.lineMarkUpType === null?'':this.hotelLinesData?.lineMarkUpType,
              lineMarkupPercentage: this.hotelLinesData?.lineMarkupPercentage,
              lineMarkupAmount: this.hotelLinesData?.lineMarkupAmount,
              lineUuid: this.hotelLinesData?.lineUuid,
              lpoDate:this.hotelLinesData?.lpoDate,
              lpoAmount:this.hotelLinesData?.lpoAmount,
              lpoNumber:this.hotelLinesData?.lpoNumber,
              lineLatitude: this.hotelLinesData?.lineLatitude,
              lineLongitude: this.hotelLinesData?.lineLongitude,
              lineSearchType:this.hotelLinesData?.lineSearchType ==="geoLocation"?true:false,
            });
            if(this.hotelLinesData?.lineSearchType ==="geoLocation"){
              this.hotelForm.patchValue({
                lineLocation: this.hotelLinesData?.lineLocation,
              });
            }else{
              this.hotelForm.patchValue({
                lineLocation: lineLocation,
              });
            }
            this.changeMarkupType(this.hotelLinesData?.lineMarkUpType);
            this.roomsInputDependsOnAddRooms(this.hotelLinesData?.lineRoomCount);
            //this.cdr.detectChanges();
          }

          if (this.hotelRoomsData?.length>0) {
            for (let i = 0; i < this.hotelRoomsData?.length; i++) {
              /* if (i > 0) {
                const fg = this.createFormGroup();
                this.roomsData().push(fg);
              } */
              this.rowsControls.push({
                isCollapsedSelectedPersons: true
              });
              ((this.hotelForm.get('roomsData') as FormArray).at(i) as FormGroup)?.patchValue({
                roomNumber: this.hotelRoomsData[i]?.roomNumber,
                roomSrId: Number(this.requestId),
                roomLineUuid:this.hotelLinesData?.lineUuid,
                roomLineId: Number(this.hotelLinesData?.id),
                id: Number(this.hotelRoomsData[i].id),
                roomAdultCount: this.hotelRoomsData[i].roomAdultCount,
                roomChildCount: this.hotelRoomsData[i].roomChildCount,

                //roomChildAges: this.hotelRoomsData[i].roomChildAges
              });
              this.childDependsOnAgeInput(this.hotelRoomsData[i]?.roomChildCount, i);
              // roomChildAges converting to array
              if (this.hotelRoomsData[i]?.roomChildCount > 0) {
                let total = [];
                this.hotelRoomsData[i].roomChildAges = this.hotelRoomsData[i].roomChildAges === 0 ? '' : this.hotelRoomsData[i].roomChildAges.split`,`;
                for (let s = 0; s < this.hotelRoomsData[i].roomChildAges?.length; s++) {
                  this.hotelRoomsData[i].roomChildAges[s] = this.hotelRoomsData[i].roomChildAges[s];
                  total.push(this.hotelRoomsData[i].roomChildAges[s]);

                }
                for (let index = 0; index < total?.length; index++) {
                  let element = total[index];
                  this.childAge(i)?.at(index)?.patchValue({
                    roomChildAges: element
                  });
                }
              }
            }
            //this.roomsData()
            for (let roomindex = 0; roomindex < this.hotelRoomsData?.length; roomindex++) {
              for (let index = 0; index < this.roomMembers?.length; index++) {
                if (Number(this.roomsData().at(roomindex)?.value.id) === Number(this.roomMembers[index]?.passengerRoomId)) {
                  const element = this.roomMembers[index];
                  (this.roomsData().at(roomindex).get('roomsPersonList') as FormArray).push(this.fb.group(element));
                }
              }
            }
            this.cdr.detectChanges();
          }
      }else  {
        this.toastr.error('Oops! Something went wrong while fetching the Hotel Lines  data please try again', 'Error');
      }
    });
  }
  isAllSelected() {
    this.isMasterSelected = this.supplierDeatils.every((item:any) =>{
        return item.isSelected == true;
      });
    this.getCheckedItemList();
  }
  getCheckedItemList(){
    this.checkedSupplierList = [];
    this.contactDeatils = [];
    for (let i = 0; i < this.supplierDeatils.length; i++) {
      if(this.supplierDeatils[i]?.isSelected){
        const element = this.supplierDeatils[i];
        const  RfqSupplierRelation = {
          requestId: Number(this.requestId),
          requestLineId: Number(this.paramsHotelLineId),
          status: 1,
          supplierId:  this.supplierDeatils[i]?.customerId,
          createdBy:this.authService.getUser(),
          createdDate:this.todaydateAndTimeStamp,
          updatedBy:  this.authService.getUser(),
          email:this.supplierDeatils[i].primaryEmail,
          //supplierNo: i+1
          updatedDate:this.todaydateAndTimeStamp
      };
        this.checkedSupplierList.push(RfqSupplierRelation);

        if (element?.primaryConatct && element?.primaryPhoneNumber) {
          const contact = {
            contact_number: Number(element.primaryPhoneNumber),
            contact_name: element.primaryConatct,
            sender_id: this.authService.getUser(),
            message: `Hi ${element.primaryConatct},
We sent RFQ please review and provide your options.

Click below to provide options for RFQ SR # ${Number(this.requestId)}

http://travcbt.dev.com/pages/login`,
            module: this.messageModuleName,
            module_id: this.messageModuleID,
            reference: Number(this.requestId),
            sub_reference: Number(this.paramsHotelLineId),
            supplier_id: this.supplierDeatils[i]?.customerId,
          };
          this.contactDeatils.push(contact);
        }
      }
    }


    //this.checkedSupplierList = JSON.stringify(this.checkedSupplierList);

  }

  onUpdateHotelRFQ(){
    this.submitted = true;

    if(this.checkedSupplierList === undefined || this.checkedSupplierList.length === 0){
      return this.toastr.error("Please select at least one supplier then submit", "Error");
    }

    if (this.hotelForm.valid) {

      this.showSpinner();
      this.requestCreationLoading=true;
      const roomsData = this.RoomsData();
      this.totalAdults();
      this.totalChilderns();
      //this.totalInfants();
      const editData = {
        srLine: {
          id: this.hotelForm.value.id,
          lineUuid:this.hotelForm.value.lineUuid,
          lineLatitude: this.hotelForm.value.lineLatitude === ""?null:this.hotelForm.value.lineLatitude,
          lineLongitude: this.hotelForm.value.lineLongitude === ""?null:this.hotelForm.value.lineLongitude,
          lineRadius: this.hotelForm.value.lineRadius === ""?null:this.hotelForm.value.lineRadius,
          lineSrId: Number(this.requestId),
          lineSrLineId:Number(this.paramsHotelLineId),
          lineCountry: this.hotelForm.value.lineCountry ===""?null:this.hotelForm.value.lineCountry,
          lineCity: this.hotelForm.value.lineCity?.name ? this.hotelForm.value.lineCity?.name : null,
          //lineLocation: this.hotelForm.value.lineLocation?.name ? this.hotelForm.value.lineLocation?.name : null,
          lineLocation: this.hotelForm.value.lineLocation?.name
          ? this.hotelForm.value.lineLocation?.name
          : this.hotelForm.value.lineLocation,
          lineHotelName: this.hotelForm.value.lineHotelName?.name ? this.hotelForm.value.lineHotelName?.name : null,
          linePropertyType: this.hotelForm.value.linePropertyType?.name ? this.hotelForm.value.linePropertyType?.name : null,
          lineMealType: this.hotelForm.value.lineMealType?.name ? this.hotelForm.value.lineMealType?.name : null,
          lineCheckInDate: this.hotelForm.value.lineCheckInDate,
          lineCheckOutDate: this.hotelForm.value.lineCheckOutDate,
          lineNoOfNights: this.hotelForm.value.lineNoOfNights !== '' ? this.hotelForm.value.lineNoOfNights : 0,
          lineRoomCount: this.hotelForm.value.lineRoomCount===""?0:Number(this.hotelForm.value.lineRoomCount),
          lineCountryResidency: this.hotelForm.value.lineCountryResidency===""?null:this.hotelForm.value.lineCountryResidency?.toString(),
          lineNationality: this.hotelForm.value.lineNationality===""?null:this.hotelForm.value.lineNationality?.toString(),
          lineRatings: this.hotelForm.value.lineRatings === "" ||this.hotelForm.value.lineRatings === null?0: this.hotelForm.value.lineRatings,
          lineMarkUpType: this.hotelForm.value.lineMarkUpType === ""? null: this.hotelForm.value.lineMarkUpType,
          lineMarkupAmount: this.hotelForm.value.lineMarkupAmount !== '' ? this.hotelForm.value.lineMarkupAmount : null,
          lineMarkupPercentage: this.hotelForm.value.lineMarkupPercentage !== '' ? this.hotelForm.value.lineMarkupPercentage : null,
          lineAdultCount: this.totalAdultsData,
          lineChildCount: this.totalCHDData,
          lineInfantCount: 0,
          lineTotalDays: this.hotelForm.value.lineTotalDays !== ''?this.hotelForm.value.lineTotalDays:0,
          lineSearchType: this.hotelForm.value.lineSearchType=== true?"geoLocation":"Normal",
          lineAddonsRequired: 0,
          lineApis: this.hotelForm.value.lineApis,
          lineUpdatedBy: this.authService.getUser(),
          lineUpdatedDate: this.todaydateAndTimeStamp,
          lineUpdatedDevice: this.deviceInfo?.userAgent,
          lineUpdatedIp: null,
          lpoDate:this.hotelForm.value.lpoDate === "" || this.hotelForm.value.lpoDate === null? null: this.hotelForm.value.lpoDate,
          lpoAmount:this.hotelForm.value.lpoAmount===""|| this.hotelForm.value.lpoAmount === null? 0.0: this.hotelForm.value.lpoAmount,
          lpoNumber:this.hotelForm.value.lpoNumber=== "" || this.hotelForm.value.lpoNumber === null? null: this.hotelForm.value.lpoNumber,
        },
        srRooms: roomsData,
        supplierRelation: this.checkedSupplierList
      };



      this.rfqServices.updateRFQHotel(editData, RFQURLS.HOTEL_RFQ_LIST.modifyHotelRequest).pipe(takeUntil(this.ngDestroy$)).subscribe(
        (response: any) => {
          if(response?.srLine?.id){

            this.sendRFQ();

          }
          //this.toastr.success('The service request has been sent successfuly !', 'Success');
          //this.cdr.detectChanges();
        },
        (error) => {
          this.toastr.error('Oops! Something went wrong  while send the data please try again', 'Error');
        }
      );
    } else {
      this.toastr.error("Please fill the required fields and submit the form", 'Error');
    }
  }




  async sendRFQ() {
    if (this.checkedSupplierList.length > 0) {
      for (let index = 0; index < this.checkedSupplierList.length; index++) {
        //const element = this.checkedSupplierList[index];
        if (this.checkedSupplierList[index].email) {
          const contactElement = this.contactDeatils[index];
          try {
            await this.rfqServices.sendRFQEmails(
              this.checkedSupplierList[index].email,
              this.authService.getUserName(),
              this.checkedSupplierList[index].requestId
            );
            await this.rfqServices.sendWaMessages(contactElement, RFQURLS.whatsAppUrl.sendWaMessageRFQ);
          } catch (error) {
            console.log(error);
          }finally {
            this.requestCreationLoading = false;
          }
        }
      }
      this.toastr.success(`RFQ sent  successfuly !`, 'Success');
     this.router.navigate(['/dashboard/rfq/hotel-rfqs-awt-response']);
    }
  }

  handleAddressChange(event: any) {
    if(event.target.checked ){

      this.hotelForm.patchValue({
        lineLocation: null,
      });
    }else{
      this.hotelForm.patchValue({
        lineLocation: this.hotelForm.value.lineLocation,
      });
    }


    /* if(address){
      const userAddress = address.name+','+address.formatted_address;
     // const userAddress = address.name;
      const userLatitude = address.geometry.location.lat();
      const userLongitude = address.geometry.location.lng();
      if(userAddress&&userLatitude&&userLongitude){
        const lineLocation = {
          code: null,
          city: null,
          cityCode: null,
          country: null,
          countryCode: null,
          createdBy: null,
          createdDate: null,
          id: null,
          name: userAddress,
          status: null,
          timeZone: null,
          type: null,
          updatedBy: 0,
          updatedDate: null,
        };
        this.hotelForm.patchValue({
          lineLocation: lineLocation,
          lineLatitude: userLatitude,
          lineLongitude: userLongitude,
        });
      }
    } */

  }


  trackByFn(index, item) {
    return index;
  }


  public showSpinner(): void {
    this.spinnerService.show();
    /* setTimeout(() => {
      this.spinnerService.hide();
    }, 5000); // 5 seconds */
  }
  ngOnInit(): void {
    this.initializeForm();
    this.getCountry();
    this.getHotelRating();
    this.getNationalityLov();
    this.epicFunction();
    this.changeMarkupType('P');
    /*get The params and call the find by contact service */
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param && param.contactId && param.requestId &&param.hotelRfq&&param.srLine) {
        this.contactId = param.contactId;
        this.requestId = param.requestId;
        this.paramsHotelLineId=param.srLine;
        if(param.hotelRfq&&param.requestId&& this.paramsHotelLineId){
          this.FindById(param.hotelRfq,param.requestId, Number(this.paramsHotelLineId));
        }
      }
    });
  }
  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
