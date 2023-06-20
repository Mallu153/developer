import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  NgbCalendar,
  NgbDate,
  NgbDateAdapter,
  NgbDateNativeAdapter,
  NgbDateParserFormatter,
  NgbDateStruct,
  NgbModal,
  NgbTypeahead,
  NgbTypeaheadSelectItemEvent,
} from '@ng-bootstrap/ng-bootstrap';
import { AddPersonModalComponent } from '../add-person-modal/add-person-modal.component';
import { SelectedPassengersService } from '../../share-data-services/selected-passenger.service';
import { DatePipe, formatDate } from '@angular/common';
import { Passengers } from 'app/pages/dashboard/dashboard-request/model/selectedPassengers';
import { DashboardRequestService } from 'app/pages/dashboard/dashboard-request/services/dashboard-request.service';
import * as apiUrls from '../../../dashboard-request/url-constants/url-constants';
import { ApiResponse } from '../../../dashboard-request/model/api-response';
import { DeviceDetectorService } from 'ngx-device-detector';
import { AirportSearchResponse } from 'app/shared/models/airport-search-response';
import { MasterDataService } from 'app/shared/services/master-data.service';
import { Observable, of, OperatorFunction, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError, takeUntil } from 'rxjs/operators';
import { AddonsModelComponent } from '../addons-model/addons-model.component';
import { City } from 'app/shared/models/city-search-response';
import { Meals } from 'app/shared/models/meals-search-response';
import { Property } from 'app/shared/models/property-search-response';
import { HotelNames } from 'app/shared/models/hotel-names-search-response';
import { AuthService } from 'app/shared/auth/auth.service';
import { RfqService } from 'app/pages/dashboard/rfq/rfq-services/rfq.service';
import * as RFQURLS from '../../../rfq/rfq-url-constants/apiurl';
import { environment } from 'environments/environment';
import { SrSummaryDataService } from '../../share-data-services/srsummarydata.service';
import { SrSummaryData } from '../../../dashboard-request/url-constants/url-constants';
import { TeamDataDataService } from '../../share-data-services/team-data.service';
import { CustomAdapter, CustomDateParserFormatter } from 'app/shared/helpers/datepicker-adapter';
import { PERMISSION_KEYS } from 'app/shared/data/app-premission-key';
import { PolicyQualifyProcessStage1Component } from '../policy-qualify-process-stage1/policy-qualify-process-stage1.component';
import { DashboardBookingAsyncService } from '../../services/dashboard-booking-async.service';

@Component({
  selector: 'app-hotel-form',
  templateUrl: './hotel-form.component.html',
  styleUrls: ['./hotel-form.component.scss'],
  providers: [
    /* { provide: NgbDateAdapter, useClass: CustomAdapter },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
    NgbDateNativeAdapter, */
  ],
  //changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelFormComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  pageTitle = 'Hotel Request';
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
  todaydateAndTimeStamp: string;
  //passengers list
  passengersList: Passengers[] = [];
  //pax ids for array
  paxId = [];
  //selected persons
  public rowsControls: any = [
    {
      isCollapsedSelectedPersons: true,
    },
  ];
  //pagination
  page = 1;
  pageSize = 10;
  collectionSize: number;
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
  private productList: any;
  private contactDetails: any = {};

  public transitionsList: any[] = [];
  public teamList: any[] = [];
  public teamMembersList: any;

  hoveredDate: NgbDate | null = null;
  fromDate: any | null;
  toDate: any | null;
  displayMonths = 2;
  navigation = 'arrow';
  checkinToday: NgbDate | null = null;
  /**
   *
   *
   * HOTEL form elements premissions
   */
  keys = [];

  hotelGeoLocation = PERMISSION_KEYS.BOOKING.HOTEL.HOTEL_GEOLOCATION;
  hoteMoreBtn = PERMISSION_KEYS.BOOKING.HOTEL.MORE_BTN;
  hotelAddPax = PERMISSION_KEYS.BOOKING.HOTEL.HOTEL_ADD_PAX;
  hotelLpo = PERMISSION_KEYS.BOOKING.HOTEL.HOTEL_LPO;
  hotelAddons = PERMISSION_KEYS.BOOKING.HOTEL.HOTEL_ADDONS_BTN;

  /**
   *
   *
   *  hotel buttons premissions
   */
  hotelSaveBtn = PERMISSION_KEYS.BOOKING.HOTEL.HOTEL_SAVE_BTN;
  hotelCbtSaveBtn = PERMISSION_KEYS.BOOKING.HOTEL.HOTEL_CBT_SAVE_BTN;
  hotelUpdateBtn = PERMISSION_KEYS.BOOKING.HOTEL.HOTEL_UPDATE_BTN;
  hotelCbtUpdateBtn = PERMISSION_KEYS.BOOKING.HOTEL.HOTEL_CBT_UPDATE_BTN;
  hotelRFQBtn = PERMISSION_KEYS.BOOKING.HOTEL.HOTEL_RFQ_BTN;
  hotelOnlineBtn = PERMISSION_KEYS.BOOKING.HOTEL.HOTEL_ONLINE;
  hotelOfflineBtn = PERMISSION_KEYS.BOOKING.HOTEL.HOTEL_OFFLINE;
  hotelAdhocBtn = PERMISSION_KEYS.BOOKING.HOTEL.HOTEL_ADHOC_BOOKING_BTN;
  /**
   *
   *
   * product link  premissions
   */
  flightLink = PERMISSION_KEYS.BOOKING.HOTEL.PRODUCT_LINK_FLIGHT;
  hotelLink = PERMISSION_KEYS.BOOKING.HOTEL.PRODUCT_LINK_HOTEL;
  ancillaryLink = PERMISSION_KEYS.BOOKING.HOTEL.PRODUCT_LINK_ANCILLARY;
  holidayLink = PERMISSION_KEYS.BOOKING.HOTEL.PRODUCT_LINK_HOLIDAY;
  activityLink = PERMISSION_KEYS.BOOKING.HOTEL.PRODUCT_LINK_ACTIVITY;

  policyList = [];
  constructor(
    private fb: FormBuilder,
    private titleService: Title,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private SelectedPassengersService: SelectedPassengersService,
    private datepipe: DatePipe,
    private dashboardRequestService: DashboardRequestService,
    private deviceService: DeviceDetectorService,
    public masterDataService: MasterDataService,
    private authService: AuthService,
    private rfqServices: RfqService,
    private srSummaryData: SrSummaryDataService,
    private teamDataService: TeamDataDataService,
    private calendar: NgbCalendar,
    public dateFormatter: NgbDateParserFormatter,
    private dashboardAsyncApiServices: DashboardBookingAsyncService
  ) {
    this.titleService.setTitle('Request Hotel');
    this.checkinToday = calendar.getToday();
    this.todayDate1 = this.datepipe.transform(this.todayDate, 'yyyy-MM-dd');
    this.todaydateAndTimeStamp = formatDate(this.todayDate, 'yyyy-MM-ddThh:mm:ss', 'en-US', '+0530');
    //passengers list
    this.selectedPassengers();
    this.getAddonsResponseData();
  }

  //contact details show service call
  getContactDetails(contactId: number) {
    this.dashboardRequestService
      .findContactById(contactId, apiUrls.newPax_create_url.find)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((updatedata: ApiResponse) => {
        const result: ApiResponse = updatedata;
        if (result.status === 200) {
          this.updateContactdata = result.data[0];
          this.cdr.markForCheck();
        } else {
          this.toastr.error('Oops! Something went wrong while fetching the contact data', 'Error');
        }
      });
  }

  /**
   * Open person modal component to add more people to the form
   */
  openPersonModal(roomIndex: number) {
    const modalRef = this.modalService.open(AddPersonModalComponent, { size: 'xl', windowClass: 'my-class' });
    modalRef.componentInstance.name = 'Add Passengers';
    modalRef.componentInstance.roomIndex = roomIndex;
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
      lineNoOfNights: 0,
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
      lineUuid: '',
      lpoDate: '',
      lpoAmount: '',
      lpoNumber: '',
      lineStatusId: '',
      defaultMemeber: '',
      roomsData: this.fb.array([this.createFormGroup()]),
    });
  }
  get f() {
    return this.hotelForm.controls;
  }
  createFormGroup() {
    return this.fb.group({
      id: '',
      roomSrId: '',
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
      childAge: this.fb.array([]),
    });
    //this.createAgeFormGroup()
  }
  createAgeFormGroup() {
    return this.fb.group({
      roomChildAges: '1',
    });
  }
  /*   createPassengersArray(data: any) {
      return this.fb.group({
        passengerAddonsRequired: data.passengerAddonsRequired,
        passengerCountryResidency: data.passengerAddonsRequired,
        passengerCoutry: data.passengerAddonsRequired,
        passengerEmail: data.passengerAddonsRequired,
        passengerFirstName: data.passengerAddonsRequired,
        passengerLastName: data.passengerAddonsRequired,
        passengerLineId: data.passengerAddonsRequired,
        passengerMiddleName: data.passengerAddonsRequired,
        passengerNationality: data.passengerAddonsRequired,
        passengerPaxId: data.passengerAddonsRequired,
        passengerPhone: data.passengerAddonsRequired,
        passengerRoomId: data.passengerAddonsRequired,
        passengerSrId: data.passengerAddonsRequired,
        passengerStatus: data.passengerAddonsRequired,
        passengerTitle: data.passengerAddonsRequired,
        passengerType: data.passengerAddonsRequired,
        passengerCreatedBy: data.passengerAddonsRequired,
        passengerCreatedDate: data.passengerCreatedDate,
        passengerCreatedDevice: data.passengerCreatedDevice,
        passengerCreatedIp: data.passengerCreatedIp,
        passengerUpdatedBy: data.passengerUpdatedBy,
        passengerUpdatedDate: data.passengerUpdatedDate,
        passengerUpdatedDevice: data.passengerUpdatedDevice,
        passengerUpdatedIp: data.passengerUpdatedIp,
      });
    } */
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
          isCollapsedSelectedPersons: true,
        });
      }
    } else {
      if (confirm('Are you sure you want to delete?') === true) {
        let arr = [];
        for (let i = this.roomsData()?.length; i >= count; i--) {
          arr.push(this.roomsData()?.at(i)?.value === undefined ? {} : this.roomsData()?.at(i)?.value);
          //this.onInactiveRoomHotelForm();
          this.roomsData().removeAt(i);
          this.rowsControls.pop(i);
        }
        this.roomsDeleteflag = arr.filter((element) => {
          if (Object.keys(element).length !== 0) {
            return true;
          }
          return false;
        });
        this.onInactiveRoomHotelForm();
      } else {
        //this.reloadComponent();
        if (this.hotelLinesData?.lineRoomCount) {
          this.hotelForm.patchValue({
            lineRoomCount: this.hotelLinesData?.lineRoomCount,
          });
        }
      }
    }
  }

  OnSelectAddRooms(count) {
    for (let i = 0; i < count; i++) {
      const fg = this.createFormGroup();
      this.roomsData().push(fg);
      this.rowsControls.push({
        isCollapsedSelectedPersons: true,
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
      this.removeChildAge(mainindex, ageRemove);
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
      this.paxId = this.passengersList?.map((v) => v);
    }
  }

  getCountry() {
    this.dashboardRequestService
      .readCompanyMasterLov(apiUrls.request_hotel_url.getCountryMaster)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((countryListLov: ApiResponse) => {
        const result: ApiResponse = countryListLov;
        if (result.status === 200) {
          this.countryListLov = result.data;
          //this.cdr.detectChanges();
        } else {
          this.toastr.error('Oops! Something went wrong while fetching the country data', 'Error');
        }
      });
  }
  getNationalityLov() {
    this.dashboardRequestService
      .readCompanyMasterLov(apiUrls.request_hotel_url.getNationaltyMaster)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((NationalityListLov: ApiResponse) => {
        const result: ApiResponse = NationalityListLov;
        if (result.status === 200) {
          this.NationalityListLov = result.data;
          //this.cdr.detectChanges();
        } else {
          this.toastr.error('Oops! Something went wrong while fetching the nationality data', 'Error');
        }
      });
  }
  getHotelRating() {
    this.dashboardRequestService
      .readMasterLov(apiUrls.request_hotel_url.hotelrating)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((hotelRatingListLov: ApiResponse) => {
        const result: ApiResponse = hotelRatingListLov;
        if (result.status === 200) {
          this.hotelRatingListLov = result.data;
          //this.cdr.detectChanges();
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
      const totalDays =
        (new Date(lineCheckOutDate.year + '-' + lineCheckOutDate.month + '-' + lineCheckOutDate.day).getTime() -
          new Date(lineCheckInDate.year + '-' + lineCheckInDate.month + '-' + lineCheckInDate.day).getTime()) /
        (24 * 60 * 60 * 1000);
      //const totalDays = this.getDiffDays(lineCheckInDate, lineCheckOutDate);
      //const noofNights = totalDays;
      //totalDays - 1;
      this.hotelForm.patchValue({
        lineNoOfNights: totalDays?.toFixed(),
        lineTotalDays: totalDays?.toFixed(),
        //lineCheckInDate:  lineCheckInDate,
        //lineCheckOutDate:  lineCheckOutDate
        //lineCheckOutDate:selectlineCheckOutDate
      });
      this.cdr.markForCheck();
    } else {
      this.hotelForm.patchValue({
        lineNoOfNights: 0,
        lineTotalDays: 0,
      });
      this.cdr.markForCheck();
    }
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
  /*   totalInfants() {
      this.totalInfantsData = 0;
      //this.flights().controls.length
      for (let i = 0; i < this.roomsData().value.length; i++) {
        for (let j = 0; j < this.roomsData().at(i).value.childAge.length; j++) {
          this.totalInfantsData += Number(this.roomsData().at(i).value.childAge[j].roomChildAges);
        }
      }
      console.log(this.totalInfantsData);
      return this.totalInfantsData;
    } */
  RoomsData() {
    let roomsDummyArray = [];
    let roomArray = this.roomsData().value;
    roomArray.forEach((val) => roomsDummyArray.push(Object.assign({}, val)));
    roomsDummyArray.forEach((element, roomindex) => {
      (element.id = element.id), (element.roomSrId = Number(this.requestId)), (element.roomLineId = element.roomLineId);
      element.roomNumber = roomindex + 1;
      element.roomAddonsRequired = 0;
      element.roomAdultCount = Number(element.roomAdultCount);
      element.roomChildCount = Number(element.roomChildCount);
      element.roomInfantCount = 0;
      //this.totalInfantsData;
      element.roomStatus = element.roomStatus;
      element.roomCreatedBy = this.authService.getUser();
      element.roomCreatedDate = this.todaydateAndTimeStamp;
      element.roomCreatedDevice = this.deviceInfo?.userAgent;
      let childAge;
      element.childAge.forEach((ele, idx) => {
        if (childAge) {
          childAge = childAge + ',' + ele.roomChildAges?.toString();
        } else {
          childAge = ele.roomChildAges?.toString();
        }
      });
      element.roomChildAges = childAge;
      element.roomCreatedIp = null;
      //element.roomPassengersInfo = this.paxId[index];
      /*  let roomsPersonList;
       element.roomsPersonList.forEach((element, roomindex, roomPassengerindex) => {
         if (roomsPersonList) {
           roomsPersonList = this.paxId[roomindex][roomPassengerindex]
         }
       }); */
      element.roomsPersonList.forEach((element) => {
        element.passengerSrId = Number(this.requestId);
        element.passengerStatus = 0;
      });
      element.roomPassengersInfo = element.roomsPersonList;
      delete element.roomsPersonList;
      delete element.childAge;
    });
    return roomsDummyArray;
  }

  async onSubmitHotelForm() {
    this.submitted = true;
    if (this.hotelForm.invalid) {
      return this.toastr.error('Please fill the required fields and submit the form', 'Error');
    }

    if (this.hotelForm.valid) {
      const roomsData = this.RoomsData();
      this.totalAdults();
      this.totalChilderns();
      //this.totalInfants();

      const saveData = {
        srLine: {
          lineLatitude: this.hotelForm.value.lineLatitude,
          lineLongitude: this.hotelForm.value.lineLongitude,
          lineRadius: this.hotelForm.value.lineRadius,
          lineSrId: Number(this.requestId),
          lineCountry: this.hotelForm.value.lineCountry,
          lineCity: this.hotelForm.value.lineCity?.name
            ? this.hotelForm.value.lineCity?.name
            : this.hotelForm.value.lineCity,
          lineLocation: this.hotelForm.value.lineLocation?.name
            ? this.hotelForm.value.lineLocation?.name
            : this.hotelForm.value.lineLocation,
          lineHotelName: this.hotelForm.value.lineHotelName?.name
            ? this.hotelForm.value.lineHotelName?.name
            : this.hotelForm.value.lineHotelName,
          linePropertyType: this.hotelForm.value.linePropertyType?.name
            ? this.hotelForm.value.linePropertyType?.name
            : this.hotelForm.value.linePropertyType,
          lineMealType: this.hotelForm.value.lineMealType?.name
            ? this.hotelForm.value.lineMealType?.name
            : this.hotelForm.value.lineMealType,

          lineCheckInDate:
            this.hotelForm.value.lineCheckInDate.year +
            '-' +
            this.padNumber(this.hotelForm.value.lineCheckInDate.month) +
            '-' +
            this.padNumber(this.hotelForm.value.lineCheckInDate.day),
          lineCheckOutDate:
            this.hotelForm.value.lineCheckOutDate.year +
            '-' +
            this.padNumber(this.hotelForm.value.lineCheckOutDate.month) +
            '-' +
            this.padNumber(this.hotelForm.value.lineCheckOutDate.day),
          lineNoOfNights: this.hotelForm.value.lineNoOfNights !== '' ? this.hotelForm.value.lineNoOfNights : null,
          lineRoomCount: Number(this.hotelForm.value.lineRoomCount),
          lineCountryResidency: this.hotelForm.value.lineCountryResidency?.toString(),
          lineNationality: this.hotelForm.value.lineNationality?.toString(),
          lineRatings: this.hotelForm.value.lineRatings,
          lineMarkUpType: this.hotelForm.value.lineMarkUpType,
          lineMarkupAmount: this.hotelForm.value.lineMarkupAmount !== '' ? this.hotelForm.value.lineMarkupAmount : null,
          lineMarkupPercentage:
            this.hotelForm.value.lineMarkupPercentage !== '' ? this.hotelForm.value.lineMarkupPercentage : null,
          lineAdultCount: this.totalAdultsData,
          lineChildCount: this.totalCHDData,
          lineInfantCount: 0,
          lineTotalDays: this.hotelForm.value.lineTotalDays,
          lineSearchType: this.hotelForm.value.lineSearchType === true ? 'geoLocation' : 'Normal',
          lineAddonsRequired: 0,
          lineApis: this.hotelForm.value.lineApis,
          lineCreatedBy: this.authService.getUser(),
          lineCreatedDate: this.todaydateAndTimeStamp,
          lineCreatedDevice: this.deviceInfo?.userAgent,
          lineCreatedIp: null,
          lpoDate: this.hotelForm.value.lpoDate === '' ? null : this.hotelForm.value.lpoDate,
          lpoAmount: this.hotelForm.value.lpoAmount === '' ? null : this.hotelForm.value.lpoAmount,
          lpoNumber: this.hotelForm.value.lpoNumber === '' ? null : this.hotelForm.value.lpoNumber,
        },
        srRooms: roomsData,
      };
      try {
        const hotelRequestReponse = await this.dashboardAsyncApiServices.createHotelServiceRequest( apiUrls.request_hotel_url.createHotel,saveData);

        if (hotelRequestReponse) {
          this.hotelLineId = hotelRequestReponse.srLine?.id;
          this.roomLineId = hotelRequestReponse.srRooms[0]?.roomLineId;
          this.passengerId = hotelRequestReponse.srRooms[0]?.roomPassengersInfo[0]?.id;
          await this.saveSrSummayData();
          await this.onSubmitPolicyQualifyProcessStage1();
          if(this.keys?.includes(this.hotelCbtSaveBtn)){
            this.Online();
           }

          if (hotelRequestReponse.srRooms.length > 0) {
            for (let mainIndex = 0; mainIndex < hotelRequestReponse.srRooms.length; mainIndex++) {
              this.roomsInfo.push(hotelRequestReponse.srRooms[mainIndex]);
              this.roomIds.push(hotelRequestReponse.srRooms[mainIndex].id);
              this.adultsCount.push(hotelRequestReponse.srRooms[mainIndex].roomAdultCount);
              this.childCount.push(hotelRequestReponse.srRooms[mainIndex].roomChildCount);
              for (let i = 0; i < hotelRequestReponse.srRooms[mainIndex].roomPassengersInfo.length; i++) {
                this.passengersData.push(hotelRequestReponse.srRooms[mainIndex].roomPassengersInfo[i]);
              }
            }
          }
          this.addonsData = {
            lineSrId: Number(this.requestId),
            //lineRoomCount: Number(this.hotelForm.value.lineRoomCount),
            lineNoOfNights: this.hotelForm.value.lineNoOfNights,
            hotelLineId: this.hotelLineId,
            //totalData: response,
            //roomId: this.roomLineId,
            //passengerId: this.passengerId,
            roomsInfo: this.roomsInfo,
            roomId: this.roomIds,
            //adultsCount: this.adultsCount,
            //childcount: this.childCount,
            //passengersInfo: this.passengersData
          };
          await this.resourcesAssignment(this.hotelForm.value, this.hotelLineId);

          this.router.navigate(['/dashboard/booking/hotel'], {
            queryParams: { requestId: this.requestId, contactId: this.contactId, hotelLineId: hotelRequestReponse.srLine?.id },
          });
          this.toastr.success('The service request has been sent successfuly !', 'Success');
        }
      } catch (error) {
        this.toastr.error('Oops! Something went wrong  while send the data', 'Error');
      }

    } else {
      this.toastr.error('Please fill the required fields and submit the form', 'Error');
    }
  }
  onUpdateRoomsData() {
    let roomsDummyArray = [];
    let roomArray = this.roomsData().value;
    roomArray.forEach((val) => roomsDummyArray.push(Object.assign({}, val)));
    roomsDummyArray.forEach((element, roomindex) => {
      element.id = element.id;
      element.roomSrId = Number(this.requestId);
      element.roomLineId = element.roomLineId;
      element.roomNumber = roomindex + 1;
      element.roomAddonsRequired = 0;
      element.roomAdultCount = Number(element.roomAdultCount);
      element.roomChildCount = Number(element.roomChildCount);
      element.roomInfantCount = 0;
      //this.totalInfantsData;
      element.roomStatus = element.roomStatus;
      element.roomUpdatedBy = this.authService.getUser();
      element.roomUpdatedDate = this.todaydateAndTimeStamp;
      element.roomUpdatedDevice = this.deviceInfo?.userAgent;
      let childAge;
      element.childAge.forEach((ele, idx) => {
        if (childAge) {
          childAge = childAge + ',' + ele.roomChildAges?.toString();
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
      element.roomsPersonList.forEach((element) => {
        element.passengerSrId = Number(this.requestId);
        element.passengerStatus = 0;
      });
      element.roomPassengersInfo = element.roomsPersonList;
      delete element.roomsPersonList;
      delete element.childAge;
    });
    return roomsDummyArray;
  }
  onUpdateHotelForm() {
    this.isEdit = true;
    this.submitted = true;
    if (this.hotelForm.valid) {
      const roomsData = this.onUpdateRoomsData();
      this.totalAdults();
      this.totalChilderns();
      //this.totalInfants();

      const editData = {
        srLine: {
          id: this.hotelForm.value.id,
          lineUuid: this.hotelForm.value.lineUuid,
          lineStatusId: this.hotelForm.value.lineStatusId,
          lineLatitude: this.hotelForm.value.lineLatitude,
          lineLongitude: this.hotelForm.value.lineLongitude,
          lineRadius: this.hotelForm.value.lineRadius,
          lineSrId: Number(this.requestId),
          lineCountry: this.hotelForm.value.lineCountry,
          lineCity: this.hotelForm.value.lineCity?.name === '' ? null : this.hotelForm.value.lineCity?.name,
          lineLocation:
            this.hotelForm.value.lineLocation?.name === ''
              ? null
              : this.hotelForm.value.lineLocation.name || this.hotelForm.value.lineLocation,
          lineHotelName:
            this.hotelForm.value.lineHotelName?.name === '' ? null : this.hotelForm.value.lineHotelName.name,
          linePropertyType:
            this.hotelForm.value.linePropertyType?.name === '' ? null : this.hotelForm.value.linePropertyType.name,
          lineMealType: this.hotelForm.value.lineMealType?.name === '' ? null : this.hotelForm.value.lineMealType.name,
          lineCheckInDate:
            this.hotelForm.value.lineCheckInDate.year +
            '-' +
            this.padNumber(this.hotelForm.value.lineCheckInDate.month) +
            '-' +
            this.padNumber(this.hotelForm.value.lineCheckInDate.day),
          lineCheckOutDate:
            this.hotelForm.value.lineCheckOutDate.year +
            '-' +
            this.padNumber(this.hotelForm.value.lineCheckOutDate.month) +
            '-' +
            this.padNumber(this.hotelForm.value.lineCheckOutDate.day),
          lineNoOfNights: this.hotelForm.value.lineNoOfNights !== '' ? this.hotelForm.value.lineNoOfNights : null,
          lineRoomCount: Number(this.hotelForm.value.lineRoomCount),
          lineCountryResidency: this.hotelForm.value.lineCountryResidency?.toString(),
          lineNationality: this.hotelForm.value.lineNationality?.toString(),
          lineRatings: this.hotelForm.value.lineRatings,
          lineMarkUpType: this.hotelForm.value.lineMarkUpType,
          lineMarkupAmount: this.hotelForm.value.lineMarkupAmount !== '' ? this.hotelForm.value.lineMarkupAmount : null,
          lineMarkupPercentage:
            this.hotelForm.value.lineMarkupPercentage !== '' ? this.hotelForm.value.lineMarkupPercentage : null,
          lineAdultCount: this.totalAdultsData,
          lineChildCount: this.totalCHDData,
          lineInfantCount: 0,
          lineTotalDays: this.hotelForm.value.lineTotalDays,
          lineSearchType: this.hotelForm.value.lineSearchType === true ? 'geoLocation' : 'Normal',
          lineAddonsRequired: 0,
          lineApis: this.hotelForm.value.lineApis,
          lineUpdatedBy: this.authService.getUser(),
          lineUpdatedDate: this.todaydateAndTimeStamp,
          lineUPdatedDevice: this.deviceInfo?.userAgent,
          lineUpdatedIp: null,
          lpoDate: this.hotelForm.value.lpoDate === '' ? null : this.hotelForm.value.lpoDate,
          lpoAmount: this.hotelForm.value.lpoAmount === '' ? null : this.hotelForm.value.lpoAmount,
          lpoNumber: this.hotelForm.value.lpoNumber === '' ? null : this.hotelForm.value.lpoNumber,
        },
        srRooms: roomsData,
      };

      this.dashboardRequestService.updateHotelServiceRequest(editData, apiUrls.request_hotel_url.updateHotel).pipe(takeUntil(this.ngDestroy$)).subscribe(
        (response: any) => {
          if (response.srLine?.id) {
            this.hotelLineId = response.srLine?.id;
            this.roomLineId = response.srRooms[0]?.roomLineId;
            this.passengerId = response.srRooms[0]?.roomPassengersInfo[0]?.id;
            /*  this.router.navigate(['/dashboard/booking/hotel'], {
               queryParams: { requestId: this.requestId, contactId: this.contactId, hotelLineId: response.srLine?.id },
             }); */
             //this.onSubmitPolicyQualifyProcessStage1();
             if(this.keys?.includes(this.hotelCbtUpdateBtn)){
              this.Online();
             }
            this.toastr.success('The service request updated successfuly !', 'Success');
            if (response.srRooms.length > 0) {
              for (let mainIndex = 0; mainIndex < response.srRooms.length; mainIndex++) {
                this.roomsInfo.push(response.srRooms[mainIndex]);
                this.roomIds.push(response.srRooms[mainIndex].id);
                this.adultsCount.push(response.srRooms[mainIndex].roomAdultCount);
                this.childCount.push(response.srRooms[mainIndex].roomChildCount);
                for (let i = 0; i < response.srRooms[mainIndex].roomPassengersInfo.length; i++) {
                  this.passengersData.push(response.srRooms[mainIndex].roomPassengersInfo[i]);
                }
              }
            }
            this.addonsData = {
              lineSrId: Number(this.requestId),
              //lineRoomCount: Number(this.hotelForm.value.lineRoomCount),
              lineNoOfNights: this.hotelForm.value.lineNoOfNights,
              hotelLineId: this.hotelLineId,
              //totalData: response,
              //roomId: this.roomLineId,
              //passengerId: this.passengerId,
              roomsInfo: this.roomsInfo,
              roomId: this.roomIds,
              //adultsCount: this.adultsCount,
              //childcount: this.childCount,
              //passengersInfo: this.passengersData
            };
            this.reloadComponent();
          } else {
            this.toastr.error(response.message, 'Error');
          }

          //this.cdr.markForCheck();
        },
        (error) => {
          this.toastr.error('Oops! Something went wrong  while send the data', 'Error');
        }
      );
    } else {
      this.toastr.error('Please fill the required fields and submit the form', 'Error');
    }
  }

  Editdelete(j: any, index: any, roomData: any, passengerId: any) {
    if (passengerId?.id) {
      if (confirm(`Are you sure you want to delete`) === true) {
        if (this.roomsPersonListData(j).length > 0) {
          this.roomsPersonListData(j).removeAt(index);
          this.inactiveRooms.push(roomData);
          this.inactivePassenger.push(passengerId);
          this.onInactivePassengerHotelForm();
        }
        if (this.passengersList.length > 0) {
          this.passengersList.splice(index, 1);
          this.paxId = this.passengersList?.map((v) => v);
        }
      }
    } else {
      if (confirm(`Are you sure you want to delete`) === true) {
        if (this.roomsPersonListData(j).length > 0) {
          this.roomsPersonListData(j).removeAt(index);
          this.inactiveRooms.push(roomData);
          this.inactivePassenger.push(passengerId);
        }
        if (this.passengersList.length > 0) {
          this.passengersList.splice(index, 1);
          this.paxId = this.passengersList?.map((v) => v);
        }
      }
    }
  }

  //passngers  inactive method
  RoomsPassengerInactiveData() {
    let roomsDummyArray = [];
    let roomArray = this.inactiveRooms;
    roomArray.forEach((val) => roomsDummyArray.push(Object.assign({}, val)));
    roomsDummyArray.forEach((element, roomindex) => {
      (element.id = element.id), (element.roomSrId = Number(this.requestId)), (element.roomLineId = element.roomLineId);
      element.roomNumber = roomindex + 1;
      element.roomAddonsRequired = 0;
      element.roomAdultCount = Number(element.roomAdultCount);
      element.roomChildCount = Number(element.roomChildCount);
      element.roomInfantCount = 0;
      //element.roomIsDeleted = true;
      //this.totalInfantsData;
      element.roomStatus = element.roomStatus;
      element.roomUpdatedBy = this.authService.getUser();
      element.roomUpdatedDate = this.todaydateAndTimeStamp;
      element.roomUpdatedIp = this.deviceInfo?.userAgent;
      let childAge;
      element.childAge.forEach((ele, idx) => {
        if (childAge) {
          childAge = childAge + ',' + ele.roomChildAges?.toString();
        } else {
          childAge = ele.roomChildAges?.toString();
        }
      });
      element.roomChildAges = childAge;
      element.roomCreatedIp = null;
      //element.roomPassengersInfo = this.paxId[index];
      /*  let roomsPersonList;
       element.roomsPersonList.forEach((element, roomindex, roomPassengerindex) => {
         if (roomsPersonList) {
           roomsPersonList = this.paxId[roomindex][roomPassengerindex]
         }
       }); */
      /* element.roomsPersonList.forEach(element => {
        element.passengerSrId = Number(this.requestId);
        element.passengerStatus = 0;
        element.passengerIsDeleted = true;
      }); */
      this.inactivePassenger.forEach((element) => {
        //element.passengerSrId = Number(this.requestId);
        element.passengerStatus = 0;
        element.passengerIsDeleted = true;
      });
      element.roomPassengersInfo = this.inactivePassenger;
      delete element.roomsPersonList;
      delete element.childAge;
    });

    return roomsDummyArray;
  }

  onInactivePassengerHotelForm() {
    this.isEdit = true;
    this.submitted = true;
    if (this.hotelForm.valid) {
      const roomsData = this.RoomsPassengerInactiveData();
      this.totalAdults();
      this.totalChilderns();
      //this.totalInfants();

      const editData = {
        srLine: {
          id: this.hotelForm.value.id,
          lineStatusId: this.hotelForm.value.lineStatusId,
          lineLatitude: this.hotelForm.value.lineLatitude,
          lineLongitude: this.hotelForm.value.lineLongitude,
          lineRadius: this.hotelForm.value.lineRadius,
          lineSrId: Number(this.requestId),
          lineCountry: this.hotelForm.value.lineCountry,
          lineCity: this.hotelForm.value.lineCity?.name === '' ? null : this.hotelForm.value.lineCity?.name,
          lineLocation:
            this.hotelForm.value.lineLocation?.name === ''
              ? null
              : this.hotelForm.value.lineLocation.name || this.hotelForm.value.lineLocation,
          lineHotelName:
            this.hotelForm.value.lineHotelName?.name === '' ? null : this.hotelForm.value.lineHotelName.name,
          linePropertyType:
            this.hotelForm.value.linePropertyType?.name === '' ? null : this.hotelForm.value.linePropertyType.name,
          lineMealType: this.hotelForm.value.lineMealType?.name === '' ? null : this.hotelForm.value.lineMealType.name,
          lineCheckInDate:
            this.hotelForm.value.lineCheckInDate.year +
            '-' +
            this.padNumber(this.hotelForm.value.lineCheckInDate.month) +
            '-' +
            this.padNumber(this.hotelForm.value.lineCheckInDate.day),
          lineCheckOutDate:
            this.hotelForm.value.lineCheckOutDate.year +
            '-' +
            this.padNumber(this.hotelForm.value.lineCheckOutDate.month) +
            '-' +
            this.padNumber(this.hotelForm.value.lineCheckOutDate.day),
          lineNoOfNights: this.hotelForm.value.lineNoOfNights !== '' ? this.hotelForm.value.lineNoOfNights : null,
          lineRoomCount: Number(this.hotelForm.value.lineRoomCount),
          lineCountryResidency: this.hotelForm.value.lineCountryResidency?.toString(),
          lineNationality: this.hotelForm.value.lineNationality?.toString(),
          lineRatings: this.hotelForm.value.lineRatings,
          lineMarkUpType: this.hotelForm.value.lineMarkUpType,
          lineMarkupAmount: this.hotelForm.value.lineMarkupAmount !== '' ? this.hotelForm.value.lineMarkupAmount : null,
          lineMarkupPercentage:
            this.hotelForm.value.lineMarkupPercentage !== '' ? this.hotelForm.value.lineMarkupPercentage : null,
          lineAdultCount: this.totalAdultsData,
          lineChildCount: this.totalCHDData,
          lineInfantCount: 0,
          lineTotalDays: this.hotelForm.value.lineTotalDays,
          lineSearchType: this.hotelForm.value.lineSearchType === true ? 'geoLocation' : 'Normal',
          lineAddonsRequired: 0,
          lineApis: this.hotelForm.value.lineApis,
          lineUpdatedBy: this.authService.getUser(),
          lineUpdatedDate: this.todaydateAndTimeStamp,
          lineUpdatedDevice: this.deviceInfo?.userAgent,
          lineUpdatedIp: null,
          lineUuid: this.hotelForm.value.lineUuid,
        },
        srRooms: roomsData,
      };

      this.dashboardRequestService
        .updateHotelServiceRequest(editData, apiUrls.request_hotel_url.updateHotel)
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe(
          (response: any) => {
            if (response) {
              this.hotelLineId = response.srLine?.id;
              this.roomLineId = response.srRooms[0]?.roomLineId;
              this.passengerId = response.srRooms[0]?.roomPassengersInfo[0]?.id;
              /*  this.router.navigate(['/dashboard/booking/hotel'], {
               queryParams: { requestId: this.requestId, contactId: this.contactId, hotelLineId: response.srLine?.id },
             }); */
              this.toastr.success('passenger deleted successfuly !', 'Success', { progressBar: true });

              if (response.srRooms.length > 0) {
                for (let mainIndex = 0; mainIndex < response.srRooms.length; mainIndex++) {
                  this.roomsInfo.push(response.srRooms[mainIndex]);
                  this.roomIds.push(response.srRooms[mainIndex].id);
                  this.adultsCount.push(response.srRooms[mainIndex].roomAdultCount);
                  this.childCount.push(response.srRooms[mainIndex].roomChildCount);
                  for (let i = 0; i < response.srRooms[mainIndex].roomPassengersInfo.length; i++) {
                    this.passengersData.push(response.srRooms[mainIndex].roomPassengersInfo[i]);
                  }
                }
              }
              this.addonsData = {
                lineSrId: Number(this.requestId),
                //lineRoomCount: Number(this.hotelForm.value.lineRoomCount),
                lineNoOfNights: this.hotelForm.value.lineNoOfNights,
                hotelLineId: this.hotelLineId,
                //totalData: response,
                //roomId: this.roomLineId,
                //passengerId: this.passengerId,
                roomsInfo: this.roomsInfo,
                roomId: this.roomIds,
                //adultsCount: this.adultsCount,
                //childcount: this.childCount,
                //passengersInfo: this.passengersData
              };
            }
            this.reloadComponent();
            //this.cdr.markForCheck();
          } /* ,
        (error) => {
          this.toastr.error('Oops! Something went wrong  while send the data', 'Error');
        } */
        );
    } else {
      this.toastr.error('Please fill the required fields and submit the form', 'Error');
    }
  }

  //rooms and passngers  inactive method
  RoomsInactiveData() {
    let roomsDummyArray = [];
    let roomArray = this.roomsDeleteflag;
    roomArray.forEach((val) => roomsDummyArray.push(Object.assign({}, val)));
    roomsDummyArray.forEach((element, roomindex) => {
      element.id = element.id;
      element.roomSrId = Number(this.requestId);
      element.roomLineId = element.roomLineId;
      element.roomNumber = roomindex + 1;
      element.roomAddonsRequired = 0;
      element.roomAdultCount = Number(element.roomAdultCount);
      element.roomChildCount = Number(element.roomChildCount);
      element.roomInfantCount = 0;
      element.roomIsDeleted = true;
      //this.totalInfantsData;
      element.roomStatus = element.roomStatus;
      element.roomUpdatedBy = this.authService.getUser();
      element.roomUpdatedDate = this.todaydateAndTimeStamp;
      element.roomUpdatedDevice = this.deviceInfo?.userAgent;
      let childAge;
      element.childAge.forEach((ele, idx) => {
        if (childAge) {
          childAge = childAge + ',' + ele.roomChildAges?.toString();
        } else {
          childAge = ele.roomChildAges?.toString();
        }
      });
      element.roomChildAges = childAge;
      element.roomCreatedIp = null;
      //element.roomPassengersInfo = this.paxId[index];
      /*  let roomsPersonList;
       element.roomsPersonList.forEach((element, roomindex, roomPassengerindex) => {
         if (roomsPersonList) {
           roomsPersonList = this.paxId[roomindex][roomPassengerindex]
         }
       }); */
      element.roomsPersonList.forEach((element) => {
        element.passengerSrId = Number(this.requestId);
        element.passengerStatus = 0;
        element.passengerIsDeleted = true;
      });

      element.roomPassengersInfo = element.roomsPersonList;
      delete element.roomsPersonList;
      delete element.childAge;
    });

    return roomsDummyArray;
  }
  onInactiveRoomHotelForm() {
    this.isEdit = true;
    this.submitted = true;
    if (this.hotelForm.valid) {
      const roomsData = this.RoomsInactiveData();
      this.totalAdults();
      this.totalChilderns();
      //this.totalInfants();

      const editData = {
        srLine: {
          id: this.hotelForm.value.id,
          lineStatusId: this.hotelForm.value.lineStatusId,
          lineUuid: this.hotelForm.value.lineUuid,
          lineLatitude: this.hotelForm.value.lineLatitude,
          lineLongitude: this.hotelForm.value.lineLongitude,
          lineRadius: this.hotelForm.value.lineRadius,
          lineSrId: Number(this.requestId),
          lineCountry: this.hotelForm.value.lineCountry,
          lineCity: this.hotelForm.value.lineCity?.name === '' ? null : this.hotelForm.value.lineCity?.name,
          lineLocation:
            this.hotelForm.value.lineLocation?.name === ''
              ? null
              : this.hotelForm.value.lineLocation.name || this.hotelForm.value.lineLocation,
          lineHotelName:
            this.hotelForm.value.lineHotelName?.name === '' ? null : this.hotelForm.value.lineHotelName.name,
          linePropertyType:
            this.hotelForm.value.linePropertyType?.name === '' ? null : this.hotelForm.value.linePropertyType.name,
          lineMealType: this.hotelForm.value.lineMealType?.name === '' ? null : this.hotelForm.value.lineMealType.name,
          lineCheckInDate:
            this.hotelForm.value.lineCheckInDate.year +
            '-' +
            this.padNumber(this.hotelForm.value.lineCheckInDate.month) +
            '-' +
            this.padNumber(this.hotelForm.value.lineCheckInDate.day),
          lineCheckOutDate:
            this.hotelForm.value.lineCheckOutDate.year +
            '-' +
            this.padNumber(this.hotelForm.value.lineCheckOutDate.month) +
            '-' +
            this.padNumber(this.hotelForm.value.lineCheckOutDate.day),
          lineNoOfNights: this.hotelForm.value.lineNoOfNights !== '' ? this.hotelForm.value.lineNoOfNights : null,
          lineRoomCount: Number(this.hotelForm.value.lineRoomCount),
          lineCountryResidency: this.hotelForm.value.lineCountryResidency?.toString(),
          lineNationality: this.hotelForm.value.lineNationality?.toString(),
          lineRatings: this.hotelForm.value.lineRatings,
          lineMarkUpType: this.hotelForm.value.lineMarkUpType,
          lineMarkupAmount: this.hotelForm.value.lineMarkupAmount !== '' ? this.hotelForm.value.lineMarkupAmount : null,
          lineMarkupPercentage:
            this.hotelForm.value.lineMarkupPercentage !== '' ? this.hotelForm.value.lineMarkupPercentage : null,
          lineAdultCount: this.totalAdultsData,
          lineChildCount: this.totalCHDData,
          lineInfantCount: 0,
          lineTotalDays: this.hotelForm.value.lineTotalDays,
          lineSearchType: this.hotelForm.value.lineSearchType === true ? 'geoLocation' : 'Normal',
          lineAddonsRequired: 0,
          lineApis: this.hotelForm.value.lineApis,
          lineUpdatedBy: this.authService.getUser(),
          lineUpdatedDate: this.todayDate1,
          lineUpdatedDevice: this.deviceInfo?.userAgent,
          lineUpdatedIp: null,
        },
        srRooms: roomsData,
      };

      this.dashboardRequestService
        .updateHotelServiceRequest(editData, apiUrls.request_hotel_url.updateHotel)
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe(
          (response: any) => {
            if (response) {
              this.hotelLineId = response.srLine?.id;
              this.roomLineId = response.srRooms[0]?.roomLineId;
              this.passengerId = response.srRooms[0]?.roomPassengersInfo[0]?.id;
              /*  this.router.navigate(['/dashboard/booking/hotel'], {
               queryParams: { requestId: this.requestId, contactId: this.contactId, hotelLineId: response.srLine?.id },
             }); */
              this.toastr.success('room deleted successfuly !', 'Success');
              if (response.srRooms.length > 0) {
                for (let mainIndex = 0; mainIndex < response.srRooms.length; mainIndex++) {
                  this.roomsInfo.push(response.srRooms[mainIndex]);
                  this.roomIds.push(response.srRooms[mainIndex].id);
                  this.adultsCount.push(response.srRooms[mainIndex].roomAdultCount);
                  this.childCount.push(response.srRooms[mainIndex].roomChildCount);
                  for (let i = 0; i < response.srRooms[mainIndex].roomPassengersInfo.length; i++) {
                    this.passengersData.push(response.srRooms[mainIndex].roomPassengersInfo[i]);
                  }
                }
              }

              this.addonsData = {
                lineSrId: Number(this.requestId),
                //lineRoomCount: Number(this.hotelForm.value.lineRoomCount),
                lineNoOfNights: this.hotelForm.value.lineNoOfNights,
                hotelLineId: this.hotelLineId,
                //totalData: response,
                //roomId: this.roomLineId,
                //passengerId: this.passengerId,
                roomsInfo: this.roomsInfo,
                roomId: this.roomIds,
                //adultsCount: this.adultsCount,
                //childcount: this.childCount,
                //passengersInfo: this.passengersData
              };
              this.reloadComponent();
            }
          } /* ,
        (error) => {
          this.toastr.error('Oops! Something went wrong  while send the data', 'Error');
        } */
        );
    } else {
      this.toastr.error('Please fill the required fields and submit the form', 'Error');
    }
  }

  resetFormData() {
    this.isEdit = false;
    this.submitted = false;
    this.isValidFormSubmitted = true;
    this.hotelForm.reset();
    this.hotelForm.controls.lineRoomCount.setValue('1');
    this.amountInutShow = false;
    this.percentageshow = false;

    //this.flightForm.controls.noofADT.setValue('1');
    //this.flightForm.controls.typeOfFlight.setValue('Non Stop');
    //this.flights().at(0).get('className').setValue('Y');

    this.deleteQueryParameterFromCurrentRoute();
  }
  deleteQueryParameterFromCurrentRoute() {
    const params = { ...this.route.snapshot.queryParams };
    delete params.hotelLineId;
    this.router.navigate([], { queryParams: params });
    /* //same page refresh same routing url
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/dashboard/booking/hotel'], {
      queryParams: { requestId: this.requestId, contactId: this.contactId },
    }); */
  }
  /**
   *
   * selected passengers
   * selectedUsers: Passengers[]
   */
  selectedPassengers() {
    this.SelectedPassengersService.getHotelData()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        for (let r = 0; r < res?.passengers?.length; r++) {
          this.passengersList.push(res?.passengers[r]);
          (this.roomsData().at(res?.roomIndex)?.get('roomsPersonList') as FormArray).push(
            this.fb.group(res?.passengers[r])
          );
          /* this.paxId.push({
          passengerPaxId: res.passengers[r].paxId,
          passengerTitle: res.passengers[r].prefix,
          passengerFirstName: res.passengers[r].firstName,
          passengerLastName: res.passengers[r].lastName,
          passengerMiddleName: null,
          //dob: res.passengers[r].dob,
          passengerNationality: res.passengers[r].nationality?.id === undefined ? null : res.passengers[r].nationality?.id,
          //nationalityName: res.passengers[r].nationality?.name === undefined ? null : res.passengers[r].nationality?.name,
          //issuedCountry: res.passengers[r].issuedCountry?.id === undefined ? null : res.passengers[r].issuedCountry?.id,
          //issuedCountryName: res.passengers[r].issuedCountry?.name === undefined ? null : res.passengers[r].issuedCountry?.name,
          // passport: res.passengers[r].passport,
          passengerEmail: res.passengers[r].email,
          passengerPhone: res.passengers[r].phone,
          passengerType: res.passengers[r].paxType,
          //passportExpiredDate: res.passengers[r].passportExpiredDate,
          //passportIssueDate: res.passengers[r].passportIssueDate,
          passengerStatus: 0,
          passengerCoutry: null,
          passengerRoomId: this.roomLineId,
          passengerLineId: this.hotelLineId,
          passengerSrId: Number(this.requestId),
          passengerCreatedBy: 1,
          passengerCreatedDate: this.todayDate1,
          passengerCreatedDevice: this.deviceInfo?.userAgent,
          passengerCreatedIp: null,
        }); */
          //(this.roomsData().at(res.roomIndex).get('roomsPersonList') as FormArray).push(this.fb.group(this.paxId));
        }
        this.cdr.detectChanges();
      });
  }

  getAddonsResponseData() {
    this.SelectedPassengersService.getAddonsData()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        this.addonsPopData = res;
        this.cdr.detectChanges();
      });
  }
  /**
   * A method to send request for passengers requires roomid from createHotelpassegers API
   * @param response { createHotelpassegers: { roomId: number }
   */
  /* submitServiceRequestPassengers() {
    //const PassengersData = this.paxId;
    let PassengersData: any = [];
    this.paxId.forEach((val) =>
      PassengersData.push(Object.assign({}, val))
    );

    PassengersData.forEach((v, i) => {
      PassengersData[i].passengerPaxId = PassengersData[i].passengerPaxId;
      PassengersData[i].passengerTitle = PassengersData[i].passengerTitle;
      PassengersData[i].passengerFirstName = PassengersData[i].passengerFirstName;
      PassengersData[i].passengerLastName = PassengersData[i].passengerLastName;
      PassengersData[i].passengerMiddleName = null;
      PassengersData[i].passengerNationality = PassengersData[i].passengerNationality;
      PassengersData[i].passengerEmail = PassengersData[i].passengerEmail;
      PassengersData[i].passengerPhone = PassengersData[i].passengerPhone;
      PassengersData[i].passengerType = PassengersData[i].passengerType;
      PassengersData[i].passengerStatus = 0;
      PassengersData[i].passengerCoutry = null;
      PassengersData[i].passengerRoomId = this.roomLineId;
      PassengersData[i].passengerLineId = this.hotelLineId;
      PassengersData[i].passengerSrId = Number(this.requestId);
      PassengersData[i].passengerCreatedBy = 1;
      PassengersData[i].passengerCreatedDate = this.todayDate1;
      PassengersData[i].passengerCreatedDevice = this.deviceInfo?.userAgent;
      PassengersData[i].passengerCreatedIp = null;
    });
    const payLoad = PassengersData;


    this.dashboardRequestService.createHotelPassengers(payLoad, apiUrls.request_hotel_url.createPassengers).subscribe(
      (data: any) => {

        this.toastr.success('The service request has been sent successfuly !', 'Success');
        this.cdr.detectChanges();
      },
      (error) => {
        this.toastr.error('Oops! Something went wrong ', 'Error');
      }
    );
  } */
  /*
   *@params requestId{number},requestLineId{number}
   *Offline and online method for redirect
   */
  offline() {
    let requestId = this.requestId;
    let reqLineId = this.hotelLineId;
    //http://192.178.10.123/srm/offlinehotel?reqId=91062&searchId=583#!
    const offlineUrl = `${environment.RFQREDIRECTOFFLINE}redirect?sr_no=${requestId}&sr_line_no=${reqLineId}&product=hotel&channel=offline`;

    window.open(offlineUrl, '_blank');
  }
  Online() {
    let requestId = this.requestId;
    let reqLineId = this.hotelLineId;
    if(this.keys?.includes(this.hotelCbtUpdateBtn || this.hotelCbtUpdateBtn)){
      const onlineUrl = `${environment.RFQREDIRECTOFFLINE}redirect?sr_no=${requestId}&sr_line_no=${reqLineId}&product=hotel&channel=online`;
      window.open(onlineUrl, '_self');
    }else{
      const onlineUrl = `${environment.RFQREDIRECTOFFLINE}redirect?sr_no=${requestId}&sr_line_no=${reqLineId}&product=hotel&channel=online`;
      window.open(onlineUrl, '_blank');
    }

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
                let data = response;
                data.forEach((element) => {
                  element.name = element?.name + ' , ' + element?.country + '(' + element?.code + ')';
                });
                this.searchResult = [...data];
                if (this.noResults) {
                  this.toastr.warning(`no data found given serach string ${term}`);
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
          : this.searchResult.filter((v) => v.name.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1);
      })
    );

  /**
   * Trigger a call to the API to get the location
   * data for from input
   */
  onSearchCity: OperatorFunction<string, readonly { name }[]> = (text$: Observable<string>) =>
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
                if (this.noCityResults) {
                  this.toastr.warning(`no data found given serach string ${term}`);
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
          : this.searchCityResult.filter((v) => v.name.toLowerCase().indexOf(this.searchCityTerm.toLowerCase()) > -1);
      })
    );

  /**
   * Trigger a call to the API to get the Meals
   * data for from input
   */
  onSearchMeals: OperatorFunction<string, readonly { name }[]> = (text$: Observable<string>) =>
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
                if (this.noMealsResults) {
                  this.toastr.warning(`no data found given serach string ${term}`);
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
          : this.searchMealsResult.filter((v) => v.name.toLowerCase().indexOf(this.searchMealsTerm.toLowerCase()) > -1);
      })
    );

  /**
   * Trigger a call to the API to get the Property
   * data for from input
   */
  onSearchProperty: OperatorFunction<string, readonly { name }[]> = (text$: Observable<string>) =>
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
                if (this.noPropertyResults) {
                  this.toastr.warning(`no data found given serach string ${term}`);
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
          : this.searchPropertyResult.filter(
              (v) => v.name.toLowerCase().indexOf(this.searchPropertyTerm.toLowerCase()) > -1
            );
      })
    );

  /**
   * Trigger a call to the API to get the Hotel Name
   * data for from input
   */
  onSearchHotelNames: OperatorFunction<string, readonly { name }[]> = (text$: Observable<string>) =>
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
                if (this.noHotelNamesResults) {
                  this.toastr.warning(`no data found given serach string ${term}`);
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
          : this.searchHotelNamesResult.filter(
              (v) => v.name.toLowerCase().indexOf(this.searchHotelNamesTerm.toLowerCase()) > -1
            );
      })
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
          lineLocation: $event.item?.name + ' ' + $event.item?.country + '(' + $event.item?.code + ')',
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

  openAddonsModal() {
    const modalRef = this.modalService.open(AddonsModelComponent, { size: 'xl', windowClass: 'my-class' });
    modalRef.componentInstance.name = 'Add Ons';
    modalRef.componentInstance.user = this.addonsData;
    modalRef.componentInstance.patchAddonsData = this.addonsPopData;

    //modalRef.componentInstance.roomIndex = roomIndex;
    //this.cdr.detectChanges();
  }

  submitRFQ() {
    this.totalAdults();
    this.totalChilderns();
    let ResidencyCode;
    let Nationality;
    if (this.countryListLov) {
      ResidencyCode = this.countryListLov?.find((con) => con.id === this.hotelForm.value?.lineCountryResidency);
    }
    if (this.NationalityListLov) {
      Nationality = this.NationalityListLov?.find((con) => con.id === this.hotelForm.value.lineNationality);
    }
    const saveRFQData = {
      //rfqUniqueId: "RFQ-54314-19458-HRFQ211000005",
      rfqSrRequestId: this.requestId,
      rfqSrRequestSearchId: this.hotelLineId,
      rfqType: 'Hotel',
      rfqSrSearchType: 'H',
      rfqSrSearchRequestDestination: this.hotelForm.value.lineLocation?.name
        ? this.hotelForm.value.lineLocation?.name
        : this.hotelForm.value.lineLocation,
      rfqSrSearchRequestData: this.hotelForm.value.lineLocation?.name?.replace(',', '@@@')
        ? this.hotelForm.value.lineLocation?.name?.replace(',', '@@@')
        : this.hotelForm.value.lineLocation?.replace(',', '@@@'),
      rfqSrSearchCheckIn:
        this.hotelForm.value.lineCheckInDate.year +
        '-' +
        this.padNumber(this.hotelForm.value.lineCheckInDate.month) +
        '-' +
        this.padNumber(this.hotelForm.value.lineCheckInDate.day),
      rfqSrSearchCheckOut:
        this.hotelForm.value.lineCheckOutDate.year +
        '-' +
        this.padNumber(this.hotelForm.value.lineCheckOutDate.month) +
        '-' +
        this.padNumber(this.hotelForm.value.lineCheckOutDate.day),
      //rfqSrSearchCheckIn: this.hotelForm.value.lineCheckInDate.year+'-'+this.hotelForm.value.lineCheckInDate.month+'-'+this.hotelForm.value.lineCheckInDate.day,
      //: this.hotelForm.value.lineCheckOutDate.year+'-'+this.hotelForm.value.lineCheckOutDate.month+'-'+this.hotelForm.value.lineCheckOutDate.day,
      rfqSrSearchNights: this.hotelForm.value.lineNoOfNights !== '' ? this.hotelForm.value.lineNoOfNights : null,
      rfqSrSearchRooms: this.hotelForm.value.lineRoomCount,
      rfqSrSearchAdults: this.totalAdultsData,
      rfqSrSearchChild: this.totalCHDData,
      rfqSrSearchResidency: ResidencyCode?.code,
      rfqSrSearchNationality: Nationality?.iso2,
      rfqSrSearchHotelRating: this.hotelForm.value.lineRatings,
      rfqStatus: null,
      rfqAssignedToTeamId: null,
      rfqAssignedToUserId: null,
      createdby: 1,
    };

    this.dashboardRequestService
      .createRFQ(saveRFQData, apiUrls.rfq_url.create)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        const result: ApiResponse = res;
        if (result.status === 200) {
          this.responseRFQId = res.data[0]?.rfqUniqueId;
          //this.toastr.success(result.message, "Success");
          this.redirectRfqurl();
          //this.cdr.detectChanges();
        } else {
          this.toastr.error(result.message, 'Error');
          // this.cdr.detectChanges();
        }
      });
  }
  redirectRfqurl() {
    let requestId = this.requestId;
    let reqLineId = this.hotelLineId;
    let rfqId = this.responseRFQId;
    const redirectRfqUrl = `http://192.178.10.123/srm/rfq?sr_id=${requestId}&search_id=${reqLineId}&rfq=${rfqId}`;
    //alert(redirectRfqUrl);
    window.open(redirectRfqUrl, '_blank');
  }

  //get Hotel lines Data
  FindById(hotelLineId: number, srid: number) {
    this.isEdit = true;
    this.dashboardRequestService
      .findHotelLinesData(hotelLineId, srid, apiUrls.request_hotel_url.getHotelLines)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (updatedata: any) => {
          if (updatedata) {
            this.hotelLinesData = updatedata?.hotelLines[0];
            this.hotelRoomsData = updatedata?.hotelRooms;
            this.roomMembers = updatedata?.hotelPassengers;
            this.addonsPopData = updatedata?.hotelAddons;
            //team setup
            if (updatedata?.srLineTeamInfo) {
              if (updatedata?.srLineTeamInfo?.statusId === null && updatedata?.srLineTeamInfo?.statusName === null) {
              } else {
                const defaultStatus = {
                  statusId: updatedata?.srLineTeamInfo?.statusId,
                  name: updatedata?.srLineTeamInfo?.statusName,
                };
                this.transitionsList.push(defaultStatus);
              }
              if (updatedata?.srLineTeamInfo?.teamInfo?.teamMembers.length > 0) {
                this.teamMembersList = updatedata?.srLineTeamInfo?.teamInfo?.teamMembers;
              }
              if (updatedata?.srLineTeamInfo.teamInfo === null) {
                this.teamList = [];
              } else {
                this.teamList.push(updatedata?.srLineTeamInfo.teamInfo);
                const TEAM_DATA = {
                  defaultStatus: updatedata?.srLineTeamInfo,
                  team: this.teamList,
                  members: this.teamMembersList,
                  transitions: this.transitionsList,
                };

                this.teamDataService.sendData(TEAM_DATA);
              }
            }
            this.addonsData = {
              lineSrId: Number(this.requestId),
              //lineRoomCount: Number(this.hotelForm.value.lineRoomCount),
              lineNoOfNights: this.hotelLinesData?.lineNoOfNights,
              hotelLineId: Number(this.paramsHotelLineId),
              //totalData: response,
              //roomId: this.roomLineId,
              //passengerId: this.passengerId,
              roomsInfo: this.hotelRoomsData,
              //roomId: this.roomIds,
              //adultsCount: this.adultsCount,
              //childcount: this.childCount,
              //passengersInfo: this.passengersData
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
              const FROM_DATE_OBJ = this.hotelLinesData?.lineCheckInDate?.split(['-']);
              const TO_DATE_OBJ = this.hotelLinesData?.lineCheckOutDate?.split(['-']);
              if (FROM_DATE_OBJ && TO_DATE_OBJ) {
                this.fromDate = {
                  year: Number(FROM_DATE_OBJ[0]),
                  month: Number(FROM_DATE_OBJ[1]),
                  day: Number(FROM_DATE_OBJ[2]),
                };
                this.toDate = {
                  year: Number(TO_DATE_OBJ[0]),
                  month: Number(TO_DATE_OBJ[1]),
                  day: Number(TO_DATE_OBJ[2]),
                };
              }

              this.hotelForm.patchValue({
                id: Number(this.hotelLinesData?.id),
                //lineLocation: lineLocation,
                lineCity: city,
                lineHotelName: hotelName,
                linePropertyType: propertyType,
                lineMealType: mealsType,
                lineRoomCount: this.hotelLinesData?.lineRoomCount,
                lineCountry:
                  Number(this.hotelLinesData?.lineCountry) === 0 ? '' : Number(this.hotelLinesData?.lineCountry),

                lineRatings: this.hotelLinesData?.lineRatings,
                lineCountryResidency:
                  Number(this.hotelLinesData?.lineCountryResidency) === 0
                    ? ''
                    : Number(this.hotelLinesData?.lineCountryResidency),
                lineNationality:
                  Number(this.hotelLinesData?.lineNationality) === 0
                    ? ''
                    : Number(this.hotelLinesData?.lineNationality),
                /*   lineCheckInDate: this.datepipe.transform(this.hotelLinesData?.lineCheckInDate, 'yyyy-MM-dd'),
                lineCheckOutDate: this.datepipe.transform(this.hotelLinesData?.lineCheckOutDate, 'yyyy-MM-dd'), */
                lineCheckInDate: {
                  year: Number(FROM_DATE_OBJ[0]),
                  month: Number(FROM_DATE_OBJ[1]),
                  day: Number(FROM_DATE_OBJ[2]),
                },

                lineCheckOutDate: {
                  year: Number(TO_DATE_OBJ[0]),
                  month: Number(TO_DATE_OBJ[1]),
                  day: Number(TO_DATE_OBJ[2]),
                },
                lineNoOfNights: this.hotelLinesData?.lineNoOfNights,
                lineTotalDays: this.hotelLinesData?.lineTotalDays,
                lineMarkUpType: this.hotelLinesData?.lineMarkUpType,
                lineMarkupPercentage: this.hotelLinesData?.lineMarkupPercentage,
                lineMarkupAmount: this.hotelLinesData?.lineMarkupAmount,
                lineUuid: this.hotelLinesData?.lineUuid,
                lpoDate: this.hotelLinesData?.lpoDate,
                lpoAmount: this.hotelLinesData?.lpoAmount,
                lineSearchType: this.hotelLinesData?.lineSearchType === 'geoLocation' ? true : false,
                lineLatitude: this.hotelLinesData?.lineLatitude,
                lineLongitude: this.hotelLinesData?.lineLongitude,
                lpoNumber: this.hotelLinesData?.lpoNumber,
                lineStatusId: updatedata?.srLineTeamInfo?.statusId,
                defaultMemeber: updatedata?.srLineTeamInfo.teamInfo?.teamLeaderId,
              });
              if (this.hotelLinesData?.lineSearchType === 'geoLocation') {
                this.hotelForm.patchValue({
                  lineLocation: this.hotelLinesData?.lineLocation,
                });
              } else {
                this.hotelForm.patchValue({
                  lineLocation: lineLocation,
                });
              }
              this.changeMarkupType(this.hotelLinesData?.lineMarkUpType);
              this.roomsInputDependsOnAddRooms(this.hotelLinesData?.lineRoomCount);

              //this.cdr.detectChanges();
            }

            if (this.hotelRoomsData) {
              for (let i = 0; i < this.hotelRoomsData?.length; i++) {
                /* if (i > 0) {
              const fg = this.createFormGroup();
              this.roomsData().push(fg);
            } */
                this.rowsControls.push({
                  isCollapsedSelectedPersons: true,
                });
                ((this.hotelForm.get('roomsData') as FormArray).at(i) as FormGroup)?.patchValue({
                  roomNumber: this.hotelRoomsData[i]?.roomNumber,
                  roomSrId: Number(this.requestId),
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
                  this.hotelRoomsData[i].roomChildAges =
                    this.hotelRoomsData[i].roomChildAges === 0
                      ? ''
                      : this.hotelRoomsData[i]?.roomChildAges?.toString()?.split(`,`);
                  for (let s = 0; s < this.hotelRoomsData[i].roomChildAges?.length; s++) {
                    this.hotelRoomsData[i].roomChildAges[s] = this.hotelRoomsData[i].roomChildAges[s];
                    total.push(this.hotelRoomsData[i].roomChildAges[s]);
                  }
                  for (let index = 0; index < total?.length; index++) {
                    let element = total[index];
                    this.childAge(i)?.at(index)?.patchValue({
                      roomChildAges: element,
                    });
                  }
                }
                /*  if (this.roomMembers) {
               let groupArr = this.roomMembers.reduce((r, { passengerRoomId }) => {
                 if (!r.some(o => o.passengerRoomId == passengerRoomId)) {
                   r.push({ passengerRoomId, Data: this.roomMembers?.filter(v => v.passengerRoomId == passengerRoomId) });
                 }
                 return r;
               }, []);
               console.log(groupArr);
               //console.log(groupArr[i]?.Data[0]);
               for (let PassengersDataIndex = 0; PassengersDataIndex < groupArr[i]?.Data?.length; PassengersDataIndex++) {
                 let element = groupArr[i]?.Data[PassengersDataIndex];
                 if (this.hotelRoomsData[i].id === groupArr[i]?.Data[PassengersDataIndex]?.passengerRoomId) {
                 }
                 (this.roomsData().at(i).get('roomsPersonList') as FormArray).push(this.fb.group(element));
               }
             } */
              }
              //this.roomsData()
              for (let roomindex = 0; roomindex < this.hotelRoomsData?.length; roomindex++) {
                for (let index = 0; index < this.roomMembers?.length; index++) {
                  if (
                    Number(this.roomsData().at(roomindex)?.value.id) ===
                    Number(this.roomMembers[index]?.passengerRoomId)
                  ) {
                    const element = this.roomMembers[index];
                    (this.roomsData().at(roomindex).get('roomsPersonList') as FormArray).push(this.fb.group(element));
                  }
                }
              }
              this.onSubmitPolicyQualifyProcessStage1();
              //this.cdr.markForCheck();
            }
          }
        },
        (error) => {
          this.toastr.error(
            'Oops! Something went wrong while fetching the Hotel Lines  data please try again',
            'Error'
          );
        }
      );
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

  redirectHotelRFQ() {
    this.submitted = true;
    if (this.hotelForm.valid) {
      const roomsData = this.onUpdateRoomsData();
      this.totalAdults();
      this.totalChilderns();
      //this.totalInfants();
      const saveData = {
        srLine: {
          lineUuid: this.hotelForm.value.lineUuid,
          lineLatitude: this.hotelForm.value.lineLatitude === '' ? null : this.hotelForm.value.lineLatitude,
          lineLongitude: this.hotelForm.value.lineLongitude === '' ? null : this.hotelForm.value.lineLongitude,
          lineRadius: this.hotelForm.value.lineRadius === '' ? null : this.hotelForm.value.lineRadius,
          lineSrId: Number(this.requestId),
          lineSrLineId: Number(this.hotelLineId),
          lineCountry: this.hotelForm.value.lineCountry === '' ? null : this.hotelForm.value.lineCountry,
          lineCity: this.hotelForm.value.lineCity?.name ? this.hotelForm.value.lineCity?.name : null,
          lineLocation: this.hotelForm.value.lineLocation?.name
            ? this.hotelForm.value.lineLocation?.name
            : this.hotelForm.value.lineLocation,
          //lineLocation: this.hotelForm.value.lineLocation?.name ? this.hotelForm.value.lineLocation?.name : null,
          lineHotelName: this.hotelForm.value.lineHotelName?.name ? this.hotelForm.value.lineHotelName?.name : null,
          linePropertyType: this.hotelForm.value.linePropertyType?.name
            ? this.hotelForm.value.linePropertyType?.name
            : null,
          lineMealType: this.hotelForm.value.lineMealType?.name ? this.hotelForm.value.lineMealType?.name : null,
          //lineCheckInDate: this.hotelForm.value.lineCheckInDate.year+'-'+this.hotelForm.value.lineCheckInDate.month+'-'+this.hotelForm.value.lineCheckInDate.day,
          //lineCheckOutDate: this.hotelForm.value.lineCheckOutDate.year+'-'+this.hotelForm.value.lineCheckOutDate.month+'-'+this.hotelForm.value.lineCheckOutDate.day,
          lineCheckInDate:
            this.hotelForm.value.lineCheckInDate.year +
            '-' +
            this.padNumber(this.hotelForm.value.lineCheckInDate.month) +
            '-' +
            this.padNumber(this.hotelForm.value.lineCheckInDate.day),
          lineCheckOutDate:
            this.hotelForm.value.lineCheckOutDate.year +
            '-' +
            this.padNumber(this.hotelForm.value.lineCheckOutDate.month) +
            '-' +
            this.padNumber(this.hotelForm.value.lineCheckOutDate.day),
          /* lineCheckInDate: this.hotelForm.value.lineCheckInDate,
          lineCheckOutDate: this.hotelForm.value.lineCheckOutDate, */
          lineNoOfNights: this.hotelForm.value.lineNoOfNights !== '' ? this.hotelForm.value.lineNoOfNights : 0,
          lineRoomCount: this.hotelForm.value.lineRoomCount === '' ? 0 : Number(this.hotelForm.value.lineRoomCount),
          lineCountryResidency:
            this.hotelForm.value.lineCountryResidency === ''
              ? null
              : this.hotelForm.value.lineCountryResidency?.toString(),
          lineNationality:
            this.hotelForm.value.lineNationality === '' ? null : this.hotelForm.value.lineNationality?.toString(),
          lineRatings:
            this.hotelForm.value.lineRatings === '' || this.hotelForm.value.lineRatings === null
              ? 0
              : this.hotelForm.value.lineRatings,
          lineMarkUpType: this.hotelForm.value.lineMarkUpType,
          lineMarkupAmount: this.hotelForm.value.lineMarkupAmount !== '' ? this.hotelForm.value.lineMarkupAmount : null,
          lineMarkupPercentage:
            this.hotelForm.value.lineMarkupPercentage !== '' ? this.hotelForm.value.lineMarkupPercentage : null,
          lineAdultCount: this.totalAdultsData,
          lineChildCount: this.totalCHDData,
          lineInfantCount: 0,
          lineTotalDays: this.hotelForm.value.lineTotalDays !== '' ? this.hotelForm.value.lineTotalDays : 0,
          lineSearchType: this.hotelForm.value.lineSearchType === true ? 'geoLocation' : 'Normal',
          lineAddonsRequired: 0,
          lineApis: this.hotelForm.value.lineApis,
          lineCreatedBy: this.authService.getUser(),
          lineCreatedDate: this.todaydateAndTimeStamp,
          lineCreatedDevice: this.deviceInfo?.userAgent,
          lineCreatedIp: null,
          lpoDate:
            this.hotelForm.value.lpoDate === '' || this.hotelForm.value.lpoDate === null
              ? null
              : this.hotelForm.value.lpoDate,
          lpoAmount:
            this.hotelForm.value.lpoAmount === '' || this.hotelForm.value.lpoAmount === null
              ? 0.0
              : this.hotelForm.value.lpoAmount,
          lpoNumber:
            this.hotelForm.value.lpoNumber === '' || this.hotelForm.value.lpoNumber === null
              ? null
              : this.hotelForm.value.lpoNumber,
        },
        srRooms: roomsData,
        supplierRelation: [],
      };

      this.rfqServices
        .createRFQHotel(saveData, RFQURLS.HOTEL_RFQ_LIST.createRfqRequest, 0)
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe(
          (response: any) => {
            if (response) {
              //this.hotelLineId = response.srLine?.id;
              this.roomLineId = response.srRooms[0]?.roomLineId;
              this.passengerId = response.srRooms[0]?.roomPassengersInfo[0]?.id;
              if (this.requestId && this.contactId && this.hotelLineId && response.srLine?.id) {

                const queryParams = {
                  requestId: this.requestId,
                  contactId: this.contactId,
                  srLine: this.hotelLineId,
                  hotelRfq: response.srLine?.id,
                };
                const HOTEL_RFQ_URL = this.router.createUrlTree(['/dashboard/rfq/hotel'], { queryParams }).toString();
                window.open(HOTEL_RFQ_URL, '_blank');

              }
            }
            //this.toastr.success('The service request has been sent successfuly !', 'Success');
            //this.cdr.detectChanges();
          },
          (error) => {
            this.toastr.error('Oops! Something went wrong  while send the data', 'Error');
          }
        );
    } else {
      this.toastr.error('Please fill the required fields and submit the form', 'Error');
    }
  }

  getProductType() {
    this.masterDataService
      .getGenMasterDataByTableName('master_products')
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((data) => {
        if (data) {
          //this.productList = data;
          // this.cdr.detectChanges();
          const productName = 'Hotel';
          this.productList = data?.find((con) => con.name === productName);
          //this.cdr.detectChanges();
        } else {
          this.toastr.error(
            'Oops! Something went wrong while fetching the Product type data please try again ',
            'Error'
          );
        }
      });
  }

  getRequestContactDetails() {
    //const requestLineId = this.route.snapshot.queryParams.srLineId;
    this.srSummaryData
      .getData()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        this.contactDetails = res;
      });
  }
  saveSrSummayData() {
    if (this.contactDetails && this.hotelLineId) {
      const total: number =
        Number(this.hotelForm.value.roomsData[0]?.roomAdultCount) +
        Number(this.hotelForm.value.roomsData[0]?.roomChildCount);
      const SUMMARYDATA = {
        contactEmail: this.contactDetails?.contact?.primaryEmail,
        contactId: this.contactDetails?.contact?.id,
        contactName: this.contactDetails?.contact?.firstName + ' ' + this.contactDetails?.contact?.lastName,
        contactPhone: this.contactDetails?.contact?.primaryPhoneNumber,
        deviceInfo: this.deviceInfo?.userAgent,
        loggedInUserId: this.authService.getUser(),
        passengerCount: Number(total),
        productId: this.productList?.id === undefined || this.productList?.id === null ? 2 : this.productList?.id,
        serviceRequestId: this?.requestId,
        serviceRequestLineId: this.hotelLineId,
        //travelDateOrCheckInDate: this.hotelForm.value.lineCheckInDate,
        travelDateOrCheckInDate:
          this.hotelForm.value.lineCheckInDate.year +
          '-' +
          this.padNumber(this.hotelForm.value.lineCheckInDate.month) +
          '-' +
          this.padNumber(this.hotelForm.value.lineCheckInDate.day),
        //lineCheckInDate: this.hotelForm.value.lineCheckInDate.year+'-'+this.padNumber(this.hotelForm.value.lineCheckInDate.month)+'-'+this.padNumber(this.hotelForm.value.lineCheckInDate.day),
        //lineCheckOutDate: this.hotelForm.value.lineCheckOutDate.year+'-'+this.padNumber(this.hotelForm.value.lineCheckOutDate.month)+'-'+this.padNumber(this.hotelForm.value.lineCheckOutDate.day),
      };
      this.dashboardRequestService.saveSrSummary(SUMMARYDATA, SrSummaryData.SAVESRSUMMARYDATA).pipe(takeUntil(this.ngDestroy$)).subscribe((res) => {
        const result: ApiResponse = res;
        if (result.status === 200) {
        } else if (result.message === ' ') {
          this.toastr.error('Oops! Something went wrong  while send the sr summary data please try again', 'Error', {
            progressBar: true,
          });
        } else {
          this.toastr.error(result.message, 'Error', { progressBar: true });
        }
      });
    }
  }



  resourcesAssignment(formData, requestLineId) {
    const HOTELFORMDATA = formData;
    const customerDetailsBySrId = this.authService.getCustomerType();
    if (HOTELFORMDATA) {
      //lineAdultCount: this.totalAdultsData,
      //lineChildCount: this.totalCHDData,
      const sendData = {
        productId: this.productList?.id,
        bookingTypeId: 1,
        cabinClassId: 0,
        paxCount: Number(this.totalAdultsData + this.totalCHDData),
        typeOfJourneyId: 0,
        hotelNoOfDays: parseInt(HOTELFORMDATA?.lineTotalDays),
        hotelDestination: HOTELFORMDATA?.lineLocation?.name,
        hotelRoomsCount: parseInt(HOTELFORMDATA?.lineRoomCount),
        hotelNightsCount: parseInt(HOTELFORMDATA?.lineNoOfNights),
        srId: Number(this.requestId),
        srLineId: requestLineId,
        budgetAmount: 0,
        companyId: this.authService.getUserOrganization(),
        locationId: this.authService.getUserLocation(),
        costCenterId: this.authService.getUserCostCenter(),
        userId: this.authService.getUser(),
        customerId:customerDetailsBySrId?.customerId,
        customerCategoryId: customerDetailsBySrId?.custcategoryId,
        customerRatingId: customerDetailsBySrId?.customerRating,
        customerTypeId: customerDetailsBySrId?.customerTypeId,
        ticketType: 'ticket',
        segments: [],
      };
      this.dashboardRequestService
        .resourcesAssignment(sendData, apiUrls.sr_assignment.flightassignment)
        .pipe(takeUntil(this.ngDestroy$)).subscribe((res) => {
          const result: ApiResponse = res;
          if (result.status === 200) {
          } else {
            if (result.message === '') {
              this.toastr.error('Oops! Something went wrong  Please try again', 'Error');
              this.cdr.markForCheck();
            } else {
              this.toastr.error(result.message, 'Error');
              this.cdr.markForCheck();
            }
          }
        });
    }
  }



  reloadComponent() {
    const requestId = this.route.snapshot.queryParams.requestId;
    const requestLineId = this.route.snapshot.queryParams.hotelLineId;
    const contactId = this.route.snapshot.queryParams.contactId;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([`/dashboard/booking/hotel`], {
      queryParams: { requestId: requestId, contactId: contactId, hotelLineId: requestLineId },
    });
  }

  openSm(content) {
    this.modalService.open(content, { size: 'lg' });
  }

  onDateSelection(date: NgbDate, datepicker: any) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
      if (this.fromDate) {
        this.hotelForm.patchValue({
          lineCheckInDate: this.fromDate,
        });
      }
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
      if (this.toDate) {
        this.hotelForm.patchValue({
          lineCheckOutDate: this.toDate,
        });
      }
      datepicker.close();
    } else {
      this.toDate = null;
      this.fromDate = null;
      this.hotelForm.patchValue({
        lineCheckInDate: this.fromDate,
        lineCheckOutDate: this.toDate,
      });
    }
    if (this.fromDate && this.toDate) {
      this.CheckInDateAndCheckOutDateCalculate(this.fromDate, this.toDate);
    }
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.dateFormatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }

  padNumber(value: number | null) {
    if (!isNaN(value) && value !== null) {
      return `0${value}`.slice(-2);
    } else {
      return '';
    }
  }

  handleAddressChange(address: any) {
    if (address) {
      const userAddress = address.name + ',' + address.formatted_address;
      // const userAddress = address.name;
      const userLatitude = address.geometry.location.lat();
      const userLongitude = address.geometry.location.lng();
      if (userAddress && userLatitude && userLongitude) {
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
    }
  }



  onSubmitPolicyQualifyProcessStage1() {
    const customerDetailsBySrId = this.authService.getCustomerType();
    const ON_SAVE_POLICY = {
      productId:
        this.productList?.id === '' || this.productList?.id === null || this.productList === undefined
          ? 2
          : this.productList?.id,
      customerId: customerDetailsBySrId?.customerId,
      bookingDate: this.hotelForm.value.lineCheckInDate.year +
      '-' +
      this.padNumber(this.hotelForm.value.lineCheckInDate.month) +
      '-' +
      this.padNumber(this.hotelForm.value.lineCheckInDate.day),
      tktTypeId: 1,
      routes: [],
    };

    this.dashboardRequestService
      .policyTemplateProcessStage1(apiUrls.policy.policyTemplateProcessStage1, ON_SAVE_POLICY)
      .pipe(takeUntil(this.ngDestroy$)).subscribe((res: ApiResponse) => {
        const result = res;
        if (result.status == 200) {

          this.policyList = result.data;
          this.cdr.markForCheck();
        } else {
          if (result.message == '') {
            this.toastr.error('opps someting went wrong please try agagin policy request', 'Error', {
              progressBar: true,
            });
            this.cdr.markForCheck();
          } else {
            this.toastr.error(result.message, 'Error', { progressBar: true });
            this.cdr.markForCheck();
          }
        }
      });
  }

  trackByFn(index, item) {
    return index;
  }
openPolicyPopup(){
  const modalRef = this.modalService.open(PolicyQualifyProcessStage1Component, { size: 'xl' });
  modalRef.componentInstance.name = 'Policy';
  modalRef.componentInstance.policyList =  this.policyList;
}
  getQueryParams(){
     /*get The params and call the find by contact service */
     this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param && param.contactId && param.requestId) {
        this.contactId = param.contactId;
        this.requestId = param.requestId;

        if (param && param.requestId) {
          this.requestId = param.requestId;

        }
      }
      /* if (this.contactId) {
        this.getContactDetails(this.contactId);
      } */
      //save data after then addthe hotelline id params then call line service
      if (param && param.hotelLineId) {
        this.paramsHotelLineId = param.hotelLineId;
        this.hotelLineId = param.hotelLineId;
        const srId = Number(this.requestId);
        if (this.paramsHotelLineId && srId) {
          this.FindById(this.paramsHotelLineId, srId);
        }
      }
    });
    this.contactDetails=this.authService.getRequestDetails();
  }
  ngOnInit(): void {
    //same page routing
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.keys = this.authService.getPageKeys();
    this.initializeForm();
    this.getRequestContactDetails();
    this.getProductType();
    this.getCountry();
    this.getHotelRating();
    this.getNationalityLov();
    this.epicFunction();
    this.changeMarkupType('P');
    this.getQueryParams();
  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
