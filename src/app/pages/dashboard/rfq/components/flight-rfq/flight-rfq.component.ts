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
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NgbDateStruct,
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
import { forkJoin, Observable, of, OperatorFunction, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError, takeUntil } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { ApiResponse } from '../../../dashboard-request/model/api-response';
import * as apiUrls from '../../../dashboard-request/url-constants/url-constants';
import { FlightAddons } from 'app/shared/models/flightAddons-response';
import { RfqService } from '../../rfq-services/rfq.service';
import * as RFQURLS from '../../rfq-url-constants/apiurl';
import { RfqApiResponse } from '../../rfq-models/rfq-api-response';
import { AuthService } from 'app/shared/auth/auth.service';

import { FlightRfqSupplierContact } from '../../rfq-models/flight-rfq';
import { SendMessage, WaApiResponse } from '../../rfq-models/sendMessage';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-flight-rfq',
  templateUrl: './flight-rfq.component.html',
  styleUrls: ['./flight-rfq.component.scss'], //, '../../../../../../assets/sass/libs/select.scss'
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NgbTimeAdapter, useClass: NgbTimeStringAdapter }],
  //encapsulation: ViewEncapsulation.None,
})
export class FlightRfqComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  pageTitle = 'Flight RFQ';
  flightForm: FormGroup;
  tripTypeId = '1';
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
  searchAirLineTerm: string;
  searchMulitipleTerm: string;
  noMulitipleResults: boolean;
  searchResult: AirportSearchResponse[];
  searchAirLineResult: AirportSearchResponse[];
  searchMulitipleResult: AirportSearchResponse[];
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
  paxId = [];
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

  //service line data
  serviceLinepage = 1;
  serviceLinepageSize = 5;
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

  //supplier details
  public supplierDeatils: any;
  isMasterSelected: boolean;
  checkedSupplierList: any;
  RFQID: number;
  //search setup
  searchText: any;
  //pagination
  page = 1;
  pageSize = 10;
  collectionSize: number;
  //bpf
  public bpftransitionsList: any;
  public transitionsID: any;

  loginData = RFQURLS.WhatsAppLoginDetails;
  contactDeatils = [];
  messageModuleID = RFQURLS.sendWaMessage.moduleId;
  messageModuleName = RFQURLS.sendWaMessage.moduleName;

  requestCreationLoading:boolean=false;
  constructor(
    private fb: FormBuilder,
    public masterDataService: MasterDataService,
    private route: ActivatedRoute,
    private router: Router,
    private toastrService: ToastrService,
    private dashboardRequestService: DashboardRequestService,
    private cdr: ChangeDetectorRef,
    private datepipe: DatePipe,
    private titleService: Title,
    private rfqServices: RfqService,
    private authService: AuthService,
    private spinnerService: NgxSpinnerService,
  ) {
    this.todayDate1 = this.datepipe.transform(this.todayDate, 'yyyy-MM-dd');
    this.todaydateAndTimeStamp = formatDate(this.todayDate, 'yyyy-MM-ddThh:mm:ss', 'en-US', '+0530');
    this.titleService.setTitle('Flight RFQ');
  }

  ngOnInit(): void {
    this.initializeForm();
    this.addDeal();
    this.getMasterClass();
    this.getMasterRbd();

    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param && param.requestId) {
        this.requestId = param.requestId;
      }
      if (param && param.srLine) {
        this.srLineId = param.srLine;
      }
      //params contact id
      if (param && param.contactId) {
        this.contactid = param.contactId;
      }
      if (param && param.rfq_id && this.requestId && this.srLineId) {
        this.RFQID = param.rfq_id;
        this.isEdit = true;
        this.FindById(param.rfq_id, this.requestId, this.srLineId);
      }
      /* if (this.srLineId) {
        this.isEdit = true;
        this.FindById(this.srLineId);
      } */
    });
    //this.getBPFTransitionsList();
  }
  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
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
                this.searchResult = [...response];
                if (this.noResults) {
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
      noofCHD: '',
      noofINF: '',
      tripTypeId: '1',
      typeOfFlight: '',
      connectingDetails: '',
      passengerTypeId: '',
      flightDirection: '',
      transitPointCode: [],
      excludePointCode: [],
      expandableParametersCode: '',
      createdBy: 1,
      createdDate: this.todayDate1,
      addOns: this.fb.array([this.newFlightAddons()]),
      rfqNo: '',
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
      value: data?.indexOf(x) >= 0,
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
    return this.fb.group({
      //id: '',
      requestlineID: Number(this.srLineId?.toString()),
      //requestlineID: this.requestLineId,
      //requestID: this.requestId,
      requestSegmentId: this.requestSegmentId,
      fromCode: ['', [Validators.required]],
      fromAirportOrCityName: '',
      fromCountryName: '',
      toCode: ['', [Validators.required]],
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
      rfqUuid: '',
      transitPointCode: [],
      excludePointCode: [],
      createdBy: 1,
      createdDate: this.todayDate1,
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

  addFlight() {
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
  onFlightTypeChange(event) {
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
      if (this.flightForm.value.tripTypeId == '69') {
        this.flights()
          .at(0)
          .patchValue({
            returnDate: this.datepipe.transform(tomorrow, 'yyyy-MM-dd'),
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
   * Data Conversions methods for Flight and deals
   */
  flightDataConversion() {
    let flightsDummyArray = [];
    let flightsArray = this.flights().value;

    flightsArray.forEach((val) => flightsDummyArray.push(Object.assign({}, val)));
    flightsDummyArray.forEach((element, index) => {
      (element.requestID = Number(this.requestId)),
        (element.requestlineID = this.requestLineId),
        (element.fromCode = element.fromCode?.code ? element.fromCode?.code : element.fromCode);
      element.fromCountryName = element.fromCountryName;
      element.fromAirportOrCityName = element.fromAirportOrCityName;
      element.toCode = element.toCode?.code ? element.toCode?.code : element.toCode;
      element.toCountryName = element.toCountryName;
      element.toAirportOrCityName = element.toAirportOrCityName;
      element.depatureDate = element.depatureDate;
      element.returnDate = element.returnDate;
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
      element.rfqUuid = element.rfqUuid;
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

  /**
   * A method to bind the value of seclected element from the dropdown
   * @param $event dropdown selected option
   * @param index  index of the dynamic form
   * @param nameOfControl name of the form control in the dynamic form
   */
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
  // master lov call service calls
  getMasterClass() {
    this.masterDataService
      .getMasterDataByTableName('master_class')
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((data) => {
        if (data) {
          this.masterClassList = data;
          this.cdr.markForCheck();
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

  /********************************************************************
   * find call service and respones patch the form
   ********************************************************************/
  FindById(rfqId, srid, srLineId) {
    this.isEdit = true;
    this.rfqServices
      .findRFQById(rfqId, srid, srLineId, RFQURLS.RFQ_URL.findRFQById)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (requestResponse: any) => {
          /* if(requestResponse?.length>0){
         return;
       } */
          /* console.log(requestResponse);
       console.log(requestResponse[0]);
       console.log(requestResponse[0]?.rfqLine);
       console.log(requestResponse[0]?.rfqSegments); */

          this.updateDataservicerequestLine = requestResponse[0]?.rfqLine;
          this.updateDataSegmentData = requestResponse[0]?.rfqSegments;
          if (requestResponse.paxServiceRequestLine === undefined) {
            this.getAddonsRoutesData([], this.updateDataSegmentData, this.updateDataservicerequestLine);
          } else {
            this.getAddonsRoutesData(
              requestResponse.paxServiceRequestLine,
              this.updateDataSegmentData,
              this.updateDataservicerequestLine
            );
          }

          if (this.updateDataservicerequestLine?.addons) {
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
                //passengers: this.updateDataservicerequestLine?.addons[addonsPacthindex]?.requiredPassenger?.passengers
              });
              this.flightAddons().at(addonsPacthindex)?.get('requiredRoute')?.patchValue({
                all: this.updateDataservicerequestLine?.addons[addonsPacthindex]?.requiredRoute?.all,
              });
              if (
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
              }
            }
          } else {
            let addOnIndex = this.flightAddons()?.length - 1;
            this.onSelectRoutesAll(addOnIndex);
            this.onSelectPaxAll(addOnIndex);
          }

          let typeId = {
            value: this.updateDataservicerequestLine?.tripTypeId?.toString(),
          };
          this.onFlightTypeChange(typeId);
          this.setAutorizedEdit(this.updateDataservicerequestLine?.flexStops);
          //passengers list
          if (requestResponse.paxServiceRequestLine) {
            for (let p = 0; p < requestResponse.paxServiceRequestLine?.length; p++) {
              this.passengersList.push(requestResponse.paxServiceRequestLine[p]);
            }
          }

          if (this.updateDataservicerequestLine) {
            this.flightForm.patchValue({
              requestLineId: this.updateDataservicerequestLine?.requestLineId,
              noofADT:
                this.updateDataservicerequestLine?.noofADT === 0 ? 0 : this.updateDataservicerequestLine?.noofADT,
              noofCHD:
                this.updateDataservicerequestLine?.noofCHD === 0 ? 0 : this.updateDataservicerequestLine?.noofCHD,
              noofINF:
                this.updateDataservicerequestLine?.noofINF === 0 ? 0 : this.updateDataservicerequestLine?.noofINF,
              tripTypeId: this.updateDataservicerequestLine?.tripTypeId?.toString(),
              typeOfFlight: this.updateDataservicerequestLine?.typeOfFlight,
              connectingDetails: this.updateDataservicerequestLine?.connectingDetails,
              passengerTypeId: this.updateDataservicerequestLine?.passengerTypeId,
              //expandableParametersCode: this.updateDataservicerequestLine?.expandableParametersCode?.map(Number),
              flexStops: this.updateDataservicerequestLine?.flexStops,
              rfqNo: this.updateDataservicerequestLine?.rfqNo,
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
              this.flights()
                .at(j)
                .patchValue({
                  requestlineID: Number(this.srLineId?.toString()),
                  requestID: this.requestId,
                  requestSegmentId: this.updateDataSegmentData[j]?.requestSegmentId,
                  fromCode: item,
                  toCode: toCodeObject,
                  airlineCode: airLine,
                  rfqUuid: this.updateDataSegmentData[j]?.rfqUuid,
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
                  depatureDate: this.datepipe.transform(this.updateDataSegmentData[j]?.depatureDate, 'yyyy-MM-dd'),
                  returnDate: this.datepipe.transform(this.updateDataSegmentData[j]?.returnDate, 'yyyy-MM-dd'),
                  transitPointCode: this.updateDataSegmentData[j]?.transitPointCode,
                  excludePointCode: this.updateDataSegmentData[j]?.excludePointCode,
                });
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
              if (this.updateDataSegmentData[j]?.flexToCode && this.updateDataSegmentData[j]?.flexToCode?.length > 0) {
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
          } else {
            this.toastrService.error(
              'Oops! Something went wrong while fetching the RFQ  data please try again ',
              'Error'
            );
          }
        },
        (error) => {
          this.toastrService.error('Oops! Something went wrong while fetching the RFQ data please try again ', 'Error');
        }
      );
  }

  //flight addons
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
                this.searchflightAddonsResult = [...response];
                if (this.noFlightAddonsResults) {
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
        this.searchFlightAddonsTerm === '' || this.searchFlightAddonsTerm.length <= 2
          ? []
          : this.searchflightAddonsResult.filter(
              (v) => v.name.toLowerCase().indexOf(this.searchFlightAddonsTerm.toLowerCase()) > -1
            )
      )
    );

  getAddonsRoutesData(passengersData, routesData, lineData) {
    let linePersonCount = [];
    if (lineData?.noofINF > 0) {
      for (let lineINFIndex = 1; lineINFIndex <= lineData?.noofINF; lineINFIndex++) {
        let INFData = {
          paxNo: lineINFIndex,
          paxType: 'INF' + '-' + lineINFIndex,
          paxRefence: 0,
        };
        linePersonCount.push(INFData);
      }
    }
    if (lineData?.noofADT > 0) {
      for (let lineAdultIndex = 1; lineAdultIndex <= lineData?.noofADT; lineAdultIndex++) {
        let adultData = {
          paxNo: lineAdultIndex,
          paxType: 'ADT' + '-' + lineAdultIndex,
          paxRefence: 0,
        };
        linePersonCount.push(adultData);
      }
    }
    if (lineData?.noofCHD > 0) {
      for (let lineChildIndex = 1; lineChildIndex <= lineData?.noofCHD; lineChildIndex++) {
        let childData = {
          paxNo: lineChildIndex,
          paxType: 'CHD' + '-' + lineChildIndex,
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
        route: routesData[routeIndex]?.fromCode + ' - ' + routesData[routeIndex]?.toCode,
      };
      routes.push(data);
      if (lineData.tripTypeId === 69) {
        let roundTripData = {
          routeNo: routeIndex + 1,
          route: routesData[routeIndex]?.toCode + ' - ' + routesData[routeIndex]?.fromCode,
        };
        routes.push(roundTripData);
      }
    }
    this.addonsRoutes = routes;
    this.cdr.detectChanges();
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

  getSupplierDetailes() {
    this.rfqServices
      .getAllSupplierData(RFQURLS.SUPPLIPER_URL.getAllSupplier)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((supplierData: RfqApiResponse) => {
        const result: RfqApiResponse = supplierData;
        if (result.status === 200) {
          //this.supplierDeatils = result.data;
          let data: any = result.data;
          data.forEach((element) => {
            element.isSelected = false;
          });
          this.supplierDeatils = result.data;

          //this.collectionSize = this.supplierDeatils.length;
          this.cdr.markForCheck();
        } else {
          this.toastrService.error(
            'Oops! Something went wrong while fetching the supplier data please try again.',
            'Error'
          );
        }
      });
  }

  isAllSelected() {
    this.isMasterSelected = this.supplierDeatils.every(function (item: any) {
      return item.isSelected == true;
    });
    this.getCheckedItemList();
  }
  getCheckedItemList() {
    this.checkedSupplierList = [];
    this.contactDeatils = [];
    for (let i = 0; i < this.supplierDeatils.length; i++) {
      if (this.supplierDeatils[i]?.isSelected) {
        const element = this.supplierDeatils[i];
        const RfqSupplierRelation = {
          requestId: Number(this.requestId),
          requestLineId: Number(this.srLineId),
          status: 1,
          supplierId: this.supplierDeatils[i].customerId,
          createdBy: this.authService.getUser(),
          updatedBy: this.authService.getUser(),
          email: this.supplierDeatils[i].primaryEmail,
          //supplierNo: i+1
          //updatedDate:this.todayDate1
        };
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
            sub_reference: Number(this.srLineId),
            supplier_id: this.supplierDeatils[i]?.customerId,
          };
          this.contactDeatils.push(contact);
        }
        this.checkedSupplierList.push(RfqSupplierRelation);
      }
    }
    //console.log( this.contactDeatils);
    //this.checkedSupplierList = JSON.stringify(this.checkedSupplierList);
  }

  /**
   * submit For Request line
   * */
  onUpdateFlightForm() {
    this.submitted = true;
    this.isValidFormSubmitted = false;
    if (this.checkedSupplierList === undefined || this.checkedSupplierList?.length === 0) {
      return this.toastrService.error('please select atleast one supplier', 'Error');
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
      this.showSpinner();
    this.requestCreationLoading=true;
      let editFlightRFQ = {
        rfqLine: {
          rfqId: Number(this.RFQID),
          requestId: Number(this.requestId),
          requestLineId: Number(this.requestLineId),
          rfqUuid: flightsData[0]?.rfqUuid,
          tripTypeId: this.flightForm.get('tripTypeId').value === null ? null : this.flightForm.get('tripTypeId').value,
          noofADT: this.flightForm.get('noofADT').value === null ? 0 : this.flightForm.get('noofADT').value,
          noofCHD: this.flightForm.get('noofCHD').value === null ? 0 : this.flightForm.get('noofCHD').value,
          noofINF: this.flightForm.get('noofINF').value === null ? 0 : this.flightForm.get('noofINF').value,
          typeOfFlight:
            this.flightForm.get('typeOfFlight').value === null ? null : this.flightForm.get('typeOfFlight').value,
          connectingDetails:
            this.flightForm.get('connectingDetails').value === null
              ? null
              : this.flightForm.get('connectingDetails').value,
          flexStops: this.flightForm.get('flexStops').value === '' ? [] : this.flightForm.get('flexStops').value,
          passengerTypeId:
            this.flightForm.get('passengerTypeId').value === null ? null : this.flightForm.get('passengerTypeId').value,
          updatedBy: this.authService.getUser(),
          //createdDate: this.todayDate1,
          expandableParametersCode:
            this.flightForm.get('expandableParametersCode').value !== ''
              ? this.flightForm.get('expandableParametersCode').value
              : [],

          //dealCode: dealsData === [{"dealCode": ""}]? []:dealsData,
          dealCode: [],

          //addons: this.flightAddons().value === "" || this.flightAddons().value === [" "]?[]:this.flightAddons().value,
          addons: [],
          rfqNo: this.flightForm.get('rfqNo').value,
          //addons: this.flightAddons().value
        },
        rfqSegments: flightsData,
        rfqSupplierRelation: this.checkedSupplierList,
      };

      this.rfqServices.updateRFQFlight(editFlightRFQ, RFQURLS.RFQ_URL.updateRFQ).pipe(takeUntil(this.ngDestroy$)).subscribe(
        (data: any) => {
          if(data){

            this.sendRFQ();
          }
          //this.whatsAppLogin(this.loginData,this.contactDeatils);

        },
        (error) => {
          this.toastrService.error('Oops! Something went wrong  while send the data please try again', 'Error');
        }
      );
    } else {
      this.toastrService.error('please fill the required fields', 'Error');
    }
  }

  getBPFTransitionsList() {
    this.rfqServices
      .getBPFTransitions(RFQURLS.RFQ_URL.BPFTransition)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((relationshipList: RfqApiResponse) => {
        const result: RfqApiResponse = relationshipList;
        if (result.status === 200) {
          this.bpftransitionsList = result.data;
          //console.log( this.bpftransitionsList );
          this.cdr.detectChanges();
        } else {
          this.toastrService.error('Oops! Something went wrong while fetching the Service Register data.', 'Error');
        }
      });
  }

  onChangeTransitions(event: any) {
    if (event) {
      this.transitionsID = event;
    }
  }

  updateTransitions() {
    if (this.RFQID && this.transitionsID) {
      this.rfqServices
        .updateRFQTransitions(this.RFQID, this.transitionsID, RFQURLS.RFQ_URL.updateTransition)
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe(
          (data: any) => {
            this.toastrService.success(`RFQ Transition  updated successfuly !`, 'Success');
          },
          (error) => {
            this.toastrService.error('Oops! Something went wrong  while send the data please try again', 'Error');
          }
        );
    } else {
      this.toastrService.error('Please select transitions and update ', 'Error');
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
            this.toastrService.success(` sent mail successfuly !`, 'Success');
          } catch (error) {
            console.log(error);
            this.toastrService.error(`send mail failed`, 'Error');
          }
          try {

            await this.rfqServices.sendWaMessages(contactElement, RFQURLS.whatsAppUrl.sendWaMessageRFQ);
            this.toastrService.success(` sent message successfuly !`, 'Success');
          } catch (error) {
            console.log(error);
            this.toastrService.error(`send message failed`, 'Error');
          }finally {
            this.requestCreationLoading = false;
          }
        }
      }
      this.toastrService.success(`RFQ sent  successfuly !`, 'Success');
      this.router.navigate(['/dashboard/rfq/supplier-information']);
    }
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


}
