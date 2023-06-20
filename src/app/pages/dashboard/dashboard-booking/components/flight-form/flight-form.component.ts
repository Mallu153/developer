import { DatePipe, formatDate } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
import { Observable, of, OperatorFunction, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError, takeUntil } from 'rxjs/operators';
import { SelectedPassengersService } from '../../share-data-services/selected-passenger.service';
import { AddPassengerFormComponent } from '../add-passenger-form/add-passenger-form.component';
import { SrSegmentHeader } from 'app/pages/dashboard/dashboard-request/model/service-segment';
import { ExplodeFlightDetalsComponent } from './explode-flight-detals/explode-flight-detals.component';
import { Title } from '@angular/platform-browser';
import { ApiResponse } from '../../../dashboard-request/model/api-response';
import * as apiUrls from '../../../dashboard-request/url-constants/url-constants';
import { FlightAddons } from 'app/shared/models/flightAddons-response';
import { RfqService } from 'app/pages/dashboard/rfq/rfq-services/rfq.service';
import { AuthService } from 'app/shared/auth/auth.service';
import { environment } from 'environments/environment';
import { ConfirmedValidator } from '../../../../../shared/directives/confirmed.validator';
import { SrSummaryData } from '../../../dashboard-request/url-constants/url-constants';
import { SrSummaryDataService } from '../../share-data-services/srsummarydata.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { TeamDataDataService } from '../../share-data-services/team-data.service';
import { PERMISSION_KEYS } from 'app/shared/data/app-premission-key';
import { PolicyQualifyProcessStage1Component } from '../policy-qualify-process-stage1/policy-qualify-process-stage1.component';
import { DashboardBookingAsyncService } from '../../services/dashboard-booking-async.service';

@Component({
  selector: 'app-flight-form',
  templateUrl: './flight-form.component.html',
  styleUrls: ['./flight-form.component.scss'] /* '../../../../../../assets/sass/libs/select.scss'*/,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NgbTimeAdapter, useClass: NgbTimeStringAdapter }],
  //encapsulation: ViewEncapsulation.None,
})
export class FlightFormComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  pageTitle = 'Flight Request';
  flightForm: FormGroup;
  tripTypeId = '1';
  typeOfFlight = 'Non Stop';
  submitted = false;
  // array purpose used
  isValidFormSubmitted = null;
  isEdit = false;
  isPriceShow = false;
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
  searchAirLineResult: Airline[];
  searchMulitipleResult: Airline[];
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
  //passengers list
  passengersList: Passengers[] = [];
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

  displayMonths: number = 2;
  navigation = 'arrow';
  price_token_data: any;
  checkinToday: NgbDate | null = null;

  private eventsSubscription: Subscription;
  //flight suggestions
  hideFlightSuggestions = [];
  flightSuggestionsData = [];

  /**
   *
   *
   * flight form elements premissions
   */
  keys = [];

  oneWay = PERMISSION_KEYS.BOOKING.FLIGHT.ONE_WAY;
  roundTrip = PERMISSION_KEYS.BOOKING.FLIGHT.ROUND_TRIP;
  multiCity = PERMISSION_KEYS.BOOKING.FLIGHT.MULTICITY;

  nonsop = PERMISSION_KEYS.BOOKING.FLIGHT.NONSTOP;
  direct = PERMISSION_KEYS.BOOKING.FLIGHT.DIRECT;
  connecting = PERMISSION_KEYS.BOOKING.FLIGHT.CONNECTING;
  flexStopsKey = PERMISSION_KEYS.BOOKING.FLIGHT.FLEXSTOPS;

  flexFromKey = PERMISSION_KEYS.BOOKING.FLIGHT.FLEX_FROM;
  flexToKey = PERMISSION_KEYS.BOOKING.FLIGHT.FLEX_TO;
  flexDepatureKey = PERMISSION_KEYS.BOOKING.FLIGHT.FLEX_DEPATURE;
  flexReturnKey = PERMISSION_KEYS.BOOKING.FLIGHT.FLEX_RETURN;
  flexClassKey = PERMISSION_KEYS.BOOKING.FLIGHT.FLEX_CLASS;
  moreBtnKey = PERMISSION_KEYS.BOOKING.FLIGHT.MORE_BTN;
  flexAirlineKey = PERMISSION_KEYS.BOOKING.FLIGHT.FLEX_AIRLINE;
  paxKey = PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_PAX;
  lpoKey = PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_LPO;
  addonskey = PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_ADDONS;

  /**
   *
   *
   *  flight buttons premissions
   */
  flightSaveBtn = PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_SAVE_BTN;
  flightCbtSaveBtn = PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_CBT_SAVE_BTN;
  flightUpdateBtn = PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_UPDATE_BTN;
  flightCbtUpdateBtn = PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_CBT_UPDATE_BTN;
  flightRFQBtn = PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_RFQ_BTN;
  flightSuggestionBtn = PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_SUGGESTION_BTN;
  flightFlexBtn = PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_FLEX_BTN;
  flightAutoBtn = PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_AUTO_BTN;
  flightManualBtn = PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_MANUAL_BTN;
  flightOfflineBtn = PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_OFFLINE_BTN;

  /**
   *
   *
   * product link  premissions
   */
  flightLink = PERMISSION_KEYS.BOOKING.FLIGHT.PRODUCT_LINK_FLIGHT;
  hotelLink = PERMISSION_KEYS.BOOKING.FLIGHT.PRODUCT_LINK_HOTEL;
  ancillaryLink = PERMISSION_KEYS.BOOKING.FLIGHT.PRODUCT_LINK_ANCILLARY;
  holidayLink = PERMISSION_KEYS.BOOKING.FLIGHT.PRODUCT_LINK_HOLIDAY;
  activityLink = PERMISSION_KEYS.BOOKING.FLIGHT.PRODUCT_LINK_ACTIVITY;

  policyList = [];

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
    private dashboardAsyncApiServices: DashboardBookingAsyncService
  ) {
    this.checkinToday = calendar.getToday();
    this.todayDate1 = this.datepipe.transform(this.todayDate, 'yyyy-MM-dd');
    this.todaydateAndTimeStamp = formatDate(this.todayDate, 'yyyy-MM-ddThh:mm:ss', 'en-US', '+0530');
    this.titleService.setTitle('Request Flight');
    //passengers list
    this.selectedPassengers();
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
  openPersonModal() {
    // AddPersonModalComponent
    const modalRef = this.modalService.open(AddPassengerFormComponent, { size: 'xl', windowClass: 'my-class' });
    modalRef.componentInstance.name = 'Add Person';
    modalRef.componentInstance.attractionsType = 'flight';
    modalRef.componentInstance.attractionsPaxCount = null;
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
              tap((response: Airline[]) => {
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
          : this.searchAirLineResult.filter(
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
              tap((response: Airline[]) => {
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

  initializeForm() {
    this.flightForm = this.fb.group({
      requestID: '',
      requestLineId: '',
      serviceRequestSegment: this.fb.array([this.newFlight()]),
      dealCode: this.fb.array([]),
      flexStops: new FormControl(),
      noofADT: [1, [Validators.required]],
      noofCHD: '0',
      noofINF: '0',
      tripTypeId: '1',
      typeOfFlight: '',
      connectingDetails: '',
      passengerTypeId: '',
      flightDirection: '',
      transitPointCode: [],
      excludePointCode: [],
      expandableParametersCode: '',
      createdBy: this.authService.getUser(),
      createdDate: this.todayDate1,
      addOns: this.fb.array([this.newFlightAddons()]),
      lineNo: '',
      lineStatusId: '',
      lineUuid: '',
      lPoDate: '',
      lpoAmount: '',
      lpoNumber: '',
    });
    this.setAutorized(this.flexStops);
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
        requestlineID: Number(this.srLineId?.toString()),
        //requestlineID: this.requestLineId,
        //requestID: this.requestId,
        requestSegmentId: this.requestSegmentId,

        fromAirportOrCityName: '',
        fromCountryName: '',
        toAirportOrCityName: '',
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
      },
      {
        validator: ConfirmedValidator('fromCode', 'toCode'),
      }
    );
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
      requiredRoute: this.fb.group({
        all: true,
        routes: [],
        //routes: this.fb.array([]),
      }),
      requiredPassenger: this.fb.group({
        all: true,
        passengers: [],
        //passengers: this.fb.array([]),
      }),
    });
  }

  flights(): FormArray {
    return this.flightForm.get('serviceRequestSegment') as FormArray;
  }

  deals(): FormArray {
    return this.flightForm.get('dealCode') as FormArray;
  }
  flightAddons(): FormArray {
    return this.flightForm.get('addOns') as FormArray;
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

  addFlight(mainIndex: number) {
    //this.flights().push(this.newFlight());
    if (this.flights().length < 6) {
      this.flights().push(this.newFlight());
    }
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
    this.flightTypeMultiCity(mainIndex);
  }
  removeFlight(i: number) {
    if (this.flights().controls.length > 1) {
      this.flights().removeAt(i);
      this.rowsControlsForMultiCity.pop(i);
      this.rowsControlsForDepature.pop(i);
      this.rowsControlsForreturn.pop(i);
      this.rowsControlsFlexForm.pop(i);
      this.rowsControlsFlexTo.pop(i);
      this.rowsControlsFlexClass.pop(i);
      this.rowsControlsFlexAirline.pop(i);
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

  addAddons() {
    this.flightAddons().push(this.newFlightAddons());
  }
  removeAddons(AddonsIndex: number) {
    if (this.flightAddons().controls.length > 1) {
      this.flightAddons().removeAt(AddonsIndex);
    }
  }

  removeEditAddons(AddonsIndex: number) {
    this.flightAddons().removeAt(AddonsIndex);
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

  /**
   * A method to deterimne whether to show the dynamic form for the flight inputs
   * @param event
   */
  onFlightTypeChange(event, actionType: string) {
    this.tripTypeId = event.value;
    let formArrayLength: number = this.flights().controls.length;
    const oneWayFormLength = 1;
    const twoWayFormLength = 1; //2
    if (this.tripTypeId === '69' && formArrayLength === 1) {
      //this.addFlight();
      // hide the return field
      this.initialRound = true;
      const today = new Date();
      // to return the date number(1-31) for the specified date
      let tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      //returns the tomorrow date
      const RETURN_DATE = this.calendar.getNext(this.flights()?.at(0)?.get('depatureDate').value, 'd', 1);
      if (actionType === 'change') {
        if (this.flightForm.value.tripTypeId == '69' && RETURN_DATE) {
          this.flights().at(0).patchValue({
            //returnDate: this.datepipe.transform(tomorrow, 'yyyy-MM-dd'),
            returnDate: RETURN_DATE,
          });
        }
      } else {
        this.flights().at(0).patchValue({
          returnDate: null,
        });
      }

      this.cdr.markForCheck();
    } else if (this.tripTypeId === '69' && formArrayLength >= 1) {
      // 2
      this.initialRound = true;
      while (twoWayFormLength <= formArrayLength) {
        this.removeFlight(formArrayLength);
        formArrayLength--;
        if (this.rowsControlsForMultiCity.length > 1) {
          this.rowsControlsForMultiCity.pop({ isCollapsed: false });
        } else {
          this.rowsControlsForMultiCity.push({
            isCollapsed: true,
          });
        }
        if (this.rowsControlsForDepature.length > 1) {
          this.rowsControlsForDepature.pop({ isCollapsedDepature: false });
        } else {
          this.rowsControlsForDepature.push({
            isCollapsedDepature: true,
          });
        }
        if (this.rowsControlsForreturn.length > 1) {
          this.rowsControlsForDepature.pop({ isCollapsedreturn: false });
        } else {
          this.rowsControlsForreturn.push({
            isCollapsedreturn: true,
          });
        }
        if (this.rowsControlsFlexForm.length > 1) {
          this.rowsControlsFlexForm.pop({ isCollapsedFlexFrom: false });
        } else {
          this.rowsControlsFlexForm.push({
            isCollapsedFlexFrom: true,
          });
        }
        if (this.rowsControlsFlexTo.length > 1) {
          this.rowsControlsFlexTo.pop({ isCollapsedFlexTo: false });
        } else {
          this.rowsControlsFlexTo.push({
            isCollapsedFlexTo: true,
          });
        }
        if (this.rowsControlsFlexClass.length > 1) {
          this.rowsControlsFlexClass.pop({ isCollapsedFlexClass: false });
        } else {
          this.rowsControlsFlexClass.push({
            isCollapsedFlexClass: true,
          });
        }
        if (this.rowsControlsFlexAirline.length > 1) {
          this.rowsControlsFlexAirline.pop({ isCollapsedFlexAirline: false });
        } else {
          this.rowsControlsFlexAirline.push({
            isCollapsedFlexAirline: true,
          });
        }
      }

      this.cdr.markForCheck();
    } else if (this.tripTypeId === '1' && formArrayLength >= 1) {
      this.initialRound = false;
      while (oneWayFormLength <= formArrayLength) {
        this.removeFlight(formArrayLength);
        formArrayLength--;
        if (this.rowsControlsForMultiCity.length > 1) {
          this.rowsControlsForMultiCity.pop({ isCollapsed: false });
        } else {
          this.rowsControlsForMultiCity.push({
            isCollapsed: true,
          });
        }
        if (this.rowsControlsForDepature.length < 1) {
          this.rowsControlsForDepature.pop({ isCollapsedDepature: true });
        } else {
          this.rowsControlsForDepature.push({
            isCollapsedDepature: true,
          });
        }
        if (this.rowsControlsForreturn.length > 1) {
          this.rowsControlsForDepature.pop({ isCollapsedreturn: true });
        } else {
          this.rowsControlsForreturn.push({
            isCollapsedreturn: true,
          });
        }
        if (this.rowsControlsFlexForm.length > 1) {
          this.rowsControlsFlexForm.pop({ isCollapsedFlexFrom: false });
        } else {
          this.rowsControlsFlexForm.push({
            isCollapsedFlexFrom: true,
          });
        }
        if (this.rowsControlsFlexTo.length > 1) {
          this.rowsControlsFlexTo.pop({ isCollapsedFlexTo: false });
        } else {
          this.rowsControlsFlexTo.push({
            isCollapsedFlexTo: true,
          });
        }
        if (this.rowsControlsFlexClass.length > 1) {
          this.rowsControlsFlexClass.pop({ isCollapsedFlexClass: false });
        } else {
          this.rowsControlsFlexClass.push({
            isCollapsedFlexClass: true,
          });
        }
        if (this.rowsControlsFlexAirline.length > 1) {
          this.rowsControlsFlexAirline.pop({ isCollapsedFlexAirline: false });
        } else {
          this.rowsControlsFlexAirline.push({
            isCollapsedFlexAirline: true,
          });
        }
        //reset return date
        this.resetField('returnDate');
        let mainArrayLength: number = this.flights().controls.length;
        for (let index = 0; index < mainArrayLength; index++) {
          this.Returndate(index).clear();
          if (mainArrayLength - 1 === index) {
            this.Returndate(0).push(this.newReturn());
          }
        }
      }
      this.cdr.markForCheck();
    }
    if (this.tripTypeId === '11') {
      this.initialRound = false;
    }
    //this.cdr.detectChanges();
  }

  //reset  fieldName
  resetField(fieldName) {
    this.flights().controls.forEach((group) => group.get(fieldName).reset());
  }
  // type of flight
  changeTypeOfFlight(e) {
    this.typeOfFlight = e.target.value;
  }

  /**
   * A method to send request for pax relation requires requestLineId from createServiceRequestLineSegment API
   * @param response { serviceRequestLine: { requestLineId: number }
   */
  submitServiceRequestPaxRelation(response: any) {
    const requestId = this.route.snapshot.queryParams.requestId;
    const paxPayload = {
      paxData: this.paxId,
      requestId,
      requestLineId: response.serviceRequestLine?.requestLineId,
      createdBy: this.authService.getUser(),
      updatedBy: this.authService.getUser(),
    };
    this.dashboardRequestService.createServiceRequestPaxRelation(paxPayload).pipe(takeUntil(this.ngDestroy$)).subscribe(
      (data) => {
        this.initialButtons = true;
        this.updatebutton = true;
        this.savebutton = false;
        const reqId = this.route.snapshot.queryParams.requestId;
        if (this.keys?.includes(this.flightCbtSaveBtn)) {
          this.flightoffers();
        }
        //this.getAllServiceRequestsLine(reqId);
        this.toastrService.success('The service request has been sent successfuly !', 'Success');

        for (let i = this.flights().value?.length; i > 0; i--) {
          this.removeUpdateFlight(i);
        }
        for (let i = this.passengersList.length; i > 0; i--) {
          this.delete(i);
        }
        this.router.navigate(['/dashboard/booking/flight'], {
          queryParams: {
            requestId: requestId,
            contactId: this.contactid,
            srLineId: response.serviceRequestLine?.requestLineId,
          },
        });

        // this.cdr.detectChanges();
      },
      (error) => this.toastrService.error('Oops! Something went wrong  while send the data please try again', 'Error')
    );
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

      element.requestID = Number(this.requestId);
      element.requestlineID = this.requestLineId;
      element.fromCode = element.fromCode?.code ? element.fromCode?.code : element.fromCode;
      // check values empty or not

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

      if (element.returnDate) {
        element.returnDate = element.returnDate
          ? `${element.returnDate.year || ''}-${this.padNumber(element.returnDate.month)}-${this.padNumber(
              element.returnDate.day
            )}`
          : '';
      } else {
        element.returnDate = null;
      }

      element.className = element.className;
      element.rbd = element.rbd;
      element.airlineCode = element.airlineCode?.shortCode2Digit;
      element.validateCarrier = element.validateCarrier;
      element.transitPointCode = this.selectedTransitPointItems;
      element.excludePointCode = this.selectedExludedPoints;
      (element.flexFromCode = this.selectedFlexFromItems[index]),
        (element.flexToCode = this.selectedFlexToItems[index]),
        (element.flexDepature = element.flexDepature),
        (element.flexReturn = element.flexReturn),
        (element.flexClassName = element.flexClassName),
        (element.flexAirLineCode = this.selectedFlexAirLineItems[index]),
        (element.budgetFrom = element.budgetFrom),
        (element.budgetTo = element.budgetTo);
      element.createdBy = this.authService.getUser();
      element.createdDate = this.todaydateAndTimeStamp;
      if (this.isEdit === true) {
        element.updatedBy = this.authService.getUser();
        element.updatedDate = this.todaydateAndTimeStamp;
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
  async onSubmitFlightForm() {
    this.submitted = true;
    this.isValidFormSubmitted = false;
    if (this.flights().value.length > 0) {
      for (let i = 0; i < this.flights().value.length; i++) {
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
      }
    }
    // stop here if form is invalid
    if (this.flightForm.invalid) {
      return this.toastrService.error('please fill the required fields', 'Error');
    }
    //here if tripTypeId is round we can check  depatureDate and returnDate
    if (this.flights().at(0)?.value.depatureDate && this.flights().at(0)?.value.returnDate) {
      const data: boolean = this.checkStartDateAndEndDate(
        this.flights().at(0)?.value.depatureDate,
        this.flights().at(0)?.value.returnDate
      );
      if (!data) {
        return;
      }
    }
    if (this.flightForm.valid) {
      //this.convertDateFormatToUTC();
      const flightsData = this.flightDataConversion();
      const dealsData = this.dealsDataConversion();

      let payload = {
        serviceRequestLine: {
          requestId: Number(this.requestId),
          tripTypeId: this.flightForm.get('tripTypeId').value,
          lPoDate: this.flightForm.get('lPoDate').value === '' ? null : this.flightForm.get('lPoDate').value,
          lpoAmount: this.flightForm.get('lpoAmount').value === '' ? 0.0 : this.flightForm.get('lpoAmount').value,
          lpoNumber: this.flightForm.get('lpoNumber').value === '' ? 0.0 : this.flightForm.get('lpoNumber').value,
          noofADT: this.flightForm.get('noofADT').value,
          noofCHD: this.flightForm.get('noofCHD').value === '' ? 0 : this.flightForm.get('noofCHD').value,
          noofINF: this.flightForm.get('noofINF').value === '' ? 0 : this.flightForm.get('noofINF').value,
          typeOfFlight: this.flightForm.get('typeOfFlight').value,
          connectingDetails: this.flightForm.get('connectingDetails').value,
          flexStops: this.flightForm.get('flexStops').value,
          passengerTypeId: this.flightForm.get('passengerTypeId').value,
          lineStatusId: this.flightForm.get('lineStatusId').value,
          createdBy: this.authService.getUser(),
          createdDate: this.todaydateAndTimeStamp,
          expandableParametersCode:
            this.flightForm.get('expandableParametersCode').value !== ''
              ? this.flightForm.get('expandableParametersCode').value
              : null,

          dealCode: dealsData,
          addons: null,
          //lineNo:this.UINICNUMBER
          //addons: this.flightAddons().value
        },
        serviceRequestSegment: flightsData,
      };

      try{
        const flightRequestLineResponse= await this.dashboardAsyncApiServices.createServiceRequestLineSegment(payload);
        if(flightRequestLineResponse?.serviceRequestLine?.requestLineId){
          this.submitted = false;
          this.isValidFormSubmitted = true;
          this.requestLineId = flightRequestLineResponse?.serviceRequestLine?.requestLineId;
          await this.saveSrSummayData();
          //this.serialLineId = data.serviceRequestLine?.lineNo;
          await this.resourcesAssignment(payload, this.requestLineId);
          await this.onSubmitPolicyQualifyProcessStage1(
            this.flightForm.get('tripTypeId').value,
            this.flights().at(0)?.value.depatureDate,
            flightsData
          );
          await this.submitServiceRequestPaxRelation(flightRequestLineResponse);

        }
      }catch(error){
        console.log(error);
        this.toastrService.error('Oops! Something went wrong  while send the data please try again', 'Error');
      }

    } else {
      this.toastrService.error('please fill the required fields', 'Error');
    }
  }

  flightAddonsDataConversation() {
    let convertArray: any = [];
    this.flightAddons().value.forEach((val) => convertArray.push(Object.assign({}, val)));
    convertArray.forEach((element) => {
      element.addOnType = element.addOnType;
      element.extraCost = element.extraCost;
      element.required = element.required;
      element.remarks = element.remarks;
      element.requiredRoute.all = element.requiredRoute?.routes?.length === this.addonsRoutes?.length ? true : false;
      element.requiredRoute.routes = element.requiredRoute?.routes;
      element.requiredPassenger.passengers = element.requiredPassenger?.passengers;
      element.requiredPassenger.all =
        element.requiredPassenger?.passengers?.length === this.addonsPassengers?.length ? true : false;
    });

    return convertArray;
  }
  /*******************************************
   * Update Flight Form and Pax relations
   */
 async onUpdateFlightForm() {
    if (this.flights().value.length > 0) {
      for (let i = 0; i < this.flights().value.length; i++) {
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
      }
    }

    if (this.flightForm.invalid) {
      return this.toastrService.error('please fill the required fields', 'Error');
    }
    //here if tripTypeId is round we can check  depatureDate and returnDate
    if (this.flights().at(0)?.value.depatureDate && this.flights().at(0)?.value.returnDate) {
      const data: boolean = this.checkStartDateAndEndDate(
        this.flights().at(0)?.value.depatureDate,
        this.flights().at(0)?.value.returnDate
      );
      if (!data) {
        return;
      }
    }
    if (this.flightForm.valid) {
      const flightsData = this.flightDataConversion();
      const dealsData = this.dealsDataConversion();
      const ADDONSDATA = this.flightAddonsDataConversation();
      let updatePayload = {
        serviceRequestLine: {
          requestId: this.requestId,
          requestLineId: Number(this.srLineId?.toString()),
          //requestLineId: this.requestLineId,
          tripTypeId: this.flightForm.get('tripTypeId').value,
          noofADT: this.flightForm.get('noofADT').value,
          noofCHD: this.flightForm.get('noofCHD').value === '' ? 0 : this.flightForm.get('noofCHD').value,
          noofINF: this.flightForm.get('noofINF').value === '' ? 0 : this.flightForm.get('noofINF').value,
          typeOfFlight: this.flightForm.get('typeOfFlight').value,
          connectingDetails: this.flightForm.get('connectingDetails').value,
          flexStops: this.flightForm.get('flexStops').value,
          passengerTypeId: this.flightForm.get('passengerTypeId').value,
          lineStatusId: this.flightForm.get('lineStatusId').value,
          updatedBy: this.authService.getUser(),
          updatedDate: this.todaydateAndTimeStamp,
          expandableParametersCode:
            this.flightForm.get('expandableParametersCode').value !== ''
              ? this.flightForm.get('expandableParametersCode').value
              : null,
          dealCode: dealsData,
          addons: ADDONSDATA,
          lineNo: this.flightForm.get('lineNo').value,
          lineUuid: this.flightForm.get('lineUuid').value,
          lPoDate: this.flightForm.get('lPoDate').value === '' ? null : this.flightForm.get('lPoDate').value,
          lpoAmount: this.flightForm.get('lpoAmount').value === '' ? 0.0 : this.flightForm.get('lpoAmount').value,
          lpoNumber: this.flightForm.get('lpoNumber').value === '' ? 0.0 : this.flightForm.get('lpoNumber').value,
        },
        serviceRequestSegment: flightsData,
      };
      try{
        const flightRequestLineResponse= await this.dashboardAsyncApiServices.updateServiceRequestLine(updatePayload);
        if (flightRequestLineResponse.serviceRequestLine?.requestLineId) {
          this.serviceRequestSegmentRespones = flightRequestLineResponse.serviceRequestSegment;
          this.serviceRequestLineRespones = flightRequestLineResponse.serviceRequestLine;
          await this.resourcesAssignment(updatePayload, flightRequestLineResponse.serviceRequestLine?.requestLineId);
          await this.updateServiceRequestPaxRelation();

        }
      }catch(error){
        console.log(error);
        this.toastrService.error('Oops! Something went wrong  while send the data please try again', 'Error');
      }

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
  updateServiceRequestPaxRelation() {
    const requestId = this.route.snapshot.queryParams.requestId;
    const requestLineId = this.route.snapshot.queryParams.srLineId;
    const updatePaxPayload = {
      paxData: this.PaxDataConversion(),
      requestId: Number(requestId),
      requestLineId: Number(requestLineId),
      createdBy: this.authService.getUser(),
      updatedBy: this.authService.getUser(),
    };
    this.dashboardRequestService.updateServiceRequestPaxRelation(updatePaxPayload).pipe(takeUntil(this.ngDestroy$)).subscribe(
      (data) => {
        this.initialButtons = true;
        if (this.serviceRequestSegmentRespones && this.serviceRequestLineRespones && data) {
          this.getAddonsRoutesData(data, this.serviceRequestSegmentRespones, this.serviceRequestLineRespones);
        }

        if (this.keys?.includes(this.flightCbtUpdateBtn)) {
          this.flightoffers();
        }
        this.toastrService.success(`${requestId} service request has been updated successfuly !`, 'Success');
        this.reloadComponent();
        for (let i = this.flights().value?.length; i > 0; i--) {
          this.removeUpdateFlight(i);
        }
        for (let i = this.flightAddons().value?.length; i > 0; i--) {
          this.removeEditAddons(i);
        }

        /* let updateValue=1;
        updateValue+=Number(this.route.snapshot.queryParams?.sources?.split('-')[1]);
          this.router.navigate([`/dashboard/booking/flight`], {
            queryParams: {
              requestId: this.requestId ,
              contactId: this.contactid,
              srLineId: requestLineId,
              sources:`request-${Number.isNaN(updateValue) ? 1:updateValue}`
            },
          }); */
        //this.FindById(requestLineId);
        //reload page
        //window.location.reload();
        // this.cdr.detectChanges();
      },
      (error) => this.toastrService.error('Oops! Something went wrong ', 'Error')
    );
  }
  reloadComponent() {
    const requestId = this.route.snapshot.queryParams.requestId;
    const requestLineId = this.route.snapshot.queryParams.srLineId;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([`/dashboard/booking/flight`], {
      queryParams: { requestId: requestId, contactId: this.contactid, srLineId: requestLineId },
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
      }
    }
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
  offline(segmentIndex: string = '') {
    let requestId = this.requestId;
    let reqLineId = this.requestLineId;

    const offlineUrl = `${environment.RFQREDIRECTOFFLINE}redirect?sr_no=${requestId}&sr_line_no=${reqLineId}&segment_index=${segmentIndex}&product=flight&channel=offline`;

    window.open(offlineUrl, '_blank');
  }
  Online(segmentIndex: string = '') {
    let requestId = this.requestId;
    let reqLineId = this.requestLineId;

    const onlineUrl = `${environment.RFQREDIRECTOFFLINE}redirect?sr_no=${requestId}&sr_line_no=${reqLineId}&segment_index=${segmentIndex}&product=flight&channel=online`;

    window.open(onlineUrl, '_blank');
  }

  MPTB() {
    let requestId = this.requestId;
    let reqLineId = this.requestLineId;
    const onlineUrl = `${environment.RFQREDIRECTOFFLINE}redirect?sr_no=${requestId}&sr_line_no=${reqLineId}&product=flight&channel=mptb`;
    //alert(onlineUrl);
    window.open(onlineUrl, '_blank');
  }

  flightoffers(segmentIndex: string = '') {
    let requestId = this.requestId;
    let reqLineId = this.requestLineId;

    if (this.keys?.includes(this.flightCbtSaveBtn || this.flightCbtUpdateBtn)) {
      const onlineUrl = `${environment.RFQREDIRECTOFFLINE}redirect?sr_no=${requestId}&sr_line_no=${reqLineId}&segment_index=${segmentIndex}&product=flight&channel=flight_offers`;
      window.open(onlineUrl, '_self');
    } else {
      const onlineUrl = `${environment.RFQREDIRECTOFFLINE}redirect?sr_no=${requestId}&sr_line_no=${reqLineId}&segment_index=${segmentIndex}&product=flight&channel=flight_offers`;
      //alert(onlineUrl);
      window.open(onlineUrl, '_blank');
    }
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

        addons: this.flightAddons().value === '' ? [] : this.flightAddons().value,
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
          if (data.rfqLine.rfqId) {
            const responseRFQID = data.rfqLine.rfqId;
            //const responserfqNo=data.rfqLine.rfqNo;

            if (responseRFQID) {
              const queryParams = {
                requestId: this.requestId,
                contactId: this.contactid,
                srLine: this.requestLineId,
                rfq_id: responseRFQID,
              };
              const FLIGHT_RFQ_URL = this.router.createUrlTree(['/dashboard/rfq/flight'], { queryParams }).toString();
              window.open(FLIGHT_RFQ_URL, '_blank');
            }
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
          for (let r = 0; r < res?.passengers?.length; r++) {
            this.passengersList.push(res?.passengers[r]);
            this.paxId.push({
              paxId: res?.passengers[r].paxId,
              prefix: res?.passengers[r].prefix,
              firstName: res?.passengers[r].firstName,
              lastName: res?.passengers[r].lastName,
              dob:
                res?.passengers[r].dob === '' || res?.passengers[r].dob === undefined ? null : res?.passengers[r].dob,
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
              paxType: res?.passengers[r].paxType?.id,
              passportExpiredDate: res?.passengers[r].passportExpiredDate,
              passportIssueDate: res?.passengers[r].passportIssueDate,
              requestLinePaxId: res?.passengers[r].requestLinePaxId,
              createdDate: this.todaydateAndTimeStamp,
            });
          }
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
  // remove list
  delete(index: number) {
    if (this.passengersList.length > 0) {
      this.passengersList.splice(index, 1);
      this.paxId = this.passengersList?.map((v) => v);
    }
  }
  /********************************************************************
   * find call service and respones patch the form
   ********************************************************************/
  FindById(srLineId, srId) {
    this.isEdit = true;
    this.dashboardRequestService
      .getSrRequestAndLineData(srLineId, srId)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (requestResponse: any) => {
          if (requestResponse) {
            this.updateDataservicerequestLine = requestResponse?.serviceRequestLine;
            this.updateDataSegmentData = requestResponse?.serviceRequestSegment;
            if (requestResponse?.paxServiceRequestLine.length > 0) {
              let personArray = [];
              for (let index = 0; index < requestResponse?.paxServiceRequestLine.length; index++) {
                const element = requestResponse?.paxServiceRequestLine[index];
                const PERSONDATA: any = {
                  createdBy: element.createdBy,
                  createdDate: element.createdDate,
                  dob: element.dob,
                  email: element.email,
                  firstName: element.firstName,
                  isContactSr: element.isContactSr,
                  issuedCountry: {
                    id: element.issuedCountry,
                    name: element.issuedCountryName,
                  },
                  lastName: element.lastName,
                  nationality: {
                    id: element.nationality,
                    name: element.nationalityName,
                  },
                  passport: element.passport,
                  passportExpiredDate: element.passportExpiredDate,
                  passportIssueDate: element.passportIssueDate,
                  paxId: element.paxId,
                  paxIsDeleted: element.paxIsDeleted,
                  paxType: {
                    id: element.paxType,
                    code: element.paxTypeCode,
                    name: element.paxTypeName,
                  },
                  phone: element.phone,
                  requestId: element.requestId,
                  requestLineId: element.requestLineId,
                  requestLinePaxId: element.requestLinePaxId,
                  statusId: element.statusId,
                  updatedBy: element.updatedBy,
                  updatedDate: element.updatedDate,
                };
                personArray.push(PERSONDATA);
              }
              const paxData = {
                passengers: personArray,
              };
              this.SelectedPassengersService.sendData(paxData);
            }

            //this.serialLineId  = requestResponse?.serviceRequestLine.lineNo;
          }
          if (requestResponse?.serviceRequestSegment) {
            this.assignmentStatusName = requestResponse?.srLineTeamInfo?.statusName;
            const defaultStatus = {
              statusId: requestResponse?.srLineTeamInfo?.statusId,
              name: requestResponse?.srLineTeamInfo?.statusName,
            };
            this.transitionsList.push(defaultStatus);
            //this.teamList = requestResponse?.srLineTeamInfo;
            if (requestResponse?.srLineTeamInfo) {
              this.teamList.push(requestResponse?.srLineTeamInfo.teamInfo);
              if (requestResponse?.srLineTeamInfo?.teamInfo?.teamMembers.length > 0) {
                this.teamMembersList = requestResponse?.srLineTeamInfo?.teamInfo?.teamMembers;
              }
              const TEAM_DATA = {
                defaultStatus: requestResponse?.srLineTeamInfo,
                team: this.teamList,
                members: this.teamMembersList,
                transitions: this.transitionsList,
              };
              this.teamDataService.sendData(TEAM_DATA);
            }
          }
          this.getAddonsRoutesData(
            requestResponse?.paxServiceRequestLine,
            this.updateDataSegmentData,
            this.updateDataservicerequestLine
          );
          if (this.updateDataservicerequestLine?.addons?.length > 0) {
            for (
              let addonsPacthindex = 0;
              addonsPacthindex < this.updateDataservicerequestLine?.addons?.length;
              addonsPacthindex++
            ) {
              if (addonsPacthindex > 0) {
                const fg = this.newFlightAddons();
                this.flightAddons().push(fg);
              }
              this.flightAddons()
                .at(addonsPacthindex)
                ?.patchValue({
                  addOnType: {
                    id: this.updateDataservicerequestLine?.addons[addonsPacthindex]?.addOnType?.id,
                    name: this.updateDataservicerequestLine?.addons[addonsPacthindex]?.addOnType?.name,
                  },
                  remarks: this.updateDataservicerequestLine?.addons[addonsPacthindex]?.remarks,
                  extraCost: this.updateDataservicerequestLine?.addons[addonsPacthindex]?.extraCost,
                  required: this.updateDataservicerequestLine?.addons[addonsPacthindex]?.required,
                });
              this.flightAddons().at(addonsPacthindex)?.get('requiredPassenger')?.patchValue({
                all: this.updateDataservicerequestLine?.addons[addonsPacthindex]?.requiredPassenger?.all,
                passengers: this.updateDataservicerequestLine?.addons[addonsPacthindex]?.requiredPassenger?.passengers,
                //passengers: this.updateDataservicerequestLine?.addons[addonsPacthindex]?.requiredPassenger?.passengers.map((item) => item)
              });

              this.flightAddons().at(addonsPacthindex)?.get('requiredRoute')?.patchValue({
                all: this.updateDataservicerequestLine?.addons[addonsPacthindex]?.requiredRoute?.all,
                routes: this.updateDataservicerequestLine?.addons[addonsPacthindex]?.requiredRoute?.routes,
              });

              /* if (
                this.updateDataservicerequestLine?.addons[addonsPacthindex]?.requiredRoute?.routes?.length ===
                this.addonsRoutes?.length
              ) {
                this.onSelectRoutesAll(addonsPacthindex);
              } else {
                this.flightAddons().at(addonsPacthindex)?.get('requiredRoute')?.patchValue({
                  routes: this.updateDataservicerequestLine?.addons[addonsPacthindex]?.requiredRoute?.routes,
                });
              }
              if (
                this.updateDataservicerequestLine?.addons[addonsPacthindex]?.requiredPassenger?.passengers?.length ===
                this.addonsPassengers?.length
              ) {
                this.onSelectPaxAll(addonsPacthindex);
              } else {
                this.flightAddons().at(addonsPacthindex)?.get('requiredPassenger')?.patchValue({
                  passengers:
                    this.updateDataservicerequestLine?.addons[addonsPacthindex]?.requiredPassenger?.passengers,
                });
              } */
            }
          } /* else {
            let addOnIndex = this.flightAddons()?.length - 1;
            this.onSelectRoutesAll(addOnIndex);
            this.onSelectPaxAll(addOnIndex);
          } */

          let typeId = {
            value: this.updateDataservicerequestLine?.tripTypeId?.toString(),
          };
          this.onFlightTypeChange(typeId, 'noChange');
          this.setAutorizedEdit(this.updateDataservicerequestLine?.flexStops);

          if (this.updateDataservicerequestLine) {
            this.flightForm.patchValue({
              requestLineId: this.updateDataservicerequestLine?.requestLineId,
              noofADT: this.updateDataservicerequestLine?.noofADT,
              noofCHD: this.updateDataservicerequestLine?.noofCHD,
              noofINF: this.updateDataservicerequestLine?.noofINF,
              tripTypeId: this.updateDataservicerequestLine?.tripTypeId?.toString(),
              typeOfFlight: this.updateDataservicerequestLine?.typeOfFlight,
              connectingDetails: this.updateDataservicerequestLine?.connectingDetails,
              passengerTypeId: this.updateDataservicerequestLine?.passengerTypeId,
              lineStatusId: requestResponse?.srLineTeamInfo?.statusId,
              //expandableParametersCode: this.updateDataservicerequestLine?.expandableParametersCode?.map(Number),
              flexStops: this.updateDataservicerequestLine?.flexStops,
              lineNo: this.updateDataservicerequestLine?.lineNo,
              lineUuid: this.updateDataservicerequestLine?.lineUuid,
              lPoDate: this.datepipe.transform(this.updateDataservicerequestLine?.lPoDate, 'yyyy-MM-dd'),
              lpoAmount:
                this.updateDataservicerequestLine?.lpoAmount === '0.00'
                  ? ''
                  : this.updateDataservicerequestLine?.lpoAmount,
              lpoNumber:
                this.updateDataservicerequestLine?.lpoNumber === '0'
                  ? ''
                  : this.updateDataservicerequestLine?.lpoNumber,
            });

            if (
              this.updateDataservicerequestLine?.expandableParametersCode &&
              this.updateDataservicerequestLine?.expandableParametersCode.length > 0
            ) {
              if (this.updateDataservicerequestLine?.expandableParametersCode?.length === 1) {
                if (this.updateDataservicerequestLine?.expandableParametersCode[0] !== '') {
                  this.flightForm.patchValue({
                    expandableParametersCode: this.updateDataservicerequestLine?.expandableParametersCode?.map(Number),
                  });
                }
              } else {
                this.flightForm.patchValue({
                  expandableParametersCode: this.updateDataservicerequestLine?.expandableParametersCode?.map(Number),
                });
              }
            }
            this.requestLineId = this.updateDataservicerequestLine?.requestLineId;
            // Deal array patch data
            for (let i = 0; i < this.updateDataservicerequestLine?.dealCode?.length; i++) {
              const dealairLine = {
                airLineType: null,
                code: null,
                createdBy: null,
                createdDate: null,
                id: null,
                name: null,
                parentAirline: null,
                shortCode2Digit: this.updateDataservicerequestLine?.dealCode[i]?.airlineCode,
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
                dealCode: this.updateDataservicerequestLine?.dealCode[i]?.dealCode,
                airlineCode: dealairLine,
              });
              //this.cdr.detectChanges();
            }
            //serviceRequestSegment patch data
            if (this.updateDataSegmentData?.length > 0) {
              for (let j = 0; j < this.updateDataSegmentData?.length; j++) {
                if (j > 0) {
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
                }
                //fromCode and toCode AirLineCode patch model
                const item = {
                  code: this.updateDataSegmentData[j]?.fromCode,
                  city: null,
                  cityCode: null,
                  country: this.updateDataSegmentData[j]?.fromCountryName,
                  countryCode: null,
                  createdBy: null,
                  createdDate: null,
                  id: null,
                  name: this.updateDataSegmentData[j]?.fromAirportOrCityName,
                  status: null,
                  timeZone: null,
                  type: null,
                  updatedBy: null,
                  updatedDate: null,
                };

                const toCodeObject = {
                  code: this.updateDataSegmentData[j]?.toCode,
                  city: null,
                  cityCode: null,
                  country: this.updateDataSegmentData[j]?.toCountryName,
                  countryCode: null,
                  createdBy: null,
                  createdDate: null,
                  id: null,
                  name: this.updateDataSegmentData[j]?.toAirportOrCityName,
                  status: null,
                  timeZone: null,
                  type: null,
                  updatedBy: 0,
                  updatedDate: null,
                };

                const airLine = {
                  airLineType: null,
                  code: null,
                  createdBy: null,
                  createdDate: null,
                  id: null,
                  name: null,
                  parentAirline: null,
                  shortCode2Digit: this.updateDataSegmentData[j]?.airlineCode,
                  shortCode3Digit: null,
                  status: null,
                  udatedBy: null,
                  updatedDate: null,
                };
                //const DEPATURE_DATE_OBJ=this.updateDataSegmentData[j]?.depatureDate?.split(['-']);
                // const RETURN_DATE_OBJ=this.updateDataSegmentData[j]?.returnDate?.split(['-']);

                this.flights()
                  .at(j)
                  .patchValue({
                    requestlineID: Number(this.srLineId?.toString()),
                    requestID: this.requestId,
                    requestSegmentId: this.updateDataSegmentData[j]?.requestSegmentId,
                    fromCode: item,
                    toCode: toCodeObject,
                    airlineCode: airLine,
                    fromAirportOrCityName: this.updateDataSegmentData[j]?.fromAirportOrCityName,
                    fromCountryName: this.updateDataSegmentData[j]?.fromCountryName,
                    toAirportOrCityName: this.updateDataSegmentData[j]?.toAirportOrCityName,
                    toCountryName: this.updateDataSegmentData[j]?.toCountryName,
                    //flexClassName: this.updateDataSegmentData[j]?.flexClassName,
                    rbd: this.updateDataSegmentData[j]?.rbd,
                    validateCarrier: this.updateDataSegmentData[j]?.validateCarrier,
                    budgetFrom: this.updateDataSegmentData[j]?.budgetFrom,
                    budgetTo: this.updateDataSegmentData[j]?.budgetTo,
                    className: this.updateDataSegmentData[j]?.className,
                    depatureDate: {
                      year: Number(this.updateDataSegmentData[j]?.depatureDate?.split(['-'])[0]),
                      month: Number(this.updateDataSegmentData[j]?.depatureDate?.split(['-'])[1]),
                      day: Number(this.updateDataSegmentData[j]?.depatureDate?.split(['-'])[2]?.substring(0, 2)),
                    },
                    /*  returnDate: {
                      year: Number(this.updateDataSegmentData[j]?.returnDate?.split(['-'])[0]),
                      month: Number(this.updateDataSegmentData[j]?.returnDate?.split(['-'])[1]),
                      day: Number(this.updateDataSegmentData[j]?.returnDate?.split(['-'])[2]?.substring(0, 2)),
                    }, */

                    //depatureDate: this.datepipe.transform(this.updateDataSegmentData[j]?.depatureDate, 'yyyy-MM-dd'),
                    //returnDate: this.datepipe.transform(this.updateDataSegmentData[j]?.returnDate, 'yyyy-MM-dd'),
                    transitPointCode: this.updateDataSegmentData[j]?.transitPointCode,
                    excludePointCode: this.updateDataSegmentData[j]?.excludePointCode,
                  });
                if (this.updateDataSegmentData[j]?.returnDate) {
                  this.flights()
                    .at(j)
                    .patchValue({
                      returnDate: {
                        year: Number(this.updateDataSegmentData[j]?.returnDate?.split(['-'])[0]),
                        month: Number(this.updateDataSegmentData[j]?.returnDate?.split(['-'])[1]),
                        day: Number(this.updateDataSegmentData[j]?.returnDate?.split(['-'])[2]?.substring(0, 2)),
                      },
                    });
                } else {
                  this.flights().at(j).patchValue({
                    returnDate: null,
                  });
                }
                if (requestResponse?.srLineTeamInfo?.teamInfo?.teamMembers?.length > 0) {
                  for (
                    let teamLeaderindex = 0;
                    teamLeaderindex < requestResponse?.srLineTeamInfo?.teamInfo?.teamMembers.length;
                    teamLeaderindex++
                  ) {
                    //const element = requestResponse?.srLineTeamInfo?.teamInfo?.teamMembers[teamLeaderindex];
                    if (requestResponse?.srLineTeamInfo?.teamInfo?.teamMembers[teamLeaderindex].teamLeader === 1) {
                      this.flights().at(j).patchValue({
                        teamLeader: requestResponse?.srLineTeamInfo?.teamInfo?.teamMembers[teamLeaderindex]?.memberId,
                      });
                    }
                  }
                }

                //transitPointCode patch
                if (
                  j === 0 &&
                  this.updateDataSegmentData[0]?.transitPointCode &&
                  this.updateDataSegmentData[0]?.transitPointCode?.length > 0
                ) {
                  for (let k = 0; k < this.updateDataSegmentData[0]?.transitPointCode?.length; k++) {
                    if (this.updateDataSegmentData[0]?.transitPointCode[k] === '') {
                      continue;
                    }
                    this.selectedTransitPointItems.push(this.updateDataSegmentData[0]?.transitPointCode[k]);
                  }
                }
                //excludePointCode patch
                if (
                  j === 0 &&
                  this.updateDataSegmentData[0]?.excludePointCode &&
                  this.updateDataSegmentData[0]?.excludePointCode?.length > 0
                ) {
                  for (let e = 0; e < this.updateDataSegmentData[0]?.excludePointCode?.length; e++) {
                    if (this.updateDataSegmentData[0]?.excludePointCode[e] === '') {
                      continue;
                    }
                    this.selectedExludedPoints.push(this.updateDataSegmentData[0]?.excludePointCode[e]);
                  }
                }

                //flexFromCode patching
                if (
                  this.updateDataSegmentData[j]?.flexFromCode &&
                  this.updateDataSegmentData[j]?.flexFromCode?.length > 0
                ) {
                  if (this.updateDataSegmentData[j]?.flexFromCode?.length === 1) {
                    if (this.updateDataSegmentData[j]?.flexFromCode[0] !== '') {
                      this.selectedFlexFromItems.push(this.updateDataSegmentData[j]?.flexFromCode);
                    }
                  } else {
                    this.selectedFlexFromItems.push(this.updateDataSegmentData[j]?.flexFromCode);
                  }
                }
                // flextoCode patching
                if (
                  this.updateDataSegmentData[j]?.flexToCode &&
                  this.updateDataSegmentData[j]?.flexToCode?.length > 0
                ) {
                  if (this.updateDataSegmentData[j]?.flexToCode?.length === 1) {
                    if (this.updateDataSegmentData[j]?.flexToCode[0] !== '') {
                      this.selectedFlexToItems.push(this.updateDataSegmentData[j]?.flexToCode);
                    }
                  } else {
                    this.selectedFlexToItems.push(this.updateDataSegmentData[j]?.flexToCode);
                  }
                }
                // flexAirLineCode patching
                if (
                  this.updateDataSegmentData[j]?.flexAirLineCode &&
                  this.updateDataSegmentData[j]?.flexAirLineCode?.length > 0
                ) {
                  if (this.updateDataSegmentData[j]?.flexAirLineCode?.length === 1) {
                    if (this.updateDataSegmentData[j]?.flexAirLineCode[0] !== '') {
                      this.selectedFlexAirLineItems.push(this.updateDataSegmentData[j]?.flexAirLineCode);
                    }
                  } else {
                    this.selectedFlexAirLineItems.push(this.updateDataSegmentData[j]?.flexAirLineCode);
                  }
                }
                // flexClassName patching
                if (
                  this.updateDataSegmentData[j]?.flexClassName &&
                  this.updateDataSegmentData[j]?.flexClassName?.length > 0
                ) {
                  if (this.updateDataSegmentData[j]?.flexClassName?.length === 1) {
                    if (this.updateDataSegmentData[j]?.flexClassName[0] !== '') {
                      this.flights().at(j).patchValue({
                        flexClassName: this.updateDataSegmentData[j]?.flexClassName,
                      });
                    }
                  } else {
                    this.flights().at(j).patchValue({
                      flexClassName: this.updateDataSegmentData[j]?.flexClassName,
                    });
                  }
                }

                this.requestSegmentId = this.updateDataSegmentData[j]?.requestSegmentId;
                for (let d = 0; d < this.updateDataSegmentData[j]?.flexDepature?.length; d++) {
                  if (d > 0) {
                    const fg = this.newDepature();
                    this.depature(j).push(fg);
                  }
                  this.depature(j)
                    .at(d)
                    .patchValue({
                      flexDepatureDate: this.datepipe.transform(
                        this.updateDataSegmentData[j]?.flexDepature[d]?.flexDepatureDate,
                        'yyyy-MM-dd'
                      ),
                      flexDepatureTime: this.updateDataSegmentData[j]?.flexDepature[d]?.flexDepatureTime,
                    });
                }
                for (let r = 0; r < this.updateDataSegmentData[j]?.flexReturn?.length; r++) {
                  if (r > 0) {
                    const fg = this.newReturn();
                    this.Returndate(j).push(fg);
                  }
                  this.Returndate(j)
                    .at(r)
                    .patchValue({
                      flexReturnDate: this.datepipe.transform(
                        this.updateDataSegmentData[j]?.flexReturn[r]?.flexReturnDate,
                        'yyyy-MM-dd'
                      ),
                      flexReturnTime: this.updateDataSegmentData[j]?.flexReturn[r]?.flexReturnTime,
                    });
                }
              }
            }
            this.onSubmitPolicyQualifyProcessStage1(
              this.flightForm.get('tripTypeId').value,
              this.flights().at(0)?.value.depatureDate,
              this.updateDataSegmentData
            );
            //this.isEdit = true;
            /*   this.cdr.detectChanges(); */
            // this.cdr.detectChanges();
          } else {
            this.router.navigate(['/dashboard/request/all-service-requests']);
          }
        },
        (error) => {
          this.toastrService.error('Oops! Something went wrong while fetching the data ', 'Error');
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

  resetFormData() {
    this.isEdit = false;
    this.submitted = false;
    this.isValidFormSubmitted = true;
    this.flightForm.reset();
    this.flightForm.controls.tripTypeId.setValue('1');
    this.flightForm.controls.noofADT.setValue('1');
    this.flightForm.controls.typeOfFlight.setValue('Non Stop');
    this.flights().at(0).get('className').setValue('Y');
    //added passengers clear
    for (let i = this.passengersList?.length - 1; i >= 0; i--) {
      this.delete(i);
    }
    const controlnewFlight = <FormArray>this.flightForm.controls['serviceRequestSegment'];
    for (let i = controlnewFlight.length - 1; i >= 0; i--) {
      if (controlnewFlight.length > 1) {
        controlnewFlight.removeAt(i);
      }
    }
    /*  this.UINICNUMBER= this.serialLineId +1;
    //console.log(this.UINICNUMBER);
    this.router.navigate(['/dashboard/booking/flight'], {
      queryParams: { requestId: this.requestId, contactId: this.contactid, unic_id:this.UINICNUMBER },
    }); */
    this.deleteQueryParameterFromCurrentRoute();
    //onces save data it's move update
    /* this.router.navigate(['/dashboard/booking/flight'], {
      queryParams: { requestId: this.requestId, contactId: this.contactid },
    }); */
    //this.UINICNUMBER+= 1;
    //console.log(this.UINICNUMBER);
  }
  deleteQueryParameterFromCurrentRoute() {
    const params = { ...this.route.snapshot.queryParams };
    delete params.srLineId;
    this.router.navigate([], { queryParams: params });
    //this.cdr.detectChanges();
    /*  this.router.navigate(['/dashboard/booking/flight'], {
       queryParams: { requestId: this.requestId, contactId: this.contactid },
     }); */
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
  onSearchFlightAddons: OperatorFunction<string, readonly { name; id }[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap((term: string) => (this.searchFlightAddonsTerm = term)),
      switchMap((term) =>
        term.length >= 1
          ? this.masterDataService.flightAddonsData(term).pipe(
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

  getAddonsRoutesData(passengersData, routesData, lineData) {
    let linePersonCount = [];
    if (lineData.noofINF > 0) {
      for (let lineINFIndex = 1; lineINFIndex <= lineData?.noofINF; lineINFIndex++) {
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
    if (lineData.noofADT > 0) {
      for (let lineAdultIndex = 1; lineAdultIndex <= lineData?.noofADT; lineAdultIndex++) {
        let adultData = {
          paxNo: lineAdultIndex,
          selectedAllGroup: 'Select All',
          paxType: 'ADT' + '-' + lineAdultIndex,
          bindLablePaxType: 'ADT' + '-' + lineAdultIndex,
          paxRefence: 0,
        };
        linePersonCount.push(adultData);
      }
    }
    if (lineData.noofCHD > 0) {
      for (let lineChildIndex = 1; lineChildIndex <= lineData?.noofCHD; lineChildIndex++) {
        let childData = {
          paxNo: lineChildIndex,
          selectedAllGroup: 'Select All',
          paxType: 'CHD' + '-' + lineChildIndex,
          bindLablePaxType: 'CHD' + '-' + lineChildIndex,
          paxRefence: 0,
        };
        linePersonCount.push(childData);
      }
    }
    let passengerData = [...passengersData];
    passengerData = JSON.parse(JSON.stringify(passengerData));
    let adultIndex = 1;
    let childIndex = 1;
    let infIndex = 1;
    for (let passengerIndex = 0; passengerIndex < passengerData?.length; passengerIndex++) {
      if (passengerData[passengerIndex].paxTypeCode === 'ADT') {
        passengerData[passengerIndex].paxTypeRefName = passengerData[passengerIndex].paxTypeCode + '-' + adultIndex;
        adultIndex = adultIndex + 1;
      }
      if (passengerData[passengerIndex].paxTypeCode === 'CHD') {
        passengerData[passengerIndex].paxTypeRefName = passengerData[passengerIndex].paxTypeCode + '-' + childIndex;
        childIndex = childIndex + 1;
      }
      if (passengerData[passengerIndex].paxTypeCode === 'INF') {
        passengerData[passengerIndex].paxTypeRefName = passengerData[passengerIndex].paxTypeCode + '-' + infIndex;
        infIndex = infIndex + 1;
      }
    }
    //console.log(passengerData);
    for (let index = 0; index < linePersonCount.length; index++) {
      linePersonCount[index].paxNo = index + 1;
      for (let passengerIndex = 0; passengerIndex < passengerData?.length; passengerIndex++) {
        if (passengerData[passengerIndex].paxTypeRefName === linePersonCount[index].paxType) {
          //linePersonCount[index].paxType = passengerData[passengerIndex].paxTypeRefName + '-' + passengersData[passengerIndex]?.firstName;
          linePersonCount[index].paxType =
            passengerData[passengerIndex].paxTypeRefName + '-' + passengerData[passengerIndex]?.firstName;
          linePersonCount[index].paxRefence = passengerData[passengerIndex]?.paxId;

          this.cdr.markForCheck();
        } /*  else {
          let passengers = {
            paxNo: index + 1,
            paxType: passengerData[passengerIndex].paxTypeRefName,
            paxRefence: 0,
          };
          passengersArray.push(passengers);
        } */
      }
    }

    this.addonsPassengers = linePersonCount;

    let routes = [];

    for (let routeIndex = 0; routeIndex < routesData?.length; routeIndex++) {
      let data = {
        routeNo: routeIndex + 1,
        selectedAllGroup: 'Select All',
        route: routesData[routeIndex]?.fromCode + ' - ' + routesData[routeIndex]?.toCode,
        bindLableRoute: routesData[routeIndex]?.fromCode + ' - ' + routesData[routeIndex]?.toCode,
      };
      routes.push(data);
      if (lineData.tripTypeId === 69) {
        let roundTripData = {
          routeNo: routeIndex + 1,
          selectedAllGroup: 'Select All',
          route: routesData[routeIndex]?.toCode + ' - ' + routesData[routeIndex]?.fromCode,
          bindLableRoute: routesData[routeIndex]?.toCode + ' - ' + routesData[routeIndex]?.fromCode,
        };
        routes.push(roundTripData);
      }
    }
    this.addonsRoutes = routes;
    // this.cdr.detectChanges();
  }
  public onSelectRoutesAll(i) {
    if (this.addonsRoutes) {
      const selectAll = this.addonsRoutes?.map((item) => item);
      const checkAllRoutesSelected = selectAll?.length === this.addonsRoutes?.length ? 'true' : 'false';
      if (selectAll && selectAll?.length > 0) {
        this.flightAddons().at(i)?.get('requiredRoute').get('routes')?.patchValue(selectAll);
        this.flightAddons().at(i)?.get('requiredRoute').get('all')?.patchValue(true);
      } /* else {
        this.flightAddons().at(i)?.get('requiredRoute').get('all')?.patchValue(false);
      } */
    }
  }
  public onClearRoutesAll(i) {
    this.flightAddons().at(i)?.get('requiredRoute').get('routes')?.patchValue([]);
    this.flightAddons().at(i)?.get('requiredRoute').get('all')?.patchValue(true);
  }

  public onSelectPaxAll(i) {
    if (this.addonsPassengers) {
      const onselectPaxAll = this.addonsPassengers?.map((item) => item);
      const checkAllRoutesSelected = onselectPaxAll?.length === this.addonsPassengers?.length ? 'true' : onselectPaxAll;
      if (onselectPaxAll && onselectPaxAll?.length > 0) {
        this.flightAddons().at(i)?.get('requiredPassenger').get('passengers')?.patchValue(onselectPaxAll);
        this.flightAddons().at(i)?.get('requiredPassenger').get('all')?.patchValue(true);
      } /*  else {
        this.flightAddons().at(i)?.get('requiredPassenger').get('all')?.patchValue(false);
      } */
    }
  }
  public onClearPaxAll(i) {
    this.flightAddons().at(i)?.get('requiredPassenger').get('passengers')?.patchValue([]);
    this.flightAddons().at(i)?.get('requiredPassenger').get('all')?.patchValue(true);
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
          //this.productList = data;
          // this.cdr.detectChanges();
          const productName = 'Flight';
          this.productList = data?.find((con) => con.name === productName);
          //this.cdr.detectChanges();
        } else {
          this.toastrService.error(
            'Oops! Something went wrong while fetching the Product type data please try again ',
            'Error'
          );
        }
      });
  }

async   resourcesAssignment(formData, requestLineId) {
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
    const total: number =
      Number(this.flightForm.get('noofADT').value) +
      Number(this.flightForm.get('noofCHD').value) +
      Number(this.flightForm.get('noofINF').value);
    const customerDetailsBySrId = this.authService.getCustomerType();
    const sendData = {
      productId: this.productList?.id,
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

      try {
        const response:any = await this.dashboardAsyncApiServices.resourcesAssignment(
          sendData, apiUrls.sr_assignment.flightassignment
        );
        const result = response;
          if (result.status == 200) {
           console.log('sucess flight resource assignments');

          } else {
            if (result.message == '') {
              this.toastrService.error('opps someting went wrong please try agagin policy request', 'Error', {
                progressBar: true,
              });
              this.cdr.markForCheck();
            } else {
              this.toastrService.error(result.message, 'Error', { progressBar: true });
              this.cdr.markForCheck();
            }
          }
      } catch (error) {
        console.log(error);
        this.toastrService.error('opps someting went wrong please try agagin policy request', 'Error', {
          progressBar: true,
        });
      }
  }



  inActivePaxDataConversion(index) {
    let convertPaxArray: any = [];
    let sendPaxArray: any[] = [];
    //this.passengerList
    this.paxId?.forEach((val) => convertPaxArray.push(Object.assign({}, val)));
    convertPaxArray.forEach((element, paxIndex) => {
      if (paxIndex === index) {
        element.paxId = element.paxId;
        element.requestLinePaxId = element.requestLinePaxId;
        element.statusId = 1;
        element.paxIsDeleted = true;
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
      }
    });
    return [convertPaxArray[index]];
  }
  inActivePassengers(index: number, requestLinePaxId) {
    //this.delete(index);
    if (this.passengersList.length > 0 && requestLinePaxId) {
      const requestId = this.route.snapshot.queryParams.requestId;
      const requestLineId = this.route.snapshot.queryParams.srLineId;
      const updatePaxPayload = {
        paxData: this.inActivePaxDataConversion(index),
        requestId: Number(requestId),
        requestLineId: Number(requestLineId),
        createdBy: this.authService.getUser(),
        updatedBy: this.authService.getUser(),
      };
      this.dashboardRequestService
        .updateServiceRequestPaxRelation(updatePaxPayload)
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe(
          (data) => {
            this.passengersList.splice(index, 1);
            this.paxId = this.passengersList?.map((v) => v);
            this.toastrService.success(`${requestId} passenger has been removed successfuly !`, 'Success', {
              progressBar: true,
            });
            this.reloadComponent();
            for (let i = this.flights().value?.length; i > 0; i--) {
              this.removeUpdateFlight(i);
            }
            for (let i = this.flightAddons().value?.length; i > 0; i--) {
              this.removeEditAddons(i);
            }

            if (this.serviceRequestSegmentRespones && this.serviceRequestLineRespones && data) {
              this.getAddonsRoutesData(data, this.serviceRequestSegmentRespones, this.serviceRequestLineRespones);
              this.cdr.markForCheck();
            }
          },
          (error) => this.toastrService.error('Oops! Something went wrong please try again', 'Error')
        );
    } else {
      this.passengersList.splice(index, 1);
      this.paxId = this.passengersList?.map((v) => v);
    }
  }

  getRequestContactDetails() {
    //const requestLineId = this.route.snapshot.queryParams.srLineId;
    this.eventsSubscription = this.srSummaryData.getData().pipe(takeUntil(this.ngDestroy$)).subscribe((res) => {
      this.contactDetails = res;
      this.cdr.markForCheck();
    });
  }
  async saveSrSummayData() {
    if (this.contactDetails && this.requestLineId) {
      const total: number =
        Number(this.flightForm.get('noofADT').value) +
        Number(this.flightForm.get('noofCHD').value) +
        Number(this.flightForm.get('noofINF').value);
      const SUMMARYDATA = {
        contactEmail: this.contactDetails?.contact?.primaryEmail,
        contactId: this.contactDetails?.contact?.id,
        contactName: this.contactDetails?.contact?.firstName + ' ' + this.contactDetails?.contact?.lastName,
        contactPhone: this.contactDetails?.contact?.primaryPhoneNumber,
        deviceInfo: this.deviceInfo?.userAgent,
        loggedInUserId: this.authService.getUser(),
        passengerCount: Number(total),
        productId: this.productList?.id,
        serviceRequestId: this.contactDetails?.requestId,
        serviceRequestLineId: this.requestLineId,
        //travelDateOrCheckInDate: this.flights().at(0)?.value.depatureDate
        travelDateOrCheckInDate: this.flights().at(0)?.value.depatureDate
          ? `${this.flights().at(0)?.value.depatureDate.year || ''}-${this.padNumber(
              this.flights().at(0)?.value.depatureDate.month
            )}-${this.padNumber(this.flights().at(0)?.value.depatureDate.day)}`
          : '',
      };

      try {
        await this.dashboardAsyncApiServices.saveSrSummary(SUMMARYDATA, SrSummaryData.SAVESRSUMMARYDATA);
      } catch (error) {
        console.log(error);
        this.toastrService.error('Oops! Something went wrong  while send the data please try again', 'Error', {
          progressBar: true,
        });
      }
    }
  }

  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  openSm(content) {
    this.modalService.open(content, { size: 'lg' });
  }
  openScrollableContent(longContent) {
    this.modalService.open(longContent, { size: 'xl' });
  }

  flightTypeMultiCity(mainIndex: number) {
    const MODIFY_INDEX = mainIndex + 1;
    const toControl = this.flights().at(mainIndex).get('toCode')?.value;

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

  onChangeCheckFlightTypeDepature(mainIndex: number) {
    const depatureDateControl = this.flights().at(mainIndex).get('depatureDate')?.value;
    if (depatureDateControl && this.flightForm.value.tripTypeId === '69') {
      const RETURN_DATE = this.calendar.getNext(this.flights()?.at(0)?.get('depatureDate').value, 'd', 1);
      this.flights().at(0).patchValue({ returnDate: RETURN_DATE });
    }
  }

  showflightSuggestionsInfo(index) {
    this.hideFlightSuggestions[index] = !this.hideFlightSuggestions[index];

    if (this.hideFlightSuggestions[index] === true) {
      this.flightSuggestions(this.requestId, this.srLineId);
    } else {
      this.flightSuggestionsData = [];
    }
  }

  flightSuggestions(srNo: number, srLineNo: number) {
    this.dashboardRequestService
      .flightSuggestions(srNo, srLineNo, apiUrls.flightSuggestions.getflightSuggestions)
      .pipe(takeUntil(this.ngDestroy$)).subscribe((res: ApiResponse) => {
        const result = res;

        if (result.statusCode === true) {
          if (result.data[0].length === 0) {
            this.toastrService.info('no data found in the system', 'INFO');
            this.cdr.markForCheck();
          } else {
            this.flightSuggestionsData = result.data[0];
            this.cdr.markForCheck();
          }
        } else {
          this.toastrService.error(result.message, 'Error');
          this.flightSuggestionsData = [];
          this.cdr.markForCheck();
        }
      });
  }

  getTriptype(type: string) {
    if (type === '1') {
      return 1;
    } else if (type === '69') {
      return 2;
    } else if (type === '11') {
      return 3;
    } else {
      return 1;
    }
  }

  async onSubmitPolicyQualifyProcessStage1(tripType: any, depatureDate: any, flightData: any[]) {
    const CABIN_CLASS_ID = this.masterClassList?.find((con) => con.code === flightData[0]?.className);
    /* if (CABIN_CLASS_ID && flightData?.length > 0) {

    } */

    const customerDetailsBySrId = this.authService.getCustomerType();
    let segmentsArray = [];
    for (let index = 0; index < flightData.length; index++) {
      const element = flightData[index];
      const segmentsData = {
        fromCity: element.fromCode,
        toCity: element.toCode,
      };
      segmentsArray.push(segmentsData);
    }
    const ON_SAVE_POLICY = {
      productId:
        this.productList?.id === '' || this.productList?.id === null || this.productList === undefined||
        this.productList=== '' || this.productList === null || this.productList === undefined
          ? 1
          : this.productList?.id,
      customerId: customerDetailsBySrId?.customerId,
      bookingDate: depatureDate
        ? `${depatureDate.year || ''}-${this.padNumber(depatureDate.month)}-${this.padNumber(depatureDate.day)}`
        : '',
      cabinClassId: CABIN_CLASS_ID?.id == null || CABIN_CLASS_ID?.id == undefined ? 0 : CABIN_CLASS_ID?.id,
      tktTypeId: 4,
      tripTypeId: this.getTriptype(tripType),
      routes: segmentsArray,
    };
    try {
      const response:any = await this.dashboardAsyncApiServices.policyTemplateProcessStage1(
        apiUrls.policy.policyTemplateProcessStage1, ON_SAVE_POLICY
      );
      const result = response;
        if (result.status == 200) {
          this.policyList = result.data;
          this.cdr.markForCheck();
        } else {
          if (result.message == '') {
            this.toastrService.error('opps someting went wrong please try agagin policy request', 'Error', {
              progressBar: true,
            });
            this.cdr.markForCheck();
          } else {
            this.toastrService.error(result.message, 'Error', { progressBar: true });
            this.cdr.markForCheck();
          }
        }
    } catch (error) {
      console.log(error);
      this.toastrService.error('opps someting went wrong please try agagin policy request', 'Error', {
        progressBar: true,
      });
    }

  }

  openPolicyPopup() {
    const modalRef = this.modalService.open(PolicyQualifyProcessStage1Component, { size: 'xl' });
    modalRef.componentInstance.name = 'Policy';
    modalRef.componentInstance.policyList = this.policyList;
  }
  getQueryParams() {
    // request id get the paramas
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param && param.requestId) {
        this.requestId = Number(param.requestId);
        //this.fetchCustomerDetailsBySrId(this.requestId);
      }
      if (param && param.srLineId) {
        this.srLineId = Number(param.srLineId);
      }

      //params contact id
      if (param && param.contactId) {
        this.contactid = param.contactId;
      }
      if (this.srLineId && this.requestId) {
        this.isEdit = true;
        const srId = Number(this.requestId);
        this.FindById(this.srLineId, srId);

        // this.cdr.detectChanges();
      }
    });
    this.contactDetails=this.authService.getRequestDetails();
  }

  trackByFn(index, item) {
    return index;
  }

  showPriceLine(){
    this.isPriceShow = !this.isPriceShow;
  }
  ngOnInit(): void {
    //same page routing
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.keys = this.authService.getPageKeys();
    this.initializeForm();
    this.getRequestContactDetails();
    this.epicFunction();
    //this.addFlight();
    this.addDeal();
    this.getProduct();
    //master lov
    this.getMasterClass();
    this.getMasterRbd();
    this.getMasterExtenbalePerameters();
    this.getMasterPaxType();
    this.getQueryParams();
    //this.deleteQueryParameterFromCurrentRoute();
  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
