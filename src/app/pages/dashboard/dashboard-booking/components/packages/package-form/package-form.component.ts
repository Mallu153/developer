import { DatePipe, formatDate } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NgbCalendar,
  NgbDate,
  NgbModal,
  NgbTimeAdapter,
  NgbTypeahead,
  NgbTypeaheadSelectItemEvent,
} from '@ng-bootstrap/ng-bootstrap';
import { Passengers } from 'app/pages/dashboard/dashboard-request/model/selectedPassengers';
import { DashboardRequestService } from 'app/pages/dashboard/dashboard-request/services/dashboard-request.service';
import { NgbTimeStringAdapter } from 'app/shared/helpers/ngb-time-string-adapter';
import { Airline } from 'app/shared/models/airline-response';
import { AirportSearchResponse } from 'app/shared/models/airport-search-response';
import { MasterDataService } from 'app/shared/services/master-data.service';
import { ToastrService } from 'ngx-toastr';
import { concat, forkJoin, Observable, of, OperatorFunction, Subject, Subscription } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
  catchError,
  takeUntil,
  filter,
  share,
  map,
} from 'rxjs/operators';

import { SrSegmentHeader } from 'app/pages/dashboard/dashboard-request/model/service-segment';

import { Title } from '@angular/platform-browser';
import { ApiResponse } from '../../../../dashboard-request/model/api-response';
import * as apiUrls from '../../../../dashboard-request/url-constants/url-constants';
import { FlightAddons } from 'app/shared/models/flightAddons-response';
import { AddPassengerFormComponent } from '../../add-passenger-form/add-passenger-form.component';
import { AuthService } from 'app/shared/auth/auth.service';
import { RfqService } from 'app/pages/dashboard/rfq/rfq-services/rfq.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { SrSummaryDataService } from '../../../share-data-services/srsummarydata.service';
import { TeamDataDataService } from '../../../share-data-services/team-data.service';
import { SelectedPassengersService } from '../../../share-data-services/selected-passenger.service';
import { ConfirmedValidator } from 'app/shared/directives/confirmed.validator';
import { environment } from 'environments/environment';
import { ExplodeFlightDetalsComponent } from '../../flight-form/explode-flight-detals/explode-flight-detals.component';
import { AmendmentsService } from 'app/pages/dashboard/amendments/amendments.service';
import { AMENDMENTS_HOTEL_URL } from 'app/pages/dashboard/amendments/amendments.constants';
import { HotelName } from 'app/pages/dashboard/amendments/amendments.model';
import { ProductsDataService } from '../../../share-data-services/products-data';
import { Products } from 'app/pages/dashboard/dashboard-request/model/products-data';
import swal from 'sweetalert2';
import { PackageDynamicFormComponent } from '../package-dynamic-form/package-dynamic-form.component';
import { PERMISSION_KEYS } from 'app/shared/data/app-premission-key';
import { ANX_API, ANX_PAX_API } from 'app/pages/dashboard/service-request/constants/anx-api';
import { ServiceTypeService } from 'app/shared/services/service-type.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-package-form',
  templateUrl: './package-form.component.html',
  styleUrls: ['./package-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,

  providers: [{ provide: NgbTimeAdapter, useClass: NgbTimeStringAdapter }],
})
export class PackageFormComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  pageTitle = 'Holiday Packages Request';
  flightForm: FormGroup;
  tripTypeId = '11';
  typeOfFlight = 'Non Stop';
  submitted = false;
  // array purpose used
  isValidFormSubmitted = null;
  isEdit = false;
  public isCollapsed = true;
  public isCollapsed1 = true;
  public isCollapsedpoints = true;
  //more button
  isCollapsedMore = true;
  rowsControlsForMultiCity: any = [
    {
      isCollapsed: true,
    },
  ];

  //Depature clicked
  rowsControlsForDepature: any = [
    {
      isCollapsedDepature: true,
    },
  ];
  rowsControlsForreturn: any = [
    {
      isCollapsedreturn: true,
    },
  ];
  //flexfields
  rowsControlsFlexForm: any = [
    {
      isCollapsedFlexFrom: true,
    },
  ];
  rowsControlsFlexTo: any = [
    {
      isCollapsedFlexTo: true,
    },
  ];
  rowsControlsFlexClass: any = [
    {
      isCollapsedFlexClass: true,
    },
  ];
  rowsControlsFlexAirline: any = [
    {
      isCollapsedFlexAirline: true,
    },
  ];

  public isCollapsedtypeOfFlightsFlex = true;
  // Global variables to display whether is loading or failed to load the data
  noResults: boolean;
  searchTerm: string;
  noAirLineResults: boolean;
  searchAirLineResult: AirportSearchResponse[];
  searchMulitipleResult: AirportSearchResponse[];
  searchAirLineTerm: string;
  searchMulitipleTerm: string;
  noMulitipleResults: boolean;
  searchResult: AirportSearchResponse[];
  // selectedTransitPointItems to store elements from the transit point input
  selectedTransitPointItems = [];
  // selectedExludedPoints to store elements from the transit point input
  selectedExludedPoints = [];
  // selectedFlexFromItems to store elements from the transit point input
  selectedFlexFromItems: any[] = [];
  // selectedFlexToItems to store elements from the transit point input
  selectedFlexToItems = [];
  // selectedFlexToItems to store elements from the transit point input
  selectedFlexAirLineItems = [];
  //requestId get the params
  requestId: number;
  srLineId: number;
  contactid: number;
  updateContactdata: any[] = [];
  // create service request line id
  requestLineId: number;
  requestSegmentId: number;
  //pax ids for array
  paxId: any = [];
  formatter = (airport: AirportSearchResponse) => airport.code;
  //formatterFlexFrom = (airport: AirportSearchResponse) => airport.code;
  formatterAirline = (airport: Airline) => airport.shortCode2Digit;
  @ViewChild('typeaheadInstance') typeaheadInstance: NgbTypeahead;
  @ViewChild('transitPointInput') transitPointInput;
  @ViewChild('flexFromInput') flexFromInput;
  @ViewChild('roomnameInput') roomnameInput;
  @ViewChild('roomtypeInput') roomtypeInput;
  @ViewChild('flexToInput') flexToInput;
  @ViewChild('flexAirlineInput') flexAirlineInput;
  @ViewChild('excludedPointInput') excludedPointInput;
  // typeFlight check round
  initialRound = false;
  //lov
  masterClassList: any;
  masterRbdList: any;
  masterEPList: any;
  masterPaxTypeList: any;
  hotelRatingListLov: any = [];
  //passengers list
  passengersList: Passengers[] = [];
  holidayPassengers: any[] = [];
  //selected persons
  public isCollapsedSelectedPersons = true;
  //today date
  todayDate = new Date();
  todayDate1: string;
  todaydateAndTimeStamp: string;
  /*
   *online and offline buttons shows the service submit after its appers
   */
  initialButtons = false;
  updatebutton = false;
  savebutton = true;
  activeId: number; // Basic Navs
  //pagination
  page = 1;
  pageSize = 10;
  collectionSize: number;
  //service line data
  serviceLinepage = 1;
  serviceLinepageSize = 10;
  //checkbox array
  flexStops: any = ['Non Stop', 'Direct', 'Connecting 1 Stop', 'Connecting  2 Stop', 'Connecting 3 or more stops']; //displaying list of checkbox
  authorizedAux: any[];
  public nationality: any;
  public issuedCountry: any;
  public paxType: any;
  //update
  updateDataservicerequestLine: any;
  updateDataSegmentData: any;
  passengers: any;
  //pacth formcode
  formCode: any;
  //added lines data
  SrRequestLineApiResponse: any;
  //flight addons
  public flightAddonsCollapsed = true;
  noFlightAddonsResults: boolean;
  searchFlightAddonsTerm: string;
  searchflightAddonsResult: FlightAddons[];
  flightAddonsformatter = (flightAddons: FlightAddons) => flightAddons.name;
  addonsRoutes: any[] = [];
  addonsPassengers: any[] = [];
  //update respes
  serviceRequestSegmentRespones: any;
  serviceRequestLineRespones: any;
  public flightsDisplayData: any[] = [];

  private productList: any;
  public teamList: any[] = [];
  public teamMembersList: any;
  public assignmentStatusName: string;
  public transitionsList: any[] = [];
  public isLPODeatilsCollapsed = true;
  //ipaddress
  deviceInfo = null;
  isDesktopDevice: boolean;
  isTablet: boolean;
  isMobile: boolean;

  contactDetails: any = {};

  displayMonths = 2;
  navigation = 'arrow';
  price_token_data: any;
  checkinToday: NgbDate | null = null;

  rowsControlsLPODetails: any = [
    {
      isCollapsedLpo: true,
    },
  ];
  rowsControlsAddonsDetails: any = [
    {
      isCollapsedAddons: true,
    },
  ];
  rowsControlsPassengersDetails: any = [
    {
      isCollapsedPassengers: true,
    },
  ];

  rowsControlsAttractions: any = [
    {
      isCollapsedAttractions: true,
    },
  ];
  // Attractions autosuggestions
  attractionsData: any[] = [];
  attractionsDays: any[] = [];

  /*  @ViewChild("attractionstypeaheadInstance") attractionstypeaheadInstance: NgbTypeahead;
  noAttractionsResults: boolean;
  searchAttractionsTerm: string;
  searchAttractionsResult: AttractionsResponse[];
  attractionsFormatter = (attractions: AttractionsResponse) => attractions.activityName;
  attractionsCity:string;
  attractionsCountry:string; */

  //room name
  roomName$: Observable<any>;
  roomNameLoading = false;
  roomNameLoadingInput$ = new Subject<string>();
  minLengthRoomNameTerm = 3;
  //room type
  roomType$: Observable<any>;
  roomTypeLoading = false;
  roomTypeLoadingInput$ = new Subject<string>();
  minLengthRoomTypeTerm = 3;

  //hotel selection
  hideme = [];
  hotelDates = [];
  hotelNamesBasedOnSegment = [];
  //hotel Name  Global variables to display whether is loading or failed to load the data
  @ViewChild('hotelnametypeaheadInstance') hotelnametypeaheadInstance: NgbTypeahead;
  noHotelNameResults: boolean;
  searchHotelNameTerm: string;
  searchHotelNameResult: HotelName[];
  hotelNameFormatter = (hotel: HotelName) => hotel.hotelName;

  hidemePackage: boolean[] = [];
  rowsControlsPackage: any = [
    {
      isCollapsedPackage: false,
    },
  ];
  productsAvailability: boolean = false;
  newRequestNo: number;
  pkgAccOpenCloseID: string = 'Collapse All';

  //forex tab lov
  forexCurrency = [];
  forexMOP = [];


  dynamicJson: any;
  formDataDynamicFormCarRental:any=[];
  formDataDynamicFormCarRentalPax:any=[];
  viewCarRentalForm:any=[];
  active: number = 0;


  PackageDetailedInfo: any = [];
  flight_data: any[] = [];
  hotel_data: any[] = [];
  hotel_pax_info: any[] = [];
  attractions_data: any[] = [];
  anxRequestData = [];
  anxPaxRequestData = [];
  hotelAddons = [];
  anxAdt: number = 0;
  anxChd: number = 0;
  anxInf: number = 0;

 requestCreationLoading:boolean=false;

  /**
   *
   *
   * holiday package form elements premissions
   */
  keys = [];

  holidayPackagePaxAdd= PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_PAX_ADD;
  hotelTab= PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_HOTEL_TAB;
  attractionsTab= PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_ATTRACTIONS_TAB;
  addonsTab= PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_ADDONS_INCLUSIONS_TAB;
  lpoTab= PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_LPO_TAB;
  flightExtraTab= PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_FLIGHT_EXTRA_TAB;
  visaTab= PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_VISA_TAB;
  insuranceTab= PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_INSURANCE_TAB;
  exclusionsTab= PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_EXCLUSIONS_TAB;
  forexTab= PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_FOREX_TAB;
  carRentalTab= PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_CAR_RENTAL_TAB;

  holidayPackageFlexFrom= PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_FLEX_FROM;
  holidayPackageFlexTo= PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_FLEX_TO;
  holidayPackageFlexDepature= PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_FLEX_DEPATURE;
  holidayPackageFlexClass= PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_FLEX_CLASS;
  holidayPackageFlexAirline=PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_FLEX_AIRLINE;


  /**
   *
   *
   *  hotel buttons premissions
   */
  holidayPackageSaveBtn = PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_SAVE_BTN;
  holidayPackageUpdateBtn = PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_UPDATE_BTN;
  holidayPackageConfirmBtn = PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_CONFIRM_BTN;



  constructor(
    private fb: FormBuilder,
    public masterDataService: MasterDataService,
    private route: ActivatedRoute,
    private router: Router,
    private toastrService: ToastrService,
    private dashboardRequestService: DashboardRequestService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private SelectedPassengersService: SelectedPassengersService,
    private datepipe: DatePipe,
    private titleService: Title,
    private rfqFlightServices: RfqService,
    private authService: AuthService,
    private srSummaryData: SrSummaryDataService,
    private deviceService: DeviceDetectorService,
    private teamDataService: TeamDataDataService,
    private calendar: NgbCalendar,
    private amendmentsServices: AmendmentsService,
    private productsDataService: ProductsDataService,
    private serviceTypeService: ServiceTypeService,
    private spinnerService: NgxSpinnerService,
  ) {
    this.dynamicJson = {};
    this.checkinToday = calendar.getToday();
    this.todayDate1 = this.datepipe.transform(this.todayDate, 'yyyy-MM-dd');
    this.todaydateAndTimeStamp = formatDate(this.todayDate, 'yyyy-MM-ddThh:mm:ss', 'en-US', '+0530');
    this.titleService.setTitle('Holiday Packages Request');
    //passengers list
    this.selectedPassengers();
    this.getProductsData();
  }

  epicFunction() {
    this.deviceInfo = this.deviceService.getDeviceInfo();
    this.isMobile = this.deviceService.isMobile();
    this.isTablet = this.deviceService.isTablet();
    this.isDesktopDevice = this.deviceService.isDesktop();
  }
  /**
   * Open person modal component to add more people to the form
   */
  openPersonModal(mainIndex: number) {
    // AddPersonModalComponent
    const modalRef = this.modalService.open(AddPassengerFormComponent, { size: 'xl', windowClass: 'my-class' });
    modalRef.componentInstance.name = 'Add Person';
    modalRef.componentInstance.flightIndex = mainIndex;
    modalRef.componentInstance.attractionsType = 'package';
    modalRef.componentInstance.attractionsPaxCount = this.flights().at(mainIndex).value;
  }

  onSelectedItemsFlex($event: NgbTypeaheadSelectItemEvent, type: string, index: number) {
    $event.preventDefault();
    if ($event && $event.item && $event.item.code && type === 'flexFrom') {
      if (typeof this.selectedFlexFromItems[index] === 'undefined') {
        // does not exist
        if (this.selectedFlexFromItems?.length === 0) {
          if (index === 0) {
            this.selectedFlexFromItems.push([]);
            this.selectedFlexFromItems[index].push($event.item.code);
            this.flexFromInput.nativeElement.value = '';
          } else {
            for (let k = 0; k <= index + 1; k++) {
              this.selectedFlexFromItems.push([]);
              if (index === k) {
                this.selectedFlexFromItems[index].push($event.item.code);
                this.flexFromInput.nativeElement.value = '';
              }
            }
          }
        } else {
          if (index === 0) {
            this.selectedFlexFromItems.push([]);
            this.selectedFlexFromItems[index].push($event.item.code);
            this.flexFromInput.nativeElement.value = '';
          } else {
            for (let k = 0; k <= index + 1; k++) {
              this.selectedFlexFromItems.push([]);
              if (index === k) {
                this.selectedFlexFromItems[index].push($event.item.code);
                this.flexFromInput.nativeElement.value = '';
              }
            }
          }
        }
      } else {
        // does exist
        this.selectedFlexFromItems[index].push($event.item.code);
        this.flexFromInput.nativeElement.value = '';
      }
    }
  }

  onSelectedItemsFlexTo($event: NgbTypeaheadSelectItemEvent, type: string, index: number) {
    $event.preventDefault();
    if ($event && $event.item && $event.item.code && type === 'flexTo') {
      if (typeof this.selectedFlexToItems[index] === 'undefined') {
        // does not exist
        if (this.selectedFlexToItems?.length === 0) {
          if (index === 0) {
            this.selectedFlexToItems.push([]);
            this.selectedFlexToItems[index].push($event.item.code);
            this.flexToInput.nativeElement.value = '';
          } else {
            for (let k = 0; k <= index + 1; k++) {
              this.selectedFlexToItems.push([]);
              if (index === k) {
                this.selectedFlexToItems[index].push($event.item.code);
                this.flexToInput.nativeElement.value = '';
              }
            }
          }
        } else {
          if (index === 0) {
            this.selectedFlexToItems.push([]);
            this.selectedFlexToItems[index].push($event.item.code);
            this.flexToInput.nativeElement.value = '';
          } else {
            for (let k = 0; k <= index + 1; k++) {
              this.selectedFlexToItems.push([]);
              if (index === k) {
                this.selectedFlexToItems[index].push($event.item.code);
                this.flexToInput.nativeElement.value = '';
              }
            }
          }
        }
      } else {
        // does exist
        this.selectedFlexToItems[index].push($event.item.code);
        this.flexToInput.nativeElement.value = '';
      }
    }
  }

  onSelectedItemsFlexAirLine($event: NgbTypeaheadSelectItemEvent, type: string, index: number) {
    $event.preventDefault();
    if ($event && $event.item && $event.item.shortCode2Digit && type === 'flexAirline') {
      if (typeof this.selectedFlexAirLineItems[index] === 'undefined') {
        // does not exist
        if (this.selectedFlexAirLineItems?.length === 0) {
          if (index === 0) {
            this.selectedFlexAirLineItems.push([]);
            this.selectedFlexAirLineItems[index].push($event.item.shortCode2Digit);
            this.flexAirlineInput.nativeElement.value = '';
          } else {
            for (let k = 0; k <= index + 1; k++) {
              this.selectedFlexAirLineItems.push([]);
              if (index === k) {
                this.selectedFlexAirLineItems[index].push($event.item.shortCode2Digit);
                this.flexAirlineInput.nativeElement.value = '';
              }
            }
          }
        } else {
          if (index === 0) {
            this.selectedFlexAirLineItems.push([]);
            this.selectedFlexAirLineItems[index].push($event.item.shortCode2Digit);
            this.flexAirlineInput.nativeElement.value = '';
          } else {
            for (let k = 0; k <= index + 1; k++) {
              this.selectedFlexAirLineItems.push([]);
              if (index === k) {
                this.selectedFlexAirLineItems[index].push($event.item.shortCode2Digit);
                this.flexAirlineInput.nativeElement.value = '';
              }
            }
          }
        }
      } else {
        // does exist
        this.selectedFlexAirLineItems[index].push($event.item.shortCode2Digit);
        this.flexAirlineInput.nativeElement.value = '';
      }
    }
  }

  onSelectedItems($event: NgbTypeaheadSelectItemEvent, type: string) {
    $event.preventDefault();
    if ($event && $event.item && $event.item.code && type === 'transitPoints') {
      this.selectedTransitPointItems.push($event.item.code);
      this.transitPointInput.nativeElement.value = '';
    } else if ($event && $event.item && $event.item.code && type === 'exludedPoint') {
      this.selectedExludedPoints.push($event.item.code);
      this.excludedPointInput.nativeElement.value = '';
    }
  }

  closeFlex(item, type: string, index: number) {
    if (type === 'flexFrom') {
      this.selectedFlexFromItems[index].splice(this.selectedFlexFromItems.indexOf(item, index), 1);
      this.flexFromInput.nativeElement.focus();
    } else if (type === 'flexTo') {
      this.selectedFlexToItems.splice(this.selectedFlexToItems.indexOf(item, index), 1);
      this.flexToInput.nativeElement.value = '';
    } else if (type === 'flexAirline') {
      this.selectedFlexAirLineItems.splice(this.selectedFlexAirLineItems.indexOf(item, index), 1);
      this.flexAirlineInput.nativeElement.value = '';
    }
  }

  close(item, type: string) {
    if (type === 'transitPoints') {
      this.selectedTransitPointItems.splice(this.selectedTransitPointItems.indexOf(item), 1);
      this.transitPointInput.nativeElement.focus();
    } else if (type === 'exludedPoint') {
      this.selectedExludedPoints.splice(this.selectedExludedPoints.indexOf(item), 1);
      this.excludedPointInput.nativeElement.value = '';
    }
  }

  /**
   * Trigger a call to the API to get the location
   * data for from input
   */
  onSearchLocation: OperatorFunction<string, readonly { name; code }[]> = (text$: Observable<string>) =>
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
                  this.toastrService.error(`no data found given search ${term} `, 'Error');
                }
                /*   if (response.length === 0) {
              let newObj = {
                city: "",
                cityCode: "",
                code: this.searchTerm,
                country: "",
                countryCode: "",
                createdBy: 0,
                id: 0,
                name: this.searchTerm,
                status: true,
                timeZone: "",
                type: "",
                updatedBy: 0
              };
              this.searchResult = [...[newObj]];
              this.cdr.markForCheck();
              console.log(this.searchResult);
            } else {
              this.searchResult = [...response];
              console.log(this.searchResult);
            } */
                this.searchResult = [...response];
              }),
              catchError(() => {
                return of([]);
              })
            )
          : of([])
      ),
      tap(() => this.cdr.markForCheck()),
      tap(() =>
        this.searchTerm === '' || this.searchTerm.length <= 2
          ? []
          : this.searchResult.filter((v) => v.name.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1)
      )
    );

  /**
   * Trigger a call to the API to get the airline
   * data for from input
   */
  onSearchPoint: OperatorFunction<string, readonly { name; code }[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap((term: string) => (this.searchAirLineTerm = term)),
      switchMap((term) =>
        term.length >= 3
          ? this.masterDataService.getAirlineMasterData(term).pipe(
              tap((response: AirportSearchResponse[]) => {
                this.noAirLineResults = response.length === 0;
                this.searchAirLineResult = [...response];
                if (this.noAirLineResults) {
                  this.toastrService.error(`no data found given search ${term} `, 'Error');
                }
              }),
              catchError(() => {
                return of([]);
              })
            )
          : of([])
      ),
      tap(() => this.cdr.markForCheck()),
      tap(() =>
        this.searchAirLineTerm === '' || this.searchAirLineTerm.length <= 2
          ? []
          : this.searchAirLineResult?.filter(
              (v) => v.name.toLowerCase().indexOf(this.searchAirLineTerm.toLowerCase()) > -1
            )
      )
    );

  // mulitiple airline select
  onSearchAirLineMulitiselect: OperatorFunction<string, readonly { name; code }[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap((term: string) => (this.searchMulitipleTerm = term)),
      switchMap((term) =>
        term.length >= 3
          ? this.masterDataService.getAirlineMasterData(term).pipe(
              tap((response: AirportSearchResponse[]) => {
                this.noMulitipleResults = response.length === 0;
                this.searchMulitipleResult = [...response];
                if (this.noMulitipleResults) {
                  this.toastrService.error(`no data found given search ${term} `, 'Error');
                }
              }),
              catchError(() => {
                return of([]);
              })
            )
          : of([])
      ),
      tap(() => this.cdr.markForCheck()),
      tap(() =>
        this.searchMulitipleTerm === '' || this.searchMulitipleTerm.length <= 2
          ? []
          : this.searchMulitipleResult.filter(
              (v) => v.name.toLowerCase().indexOf(this.searchMulitipleTerm.toLowerCase()) > -1
            )
      )
    );

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
    let  parent = elem.parentElement,
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

  initializeForm() {
    this.flightForm = this.fb.group({
      requestID: '',
      requestLineId: '',
      serviceRequestSegment: this.fb.array([this.newFlight()]),
      dealCode: this.fb.array([]),
      passengerTypeId: '',
      flightDirection: '',
      transitPointCode: [],
      excludePointCode: [],
      expandableParametersCode: '',
      createdBy: this.authService.getUser(),
      createdDate: this.todayDate1,
      lineNo: '',
      lineStatusId: '',
      lineUuid: '',
    });
    this.setAutorized(this.flexStops);
    this.getAddonsRoutesData(0, this.flightForm.value.serviceRequestSegment);
  }
  setAutorized(data: string[]) {
    this.authorizedAux = this.flexStops.map((x) => ({
      name: x,
      value: data.indexOf(x) <= -1,
    }));
  }
  //edit purposed
  setAutorizedEdit(data: string[]) {
    this.authorizedAux = this.flexStops.map((x) => ({
      name: x,
      value: data.indexOf(x) >= 0,
    }));
  }

  parse() {
    const result = this.flexStops.map((x, index) => (this.authorizedAux[index].value ? x : null)).filter((x) => x);
    return result.length > 0 ? result : null;
  }
  /******
   * form control get
   *
   * */
  get f() {
    return this.flightForm.controls;
  }

  newFlight(): FormGroup {
    return this.fb.group(
      {
        //id: '',
        requestLineId: '',
        //requestlineID: this.requestLineId,
        //requestID: this.requestId,
        requestSegmentId: this.requestSegmentId,
        fromAirportOrCityName: '',
        fromCountryName: '',
        toAirportOrCityName: '',
        toCityName: '',
        toCountryName: '',
        className: 'Y',
        flexClassName: [],
        flexFromCode: this.selectedFlexFromItems,
        flexToCode: this.selectedFlexToItems,
        rbd: '',
        airlineCode: '',
        flexAirLineCode: this.selectedFlexAirLineItems,
        //flexStops: this.fb.array([]),
        depatureDate: ['', [Validators.required]],
        hiddenDepatureDate: '',
        flexDepature: this.fb.array([this.newDepature()]),
        flexReturn: this.fb.array([this.newReturn()]),
        returnDate: '',
        validateCarrier: '',
        budgetFrom: '',
        budgetTo: '',
        transitPointCode: [],
        excludePointCode: [],
        createdBy: 1,
        createdDate: this.todaydateAndTimeStamp,
        teamLeader: '',
        fromCode: ['', [Validators.required]],
        toCode: ['', [Validators.required]],
        holidayDays: ['', [Validators.required]],
        //holidayDays: '',
        modeOfTransport: ['flightClass', [Validators.required]],
        hotelRatings: '5',
        propertyType: 'Hotel',
        noofAdt: [1, [Validators.required]],
        noofChd: 0,
        noofInf: 0,
        lpoDate: '',
        lpoAmount: '',
        lpoNumber: '',
        lineUuid: '',
        lineRoomCount: '',
        hotelSelection: '',
        addons: this.fb.array([this.newFlightAddons()]),
        exclusionsAddons: this.fb.array([this.newFlightExclusions()]),
        visaAddons: this.fb.array([this.newVisaAddons()]),
        insuranceAddons: this.fb.array([this.newInsuranceAddons()]),
        forexAddons: this.fb.array([this.newForexAddons()], [Validators.required]),
        attractions: this.fb.array([this.newFlightAttractions()], [Validators.required]),
        holidayPersonList: this.fb.array([]),
        roomsData: this.fb.array([]),
        hotelSelectionsData: this.fb.array([]),
      },
      {
        validator: ConfirmedValidator('fromCode', 'toCode'),
      }
    );
    //this.createNewRoomFormGroup()
    //this.createNewHotelSelection()
  }
  createNewHotelSelection() {
    return this.fb.group({
      id: '',
      hotelDate: '',
      hotelName: '',
      hotelRoomCount: '',
      roomLevelsData: this.fb.array([]),
    });
    //this.createNewRoomLevelFormGroup()
  }

  createNewRoomFormGroup() {
    return this.fb.group({
      id: '',
      roomSrId: '',
      roomLineId: '',
      roomName: [],
      roomType: [],
      roomNumber: '',
      roomAddonsRequired: '',
      roomAdultCount: '1',
      roomChildCount: '0',
      roomInfantCount: '',
      //roomChildAges: '',
      roomInfantAges: '',
      roomStatus: 0,
      roomPassengersInfo: this.fb.array([]),
      childAge: this.fb.array([]),
    });
    //this.createAgeFormGroup()
  }
  createAgeFormGroup() {
    return this.fb.group({
      roomChildAges: '1',
    });
  }

  createNewRoomLevelFormGroup() {
    return this.fb.group({
      id: '',
      roomSrId: '',
      roomLineId: '',
      roomName: [],
      roomType: [],
      roomNumber: '',
      roomAddonsRequired: '',
      roomAdultCount: '1',
      roomChildCount: '0',
      roomInfantCount: '',
      //roomChildAges: '',
      roomInfantAges: '',
      roomStatus: 0,
      roomPassengersInfo: this.fb.array([]),
      roomLevelchildAge: this.fb.array([]),
    });
  }
  createNewRoomLevelAgeFormGroup() {
    return this.fb.group({
      roomChildAges: '1',
    });
  }

  newDeal(): FormGroup {
    return this.fb.group({
      dealCode: '',
      airlineCode: '',
    });
  }
  newDepature(): FormGroup {
    return this.fb.group({
      flexDepatureDate: '',
      flexDepatureTime: '',
    });
  }
  newFlexibleDepartureTime(): FormGroup {
    return this.fb.group({
      flexDepatureTime: '',
      flexArrivalTime: '',
    });
  }
  newReturn(): FormGroup {
    return this.fb.group({
      flexReturnDate: '',
      flexReturnTime: '',
    });
  }
  newFlexibleArrivalTime(): FormGroup {
    return this.fb.group({
      flexReturnTime: '',
      flexReturnArrivalTime: '',
    });
  }

  newFlightAddons(): FormGroup {
    return this.fb.group({
      addOnType: '',
      required: false,
      extraCost: false,
      remarks: '',
      requiredPassenger: this.fb.group({
        all: false,
        passengers: [],
        //passengers: this.fb.array([]),
      }),
    });
  }
  newFlightExclusions(): FormGroup {
    return this.fb.group({
      addOnType: '',
      required: false,
      requiredPassenger: this.fb.group({
        all: false,
        passengers: [],
      }),
    });
  }

  newVisaAddons(): FormGroup {
    return this.fb.group({
      addOnType: '',
      required: false,
      extraCost: false,
      remarks: '',
      requiredPassenger: this.fb.group({
        all: true,
        passengers: [],
        //passengers: this.fb.array([]),
      }),
    });
  }
  newInsuranceAddons(): FormGroup {
    return this.fb.group({
      addOnType: '',
      required: false,
      extraCost: false,
      remarks: '',
      requiredPassenger: this.fb.group({
        all: true,
        passengers: [],
        //passengers: this.fb.array([]),
      }),
    });
  }

  newForexAddons(): FormGroup {
    return this.fb.group({
      addOnType: '',
      currency: 'INR',
      wantCurrency: 'USD',
      mop: '',
      amount: '',
      needByDate: '',
      note: '',
    });
  }

  newFlightAttractions(): FormGroup {
    return this.fb.group({
      attractionName: '',
      required: false,
      extraCost: false,
      remarks: '',
      attractionDay: '',
      attractionsRequiredPassenger: this.fb.group({
        all: true,
        pax: [],
      }),
    });
  }
  flights(): FormArray {
    return this.flightForm.get('serviceRequestSegment') as FormArray;
  }

  deals(): FormArray {
    return this.flightForm.get('dealCode') as FormArray;
  }
  flightAddons(i: number): FormArray {
    return this.flights().at(i).get('addons') as FormArray;
  }
  flightExclusionsAddons(i: number): FormArray {
    return this.flights().at(i).get('exclusionsAddons') as FormArray;
  }
  visaAddons(i: number): FormArray {
    return this.flights().at(i).get('visaAddons') as FormArray;
  }
  insuranceAddons(i: number): FormArray {
    return this.flights().at(i).get('insuranceAddons') as FormArray;
  }
  forexAddons(i: number): FormArray {
    return this.flights().at(i).get('forexAddons') as FormArray;
  }

  flightAttractions(i: number): FormArray {
    return this.flights().at(i).get('attractions') as FormArray;
  }

  hotelSelectionsData(i: number): FormArray {
    return this.flights().at(i).get('hotelSelectionsData') as FormArray;
  }
  roomLevelsData(mainIndex: number, hotelSelectionsIndex: number): FormArray {
    return this.hotelSelectionsData(mainIndex)?.at(hotelSelectionsIndex)?.get('roomLevelsData') as FormArray;
  }

  roomLevelchildAge(mainIndex: number, hotelSelectionsIndex: number, roomLevelIndex: number): FormArray {
    return this.roomLevelsData(mainIndex, hotelSelectionsIndex)
      .at(roomLevelIndex)
      ?.get('roomLevelchildAge') as FormArray;
  }
  roomsData(i: number): FormArray {
    return this.flights().at(i).get('roomsData') as FormArray;
  }
  childAge(mainIndex: number, roomIndex: number): FormArray {
    return this.roomsData(mainIndex).at(roomIndex)?.get('childAge') as FormArray;
  }
  holidayPersonListData(i: number): FormArray {
    return this.flights().at(i).get('holidayPersonList') as FormArray;
  }
  // remove list
  holidayPaxdelete(mainIndex: number, holidayIndex: number) {
    if (this.holidayPersonListData(mainIndex).controls.length > 0) {
      this.holidayPersonListData(mainIndex).removeAt(holidayIndex);
    }
  }
  depature(i: number): FormArray {
    return this.flights().at(i).get('flexDepature') as FormArray;
  }

  depatureTime(i: number, flexDepatureIndex: number): FormArray {
    return (this.flights().at(i).get('flexDepature') as FormArray)
      .at(flexDepatureIndex)
      .get('FlexibleDepartureTime') as FormArray;
  }

  Returndate(i: number): FormArray {
    return this.flights().at(i).get('flexReturn') as FormArray;
  }
  flexStopsFromArray(i: number): FormArray {
    return this.flights().at(i).get('flexStops') as FormArray;
  }

  ReturnTime(i: number, flexReturnIndex: number): FormArray {
    return (this.flights().at(i).get('flexReturn') as FormArray)
      .at(flexReturnIndex)
      .get('FlexibleArrivalTime') as FormArray;
  }

  addHotelSelection(mainIndex: number) {
    const fg = this.createNewHotelSelection();
    this.hotelSelectionsData(mainIndex).push(fg);
  }
  addRoomLevelData(mainIndex: number, hotelSelectionsIndex: number) {
    const fg = this.createNewRoomLevelFormGroup();
    this.roomLevelsData(mainIndex, hotelSelectionsIndex).push(fg);
  }
  deleteHotelSelection(mainIndex: number, hotelSelectionIndex: number) {
    if (this.hotelSelectionsData(mainIndex).controls.length > 1) {
      this.hotelSelectionsData(mainIndex).removeAt(hotelSelectionIndex);
    }
  }
  removeRoomLevel(mainIndex: number, hotelSelectionIndex: number, roomLevelIndex: number) {
    /* if (this.roomLevelsData(mainIndex,hotelSelectionIndex).controls?.length > 1) {
    this.roomLevelsData(mainIndex,hotelSelectionIndex).removeAt(roomLevelIndex);
  } */
    this.roomLevelsData(mainIndex, hotelSelectionIndex).removeAt(roomLevelIndex);
  }
  addFlight(mainIndex: number) {
    /* this.submitted=false;
    this.isValidFormSubmitted=false; */

    this.flights().push(this.newFlight());
    this.rowsControlsForMultiCity.push({
      isCollapsed: true,
    });
    this.rowsControlsForDepature.push({
      isCollapsedDepature: true,
    });
    this.rowsControlsForreturn.push({
      isCollapsedreturn: true,
    });
    this.rowsControlsFlexForm.push({
      isCollapsedFlexFrom: true,
    });
    this.rowsControlsFlexTo.push({
      isCollapsedFlexTo: true,
    });
    this.rowsControlsFlexClass.push({
      isCollapsedFlexClass: true,
    });
    this.rowsControlsFlexAirline.push({
      isCollapsedFlexAirline: true,
    });
    this.rowsControlsLPODetails.push({
      isCollapsedLpo: true,
    });
    this.rowsControlsAddonsDetails.push({
      isCollapsedAddons: true,
    });
    this.rowsControlsPassengersDetails.push({
      isCollapsedPassengers: true,
    });
    this.rowsControlsAttractions.push({
      isCollapsedAttractions: true,
    });
    this.rowsControlsPackage.push({
      isCollapsedPackage: false,
    });

    this.onChangePax(mainIndex);
    this.flightTypeMultiCity(mainIndex);

    this.showProductDetailsInfo(mainIndex + 1);
  }
  removeFlight(i: number) {
    if (this.flights().controls.length > 1) {
      this.flights().removeAt(i);
      this.showProductDetailsInfo(i, true);

      //this.showProductDetailsInfo(i);
      this.rowsControlsForMultiCity.pop(i);
      this.rowsControlsForDepature.pop(i);
      this.rowsControlsForreturn.pop(i);
      this.rowsControlsFlexForm.pop(i);
      this.rowsControlsFlexTo.pop(i);
      this.rowsControlsFlexClass.pop(i);
      this.rowsControlsFlexAirline.pop(i);
      this.rowsControlsLPODetails.pop(i);
      this.rowsControlsAddonsDetails.pop(i);
      this.rowsControlsPassengersDetails.pop(i);
      this.rowsControlsAttractions.pop(i);
      this.rowsControlsPackage.pop(i);
    }
  }
  removeUpdateFlight(i: number) {
    if (this.flights().controls.length > 0) {
      this.flights().removeAt(i);
    }
  }
  addDeal() {
    this.deals().push(this.newDeal());
  }
  removeDeal(i: number) {
    if (this.deals().controls.length > 1) {
      this.deals().removeAt(i);
    }
  }

  addAddons(i: number) {
    this.flightAddons(i).push(this.newFlightAddons());
  }
  removeAddons(mainIndex: number, AddonsIndex: number) {
    if (this.flightAddons(mainIndex).controls.length > 1) {
      this.flightAddons(mainIndex).removeAt(AddonsIndex);
    }
  }
  addExclusionsAddons(i: number) {
    this.flightExclusionsAddons(i).push(this.newFlightExclusions());
  }
  removeExclusionsAddons(mainIndex: number, AddonsIndex: number) {
    if (this.flightExclusionsAddons(mainIndex).controls.length > 1) {
      this.flightExclusionsAddons(mainIndex).removeAt(AddonsIndex);
    }
  }
  addVisaAddons(i: number) {
    this.visaAddons(i).push(this.newVisaAddons());
  }
  removeVisaAddons(mainIndex: number, AddonsIndex: number) {
    if (this.visaAddons(mainIndex).controls.length > 1) {
      this.visaAddons(mainIndex).removeAt(AddonsIndex);
    }
  }
  addInsuranceAddons(i: number) {
    this.insuranceAddons(i).push(this.newInsuranceAddons());
  }
  removeInsuranceAddons(mainIndex: number, AddonsIndex: number) {
    if (this.insuranceAddons(mainIndex).controls.length > 1) {
      this.insuranceAddons(mainIndex).removeAt(AddonsIndex);
    }
  }

  addForexAddons(i: number) {
    this.forexAddons(i).push(this.newForexAddons());
  }
  removeForexAddons(mainIndex: number, AddonsIndex: number) {
    if (this.forexAddons(mainIndex).controls.length > 1) {
      this.forexAddons(mainIndex).removeAt(AddonsIndex);
    }
  }
  addAttractions(i: number) {
    this.flightAttractions(i).push(this.newFlightAttractions());
  }
  removeAttractions(mainIndex: number, AttractionsIndex: number) {
    if (this.flightAttractions(mainIndex).controls.length > 1) {
      this.flightAttractions(mainIndex).removeAt(AttractionsIndex);
    }
  }

  removeEditAddons(mainIndex: number, AddonsIndex: number) {
    this.flightAddons(mainIndex).removeAt(AddonsIndex);
  }
  addFlexDepature(i: number) {
    this.depature(i).push(this.newDepature());
  }
  removeflexDepature(i: number, flexReturnIndex: number) {
    if ((this.flights().at(i).get('flexDepature') as FormArray).length > 1) {
      this.depature(i).removeAt(flexReturnIndex);
    }
  }
  addDepatureTime(i: number, flexDepatureIndex: number) {
    this.depatureTime(i, flexDepatureIndex).push(this.newFlexibleDepartureTime());
  }
  removeDepatureTime(i: number, flexDepatureIndex: number, flexdepaturetimeindex: number) {
    if (this.depatureTime(i, flexDepatureIndex).controls.length > 1) {
      this.depatureTime(i, flexDepatureIndex).removeAt(flexdepaturetimeindex);
    }
  }
  addArrivalTime(i: number, flexReturnIndex: number) {
    this.ReturnTime(i, flexReturnIndex).push(this.newFlexibleArrivalTime());
  }
  removeArrivalTime(i: number, flexReturnIndex: number, flexArrivaltimeindex: number) {
    if (this.ReturnTime(i, flexReturnIndex).controls.length > 1) {
      this.ReturnTime(i, flexReturnIndex).removeAt(flexArrivaltimeindex);
    }
  }
  addFlexReturn(i: number) {
    this.Returndate(i).push(this.newReturn());
  }
  removeflexReturn(i: number, flexReturnIndex: number) {
    if ((this.flights().at(i).get('flexReturn') as FormArray).length > 1) {
      this.Returndate(i).removeAt(flexReturnIndex);
    }
  }

  //reset  fieldName
  resetField(fieldName) {
    this.flights().controls.forEach((group) => group.get(fieldName).reset());
  }
  // type of flight
  changeTypeOfFlight(e) {
    this.typeOfFlight = e.target.value;
  }

  carRentalDataConversion(index:number){
    let carRentalConvertArray = [];
      const addonForCar={
        id: 269,
        code: 'Car Rental',
        name: 'Car Rental',
        addonType: 'A',
        description: 'Car Rental',
      };
      if (this.dynamicJson[`segment-${index}`] !== undefined&&this.dynamicJson[`segment-${index}`]?.length>0) {
        const CarRental = {
          remarks: null,
          required: false,
          addOnType: addonForCar,
          extraCost: false,
          requiredPassenger: {
            all: true,
            passengers: this.addonsPassengers[0],
          },
          dynamicTabData: this.dynamicJson[`segment-${index}`],
        };
        carRentalConvertArray.push(CarRental);
      }else{
        carRentalConvertArray = [];
      }
      let carRentalIndividualConvertArray=[];
      if(carRentalConvertArray?.length>0){
        for (let index = 0; index < carRentalConvertArray.length; index++) {
          const element = carRentalConvertArray[index];
          if(element.dynamicTabData.length>0){
            for (let subIndex = 0; subIndex < element.dynamicTabData.length; subIndex++) {
              const subElement = element.dynamicTabData[subIndex];

              const CarRentalObject = {
                remarks: null,
                required: false,
                addOnType: addonForCar,
                extraCost: false,
                requiredPassenger: {
                  all: true,
                  passengers: this.addonsPassengers[0],
                },
                dynamicTabData: [subElement],
              };
              carRentalIndividualConvertArray.push(CarRentalObject);
            }
          }
        }
      }
      if(carRentalIndividualConvertArray?.length>0){
        return carRentalConvertArray=carRentalIndividualConvertArray;
      }else{
        return carRentalConvertArray;
      }

  }
  visaDataConversion(element: any, mainIndex: number) {
    //visa data convert
    if (element.visaAddons?.length > 0) {
      element.visaAddons?.forEach((visaAddonsElement) => {
        visaAddonsElement.addOnType = {
          id: 272,
          name: 'Visa',
          code: 'Visa',
          description: 'Visa',
          addonType: 'A',
        };
        visaAddonsElement.required = visaAddonsElement.required;
        visaAddonsElement.remarks = visaAddonsElement.remarks;
        visaAddonsElement.requiredPassenger.passengers = visaAddonsElement.requiredPassenger?.passengers;
        visaAddonsElement.requiredPassenger.all =
          visaAddonsElement.requiredPassenger?.passengers?.length === this.addonsPassengers[mainIndex]?.length
            ? true
            : false;
      });
    }
    let visaDataConvertArray: any[] = [];
    if (element.addons?.length > 0) {
      for (let visaIndex = 0; visaIndex < element.visaAddons?.length; visaIndex++) {
        const visaElement = element.visaAddons[visaIndex];
        if (
          visaElement.requiredPassenger.passengers === null ||
          visaElement.requiredPassenger.all === false ||
          visaElement.requiredPassenger?.passengers?.length === 0
        ) {
          visaDataConvertArray = [];
        } else {
          visaDataConvertArray.push(visaElement);
        }
      }
    }
    return visaDataConvertArray;
  }
  insuranceDataConversion(element: any, mainIndex: number) {
    //visa data convert
    if (element.insuranceAddons?.length > 0) {
      element.insuranceAddons?.forEach((insuranceAddonsElement) => {
        insuranceAddonsElement.addOnType = {
          id: 271,
          name: 'Travel Insurance',
          code: 'TI',
          description: 'Travel Insurance',
          addonType: 'A',
        };
        insuranceAddonsElement.required = insuranceAddonsElement.required;
        insuranceAddonsElement.remarks = insuranceAddonsElement.remarks;
        insuranceAddonsElement.requiredPassenger.passengers = insuranceAddonsElement.requiredPassenger?.passengers;
        insuranceAddonsElement.requiredPassenger.all =
          insuranceAddonsElement.requiredPassenger?.passengers?.length === this.addonsPassengers[mainIndex]?.length
            ? true
            : false;
      });
    }
    let insuranceDataConvertArray: any[] = [];
    if (element.insuranceAddons?.length > 0) {
      for (let insuranceIndex = 0; insuranceIndex < element.insuranceAddons?.length; insuranceIndex++) {
        const insuranceElement = element.insuranceAddons[insuranceIndex];
        if (
          insuranceElement.requiredPassenger.passengers === null ||
          insuranceElement.requiredPassenger.all === false ||
          insuranceElement.requiredPassenger?.passengers?.length === 0
        ) {
          insuranceDataConvertArray = [];
        } else {
          insuranceDataConvertArray.push(insuranceElement);
        }
      }
    }
    return insuranceDataConvertArray;
  }

  exclusionsDataConversion(element: any, mainIndex: number) {
    let exclusionsDataConvertArray: any[] = [];
    if (element.exclusionsAddons.length > 0) {
      for (let addons_index = 0; addons_index < element.exclusionsAddons?.length; addons_index++) {
        const addons_sub_element = element.exclusionsAddons[addons_index];
        if (
          addons_sub_element.addOnType === '' &&
          addons_sub_element.required === false &&
          addons_sub_element.requiredPassenger.all === false &&
          addons_sub_element.requiredPassenger.passengers === null
        ) {
          exclusionsDataConvertArray = [];
        } else {
          exclusionsDataConvertArray.push(addons_sub_element);
        }
      }
    }
    return exclusionsDataConvertArray;
  }

  forexDataConversion(element: any, mainIndex: number) {
    let forexDataConvertArray: any[] = [];
    if (element.forexAddons.length > 0) {
      element.forexAddons?.forEach((forexAddonsElement) => {
        forexAddonsElement.addOnType = {
          id: 275,
          name: 'Forex',
          code: 'Forex',
          description: 'Forex',
          addonType: 'A',
        };
      });
      for (let forexindex = 0; forexindex < element.forexAddons?.length; forexindex++) {
        const forexelement = element.forexAddons[forexindex];
        //forexelement.addOnType === '' &&
        //forexelement.currency === '' &&
        //forexelement.wantCurrency === '' &&
        if (
          forexelement.mop === '' &&
          forexelement.amount === '' &&
          forexelement.needByDate === '' &&
          forexelement.note === ''
        ) {
          forexDataConvertArray = [];
        } else {
          forexDataConvertArray.push(forexelement);
        }
      }
    }
    return forexDataConvertArray;
  }
  /**
   * Data Conversions methods for Flight and deals
   */
  flightDataConversion() {
    let flightsDummyArray = [];
    let flightsArray = this.flights().value;
    flightsArray.forEach((val) => flightsDummyArray.push(Object.assign({}, val)));
    flightsDummyArray.forEach((element, index) => {
      //const DEPATURE_DATE_REVERSED=element.depatureDate?.toString()?.split(['-']);
      //const RETURN_DATE_REVERSED=element.returnDate?.toString()?.split(['-']);
      if (this.isEdit === true && element.requestLineId === '') {
        element.requestId = Number(this.requestId);
        element.requestLineId = element.requestLineId;
        element.requestSegmentId = 0;
        element.lineUuid = element.lineUuid;
        element.noofAdt = flightsDummyArray[0].noofAdt;
        element.noofChd = flightsDummyArray[0].noofChd;
        element.noofInf = flightsDummyArray[0].noofInf;
        element.hotelRatings = element.hotelRatings;
        element.className = element.className;
        element.holidayDays = element.holidayDays?.toString();
        element.propertyType = element.propertyType;
        element.lineRoomCount = element.lineRoomCount;
        //element.airlineCode = element.airlineCode;
        //element.roomsData = element.roomsData;
        element.modeOfTransport = element.modeOfTransport;
        element.lpoAmount = element.lpoAmount === '' || element.lpoAmount === 0 ? 0.0 : element.lpoAmount;
        element.lpoDate = element.lpoDate === '' ? null : element.lpoDate;
        element.lpoNumber = element.lpoNumber === '' || element.lpoNumber === 0 ? 0.0 : element.lpoNumber;
        element.fromCode = element.fromCode?.code ? element.fromCode?.code : element.fromCode;
        element.fromCountryName = element.fromCountryName;
        element.fromAirportOrCityName = element.fromAirportOrCityName;
        element.toCode = element.toCode?.code ? element.toCode?.code : element.toCode;
        element.toCountryName = element.toCountryName;
        element.toAirportOrCityName = element.toAirportOrCityName;
        (element.returnDate = null),
          (element.hiddenDepatureDate = null),
          (element.depatureDate = element.depatureDate
            ? `${element.depatureDate.year || ''}-${this.padNumber(element.depatureDate.month)}-${this.padNumber(
                element.depatureDate.day
              )}`
            : '');
        element.className = element.className;
        element.rbd = element.rbd;
        element.airlineCode =
          element.airlineCode?.shortCode2Digit === undefined || element.airlineCode?.shortCode2Digit === ''
            ? null
            : element.airlineCode?.shortCode2Digit;
        element.validateCarrier = element.validateCarrier;
        element.transitPointCode = this.selectedTransitPointItems;
        element.excludePointCode = this.selectedExludedPoints;
        element.flexFromCode = this.selectedFlexFromItems[index] === undefined ? [] : this.selectedFlexFromItems[index];
        element.flexToCode = this.selectedFlexToItems[index] === undefined ? [] : this.selectedFlexToItems[index];
        element.flexDepature = element.flexDepature;
        element.flexReturn = element.flexReturn;
        element.flexClassName = element.flexClassName === null ? [] : element.flexClassName;
        element.flexAirLineCode =
          this.selectedFlexAirLineItems[index] === undefined ? [] : this.selectedFlexAirLineItems[index];
        element.budgetFrom = element.budgetFrom;
        element.budgetTo = element.budgetTo;
        element.createdDate = this.todaydateAndTimeStamp;
        element.createdBy = this.authService.getUser();
        if (element.addons?.length > 0) {
          element.addons?.forEach((addonselement) => {
            addonselement.addOnType = addonselement.addOnType;
            addonselement.extraCost = addonselement.extraCost;
            addonselement.required = addonselement.required;
            addonselement.remarks = addonselement.remarks;
            addonselement.requiredPassenger.passengers = addonselement.requiredPassenger?.passengers;
            addonselement.requiredPassenger.all =
              addonselement.requiredPassenger?.passengers?.length === this.addonsPassengers[index]?.length
                ? true
                : false;
          });
        }
        let addonsArray: any[] = [];
        if (element.addons?.length > 0) {
          for (let addons_index = 0; addons_index < element.addons?.length; addons_index++) {
            const addons_sub_element = element.addons[addons_index];
            if (
              (addons_sub_element.addOnType === '' &&
              addons_sub_element.remarks === '' &&
              addons_sub_element.extraCost === false &&
              addons_sub_element.required === false &&
              addons_sub_element.requiredPassenger.all === false &&
              addons_sub_element.requiredPassenger.passengers === null)
              ||
              (addons_sub_element.addOnType === undefined &&
              addons_sub_element.remarks === undefined &&
              addons_sub_element.extraCost === undefined &&
              addons_sub_element.required === undefined &&
              addons_sub_element.requiredPassenger.all === false &&
              addons_sub_element.requiredPassenger.passengers === undefined)
            ) {
            } else {
              addonsArray.push(addons_sub_element);
            }
          }
        }

        const visa = this.visaDataConversion(element, index);
        const insurance = this.insuranceDataConversion(element, index);
        const forexData = this.forexDataConversion(element, index);
        const exclusionsData = this.exclusionsDataConversion(element, index);
        const carRentalArray=this.carRentalDataConversion(index);
        element.exclusions = exclusionsData;
        const toCodeCitynameArray=[{city:element.toCityName}];
        element.addons = addonsArray?.concat(carRentalArray,visa, insurance, forexData,toCodeCitynameArray);
        delete element.visaAddons;
        delete element.insuranceAddons;
        delete element.forexAddons;

        //element.addons = element.addons;
        let attractionsArray: any[] = [];
        if (element.attractions?.length > 0) {
          for (
            let attractions_sub_index = 0;
            attractions_sub_index < element.attractions.length;
            attractions_sub_index++
          ) {
            const attractions_sub_element = element.attractions[attractions_sub_index];
            if (
              attractions_sub_element.attractionName === '' &&
              attractions_sub_element.attractionDay === '' &&
              attractions_sub_element.remarks === '' &&
              attractions_sub_element.extraCost === false &&
              attractions_sub_element.required === false &&
              attractions_sub_element.attractionsRequiredPassenger?.all === true &&
              attractions_sub_element.attractionsRequiredPassenger?.pax === null
            ) {
            } else {
              attractionsArray.push(attractions_sub_element);
            }
          }
        }
        element.attractions = attractionsArray;
        //element.attractions = element.attractions;
        element.holidayPersonList = [];
        let roomsDummyArray: any[] = [];
        let roomArray = element.roomsData;
        roomArray.forEach((val) => roomsDummyArray.push(Object.assign({}, val)));
        roomsDummyArray.forEach((room_element, roomindex) => {
          room_element.id = room_element.id;
          room_element.roomSrId = Number(this.requestId);
          room_element.roomLineId = room_element.roomLineId;
          room_element.roomNumber = roomindex + 1;
          room_element.roomName =
            room_element.roomName === null || room_element.roomName === '' ? [] : [room_element.roomName];
          room_element.roomType =
            room_element.roomType === null || room_element.roomType === '' ? [] : [room_element.roomType];
          room_element.roomAddonsRequired = 0;
          room_element.roomAdultCount = Number(room_element.roomAdultCount);
          room_element.roomChildCount = Number(room_element.roomChildCount);
          room_element.roomInfantCount = Number(room_element.roomInfantCount);
          room_element.roomStatus = room_element.roomStatus;
          room_element.roomCreatedBy = this.authService.getUser();
          room_element.roomCreatedDate = this.todaydateAndTimeStamp;
          room_element.roomCreatedDevice = this.deviceInfo?.userAgent;
          let childAge;
          room_element.childAge.forEach((child_element) => {
            if (childAge) {
              childAge = childAge + ',' + child_element.roomChildAges?.toString();
            } else {
              childAge = child_element.roomChildAges?.toString();
            }
          });
          room_element.roomChildAges = childAge;
          room_element.roomPassengersInfo = [];
          room_element.roomCreatedIp = null;
          /*  element.roomsPersonList.forEach((element) => {
            element.passengerSrId = Number(this.requestId);
            element.passengerStatus = 0;
          }); */
          //element.roomPassengersInfo = element.roomsPersonList;
          //delete element.roomsPersonList;
          delete room_element.childAge;
        });
        //roomsDummyArray
        element.roomsData = roomsDummyArray;
      } else {
        element.requestId = Number(this.requestId);
        element.requestLineId = element.requestLineId;
        element.requestSegmentId = element.requestSegmentId;
        element.lineUuid = element.lineUuid;
        element.noofAdt = flightsDummyArray[0].noofAdt;
        element.noofChd = flightsDummyArray[0].noofChd;
        element.noofInf = flightsDummyArray[0].noofInf;
        element.hotelRatings = element.hotelRatings;
        element.className = element.className;
        element.holidayDays = element.holidayDays === '' ? 0 : element.holidayDays?.toString();
        element.propertyType = element.propertyType;
        element.lineRoomCount = element.lineRoomCount;
        //element.airlineCode = element.airlineCode;
        //element.roomsData = element.roomsData;
        element.modeOfTransport = element.modeOfTransport;
        element.lpoAmount = element.lpoAmount === '' || element.lpoAmount === 0 ? 0.0 : element.lpoAmount;
        element.lpoDate = element.lpoDate === '' ? null : element.lpoDate;
        element.lpoNumber = element.lpoNumber === '' || element.lpoNumber === 0 ? 0.0 : element.lpoNumber;
        element.fromCode = element.fromCode?.code ? element.fromCode?.code : element.fromCode;
        element.fromCountryName = element.fromCountryName;
        element.fromAirportOrCityName = element.fromAirportOrCityName;
        element.toCode = element.toCode?.code ? element.toCode?.code : element.toCode;
        element.toCountryName = element.toCountryName;
        element.toAirportOrCityName = element.toAirportOrCityName;
        (element.returnDate = null),
          (element.hiddenDepatureDate = null),
          (element.depatureDate = element.depatureDate
            ? `${element.depatureDate.year || ''}-${this.padNumber(element.depatureDate.month)}-${this.padNumber(
                element.depatureDate.day
              )}`
            : '');
        element.className = element.className;
        element.rbd = element.rbd;
        element.airlineCode =
          element.airlineCode?.shortCode2Digit === undefined || element.airlineCode?.shortCode2Digit === ''
            ? null
            : element.airlineCode?.shortCode2Digit;
        element.validateCarrier = element.validateCarrier;
        element.transitPointCode = this.selectedTransitPointItems;
        element.excludePointCode = this.selectedExludedPoints;
        element.flexFromCode = this.selectedFlexFromItems[index] === undefined ? [] : this.selectedFlexFromItems[index];
        element.flexToCode = this.selectedFlexToItems[index] === undefined ? [] : this.selectedFlexToItems[index];
        element.flexDepature = element.flexDepature;
        element.flexReturn = element.flexReturn;
        element.flexClassName = element.flexClassName === null ? [] : element.flexClassName;
        element.flexAirLineCode =
          this.selectedFlexAirLineItems[index] === undefined ? [] : this.selectedFlexAirLineItems[index];
        element.budgetFrom = element.budgetFrom;
        element.budgetTo = element.budgetTo;
        element.createdDate = this.todaydateAndTimeStamp;
        element.createdBy = this.authService.getUser();
        if (element.addons?.length > 0) {
          element.addons?.forEach((addonselement) => {
            addonselement.addOnType = addonselement.addOnType;
            addonselement.extraCost = addonselement.extraCost;
            addonselement.required = addonselement.required;
            addonselement.remarks = addonselement.remarks;
            addonselement.requiredPassenger.passengers = addonselement.requiredPassenger?.passengers;
            addonselement.requiredPassenger.all =
              addonselement.requiredPassenger?.passengers?.length === this.addonsPassengers[index]?.length
                ? true
                : false;
          });
        }
        let addonsArray: any[] = [];
        if (element.addons?.length > 0) {
          for (let addons_index = 0; addons_index < element.addons?.length; addons_index++) {
            const addons_sub_element = element.addons[addons_index];
            if (
              (addons_sub_element.addOnType === '' &&
              addons_sub_element.remarks === '' &&
              addons_sub_element.extraCost === false &&
              addons_sub_element.required === false &&
              addons_sub_element.requiredPassenger.all === false &&
              addons_sub_element.requiredPassenger.passengers === null
              )
              ||
              (addons_sub_element.addOnType === undefined &&
              addons_sub_element.remarks === undefined &&
              addons_sub_element.extraCost === undefined &&
              addons_sub_element.required === undefined &&
              addons_sub_element.requiredPassenger.all === false &&
              addons_sub_element.requiredPassenger.passengers === undefined)
            ) {
            } else {
              addonsArray.push(addons_sub_element);
            }
          }
        }


        const visa = this.visaDataConversion(element, index);
        const insurance = this.insuranceDataConversion(element, index);
        const exclusionsData = this.exclusionsDataConversion(element, index);
        const forexData = this.forexDataConversion(element, index);
        const carRentalArray=this.carRentalDataConversion(index);
        const toCodeCitynameArray=[{city:element.toCityName}];

        //element.addons = addonsArray;
        element.exclusions = exclusionsData;
        element.addons = addonsArray.concat(visa, insurance, forexData, carRentalArray,toCodeCitynameArray);
        delete element.visaAddons;
        delete element.insuranceAddons;
        delete element.forexAddons;

        //element.addons = element.addons;
        let attractionsArray: any[] = [];
        if (element.attractions?.length > 0) {
          for (
            let attractions_sub_index = 0;
            attractions_sub_index < element.attractions.length;
            attractions_sub_index++
          ) {
            const attractions_sub_element = element.attractions[attractions_sub_index];
            if (
              attractions_sub_element.attractionName === '' &&
              attractions_sub_element.attractionDay === '' &&
              attractions_sub_element.remarks === '' &&
              attractions_sub_element.extraCost === false &&
              attractions_sub_element.required === false &&
              attractions_sub_element.attractionsRequiredPassenger?.all === true &&
              attractions_sub_element.attractionsRequiredPassenger?.pax === null
            ) {
            } else {
              attractionsArray.push(attractions_sub_element);
            }
          }
        }
        element.attractions = attractionsArray;
        //element.attractions = element.attractions;
        if (index === 0) {
          element.holidayPersonList = element?.holidayPersonList;
        } else {
          element.holidayPersonList = [];
        }
        let roomsDummyArray: any[] = [];
        let roomArray = element.roomsData;
        roomArray.forEach((val) => roomsDummyArray.push(Object.assign({}, val)));
        roomsDummyArray.forEach((room_element, roomindex) => {
          room_element.id = room_element.id;
          room_element.roomSrId = Number(this.requestId);
          room_element.roomLineId = room_element.roomLineId;
          room_element.roomNumber = roomindex + 1;
          room_element.roomName =
            room_element.roomName === null || room_element.roomName === '' ? [] : [room_element.roomName];
          room_element.roomType =
            room_element.roomType === null || room_element.roomType === '' ? [] : [room_element.roomType];
          room_element.roomAddonsRequired = 0;
          room_element.roomAdultCount = Number(room_element.roomAdultCount);
          room_element.roomChildCount = Number(room_element.roomChildCount);
          room_element.roomInfantCount = 0;
          room_element.roomStatus = room_element.roomStatus;
          room_element.roomCreatedBy = this.authService.getUser();
          room_element.roomCreatedDate = this.todaydateAndTimeStamp;
          room_element.roomCreatedDevice = this.deviceInfo?.userAgent;
          let childAge;
          room_element.childAge.forEach((child_element) => {
            if (childAge) {
              childAge = childAge + ',' + child_element.roomChildAges?.toString();
            } else {
              childAge = child_element.roomChildAges?.toString();
            }
          });
          room_element.roomChildAges = childAge;
          room_element.roomPassengersInfo = [];
          room_element.roomCreatedIp = null;
          /*  element.roomsPersonList.forEach((element) => {
          element.passengerSrId = Number(this.requestId);
          element.passengerStatus = 0;
        }); */
          //element.roomPassengersInfo = element.roomsPersonList;
          //delete element.roomsPersonList;
          delete room_element.childAge;
        });
        //roomsDummyArray
        element.roomsData = roomsDummyArray;
      }
    });
    return flightsDummyArray;
  }

  dealsDataConversion() {
    let dealsDummyArray = [];
    let dealsArray = this.deals().value;
    dealsArray.forEach((val) => dealsDummyArray.push(Object.assign({}, val)));
    for (let d = 0; d < dealsArray.length; d++) {
      (dealsArray[d].airlineCode = dealsArray[d].airlineCode?.shortCode2Digit),
        (dealsArray[d].dealCode = dealsArray[d].dealCode);
    }
    return dealsArray;
  }

  checkStartDateAndEndDate(startDate, enddate): boolean {
    if (startDate && enddate) {
      if (startDate != null && enddate != null && enddate < startDate) {
        this.toastrService.error('return date should be greater than depature date', 'Error');
        return false;
      } else {
        return true;
      }
    }
    return false;
  }
  padNumber(value: number | null) {
    if (!isNaN(value) && value !== null) {
      return `0${value}`.slice(-2);
    } else {
      return '';
    }
  }

  /**
   * submit For Request line
   * */
  onSubmitFlightForm() {
    this.submitted = true;
    this.isValidFormSubmitted = false;
    const flightsData = this.flightDataConversion();
    if (this.flights().value?.length > 0) {
      for (let i = 0; i < this.flights().value.length; i++) {
        const flightElement = this.flights().value[i];
        const flightElementConvertData = flightsData[i];
        // check values empty or not
        if (typeof this.flights().value[i].fromCode === 'object') {
          this.flights().value[i].fromCode = this.flights().value[i].fromCode;
        } else {
          return this.toastrService.error('Please select start place', 'Error');
        }
        if (typeof this.flights().value[i].toCode === 'object') {
          this.flights().value[i].toCode = this.flights().value[i].toCode;
        } else {
          return this.toastrService.error('Please select end place', 'Error');
        }

        //check room pax
        if (flightElement?.roomsData?.length > 0) {
          let initialAdultCount: number = 0;
          let initialChildCount: number = 0;

          for (let roomindex = 0; roomindex < flightElement.roomsData.length; roomindex++) {
            const roomelement = flightElement.roomsData[roomindex];

            if (Number(roomelement.roomAdultCount) > 0) {
              initialAdultCount += Number(roomelement.roomAdultCount);
            }
            if (Number(roomelement.roomChildCount) > 0) {
              //initialChildCount+= Number(roomelement.roomChildCount)  ;
              initialChildCount += Number(roomelement.roomChildCount);
            }
          }

          if (flightElementConvertData?.noofAdt >= initialAdultCount === false) {
            return this.toastrService.error('room adult should be greater than pax adult ', 'Error');
          }
          if (flightElementConvertData?.noofChd + flightElement.noofInf >= initialChildCount === false) {
            return this.toastrService.error('room child should be greater than pax child ', 'Error');
          }
        }
      }
    }

    // stop here if form is invalid
    if (this.flightForm.invalid) {
      return this.toastrService.error('please fill the required fields', 'Error');
    }

    //check room passengers
    if (this.flightForm.valid) {
      //this.convertDateFormatToUTC();
      //const flightsData = this.flightDataConversion();
      //const dealsData = this.dealsDataConversion();

      let payload = {
        serviceRequestLine: {
          requestId: Number(this.requestId),
          passengerTypeId: 0,
          lineStatusId: 0,
          createdBy: this.authService.getUser(),
          createdDate: this.todaydateAndTimeStamp,
          expandableParametersCode: [],
          dealCode: [],
          //dealCode: dealsData,
          //lineNo:this.UINICNUMBER
          //addons: this.flightAddons().value
        },
        serviceRequestSegment: flightsData,
      };

      this.dashboardRequestService
        .createHolidayRequest(payload, apiUrls.Holiday_Package.createPackageRequest)
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe(
          (data: any) => {
            if (data[0]?.requestLineId) {
              this.srLineId = data[0]?.requestLineId;
              this.router.navigate(['/dashboard/booking/holidays'], {
                queryParams: {
                  requestId: this.requestId,
                  contactId: this.contactid,
                  holidaysLineId: this.srLineId,
                  sources: `request-1`,
                },
              });
              //this.FindById(Number(this.requestId));
              this.toastrService.success('The service request has been sent successfuly !', 'Success');
            } else {
              this.toastrService.error('Oops! Something went wrong  while send the data please try again', 'Error');
            }
          },
          (error) => {
            this.toastrService.error('Oops! Something went wrong  while send the data please try again', 'Error');
          }
        );
    } else {
      this.toastrService.error('please fill the required fields', 'Error');
    }
  }

  onUpdateFlightForm() {
    this.submitted = true;
    this.isValidFormSubmitted = false;
    const flightsData = this.flightDataConversion();
    if (this.flights().value.length > 0) {
      for (let i = 0; i < this.flights().value.length; i++) {
        const flightElement = this.flights().value[i];
        const flightElementConvertData = flightsData[i];
        // check values empty or not
        if (typeof this.flights().value[i].fromCode === 'object') {
          this.flights().value[i].fromCode = this.flights().value[i].fromCode;
        } else {
          return this.toastrService.error('Please select start place', 'Error');
        }
        if (typeof this.flights().value[i].toCode === 'object') {
          this.flights().value[i].toCode = this.flights().value[i].toCode;
        } else {
          return this.toastrService.error('Please select end place', 'Error');
        }
        //check room pax
        if (flightElement?.roomsData?.length > 0) {
          let initialAdultCount: number = 0;
          let initialChildCount: number = 0;
          for (let roomindex = 0; roomindex < flightElement.roomsData.length; roomindex++) {
            const roomelement = flightElement.roomsData[roomindex];
            if (Number(roomelement.roomAdultCount) > 0) {
              initialAdultCount += Number(roomelement.roomAdultCount);
            }
            if (Number(roomelement.roomChildCount) > 0) {
              initialChildCount += Number(roomelement.roomChildCount);
            }
          }
          if (flightElementConvertData?.noofAdt >= initialAdultCount === false) {
            return this.toastrService.error('room adult should be greater than pax adult ', 'Error');
          }
          if (flightElementConvertData?.noofChd >= initialChildCount === false) {
            return this.toastrService.error('room child should be greater than pax child ', 'Error');
          }
        }
      }
    }

    if (this.flightForm.invalid) {
      return this.toastrService.error('please fill the required fields', 'Error');
    }

    if (this.flightForm.valid) {
      //const flightsData = this.flightDataConversion();
      const dealsData = this.dealsDataConversion();
      let payload = {
        serviceRequestLine: {
          requestId: Number(this.requestId),
          passengerTypeId: this.flightForm.get('passengerTypeId').value,
          lineStatusId: this.flightForm.get('lineStatusId').value,
          createdBy: this.authService.getUser(),
          createdDate: this.todaydateAndTimeStamp,
          updatedBy: this.authService.getUser(),
          updatedDate: this.todaydateAndTimeStamp,
          expandableParametersCode:
            this.flightForm.get('expandableParametersCode').value !== ''
              ? this.flightForm.get('expandableParametersCode').value
              : null,
          dealCode: dealsData,
        },
        serviceRequestSegment: flightsData,
      };

      this.dashboardRequestService
        .modifyHolidayRequest(payload, apiUrls.Holiday_Package.modifyPackageRequest)
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe(
          (data: any) => {
            if (data[0]?.requestLineId) {
              this.toastrService.success('The service request has been updated successfuly !', 'Success');
              this.reloadComponent();
            }
          },
          (error) => {
            this.toastrService.error('Oops! Something went wrong  while send the data please try again', 'Error');
          }
        );
    } else {
      this.toastrService.error('please fill the required fields', 'Error');
    }
  }

  onEditSubmitFlightDataConversion(newRequestNo?: number) {
    let flightsDummyArray = [];
    let flightsArray = this.flights().value;
    flightsArray.forEach((val) => flightsDummyArray.push(Object.assign({}, val)));
    flightsDummyArray.forEach((element, index) => {
      element.requestId = Number(newRequestNo);
      element.requestLineId = 0;
      element.requestSegmentId = 0;
      element.lineUuid = 0;
      element.noofAdt = flightsDummyArray[0].noofAdt;
      element.noofChd = flightsDummyArray[0].noofChd;
      element.noofInf = flightsDummyArray[0].noofInf;
      element.hotelRatings = element.hotelRatings;
      element.className = element.className;
      element.holidayDays = element.holidayDays === '' ? 0 : element.holidayDays?.toString();
      element.propertyType = element.propertyType;
      element.lineRoomCount = element.lineRoomCount;
      element.modeOfTransport = element.modeOfTransport;
      element.lpoAmount = element.lpoAmount === '' || element.lpoAmount === 0 ? 0.0 : element.lpoAmount;
      element.lpoDate = element.lpoDate === '' ? null : element.lpoDate;
      element.lpoNumber = element.lpoNumber === '' || element.lpoNumber === 0 ? 0.0 : element.lpoNumber;
      element.fromCode = element.fromCode?.code ? element.fromCode?.code : element.fromCode;
      element.fromCountryName = element.fromCountryName;
      element.fromAirportOrCityName = element.fromAirportOrCityName;
      element.toCode = element.toCode?.code ? element.toCode?.code : element.toCode;
      element.toCountryName = element.toCountryName;
      element.toAirportOrCityName = element.toAirportOrCityName;
      (element.returnDate = null),
        (element.hiddenDepatureDate = null),
        (element.depatureDate = element.depatureDate
          ? `${element.depatureDate.year || ''}-${this.padNumber(element.depatureDate.month)}-${this.padNumber(
              element.depatureDate.day
            )}`
          : '');
      element.className = element.className;
      element.rbd = element.rbd;
      element.airlineCode =
        element.airlineCode?.shortCode2Digit === undefined || element.airlineCode?.shortCode2Digit === ''
          ? null
          : element.airlineCode?.shortCode2Digit;
      element.validateCarrier = element.validateCarrier;
      element.transitPointCode = this.selectedTransitPointItems;
      element.excludePointCode = this.selectedExludedPoints;
      element.flexFromCode = this.selectedFlexFromItems[index] === undefined ? [] : this.selectedFlexFromItems[index];
      element.flexToCode = this.selectedFlexToItems[index] === undefined ? [] : this.selectedFlexToItems[index];
      element.flexDepature = element.flexDepature;
      element.flexReturn = element.flexReturn;
      element.flexClassName = element.flexClassName === null ? [] : element.flexClassName;
      element.flexAirLineCode =
        this.selectedFlexAirLineItems[index] === undefined ? [] : this.selectedFlexAirLineItems[index];
      element.budgetFrom = element.budgetFrom;
      element.budgetTo = element.budgetTo;
      element.createdDate = this.todaydateAndTimeStamp;
      element.createdBy = this.authService.getUser();
      if (element.addons?.length > 0) {
        element.addons?.forEach((addonselement) => {
          addonselement.addOnType = addonselement.addOnType;
          addonselement.extraCost = addonselement.extraCost;
          addonselement.required = addonselement.required;
          addonselement.remarks = addonselement.remarks;
          addonselement.requiredPassenger.passengers = addonselement.requiredPassenger?.passengers;
          addonselement.requiredPassenger.all =
            addonselement.requiredPassenger?.passengers?.length === this.addonsPassengers[index]?.length ? true : false;
        });
      }


      let addonsArray: any[] = [];
      if (element.addons?.length > 0) {
        for (let addons_index = 0; addons_index < element.addons?.length; addons_index++) {
          const addons_sub_element = element.addons[addons_index];
          if (
            (addons_sub_element.addOnType === '' &&
            addons_sub_element.remarks === '' &&
            addons_sub_element.extraCost === false &&
            addons_sub_element.required === false &&
            addons_sub_element.requiredPassenger.all === false &&
            addons_sub_element.requiredPassenger.passengers === null)
            ||
            (addons_sub_element.addOnType === undefined &&
            addons_sub_element.remarks === undefined &&
            addons_sub_element.extraCost === undefined &&
            addons_sub_element.required === undefined &&
            addons_sub_element.requiredPassenger.all === false &&
            addons_sub_element.requiredPassenger.passengers === undefined)

          ) {
            console.log(' addons empty check');

          } else {
            addonsArray.push(addons_sub_element);
          }
        }
      }

      const visa = this.visaDataConversion(element, index);
      const insurance = this.insuranceDataConversion(element, index);
      const exclusionsData = this.exclusionsDataConversion(element, index);
      const forexData = this.forexDataConversion(element, index);
      const carRentalArray=this.carRentalDataConversion(index);
      const toCodeCitynameArray=[{city:element.toCityName}];


      //element.addons = addonsArray;
      element.exclusions = exclusionsData;
      element.addons = addonsArray?.concat(carRentalArray,visa, insurance, forexData ,toCodeCitynameArray);

      delete element.visaAddons;
      delete element.insuranceAddons;
      delete element.forexAddons;
      //element.addons = element.addons;
      let attractionsArray: any[] = [];
      if (element.attractions?.length > 0) {
        for (
          let attractions_sub_index = 0;
          attractions_sub_index < element.attractions.length;
          attractions_sub_index++
        ) {
          const attractions_sub_element = element.attractions[attractions_sub_index];
          if (
            attractions_sub_element.attractionName === '' &&
            attractions_sub_element.attractionDay === '' &&
            attractions_sub_element.remarks === '' &&
            attractions_sub_element.extraCost === false &&
            attractions_sub_element.required === false &&
            attractions_sub_element.attractionsRequiredPassenger?.all === true &&
            attractions_sub_element.attractionsRequiredPassenger?.pax === null
          ) {
          } else {
            attractionsArray.push(attractions_sub_element);
          }
        }
      }
      element.attractions = attractionsArray;
      //element.attractions = element.attractions;
      if (index === 0) {
        element?.holidayPersonList?.forEach((elementHolidayPersonList) => {
          elementHolidayPersonList.requestId = Number(newRequestNo);
          delete elementHolidayPersonList.requestLineId;
          delete elementHolidayPersonList.requestLinePaxId;
        });
        element.holidayPersonList = element?.holidayPersonList;
      } else {
        element.holidayPersonList = [];
      }
      let roomsDummyArray: any[] = [];
      let roomArray = element.roomsData;
      roomArray.forEach((val) => roomsDummyArray.push(Object.assign({}, val)));
      roomsDummyArray.forEach((room_element, roomindex) => {
        room_element.id = 0;
        room_element.roomSrId = Number(newRequestNo);
        room_element.roomLineId = 0;
        room_element.roomNumber = roomindex + 1;
        room_element.roomAddonsRequired = 0;
        room_element.roomName =
          room_element.roomName === null || room_element.roomName === '' ? [] : [room_element.roomName];
        room_element.roomType =
          room_element.roomType === null || room_element.roomType === '' ? [] : [room_element.roomType];
        room_element.roomAdultCount = Number(room_element.roomAdultCount);
        room_element.roomChildCount = Number(room_element.roomChildCount);
        room_element.roomInfantCount = 0;
        room_element.roomStatus = room_element.roomStatus;
        room_element.roomCreatedBy = this.authService.getUser();
        room_element.roomCreatedDate = this.todaydateAndTimeStamp;
        room_element.roomCreatedDevice = this.deviceInfo?.userAgent;
        let childAge;
        room_element.childAge.forEach((child_element) => {
          if (childAge) {
            childAge = childAge + ',' + child_element.roomChildAges?.toString();
          } else {
            childAge = child_element.roomChildAges?.toString();
          }
        });
        room_element.roomChildAges = childAge;
        room_element.roomPassengersInfo = [];
        room_element.roomCreatedIp = null;
        /*  element.roomsPersonList.forEach((element) => {
          element.passengerSrId = Number(this.requestId);
          element.passengerStatus = 0;
        }); */
        //element.roomPassengersInfo = element.roomsPersonList;
        //delete element.roomsPersonList;
        delete room_element.childAge;
      });
      //roomsDummyArray
      element.roomsData = roomsDummyArray;
    });
    return flightsDummyArray;
  }
  onEditSubmitFlightForm() {
    this.submitted = true;
    this.isValidFormSubmitted = false;
    const flightsData = this.onEditSubmitFlightDataConversion();

    if (this.flights().value.length > 0) {
      for (let i = 0; i < this.flights().value.length; i++) {
        const flightElement = this.flights().value[i];
        const flightElementConvertData = flightsData[i];
        // check values empty or not
        if (typeof this.flights().value[i].fromCode === 'object') {
          this.flights().value[i].fromCode = this.flights().value[i].fromCode;
        } else {
          return this.toastrService.error('Please select start place', 'Error');
        }
        if (typeof this.flights().value[i].toCode === 'object') {
          this.flights().value[i].toCode = this.flights().value[i].toCode;
        } else {
          return this.toastrService.error('Please select end place', 'Error');
        }
        //check room pax
        if (flightElement?.roomsData?.length > 0) {
          let initialAdultCount: number = 0;
          let initialChildCount: number = 0;
          for (let roomindex = 0; roomindex < flightElement.roomsData.length; roomindex++) {
            const roomelement = flightElement.roomsData[roomindex];
            if (Number(roomelement.roomAdultCount) > 0) {
              initialAdultCount += Number(roomelement.roomAdultCount);
            }
            if (Number(roomelement.roomChildCount) > 0) {
              initialChildCount += Number(roomelement.roomChildCount);
            }
          }
          /* if((flightElementConvertData?.noofAdt >= initialAdultCount) ===false){
            return this.toastrService.error('room adult should be greater than pax adult ', 'Error');
          }
          if((flightElementConvertData?.noofChd >= initialChildCount) === false){
            return this.toastrService.error('room child should be greater than pax child ', 'Error');
          } */

          if (flightElementConvertData?.noofAdt >= initialAdultCount === false) {
            return this.toastrService.error('room adult should be greater than pax adult ', 'Error');
          }
          if (flightElementConvertData?.noofChd + flightElement.noofInf >= initialChildCount === false) {
            return this.toastrService.error('room child should be greater than pax child ', 'Error');
          }
        }
      }
    }
    // stop here if form is invalid
    if (this.flightForm.invalid) {
      return this.toastrService.error('please fill the required fields', 'Error');
    }


    if (this.flightForm.valid) {

      if (this.contactDetails) {
        const srRequestHeaderData = {
          createdBy: this.authService.getUser(),
          createdDate: this.todaydateAndTimeStamp,
          customerId: this.contactDetails?.customerId,
          contactId: this.contactDetails?.contact?.id,
          requestStatus: 1,
          priorityId: 1,
          severityId: 1,
          packageRequest: 1,
          dmcFlag:0
        };
        this.dashboardRequestService.createServiceRequestLine(srRequestHeaderData).pipe(takeUntil(this.ngDestroy$)).subscribe(
          (requestResponse: any) => {
            if (requestResponse?.requestId) {
              this.newRequestNo = requestResponse?.requestId;

              const flightsData = this.onEditSubmitFlightDataConversion(requestResponse?.requestId);
              //const flightsData = this.onEditSubmitFlightDataConversion();

              let payload = {
                serviceRequestLine: {
                  requestId: Number(requestResponse?.requestId),
                  passengerTypeId: 0,
                  lineStatusId: 0,
                  createdBy: this.authService.getUser(),
                  createdDate: this.todaydateAndTimeStamp,
                  expandableParametersCode: [],
                  dealCode: [],
                  //dealCode: dealsData,
                  //lineNo:this.UINICNUMBER
                  //addons: this.flightAddons().value
                },
                serviceRequestSegment: flightsData,
              };

              this.dashboardRequestService
                .createHolidayRequest(payload, apiUrls.Holiday_Package.createPackageRequest)
                .pipe(takeUntil(this.ngDestroy$))
                .subscribe(
                  (data: any) => {
                    if (data[0]?.requestLineId) {
                      this.srLineId = data[0]?.requestLineId;

                      let updateValue = 1;
                      updateValue += Number(this.route.snapshot.queryParams?.sources?.split('-')[1]);
                      this.router.navigate(['/dashboard/booking/holidays'], {
                        queryParams: {
                          requestId: this.newRequestNo,
                          contactId: this.contactid,
                          holidaysLineId: this.srLineId,
                          sources: `request-${Number.isNaN(updateValue) ? 1 : updateValue}`,
                        },
                      });
                      //this.FindById(Number(this.requestId));
                      this.toastrService.success('The service request has been sent successfuly !', 'Success');
                    } else {
                      this.toastrService.error(
                        'Oops! Something went wrong  while send the data please try again',
                        'Error'
                      );
                    }
                  },
                  (error) => {
                    this.toastrService.error(
                      'Oops! Something went wrong  while send the data please try again',
                      'Error'
                    );
                  }
                );
            }
          },
          (error) => {
            this.toastrService.error('Oops! Something went wrong  create request please try again ', 'Error');
          }
        );
      }
    } else {
      this.toastrService.error('please fill the required fields', 'Error');
    }
  }
  PaxDataConversion() {
    let convertPaxArray: any = [];
    //this.passengerList
    this.paxId?.forEach((val) => convertPaxArray.push(Object.assign({}, val)));
    convertPaxArray.forEach((element) => {
      element.requestLinePaxId = element.requestLinePaxId;
      element.paxId = element.paxId;
      element.statusId = element.statusId === null ? element.statusId : 0;
      element.createdBy = this.authService.getUser();
      element.createdDate = this.todaydateAndTimeStamp;
      element.updatedBy = this.authService.getUser();
      element.updatedDate = this.todaydateAndTimeStamp;
      element.firstName = element.firstName;
      element.lastName = element.lastName;
      element.email = element.email;
      element.phone = element.phone;
      element.nationality = element.nationality === null ? 0 : element.natioality;
      element.dob = element.dob;
      element.passport = element.passport === null ? 0 : element.passport;
      element.issuedCountry = element.issuedCountry === null ? 0 : element.issuedCountry;
      element.paxType = element.paxType === null ? 0 : element.paxType;
      element.passportIssueDate = element.passportIssueDate === null ? 0 : element.passportIssueDate;
      element.passportExpiredDate = element.passportExpiredDate === null ? 0 : element.passportExpiredDate;
      element.nationalityName = element.nationalityName === null ? 0 : element.nationalityName;
      element.issuedCountryName = element.issuedCountryName === null ? 0 : element.issuedCountryName;
      element.paxTypeName = element.paxTypeName === null ? 0 : element.paxTypeName;
      element.paxTypeCode = element.paxTypeCode === null ? 0 : element.paxTypeCode;
    });

    return convertPaxArray;
  }

  reloadComponent() {
    const requestId = this.route.snapshot.queryParams.requestId;
    const contactId = this.route.snapshot.queryParams.contactId;
    const holidaysLineId = this.route.snapshot.queryParams.holidaysLineId;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';

    let updateValue = 1;
    updateValue += Number(this.route.snapshot.queryParams?.sources?.split('-')[1]);
    this.router.navigate([`/dashboard/booking/holidays`], {
      queryParams: {
        requestId: requestId,
        contactId: contactId,
        holidaysLineId: holidaysLineId ,
        sources: `request-${Number.isNaN(updateValue) ? 1 : updateValue}`
      },
    });
  }
  /**
   * A method to bind the value of seclected element from the dropdown
   * @param $event dropdown selected option
   * @param index  index of the dynamic form
   * @param nameOfControl name of the form control in the dynamic form
   */
  bindValueOfControl($event: NgbTypeaheadSelectItemEvent, index: number, nameOfControl: string) {
    if ($event && index !== undefined && nameOfControl) {
      if (nameOfControl === 'toCode' || nameOfControl === 'fromCode' || nameOfControl === 'className') {
        this.flights().at(index).get(nameOfControl).patchValue($event.item.code);
      } else if (nameOfControl === 'airlineCode') {
        this.flights().at(index).get(nameOfControl).patchValue($event.item.shortCode2Digit);
      }
    }
  }

  bindValueOfFromControl($event: NgbTypeaheadSelectItemEvent, index: number, nameOfControl: string) {
    if ($event && index !== undefined && nameOfControl) {
      if (nameOfControl === 'fromCode') {
        this.flights().at(index).get('fromAirportOrCityName').patchValue($event.item.name);
        this.flights().at(index).get('fromCountryName').patchValue($event.item.country);
      }
    }
  }

  bindValueOfToControl($event: NgbTypeaheadSelectItemEvent, index: number, nameOfControl: string) {
    if ($event && index !== undefined && nameOfControl) {
      if (nameOfControl === 'toCode') {
        this.flights().at(index).get('toAirportOrCityName').patchValue($event.item.name);
        this.flights().at(index).get('toCountryName').patchValue($event.item.country);
        this.flights().at(index).get('toCityName').patchValue($event.item.city);
        const attractionsSendData = {
          city: $event.item.city
          //city: $event.item.city.trim().replace(/\s+/g, '')
          //country:$event.item.country
        };
        this.getAttrationsData(attractionsSendData, index);
        const toCodeObject = $event.item.code;
        this.hotelNamesBasedOnSegment.push(toCodeObject);
        this.flightTypeMultiCity(index, $event.item);
      } else {
        this.hotelNamesBasedOnSegment?.splice(index, 0, null);
      }
    }
  }
  /**
   * Trigger a call to the API to get the hotel name
   * data for from input
   */

  onSearchHotelName(mainIndex: number): (text: Observable<string>) => Observable<any[]> {
    return (text$: Observable<string>) =>
      text$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap((term: string) => (this.searchHotelNameTerm = term)),
        switchMap((term) =>
          term.length >= 3
            ? this.amendmentsServices
                .getHotelDeatils(term, this.hotelNamesBasedOnSegment[mainIndex], AMENDMENTS_HOTEL_URL.getHotelDetails)
                .pipe(
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
            : this.searchHotelNameResult?.filter(
                (v) => v.hotelName.toLowerCase().indexOf(this.searchHotelNameTerm.toLowerCase()) > -1
              );
          //console.log(this.searchHotelNameResult?.filter((v) => v.hotelName.toLowerCase().indexOf(this.searchHotelNameTerm.toLowerCase()) > -1).slice(0, 10));
        })
      );
  }
  getAttrationsData(toCodeData: any, mainIndex: number) {
    this.dashboardRequestService
      .getPackageActivity(toCodeData, apiUrls.Holiday_Package.packageActivity)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (res: any) => {
          if (res.length > 0) {
            res?.forEach((element) => {
              element.selectedAllAttractions = 'Select All';
            });
            this.attractionsData?.splice(mainIndex, 0, res);

            /*  if(!this.isEdit){
            const SelectAll = this.attractionsData[mainIndex]?.map((item) => item);
            if(this.attractionsData[mainIndex]?.length>0){
              for (let attrationsIndex = 0; attrationsIndex <  this.attractionsData[mainIndex]?.length; attrationsIndex++) {
                 const element =  this.attractionsData[mainIndex][attrationsIndex];
                this.flightAttractions(mainIndex).at(attrationsIndex)?.patchValue({
                  attractionName:SelectAll
                });
              }
            }
          } */
          } else {
            this.attractionsData?.splice(mainIndex, 0, []);
          }
        },
        (error) => {
          this.attractionsData?.splice(mainIndex, 0, []);
          this.toastrService.error(error, 'Error');
        }
      );
  }

  /**
   *  Helper function to get form element
   * @param index {number}
   * @returns
   */
  isFormContolArrayTouchedAndDirty(index: number): boolean {
    return this.flights().at(index).dirty && this.flights().at(index).touched;
  }

  isFormContolTransitTouchedAndDirty(): boolean {
    return this.flightForm.get('trasitPoint').dirty && this.flightForm.get('trasitPoint').touched;
  }

  // master lov call service calls
  getMasterClass() {
    this.masterDataService
      .getMasterDataByTableName('master_class')
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((data) => {
        if (data) {
          this.masterClassList = data;
          //  this.cdr.detectChanges();
        } else {
          this.toastrService.error('Oops! Something went wrong while fetching the Class Data', 'Error');
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
          this.cdr.markForCheck();
          //this.cdr.detectChanges();
        } else {
          this.toastrService.error('Oops! Something went wrong while fetching the hotel rating data', 'Error');
          this.cdr.markForCheck();
        }
      });
  }
  getMasterRbd() {
    this.masterDataService
      .getMasterDataByTableName('master_rbd')
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((data) => {
        if (data) {
          this.masterRbdList = data;
          this.cdr.markForCheck();
        } else {
          this.toastrService.error('Oops! Something went wrong while fetching the RBD Data ', 'Error');
        }
      });
  }
  getMasterExtenbalePerameters() {
    this.masterDataService
      .getMasterDataByTableName('master_extenbale_perameters')
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((data) => {
        if (data) {
          this.masterEPList = data;
          //  this.cdr.detectChanges();
        } else {
          this.toastrService.error(
            'Oops! Something went wrong while fetching the Expandable  Paremeters  Data',
            'Error'
          );
        }
      });
  }

  getMasterPaxType() {
    this.masterDataService
      .getMasterDataByTableName('master_pax_type')
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((data) => {
        if (data) {
          this.masterPaxTypeList = data;
          // this.cdr.detectChanges();
        } else {
          this.toastrService.error('Oops! Something went wrong while fetching the Pax type data ', 'Error');
        }
      });
  }
  /*
   *@params requestId{number},requestLineId{number}
   *Offline and online method for redirect
   */
  offline() {
    let requestId = this.requestId;
    let reqLineId = this.requestLineId;
    //window.location.href = "http://192.178.10.135/tt-ci-app/redirect?sr_no=" + requestId + "&sr_line_no=" + reqLineId + "&product=flight&channel=offline";
    const offlineUrl = `${environment.RFQREDIRECTOFFLINE}redirect?sr_no=${requestId}&sr_line_no=${reqLineId}&product=flight&channel=offline`;
    //alert(offlineUrl);
    window.open(offlineUrl, '_blank');
  }
  Online() {
    let requestId = this.requestId;
    let reqLineId = this.requestLineId;
    //window.location.href = `http://192.178.10.135/tt-ci-app/redirect?sr_no=" + ${requestId} + "&sr_line_no=" + ${reqLineId} + "&product=flight&channel=online`;
    const onlineUrl = `${environment.RFQREDIRECTOFFLINE}redirect?sr_no=${requestId}&sr_line_no=${reqLineId}&product=flight&channel=online`;
    //alert(onlineUrl);
    window.open(onlineUrl, '_blank');
  }

  MPTB() {
    let requestId = this.requestId;
    let reqLineId = this.requestLineId;
    const onlineUrl = `${environment.RFQREDIRECTOFFLINE}redirect?sr_no=${requestId}&sr_line_no=${reqLineId}&product=flight&channel=mptb`;
    //alert(onlineUrl);
    window.open(onlineUrl, '_blank');
  }

  redirectToFlightRfq() {
    const flightsData = this.flightDataConversion();
    const dealsData = this.dealsDataConversion();

    let saveFlightRFQ = {
      rfqLine: {
        requestId: Number(this.requestId),
        requestLineId: Number(this.requestLineId),
        tripTypeId: this.flightForm.get('tripTypeId').value === null ? null : this.flightForm.get('tripTypeId').value,
        noofADT: this.flightForm.get('noofADT').value === null ? null : this.flightForm.get('noofADT').value,
        noofCHD: this.flightForm.get('noofCHD').value === null ? null : this.flightForm.get('noofCHD').value,
        noofINF: this.flightForm.get('noofINF').value === null ? null : this.flightForm.get('noofINF').value,
        typeOfFlight:
          this.flightForm.get('typeOfFlight').value === null ? null : this.flightForm.get('typeOfFlight').value,
        connectingDetails:
          this.flightForm.get('connectingDetails').value === null
            ? null
            : this.flightForm.get('connectingDetails').value,
        flexStops: this.flightForm.get('flexStops').value === '' ? [] : this.flightForm.get('flexStops').value,
        passengerTypeId:
          this.flightForm.get('passengerTypeId').value === null ? null : this.flightForm.get('passengerTypeId').value,
        createdBy: this.authService.getUser(),
        createdDate: this.todaydateAndTimeStamp,
        expandableParametersCode:
          this.flightForm.get('expandableParametersCode').value !== ''
            ? this.flightForm.get('expandableParametersCode').value
            : [],

        dealCode: dealsData,

        //addons: this.flightAddons().value === '' || this.flightAddons().value === [' '] ? [] : this.flightAddons().value,
        //rfqNo:1
        //addons: this.flightAddons().value
      },
      rfqSegments: flightsData,
      rfqSupplierRelation: [],
    };
    this.rfqFlightServices
      .createRFQFlight(saveFlightRFQ, 0)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (data: any) => {
          const responseRFQID = data.rfqLine.rfqId;
          //const responserfqNo=data.rfqLine.rfqNo;
          if (responseRFQID) {
            this.router.navigate(['/dashboard/rfq/flight'], {
              queryParams: {
                requestId: this.requestId,
                contactId: this.contactid,
                srLine: this.requestLineId,
                rfq_id: responseRFQID,
              },
            });
          }
        },
        (error) => {
          this.toastrService.error('Oops! Something went wrong  while send the data please try again', 'Error');
        }
      );
  }

  /**
   *
   * selected passengers
   * selectedUsers: Passengers[]
   */
  selectedPassengers() {
    this.SelectedPassengersService.getData()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res: any) => {
        if (res?.passengers?.length > 0) {
          for (let r = 0; r < res.passengers.length; r++) {
            //this.passengersList.push(res.passengers[r]);
            const modifyHolidayPaxData = {
              paxId: res?.passengers[r].paxId,
              prefix: res?.passengers[r].prefix,
              firstName: res?.passengers[r].firstName,
              lastName: res?.passengers[r].lastName,
              dob:
                res?.passengers[r].dob === '' || res?.passengers[r].dob === null || res?.passengers[r].dob === undefined
                  ? null
                  : res?.passengers[r].dob,
              nationality:
                res?.passengers[r].nationality?.id === undefined || res?.passengers[r].nationality?.id === null
                  ? null
                  : res?.passengers[r].nationality?.id,
              //nationality: res?.passengers[r].nationality?.id,
              nationalityName:
                res?.passengers[r].nationality?.name === undefined || res?.passengers[r].nationality?.name === null
                  ? null
                  : res?.passengers[r].nationality?.name,
              issuedCountry:
                res?.passengers[r].issuedCountry?.id === undefined || res?.passengers[r].issuedCountry?.id === null
                  ? null
                  : res?.passengers[r].issuedCountry?.id,
              issuedCountryName:
                res?.passengers[r].issuedCountry?.name === undefined || res?.passengers[r].issuedCountry?.name === null
                  ? null
                  : res?.passengers[r].issuedCountry?.name,
              passport: res?.passengers[r].passport,
              email: res?.passengers[r].email,
              phone: res?.passengers[r].phone,
              paxIsDeleted: res?.passengers[r].paxIsDeleted,
              paxType: res?.passengers[r].paxType?.id,
              paxCode: res?.passengers[r].paxType?.name,
              assign: Number(res?.passengers[r]?.assigned?.split('-')[1]),
              passportExpiredDate: res?.passengers[r].passportExpiredDate,
              passportIssueDate: res?.passengers[r].passportIssueDate,
              requestLinePaxId: res?.passengers[r].requestLinePaxId,
              requestLineId: this.srLineId,
              createdDate: this.todaydateAndTimeStamp,
              createdBy: this.authService.getUser(),
              updatedBy: this.authService.getUser(),
              updatedDate: this.todaydateAndTimeStamp,
              requestId: this.requestId,
            };

            (this.flights().at(res?.holidayIndex)?.get('holidayPersonList') as FormArray)?.push(
              this.fb.group(modifyHolidayPaxData)
            );
            /*  this.paxId.push({
            paxId: res?.passengers[r].paxId,
            prefix: res?.passengers[r].prefix,
            firstName: res?.passengers[r].firstName,
            lastName: res?.passengers[r].lastName,
            dob: res?.passengers[r].dob,
            nationality: res?.passengers[r].nationality?.id === undefined || res?.passengers[r].nationality?.id === null ? null : res?.passengers[r].nationality?.id,
            //nationality: res?.passengers[r].nationality?.id,
            nationalityName: res?.passengers[r].nationality?.name  === undefined  || res?.passengers[r].nationality?.name === null  ? null : res?.passengers[r].nationality?.name,
            issuedCountry: res?.passengers[r].issuedCountry?.id === undefined ||res?.passengers[r].issuedCountry?.id === null ? null : res?.passengers[r].issuedCountry?.id,
            issuedCountryName: res?.passengers[r].issuedCountry?.name === undefined  ||res?.passengers[r].issuedCountry?.name === null ? null : res?.passengers[r].issuedCountry?.name,
            passport: res?.passengers[r].passport,
            email: res?.passengers[r].email,
            phone: res?.passengers[r].phone,
            paxType: res?.passengers[r].paxType?.id,
            passportExpiredDate: res?.passengers[r].passportExpiredDate,
            passportIssueDate: res?.passengers[r].passportIssueDate,
            requestLinePaxId: res?.passengers[r].requestLinePaxId,
            createdDate: this.todaydateAndTimeStamp,
          }); */
          }
          //this.holidayPassengers?.splice(res.holidayIndex, 0, this.passengersList);
        }

        this.cdr.markForCheck();
      });
  }

  totalAdultsCount() {
    //this.totalAdultsData = 0;
    let adults = 0;
    /* for (let i = 0; i <= this.roomsData().value.length; i++) {
    this.totalAdultsData += Number(this.hotelForm.value.roomsData[i].roomAdultCount);
  }
  return this.totalAdultsData; */
  }

  /********************************************************************
   * find call service and respones patch the form
   ********************************************************************/
  FindById(srId) {
    this.dashboardRequestService
      .getPackageRequest(apiUrls.Holiday_Package.getPackageRequest, srId)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (requestResponse: any) => {
          if (requestResponse?.length > 0) {
            this.isEdit = true;
            this.isValidFormSubmitted = false;

            for (let requestResponseIndex = 0; requestResponseIndex < requestResponse?.length; requestResponseIndex++) {
              const element = requestResponse[requestResponseIndex];
              this.srLineId = requestResponse[requestResponseIndex]?.requestLineId;
              //this.getAddonsRoutesData(requestResponseIndex,requestResponse);

              if (requestResponseIndex > 0) {
                const fg = this.newFlight();
                this.flights().push(fg);
                //popovers arrays
                this.rowsControlsForMultiCity.push({
                  isCollapsed: true,
                });
                this.rowsControlsForDepature.push({
                  isCollapsedDepature: true,
                });
                this.rowsControlsForreturn.push({
                  isCollapsedreturn: true,
                });
                this.rowsControlsFlexForm.push({
                  isCollapsedFlexFrom: true,
                });
                this.rowsControlsFlexTo.push({
                  isCollapsedFlexTo: true,
                });
                this.rowsControlsFlexClass.push({
                  isCollapsedFlexClass: true,
                });
                this.rowsControlsFlexAirline.push({
                  isCollapsedFlexAirline: true,
                });
                this.rowsControlsLPODetails.push({
                  isCollapsedLpo: true,
                });
                this.rowsControlsAddonsDetails.push({
                  isCollapsedAddons: true,
                });
                this.rowsControlsPassengersDetails.push({
                  isCollapsedPassengers: true,
                });
                this.rowsControlsAttractions.push({
                  isCollapsedAttractions: true,
                });
                this.rowsControlsPackage.push({
                  isCollapsedPackage: false,
                });
              }
              //fromCode and toCode AirLineCode patch model
              const item = {
                code: element.serviceSegments?.fromCode,
                city: null,
                cityCode: null,
                country: element.serviceSegments?.fromCountryName,
                countryCode: null,
                createdBy: null,
                createdDate: null,
                id: null,
                name: element.serviceSegments?.fromAirportOrCityName,
                status: null,
                timeZone: null,
                type: null,
                updatedBy: null,
                updatedDate: null,
              };

              const toCodeObject = {
                code: element.serviceSegments?.toCode,
                city: null,
                cityCode: null,
                country: element.serviceSegments?.toCountryName,
                countryCode: null,
                createdBy: null,
                createdDate: null,
                id: null,
                name: element.serviceSegments?.toAirportOrCityName,
                status: null,
                timeZone: null,
                type: null,
                updatedBy: 0,
                updatedDate: null,
              };
             /*  const attractionsSendData = {
                //city: element.serviceSegments?.toAirportOrCityName,
                //city: element.serviceSegments?.toCode,
                country:element.serviceSegments?.toCountryName
              };


              this.getAttrationsData(attractionsSendData, requestResponseIndex); */
              const airLine = {
                airLineType: null,
                code: null,
                createdBy: null,
                createdDate: null,
                id: null,
                name: null,
                parentAirline: null,
                //shortCode2Digit: element.serviceSegments?.airlineCode,
                shortCode2Digit: requestResponse[requestResponseIndex].airlineCode,
                shortCode3Digit: null,
                status: null,
                udatedBy: null,
                updatedDate: null,
              };

              this.flights()
                .at(requestResponseIndex)
                .patchValue({
                  requestLineId: element.serviceSegments?.requestLineId,
                  requestId: this.requestId,
                  requestSegmentId: element.serviceSegments?.requestSegmentId,
                  fromCode: item,
                  toCode: toCodeObject,
                  airlineCode: airLine,
                  fromAirportOrCityName: element.serviceSegments?.fromAirportOrCityName,
                  fromCountryName: element.serviceSegments?.fromCountryName,
                  toAirportOrCityName: element.serviceSegments?.toAirportOrCityName,
                  toCountryName: element.serviceSegments?.toCountryName,
                  //flexClassName: this.updateDataSegmentData[j]?.flexClassName,
                  rbd: element.serviceSegments?.rbd,
                  validateCarrier: element.serviceSegments?.validateCarrier,
                  budgetFrom: element.serviceSegments?.budgetFrom,
                  budgetTo: element.serviceSegments?.budgetTo,
                  className: element.serviceSegments?.className,
                  propertyType: element.serviceSegments?.propertyType,
                  lineRoomCount: element.serviceSegments?.lineRoomCount,
                  depatureDate: {
                    year: Number(element.serviceSegments?.depatureDate?.split(['-'])[0]),
                    month: Number(element.serviceSegments?.depatureDate?.split(['-'])[1]),
                    day: Number(element.serviceSegments?.depatureDate?.split(['-'])[2]?.substring(0, 2)),
                  },
                  //depatureDate: this.datepipe.transform(this.updateDataSegmentData[j]?.depatureDate, 'yyyy-MM-dd'),
                  //returnDate: this.datepipe.transform(this.updateDataSegmentData[j]?.returnDate, 'yyyy-MM-dd'),
                  transitPointCode: element.serviceSegments?.transitPointCode,
                  excludePointCode: element.serviceSegments?.excludePointCode,
                  holidayDays: element.serviceSegments?.holidayDays,
                  hotelRatings: element.serviceSegments?.hotelRatings,
                  modeOfTransport: element.serviceSegments?.modeOfTransport,
                  lpoDate: this.datepipe.transform(element?.lpoDate, 'yyyy-MM-dd'),
                  lpoAmount: element.lpoAmount === '0.00' ? '' : element.lpoAmount,
                  lpoNumber: element.lpoNumber === '0' ? '' : element.lpoNumber,
                  noofAdt: element.noofAdt === null ? 1 : element.noofAdt,
                  noofChd: element.noofChd === null ? 0 : element.noofChd,
                  noofInf: element.noofInf === null ? 0 : element.noofInf,

                  passengerTypeId: element?.passengerTypeId,
                  lineStatusId: element?.lineStatusId,
                  lineNo: element?.lineNo,
                  lineUuid: element?.lineUuid,
                });
              if (requestResponseIndex === 0) {
                this.flights().at(requestResponseIndex).patchValue({
                  hiddenDepatureDate: null,
                });
              } else {
                this.flights()
                  .at(requestResponseIndex)
                  .patchValue({
                    hiddenDepatureDate: {
                      year: Number(element.serviceSegments?.depatureDate?.split(['-'])[0]),
                      month: Number(element.serviceSegments?.depatureDate?.split(['-'])[1]),
                      day: Number(element.serviceSegments?.depatureDate?.split(['-'])[2]?.substring(0, 2)),
                    },
                  });
              }
              //this.showProductDetailsInfo(requestResponseIndex, '');
              this.onChangePax(requestResponseIndex);
              this.onChangeDaysEdit(element.serviceSegments?.holidayDays, requestResponseIndex, 'noChanges');
              //this.showProductDetailsInfo(requestResponseIndex, '');

              //transitPointCode patch
              if (
                requestResponseIndex === 0 &&
                element.serviceSegments?.transitPointCode &&
                element.serviceSegments?.transitPointCode?.length > 0
              ) {
                for (let k = 0; k < element.serviceSegments?.transitPointCode?.length; k++) {
                  if (element.serviceSegments?.transitPointCode[k] === '') {
                    continue;
                  }
                  this.selectedTransitPointItems.push(element.serviceSegments?.transitPointCode[k]);
                }
              }
              //excludePointCode patch
              if (
                requestResponseIndex === 0 &&
                element.serviceSegments?.excludePointCode &&
                element.serviceSegments?.excludePointCode?.length > 0
              ) {
                for (let e = 0; e < element.serviceSegments?.excludePointCode?.length; e++) {
                  if (element.serviceSegments?.excludePointCode[e] === '') {
                    continue;
                  }
                  this.selectedExludedPoints.push(element.serviceSegments?.excludePointCode[e]);
                }
              }
              //flexFromCode patching
              if (element.serviceSegments?.flexFromCode && element.serviceSegments?.flexFromCode?.length > 0) {
                if (element.serviceSegments?.flexFromCode?.length === 1) {
                  if (element.serviceSegments?.flexFromCode[0] !== '') {
                    this.selectedFlexFromItems.push(element.serviceSegments?.flexFromCode);
                  }
                } else {
                  this.selectedFlexFromItems.push(element.serviceSegments?.flexFromCode);
                }
              }
              // flextoCode patching
              if (element.serviceSegments?.flexToCode && element.serviceSegments?.flexToCode?.length > 0) {
                if (element.serviceSegments?.flexToCode?.length === 1) {
                  if (element.serviceSegments?.flexToCode[0] !== '') {
                    this.selectedFlexToItems.push(element.serviceSegments?.flexToCode);
                  }
                } else {
                  this.selectedFlexToItems.push(element.serviceSegments?.flexToCode);
                }
              }
              // flexAirLineCode patching
              if (element.serviceSegments?.flexAirLineCode && element.serviceSegments?.flexAirLineCode?.length > 0) {
                if (element.serviceSegments?.flexAirLineCode?.length === 1) {
                  if (element.serviceSegments?.flexAirLineCode[0] !== '') {
                    this.selectedFlexAirLineItems.push(element.serviceSegments?.flexAirLineCode);
                  }
                } else {
                  this.selectedFlexAirLineItems.push(element.serviceSegments?.flexAirLineCode);
                }
              }
              // flexClassName patching
              if (element.serviceSegments?.flexClassName && element.serviceSegments?.flexClassName?.length > 0) {
                if (element.serviceSegments?.flexClassName?.length === 1) {
                  if (element.serviceSegments?.flexClassName[0] !== '') {
                    this.flights().at(requestResponseIndex).patchValue({
                      flexClassName: element.serviceSegments?.flexClassName,
                    });
                  }
                } else {
                  this.flights().at(requestResponseIndex).patchValue({
                    flexClassName: element.serviceSegments?.flexClassName,
                  });
                }
              }
              this.requestSegmentId = element.serviceSegments?.requestSegmentId;
              if (element.serviceSegments?.flexDepature?.length > 0) {
                for (let d = 0; d < element.serviceSegments?.flexDepature?.length; d++) {
                  if (d > 0) {
                    const fg = this.newDepature();
                    this.depature(requestResponseIndex).push(fg);
                  }
                  this.depature(requestResponseIndex)
                    .at(d)
                    .patchValue({
                      flexDepatureDate: this.datepipe.transform(
                        element.serviceSegments?.flexDepature[d]?.flexDepatureDate,
                        'yyyy-MM-dd'
                      ),
                      flexDepatureTime: element.serviceSegments?.flexDepature[d]?.flexDepatureTime,
                    });
                }
              }
              if (element.serviceSegments?.flexReturn?.length > 0) {
                for (let r = 0; r < element.serviceSegments?.flexReturn?.length; r++) {
                  if (r > 0) {
                    const fg = this.newReturn();
                    this.Returndate(requestResponseIndex).push(fg);
                  }
                  this.Returndate(requestResponseIndex)
                    .at(r)
                    .patchValue({
                      flexReturnDate: this.datepipe.transform(
                        element.serviceSegments?.flexReturn[r]?.flexReturnDate,
                        'yyyy-MM-dd'
                      ),
                      flexReturnTime: element.serviceSegments?.flexReturn[r]?.flexReturnTime,
                    });
                }
              }
              this.requestLineId = element.serviceSegments?.requestLineId;
              // Deal array patch data
              if (element.serviceSegments?.dealCode?.length > 0) {
                for (let i = 0; i < element.serviceSegments?.dealCode?.length; i++) {
                  const dealairLine = {
                    airLineType: null,
                    code: null,
                    createdBy: null,
                    createdDate: null,
                    id: null,
                    name: null,
                    parentAirline: null,
                    shortCode2Digit: element.serviceSegments?.dealCode[i]?.airlineCode,
                    shortCode3Digit: null,
                    status: null,
                    udatedBy: null,
                    updatedDate: null,
                  };
                  if (i > 0) {
                    const fg = this.newDeal();
                    this.deals().push(fg);
                  }
                  ((this.flightForm.get('dealCode') as FormArray).at(i) as FormGroup).patchValue({
                    dealCode: element.serviceSegments?.dealCode[i]?.dealCode,
                    airlineCode: dealairLine,
                  });
                }
              }
              let normalAddOnsPatch = [];
              if (element?.addons?.length > 0) {
                for (let addonsPacthIndex = 0; addonsPacthIndex < element?.addons?.length; addonsPacthIndex++) {
                  const addonsElement = element?.addons[addonsPacthIndex];


                  if(addonsElement&&addonsElement?.city&&addonsElement?.city !== ''){
                    const attractionsSendData = {
                      city: addonsElement.city,
                      };
                    this.flights().at(requestResponseIndex).get('toCityName').patchValue(addonsElement.city);
                    this.getAttrationsData(attractionsSendData, requestResponseIndex);
                  }


                  if (addonsElement?.addOnType?.id === 269) {
                    if(addonsElement?.dynamicTabData){
                       if(addonsElement?.dynamicTabData?.length>0){
                        for (let index = 0; index < addonsElement?.dynamicTabData.length; index++) {
                          const element = addonsElement?.dynamicTabData[index];
                          this.onPackageDynamicForm(element,requestResponseIndex);
                        }
                       }
                    }
                  }

                  if (
                    addonsElement?.addOnType?.id === 271 ||
                    addonsElement?.addOnType?.id === 272 ||
                    addonsElement?.addOnType?.id === 275 ||
                    addonsElement?.addOnType?.id === 269 ||
                    addonsElement?.city
                  ) {
                    // console.log('fixed addons',addonsElement?.addOnType?.id);
                  } else {

                    normalAddOnsPatch.push(addonsElement);
                  }
                }
                if(normalAddOnsPatch?.length>0){
                  for (let normalAddonsIndex = 0; normalAddonsIndex < normalAddOnsPatch.length; normalAddonsIndex++) {
                    const normalAddonsElement = normalAddOnsPatch[normalAddonsIndex];
                    if (normalAddonsIndex > 0) {
                      const fg = this.newFlightAddons();
                      this.flightAddons(requestResponseIndex).push(fg);
                    }

                    this.flightAddons(requestResponseIndex).at(normalAddonsIndex)?.patchValue({
                      /* addOnType: {
                        id: element?.addons[addonsPacthIndex]?.addOnType?.id,
                        name: element?.addons[addonsPacthIndex]?.addOnType?.name,
                      }, */
                      addOnType: normalAddonsElement?.addOnType,
                      remarks: normalAddonsElement?.remarks,
                      extraCost: normalAddonsElement?.extraCost,
                      required: normalAddonsElement?.required,
                    });
                    this.flightAddons(requestResponseIndex).at(normalAddonsIndex)?.get('requiredPassenger')?.patchValue({
                      all: normalAddonsElement?.requiredPassenger?.all,
                      passengers: normalAddonsElement?.requiredPassenger?.passengers,
                    });
                  }
                }
                let insuranceAddOnsPatch = [];
                let visaAddOnsPatch = [];
                let forexAddOnsPatch = [];

                element?.addons?.forEach((data, index) => {
                  if (data?.addOnType?.id === 271) {
                    insuranceAddOnsPatch.push(data);
                  }
                  if (data?.addOnType?.id === 272) {
                    visaAddOnsPatch.push(data);
                  }
                  if (data?.addOnType?.id === 275) {
                    forexAddOnsPatch.push(data);
                  }
                });

                if (insuranceAddOnsPatch?.length > 0) {
                  insuranceAddOnsPatch?.forEach((patchdata, index) => {
                    if (patchdata?.addOnType?.id === 271) {
                      if (index > 0) {
                        const fg = this.newInsuranceAddons();
                        this.insuranceAddons(requestResponseIndex).push(fg);
                      }

                      this.insuranceAddons(requestResponseIndex).at(index)?.patchValue({
                        addOnType: patchdata?.addOnType,
                        remarks: patchdata?.remarks,
                        required: patchdata?.required,
                      });
                      this.insuranceAddons(requestResponseIndex).at(index)?.get('requiredPassenger')?.patchValue({
                        all: patchdata?.requiredPassenger?.all,
                        passengers: patchdata?.requiredPassenger?.passengers,
                      });
                    }
                  });
                }

                if (visaAddOnsPatch?.length > 0) {
                  visaAddOnsPatch?.forEach((patchdata, index) => {
                    if (patchdata?.addOnType?.id === 272) {
                      if (index > 0) {
                        const fg = this.newVisaAddons();
                        this.visaAddons(requestResponseIndex).push(fg);
                      }

                      this.visaAddons(requestResponseIndex).at(index)?.patchValue({
                        addOnType: patchdata?.addOnType,
                        remarks: patchdata?.remarks,
                        required: patchdata?.required,
                      });
                      this.visaAddons(requestResponseIndex).at(index)?.get('requiredPassenger')?.patchValue({
                        all: patchdata?.requiredPassenger?.all,
                        passengers: patchdata?.requiredPassenger?.passengers,
                      });
                    }
                  });
                }

                if (forexAddOnsPatch?.length > 0) {
                  forexAddOnsPatch?.forEach((forexPatchData, index) => {
                    if (forexPatchData?.addOnType?.id === 275) {
                      if (index > 0) {
                        const fg = this.newForexAddons();
                        this.forexAddons(requestResponseIndex).push(fg);
                      }
                      this.forexAddons(requestResponseIndex)
                        .at(index)
                        ?.patchValue({
                          addOnType: forexPatchData?.addOnType,
                          currency: forexPatchData?.currency,
                          wantCurrency: forexPatchData?.wantCurrency,
                          mop: forexPatchData?.mop,
                          amount:
                            forexPatchData?.amount === '' || forexPatchData?.amount === null
                              ? ''
                              : Number(forexPatchData?.amount)?.toFixed(2),
                          needByDate: this.datepipe.transform(forexPatchData?.needByDate, 'yyyy-MM-dd'),
                          note: forexPatchData?.note,
                        });
                    }
                  });
                }
              }


              if (element?.exclusions?.length > 0) {
                for (
                  let exclusionsPacthindex = 0;
                  exclusionsPacthindex < element?.exclusions?.length;
                  exclusionsPacthindex++
                ) {
                  const addonsElement = element?.exclusions[exclusionsPacthindex];
                  if (exclusionsPacthindex > 0) {
                    const fg = this.newFlightExclusions();
                    this.flightExclusionsAddons(requestResponseIndex).push(fg);
                  }
                  this.flightExclusionsAddons(requestResponseIndex).at(exclusionsPacthindex)?.patchValue({
                    addOnType: addonsElement?.addOnType,
                    required: addonsElement?.required,
                  });
                  this.flightExclusionsAddons(requestResponseIndex)
                    .at(exclusionsPacthindex)
                    ?.get('requiredPassenger')
                    ?.patchValue({
                      all: addonsElement?.requiredPassenger?.all,
                      passengers: addonsElement?.requiredPassenger?.passengers,
                    });
                }
              }

              if (element?.attractions?.length > 0) {
                for (
                  let attractionsPacthindex = 0;
                  attractionsPacthindex < element?.attractions?.length;
                  attractionsPacthindex++
                ) {
                  if (attractionsPacthindex > 0) {
                    const fg = this.newFlightAttractions();
                    this.flightAttractions(requestResponseIndex).push(fg);
                  }
                  this.attractionsDaySelectShowTheError(requestResponseIndex,attractionsPacthindex);
                  this.flightAttractions(requestResponseIndex).at(attractionsPacthindex)?.patchValue({
                    attractionName: element?.attractions[attractionsPacthindex]?.attractionName,
                    remarks: element?.attractions[attractionsPacthindex]?.remarks,
                    attractionDay: element?.attractions[attractionsPacthindex]?.attractionDay,
                    extraCost: element?.attractions[attractionsPacthindex]?.extraCost,
                    required: element?.attractions[attractionsPacthindex]?.required,
                  });
                  this.flightAttractions(requestResponseIndex)
                    .at(attractionsPacthindex)
                    ?.get('attractionsRequiredPassenger')
                    ?.patchValue({
                      all: element?.attractions[attractionsPacthindex]?.attractionsRequiredPassenger?.all,
                      pax: element?.attractions[attractionsPacthindex]?.attractionsRequiredPassenger?.pax,
                    });
                  this.onChangeAttractionName(requestResponseIndex, attractionsPacthindex);
                  /* if (element?.attractions[attractionsPacthindex]?.attractionsRequiredPassenger?.pax?.length === this.addonsPassengers[requestResponseIndex]?.length) {
                  console.log('attractions if');
                  this.flightAddons(requestResponseIndex).at(attractionsPacthindex)?.get('attractionsRequiredPassenger')?.patchValue({
                    pax:element?.attractions[attractionsPacthindex]?.attractionsRequiredPassenger?.pax,
                  });
                  } else {
                    console.log('atraction-else');
                    this.flightAddons(requestResponseIndex).at(attractionsPacthindex)?.get('attractionsRequiredPassenger')?.patchValue({
                      pax:element?.attractions[attractionsPacthindex]?.attractionsRequiredPassenger?.pax,
                    });
                  } */
                }
              }
              /* if (element?.holidayPersonList?.length > 0) {
              let personArray = [];
              let holidayPaxDetails = {};
              for (let index = 0; index < element?.holidayPersonList.length; index++) {
                const holidayelement = element?.holidayPersonList[index];
                const assignedData=holidayelement.paxCode+'-'+holidayelement?.assign;
                const PERSONDATA: any = {
                  createdBy: holidayelement.createdBy,
                  createdDate: holidayelement.createdDate,
                  dob: holidayelement.dob,
                  email: holidayelement.email,
                  firstName: holidayelement.firstName,
                  isContactSr: holidayelement.isContactSr,
                  issuedCountry: {
                    id: holidayelement.issuedCountry,
                    name: holidayelement.issuedCountryName,
                  },
                  lastName: holidayelement.lastName,
                  nationality: {
                    id: holidayelement.nationality,
                    name: holidayelement.nationalityName,
                  },
                  passport: holidayelement.passport,
                  passportExpiredDate: holidayelement.passportExpiredDate,
                  passportIssueDate: holidayelement.passportIssueDate,
                  paxId: holidayelement.paxId,
                  assigned: assignedData,
                  //assigned: holidayelement?.assign,
                  paxIsDeleted: holidayelement.paxIsDeleted,
                  paxType: {
                    id: holidayelement.paxType,
                    code: holidayelement.paxCode,
                    name: holidayelement.paxCode,
                  },
                  phone: holidayelement.phone,
                  requestId: holidayelement.requestId,
                  requestLineId: this.srLineId,
                  requestLinePaxId: holidayelement.requestLinePaxId,
                  statusId: holidayelement.statusId,
                  updatedBy: holidayelement.updatedBy,
                  updatedDate: holidayelement.updatedDate,
                };
                personArray.push(PERSONDATA);
                holidayPaxDetails = {
                  passengers: personArray,
                  holidayIndex: requestResponseIndex,
                };
              }
              this.SelectedPassengersService.sendData(holidayPaxDetails);
            } */
              if (element.serviceSegments?.lineRoomCount) {
                const roomCount = {
                  target: {
                    value: element.serviceSegments?.lineRoomCount,
                  },
                };

                this.onChangeRoomsEdit(requestResponseIndex, element.roomData);
              }
            }

            //this.coallpseAll('');
            if (requestResponse[0]?.holidayPersonList?.length > 0) {
              let personArray = [];
              let holidayPaxDetails = {};
              for (let index = 0; index < requestResponse[0]?.holidayPersonList.length; index++) {
                const holidayelement = requestResponse[0]?.holidayPersonList[index];
                const assignedData = holidayelement.paxCode + '-' + holidayelement?.assign;
                const PERSONDATA: any = {
                  createdBy: holidayelement.createdBy,
                  createdDate: holidayelement.createdDate,
                  dob: holidayelement.dob,
                  email: holidayelement.email,
                  firstName: holidayelement.firstName,
                  isContactSr: holidayelement.isContactSr,
                  issuedCountry: {
                    id: holidayelement.issuedCountry,
                    name: holidayelement.issuedCountryName,
                  },
                  lastName: holidayelement.lastName,
                  nationality: {
                    id: holidayelement.nationality,
                    name: holidayelement.nationalityName,
                  },
                  passport: holidayelement.passport,
                  passportExpiredDate: holidayelement.passportExpiredDate,
                  passportIssueDate: holidayelement.passportIssueDate,
                  paxId: holidayelement.paxId,
                  assigned: assignedData,
                  //assigned: holidayelement?.assign,
                  paxIsDeleted: holidayelement.paxIsDeleted,
                  paxType: {
                    id: holidayelement.paxType,
                    code: holidayelement.paxCode,
                    name: holidayelement.paxCode,
                  },
                  phone: holidayelement.phone,
                  requestId: holidayelement.requestId,
                  requestLineId: this.srLineId,
                  requestLinePaxId: holidayelement.requestLinePaxId,
                  statusId: holidayelement.statusId,
                  updatedBy: holidayelement.updatedBy,
                  updatedDate: holidayelement.updatedDate,
                };
                personArray.push(PERSONDATA);
                holidayPaxDetails = {
                  passengers: personArray,
                  holidayIndex: 0,
                };
              }
              this.SelectedPassengersService.sendData(holidayPaxDetails);
            }
          }

          //this.coallpseAll('');
          //console.log(this.flights().value);
        },
        (error) => {
          this.isEdit = false;
          this.toastrService.error(error, 'Error');
        }
      );
  }

  OnClickExplode() {
    if (this.flightForm.invalid) {
      return this.toastrService.error('please fill the required fields', 'Error');
    }
    const flightsData = [...this.flightDataConversion()];
    const dealsData = [...this.dealsDataConversion()];
    const payload = {
      serviceRequestLine: {
        requestId: this.requestId,
        tripTypeId: this.flightForm.get('tripTypeId').value,
        noofADT: this.flightForm.get('noofADT').value,
        noofCHD: this.flightForm.get('noofCHD').value,
        noofINF: this.flightForm.get('noofINF').value,
        typeOfFlight: this.flightForm.get('typeOfFlight').value,
        connectingDetails: this.flightForm.get('connectingDetails').value,
        flexStops: this.flightForm.get('flexStops').value,
        passengerTypeId: this.flightForm.get('passengerTypeId').value,
        createdBy: 1,
        createdDate: this.todayDate1,
        expandableParametersCode:
          this.flightForm.get('expandableParametersCode').value !== ''
            ? this.flightForm.get('expandableParametersCode').value
            : null,
        dealCode: [...dealsData],
      },
      serviceRequestSegment: [...flightsData],
    };

    this.explodeRequest(payload);
  }
  explodeRequest(requestData: SrSegmentHeader) {
    // let restData: SrSegmentHeader = {...requestData};
    // let restData: SrSegmentHeader = Object.assign({}, requestData);
    const rest1Data: SrSegmentHeader = Object.assign({}, requestData);
    let restData: SrSegmentHeader = Object.assign({}, rest1Data);
    let postData: any[] = [];
    restData.serviceRequestSegment.forEach((data) => {
      /* data['noofADT'] = restData.serviceRequestLine.noofADT;
    data['noofCHD'] = restData.serviceRequestLine.noofCHD;
    data['noofINF'] = restData.serviceRequestLine.noofINF; */
      // flex from
      let flexFromCode = [...[]];
      if (data.flexFromCode && data.flexFromCode?.length > 0) {
        flexFromCode = [...data.flexFromCode];
        flexFromCode.push(data.fromCode);
      } else {
        flexFromCode = [...[]];
        flexFromCode.push(data.fromCode);
      }

      // flex to
      let flexToCode = [...[]];
      if (data.flexToCode && data.flexToCode?.length > 0) {
        flexToCode = [...data.flexToCode];
        flexToCode.push(data.toCode);
      } else {
        flexToCode = [...[]];
        flexToCode.push(data.toCode);
      }

      // flex class
      let flexClassName = [...[]];
      if (data.flexClassName && data.flexClassName?.length > 0) {
        flexClassName = [...data.flexClassName];
        flexClassName = this.masterClassList.filter((o1) => data.flexClassName.some((o2) => o1.code === o2));
        flexClassName.push(this.masterClassList.find((v) => v.code === data.className));
      } else {
        flexClassName = [...[]];
        flexClassName.push(this.masterClassList.find((v) => v.code === data.className));
      }

      //flexDepature
      let flexDepature = [...[]];
      if (data.flexDepature && data.flexDepature?.length > 0) {
        flexDepature = [...data.flexDepature];
        if (flexDepature?.length === 1) {
          if (flexDepature[0].flexDepatureDate === '' || !flexDepature[0].flexDepatureDate) {
            flexDepature = [];
            flexDepature.push({ flexDepatureDate: data.depatureDate, flexDepatureTime: '' });
          } else {
            flexDepature.push({ flexDepatureDate: data.depatureDate, flexDepatureTime: '' });
          }
        } else {
          flexDepature.push({ flexDepatureDate: data.depatureDate, flexDepatureTime: '' });
        }
      } else {
        flexDepature = [...[]];
        flexDepature.push({ flexDepatureDate: data.depatureDate, flexDepatureTime: '' });
      }

      // flexReturn
      let flexReturn = [];
      if (Number(restData.serviceRequestLine.tripTypeId) === 69) {
        flexReturn = [...data.flexReturn];
        if (data.flexReturn && data.flexReturn?.length > 0) {
          if (data.flexReturn?.length === 1) {
            if (data.flexReturn[0].flexReturnDate === '' || !data.flexReturn[0].flexReturnDate) {
              flexReturn = [...data.flexReturn];
              flexReturn.push({ flexReturnDate: data.returnDate, flexReturnTime: '' });
            } else {
              flexReturn.push({ flexReturnDate: data.returnDate, flexReturnTime: '' });
            }
          } else {
            flexReturn.push({ flexReturnDate: data.returnDate, flexReturnTime: '' });
          }
        } else {
          flexReturn = [...[]];
          data.flexReturn.push({ flexReturnDate: data.returnDate, flexReturnTime: '' });
        }
      } else {
        data.flexReturn = [...[]];
      }
      //fl exAirLineCode
      let flexAirLineCode = [...[]];
      if (data.flexAirLineCode && data.flexAirLineCode?.length > 0) {
        flexAirLineCode = [...data.flexAirLineCode];
        flexAirLineCode.push(data.airlineCode);
      } else {
        flexAirLineCode = [...[]];
        if (data.airlineCode) {
          flexAirLineCode.push(data.airlineCode);
        } else {
          flexAirLineCode.push('All');
        }
      }

      // flexStops
      let flexStops = [];

      if (restData.serviceRequestLine.flexStops && restData.serviceRequestLine.flexStops?.length > 0) {
        if (restData.serviceRequestLine.flexStops.length === 1 && restData.serviceRequestLine.flexStops[0] === '') {
          flexStops = [];
          flexStops.push(restData.serviceRequestLine.typeOfFlight);
        } else {
          flexStops = [...restData.serviceRequestLine.flexStops];
          flexStops.push(restData.serviceRequestLine.typeOfFlight);
        }
      } else {
        flexStops = [];
        flexStops.push(restData.serviceRequestLine.typeOfFlight);
      }

      let newData: any[] = [];
      if (Number(restData.serviceRequestLine.tripTypeId) === 69) {
        newData = this.cartesian(
          flexFromCode,
          flexToCode,
          flexClassName,
          flexDepature,
          flexAirLineCode,
          flexStops,
          flexReturn
        );
      } else {
        newData = this.cartesian(flexFromCode, flexToCode, flexClassName, flexDepature, flexAirLineCode, flexStops);
      }
      newData.forEach((ne) => {
        postData.push(ne);
      });
    });

    //output the explode data
    this.outputExplodeData(postData, restData);
  }
  cartesian(...args) {
    var r = [],
      max = args.length - 1;
    function helper(arr, i) {
      for (var j = 0, l = args[i].length; j < l; j++) {
        var a = arr.slice(0); // clone arr
        a.push(args[i][j]);
        if (i == max) r.push(a);
        else helper(a, i + 1);
      }
    }
    helper([], 0);
    return r;
  }
  outputExplodeData(postData: any, restData: SrSegmentHeader) {
    let postnewData: any[] = [];
    if (postData?.length > 0) {
      postData.forEach((element, index) => {
        let dat = {};
        postnewData.push(dat);
        element.forEach((low, indx) => {
          if (Number(restData.serviceRequestLine.tripTypeId) === 69) {
            switch (indx) {
              case 0:
                postnewData[index].flexFromCode = low;
                break;
              case 1:
                postnewData[index].flexToCode = low;
                break;
              case 2:
                postnewData[index].flexClassName = low;
                break;
              case 3:
                postnewData[index].flexDepature = low;
                break;
              case 4:
                postnewData[index].flexAirLineCode = low;
                break;
              case 5:
                postnewData[index].flexStops = low;
                break;
              case 6:
                postnewData[index].flexReturn = low;
                break;
            }
            postnewData[index].isSelected = false;
          } else {
            switch (indx) {
              case 0:
                postnewData[index].flexFromCode = low;
                break;
              case 1:
                postnewData[index].flexToCode = low;
                break;
              case 2:
                postnewData[index].flexClassName = low;
                break;
              case 3:
                postnewData[index].flexDepature = low;
                break;
              case 4:
                postnewData[index].flexAirLineCode = low;
                break;
              case 5:
                postnewData[index].flexStops = low;
                break;
            }
            postnewData[index].isSelected = false;
          }
        });
      });
    }
    //console.log(postnewData);
    postnewData.forEach((headerData) => {
      headerData['noofADT'] = this.flightForm.get('noofADT').value;
      headerData['noofCHD'] = this.flightForm.get('noofCHD').value;
      headerData['noofINF'] = this.flightForm.get('noofINF').value;
    });

    const modalRef = this.modalService.open(ExplodeFlightDetalsComponent, {
      size: 'xl',
      backdrop: 'static',
      animation: true,
    });
    modalRef.componentInstance.explodeList = postnewData;
    modalRef.componentInstance.explodeHeaderInfo = {
      product: 1,
      requester: this.authService.getUser(),
      service_request: this.requestId,
      service_request_line: this.srLineId,
    };
    modalRef.result.then(
      (result) => {
        if (result) {
        }
      },
      (err) => {}
    );
  }

  /*
   *
   *Add button clicked after response request line
   *find call to service
   */
  getAllServiceRequestsLine(requestId) {
    this.dashboardRequestService
      .getLinesBySrRequest(requestId)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (resdata: any) => {
          this.SrRequestLineApiResponse = resdata;
          //this.cdr.detectChanges();
        },
        (error) => {
          this.toastrService.error('Oops! Something went wrong ', 'Error');
        }
      );
  }
  //get-service-request due to contact id purposes
  getserviceRequestByContactId(requestId) {
    this.isEdit = true;
    this.dashboardRequestService
      .getSrRequest(requestId)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (resHeaderdata: any) => {
          const serviceRequestContactId = resHeaderdata;
          this.contactid = serviceRequestContactId?.contactId;
          // this.cdr.detectChanges();
        },
        (error) => {
          this.toastrService.error('Oops! Something went wrong while fetching the Contact id  ', 'Error');
        }
      );
  }

  resetFormData() {
    this.isEdit = false;
    this.submitted = false;
    this.isValidFormSubmitted = true;
    this.flightForm.reset();
    this.flights().at(0)?.get('className').setValue('Y');
    this.createRequest();
    //(this.flights().at(0)?.get('holidayPersonList') as FormArray).push(this.fb.group({}));
    /*  const controlnewFlight = <FormArray>this.flightForm.controls['serviceRequestSegment'];
    for (let i = controlnewFlight.length - 1; i >= 0; i--) {
      if (controlnewFlight.length > 1) {
        controlnewFlight.removeAt(i);
      }
    } */
    //this.deleteQueryParameterFromCurrentRoute();
  }
  deleteQueryParameterFromCurrentRoute() {
    const params = { ...this.route.snapshot.queryParams };
    delete params.holidaysLineId;
    this.router.navigate([], { queryParams: params });
    /* this.router.navigate(['/dashboard/booking/holidays'], {
      queryParams: { requestId: this.requestId, contactId: this.contactid },
    }); */
  }

  createRequest() {
    if (this.contactDetails) {
      const srRequestHeaderData = {
        createdBy: this.authService.getUser(),
        createdDate: this.todaydateAndTimeStamp,
        customerId: this.contactDetails?.customerId,
        contactId: this.contactDetails?.contact?.id,
        requestStatus: 1,
        priorityId: 1,
        severityId: 1,
        packageRequest: 1,
      };
      this.dashboardRequestService.createServiceRequestLine(srRequestHeaderData).pipe(takeUntil(this.ngDestroy$)).subscribe(
        (requestResponse: any) => {
          if (requestResponse?.requestId) {
            this.router.navigate(['/dashboard/booking/holidays'], {
              queryParams: { requestId: requestResponse?.requestId, contactId: this.contactDetails?.contact?.id },
            });
          }
        },
        (error) => {
          this.toastrService.error('Oops! Something went wrong ', 'Error');
        }
      );
    }
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
          //  this.cdr.detectChanges();
        } else {
          this.toastrService.error('Oops! Something went wrong while fetching the contact details data ', 'Error');
        }
      });
  }

  /**
   * Trigger a call to the API to get the airline
   * data for from input
   */
  onSearchFlightAddons: OperatorFunction<string, readonly { name; id }[]> = (addonstext$: Observable<string>) =>
    addonstext$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap((term: string) => (this.searchFlightAddonsTerm = term)),
      switchMap((term) =>
        term.length >= 1
          ? this.masterDataService.packageAddonsData(term, 'All').pipe(
              tap((response: FlightAddons[]) => {
                this.noFlightAddonsResults = response.length === 0;
                if (this.noFlightAddonsResults) {
                  this.toastrService.error(`no data found given string : ${term}`, 'Error', { progressBar: true });
                }
                this.searchflightAddonsResult = [...response];
              }),
              catchError(() => {
                return of([]);
              })
            )
          : of([])
      ),
      tap(() => this.cdr.markForCheck()),
      tap(() =>
        this.searchFlightAddonsTerm === '' || this.searchFlightAddonsTerm.length <= 2
          ? []
          : this.searchflightAddonsResult?.filter(
              (v) => v.name.toLowerCase()?.indexOf(this.searchFlightAddonsTerm?.toLowerCase()) > -1
            )
      )
    );

  onChangePax(mainIndex: number) {
    const fromControl = this.flights().at(mainIndex)?.value;
    //new added pax chaanges updated
    //this.flightTypeMultiCity(mainIndex);

    if (fromControl) {
      let PersonCount = [];
      const passenger_count_data = {
        noofInf: fromControl.noofInf,
        noofAdt: fromControl.noofAdt,
        noofChd: fromControl.noofChd,
      };
      PersonCount.push(passenger_count_data);
      if (PersonCount) {
        this.getAddonsRoutesData(mainIndex, PersonCount);
      }
    }
  }

  getAddonsRoutesData(mainIndex: number, lineData: any[]) {
    let linePersonCount = [];
    if (lineData.length > 0) {
      for (let segMentIndex = 0; segMentIndex < lineData.length; segMentIndex++) {
        const element = lineData[segMentIndex];
        if (element.noofInf > 0) {
          for (let lineINFIndex = 1; lineINFIndex <= element.noofInf; lineINFIndex++) {
            let INFData = {
              paxNo: lineINFIndex,
              selectedAllGroup: 'Select All',
              paxType: 'INF' + '-' + lineINFIndex,
              bindLablePaxType: 'INF' + '-' + lineINFIndex,
              paxRefence: 0,
            };
            linePersonCount.push(INFData);
          }
        }
        if (element.noofAdt > 0) {
          for (let lineAdultIndex = 1; lineAdultIndex <= element.noofAdt; lineAdultIndex++) {
            let ADTData = {
              paxNo: lineAdultIndex,
              selectedAllGroup: 'Select All',
              paxType: 'ADT' + '-' + lineAdultIndex,
              bindLablePaxType: 'ADT' + '-' + lineAdultIndex,
              paxRefence: 0,
            };
            linePersonCount.push(ADTData);
          }
        }
        if (element.noofChd > 0) {
          for (let lineChildIndex = 1; lineChildIndex <= element.noofChd; lineChildIndex++) {
            let CHDData = {
              paxNo: lineChildIndex,
              selectedAllGroup: 'Select All',
              paxType: 'CHD' + '-' + lineChildIndex,
              bindLablePaxType: 'CHD' + '-' + lineChildIndex,
              paxRefence: 0,
            };
            linePersonCount.push(CHDData);
          }
        }
      }

      this.addonsPassengers?.splice(mainIndex, 0, linePersonCount);
    } else {
      this.addonsPassengers?.splice(mainIndex, 0, []);
    }

    // this.cdr.detectChanges();
  }

  public reserve(mainIndex: number, Data: string) {
    const fromControl = this.flights().at(mainIndex).get('fromCode')?.value;
    const toControl = this.flights().at(mainIndex).get('toCode')?.value;
    if (fromControl && toControl && fromControl != null && toControl != null) {
      this.flights().at(mainIndex).patchValue({
        fromCode: toControl,
        toCode: fromControl,
      });
    } else {
      this.flights().at(mainIndex).patchValue({
        fromCode: '',
        toCode: '',
      });
    }
  }

  getProduct() {
    this.masterDataService
      .getGenMasterDataByTableName('master_products')
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((data) => {
        if (data) {
          this.productList = data;
          this.cdr.markForCheck();
          // this.cdr.detectChanges();
          //const productName = 'Flight';
          //this.productList = data?.find((con) => con.name === productName);
          //this.cdr.detectChanges();
        } else {
          this.toastrService.error(
            'Oops! Something went wrong while fetching the Product type data please try again ',
            'Error'
          );
        }
      });
  }



  resourcesAssignment(formData, requestLineId) {
    const Data = formData;
    const cabinClassId = this.masterClassList?.find((con) => con.code === Data?.serviceRequestSegment[0]?.className);
    let segmentsArray = [];
    for (let index = 0; index < Data.serviceRequestSegment.length; index++) {
      //const element = Data.serviceRequestSegment[index];
      const segmentsData = {
        fromCity: Data.serviceRequestSegment[index].fromCode,
        toCity: Data.serviceRequestSegment[index].toCode,
        marketingCarrier: Data.serviceRequestSegment[index].airlineCode,
        operatingCarrier: Data.serviceRequestSegment[index].airlineCode,
      };
      segmentsArray.push(segmentsData);
    }
    const customerDetailsBySrId = this.authService.getCustomerType();
    const total: number =
      Number(this.flightForm.get('noofADT').value) +
      Number(this.flightForm.get('noofCHD').value) +
      Number(this.flightForm.get('noofINF').value);
      const productName = 'Flight';
      const flightObj = this.productList?.find((con) => con.name === productName);
    const sendData = {
      productId: flightObj?.id == undefined ?1: flightObj?.id,
      bookingTypeId: 1,
      cabinClassId: cabinClassId?.id,
      paxCount: Number(total),
      typeOfJourneyId: Data?.serviceRequestLine?.tripTypeId,
      //hotelNoOfDays: 0,
      //hotelDestination: null,
      //hotelRoomsCount: 0,
      //hotelNightsCount: 0,
      srId: Number(this.requestId),
      //srLineId:Number(this.srLineId),
      srLineId: requestLineId,
      budgetAmount: 0,
      companyId: this.authService.getUserOrganization(),
      locationId: this.authService.getUserLocation(),
      costCenterId: this.authService.getUserCostCenter(),
      userId: this.authService.getUser(),
      customerId: customerDetailsBySrId?.customerId,
      customerCategoryId: customerDetailsBySrId?.custcategoryId,
      customerRatingId: customerDetailsBySrId?.customerRating,
      customerTypeId: customerDetailsBySrId?.customerTypeId,
      ticketType: 'ticket',
      segments: segmentsArray,
    };
    this.dashboardRequestService
      .resourcesAssignment(sendData, apiUrls.sr_assignment.flightassignment)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        const result: ApiResponse = res;
        if (result.status === 200) {
        } else {
          if (result.message === '') {
            this.toastrService.error('Oops! Something went wrong  Please try again', 'Error');
          } else {
            this.toastrService.error(result.message, 'Error');
          }
        }
      });
  }

  getTransitionsList() {
    this.dashboardRequestService.getTransitions(apiUrls.sr_assignment.getTransitionList).pipe(takeUntil(this.ngDestroy$)).subscribe(
      (res: any) => {
        if (res) {
          this.transitionsList = res;
          //this.cdr.detectChanges();
        }
      },
      (error) => {
        this.toastrService.error(error, 'Error');
      }
    );
  }

  flightHolidayPaxDataConversion(inactivePaxData: any) {
    let flightsSegmentArray = [];
    let inactivePaxArray = [];
    let flightsArray = this.flights().value;
    flightsArray.forEach((val) => flightsSegmentArray.push(Object.assign({}, val)));
    flightsSegmentArray.forEach((element, index) => {
      //const DEPATURE_DATE_REVERSED=element.depatureDate?.toString()?.split(['-']);
      //const RETURN_DATE_REVERSED=element.returnDate?.toString()?.split(['-']);
      element.requestId = Number(this.requestId);
      element.requestLineId = element.requestLineId;
      element.requestSegmentId = element.requestSegmentId;
      element.lineUuid = element.lineUuid;
      element.noofAdt = element.noofAdt;
      element.noofChd = element.noofChd;
      element.noofInf = element.noofInf;
      element.hotelRatings = element.hotelRatings;
      element.className = element.className;
      element.holidayDays = element.holidayDays;
      element.modeOfTransport = element.modeOfTransport;
      element.lpoAmount = element.lpoAmount === '' ? 0.0 : element.lpoAmount;
      element.lpoDate = element.lpoDate === '' ? null : element.lpoDate;
      element.lpoNumber = element.lpoNumber === '' ? 0.0 : element.lpoNumber;
      element.fromCode = element.fromCode?.code ? element.fromCode?.code : element.fromCode;
      element.fromCountryName = element.fromCountryName;
      element.fromAirportOrCityName = element.fromAirportOrCityName;
      element.toCode = element.toCode?.code ? element.toCode?.code : element.toCode;
      element.toCountryName = element.toCountryName;
      element.toAirportOrCityName = element.toAirportOrCityName;
      element.depatureDate = element.depatureDate
        ? `${element.depatureDate.year || ''}-${this.padNumber(element.depatureDate.month)}-${this.padNumber(
            element.depatureDate.day
          )}`
        : '';

      element.className = element.className;
      element.rbd = element.rbd;
      element.airlineCode = element.airlineCode?.shortCode2Digit;
      element.validateCarrier = element.validateCarrier;
      element.transitPointCode = this.selectedTransitPointItems;
      element.excludePointCode = this.selectedExludedPoints;
      element.flexFromCode = this.selectedFlexFromItems[index];
      element.flexToCode = this.selectedFlexToItems[index];
      element.flexDepature = element.flexDepature;
      element.flexReturn = element.flexReturn;
      element.flexClassName = element.flexClassName;
      element.flexAirLineCode = this.selectedFlexAirLineItems[index];
      element.budgetFrom = element.budgetFrom;
      element.budgetTo = element.budgetTo;
      element.createdDate = this.todaydateAndTimeStamp;
      element.createdBy = this.authService.getUser();
      if (element.addons?.length > 0) {
        element.addons?.forEach((addonselement) => {
          addonselement.addOnType = addonselement.addOnType;
          addonselement.extraCost = addonselement.extraCost;
          addonselement.required = addonselement.required;
          addonselement.remarks = addonselement.remarks;
          addonselement.requiredPassenger.passengers = addonselement.requiredPassenger?.passengers;
          addonselement.requiredPassenger.all =
            addonselement.requiredPassenger?.passengers?.length === this.addonsPassengers[index]?.length
              ? true
              : false;
        });
      }
      let addonsArray: any[] = [];
      if (element.addons?.length > 0) {
        for (let addons_index = 0; addons_index < element.addons?.length; addons_index++) {
          const addons_sub_element = element.addons[addons_index];
          if (
            addons_sub_element.addOnType === '' &&
            addons_sub_element.remarks === '' &&
            addons_sub_element.extraCost === false &&
            addons_sub_element.required === false &&
            addons_sub_element.requiredPassenger.all === false &&
            addons_sub_element.requiredPassenger.passengers === null
          ) {
          } else {
            addonsArray.push(addons_sub_element);
          }
        }
      }


      const visa = this.visaDataConversion(element, index);
      const insurance = this.insuranceDataConversion(element, index);
      const exclusionsData = this.exclusionsDataConversion(element, index);
      const forexData = this.forexDataConversion(element, index);
      const carRentalArray=this.carRentalDataConversion(index);
      const toCodeCitynameArray=[{city:element.toCityName}];

      //element.addons = addonsArray;
      element.exclusions = exclusionsData;
      element.addons = addonsArray.concat(visa, insurance, forexData, carRentalArray,toCodeCitynameArray);
      delete element.visaAddons;
      delete element.insuranceAddons;
      delete element.forexAddons;

      //element.addons = element.addons;
      let attractionsArray: any[] = [];
      if (element.attractions?.length > 0) {
        for (
          let attractions_sub_index = 0;
          attractions_sub_index < element.attractions.length;
          attractions_sub_index++
        ) {
          const attractions_sub_element = element.attractions[attractions_sub_index];
          if (
            attractions_sub_element.attractionName === '' &&
            attractions_sub_element.attractionDay === '' &&
            attractions_sub_element.remarks === '' &&
            attractions_sub_element.extraCost === false &&
            attractions_sub_element.required === false &&
            attractions_sub_element.attractionsRequiredPassenger?.all === true &&
            attractions_sub_element.attractionsRequiredPassenger?.pax === null
          ) {
          } else {
            attractionsArray.push(attractions_sub_element);
          }
        }
      }
      element.attractions = attractionsArray;
      //element.attractions = element.attractions;

      let roomsDummyArray: any[] = [];
      let roomArray = element.roomsData;
      roomArray.forEach((val) => roomsDummyArray.push(Object.assign({}, val)));
      roomsDummyArray.forEach((room_element, roomindex) => {
        room_element.id = room_element.id;
        room_element.roomSrId = Number(this.requestId);
        room_element.roomLineId = room_element.roomLineId;
        room_element.roomNumber = roomindex + 1;
        room_element.roomName =
          room_element.roomName === null || room_element.roomName === '' ? [] : [room_element.roomName];
        room_element.roomType =
          room_element.roomType === null || room_element.roomType === '' ? [] : [room_element.roomType];
        room_element.roomAddonsRequired = 0;
        room_element.roomAdultCount = Number(room_element.roomAdultCount);
        room_element.roomChildCount = Number(room_element.roomChildCount);
        room_element.roomInfantCount = 0;
        room_element.roomStatus = room_element.roomStatus;
        room_element.roomCreatedBy = this.authService.getUser();
        room_element.roomCreatedDate = this.todaydateAndTimeStamp;
        room_element.roomCreatedDevice = this.deviceInfo?.userAgent;
        let childAge;
        room_element.childAge.forEach((child_element) => {
          if (childAge) {
            childAge = childAge + ',' + child_element.roomChildAges?.toString();
          } else {
            childAge = child_element.roomChildAges?.toString();
          }
        });
        room_element.roomChildAges = childAge;
        room_element.roomPassengersInfo = [];
        room_element.roomCreatedIp = null;
        /*  element.roomsPersonList.forEach((element) => {
        element.passengerSrId = Number(this.requestId);
        element.passengerStatus = 0;
      }); */
        //element.roomPassengersInfo = element.roomsPersonList;
        //delete element.roomsPersonList;
        delete room_element.childAge;
      });
      //roomsDummyArray
      element.roomsData = roomsDummyArray;

      const paxData = {
        paxId: inactivePaxData.paxId,
        prefix: inactivePaxData.prefix,
        firstName: inactivePaxData.firstName,
        lastName: inactivePaxData.lastName,
        dob: inactivePaxData.dob,
        //nationality:inactivePaxData.nationality?.id === undefined || inactivePaxData?.nationality?.id === null ? null : inactivePaxData?.nationality?.id,
        nationality: inactivePaxData.nationality,
        nationalityName: inactivePaxData.nationalityName,
        issuedCountry: inactivePaxData.issuedCountry,
        issuedCountryName: inactivePaxData.issuedCountryName,
        //nationalityName: inactivePaxData.nationality?.name  === undefined  || inactivePaxData.nationality?.name === null  ? null : inactivePaxData.nationality?.name,
        //issuedCountry: inactivePaxData.issuedCountry?.id === undefined ||inactivePaxData.issuedCountry?.id === null ? null :inactivePaxData.issuedCountry?.id,
        //issuedCountryName: inactivePaxData.issuedCountry?.name === undefined  ||inactivePaxData.issuedCountry?.name === null ? null : inactivePaxData.issuedCountry?.name,
        passport: inactivePaxData.passport,
        email: inactivePaxData.email,
        phone: inactivePaxData.phone,
        paxIsDeleted: true,
        paxType: inactivePaxData.paxType,
        paxCode: inactivePaxData.paxCode,
        passportExpiredDate: inactivePaxData.passportExpiredDate,
        passportIssueDate: inactivePaxData.passportIssueDate,
        requestLinePaxId: inactivePaxData.requestLinePaxId,
        requestLineId: this.srLineId,
        createdDate: this.todaydateAndTimeStamp,
        createdBy: this.authService.getUser(),
        updatedBy: this.authService.getUser(),
        updatedDate: this.todaydateAndTimeStamp,
        requestId: this.requestId,
      };
      inactivePaxArray.push(paxData);
      element.holidayPersonList = inactivePaxArray;
    });
    return flightsSegmentArray;
  }
  inActivePassengers(mainIndex: number, holidayPaxIndex: number, inactivePaxData: any = {}, requestLinePaxId) {
    if (requestLinePaxId) {
      const flightsData = this.flightHolidayPaxDataConversion(inactivePaxData);
      const dealsData = this.dealsDataConversion();
      this.holidayPaxdelete(mainIndex, holidayPaxIndex);
      let updatePaxPayload = {
        serviceRequestLine: {
          requestId: Number(this.requestId),
          passengerTypeId: this.flightForm.get('passengerTypeId').value,
          lineStatusId: this.flightForm.get('lineStatusId').value,
          createdBy: this.authService.getUser(),
          updatedBy: this.authService.getUser(),
          updatedDate: this.todaydateAndTimeStamp,
          createdDate: this.todaydateAndTimeStamp,
          expandableParametersCode:
            this.flightForm.get('expandableParametersCode').value !== ''
              ? this.flightForm.get('expandableParametersCode').value
              : null,
          dealCode: dealsData,
        },
        serviceRequestSegment: flightsData,
      };

      this.dashboardRequestService
        .modifyHolidayRequest(updatePaxPayload, apiUrls.Holiday_Package.modifyPackageRequest)
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe(
          (data: any) => {
            this.toastrService.success(`${Number(this.requestId)} passenger has been removed successfuly !`, 'Success');
          },
          (error) => {
            this.toastrService.error(error, 'Error');
          }
        );
    } else {
      //this.holidayPassengers[mainIndex]?.splice(mainIndex, 1);
      //this.paxId = this.holidayPassengers[mainIndex]?.map((v) => v);
      this.holidayPaxdelete(mainIndex, holidayPaxIndex);
    }
  }

  getRequestContactDetails() {
    //const requestLineId = this.route.snapshot.queryParams.srLineId;
    this.srSummaryData
      .getData()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        this.contactDetails = res;
        this.cdr.markForCheck();
      });
  }
  saveSrSummayData() {
    if (this.contactDetails && this.requestLineId) {
      const total: number =
        Number(this.flightForm.get('noofADT').value) +
        Number(this.flightForm.get('noofCHD').value) +
        Number(this.flightForm.get('noofINF').value);
        const productName = 'Flight';
        const flightObj = this.productList?.find((con) => con.name === productName);
      const SUMMARYDATA = {
        contactEmail: this.contactDetails?.contact?.primaryEmail,
        contactId: this.contactDetails?.contact?.id,
        contactName: this.contactDetails?.contact?.firstName + ' ' + this.contactDetails?.contact?.lastName,
        contactPhone: this.contactDetails?.contact?.primaryPhoneNumber,
        deviceInfo: this.deviceInfo?.userAgent,
        loggedInUserId: this.authService.getUser(),
        passengerCount: Number(total),
        productId: flightObj?.id == undefined? 1:flightObj?.id ,
        serviceRequestId: this.contactDetails?.requestId,
        serviceRequestLineId: this.requestLineId,
        //travelDateOrCheckInDate: this.flights().at(0)?.value.depatureDate
        travelDateOrCheckInDate: this.flights().at(0)?.value.depatureDate
          ? `${this.flights().at(0)?.value.depatureDate.year || ''}-${this.padNumber(
              this.flights().at(0)?.value.depatureDate.month
            )}-${this.padNumber(this.flights().at(0)?.value.depatureDate.day)}`
          : '',
      };
      this.dashboardRequestService
        .saveSrSummary(SUMMARYDATA, apiUrls.SrSummaryData.SAVESRSUMMARYDATA)
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe((res: any) => {
          const result: ApiResponse = res;
          if (result.status === 200) {
          } else if (result.message === '') {
            this.toastrService.error('Oops! Something went wrong  while send the data please try again', 'Error', {
              progressBar: true,
            });
          } else {
            this.toastrService.error(result.message, 'Error', { progressBar: true });
          }
        });
    }
  }

  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  flightTypeMultiCity(mainIndex: number, entertedData?: any) {
    if (typeof entertedData === 'object') {
      const MODIFY_INDEX = mainIndex + 1;
      this.onChangeDepatureDate(mainIndex);
      const toControl = this.flights().at(mainIndex).get('toCode')?.value;

      this.flights()
        ?.at(MODIFY_INDEX)
        ?.patchValue({
          noofAdt: this.flights().at(mainIndex).get('noofAdt')?.value,
          noofChd: this.flights().at(mainIndex).get('noofChd')?.value,
          noofInf: this.flights().at(mainIndex).get('noofInf')?.value,
        });
      if (this.flights()?.at(mainIndex)?.get('holidayPersonList')?.value?.length > 0) {
        for (let index = 0; index < this.flights().at(mainIndex).get('holidayPersonList')?.value?.length; index++) {
          const element = this.flights().at(mainIndex).get('holidayPersonList')?.value[index];
          (this.flights().at(MODIFY_INDEX)?.get('holidayPersonList') as FormArray)?.push(this.fb.group(element));
        }
      }

      this.flights()?.at(MODIFY_INDEX)?.patchValue({
        fromCode: entertedData,
        fromAirportOrCityName: entertedData.city,
        fromCountryName: entertedData.country,
      });
    } else {
      const MODIFY_INDEX = mainIndex + 1;
      this.onChangeDepatureDate(mainIndex);
      const toControl = this.flights().at(mainIndex).get('toCode')?.value;

      this.flights()
        .at(MODIFY_INDEX)
        .patchValue({
          noofAdt: this.flights().at(mainIndex).get('noofAdt')?.value,
          noofChd: this.flights().at(mainIndex).get('noofChd')?.value,
          noofInf: this.flights().at(mainIndex).get('noofInf')?.value,
        });
      if (this.flights().at(mainIndex).get('holidayPersonList')?.value?.length > 0) {
        for (let index = 0; index < this.flights().at(mainIndex).get('holidayPersonList')?.value?.length; index++) {
          const element = this.flights().at(mainIndex).get('holidayPersonList')?.value[index];
          (this.flights().at(MODIFY_INDEX)?.get('holidayPersonList') as FormArray).push(this.fb.group(element));
        }
      }
      if (toControl) {
        this.flights().at(MODIFY_INDEX).patchValue({
          fromCode: toControl,
          fromAirportOrCityName: toControl.name,
          fromCountryName: toControl.country,
        });
      } else {
        this.flights().at(MODIFY_INDEX).patchValue({
          fromCode: '',
          fromAirportOrCityName: '',
          fromCountryName: '',
        });
      }
    }
  }

  onChangeCheckFlightTypeDepature(mainIndex: number) {
    const depatureDateControl = this.flights().at(mainIndex).get('depatureDate')?.value;
    if (depatureDateControl && this.flightForm.value.tripTypeId === '69') {
      const RETURN_DATE = this.calendar.getNext(this.flights()?.at(0)?.get('depatureDate').value, 'd', 1);
      this.flights().at(0).patchValue({ returnDate: RETURN_DATE });
    }
  }

  /**
   * Trigger a call to the API to get the Attractions
   * data for from input
   * @term=activityName
   * @param1=city
   * @param2=country
   */
  /*  onSearchAttractions(param1: string,param2:string): (text: Observable<string>,param1: Observable<string>,param2: Observable<string>) => Observable<any[]> {
    this.attractionsCity=param1;
    this.attractionsCountry=param2;
    return (text$: Observable<string>) => text$.pipe(
      debounceTime(300),
    distinctUntilChanged(),
    tap((term: string) => (this.searchAttractionsTerm = term)),
    switchMap((term) =>
      term.length >= 3
        ? this.dashboardRequestService.getPackageActivity(term,this.attractionsCity,this.attractionsCountry)
            .pipe(
              tap((response: AttractionsResponse[]) => {
                this.noAttractionsResults = response.length === 0;
                if (this.noAttractionsResults) {
                  this.toastrService.error(`no attractions  found given   ${term}`,"Error");
                }
                this.searchAttractionsResult = [...response];
              }),
              catchError(() => {
                return of([]);
              })
            )
        : of([])
    ),
    tap(() => this.cdr.markForCheck()),
    tap(() =>
      this.searchAttractionsTerm === "" || this.searchAttractionsTerm.length <= 2
        ? []
        : this.searchAttractionsResult.filter(
            (v) =>
              v.activityName.toLowerCase().indexOf(
                this.searchAttractionsTerm.toLowerCase()
              ) > -1
          )
    )
    );
  } */

  onChangeDaysEdit(enteredDay: any, postionNumber: number, actionType: string) {

    if (enteredDay !== 0) {
      if (actionType === 'changeDate') {
        this.onChangeDepatureDate(postionNumber);
      }
      let dayArray: any[] = [];
      let selectedDates: any[] = [];
      let firstDates: any[] = [];
      const firstDate = `${this.flights()?.at(postionNumber)?.get('depatureDate').value.year}-${this.padNumber(
        this.flights()?.at(postionNumber)?.get('depatureDate').value.month
      )}-
      ${this.padNumber(this.flights()?.at(postionNumber)?.get('depatureDate').value.day)}`;
      const firstDateObject = {
        hotelSelectedDate: firstDate?.replace(/\s/g, ''),
        dates: 'Select All',
      };
      firstDates.push(firstDateObject);
      for (let d = 0; d < enteredDay; d++) {
        const daysobject = {
          id: d + 1,
          selectedAllDays: 'Select All',
          name: 'Day - ' + (d + 1),
        };
        dayArray.push(daysobject);
      }
      for (let s = 0; s < enteredDay - 1; s++) {
        const nextdate= this.calendar.getNext(this.flights()?.at(postionNumber)?.get('depatureDate').value, 'd',(s+1));
        const selectedDate = `${nextdate.year}-${this.padNumber(
          nextdate.month
        )}-
        ${this.padNumber(nextdate.day )}`;



        const hotelDatesObject = {
          hotelSelectedDate: selectedDate?.replace(/\s/g, ''),
          dates: 'Select All',
        };
        selectedDates.push(hotelDatesObject);
      }
      const combinedarrayData = firstDates.concat(selectedDates);


      this.attractionsDays.splice(postionNumber, 0, dayArray);
      this.hotelDates.splice(postionNumber, 0, combinedarrayData);
      // nights dropdown data
      /* for (let nightsindex = 1; nightsindex < enteredDay -1; nightsindex++) {
       console.log(nightsindex);
      } */
    } else {
      this.attractionsDays.splice(postionNumber, 0, []);
      this.hotelDates.splice(postionNumber, 0, []);
    }
  }

  onChangeDays(enteredDay: any, postionNumber: number, actionType: string) {


    if (enteredDay !== 0) {
      if (actionType === 'changeDate') {
        this.onChangeDepatureDate(postionNumber);
      }
      let dayArray: any[] = [];
      let selectedDates: any[] = [];
      let firstDates: any[] = [];
      const firstDate = `${this.flights()?.at(postionNumber)?.get('depatureDate').value.year}-${this.padNumber(
        this.flights()?.at(postionNumber)?.get('depatureDate').value.month
      )}-
      ${this.padNumber(this.flights()?.at(postionNumber)?.get('depatureDate').value.day)}`;
      const firstDateObject = {
        hotelSelectedDate: firstDate?.replace(/\s/g, ''),
        dates: 'Select All',
      };
      firstDates.push(firstDateObject);
      for (let d = 0; d < enteredDay; d++) {
        const daysobject = {
          id: d + 1,
          selectedAllDays: 'Select All',
          name: 'Day - ' + (d + 1),
        };
        dayArray.push(daysobject);
      }
      for (let s = 0; s < enteredDay - 1; s++) {
       const nextdate= this.calendar.getNext(this.flights()?.at(postionNumber)?.get('depatureDate').value, 'd',(s+1));
        const selectedDate = `${nextdate.year}-${this.padNumber(
          nextdate.month
        )}-
        ${this.padNumber(nextdate.day )}`;

        const hotelDatesObject = {
          hotelSelectedDate: selectedDate?.replace(/\s/g, ''),
          dates: 'Select All',
        };
        selectedDates.push(hotelDatesObject);
      }
      const combinedarrayData = firstDates.concat(selectedDates);

      this.attractionsDays.splice(postionNumber, 0, dayArray);
      this.hotelDates.splice(postionNumber, 0, combinedarrayData);
      // nights dropdown data
      /* for (let nightsindex = 1; nightsindex < enteredDay -1; nightsindex++) {
       console.log(nightsindex);
      } */
      const defaultRooms = {
        target: {
          value: 1,
        },
      };

      this.flights().at(postionNumber).get('lineRoomCount').patchValue(1);
      this.onChangeRooms(defaultRooms, postionNumber);
    } else {
      this.attractionsDays.splice(postionNumber, 0, []);
      this.hotelDates.splice(postionNumber, 0, []);
      const defaultRooms = {
        target: {
          value: 0,
        },
      };
      this.flights().at(postionNumber).get('lineRoomCount').patchValue(0);
      this.onChangeRooms(defaultRooms, postionNumber);
    }
  }
  onChangeDepatureDate(postionNumber: number) {
    const depatureDateControl = this.flights().at(postionNumber)?.get('depatureDate')?.value;
    const holidayDaysControl = this.flights().at(postionNumber)?.get('holidayDays')?.value;

    if (depatureDateControl && holidayDaysControl) {
      if (holidayDaysControl === '0') {
        return;
      } else {
        let index = postionNumber + 1;
        const find_date = this.calendar.getNext(depatureDateControl, 'd', Number(holidayDaysControl-1));

        const hidden_date = {
          year: find_date?.year,
          month: find_date?.month,
          day: find_date?.day,
        };

        this.flights().at(index)?.patchValue({
          hiddenDepatureDate: hidden_date,
          depatureDate: hidden_date,
        });
      }
    }
  }

  redirectToItinerary() {
    const contactId = this.route.snapshot.queryParams.contactId;
    const requestId = this.route.snapshot.queryParams.requestId;
    const holidaysLineId = this.route.snapshot.queryParams.holidaysLineId;
    swal
      .fire({
        title: 'Are you sure ',
        text: 'Do you want create package!',
        icon: 'warning',
        showCancelButton: true,

        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        customClass: {
          confirmButton: 'btn btn-outline-primary',
          cancelButton: 'btn btn-outline-primary  ml-1',
        },
        buttonsStyling: false,
      })
      .then((result) => {
        if (result.value) {
          if (requestId && holidaysLineId && contactId) {
            const queryParams = {
                requestId: requestId,
                contactId: contactId,
                holidaysLineId: holidaysLineId,
                from: 'package',
                actionType: 'rfq',
                productsAvailability: this.productsAvailability,
            };

            if(this.productsAvailability==true){
              const PACKAGEITINERARY_URL = this.router.createUrlTree(['/dashboard/request/package-holidays-listview'], { queryParams }).toString();
              window.open(PACKAGEITINERARY_URL, '_blank');
            }else{
              const PACKAGEITINERARY_URL = this.router.createUrlTree(['/dashboard/booking/package-itinerary'], { queryParams }).toString();
             window.open(PACKAGEITINERARY_URL, '_blank');
            }
            //const PACKAGEITINERARY_URL = this.router.createUrlTree(['/dashboard/booking/package-itinerary'], { queryParams }).toString();
            //window.open(PACKAGEITINERARY_URL, '_blank');

          }
        }
      });
  }

  onChangeRooms(e, mainIndex: number) {
    const numberOfRooms = e.target.value || 0;
    if (this.roomsData(mainIndex)?.length < numberOfRooms) {
      for (let i = this?.roomsData(mainIndex)?.length; i < numberOfRooms; i++) {
        const fg = this.createNewRoomFormGroup();
        this.roomsData(mainIndex).push(fg);
      }
    } else {
      for (let i = this.roomsData(mainIndex)?.length; i >= numberOfRooms; i--) {
        this.roomsData(mainIndex).removeAt(i);
      }
    }
  }
  onChangeRoomsEdit(mainIndex: number, roomData: any) {
    if (roomData?.length > 0) {
      for (let roomindex = 0; roomindex < roomData?.length; roomindex++) {
        const element = roomData[roomindex];
        const fg = this.createNewRoomFormGroup();
        this.roomsData(mainIndex).push(fg);
        /*  if(roomindex>0){
        const fg = this.createNewRoomFormGroup();
        this.roomsData(mainIndex).push(fg);
      } */

        if (element?.roomName?.length > 0) {
          for (let index = 0; index < element?.roomName?.length; index++) {
            const roomSubelement = element?.roomName[index];
            if (roomSubelement === '') {
              this.roomsData(mainIndex)?.at(roomindex)?.patchValue({
                roomName: null,
              });
            } else {
              this.roomsData(mainIndex)?.at(roomindex)?.patchValue({
                roomName: element?.roomName[index],
              });
            }
          }
        }
        if (element?.roomType?.length > 0) {
          for (let index = 0; index < element?.roomType?.length; index++) {
            const roomTypeelement = element?.roomType[index];
            if (roomTypeelement === '') {
              this.roomsData(mainIndex)?.at(roomindex)?.patchValue({
                roomType: null,
              });
            } else {
              this.roomsData(mainIndex)?.at(roomindex)?.patchValue({
                roomType: element?.roomType[index],
              });
            }
          }
        }
        this.roomsData(mainIndex)?.at(roomindex)?.patchValue({
          id: element?.id,
          roomSrId: element?.roomSrId,
          roomLineId: element?.roomLineId,
          //roomName:element?.roomName,
          //roomType:element?.roomType,
          roomNumber: element?.roomNumber,
          roomAddonsRequired: element?.roomAddonsRequired,
          roomAdultCount: element?.roomAdultCount,
          roomChildCount: element?.roomChildCount,
          roomInfantCount: element?.roomInfantCount,
          //roomChildAges: '',
          roomInfantAges: '',
          roomStatus: 0,
          //roomPassengersInfo: this.fb.array([]),
          //childAge: this.fb.array([]),
        });
        // roomChildAges converting to array
        if (element?.roomChildCount > 0) {
          let total: any[] = [];
          element.roomChildAges = element.roomChildAges === 0 ? '' : element.roomChildAges?.toString()?.split(`,`);
          for (let s = 0; s < element.roomChildAges?.length; s++) {
            element.roomChildAges[s] = element.roomChildAges[s];
            total.push(element.roomChildAges[s]);
          }
          if (total?.length > 0) {
            for (let index = 0; index < total?.length; index++) {
              let childelement = total[index];
              const fg = this.createAgeFormGroup();
              this.childAge(mainIndex, roomindex).push(fg);
              this.childAge(mainIndex, roomindex)?.at(index)?.patchValue({
                roomChildAges: childelement,
              });
            }
          }
        }
      }
    }
  }

  onChangeChild(value, mainindex: number, roomIndex: number) {
    const numberOfChilds = value || 0;
    if (this.childAge(mainindex, roomIndex).length < numberOfChilds) {
      for (let i = this.childAge(mainindex, roomIndex).length; i < numberOfChilds; i++) {
        const fg = this.createAgeFormGroup();
        this.childAge(mainindex, roomIndex).push(fg);
      }
    } else {
      for (let i = this.childAge(mainindex, roomIndex).length; i >= numberOfChilds; i--) {
        this.childAge(mainindex, roomIndex).removeAt(i);
      }
    }
  }

  loadRoomName() {
    this.roomName$ = concat(
      of([]), // default items
      this.roomNameLoadingInput$.pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthRoomNameTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.cdr.markForCheck(), (this.roomNameLoading = true))),
        switchMap((term) => {
          return this.masterDataService.getRoomNameDeatils(apiUrls.Holiday_Package.roomName, term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.roomNameLoading = false))
          );
        })
      )
    ).pipe(share());

    //.pipe(share());
  }
  loadRoomType() {
    this.roomType$ = concat(
      of([]), // default items
      this.roomTypeLoadingInput$.pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthRoomTypeTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.cdr.markForCheck(), (this.roomTypeLoading = true))),
        switchMap((term) => {
          return this.masterDataService.getRoomNameDeatils(apiUrls.Holiday_Package.roomType, term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.roomTypeLoading = false))
          );
        })
      )
    ).pipe(share());
    //.pipe(share());
  }

  onChangeHotelSelection(value: string, mainIndex: number) {
    if (value === 'DifferentHotel') {
      if (this.hotelSelectionsData(mainIndex)?.length === 0) {
        this.addHotelSelection(mainIndex);
      }
      this.roomsData(mainIndex)?.clear();
      this.flights().at(mainIndex).get('lineRoomCount').patchValue('');
    }
    if (value === 'SpecificHotel') {
      this.hotelSelectionsData(mainIndex)?.clear();
      if (this.hotelSelectionsData(mainIndex)?.length === 0) {
        this.addHotelSelection(mainIndex);
      }
    }
  }

  onChangeDifferentHotelSelectionRooms(e, mainIndex: number, hotelSelectionsIndex: number) {
    const numberOfRooms = e.target.value || 0;
    if (this.roomLevelsData(mainIndex, hotelSelectionsIndex)?.length < numberOfRooms) {
      for (let i = this.roomLevelsData(mainIndex, hotelSelectionsIndex)?.length; i < numberOfRooms; i++) {
        this.addRoomLevelData(mainIndex, hotelSelectionsIndex);
      }
    } else {
      for (let i = this.roomLevelsData(mainIndex, hotelSelectionsIndex)?.length; i >= numberOfRooms; i--) {
        this.removeRoomLevel(mainIndex, hotelSelectionsIndex, i);
      }
    }
  }
  onChangeDifferentHotelSelectionChild(value, mainindex: number, hotelSelectionsIndex: number, roomLevelIndex: number) {
    const numberOfChilds = value || 0;
    if (this.roomLevelchildAge(mainindex, hotelSelectionsIndex, roomLevelIndex).length < numberOfChilds) {
      for (
        let i = this.roomLevelchildAge(mainindex, hotelSelectionsIndex, roomLevelIndex).length;
        i < numberOfChilds;
        i++
      ) {
        const fg = this.createNewRoomLevelAgeFormGroup();
        this.roomLevelchildAge(mainindex, hotelSelectionsIndex, roomLevelIndex).push(fg);
      }
    } else {
      for (
        let i = this.roomLevelchildAge(mainindex, hotelSelectionsIndex, roomLevelIndex).length;
        i >= numberOfChilds;
        i--
      ) {
        this.roomLevelchildAge(mainindex, hotelSelectionsIndex, roomLevelIndex).removeAt(i);
      }
    }
  }
  checkAccFun() {
    let checkTrue = [];
    let checkFalse = [];
    for (let index = 0; index < this.flights()?.length; index++) {
      if (this.hidemePackage[index]) {
        checkTrue.push(index);
      } else {
        checkFalse.push(index);
      }
    }
    if (this.flights().length === checkTrue?.length) {
      this.pkgAccOpenCloseID = 'Collapse All';
    } else if (this.flights().length === checkFalse?.length) {
      this.pkgAccOpenCloseID = 'Expand All';
    } else {
      this.pkgAccOpenCloseID = 'Collapse All';
    }
    this.cdr.markForCheck();
  }
  showProductDetailsInfo(index: number, check_inz: boolean = false) {
    this.hidemePackage[index] = !this.hidemePackage[index];
    if (!check_inz) {
      this.checkAccFun();
    }
    this.cdr.markForCheck();
  }

  coallpseAll(event?: any) {
    let flag_check_pkg = false;
    if (event != '') {
      if (event.target.text == 'Collapse All' && event.target.text != undefined) {
        event.target.textContent = 'Expand All';
        //this.pkgAccOpenCloseID = "Expand All";
        flag_check_pkg = false;
      } else if (event.target.text == 'Expand All' && event.target.text != undefined) {
        event.target.textContent = 'Collapse All';
        //this.pkgAccOpenCloseID = "Collapse All";
        flag_check_pkg = true;
      }
    }
    for (let index = 0; index < this.flights().length; index++) {
      this.hidemePackage[index] = !this.hidemePackage[index];
      if (flag_check_pkg !== this.hidemePackage[index]) {
        this.showProductDetailsInfo(index);
      }
    }
    this.cdr.markForCheck();
  }

  getProductsData() {
    this.productsDataService
      .getData()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res: Products[]) => {
        if (res?.length > 0) {
          if (res?.length === 1 && res[0]?.product === 'Package') {
            this.productsAvailability = false;
          } else {

            this.productsAvailability = true;
          }
          this.cdr.markForCheck();
        }
      });

     /*  this.dashboardRequestService
      .getAllServiceRequestSearch(requestData, apiUrls.srsearchList_url.srsearchList)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res: Products[]) => {
        if (res?.length > 0) {
          if (res?.length === 1 && res[0]?.product === 'Package') {
            this.productsAvailability = false;
          } else {
            this.productsAvailability = true;
          }
          this.cdr.markForCheck();
        }
      }); */
  }
  /* //new attractions save */
  addAttractionsNew = (term: string) => ({
    activityID: 0,
    activityName: term,
    location:
      this.flights()
        ?.at(this.flights().length - 1)
        ?.get('toCode')?.value?.city +
      ' , ' +
      this.flights()
        ?.at(this.flights().length - 1)
        ?.get('toCode')?.value?.country,
    city: this.flights()
      ?.at(this.flights().length - 1)
      ?.get('toCode')?.value?.city,
    country: this.flights()
      ?.at(this.flights().length - 1)
      ?.get('toCode')?.value?.country,
    selectedAllAttractions: 'Select All',
  });

  onChangeAttractionName(mainIndex: number, subIndex: number) {
    const attractionNameControl = this.flightAttractions(mainIndex).at(subIndex).get('attractionName');
    const dayControl = this.flightAttractions(mainIndex).at(subIndex).get('attractionDay');

    if (attractionNameControl?.value?.length === 0) {
      //dayControl.clearValidators();
      dayControl.setValidators(null);
    } else {
      dayControl.setValidators([Validators.required]);
    }

    dayControl.updateValueAndValidity();
  }

  onSubmitAlert() {
    swal
      .fire({
        title: 'Are you sure ',
        text: 'Do you want update, if yes new sr will be generated!',
        icon: 'warning',
        showCancelButton: true,

        confirmButtonText: 'Yes',
        cancelButtonText: 'No!',
        customClass: {
          confirmButton: 'btn btn-outline-primary',
          cancelButton: 'btn btn-outline-primary  ml-1',
        },
        buttonsStyling: false,
      })
      .then((result) => {
        if (result.value) {
          this.onEditSubmitFlightForm();
        }
      });
  }
  validatenumber(evt) {
    let theEvent = evt || window.event;
    let key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode(key);
    let regex = /[0-9\s\b\.]|\./;
    if (!regex.test(key)) {
      theEvent.returnValue = false;
      if (theEvent.preventDefault) theEvent.preventDefault();
    }
  }

  getCurrencyList() {
    this.masterDataService.readJdbcMaster(apiUrls.forexMasterData.currency).pipe(takeUntil(this.ngDestroy$)).subscribe(
      (res: ApiResponse) => {
        const result = res;
        if (result.status === 200 && result?.data?.length > 0) {
          this.forexCurrency = result.data;
          this.cdr.markForCheck();
        } else {
          this.forexCurrency = [];
          this.toastrService.error(result.message, 'Error', { progressBar: true });
          this.cdr.markForCheck();
        }
      },
      (error) => {
        this.forexCurrency = [];
        this.toastrService.error(error, 'Error', { progressBar: true });
        this.cdr.markForCheck();
      }
    );
  }

  getForexMOPList() {
    this.masterDataService.readJdbcMaster(apiUrls.forexMasterData.forexMOP).pipe(takeUntil(this.ngDestroy$)).subscribe(
      (res: ApiResponse) => {
        const result = res;
        if (result.status === 200 && result?.data?.length > 0) {
          this.forexMOP = result.data;
          this.cdr.markForCheck();
        } else {
          this.forexMOP = [];
          this.toastrService.error(result.message, 'Error', { progressBar: true });
          this.cdr.markForCheck();
        }
      },
      (error) => {
        this.forexMOP = [];
        this.toastrService.error(error, 'Error', { progressBar: true });
        this.cdr.markForCheck();
      }
    );
  }

  onChangeFromCurrency(selectedCurrency: any, mainIndex: number, forexIndex: number) {
    if (selectedCurrency) {
      this.forexAddons(mainIndex).at(forexIndex).get('currency').setValidators(null);
      this.cdr.markForCheck();
    } else {
      this.forexAddons(mainIndex).at(forexIndex).get('currency').setValidators([Validators.required]);
      this.cdr.markForCheck();
    }
    this.forexAddons(mainIndex).at(forexIndex).get('currency').updateValueAndValidity();
  }

  onChangeToCurrency(selectedCurrency: any, mainIndex: number, forexIndex: number) {
    if (selectedCurrency) {
      this.forexAddons(mainIndex).at(forexIndex).get('wantCurrency').setValidators(null);
      this.cdr.markForCheck();
    } else {
      this.forexAddons(mainIndex).at(forexIndex).get('wantCurrency').setValidators([Validators.required]);
      this.cdr.markForCheck();
    }
    this.forexAddons(mainIndex).at(forexIndex).get('wantCurrency').updateValueAndValidity();
  }

  onChangeForexMOP(selectMop: any, mainIndex: number, forexIndex: number) {
    if (selectMop) {
      this.forexAddons(mainIndex).at(forexIndex).get('amount').setValidators([Validators.required]);
      this.cdr.markForCheck();
    } else {
      this.forexAddons(mainIndex).at(forexIndex).get('amount').setValidators(null);
      this.cdr.markForCheck();
    }
    this.forexAddons(mainIndex).at(forexIndex).get('amount').updateValueAndValidity();
  }

  onChangeForexAmount(enteredAmount: any, mainIndex: number, forexIndex: number) {
    if (enteredAmount) {
      this.forexAddons(mainIndex).at(forexIndex).get('mop').setValidators([Validators.required]);
      this.cdr.markForCheck();
    } else {
      this.forexAddons(mainIndex).at(forexIndex).get('mop').setValidators(null);
      this.cdr.markForCheck();
    }
    this.forexAddons(mainIndex).at(forexIndex).get('mop').updateValueAndValidity();
  }

  onPackageDynamicForm(formData: any,segmentIndex:number): void {

    if (formData) {
      //const carRentalData=this.requestId+'-'+segmentIndex+'-'+`carRentalData`;
      const carRentalData=this.requestId+'-'+`carRentalData`;
      //localStorage.removeItem(carRentalData);
      const paxDetails = {
        adt: this.flights().value[0]?.noofAdt,
        child: this.flights().value[0]?.noofChd,
        inf: this.flights().value[0]?.noofInf,
        pax: this.flights().value[0]?.holidayPersonList,
      };
      const ancillary={
        ...formData,
        ...paxDetails
      };
      this.formDataDynamicFormCarRental.push(ancillary);

      this.dynamicJson[`segment-${segmentIndex}`] =  this.formDataDynamicFormCarRental;

      this.dynamicJson[`segment-${segmentIndex}`] = this.dynamicJson[`segment-${segmentIndex}`]?.filter(segment => segment.segmentIndex == segmentIndex);
      localStorage.setItem(carRentalData, JSON.stringify(this.dynamicJson));

      const getCarRentalData=localStorage.getItem(carRentalData);
      if(getCarRentalData){
        const ancillaryData=JSON.parse(getCarRentalData);
        this.viewCarRentalForm= ancillaryData;
      }
    }
  }

  onPackageDynamicFormDelete(formData: any,segmentIndex:number): void {

    if(formData){
      const carRentalData=this.requestId+'-'+`carRentalData`;
      const getCarRentalData=localStorage.getItem(carRentalData);
      if(getCarRentalData){
        const ancillaryData=JSON.parse(getCarRentalData);
        this.formDataDynamicFormCarRental=ancillaryData[`segment-${segmentIndex}`];
      }

    }
  }




  getPackageDetailedInfo(requestId: number) {
    this.dashboardRequestService
      .getPackageDetailedInfo(apiUrls.Holiday_Package.packageItinerary, requestId)
      .pipe(takeUntil(this.ngDestroy$)).subscribe((res: any) => {
        const result: ApiResponse = res;
        if (result.status === 200) {
          this.PackageDetailedInfo = result.data;
          this.cdr.markForCheck();
        } else {
          this.PackageDetailedInfo = [];
          this.toastrService.error(result.message, 'Error');
          this.cdr.markForCheck();
        }
      });
  }


  anxPaxGrouping(paxInfo: any) {
    const groupByCategory = paxInfo?.reduce((group, product) => {
      const { paxCode } = product;
      group[paxCode] = group[paxCode] ?? [];
      group[paxCode].push(product);
      return group;
    }, {});

    if (groupByCategory?.Adult?.length > 0) {
      this.anxAdt = groupByCategory?.Adult?.length;
    } else {
      this.anxAdt = 0;
    }
    if (groupByCategory?.Child?.length > 0) {
      this.anxChd = groupByCategory?.Child?.length;
    } else {
      this.anxChd = 0;
    }
    if (groupByCategory?.Infant?.length > 0) {
      this.anxInf = groupByCategory?.Infant?.length;
    } else {
      this.anxInf = 0;
    }
  }
  anxRequestDataCoversion(main_element: any) {
    let attractionsPax = [];
    for (let attractionindex = 0; attractionindex < main_element?.ancillaries?.length; attractionindex++) {
      const attractionElement = main_element?.ancillaries[attractionindex];

      if (attractionElement?.paxDetails?.length > 0) {
        attractionsPax = attractionElement?.paxDetails?.map((item) => {
          if (item?.paxType?.split('-')[0] === 'ADT') {
            const pax = {
              paxCode: 'Adult',
              assign: Number(item.paxType?.split('-')[1]),
            };
            return pax;
          }
          if (item?.paxType?.split('-')[0] === 'CHD') {
            const pax = {
              paxCode: 'Child',
              assign: Number(item.paxType?.split('-')[1]),
            };
            return pax;
          }
          if (item?.paxType?.split('-')[0] === 'INF') {
            const pax = {
              paxCode: 'Infant',
              assign: Number(item.paxType?.split('-')[1]),
            };
            return pax;
          }
        });
      }
      //if(main_element?.paxInfo?.length>0){
      let anxPax = [];
      if (main_element?.paxInfo?.length > 0) {
        anxPax = main_element?.paxInfo?.filter((v) => {
          for (let index = 0; index < attractionsPax?.length; index++) {
            if (v.assign === attractionsPax[index]?.assign && v.paxCode === attractionsPax[index]?.paxCode) {
              return v;
            }
          }
        });
        this.anxPaxRequestData = anxPax;
        let anxRequestObject = {};

      if(attractionElement?.dynamicTabData?.length>0){
          for (let index = 0; index < attractionElement?.dynamicTabData.length; index++) {
           const element = attractionElement?.dynamicTabData[index];
           const updatedJson = { ...element };
           delete updatedJson.segmentIndex;
           delete updatedJson.srNumber;
           delete updatedJson.pax;
           delete updatedJson.adt;
           delete updatedJson.child;
           delete updatedJson.inf;
           anxRequestObject= {
             anx:{
               anxLineId: 0,
               anxLineAddons: {},
               anxLineAdtCount: element.adt,
               anxLineAttr1: '',
               anxLineAttr2: '',
               anxLineAttr3: '',
               anxLineAttr4: '',
               anxLineAttr5: '',
               anxLineAttr6: '',
               anxLineChdCount: element.child,
               anxLineInfCount: element.inf,
               anxLineJson: updatedJson,
               anxLineLpoAmount: 0,
               anxLineLpoDate: '',
               anxLineLpoNumber: '',
               anxLineRequestId: Number(this.requestId), // request id
               lineUuid: 0,
               anxLineStatus: 0,
               anxLineType: attractionElement.addOnName,
               anxLineTypeId: attractionElement.addOnId, //serviceTypeId
               deviceInfo: this.deviceInfo?.userAgent,
               deviceIp: null,
               loggedInUserId: this.authService.getUser(),
             },
             paxInfo: this.anxPaxRequestData,
           };

           this.anxRequestData.push(anxRequestObject);
          }
      }else{
        if (attractionElement?.paxCount > 0) {
          //this.anxPaxGrouping(anxPax);
          this.anxPaxGrouping(attractionsPax);
          anxRequestObject = {
            anx: {
              anxLineId: 0,
              anxLineAddons: {},
              anxLineAdtCount: this.anxAdt,
              anxLineAttr1: '',
              anxLineAttr2: '',
              anxLineAttr3: '',
              anxLineAttr4: '',
              anxLineAttr5: '',
              anxLineAttr6: '',
              anxLineChdCount: this.anxChd,
              anxLineInfCount: this.anxInf,
              anxLineJson: {},
              anxLineLpoAmount: 0,
              anxLineLpoDate: '',
              anxLineLpoNumber: '',
              anxLineRequestId: Number(this.requestId), // request id
              lineUuid: 0,
              anxLineStatus: 0,
              anxLineType: attractionElement.addOnName,
              anxLineTypeId: attractionElement.addOnId, //serviceTypeId
              deviceInfo: this.deviceInfo?.userAgent,
              deviceIp: null,
              loggedInUserId: this.authService.getUser(),
            },
            paxInfo: this.anxPaxRequestData,
          };
          this.anxRequestData.push(anxRequestObject);
        } else {
          this.anxAdt = 0;
          this.anxChd = 0;
          this.anxInf = 0;
          anxRequestObject = {
            anx: {
              anxLineId: 0,
              //anxLineId: 0,
              anxLineAddons: {},
              anxLineAdtCount: this.anxAdt,
              anxLineAttr1: '',
              anxLineAttr2: '',
              anxLineAttr3: '',
              anxLineAttr4: '',
              anxLineAttr5: '',
              anxLineAttr6: '',
              anxLineChdCount: this.anxChd,
              anxLineInfCount: this.anxInf,
              anxLineJson: {},
              anxLineLpoAmount: 0,
              anxLineLpoDate: '',
              anxLineLpoNumber: '',
              anxLineRequestId: Number(this.requestId), // request id
              lineUuid: 0,
              anxLineStatus: 0,
              anxLineType: attractionElement.addOnName,
              anxLineTypeId: attractionElement.addOnId, //serviceTypeId
              deviceInfo: this.deviceInfo?.userAgent,
              deviceIp: null,
              loggedInUserId: this.authService.getUser(),
            },
            paxInfo: [],
          };
          this.anxRequestData.push(anxRequestObject);
        }
      }
      } else {
        let anxRequestObject = {};
        if(attractionElement?.dynamicTabData?.length>0){
          for (let index = 0; index < attractionElement?.dynamicTabData.length; index++) {
           const element = attractionElement?.dynamicTabData[index];
           const updatedJson = { ...element };
           delete updatedJson.segmentIndex;
           delete updatedJson.srNumber;
           delete updatedJson.pax;
           delete updatedJson.adt;
           delete updatedJson.child;
           delete updatedJson.inf;
           anxRequestObject= {
             anx:{
               anxLineId: 0,
               anxLineAddons: {},
               anxLineAdtCount: element.adt,
               anxLineAttr1: '',
               anxLineAttr2: '',
               anxLineAttr3: '',
               anxLineAttr4: '',
               anxLineAttr5: '',
               anxLineAttr6: '',
               anxLineChdCount: element.child,
               anxLineInfCount: element.inf,
               anxLineJson: updatedJson,
               anxLineLpoAmount: 0,
               anxLineLpoDate: '',
               anxLineLpoNumber: '',
               anxLineRequestId: Number(this.requestId), // request id
               lineUuid: 0,
               anxLineStatus: 0,
               anxLineType: attractionElement.addOnName,
               anxLineTypeId: attractionElement.addOnId, //serviceTypeId
               deviceInfo: this.deviceInfo?.userAgent,
               deviceIp: null,
               loggedInUserId: this.authService.getUser(),
             },
             paxInfo: [],
           };
           this.anxRequestData.push(anxRequestObject);
          }
      }else if (attractionElement?.paxCount > 0) {
          this.anxPaxGrouping(attractionsPax);
          anxRequestObject = {
            anx: {
              anxLineId: 0,
              anxLineAddons: {},
              anxLineAdtCount: this.anxAdt,
              anxLineAttr1: '',
              anxLineAttr2: '',
              anxLineAttr3: '',
              anxLineAttr4: '',
              anxLineAttr5: '',
              anxLineAttr6: '',
              anxLineChdCount: this.anxChd,
              anxLineInfCount: this.anxInf,
              anxLineJson: {},
              anxLineLpoAmount: 0,
              anxLineLpoDate: '',
              anxLineLpoNumber: '',
              anxLineRequestId: Number(this.requestId), // request id
              lineUuid: 0,
              anxLineStatus: 0,
              anxLineType: attractionElement.addOnName,
              anxLineTypeId: attractionElement.addOnId, //serviceTypeId
              deviceInfo: this.deviceInfo?.userAgent,
              deviceIp: null,
              loggedInUserId: this.authService.getUser(),
            },
            paxInfo: [],
          };
          this.anxRequestData.push(anxRequestObject);
        } else {
          this.anxAdt = 0;
          this.anxChd = 0;
          this.anxInf = 0;
          anxRequestObject = {
            anx: {
              anxLineId: 0,
              //anxLineId: 0,
              anxLineAddons: {},
              anxLineAdtCount: this.anxAdt,
              anxLineAttr1: '',
              anxLineAttr2: '',
              anxLineAttr3: '',
              anxLineAttr4: '',
              anxLineAttr5: '',
              anxLineAttr6: '',
              anxLineChdCount: this.anxChd,
              anxLineInfCount: this.anxInf,
              anxLineJson: {},
              anxLineLpoAmount: 0,
              anxLineLpoDate: '',
              anxLineLpoNumber: '',
              anxLineRequestId: Number(this.requestId), // request id
              lineUuid: 0,
              anxLineStatus: 0,
              anxLineType: attractionElement.addOnName,
              anxLineTypeId: attractionElement.addOnId, //serviceTypeId
              deviceInfo: this.deviceInfo?.userAgent,
              deviceIp: null,
              loggedInUserId: this.authService.getUser(),
            },
            paxInfo: [],
          };
          this.anxRequestData.push(anxRequestObject);
        }

      }
      //}
    }
  }



  flightPaxDataConversion(paxInfo: any) {
    let passengerData: any[] = [];
    for (let index = 0; index < paxInfo?.length; index++) {
      const element = paxInfo[index];
      const pax_info = {
        paxId: element.paxId,
        prefix: element.prefix,
        firstName: element.firstName,
        lastName: element.lastName,
        dob: element.dob,
        nationality: element.nationality,
        nationalityName: element.nationlaityName,
        issuedCountry: element.issuedCountry,
        issuedCountryName: element.issuedCountryName,
        passport: element.passport,
        email: element.email,
        phone: element.phone,
        paxType: element.paxType,
        paxCode: element.paxCode,
        passportExpiredDate: element.passportExpiredDate,
        passportIssueDate: element.passportIssueDate,
        //requestLinePaxId:pax_sub_element.requestLinePaxId,
        createdDate: this.todaydateAndTimeStamp,
      };
      passengerData.push(pax_info);
    }



    return passengerData;
  }

  flightResourceDataConversion(flightHeaderAndSegements: any, data: any) {

    const cabinClassId = this.masterClassList?.find(
      (con) => con?.code === flightHeaderAndSegements?.serviceRequestSegment[0]?.className
    );


    const productName = 'Flight';
    const flightdata = this.productList?.find((con) => con?.name === productName);
    let segmentsArray = [];
    for (let index = 0; index < flightHeaderAndSegements?.serviceRequestSegment?.length; index++) {
      //const element = Data.serviceRequestSegment[index];
      const segmentsData = {
        fromCity: flightHeaderAndSegements.serviceRequestSegment[index]?.fromCode,
        toCity: flightHeaderAndSegements.serviceRequestSegment[index]?.toCode,
        marketingCarrier: flightHeaderAndSegements.serviceRequestSegment[index]?.airlineCode,
        operatingCarrier: flightHeaderAndSegements.serviceRequestSegment[index]?.airlineCode,
      };
      segmentsArray.push(segmentsData);
    }

    const customerDetailsBySrId = this.authService.getCustomerType();
    const total: number =
      Number(flightHeaderAndSegements?.serviceRequestLine?.noofADT) +
      Number(flightHeaderAndSegements?.serviceRequestLine?.noofCHD) +
      Number(flightHeaderAndSegements?.serviceRequestLine?.noofINF);
    const flightResourceData = {
      productId: flightdata?.id === undefined ? 1:flightdata?.id,
      bookingTypeId: 1,
      cabinClassId: cabinClassId?.id === undefined ?3:cabinClassId?.id ,
      paxCount: Number(total),
      typeOfJourneyId: flightHeaderAndSegements?.serviceRequestLine?.tripTypeId,
      //hotelNoOfDays: 0,
      //hotelDestination: null,
      //hotelRoomsCount: 0,
      //hotelNightsCount: 0,
      srId: Number(this.requestId),
      //srLineId:Number(this.srLineId),
      srLineId: data?.serviceRequestLine?.requestLineId,
      budgetAmount: 0,
      companyId: this.authService.getUserOrganization(),
      locationId: this.authService.getUserLocation(),
      costCenterId: this.authService.getUserCostCenter(),
      userId: this.authService.getUser(),
      customerId: customerDetailsBySrId?.customerId,
      customerCategoryId: customerDetailsBySrId?.custcategoryId,
      customerRatingId: customerDetailsBySrId?.customerRating,
      customerTypeId: customerDetailsBySrId?.customerTypeId,
      ticketType: 'ticket',
      segments: segmentsArray,
    };



    return flightResourceData;
  }

  flightSrSummaryDataConversion(flightHeaderAndSegements: any, data: any) {

    if (flightHeaderAndSegements && data && this.contactDetails) {
      const total: number =
        Number(flightHeaderAndSegements?.serviceRequestLine?.noofADT) +
        Number(flightHeaderAndSegements?.serviceRequestLine?.noofCHD) +
        Number(flightHeaderAndSegements?.serviceRequestLine?.noofINF);
      const productName = 'Flight';
      const flightdata = this.productList?.find((con) => con.name === productName);
      const SUMMARYDATA = {
        contactEmail: this.contactDetails?.contact?.primaryEmail,
        contactId: this.contactDetails?.contact?.id,
        contactName: this.contactDetails?.contact?.firstName + ' ' + this.contactDetails?.contact?.lastName,
        contactPhone: this.contactDetails?.contact?.primaryPhoneNumber,
        deviceInfo: this.deviceInfo?.userAgent,
        loggedInUserId: this.authService.getUser(),
        passengerCount: Number(total),
        productId: flightdata?.id === undefined ? 1: flightdata?.id ,
        serviceRequestId: Number(this.requestId),
        serviceRequestLineId: data?.serviceRequestLine?.requestLineId,
        travelDateOrCheckInDate: flightHeaderAndSegements?.serviceRequestSegment[0]?.depatureDate,
      };

      return SUMMARYDATA;
    }
  }
  hotelResourcesAssignmentHotel(formData: any, data: any) {
    const HOTELFORMDATA = formData?.srLine;
    const productName = 'Hotel';
    const hoteldata = this.productList?.find((con) => con.name === productName);
    const customerDetailsBySrId = this.authService.getCustomerType();
    if (HOTELFORMDATA) {
      const sendData = {
        productId: hoteldata?.id === undefined ? 2:hoteldata?.id  ,
        bookingTypeId: 1,
        cabinClassId: 0,
        paxCount: 0,
        typeOfJourneyId: 0,
        hotelNoOfDays: parseInt(HOTELFORMDATA?.lineTotalDays),
        hotelDestination: HOTELFORMDATA?.lineLocation,
        hotelRoomsCount: parseInt(HOTELFORMDATA?.lineRoomCount),
        hotelNightsCount: parseInt(HOTELFORMDATA?.lineNoOfNights),
        srId: Number(this.requestId),
        srLineId: data?.srLine?.id,
        budgetAmount: 0,
        companyId: this.authService.getUserOrganization(),
        locationId: this.authService.getUserLocation(),
        costCenterId: this.authService.getUserCostCenter(),
        userId: this.authService.getUser(),
        customerId: customerDetailsBySrId?.customerId,
        customerCategoryId: customerDetailsBySrId?.custcategoryId,
        customerRatingId: customerDetailsBySrId?.customerRating,
        customerTypeId: customerDetailsBySrId?.customerTypeId,
        ticketType: 'ticket',
        segments: [],
      };
      return sendData;
    }
  }

  hotelSrSummayHotelData(formData: any, data: any) {
    if (this.contactDetails && formData && data) {
      const productName = 'Hotel';
      const hoteldata = this.productList?.find((con) => con.name === productName);
      const total: number = Number(formData.srRooms?.roomAdultCount) + Number(formData.srRooms?.roomChildCount);
      const SUMMARYDATA = {
        contactEmail: this.contactDetails?.contact?.primaryEmail,
        contactId: this.contactDetails?.contact?.id,
        contactName: this.contactDetails?.contact?.firstName + ' ' + this.contactDetails?.contact?.lastName,
        contactPhone: this.contactDetails?.contact?.primaryPhoneNumber,
        deviceInfo: this.deviceInfo?.userAgent,
        loggedInUserId: this.authService.getUser(),
        passengerCount: Number(total),
        productId: hoteldata?.id,
        serviceRequestId: this.contactDetails?.requestId,
        serviceRequestLineId: data?.srLine?.id,
        travelDateOrCheckInDate: formData?.srLine.lineCheckInDate,
      };

      return SUMMARYDATA;
    }
  }

  saveAttractionsSrSummayData(attractionLineId:number,attractionsPaxCount:number) {

    if (this.contactDetails&&attractionLineId) {
      const productName = 'Attraction';
      const anxProductNumber=  this.productList?.find((con) => con.name === productName);

      const SUMMARYDATA = {
        contactEmail: this.contactDetails?.contact?.primaryEmail,
        contactId: this.contactDetails?.contact?.id,
        contactName: this.contactDetails?.contact?.firstName + ' ' + this.contactDetails?.contact?.lastName,
        contactPhone: this.contactDetails?.contact?.primaryPhoneNumber,
        deviceInfo: this.deviceInfo?.userAgent,
        loggedInUserId: this.authService.getUser(),
        passengerCount: attractionsPaxCount,
        productId: anxProductNumber?.id === undefined ?4:anxProductNumber?.id ,
        serviceRequestId: this.contactDetails?.requestId,
        serviceRequestLineId: attractionLineId,
        travelDateOrCheckInDate: null,
      };

      this.dashboardRequestService.saveSrSummary(SUMMARYDATA, apiUrls.SrSummaryData.SAVESRSUMMARYDATA).subscribe((res:any) => {
        const result: ApiResponse = res;
        if (result.status === 200) {
          console.log('attractions  sr summary saved ');

        } else if (result.message === ' ') {
          this.toastrService.error('Oops! Something went wrong  while send the attractions sr summary data please try again', 'Error', {
            progressBar: true,
          });
        } else {
          this.toastrService.error(result.message, 'Error', { progressBar: true });
        }
      });
    }
  }



  saveAnxSrSummayData(anxLineId:number,anxValues:any) {
    if (this.contactDetails&&anxLineId) {
      const productName = 'Ancillary';
      const anxProductNumber=  this.productList?.find((con) => con.name === productName);
      const total: number =
        Number(anxValues.anxLineAdtCount) +
        Number(anxValues.anxLineChdCount) +
        Number(anxValues.anxLineInfCount) ;
      const SUMMARYDATA = {
        contactEmail: this.contactDetails?.contact?.primaryEmail,
        contactId: this.contactDetails?.contact?.id,
        contactName: this.contactDetails?.contact?.firstName + ' ' + this.contactDetails?.contact?.lastName,
        contactPhone: this.contactDetails?.contact?.primaryPhoneNumber,
        deviceInfo: this.deviceInfo?.userAgent,
        loggedInUserId: this.authService.getUser(),
        passengerCount: Number(total),
        productId: anxProductNumber?.id === undefined ?3 :anxProductNumber?.id ,
        serviceRequestId: this.contactDetails?.requestId,
        serviceRequestLineId: anxLineId,
        travelDateOrCheckInDate: null,

      };
      this.dashboardRequestService.saveSrSummary(SUMMARYDATA, apiUrls.SrSummaryData.SAVESRSUMMARYDATA).pipe(takeUntil(this.ngDestroy$)).subscribe((res:any) => {
        const result: ApiResponse = res;
        if (result.status === 200) {
          console.log('anx sr summary saved ');

        } else if (result.message === ' ') {
          this.toastrService.error('Oops! Something went wrong  while send the anx sr summary data please try again', 'Error', {
            progressBar: true,
          });
        } else {
          this.toastrService.error(result.message, 'Error', { progressBar: true });
        }
      });
    }
  }


  anxPaxDataConversion(anxPax: any) {
    let convertPax = [];
    if (anxPax?.length > 0) {
      for (let r = 0; r < anxPax?.length; r++) {
        const element = anxPax[r];
        const nationality = {
          id: element.nationality,
          name: element.nationlaityName,
        };
        const issuedCountry = {
          id: element.issuedCountry,
          name: element.issuedCountryName,
        };
        const pax = {
          prefix: element.prefix,
          firstName: element.firstName,
          lastName: element.lastName,
          dob: element.dob,
          nationality: nationality === undefined || nationality?.id === null ? null : nationality?.id,
          //nationality: res[r].nationality?.id,
          nationalityName: nationality?.name === undefined || nationality?.name === null ? null : nationality?.name,
          issuedCountry: issuedCountry?.id === undefined || issuedCountry?.id === null ? null : issuedCountry?.id,
          issuedCountryName:
            issuedCountry?.name === undefined || issuedCountry?.name === null ? null : issuedCountry?.name,
          passport: element.passport,
          email: element.email,
          phone: element.phone,
          paxType: element.paxType,
          passportExpiredDate: element.passportExpiredDate,
          passportIssueDate: element.passportIssueDate,
          //requestLinePaxId: element.requestLinePaxId,
          createdDate: this.todaydateAndTimeStamp,
        };
        convertPax.push(pax);
      }
    }

    return convertPax;
  }
  async onCreateServiceRequest() {
    if (this.PackageDetailedInfo?.length > 0) {

      this.showSpinner();
      this.requestCreationLoading=true;
      let segment_array: any[] = [];
      let flight_pax_info: any[] = [];
      let flight_pax_Data_info: any[] = [];
      let addonsRoutesData: any[] = [];
      let flightAddons: any[] = [];
      let adt: any;
      let chd: any;
      let inf: any;
      for (let index = 0; index < this.PackageDetailedInfo?.length; index++) {
        const main_element = this.PackageDetailedInfo[index];
        if (main_element?.flight?.length > 0) {
          for (let flight_index = 0; flight_index < main_element?.flight?.length; flight_index++) {
            const flight_element = main_element.flight[flight_index];
            const segment_data = {
              requestID: Number(this.requestId),
              //requestlineID:'',
              fromCode: flight_element?.segmentBoardPoint,
              fromCountryName: flight_element?.segmentBoardPoint,
              fromAirportOrCityName: flight_element?.segmentBoardCityOrAirport,
              toCode: flight_element?.segmentOffPoint,
              toCountryName: flight_element?.segmentOffPoint,
              toAirportOrCityName: flight_element?.segmentArrivalCityOrAirport,
              depatureDate: flight_element?.segmentDepartDate,
              returnDate: null,
              className: flight_element?.segmentClassDesignator,
              rbd: flight_element?.segmentRbdCode,
              validateCarrier: null,
              transitPointCode: [],
              excludePointCode: [],
              flexFromCode: [],
              flexToCode: [],
              flexDepature: [],
              flexReturn: [],
              flexClassName: [],
              flexAirLineCode: [],
              budgetFrom: null,
              budgetTo: null,
              airlineCode:
                flight_element?.segmentAirlineMarketing === null ? null : flight_element?.segmentAirlineMarketing,
            };

            if (flight_element.paxInfo?.length > 0) {
              for (let sub_index = 0; sub_index < flight_element.paxInfo?.length; sub_index++) {
                const flight_pax_sub_element = flight_element.paxInfo[0];
                const pax_info = {
                  paxId: flight_pax_sub_element.paxId,
                  prefix: flight_pax_sub_element.prefix,
                  firstName: flight_pax_sub_element.firstName,
                  lastName: flight_pax_sub_element.lastName,
                  dob: flight_pax_sub_element.dob,
                  nationality: flight_pax_sub_element.nationality,
                  nationalityName: flight_pax_sub_element.nationlaityName,
                  issuedCountry: flight_pax_sub_element.issuedCountry,
                  issuedCountryName: flight_pax_sub_element.issuedCountryName,
                  passport: flight_pax_sub_element.passport,
                  email: flight_pax_sub_element.email,
                  phone: flight_pax_sub_element.phone,
                  paxType: flight_pax_sub_element.paxType,
                  paxCode: flight_pax_sub_element.paxCode,
                  passportExpiredDate: flight_pax_sub_element.passportExpiredDate,
                  passportIssueDate: flight_pax_sub_element.passportIssueDate,
                  //requestLinePaxId:pax_sub_element.requestLinePaxId,
                  createdDate: this.todaydateAndTimeStamp,
                };
                flight_pax_info.push(pax_info);

                let linePersonCount = [];
                if (flight_element?.infCount > 0) {
                  for (let lineINFIndex = 1; lineINFIndex <= flight_element?.infCount; lineINFIndex++) {
                    let INFData = {
                      paxNo: lineINFIndex,
                      selectedAllGroup: 'Select All',
                      paxTypeCode: 'Infant' + '-' + lineINFIndex,
                      paxType: 'INF' + '-' + lineINFIndex,
                      bindLablePaxType: 'INF' + '-' + lineINFIndex,
                      paxRefence: 0,
                    };
                    linePersonCount.push(INFData);
                  }
                }
                if (flight_element?.adtCount > 0) {
                  for (let lineAdultIndex = 1; lineAdultIndex <= flight_element?.adtCount; lineAdultIndex++) {
                    let adultData = {
                      paxNo: lineAdultIndex,
                      selectedAllGroup: 'Select All',
                      paxTypeCode: 'Adult' + '-' + lineAdultIndex,
                      paxType: 'ADT' + '-' + lineAdultIndex,
                      bindLablePaxType: 'ADT' + '-' + lineAdultIndex,
                      paxRefence: 0,
                    };
                    linePersonCount.push(adultData);
                  }
                }
                if (flight_element?.chdCount > 0) {
                  for (let lineChildIndex = 1; lineChildIndex <= flight_element?.chdCount; lineChildIndex++) {
                    let childData = {
                      paxNo: lineChildIndex,
                      selectedAllGroup: 'Select All',
                      paxTypeCode: 'Child' + '-' + lineChildIndex,
                      paxType: 'CHD' + '-' + lineChildIndex,
                      bindLablePaxType: 'CHD' + '-' + lineChildIndex,
                      paxRefence: 0,
                    };
                    linePersonCount.push(childData);
                  }
                }

                let passengerData = [...flight_element.paxInfo];
                passengerData = JSON.parse(JSON.stringify(passengerData));
                let adultIndex = 1;
                let childIndex = 1;
                let infIndex = 1;
                if (passengerData?.length > 0) {
                  for (let passengerIndex = 0; passengerIndex < passengerData?.length; passengerIndex++) {
                    if (passengerData[passengerIndex]?.paxCode === 'Adult') {
                      passengerData[passengerIndex].paxTypeRefName =
                        passengerData[passengerIndex].paxCode + '-' + adultIndex;
                      adultIndex = adultIndex + 1;
                    }
                    if (passengerData[passengerIndex]?.paxCode === 'Child') {
                      passengerData[passengerIndex].paxTypeRefName =
                        passengerData[passengerIndex].paxCode + '-' + childIndex;
                      childIndex = childIndex + 1;
                    }
                    if (passengerData[passengerIndex]?.paxCode === 'Infant') {
                      passengerData[passengerIndex].paxTypeRefName =
                        passengerData[passengerIndex]?.paxCode + '-' + infIndex;
                      infIndex = infIndex + 1;
                    }
                  }
                }
                if (linePersonCount.length > 0) {
                  for (let index = 0; index < linePersonCount.length; index++) {
                    linePersonCount[index].paxNo = index + 1;
                    if (passengerData?.length > 0) {
                      for (let passengerIndex = 0; passengerIndex < passengerData?.length; passengerIndex++) {
                        if (passengerData[passengerIndex].paxTypeRefName === linePersonCount[index].paxTypeCode) {
                          //linePersonCount[index].paxType = passengerData[passengerIndex].paxTypeRefName + '-' + passengersData[passengerIndex]?.firstName;
                          linePersonCount[index].paxType =
                            passengerData[passengerIndex].paxTypeRefName +
                            '-' +
                            passengerData[passengerIndex]?.firstName;
                          linePersonCount[index].paxRefence = passengerData[passengerIndex]?.paxId;
                        }
                      }
                    }
                  }
                }
                this.addonsPassengers = linePersonCount;
              }
            }

            if (flight_element.addOns?.length > 0) {
              for (let addonsindex = 0; addonsindex < flight_element.addOns?.length; addonsindex++) {
                const addonselement = flight_element.addOns[addonsindex];
                const addonsRoutes = {
                  routeNo: flight_index + 1,
                  selectedAllGroup: 'Select All',
                  route: flight_element?.segmentBoardPoint + ' - ' + flight_element?.segmentOffPoint,
                  bindLableRoute: flight_element?.segmentBoardPoint + ' - ' + flight_element?.segmentOffPoint,
                };
                addonsRoutesData.push(addonsRoutes);
                let modifyPaxDeatils = [];
                if (addonselement?.paxDetails?.length > 0) {
                  for (let index = 0; index < addonselement?.paxDetails?.length; index++) {
                    const element = addonselement?.paxDetails[index];
                    const data = {
                      paxNo: element.paxNo,
                      selectedAllGroup: 'Select All',
                      paxType: element.paxType,
                      bindLablePaxType: element.paxType,
                      paxRefence: 0,
                    };
                    modifyPaxDeatils.push(data);
                  }
                }

                const addonsObject = {
                  addOnType: {
                    name: addonselement.addOnName,
                    id: addonselement.addOnId,
                    addOnCode: addonselement.addOnCode,
                    addOnDescription: addonselement.addOnDescription,
                    addOnType: addonselement.addOnType,
                  },
                  required: false,
                  extraCost: addonselement.extraCost,
                  remarks: addonselement.remarks,
                  requiredRoute: {
                    all: true,
                    //routes: addonsRoutesData,
                    routes: [addonsRoutes],
                  },
                  requiredPassenger: {
                    all: true,
                    //passengers: this.addonsPassengers,
                    //passengers: addonselement.paxDetails,
                    passengers: modifyPaxDeatils,
                  },
                };
                flightAddons.push(addonsObject);
              }
            }
            flight_pax_Data_info = main_element.flight[0]?.paxInfo === null ? [] : flight_element.paxInfo;
            segment_array.push(segment_data);
            adt = flight_element.adtCount;
            chd = flight_element.chdCount;
            inf = flight_element.infCount;
          }
          const flight_details_data = {
            serviceRequestLine: {
              requestId: Number(this.requestId),
              lPoDate: null,
              lpoAmount: 0.0,
              lpoNumber: 0.0,
              noofADT: adt,
              noofCHD: chd,
              noofINF: inf,
              tripTypeId: 11,
              typeOfFlight: '11',
              connectingDetails: null,
              flexStops: null,
              passengerTypeId: null,
              lineStatusId: null,
              createdBy: this.authService.getUser(),
              createdDate: this.todaydateAndTimeStamp,
              expandableParametersCode: null,
              dealCode: null,
              addons: flightAddons,
            },
            serviceRequestSegment: segment_array,
            //segment_pax:flight_pax_info
            //segment_pax: flight_pax_Data_info,
            segment_pax: main_element?.flight[0]?.paxInfo === null ? [] : main_element?.flight[0]?.paxInfo,
          };
          this.flight_data.push(flight_details_data);
        }
        if (main_element?.hotels?.length > 0) {
          for (let hotel_index = 0; hotel_index < main_element?.hotels.length; hotel_index++) {
            const hotel_element = main_element?.hotels[hotel_index];
            const location_info =
              hotel_element.hotelCityName +
              ' ' +
              hotel_element.hotelCountryName +
              '(' +
              hotel_element.hotelCountryCode +
              ')';


            if (hotel_element.paxInfo?.length > 0) {
              for (let sub_index = 0; sub_index < hotel_element?.paxInfo?.length; sub_index++) {
                const hotel_pax_sub_element = hotel_element?.paxInfo[sub_index];
                const pax_info = {
                  passengerSrId: Number(this.requestId),
                  passengerStatus: 0,
                  passengerAddonsRequired: 0,
                  passengerPaxId: hotel_pax_sub_element.paxId,
                  passengerTitle: hotel_pax_sub_element.prefix,
                  passengerFirstName: hotel_pax_sub_element.firstName,
                  passengerLastName: hotel_pax_sub_element.lastName,
                  passengerMiddleName: null,
                  passengerDob: hotel_pax_sub_element.dob,
                  passengerNationality: hotel_pax_sub_element.nationality,
                  //nationlaityName:hotel_pax_sub_element.nationlaityName,
                  passengerCoutry: hotel_pax_sub_element.issuedCountry,
                  // issuedCountryName:hotel_pax_sub_element.issuedCountryName,
                  //passport:hotel_pax_sub_element.passport,
                  passengerEmail: hotel_pax_sub_element.email,
                  passengerPhone: hotel_pax_sub_element.phone,
                  passengerType: hotel_pax_sub_element.paxType,
                  passengerAttr1: hotel_pax_sub_element.paxCode,
                  //passportExpiredDate:hotel_pax_sub_element.passportExpiredDate,
                  //passportIssueDate:hotel_pax_sub_element.passportIssueDate,
                  passengerCreatedDate: this.todaydateAndTimeStamp,
                  passengerCreatedBy: this.authService.getUser(),
                  passengerCreatedIp: null,
                  passengerCreatedDevice: this.deviceInfo?.userAgent,
                };
                this.hotel_pax_info.push(pax_info);
              }
            }
            let room_array: any[] = [];
           let totalAdultsCount = 0;
           let totalCHDCount = 0;
           let totalINFCount = 0;

            if (hotel_element?.roomsInfo?.length > 0) {
              for (let index = 0; index < hotel_element?.roomsInfo.length; index++) {
                const roomCountElement = hotel_element?.roomsInfo[index];
                totalAdultsCount+= roomCountElement.roomAdultCount;
                totalCHDCount+= roomCountElement.roomChildCount;
                totalINFCount+= roomCountElement.roomInfantCount;
                const roomsInfoData = {
                  //id:'',
                  roomSrId: Number(this.requestId),
                  //roomNumber: hotelelement?.roomNumber === ""?0:Number(hotelelement?.roomNumber),
                  roomNumber: index + 1,
                  roomAddonsRequired: 0,
                  roomAdultCount: roomCountElement.roomAdultCount,
                  roomChildCount: roomCountElement.roomChildCount,
                  roomInfantCount: roomCountElement.roomInfantCount,
                  roomChildAges: roomCountElement.roomChildAges,
                  roomStatus: 0,
                  roomCreatedIp: null,
                  roomCreatedBy: this.authService.getUser(),
                  roomCreatedDate: this.todaydateAndTimeStamp,
                  roomCreatedDevice: this.deviceInfo?.userAgent,
                  roomPassengersInfo: this.hotel_pax_info,
                };

                room_array.push(roomsInfoData);
              }
            }else{

               totalAdultsCount = hotel_element.adtCount;
               totalCHDCount = hotel_element.chdCount + hotel_element.infCount;
               //totalINFCount = hotel_element.infCount;
               totalINFCount = 0;
               let noRoomAdtCount=0;
               let noRoomChdCount=0;
               let noRoomInfCount=0;
               if(hotel_element.paxInfo?.length>0){
                const groupByCategory = hotel_element.paxInfo?.reduce((group, product) => {
                  const { paxCode } = product;
                  group[paxCode] = group[paxCode] ?? [];
                  group[paxCode].push(product);
                  return group;
                }, {});


                if (groupByCategory?.Adult?.length > 0) {
                  noRoomAdtCount = groupByCategory?.Adult?.length;
                } else {
                  noRoomAdtCount = 0;
                }
                if (groupByCategory?.Child?.length > 0) {
                  noRoomChdCount = groupByCategory?.Child?.length;
                } else {
                  noRoomChdCount = 0;
                }
                if (groupByCategory?.Infant?.length > 0) {
                  noRoomInfCount = groupByCategory?.Infant?.length;
                } else {
                  noRoomInfCount= 0;
                }
               }else{
                noRoomAdtCount = hotel_element.adtCount;
                noRoomChdCount = hotel_element.chdCount;
               }

               const roomsInfoData = {
                //id:'',
                roomSrId: Number(this.requestId),
                //roomNumber: hotelelement?.roomNumber === ""?0:Number(hotelelement?.roomNumber),
                roomNumber:  1,
                roomAddonsRequired: 0,
                roomAdultCount: noRoomAdtCount,
                roomChildCount: noRoomChdCount,
                roomInfantCount: noRoomInfCount,
                roomChildAges: null,
                roomStatus: 0,
                roomCreatedIp: null,
                roomCreatedBy: this.authService.getUser(),
                roomCreatedDate: this.todaydateAndTimeStamp,
                roomCreatedDevice: this.deviceInfo?.userAgent,
                roomPassengersInfo: this.hotel_pax_info,
              };

              room_array.push(roomsInfoData);
            }
            let room_Addons_array: any[] = [];
            if (hotel_element?.addOns?.length > 0) {
              for (let hotelAddonsindex = 0; hotelAddonsindex < hotel_element?.addOns?.length; hotelAddonsindex++) {
                const hotelAddonselement = hotel_element?.addOns[hotelAddonsindex];
                let roomsPax = [];
                if (hotel_element?.roomsInfo?.length > 0) {
                  for (let index = 0; index < hotel_element?.roomsInfo.length; index++) {
                    const element = hotel_element?.roomsInfo[index];
                    const roomNumber = index + 1;
                    if (hotelAddonselement?.paxDetails?.length > 0) {
                      for (
                        let hotelAddonselementIndex = 0;
                        hotelAddonselementIndex < hotelAddonselement?.paxDetails?.length;
                        hotelAddonselementIndex++
                      ) {
                        const element = hotelAddonselement?.paxDetails[hotelAddonselementIndex];
                        const paxType = element.paxType.split('-')[0];

                        const roomPax = hotelAddonselementIndex + 1;
                        switch (paxType) {
                          case 'ADT':
                            roomsPax?.push('Room-' + roomNumber + '-Adult-' + roomPax);
                            break;
                          case 'CHD':
                            roomsPax?.push('Room-' + roomNumber + '-Child-' + roomPax);
                            break;
                          /*  case 'INF':
                            roomsPax?.push('Room-' + index+1 + '-Adult-' + roomPax)
                              break; */
                          default:
                            roomsPax = [];
                            console.log('No such paxType exists!');
                            break;
                        }
                      }
                    }
                  }
                }
                let roomNights = [];
                if (hotel_element.noOfDays > 0) {
                  for (let roomNightsIndex = 1; roomNightsIndex <= hotel_element.noOfDays; roomNightsIndex++) {
                    roomNights.push(roomNightsIndex);
                  }
                }

                const hotelAddonsobject = {
                  addonSrId: Number(this.requestId),
                  roomsCount: hotel_element?.roomsCount,
                  addonLineId: 0,
                  addonRoomId: 0,
                  addonTitle: hotelAddonselement?.addOnName,
                  addonPassengerId: 0,
                  addonPassengers: null,
                  //addonPassengers: roomsPax?.length===0?null: roomsPax?.toString(),
                  addonWithBooking: 0,
                  addonCount: hotelAddonselement?.paxCount,
                  addonNights: roomNights?.length === 0 ? null : roomNights?.toString(),
                  addonRemarks: hotelAddonselement?.remarks,
                  addonRequired: 0,
                  addonExtraCost: hotelAddonselement?.extraCost === true ? 1 : 0,
                  addonStatus: 0,
                  addonSubType: null,
                  addonSubTypeId: 0,
                  addonType: null,
                  addonTypeId: 0,
                  addonDescription: null,
                  addonCreatedBy: this.authService.getUser(),
                  addonCreatedDate: this.todaydateAndTimeStamp,
                  addonCreatedDevice: this.deviceInfo?.userAgent,
                  addonCreatedIp: null,
                };
                this.hotelAddons.push(hotelAddonsobject);
                room_Addons_array.push(hotelAddonsobject)
              }
            }
            const hotel_info_data = {
              srLine: {
                lineLatitude: '',
                lineLongitude: '',
                lineRadius: '',
                lineSrId: Number(this.requestId),
                lineCountry: '',
                lineCity: '',
                lineLocation: location_info,
                lineHotelName: '',
                linePropertyType: '',
                lineMealType: '',
                lineCheckInDate: hotel_element.checkInDate,
                lineCheckOutDate: hotel_element.checkOutDate,
                lineNoOfNights: hotel_element.noOfDays,
                lineRoomCount: hotel_element.roomsCount === null|| hotel_element.roomsCount === undefined || hotel_element.roomsCount === "" ?1: hotel_element.roomsCount ,
                lineCountryResidency: '',
                lineNationality: '',
                lineRatings: Number(hotel_element?.hotelRating),
                lineMarkUpType: 'P',
                lineMarkupAmount: null,
                lineMarkupPercentage: null,
                //lineAdultCount: hotel_element?.adtCount,
                //lineChildCount: hotel_element?.chdCount,
                //lineInfantCount: hotel_element?.infCount,

                lineAdultCount: totalAdultsCount,
                lineChildCount: totalCHDCount,
                lineInfantCount: totalINFCount,
                lineTotalDays: hotel_element.noOfDays,
                //lineSearchType: null,
                lineSearchType: "Normal",
                lineAddonsRequired: 0,
                lineApis: '',
                lineCreatedBy: this.authService.getUser(),
                lineCreatedDate: this.todaydateAndTimeStamp,
                lineCreatedDevice: this.deviceInfo?.userAgent,
                lineCreatedIp: null,
                lpoDate: null,
                lpoAmount: null,
                lpoNumber: null,
              },
              srRooms: room_array,
              srRoomAddons:room_Addons_array
            };


            this.hotel_data.push(hotel_info_data);

          }
        }
        if (main_element.attractions?.length > 0) {
          let attractions_lines: any[] = [];
          for (let attractions_index = 0; attractions_index < main_element.attractions.length; attractions_index++) {
            const attractions_element = main_element.attractions[attractions_index];
            let attractions_pax: any[] = [];
            if (attractions_element.paxDetails?.length > 0) {
              let attractionsPax = [];
                attractionsPax = attractions_element.paxDetails?.map((item) => {
                  if (item?.paxType?.split('-')[0] === 'ADT') {
                    const pax = {
                      paxCode: 'Adult',
                      assign: Number(item.paxType?.split('-')[1]),
                    };
                    return pax;
                  }
                  if (item?.paxType?.split('-')[0] === 'CHD') {
                    const pax = {
                      paxCode: 'Child',
                      assign: Number(item.paxType?.split('-')[1]),
                    };
                    return pax;
                  }
                  if (item?.paxType?.split('-')[0] === 'INF') {
                    const pax = {
                      paxCode: 'Infant',
                      assign: Number(item.paxType?.split('-')[1]),
                    };
                    return pax;
                  }
                });
                //console.log('attractionsPax',attractionsPax);
                let anxPax = [];
                if(main_element?.paxInfo?.length>0){

                  anxPax = main_element?.paxInfo?.filter((v) => {
                    for (let index = 0; index < attractionsPax?.length; index++) {
                      if (v.assign === attractionsPax[index]?.assign && v.paxCode === attractionsPax[index]?.paxCode) {
                        return v;
                      }
                    }
                  });


                }


             if(anxPax?.length >0){
              for (let index = 0; index < anxPax?.length; index++) {
                const sub_element = anxPax[index];
                const attractions_pax_info = {
                  attractionLinePassengerDob: sub_element.dob === null ? null:sub_element.dob,
                  attractionLinePassengerEmail: sub_element.email,
                  attractionLinePassengerFristName: sub_element.firstName,
                  attractionLinePassengerGender: null,
                  attractionLinePassengerLastName: sub_element.lastName,
                  attractionLinePassengerMiddleName: null,
                  attractionLinePassengerPhone: sub_element.phone,
                  attractionLinePassengerTitle: sub_element.prefix,
                  attractionLinePassengerType: sub_element.paxCode,
                  attractionLinePaxId: sub_element.paxId,
                };
                attractions_pax.push(attractions_pax_info);
              }
             }

            }

            const attractionsLines = {
              attractionId: attractions_element.attractionID,
              attractionLineCity: attractions_element.city,
              attractionLineCountry: attractions_element.country,
              attractionLineDate: attractions_element.daysList[0],
              attractionLineDay: 0,
              attractionLineLocation: attractions_element.location === null? attractions_element.city :attractions_element.location,
              attractionLineName: attractions_element.attractionName,
              attractionLinePaxCount: attractions_element.paxCount === null ? 0 : attractions_element.paxCount,
              //passengers:attractions_element.paxDetails
              passengers: attractions_pax,
            };

            attractions_lines.push(attractionsLines);
          }
          if( attractions_lines?.length>0){
            for (let index = 0; index < attractions_lines?.length; index++) {
              const element = attractions_lines[index];
              const attraction_info_data = {
                attractionAttribute1: 'string',
                attractionAttribute2: 'string',
                attractionAttribute3: 'string',
                attractionCreatedBy: this.authService.getUser(),
                attractionCreatedDevice: this.deviceInfo?.userAgent,
                attractionCreatedIp: 'string',
                attractionDescription: 'string',
                attractionName: element.attractionLineName,
                attractionRequestId: Number(this.requestId),
                lines: [element],
              };
              this.attractions_data.push(attraction_info_data);
            }
          }

          /* const attraction_info_data = {
            attractionAttribute1: 'string',
            attractionAttribute2: 'string',
            attractionAttribute3: 'string',
            attractionCreatedBy: this.authService.getUser(),
            attractionCreatedDevice: this.deviceInfo?.userAgent,
            attractionCreatedIp: 'string',
            attractionDescription: 'string',
            attractionName: `Package-Attractions-${Number(this.requestId)}`,
            attractionRequestId: Number(this.requestId),
            lines: attractions_lines,
          };
          this.attractions_data.push(attraction_info_data); */
        }

        if (main_element?.ancillaries?.length > 0) {
          this.anxRequestDataCoversion(main_element);
        }
      }
    }
    /* console.log("flight",this.flight_data);
    console.log("hotel",this.hotel_data);
    console.log("hotelAddons",this.hotelAddons);
    console.log("anx",this.anxRequestData);
    console.log("attractions",this.attractions_data);
    this.requestCreationLoading=false;
    return; */
    if (this.flight_data?.length > 0) {
      // this.onCreateFlightServiceRequest(this.flight_data);
      const flightData=this.flight_data;
      let flightRequestSubApis=[];
      let flightRequestPax=[];
      let flightRequestSrSummary=[];
      let flightRequestResourcesAssignment=[];
      const saveFlightData = {
        serviceRequestLine: flightData[0]?.serviceRequestLine,
        serviceRequestSegment: flightData[0]?.serviceRequestSegment,
      };
        try{
          const flightRequestResponse = await this.dashboardRequestService.createServiceRequestLineSegment(saveFlightData).toPromise();

          if(flightRequestResponse){
            if (flightData[0]?.segment_pax?.length > 0) {
              const pax = this.flightPaxDataConversion(flightData[0]?.segment_pax);
              if(flightRequestResponse?.serviceRequestLine?.requestLineId){
                const paxPayload = {
                  paxData: pax,
                  requestId: Number(this.requestId),
                  requestLineId: flightRequestResponse?.serviceRequestLine?.requestLineId,
                  createdBy: this.authService.getUser(),
                  updatedBy: this.authService.getUser(),
                };
                flightRequestPax.push(paxPayload);
              }

              // const flightServiceRequestPax = await  this.dashboardRequestService.createServiceRequestPaxRelation(paxPayload).toPromise();
            }else{
              console.log('no  flight request pax');
            }
            const flightHeaderAndSegements = {
              serviceRequestLine: flightData[0]?.serviceRequestLine,
              serviceRequestSegment: flightData[0]?.serviceRequestSegment,
            };
            // flight sr summary
            if (flightHeaderAndSegements) {
              const flightSrSummary = this.flightSrSummaryDataConversion(flightHeaderAndSegements, flightRequestResponse);
              //console.log('flightResourcesAssignment',flightSrSummary);
              flightRequestSrSummary.push(flightSrSummary);
              //const flightServiceRequestSrSummary = await this.dashboardRequestService.saveSrSummary(flightSrSummary, SrSummaryData.SAVESRSUMMARYDATA).toPromise();
              //console.log("flight sub", subAllRequestsApis.length);
            }else{
              console.log("flight Sr Summary no data");
            }
            //flight resources
            if (flightHeaderAndSegements) {
              const flightResourceData = this.flightResourceDataConversion(flightHeaderAndSegements, flightRequestResponse);
              flightRequestResourcesAssignment.push(flightResourceData);
              //console.log('flightResourceData',flightResourceData);
              // const flightServiceRequestSrSummary = await this.dashboardRequestService.resourcesAssignment(flightResourceData, sr_assignment.flightassignment).toPromise();
              //console.log("flight sub", subAllRequestsApis.length);
            }else{
              console.log("flight Service Request Resources no data");
            }

            if(flightRequestPax?.length>0){
              for (let index = 0; index < flightRequestPax.length; index++) {
                const element = flightRequestPax[index];
                flightRequestSubApis.push(this.dashboardRequestService.createServiceRequestPaxRelation(element));
              }
            }
            if(flightRequestSrSummary?.length>0){
              for (let index = 0; index < flightRequestSrSummary.length; index++) {
                const element = flightRequestSrSummary[index];
                flightRequestSubApis.push(this.dashboardRequestService.saveSrSummary(element, apiUrls.SrSummaryData.SAVESRSUMMARYDATA));
              }
            }

            if(flightRequestResourcesAssignment?.length>0){
               for (let index = 0; index < flightRequestResourcesAssignment.length; index++) {
                const element = flightRequestResourcesAssignment[index];
                flightRequestSubApis.push(this.dashboardRequestService.resourcesAssignment(element, apiUrls.sr_assignment.flightassignment));
               }
            }


            if (flightRequestSubApis?.length > 0) {
              forkJoin(flightRequestSubApis).pipe(takeUntil(this.ngDestroy$)).subscribe((results) => {
                console.log('flight  sub  apis saved');
              });
            }
          }
        }catch(error){
          this.toastrService.error('Oops! Something went wrong  while send the flight request data please try again', 'Error');
        }
    }

    if (this.hotel_data?.length > 0) {
      //this.onCreateHotelServiceRequest(this.hotel_data);

      const hotelRequestData=this.hotel_data;
    let saveAddonsArray = [];
    let hotel_SrSummary: any[] = [];
    let hotel_ResourcesAssignmnet_Save: any[] = [];
    let hotelRequestSubApis=[];
    let hotelQueryParams: any[] = [];
    for (let hotel_index = 0; hotel_index < hotelRequestData?.length; hotel_index++) {
      const hotel_save_element = hotelRequestData[hotel_index];

      const hotel_info_data = {
        srLine: {
          lineLatitude: hotel_save_element.srLine.lineLatitude,
          lineLongitude: hotel_save_element.srLine.lineLongitude,
          lineRadius: hotel_save_element.srLine.lineRadius,
          lineSrId: hotel_save_element.srLine.lineSrId,
          lineCountry: hotel_save_element.srLine.lineCountry,
          lineCity: hotel_save_element.srLine.lineCity,
          lineLocation: hotel_save_element.srLine.lineLocation,
          lineHotelName:hotel_save_element.srLine.lineHotelName,
          linePropertyType: hotel_save_element.srLine.linePropertyType,
          lineMealType: hotel_save_element.srLine.lineMealType,
          lineCheckInDate: hotel_save_element.srLine.lineCheckInDate,
          lineCheckOutDate: hotel_save_element.srLine.lineCheckOutDate,
          lineNoOfNights: hotel_save_element.srLine.lineNoOfNights,
          lineRoomCount: hotel_save_element.srLine.lineRoomCount,
          lineCountryResidency: hotel_save_element.srLine.lineCountryResidency,
          lineNationality: hotel_save_element.srLine.lineNationality,
          lineRatings: hotel_save_element.srLine.lineRatings,
          lineMarkUpType: hotel_save_element.srLine.lineMarkUpType,
          lineMarkupAmount:hotel_save_element.srLine.lineMarkupAmount,
          lineMarkupPercentage: hotel_save_element.srLine.lineMarkupPercentage,
          lineAdultCount: hotel_save_element.srLine.lineAdultCount,
          lineChildCount: hotel_save_element.srLine.lineChildCount,
          lineInfantCount: hotel_save_element.srLine.lineInfantCount,
          lineTotalDays: hotel_save_element.srLine.lineTotalDays,
          lineSearchType: hotel_save_element.srLine.lineSearchType,
          lineAddonsRequired: hotel_save_element.srLine.lineAddonsRequired,
          lineApis:  hotel_save_element.srLine.lineApis,
          lineCreatedBy: this.authService.getUser(),
          lineCreatedDate: this.todaydateAndTimeStamp,
          lineCreatedDevice: this.deviceInfo?.userAgent,
          lineCreatedIp: null,
          lpoDate: hotel_save_element.srLine.lpoDate,
          lpoAmount: hotel_save_element.srLine.lpoAmount,
          lpoNumber: hotel_save_element.srLine.lpoNumber,
        },
        srRooms: hotel_save_element.srRooms,
        // srRoomAddons:room_Addons_array
      };
      try{
        const hotelRequestResponse = await this.dashboardRequestService.createHotelServiceRequest(hotel_info_data, apiUrls.request_hotel_url.createHotel).toPromise();

        hotelQueryParams.push(hotelRequestResponse?.srLine?.id);
         if(hotelRequestResponse){
          const hotelResouces = this.hotelResourcesAssignmentHotel(hotel_info_data, hotelRequestResponse);
          //const onSaveResourcesAssigment = await this.dashboardRequestService.resourcesAssignment(hotelResouces, sr_assignment.flightassignment).toPromise();
          const hotelSrSummary = this.hotelSrSummayHotelData(hotel_info_data, hotelRequestResponse);
          // const onSaveSrSummary= await  this.dashboardRequestService.saveSrSummary(hotelSrSummary, SrSummaryData.SAVESRSUMMARYDATA).toPromise();
          hotel_SrSummary.push(hotelSrSummary);
          hotel_ResourcesAssignmnet_Save.push(hotelResouces);
         }


        if (hotel_save_element?.srRoomAddons?.length > 0) {
          let hotelRoomQueryParams = [];
          if (hotelRequestResponse?.srRooms?.length > 0) {
            const hotelAddonsRooms= hotelRequestResponse?.srRooms;
            hotelRoomQueryParams = [];
            for (let index = 0; index < hotelAddonsRooms?.length; index++) {
              const element = hotelAddonsRooms[index];
              hotelRoomQueryParams.push(element?.id);
            }
          }
          for (let hotelAddonsIndex = 0; hotelAddonsIndex < hotel_save_element?.srRoomAddons?.length; hotelAddonsIndex++) {
            const hotelAddonsElement = hotel_save_element?.srRoomAddons[hotelAddonsIndex];
              const hotelAddonsobject = {
              addonSrId: Number(this.requestId),
              addonLineId: hotelRequestResponse?.srLine?.id,
              addonRoomId: hotelRoomQueryParams?.toString(),
              addonFor: hotelRoomQueryParams.length > 0 ? 'R' : 'P',
              addonTitle: hotelAddonsElement?.addonTitle,
              addonPassengerId: 0,
              addonPassengers: hotelAddonsElement?.addonPassengers,
              addonWithBooking: 0,
              addonCount: hotelAddonsElement?.addonCount,
              addonNights: hotelAddonsElement.addonNights,
              addonRemarks: hotelAddonsElement?.addonRemarks,
              addonRequired: 0,
              addonExtraCost: hotelAddonsElement?.addonExtraCost === true ? 1 : 0,
              addonStatus: 0,
              addonSubType: null,
              addonSubTypeId: 0,
              addonType: null,
              addonTypeId: 0,
              addonDescription: null,
              addonCreatedBy: this.authService.getUser(),
              addonCreatedDate: this.todaydateAndTimeStamp,
              addonCreatedDevice: this.deviceInfo?.userAgent,
              addonCreatedIp: null,
            };
             saveAddonsArray.push(hotelAddonsobject);
          }
        }
      }catch(error){
        this.toastrService.error('Oops! Something went wrong  while send the hotel request data please try again', 'Error');
      }
    }

    if (saveAddonsArray?.length > 0) {
      for (let index = 0; index < saveAddonsArray?.length; index++) {
        const element = saveAddonsArray[index];
        let saveHotelAddonsArray = [];
        saveHotelAddonsArray.push(element);
        hotelRequestSubApis.push(this.dashboardRequestService.createAddons(saveHotelAddonsArray, apiUrls.addons_url.createAddons));
        //const onSaveHotelAddons= await  this.dashboardRequestService.createAddons(saveHotelAddonsArray, addons_url.createAddons).toPromise();
      }
    }

    if (hotel_ResourcesAssignmnet_Save?.length > 0) {
      for (let resourxesindex = 0; resourxesindex < hotel_ResourcesAssignmnet_Save.length; resourxesindex++) {
          const resourceselement = hotel_ResourcesAssignmnet_Save[resourxesindex];
          hotelRequestSubApis.push(this.dashboardRequestService.resourcesAssignment(resourceselement, apiUrls.sr_assignment.flightassignment));
      }
    }

    if (hotel_SrSummary?.length > 0) {
      for (let srindex = 0; srindex < hotel_SrSummary.length; srindex++) {
          const srSummaryelement = hotel_SrSummary[srindex];
          hotelRequestSubApis.push( this.dashboardRequestService.saveSrSummary(srSummaryelement, apiUrls.SrSummaryData.SAVESRSUMMARYDATA));
      }
    }


    if (hotelRequestSubApis?.length > 0) {
      forkJoin(hotelRequestSubApis).pipe(takeUntil(this.ngDestroy$)).subscribe((results) => {
        console.log('hotel  sub  apis saved');
      });
    }

    }
    if (this.attractions_data?.length > 0) {
      //this.onCreateAttractionsServiceRequest(this.attractions_data);
      //const attractionRequest=this.attractions_data;
      //let attractionsLinesQueryParams=[];
     //const onSaveAttractions = await this.dashboardRequestService.createPackageItineraryAttractions(attractionRequest[0],Holiday_Package.attractionsServiceRequest).toPromise();

    /* if (onSaveAttractions?.attractionId) {
      this.appendQueryParamsApisResponse.attractionRequestLineId = onSaveAttractions?.attractionId;
      this.saveAttractionsSrSummayData(onSaveAttractions?.attractionId,0);
    } */

    /* if (onSaveAttractions?.lines?.length > 0) {
      for (let index = 0; index < onSaveAttractions?.lines?.length; index++) {
        const attractionsLineselement = onSaveAttractions?.lines[index];
        attractionsLinesQueryParams.push(attractionsLineselement?.attractionLineId);
        // attractionsLineselement.attractionLinePaxCount
        this.saveAttractionsSrSummayData(attractionsLineselement?.attractionLineId,attractionsLineselement.attractionLinePaxCount);
      }
    } */

    //this.appendQueryParamsApisResponse.attractionsLinesId = attractionsLinesQueryParams?.sort((a, b) => a - b);

     for (let index = 0; index < this.attractions_data.length; index++) {
      const element = this.attractions_data[index];

      try{
        const onSaveAttractions = await this.dashboardRequestService.createPackageItineraryAttractions(element,apiUrls.Holiday_Package.attractionsServiceRequest).toPromise();
        if(onSaveAttractions){
          this.saveAttractionsSrSummayData(onSaveAttractions?.attractionId,0);
        }
      }catch(error){
        this.toastrService.error('Oops! Something went wrong  while send the activitis request data please try again', 'Error');
      }

    }

    }
    if (this.anxRequestData?.length > 0) {
      // this.onCreateAnxServiceRequest(this.anxRequestData);
      const anxRequest=this.anxRequestData;
      let anxRequestPax=[];
      let anxRequestSubApis=[];
      let anxQueryParams=[];
      for (let anxindex = 0; anxindex < anxRequest?.length; anxindex++) {
        const anxelement = anxRequest[anxindex];

        try{
          const anxRequestResponse:any = await this.serviceTypeService.create(ANX_API.CREATE, anxelement.anx).toPromise();
          this.saveAnxSrSummayData(anxRequestResponse?.anxLineId,anxRequestResponse);
          const pax = this.anxPaxDataConversion(anxelement?.paxInfo);
          anxQueryParams.push(anxRequestResponse?.anxLineId);
          if (pax?.length > 0) {
            const paxPayload = {
              paxData: pax,
              requestId: Number(this.requestId),
              requestLineId: anxRequestResponse?.anxLineId,
              createdBy: this.authService.getUser(),
              updatedBy: this.authService.getUser(),
            };
            anxRequestPax.push(paxPayload);
            //const onSaveAnxRequestPax= await this.serviceTypeService.create(ANX_PAX_API.CREATEMODIFYREQUESTLINEPAX, paxPayload).toPromise();
          }
        }catch(error){
          this.toastrService.error('Oops! Something went wrong  while send the ancillary request data please try again', 'Error');
        }

      }

      if(anxRequestPax?.length>0){
        for (let index = 0; index < anxRequestPax.length; index++) {
          const element = anxRequestPax[index];
          anxRequestSubApis.push(this.serviceTypeService.create(ANX_PAX_API.CREATEMODIFYREQUESTLINEPAX, element));
        }
      }

      if (anxRequestSubApis?.length > 0) {
        forkJoin(anxRequestSubApis).pipe(takeUntil(this.ngDestroy$)).subscribe((results) => {
          console.log('anx  sub  apis saved');
        });
      }
    }

    this.toastrService.success('The service request has been sent successfuly !', 'Success');
    this.requestCreationLoading=false;
    this.appendingQueryParamstoCurrentRouter();

  }

  appendingQueryParamstoCurrentRouter() {
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((params) => {

    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';

     const products = {
        productsAvailability: 'true',
      };

      const data = {
        ...params,
        ...products
      };
      this.router.navigate(['/dashboard/booking/holidays'], {
        queryParams: data,
      });

    });
  }

  public showSpinner(): void {
    this.spinnerService.show();
    /* setTimeout(() => {
      this.spinnerService.hide();
    }, 5000); // 5 seconds */
  }

  navigatedToItineraryView(){
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((params) => {
      let activeQueryParams = params;
      const products = {
        actionType: 'rfq',
        from: 'package',
        productsAvailability: 'true',
      };
      const queryParams = {
        ...activeQueryParams,
        ...products,
      };

      const PACKAGEITINERARY_URL = this.router.createUrlTree(['/dashboard/booking/package-holidays-listview'], { queryParams }).toString();
      window.open(PACKAGEITINERARY_URL, '_blank');
      //this.router.navigate(['/dashboard/booking/package-holidays-listview'], { queryParams });
    });

  }

  navigatedToItineraryRFQ() {
    const contactId = this.route.snapshot.queryParams.contactId;
    const requestId = this.route.snapshot.queryParams.requestId;
    const holidaysLineId = this.route.snapshot.queryParams.holidaysLineId;

    if (requestId && holidaysLineId && contactId) {
      const queryParams = {
        requestId: requestId,
        contactId: contactId,
        holidaysLineId: holidaysLineId,
        from: 'package',
        actionType: 'rfq',
        productsAvailability: this.productsAvailability,
      };
      const PACKAGEITINERARY_URL = this.router
        .createUrlTree(['/dashboard/booking/package-itinerary'], { queryParams })
        .toString();
      window.open(PACKAGEITINERARY_URL, '_blank');
    }
  }


  trackByFn(index, item) {
    return index;
  }

  navigatedToPreviewPackagesList() {
    const contactId = this.route.snapshot.queryParams.contactId;
    const requestId = this.route.snapshot.queryParams.requestId;
    const holidaysLineId = this.route.snapshot.queryParams.holidaysLineId;

    if (requestId && holidaysLineId && contactId) {
      const queryParams = {
        requestId: requestId,
        contactId: contactId,
        holidaysLineId: holidaysLineId
      };
      //this.router.navigate(['/dashboard/booking/preview-package'], { queryParams });
      const PACKAGE_PREVIEW__URL = this.router
      .createUrlTree(['/dashboard/booking/preview-package'], { queryParams })
      .toString();
      window.open(PACKAGE_PREVIEW__URL, '_blank');
    }
  }


attractionsDaySelectShowTheError(flightIndex:number,attractionIndex:number){
  const attractionDayControl = this.flightAttractions(flightIndex).at(attractionIndex).get('attractionDay');
  const attractionNameControl = this.flightAttractions(flightIndex).at(attractionIndex).get('attractionName');
  if(attractionDayControl.value.length>0){
    attractionNameControl.setValidators([Validators.required]);
    this.flightAttractions(flightIndex).at(attractionIndex)?.get('attractionsRequiredPassenger')?.patchValue({
      pax: this.addonsPassengers[flightIndex],
    });
     this.cdr.markForCheck();
  }else{
    attractionNameControl.setValidators(null);
    attractionNameControl.patchValue([]);
    this.flightAttractions(flightIndex).at(attractionIndex)?.get('attractionsRequiredPassenger')?.patchValue({
      pax: [],
    });
    this.cdr.markForCheck();
  }
  attractionDayControl.updateValueAndValidity();
  attractionNameControl.updateValueAndValidity();

  this.cdr.markForCheck();
}


  getQueryParams(){
     // request id get the paramas
     this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param && param.requestId) {
        this.requestId = param.requestId;
      }
      if (param && param.holidaysLineId) {
        this.srLineId = param.holidaysLineId;
      }
      //params contact id
      if (param && param.contactId) {
        this.contactid = param.contactId;
      }
      if (this.requestId && this.srLineId) {
        const srId = Number(this.requestId);
        this.FindById(srId);
        this.getPackageDetailedInfo(srId);
      }
    });

  this.contactDetails=this.authService.getRequestDetails();




  }
  ngOnInit(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.keys = this.authService.getPageKeys();
    this.initializeForm();
    this.getRequestContactDetails();
    this.epicFunction();
    //this.addFlight();
    this.addDeal();
    this.getProduct();
    this.getMasterClass();
    this.getHotelRating();
    this.getMasterRbd();
    this.getMasterExtenbalePerameters();
    this.getMasterPaxType();
    this.loadRoomName();
    this.loadRoomType();
    this.getCurrencyList();
    this.getForexMOPList();
    this.getQueryParams();
    this.showProductDetailsInfo(0, true);




  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }



}
