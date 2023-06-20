import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { AirportSearchResponse } from 'app/shared/models/airport-search-response';
import { MasterDataService } from 'app/shared/services/master-data.service';
import { OperatorFunction, Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, switchMap, catchError, filter, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Airline } from 'app/shared/models/airline-response';
import { AmendmentsService } from '../../amendments.service';
import { AMENDMENTS_URL } from '../../amendments.constants';
import { AmendmentsFlight, CHECK_LIST_APIRESPONSE, FlightApiResponse, PNRAPIRESPONSE } from '../../amendments.model';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, formatDate } from '@angular/common';
import { AuthService } from 'app/shared/auth/auth.service';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-flight',
  templateUrl: './flight.component.html',
  styleUrls: ['./flight.component.scss'],
})
export class FlightComponent implements OnInit, OnDestroy {
  @ViewChild('typeaheadInstance') typeaheadInstance: NgbTypeahead;
  //location Global variables to display whether is loading or failed to load the data
  noResults: boolean;
  searchTerm: string;
  searchResult: AirportSearchResponse[];
  formatter = (airport: AirportSearchResponse) => airport.code;
  //master class lov
  masterClassList: any = [];
  masterAmendmentsType: any = [];
  masterMealsList: any = [];
  //airline
  noAirLineResults: boolean;
  searchAirLineTerm: string;
  searchAirLineResult: Airline[];
  @ViewChild('airLineTypeaHeadInstance') airLineTypeaHeadInstance: NgbTypeahead;
  formatterAirline = (airport: Airline) => airport.shortCode2Digit;
  //flight booking info

  flightBookingData: AmendmentsFlight[];
  //dynamic hide or show
  rowsControlsTicket: any = [
    {
      isCollapsedTicket: true,
    },
  ];
  decryptBooingId: any;
  // today date
  todayDate = new Date();
  todayDate1: string;
  //ipaddress
  deviceInfo = null;
  requestId: number;
  productId: number;
  submitButtonDisabled: boolean = false;

  isMasterSelected: boolean;
  checkedTicketList: any[] = [];

  public isCollapsed = true;
  pnr_data: any;
  pnrForm: FormGroup;
  selectedProductNumber: number;
  submitted: boolean = false;
  modifyButtonDisabled: boolean = true;
  //checkList
  flightCheckList: any = [];
  isCheckListMasterSelected: boolean;
  checkedAmendmentsList: any;
  generateCheckListButton: boolean = false;
  amendment_request_id: number;
  cancelFormButton: boolean = false;

  ngDestroy$: Subject<void> = new Subject<void>();
  constructor(
    private titleService: Title,
    private route: ActivatedRoute,
    private router: Router,
    private reissue_request_from: FormBuilder,
    private masterDataService: MasterDataService,
    private cdr: ChangeDetectorRef,
    private toastrService: ToastrService,
    private datepipe: DatePipe,
    private authService: AuthService,
    private deviceService: DeviceDetectorService,
    private amendmentsServices: AmendmentsService
  ) {
    this.isMasterSelected = false;
    this.titleService.setTitle('Amendments Request for Flight after Ticket');
    this.todayDate1 = formatDate(this.todayDate, 'yyyy-MM-ddThh:mm:ss', 'en-US', '+0530');
  }
  epicFunction() {
    this.deviceInfo = this.deviceService.getDeviceInfo();
  }
  initalizePnrForm() {
    this.pnrForm = this.reissue_request_from.group({
      pnr_segment_dates: this.reissue_request_from.array([this.newPnrDates()]),
      pnr_pax_data: this.reissue_request_from.array([this.newPnrPassengers()]),
      pnr_segment_board_points: this.reissue_request_from.array([this.newBoardPoints()]),
      pnr_segment_off_points: this.reissue_request_from.array([this.newOffPoints()]),
      pnr_segment_seats: this.reissue_request_from.array([this.newSeats()]),
      pnr_segment_baggage: this.reissue_request_from.array([this.newBaggage()]),
      pnr_segment_ssr: this.reissue_request_from.array([this.newSSR()]),
      pnr_segment_meals: this.reissue_request_from.array([this.newMeals()]),
      pnr_segment_bassinet: this.reissue_request_from.array([this.newBassinet()]),
      pnr_segment_classes: this.reissue_request_from.array([this.newClasses()]),
      pnr_segment_airlines: this.reissue_request_from.array([this.newAirlines()]),
      pnr_segment_numbers: this.reissue_request_from.array([this.newSegmentNumbers()]),
    });
  }
  newPnrPassengers() {
    return this.reissue_request_from.group({
      reference_number: '',
      pax_type: '',
      first_name: '',
      previous_first_name: '',
      surname: '',
      previous_surname: '',
      dob: '',
      previous_dob: '',
      segment_count: '',
    });
  }
  newPnrDates() {
    return this.reissue_request_from.group({
      passenger_number: '',
      passenger_type: '',
      depart_date: '',
      previous_depart_date: '',
      select_previous_depart_date: '',
      segment_reference_number: '',
      last_leg: '',
    });
  }
  newBoardPoints() {
    return this.reissue_request_from.group({
      passenger_number: '',
      passenger_type: '',
      board_point: '',
      previous_board_point: '',
      select_previous_board_point: '',
      segment_reference_number: '',
      last_leg: '',
    });
  }
  newOffPoints() {
    return this.reissue_request_from.group({
      passenger_number: '',
      passenger_type: '',
      segment_reference_number: '',
      off_point: '',
      previous_off_point: '',
      select_previous_off_point: '',
      last_leg: '',
    });
  }
  newSeats() {
    return this.reissue_request_from.group({
      passenger_number: '',
      passenger_type: '',
      segment_reference_number: '',
      seat: '',
      previous_seat: '',
      select_previous_seat: '',
      last_leg: '',
    });
  }

  newBaggage() {
    return this.reissue_request_from.group({
      passenger_number: '',
      passenger_type: '',
      segment_reference_number: '',
      baggage: '',
      previous_baggage: '',
      select_previous_baggage: '',
      last_leg: '',
    });
  }
  //newSSR
  newSSR() {
    return this.reissue_request_from.group({
      passenger_number: '',
      segment_reference_number: '',
      passenger_type: '',
      ssr: '',
      previous_ssr: '',
      select_previous_ssr: '',
      last_leg: '',
    });
  }
  newMeals() {
    return this.reissue_request_from.group({
      passenger_number: '',
      segment_reference_number: '',
      passenger_type: '',
      meal: '',
      previous_meal: '',
      select_previous_meal: '',
      last_leg: '',
    });
  }
  //newBassinet
  newBassinet() {
    return this.reissue_request_from.group({
      passenger_number: '',
      passenger_type: '',
      segment_reference_number: '',
      bassinet: '',
      previous_bassinet: '',
      select_previous_bassinet: '',
      last_leg: '',
    });
  }
  //newClasses
  newClasses() {
    return this.reissue_request_from.group({
      passenger_number: '',
      passenger_type: '',
      segment_reference_number: '',
      class: '',
      previous_class: '',
      select_previous_class: '',
      last_leg: '',
    });
  }
  //newAirlines
  newAirlines() {
    return this.reissue_request_from.group({
      passenger_number: '',
      passenger_type: '',
      segment_reference_number: '',
      airLine: '',
      previous_airline: '',
      select_previous_airline: '',
      last_leg: '',
    });
  }
  //newSegmentNumbers
  newSegmentNumbers() {
    return this.reissue_request_from.group({
      passenger_number: '',
      passenger_type: '',
      segment_reference_number: '',
      segmentNo: '',
      last_leg: '',
    });
  }
  pax_data(): FormArray {
    return this.pnrForm?.get('pnr_pax_data') as FormArray;
  }
  addPaxData() {
    this.pax_data()?.push(this.newPnrPassengers());
  }

  pnr_dates(): FormArray {
    return this.pnrForm?.get('pnr_segment_dates') as FormArray;
  }
  addPnrDates() {
    this.pnr_dates()?.push(this.newPnrDates());
  }

  pnr_board_points(): FormArray {
    return this.pnrForm?.get('pnr_segment_board_points') as FormArray;
  }
  addBoardPoints() {
    this.pnr_board_points()?.push(this.newBoardPoints());
  }

  pnr_off_points(): FormArray {
    return this.pnrForm?.get('pnr_segment_off_points') as FormArray;
  }
  addOffPoints() {
    this.pnr_off_points().push(this.newOffPoints());
  }

  pnr_seats(): FormArray {
    return this.pnrForm?.get('pnr_segment_seats') as FormArray;
  }
  addSeats() {
    this.pnr_seats().push(this.newSeats());
  }
  pnr_baggage(): FormArray {
    return this.pnrForm?.get('pnr_segment_baggage') as FormArray;
  }
  addBaggage() {
    this.pnr_baggage().push(this.newBaggage());
  }

  pnr_ssr(): FormArray {
    return this.pnrForm?.get('pnr_segment_ssr') as FormArray;
  }
  addSSR() {
    this.pnr_ssr().push(this.newSSR());
  }
  pnr_meals(): FormArray {
    return this.pnrForm?.get('pnr_segment_meals') as FormArray;
  }
  addMeal() {
    this.pnr_meals().push(this.newMeals());
  }
  //newBassinet
  pnr_bassinet(): FormArray {
    return this.pnrForm?.get('pnr_segment_bassinet') as FormArray;
  }
  addBassinet() {
    this.pnr_bassinet().push(this.newBassinet());
  }
  //newClasses
  pnr_class(): FormArray {
    return this.pnrForm?.get('pnr_segment_classes') as FormArray;
  }
  addClass() {
    this.pnr_class().push(this.newClasses());
  }
  //newAirlines
  pnr_airlines(): FormArray {
    return this.pnrForm?.get('pnr_segment_airlines') as FormArray;
  }
  addAirLines() {
    this.pnr_airlines().push(this.newAirlines());
  }
  //newSegmentNumbers
  pnr_segment_numbers(): FormArray {
    return this.pnrForm?.get('pnr_segment_numbers') as FormArray;
  }
  addSegmentNumbers() {
    this.pnr_segment_numbers().push(this.newSegmentNumbers());
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
          : this.searchResult?.filter((v) => v.name.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1)
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
  getAmendmentsType() {
    this.masterDataService
      .getGenMasterDataByTableName('master_amendments')
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        if (res) {
          this.masterAmendmentsType = res;
          this.cdr.markForCheck();
        } else {
          this.toastrService.error('Oops! Something went wrong while fetching the Amendments Type Data', 'Error');
        }
      });
  }

  getMealsData() {
    this.amendmentsServices
      .getAllMeals(AMENDMENTS_URL.meals)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res: any) => {
        const result: FlightApiResponse = res;
        if (result.status === 200) {
          this.masterMealsList = result.data;
        } else {
          if (result.message?.trim().length == 0) {
            this.toastrService.error('Oops! Something went wrong while fetching the Meals Data', 'Error');
          } else {
            this.toastrService.error(result.message, 'Error');
          }
        }
      });
  }
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

  reloadComponent() {
    const booking_id = this.route.snapshot.queryParams.booking_id;
    const requestId = this.route.snapshot.queryParams.request_Id;
    const customer_name = this.route.snapshot.queryParams.customer_name;
    const contact_name = this.route.snapshot.queryParams.contact_name;
    const supplier_reference = this.route.snapshot.queryParams.supplier_reference;
    const contactNumber = this.route.snapshot.queryParams.contactNumber;
    const productID = this.route.snapshot.queryParams.product_id;
    const channel = this.route.snapshot.queryParams.channel;
    const bookingReferenceNumber = this.route.snapshot.queryParams.booking_reference;
    const from = this.route.snapshot.queryParams.from;
    //const amendment_request_id=this.route.snapshot.queryParams.amendment_request_id;

    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([`/dashboard/amendments/request/flight`], {
      queryParams: {
        product_id: productID,
        channel: channel,
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

  getPnrData(objectData) {
    this.amendmentsServices
      .getPnrData(objectData, AMENDMENTS_URL.pnrDataForAmendments)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (res: any) => {
          const result: PNRAPIRESPONSE = res;
          if (result.status == true) {
            this.pnr_data = result.pnr_data_information;
            if (result.pnr_data_information.passengers.length > 0) {
              result.pnr_data_information.passengers?.forEach((paxinfoelement) => {
                paxinfoelement.ticket_info?.forEach((ticketinfoElement) => {
                  this.rowsControlsTicket.push({
                    isCollapsedTicket: true,
                  });
                  ticketinfoElement?.forEach((element) => {
                    element.isticketSelected = false;
                    element.remarks = null;
                  });
                });
              });
            }
            if (result.pnr_data_information?.depart_dates.length > 0) {
              for (let dateIndex = 0; dateIndex < result.pnr_data_information?.depart_dates.length; dateIndex++) {
                const pnr_DateElement = result.pnr_data_information?.depart_dates[dateIndex];
                if (dateIndex > 0) {
                  this.addPnrDates();
                }
                ((this.pnrForm.get('pnr_segment_dates') as FormArray).at(dateIndex) as FormGroup).patchValue({
                  depart_date: this.datepipe.transform(pnr_DateElement.value, 'yyyy-MM-dd'),
                  previous_depart_date: this.datepipe.transform(pnr_DateElement.value, 'yyyy-MM-dd'),
                  select_previous_depart_date: this.datepipe.transform(pnr_DateElement.value, 'yyyy-MM-dd'),
                  last_leg: pnr_DateElement.last_leg,
                  passenger_number: pnr_DateElement.passenger_number,
                  passenger_type: pnr_DateElement.passenger_type,
                  segment_reference_number: pnr_DateElement.segment_reference_number,
                });
              }
            }
            if (result.pnr_data_information?.passengers?.length > 0) {
              for (let paxIndex = 0; paxIndex < result.pnr_data_information?.passengers?.length; paxIndex++) {
                const paxelement = result.pnr_data_information?.passengers[paxIndex];
                if (paxIndex > 0) {
                  this.addPaxData();
                }
                ((this.pnrForm.get('pnr_pax_data') as FormArray).at(paxIndex) as FormGroup).patchValue({
                  reference_number: paxelement.reference_number,
                  pax_type: paxelement.pax_type,
                  first_name: paxelement.first_name,
                  previous_first_name: paxelement.first_name,
                  surname: paxelement.surname,
                  previous_surname: paxelement.surname,
                  dob: paxelement.dob,
                  previous_dob: paxelement.dob,
                  segment_count: paxelement.segment_count,
                });
              }
            }
            if (result.pnr_data_information?.board_points?.length > 0) {
              for (let fromIndex = 0; fromIndex < result.pnr_data_information?.board_points?.length; fromIndex++) {
                const fromElement = result.pnr_data_information?.board_points[fromIndex];
                if (fromIndex > 0) {
                  this.addBoardPoints();
                }
                const segmentfromCode = {
                  code: fromElement.value,
                  city: null,
                  cityCode: null,
                  country: null,
                  countryCode: null,
                  createdBy: null,
                  createdDate: null,
                  id: null,
                  name: null,
                  status: null,
                  timeZone: null,
                  type: null,
                  updatedBy: null,
                  updatedDate: null,
                };
                ((this.pnrForm.get('pnr_segment_board_points') as FormArray).at(fromIndex) as FormGroup).patchValue({
                  board_point: segmentfromCode,
                  previous_board_point: segmentfromCode,
                  select_previous_board_point: segmentfromCode,
                  last_leg: fromElement.last_leg,
                  passenger_number: fromElement.passenger_number,
                  passenger_type: fromElement.passenger_type,
                  segment_reference_number: fromElement.segment_reference_number,
                });
              }
            }
            if (result.pnr_data_information?.off_points?.length > 0) {
              for (let toIndex = 0; toIndex < result.pnr_data_information?.off_points?.length; toIndex++) {
                const toElement = result.pnr_data_information?.off_points[toIndex];
                if (toIndex > 0) {
                  this.addOffPoints();
                }
                const segmenttoCode = {
                  code: toElement.value,
                  city: null,
                  cityCode: null,
                  country: null,
                  countryCode: null,
                  createdBy: null,
                  createdDate: null,
                  id: null,
                  name: null,
                  status: null,
                  timeZone: null,
                  type: null,
                  updatedBy: null,
                  updatedDate: null,
                };
                ((this.pnrForm.get('pnr_segment_off_points') as FormArray).at(toIndex) as FormGroup)?.patchValue({
                  off_point: segmenttoCode,
                  previous_off_point: segmenttoCode,
                  select_previous_off_point: segmenttoCode,
                  last_leg: toElement.last_leg,
                  passenger_number: toElement.passenger_number,
                  passenger_type: toElement.passenger_type,
                  segment_reference_number: toElement.segment_reference_number,
                });
              }
            }
            //seats
            if (result.pnr_data_information?.seats?.length > 0) {
              for (let seatsIndex = 0; seatsIndex < result.pnr_data_information?.seats?.length; seatsIndex++) {
                const seatElement = result.pnr_data_information?.seats[seatsIndex];

                if (seatsIndex > 0) {
                  this.addSeats();
                }
                ((this.pnrForm.get('pnr_segment_seats') as FormArray).at(seatsIndex) as FormGroup)?.patchValue({
                  seat: seatElement.value,
                  previous_seat: seatElement.value,
                  select_previous_seat: seatElement.value,
                  last_leg: seatElement.last_leg,
                  passenger_number: seatElement.passenger_number,
                  passenger_type: seatElement.passenger_type,
                  segment_reference_number: seatElement.segment_reference_number,
                });
              }
            }
            //baggage
            if (result.pnr_data_information?.baggage?.length > 0) {
              for (let baggageIndex = 0; baggageIndex < result.pnr_data_information?.baggage?.length; baggageIndex++) {
                const baggageElement = result.pnr_data_information?.baggage[baggageIndex];
                if (baggageIndex > 0) {
                  this.addBaggage();
                }
                ((this.pnrForm.get('pnr_segment_baggage') as FormArray).at(baggageIndex) as FormGroup)?.patchValue({
                  baggage: baggageElement.value,
                  previous_baggage: baggageElement.value,
                  select_previous_baggage: baggageElement.value,
                  last_leg: baggageElement.last_leg,
                  passenger_number: baggageElement.passenger_number,
                  passenger_type: baggageElement.passenger_type,
                  segment_reference_number: baggageElement.segment_reference_number,
                });
              }
            }

            //ssrs
            if (result.pnr_data_information?.ssrs?.length > 0) {
              for (let ssrIndex = 0; ssrIndex < result.pnr_data_information?.ssrs?.length; ssrIndex++) {
                const ssrElement = result.pnr_data_information?.ssrs[ssrIndex];
                if (ssrIndex > 0) {
                  this.addSSR();
                }
                ((this.pnrForm.get('pnr_segment_ssr') as FormArray).at(ssrIndex) as FormGroup)?.patchValue({
                  ssr: ssrElement.value,
                  previous_ssr: ssrElement.value,
                  select_previous_ssr: ssrElement.value,
                  last_leg: ssrElement.last_leg,
                  passenger_number: ssrElement.passenger_number,
                  passenger_type: ssrElement.passenger_type,
                  segment_reference_number: ssrElement.segment_reference_number,
                });
              }
            }

            //meals
            if (result.pnr_data_information?.meals?.length > 0) {
              for (let mealsIndex = 0; mealsIndex < result.pnr_data_information?.meals?.length; mealsIndex++) {
                const mealElement = result.pnr_data_information?.meals[mealsIndex];
                if (mealsIndex > 0) {
                  this.addMeal();
                }
                ((this.pnrForm.get('pnr_segment_meals') as FormArray).at(mealsIndex) as FormGroup)?.patchValue({
                  meal: mealElement.value,
                  previous_meal: mealElement.value,
                  select_previous_meal: mealElement.value,
                  last_leg: mealElement.last_leg,
                  passenger_number: mealElement.passenger_number,
                  passenger_type: mealElement.passenger_type,
                  segment_reference_number: mealElement.segment_reference_number,
                });
              }
            }

            //bassinet
            if (result.pnr_data_information?.bassinet?.length > 0) {
              for (
                let bassinetIndex = 0;
                bassinetIndex < result.pnr_data_information?.bassinet?.length;
                bassinetIndex++
              ) {
                const bassinetElement = result.pnr_data_information?.bassinet[bassinetIndex];
                if (bassinetIndex > 0) {
                  this.addBassinet();
                }
                ((this.pnrForm.get('pnr_segment_bassinet') as FormArray).at(bassinetIndex) as FormGroup)?.patchValue({
                  bassinet: bassinetElement.value,
                  previous_bassinet: bassinetElement.value,
                  select_previous_bassinet: bassinetElement.value,
                  last_leg: bassinetElement.last_leg,
                  passenger_number: bassinetElement.passenger_number,
                  passenger_type: bassinetElement.passenger_type,
                  segment_reference_number: bassinetElement.segment_reference_number,
                });
              }
            }
            //classes
            if (result.pnr_data_information?.classes?.length > 0) {
              for (let classIndex = 0; classIndex < result.pnr_data_information?.classes?.length; classIndex++) {
                const classElement = result.pnr_data_information?.classes[classIndex];
                if (classIndex > 0) {
                  this.addClass();
                }
                ((this.pnrForm.get('pnr_segment_classes') as FormArray).at(classIndex) as FormGroup)?.patchValue({
                  class: classElement.value,
                  previous_class: classElement.value,
                  select_previous_class: classElement.value,
                  last_leg: classElement.last_leg,
                  passenger_number: classElement.passenger_number,
                  passenger_type: classElement.passenger_type,
                  segment_reference_number: classElement.segment_reference_number,
                });
              }
            }
            //airlines
            if (result.pnr_data_information?.airlines?.length > 0) {
              for (let airlineIndex = 0; airlineIndex < result.pnr_data_information?.airlines?.length; airlineIndex++) {
                const airLineElement = result.pnr_data_information?.airlines[airlineIndex];
                if (airlineIndex > 0) {
                  this.addAirLines();
                }
                const airLineCode = {
                  airLineType: null,
                  code: null,
                  createdBy: null,
                  createdDate: null,
                  id: null,
                  name: null,
                  parentAirline: null,
                  shortCode2Digit: airLineElement.value,
                  shortCode3Digit: null,
                  status: null,
                  udatedBy: null,
                  updatedDate: null,
                };
                ((this.pnrForm.get('pnr_segment_airlines') as FormArray).at(airlineIndex) as FormGroup)?.patchValue({
                  airLine: airLineCode,
                  previous_airline: airLineCode,
                  select_previous_airline: airLineCode,
                  last_leg: airLineElement.last_leg,
                  passenger_number: airLineElement.passenger_number,
                  passenger_type: airLineElement.passenger_type,
                  segment_reference_number: airLineElement.segment_reference_number,
                });
              }
            }
            //segmentnumbers
            if (result.pnr_data_information?.segmentnumbers?.length > 0) {
              for (
                let segmentnumberIndex = 0;
                segmentnumberIndex < result.pnr_data_information?.segmentnumbers?.length;
                segmentnumberIndex++
              ) {
                const segmentNumberElement = result.pnr_data_information?.segmentnumbers[segmentnumberIndex];
                if (segmentnumberIndex > 0) {
                  this.addSegmentNumbers();
                }
                (
                  (this.pnrForm.get('pnr_segment_numbers') as FormArray).at(segmentnumberIndex) as FormGroup
                )?.patchValue({
                  segmentNo: segmentNumberElement.value,
                  last_leg: segmentNumberElement.last_leg,
                  passenger_number: segmentNumberElement.passenger_number,
                  passenger_type: segmentNumberElement.passenger_type,
                  segment_reference_number: segmentNumberElement.segment_reference_number,
                });
              }
            }

            this.cdr.markForCheck();
          }
        },
        (error) => this.toastrService.error(error, 'Error')
      );
  }
  isAllTicketsSelect(type?: string) {
    if (this.pnr_data?.passengers.length > 0) {
      let ticketsData = [];
      for (let paxIndex = 0; paxIndex < this.pnr_data?.passengers?.length; paxIndex++) {
        const paxelement = this.pnr_data?.passengers[paxIndex];
        for (let ticketindex = 0; ticketindex < paxelement.ticket_info.length; ticketindex++) {
          const ticketElement = paxelement.ticket_info[ticketindex];
          ticketElement?.forEach((ticket) => {
            ticketsData.push(ticket);
          });
          if (type === 'all') {
            ticketElement?.forEach((ticket) => {
              ticket.isticketSelected = this.isMasterSelected;
            });
            this.cancelFormButton = this.isMasterSelected;
          }
        }
      }
      this.isMasterSelected = ticketsData?.every((item: any) => item.isticketSelected);
      this.cancelFormButton = ticketsData?.some((item: any) => item.isticketSelected);
    }
  }

  onSubmitPnrForm(actionType: string) {
    this.submitted = true;
    let passengersData: { passengers: any[] };
    passengersData = {
      passengers: [...this.pnrForm.value.pnr_pax_data],
    };
    passengersData?.passengers?.forEach((passenger: any, index: number) => {
      passenger.nameChange = {};
      passenger.dates = [];
      passenger.board_points = [];
      passenger.off_points = [];
      passenger.seats = [];
      passenger.baggage = [];
      passenger.ssrs = [];
      passenger.meals = [];
      passenger.bassinet = [];
      passenger.classes = [];
      passenger.airlines = [];
      passenger.ticketData = [];

      if (this.pnrForm.value.pnr_segment_dates.length > 0) {
        this.pnrForm.value.pnr_segment_dates?.forEach((dates: any) => {
          if (
            passenger?.pax_type + '-' + passenger?.reference_number ===
            dates?.passenger_type + '-' + dates?.passenger_number
          ) {
            const nameChange = {
              firstname: passenger?.first_name,
              previous_first_name: passenger?.previous_first_name,
              surname: passenger?.surname,
              previous_surname: passenger?.previous_surname,
              dob: passenger?.dob,
              previous_dob: passenger?.previous_dob,
              pax_type: passenger?.pax_type,
              reference_number: passenger?.reference_number,
            };
            passenger.nameChange = nameChange;

            //passenger.dates.push(dates);
            if (dates?.depart_date !== dates?.previous_depart_date) {
              const dates__data = {
                depart_date: dates.depart_date,
                last_leg: dates.last_leg,
                passenger_number: dates.passenger_number,
                passenger_type: dates.passenger_type,
                previous_depart_date: dates.previous_depart_date,
                segment_reference_number: dates.segment_reference_number,
              };
              passenger.dates.push(dates__data);
            }
          }
        });
      }

      /*   if (this.checkedTicketList?.length > 0) {
          for (let ticketIndex = 0; ticketIndex < this.checkedTicketList?.length; ticketIndex++) {
            const ticketElement = this.checkedTicketList[ticketIndex];
              for (let ticketSubIndex = 0; ticketSubIndex < ticketElement?.tickets?.length; ticketSubIndex++) {
                const ticketSubElement = ticketElement?.tickets[ticketSubIndex];
                if((passenger?.nameChange?.firstname&&passenger?.nameChange?.surname) === (ticketSubElement?.namechange?.first_name&&ticketSubElement?.namechange?.surname)){
                  const cancel_tickets_objects={
                    number_of_booklets: ticketSubElement.number_of_booklets,
                    remarks: ticketSubElement.remarks,
                    ticket_number: ticketSubElement.ticket_number,
                  }
                  passenger.ticketData.push(cancel_tickets_objects);
                }
              }
            //passenger.ticketData.push(ticketElement);
          }
        } */

      if (this.pnr_data?.passengers.length > 0) {
        for (let index = 0; index < this.pnr_data?.passengers.length; index++) {
          const element = this.pnr_data?.passengers[index];
          if (element?.ticket_info?.length > 0) {
            for (let ticket_index = 0; ticket_index < element?.ticket_info?.length; ticket_index++) {
              const ticket_element = element?.ticket_info[ticket_index];
              if (ticket_element?.length > 0) {
                for (let sub_index = 0; sub_index < ticket_element?.length; sub_index++) {
                  const ticket_sub_element = ticket_element[sub_index];
                  if (passenger?.nameChange?.reference_number === element?.reference_number) {
                    if (ticket_sub_element?.isticketSelected === true) {
                      const cancel_tickets_objects = {
                        number_of_booklets: ticket_sub_element.number_of_booklets,
                        remarks: ticket_sub_element.remarks,
                        ticket_number: ticket_sub_element.ticket_number,
                      };
                      passenger.ticketData.push(cancel_tickets_objects);
                    }
                  }
                }
              }
            }
          }
        }
      }

      if (this.pnrForm.value?.pnr_segment_board_points.length > 0) {
        this.pnrForm.value?.pnr_segment_board_points?.forEach((boardPoints: any) => {
          if (
            passenger?.pax_type + '-' + passenger?.reference_number ===
            boardPoints?.passenger_type + '-' + boardPoints?.passenger_number
          ) {
            //passenger.board_points?.push(boardPoints);
            if (boardPoints?.board_point !== boardPoints?.previous_board_point) {
              const board_point_data = {
                board_point: boardPoints.board_point?.code ? boardPoints.board_point?.code : boardPoints.board_point,
                last_leg: boardPoints.last_leg,
                passenger_number: boardPoints.passenger_number,
                passenger_type: boardPoints.passenger_type,
                //previous_board_point: boardPoints.previous_board_point?.code ? boardPoints.previous_board_point?.code : null,
                previous_board_point: boardPoints.previous_board_point?.code,
                segment_reference_number: boardPoints.segment_reference_number,
              };

              passenger.board_points?.push(board_point_data);
            }
          }
        });
      }
      if (this.pnrForm.value?.pnr_segment_off_points.length > 0) {
        this.pnrForm.value?.pnr_segment_off_points?.forEach((offPoints: any) => {
          if (
            passenger?.pax_type + '-' + passenger?.reference_number ===
            offPoints?.passenger_type + '-' + offPoints?.passenger_number
          ) {
            //passenger.off_points?.push(offPoints);
            if (offPoints?.off_point !== offPoints?.previous_off_point) {
              const offpoint_point_data = {
                last_leg: offPoints.last_leg,
                off_point: offPoints.off_point?.code ? offPoints.off_point?.code : offPoints.off_point,
                passenger_number: offPoints?.passenger_number,
                passenger_type: offPoints?.passenger_type,
                previous_off_point: offPoints.previous_off_point?.code,
                segment_reference_number: offPoints.segment_reference_number,
              };
              passenger.off_points?.push(offpoint_point_data);
            }
          }
        });
      }
      if (this.pnrForm.value?.pnr_segment_seats?.length > 0) {
        this.pnrForm.value?.pnr_segment_seats?.forEach((seat: any) => {
          if (
            passenger?.pax_type + '-' + passenger?.reference_number ===
            seat?.passenger_type + '-' + seat?.passenger_number
          ) {
            //passenger.seats?.push(seat);
            if (seat?.seat !== seat?.previous_seat) {
              const seats_data = {
                last_leg: seat?.last_leg,
                passenger_number: seat?.passenger_number,
                passenger_type: seat?.passenger_type,
                previous_seat: seat?.previous_seat,
                seat: seat?.seat,
                segment_reference_number: seat?.segment_reference_number,
              };
              passenger.seats?.push(seats_data);
            }
          }
        });
      }
      if (this.pnrForm.value?.pnr_segment_baggage?.length > 0) {
        this.pnrForm.value?.pnr_segment_baggage?.forEach((baggageData: any) => {
          if (
            passenger?.pax_type + '-' + passenger?.reference_number ===
            baggageData?.passenger_type + '-' + baggageData?.passenger_number
          ) {
            //passenger.baggage?.push(baggageData);
            if (baggageData?.baggage !== baggageData?.previous_baggage) {
              const baggage_data = {
                last_leg: baggageData?.last_leg,
                passenger_number: baggageData?.passenger_number,
                passenger_type: baggageData?.passenger_type,
                previous_baggage: baggageData?.previous_baggage,
                baggage: baggageData?.baggage,
                segment_reference_number: baggageData?.segment_reference_number,
              };
              passenger.baggage?.push(baggage_data);
            }
          }
        });
      }
      if (this.pnrForm.value?.pnr_segment_ssr?.length > 0) {
        this.pnrForm.value?.pnr_segment_ssr?.forEach((ssr: any) => {
          if (
            passenger?.pax_type + '-' + passenger?.reference_number ===
            ssr?.passenger_type + '-' + ssr?.passenger_number
          ) {
            //passenger.ssrs?.push(ssr);
            if (ssr?.ssr !== ssr?.previous_ssr) {
              const ssr_data = {
                last_leg: ssr?.last_leg,
                passenger_number: ssr?.passenger_number,
                passenger_type: ssr?.passenger_type,
                previous_ssr: ssr?.previous_ssr,
                ssr: ssr?.ssr,
                segment_reference_number: ssr?.segment_reference_number,
              };
              passenger.ssrs?.push(ssr_data);
            }
          }
        });
      }
      if (this.pnrForm.value?.pnr_segment_meals?.length > 0) {
        this.pnrForm.value?.pnr_segment_meals?.forEach((meal: any) => {
          if (
            passenger?.pax_type + '-' + passenger?.reference_number ===
            meal?.passenger_type + '-' + meal?.passenger_number
          ) {
            //passenger.meals?.push(meal);
            if (meal?.meal !== meal?.previous_meal) {
              const meal_data = {
                last_leg: meal?.last_leg,
                passenger_number: meal?.passenger_number,
                passenger_type: meal?.passenger_type,
                previous_meal: meal?.previous_meal,
                meal: meal?.meal,
                segment_reference_number: meal?.segment_reference_number,
              };
              passenger.meals?.push(meal_data);
            }
          }
        });
      }
      if (this.pnrForm.value?.pnr_segment_bassinet?.length > 0) {
        this.pnrForm.value?.pnr_segment_bassinet?.forEach((bassinetData: any) => {
          if (
            passenger?.pax_type + '-' + passenger?.reference_number ===
            bassinetData?.passenger_type + '-' + bassinetData?.passenger_number
          ) {
            //passenger.bassinet?.push(bassinetData);
            if (bassinetData?.bassinet !== bassinetData?.previous_bassinet) {
              const bassinet_data = {
                last_leg: bassinetData?.last_leg,
                passenger_number: bassinetData?.passenger_number,
                passenger_type: bassinetData?.passenger_type,
                previous_bassinet: bassinetData?.previous_bassinet,
                bassinet: bassinetData?.bassinet,
                segment_reference_number: bassinetData?.segment_reference_number,
              };

              passenger.bassinet?.push(bassinet_data);
            }
          }
        });
      }
      if (this.pnrForm.value?.pnr_segment_classes?.length > 0) {
        this.pnrForm.value?.pnr_segment_classes?.forEach((classData: any) => {
          if (
            passenger?.pax_type + '-' + passenger?.reference_number ===
            classData?.passenger_type + '-' + classData?.passenger_number
          ) {
            //passenger.classes?.push(classData);
            if (classData?.class !== classData?.previous_class) {
              const class_data = {
                last_leg: classData?.last_leg,
                passenger_number: classData?.passenger_number,
                passenger_type: classData?.passenger_type,
                previous_class: classData?.previous_class,
                class: classData?.class,
                segment_reference_number: classData?.segment_reference_number,
              };

              passenger.classes?.push(class_data);
            }
          }
        });
      }
      if (this.pnrForm.value?.pnr_segment_airlines?.length > 0) {
        this.pnrForm.value?.pnr_segment_airlines?.forEach((airlineData: any) => {
          if (
            passenger?.pax_type + '-' + passenger?.reference_number ===
            airlineData?.passenger_type + '-' + airlineData?.passenger_number
          ) {
            //passenger.airlines?.push(airlineData);
            if (airlineData?.airLine !== airlineData?.previous_airline) {
              const airline_data = {
                last_leg: airlineData?.last_leg,
                passenger_number: airlineData?.passenger_number,
                passenger_type: airlineData?.passenger_type,
                previous_airline: airlineData?.previous_airline?.shortCode2Digit,
                airline: airlineData?.airLine?.shortCode2Digit
                  ? airlineData?.airLine?.shortCode2Digit
                  : airlineData?.airLine,
                segment_reference_number: airlineData?.segment_reference_number,
              };
              passenger.airlines?.push(airline_data);
            }
          }
        });
      }
    });

    let saveArray: any = [];
    passengersData.passengers.forEach((val) => saveArray.push(Object.assign({}, val)));
    saveArray.forEach((element) => {
      delete element.first_name;
      delete element.previous_first_name;
      delete element.surname;
      delete element.previous_surname;
      delete element.dob;
      delete element.previous_dob;
      delete element.pax_type;
      delete element.reference_number;
      delete element.segment_count;
    });

    const passengers_data = {
      passengers: saveArray,
      pnr_info: this.pnr_data,
    };

    if (actionType === 'Modify') {
      if (
        saveArray[0]?.airlines?.length === 0 &&
        saveArray[0]?.baggage?.length === 0 &&
        saveArray[0]?.bassinet?.length === 0 &&
        saveArray[0]?.board_points?.length === 0 &&
        saveArray[0]?.classes?.length === 0 &&
        saveArray[0].dates?.length === 0 &&
        saveArray[0]?.meals?.length === 0 &&
        saveArray[0]?.off_points?.length === 0 &&
        saveArray[0]?.seats?.length === 0 &&
        saveArray[0]?.ssrs?.length === 0
      ) {
        //saveArray[0]?.ticketData?.length=== 0
        //console.log('if',saveArray);
        return this.toastrService.error('Please change the deatils and processed', 'Error');
      }
    }
    const saveData = {
      amendmentCreatedBy: this.authService.getLoginttuserId(),
      amendmentCreatedDate: this.todayDate1,
      amendmentCreatedDevice: this.deviceInfo?.userAgent,
      amendmentCreatedIp: null,
      amendmentDetails: JSON.stringify(passengers_data),
      amendmentExtraCost: 0,
      amendmentId: 7,
      amendmentName: 'MODIFY',
      amendmentPriority: 1,
      amendmentRemarks: null,
      amendmentSeverity: 1,
      amendmentStatus: 1,
      bookingId: this.decryptBooingId,
      productId: this.selectedProductNumber,
      serviceRequestId: Number(this.requestId),
    };

    this.amendmentsServices
      .createReissueRequest(saveData, AMENDMENTS_URL.reIssueRequest)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
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
            const bookingReferenceNumber = this.route.snapshot.queryParams.booking_reference;
            const from = this.route.snapshot.queryParams.from;
            const amendment_request_id = data?.id;
            this.router.routeReuseStrategy.shouldReuseRoute = () => false;
            this.router.onSameUrlNavigation = 'reload';
            this.router.navigate([`/dashboard/amendments/request/flight`], {
              queryParams: {
                product_id: productID,
                channel: channel,
                booking_id: booking_id,
                supplier_reference: supplier_reference,
                booking_reference: bookingReferenceNumber,
                request_Id: requestId,
                customer_name: customer_name,
                contact_name: contact_name,
                contactNumber: contactNumber,
                amendment_request_id: amendment_request_id,
                from: from,
              },
            });
            /*  this.router.navigate([`/dashboard/amendments/request/flight`], {
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
               amendment_request_id:amendment_request_id
             },
           }); */
            //this.reloadComponent();
            this.toastrService.success('The service request has been sent successfuly !', 'Success');
          }
        },
        (error) => {
          this.toastrService.error(error, 'Error');
        }
      );
  }

  applyAllPaxInfo() {
    let passengersModifyData: { all_pax_info_passengers: any[] };
    passengersModifyData = {
      all_pax_info_passengers: [...this.pnrForm.value.pnr_pax_data],
    };
    passengersModifyData?.all_pax_info_passengers?.forEach((add_passenger: any, index: number) => {
      add_passenger.nameChange = {};
      add_passenger.dates = [];
      add_passenger.board_points = [];
      add_passenger.off_points = [];
      add_passenger.seats = [];
      add_passenger.baggage = [];
      add_passenger.ssrs = [];
      add_passenger.meals = [];
      add_passenger.bassinet = [];
      add_passenger.classes = [];
      add_passenger.airlines = [];
      add_passenger.ticketData = [];
      add_passenger.segmentNumbers = [];

      if (this.pnrForm.value.pnr_segment_dates.length > 0) {
        this.pnrForm.value.pnr_segment_dates?.forEach((dates: any) => {
          if (
            add_passenger?.pax_type + '-' + add_passenger?.reference_number ===
            dates?.passenger_type + '-' + dates?.passenger_number
          ) {
            const nameChange = {
              firstname: add_passenger?.first_name,
              previous_first_name: add_passenger?.previous_first_name,
              surname: add_passenger?.surname,
              previous_surname: add_passenger?.previous_surname,
              dob: add_passenger?.dob,
              previous_dob: add_passenger?.previous_dob,
              pax_type: add_passenger?.pax_type,
              reference_number: add_passenger?.reference_number,
            };
            add_passenger.nameChange = nameChange;

            const dates__data = {
              depart_date: dates.depart_date,
              last_leg: dates.last_leg,
              passenger_number: dates.passenger_number,
              passenger_type: dates.passenger_type,
              previous_depart_date: dates.previous_depart_date,
              select_previous_depart_date: dates.select_previous_depart_date,
              segment_reference_number: dates.segment_reference_number,
            };
            add_passenger.dates.push(dates__data);
          }
        });
      }
      if (this.pnrForm.value?.pnr_segment_numbers?.length > 0) {
        this.pnrForm.value?.pnr_segment_numbers?.forEach((segmentno: any) => {
          if (
            add_passenger?.pax_type + '-' + add_passenger?.reference_number ===
            segmentno?.passenger_type + '-' + segmentno?.passenger_number
          ) {
            add_passenger.segmentNumbers?.push(segmentno);
          }
        });
      }
      if (this.pnrForm.value?.pnr_segment_board_points.length > 0) {
        this.pnrForm.value?.pnr_segment_board_points?.forEach((boardPoints: any, boardIndex: number) => {
          if (
            add_passenger?.pax_type + '-' + add_passenger?.reference_number ===
            boardPoints?.passenger_type + '-' + boardPoints?.passenger_number
          ) {
            //passenger.board_points?.push(boardPoints);

            const board_point_data = {
              board_point: boardPoints.board_point?.code ? boardPoints.board_point?.code : boardPoints.board_point,
              last_leg: boardPoints.last_leg,
              passenger_number: boardPoints.passenger_number,
              passenger_type: boardPoints.passenger_type,
              previous_board_point: boardPoints.previous_board_point?.code,
              select_previous_board_point: boardPoints.select_previous_board_point?.code,
              segment_reference_number: boardPoints.segment_reference_number,
            };

            add_passenger.board_points?.push(board_point_data);
          }
        });
      }
      if (this.pnrForm.value?.pnr_segment_off_points.length > 0) {
        this.pnrForm.value?.pnr_segment_off_points?.forEach((offPoints: any) => {
          if (
            add_passenger?.pax_type + '-' + add_passenger?.reference_number ===
            offPoints?.passenger_type + '-' + offPoints?.passenger_number
          ) {
            //passenger.off_points?.push(offPoints);

            const offpoint_point_data = {
              last_leg: offPoints.last_leg,
              off_point: offPoints.off_point?.code ? offPoints.off_point?.code : offPoints.off_point,
              passenger_number: offPoints?.passenger_number,
              passenger_type: offPoints?.passenger_type,
              previous_off_point: offPoints.previous_off_point?.code,
              select_previous_off_point: offPoints.select_previous_off_point?.code,
              segment_reference_number: offPoints.segment_reference_number,
            };
            add_passenger.off_points?.push(offpoint_point_data);
          }
        });
      }
      if (this.pnrForm.value?.pnr_segment_seats?.length > 0) {
        this.pnrForm.value?.pnr_segment_seats?.forEach((seat: any) => {
          if (
            add_passenger?.pax_type + '-' + add_passenger?.reference_number ===
            seat?.passenger_type + '-' + seat?.passenger_number
          ) {
            //passenger.seats?.push(seat);

            const seats_data = {
              last_leg: seat?.last_leg,
              passenger_number: seat?.passenger_number,
              passenger_type: seat?.passenger_type,
              previous_seat: seat?.previous_seat,
              select_previous_seat: seat?.select_previous_seat,
              seat: seat?.seat,
              segment_reference_number: seat?.segment_reference_number,
            };
            add_passenger.seats?.push(seats_data);
          }
        });
      }
      if (this.pnrForm.value?.pnr_segment_baggage?.length > 0) {
        this.pnrForm.value?.pnr_segment_baggage?.forEach((baggageData: any) => {
          if (
            add_passenger?.pax_type + '-' + add_passenger?.reference_number ===
            baggageData?.passenger_type + '-' + baggageData?.passenger_number
          ) {
            //passenger.baggage?.push(baggageData);

            const baggage_data = {
              last_leg: baggageData?.last_leg,
              passenger_number: baggageData?.passenger_number,
              passenger_type: baggageData?.passenger_type,
              previous_baggage: baggageData?.previous_baggage,
              select_previous_baggage: baggageData?.select_previous_baggage,
              baggage: baggageData?.baggage,
              segment_reference_number: baggageData?.segment_reference_number,
            };
            add_passenger.baggage?.push(baggage_data);
          }
        });
      }
      if (this.pnrForm.value?.pnr_segment_ssr?.length > 0) {
        this.pnrForm.value?.pnr_segment_ssr?.forEach((ssr: any) => {
          if (
            add_passenger?.pax_type + '-' + add_passenger?.reference_number ===
            ssr?.passenger_type + '-' + ssr?.passenger_number
          ) {
            //passenger.ssrs?.push(ssr);

            const ssr_data = {
              last_leg: ssr?.last_leg,
              passenger_number: ssr?.passenger_number,
              passenger_type: ssr?.passenger_type,
              previous_ssr: ssr?.previous_ssr,
              select_previous_ssr: ssr?.select_previous_ssr,
              ssr: ssr?.ssr,
              segment_reference_number: ssr?.segment_reference_number,
            };
            add_passenger.ssrs?.push(ssr_data);
          }
        });
      }
      if (this.pnrForm.value?.pnr_segment_meals?.length > 0) {
        this.pnrForm.value?.pnr_segment_meals?.forEach((meal: any) => {
          if (
            add_passenger?.pax_type + '-' + add_passenger?.reference_number ===
            meal?.passenger_type + '-' + meal?.passenger_number
          ) {
            //passenger.meals?.push(meal);

            const meal_data = {
              last_leg: meal?.last_leg,
              passenger_number: meal?.passenger_number,
              passenger_type: meal?.passenger_type,
              previous_meal: meal?.previous_meal,
              select_previous_meal: meal?.select_previous_meal,
              meal: meal?.meal,
              segment_reference_number: meal?.segment_reference_number,
            };
            add_passenger?.meals?.push(meal_data);
          }
        });
      }
      if (this.pnrForm.value?.pnr_segment_bassinet?.length > 0) {
        this.pnrForm.value?.pnr_segment_bassinet?.forEach((bassinetData: any) => {
          if (
            add_passenger?.pax_type + '-' + add_passenger?.reference_number ===
            bassinetData?.passenger_type + '-' + bassinetData?.passenger_number
          ) {
            //passenger.bassinet?.push(bassinetData);

            const bassinet_data = {
              last_leg: bassinetData?.last_leg,
              passenger_number: bassinetData?.passenger_number,
              passenger_type: bassinetData?.passenger_type,
              previous_bassinet: bassinetData?.previous_bassinet,
              select_previous_bassinet: bassinetData?.select_previous_bassinet,
              bassinet: bassinetData?.bassinet,
              segment_reference_number: bassinetData?.segment_reference_number,
            };
            add_passenger?.bassinet?.push(bassinet_data);
          }
        });
      }
      if (this.pnrForm.value?.pnr_segment_classes?.length > 0) {
        this.pnrForm.value?.pnr_segment_classes?.forEach((classData: any) => {
          if (
            add_passenger?.pax_type + '-' + add_passenger?.reference_number ===
            classData?.passenger_type + '-' + classData?.passenger_number
          ) {
            //passenger.classes?.push(classData);

            const class_data = {
              last_leg: classData?.last_leg,
              passenger_number: classData?.passenger_number,
              passenger_type: classData?.passenger_type,
              previous_class: classData?.previous_class,
              select_previous_class: classData?.select_previous_class,
              class: classData?.class,
              segment_reference_number: classData?.segment_reference_number,
            };
            add_passenger.classes?.push(class_data);
          }
        });
      }
      if (this.pnrForm.value?.pnr_segment_airlines?.length > 0) {
        this.pnrForm.value?.pnr_segment_airlines?.forEach((airlineData: any) => {
          if (
            add_passenger?.pax_type + '-' + add_passenger?.reference_number ===
            airlineData?.passenger_type + '-' + airlineData?.passenger_number
          ) {
            //passenger.airlines?.push(airlineData);

            const airline_data = {
              last_leg: airlineData?.last_leg,
              passenger_number: airlineData?.passenger_number,
              passenger_type: airlineData?.passenger_type,
              previous_airline: airlineData?.previous_airline?.shortCode2Digit,
              select_previous_airline: airlineData?.select_previous_airline?.shortCode2Digit,
              airline: airlineData?.airLine?.shortCode2Digit
                ? airlineData?.airLine?.shortCode2Digit
                : airlineData?.airLine,
              segment_reference_number: airlineData?.segment_reference_number,
            };
            add_passenger.airlines?.push(airline_data);
          }
        });
      }
    });

    let saveModifyArray: any = [];
    passengersModifyData.all_pax_info_passengers.forEach((val) => saveModifyArray.push(Object.assign({}, val)));
    saveModifyArray.forEach((element) => {
      delete element.first_name;
      delete element.previous_first_name;
      delete element.surname;
      delete element.previous_surname;
      delete element.dob;
      delete element.previous_dob;
      delete element.pax_type;
      delete element.reference_number;
      delete element.segment_count;
    });
    if (saveModifyArray?.length > 0) {
      for (let convertArrayIndex = 0; convertArrayIndex < saveModifyArray?.length; convertArrayIndex++) {
        const pnr_info_element = saveModifyArray[convertArrayIndex];
        if (pnr_info_element?.dates?.length > 0) {
          for (let dateIndex = 0; dateIndex < pnr_info_element?.dates?.length; dateIndex++) {
            const pnr_DateElement = pnr_info_element?.dates[dateIndex];
            if (pnr_DateElement.depart_date !== pnr_DateElement.select_previous_depart_date) {
              if (pnr_info_element.segmentNumbers?.length > 0) {
                for (let segmentindex = 0; segmentindex < pnr_info_element.segmentNumbers?.length; segmentindex++) {
                  const segment_no_element = pnr_info_element.segmentNumbers[segmentindex];
                  if (segment_no_element?.segment_reference_number === pnr_DateElement?.segment_reference_number) {
                    if (this.pnrForm.value.pnr_segment_dates.length > 0) {
                      for (
                        let dates_modify_index = 0;
                        dates_modify_index < this.pnrForm.value.pnr_segment_dates.length;
                        dates_modify_index++
                      ) {
                        const pax_dates_element = this.pnrForm.value.pnr_segment_dates[dates_modify_index];
                        if (pax_dates_element?.segment_reference_number === pnr_DateElement?.segment_reference_number) {
                          (
                            (this.pnrForm.get('pnr_segment_dates') as FormArray).at(dates_modify_index) as FormGroup
                          ).patchValue({
                            depart_date: this.datepipe.transform(pnr_DateElement?.depart_date, 'yyyy-MM-dd'),
                            previous_depart_date: this.datepipe.transform(
                              pax_dates_element.previous_depart_date,
                              'yyyy-MM-dd'
                            ),
                            select_previous_depart_date: this.datepipe.transform(
                              pnr_DateElement?.depart_date,
                              'yyyy-MM-dd'
                            ),
                            last_leg: pax_dates_element.last_leg,
                            passenger_number: pax_dates_element.passenger_number,
                            passenger_type: pax_dates_element.passenger_type,
                            segment_reference_number: pax_dates_element.segment_reference_number,
                          });
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        if (pnr_info_element?.board_points?.length > 0) {
          for (
            let board_points_index = 0;
            board_points_index < pnr_info_element?.board_points?.length;
            board_points_index++
          ) {
            const pnr_board_points_element = pnr_info_element?.board_points[board_points_index];
            /*  console.log('one 1',pnr_board_points_element.board_point);
             console.log('one 2',pnr_board_points_element.select_previous_board_point);
             console.log('one 3',pnr_board_points_element.board_point !== pnr_board_points_element.select_previous_board_point); */

            if (pnr_board_points_element.board_point !== pnr_board_points_element.select_previous_board_point) {
              const fromCode = {
                code: pnr_board_points_element?.board_point,
                city: null,
                cityCode: null,
                country: null,
                countryCode: null,
                createdBy: null,
                createdDate: null,
                id: null,
                name: null,
                status: null,
                timeZone: null,
                type: null,
                updatedBy: null,
                updatedDate: null,
              };
              if (pnr_info_element.segmentNumbers?.length > 0) {
                for (let segmentindex = 0; segmentindex < pnr_info_element.segmentNumbers?.length; segmentindex++) {
                  const segment_no_element = pnr_info_element.segmentNumbers[segmentindex];
                  /*  console.log('seg no 1',segment_no_element?.segment_reference_number);
                   console.log('seg no 2',pnr_board_points_element?.segment_reference_number);
                   console.log('seg no 3',segment_no_element?.segment_reference_number=== pnr_board_points_element?.segment_reference_number); */

                  if (
                    segment_no_element?.segment_reference_number === pnr_board_points_element?.segment_reference_number
                  ) {
                    if (this.pnrForm.value.pnr_segment_dates.length > 0) {
                      for (
                        let board_modify_index = 0;
                        board_modify_index < this.pnrForm.value.pnr_segment_board_points?.length;
                        board_modify_index++
                      ) {
                        const modify_board_element = this.pnrForm.value?.pnr_segment_board_points[board_modify_index];
                        if (
                          modify_board_element?.segment_reference_number ===
                          pnr_board_points_element?.segment_reference_number
                        ) {
                          (
                            (this.pnrForm.get('pnr_segment_board_points') as FormArray).at(
                              board_modify_index
                            ) as FormGroup
                          ).patchValue({
                            board_point: fromCode,
                            previous_board_point: modify_board_element?.previous_board_point,
                            select_previous_board_point: fromCode,
                            last_leg: modify_board_element.last_leg,
                            passenger_number: modify_board_element.passenger_number,
                            passenger_type: modify_board_element.passenger_type,
                            segment_reference_number: modify_board_element.segment_reference_number,
                          });
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        if (pnr_info_element?.off_points?.length > 0) {
          for (let off_points_index = 0; off_points_index < pnr_info_element?.off_points?.length; off_points_index++) {
            const pnr_off_points_element = pnr_info_element?.off_points[off_points_index];
            if (pnr_off_points_element.off_point !== pnr_off_points_element.select_previous_off_point) {
              const offpointCode = {
                code: pnr_off_points_element?.off_point,
                city: null,
                cityCode: null,
                country: null,
                countryCode: null,
                createdBy: null,
                createdDate: null,
                id: null,
                name: null,
                status: null,
                timeZone: null,
                type: null,
                updatedBy: null,
                updatedDate: null,
              };
              if (pnr_info_element.segmentNumbers?.length > 0) {
                for (let segmentindex = 0; segmentindex < pnr_info_element.segmentNumbers?.length; segmentindex++) {
                  const segment_no_element = pnr_info_element.segmentNumbers[segmentindex];
                  if (
                    segment_no_element?.segment_reference_number === pnr_off_points_element?.segment_reference_number
                  ) {
                    if (this.pnrForm.value.pnr_segment_off_points.length > 0) {
                      for (
                        let offpoint_modify_index = 0;
                        offpoint_modify_index < this.pnrForm.value.pnr_segment_off_points?.length;
                        offpoint_modify_index++
                      ) {
                        const modify_offpoint_element =
                          this.pnrForm.value?.pnr_segment_off_points[offpoint_modify_index];
                        if (
                          modify_offpoint_element?.segment_reference_number ===
                          pnr_off_points_element?.segment_reference_number
                        ) {
                          (
                            (this.pnrForm.get('pnr_segment_off_points') as FormArray).at(
                              offpoint_modify_index
                            ) as FormGroup
                          ).patchValue({
                            off_point: offpointCode,
                            previous_off_point: modify_offpoint_element?.previous_off_point,
                            select_previous_off_point: offpointCode,
                            last_leg: modify_offpoint_element.last_leg,
                            passenger_number: modify_offpoint_element.passenger_number,
                            passenger_type: modify_offpoint_element.passenger_type,
                            segment_reference_number: modify_offpoint_element.segment_reference_number,
                          });
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        if (pnr_info_element?.seats?.length > 0) {
          for (let seats_index = 0; seats_index < pnr_info_element?.seats?.length; seats_index++) {
            const pnr_seats_element = pnr_info_element?.seats[seats_index];
            if (pnr_seats_element.seat !== pnr_seats_element.select_previous_seat) {
              if (pnr_info_element.segmentNumbers?.length > 0) {
                for (let segmentindex = 0; segmentindex < pnr_info_element.segmentNumbers?.length; segmentindex++) {
                  const segment_no_element = pnr_info_element.segmentNumbers[segmentindex];
                  if (segment_no_element?.segment_reference_number === pnr_seats_element?.segment_reference_number) {
                    if (this.pnrForm.value.pnr_segment_seats.length > 0) {
                      for (
                        let seats_modify_index = 0;
                        seats_modify_index < this.pnrForm.value.pnr_segment_seats?.length;
                        seats_modify_index++
                      ) {
                        const modify_seats_element = this.pnrForm.value?.pnr_segment_seats[seats_modify_index];
                        if (
                          modify_seats_element?.segment_reference_number === pnr_seats_element?.segment_reference_number
                        ) {
                          (
                            (this.pnrForm.get('pnr_segment_seats') as FormArray).at(seats_modify_index) as FormGroup
                          ).patchValue({
                            seat: pnr_seats_element?.seat,
                            previous_seat: modify_seats_element?.previous_seat,
                            select_previous_seat: pnr_seats_element?.seat,
                            last_leg: modify_seats_element.last_leg,
                            passenger_number: modify_seats_element.passenger_number,
                            passenger_type: modify_seats_element.passenger_type,
                            segment_reference_number: modify_seats_element.segment_reference_number,
                          });
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        if (pnr_info_element?.baggage?.length > 0) {
          for (let baggage_index = 0; baggage_index < pnr_info_element?.baggage?.length; baggage_index++) {
            const pnr_baggage_element = pnr_info_element?.baggage[baggage_index];
            if (pnr_baggage_element.baggage !== pnr_baggage_element.select_previous_baggage) {
              if (pnr_info_element.segmentNumbers?.length > 0) {
                for (let segmentindex = 0; segmentindex < pnr_info_element.segmentNumbers?.length; segmentindex++) {
                  const segment_no_element = pnr_info_element.segmentNumbers[segmentindex];
                  if (segment_no_element?.segment_reference_number === pnr_baggage_element?.segment_reference_number) {
                    if (this.pnrForm.value.pnr_segment_baggage?.length > 0) {
                      for (
                        let baggage_modify_index = 0;
                        baggage_modify_index < this.pnrForm.value.pnr_segment_baggage?.length;
                        baggage_modify_index++
                      ) {
                        const modify_baggage_element = this.pnrForm.value?.pnr_segment_baggage[baggage_modify_index];
                        if (
                          modify_baggage_element?.segment_reference_number ===
                          pnr_baggage_element?.segment_reference_number
                        ) {
                          (
                            (this.pnrForm.get('pnr_segment_baggage') as FormArray).at(baggage_modify_index) as FormGroup
                          ).patchValue({
                            baggage: pnr_baggage_element?.baggage,
                            previous_baggage: modify_baggage_element?.previous_baggage,
                            select_previous_baggage: pnr_baggage_element?.baggage,
                            last_leg: modify_baggage_element.last_leg,
                            passenger_number: modify_baggage_element.passenger_number,
                            passenger_type: modify_baggage_element.passenger_type,
                            segment_reference_number: modify_baggage_element.segment_reference_number,
                          });
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        if (pnr_info_element?.ssrs?.length > 0) {
          for (let ssr_index = 0; ssr_index < pnr_info_element?.ssrs?.length; ssr_index++) {
            const pnr_ssr_element = pnr_info_element?.ssrs[ssr_index];
            if (pnr_ssr_element.ssr !== pnr_ssr_element.select_previous_ssr) {
              if (pnr_info_element.segmentNumbers?.length > 0) {
                for (let segmentindex = 0; segmentindex < pnr_info_element.segmentNumbers?.length; segmentindex++) {
                  const segment_no_element = pnr_info_element.segmentNumbers[segmentindex];
                  if (segment_no_element?.segment_reference_number === pnr_ssr_element?.segment_reference_number) {
                    if (this.pnrForm.value.pnr_segment_ssr?.length > 0) {
                      for (
                        let ssr_modify_index = 0;
                        ssr_modify_index < this.pnrForm.value.pnr_segment_ssr?.length;
                        ssr_modify_index++
                      ) {
                        const modify_ssr_element = this.pnrForm.value?.pnr_segment_ssr[ssr_modify_index];
                        if (
                          modify_ssr_element?.segment_reference_number === pnr_ssr_element?.segment_reference_number
                        ) {
                          (
                            (this.pnrForm.get('pnr_segment_ssr') as FormArray).at(ssr_modify_index) as FormGroup
                          ).patchValue({
                            ssr: pnr_ssr_element?.ssr,
                            previous_ssr: modify_ssr_element?.previous_ssr,
                            select_previous_ssr: pnr_ssr_element?.ssr,
                            last_leg: modify_ssr_element.last_leg,
                            passenger_number: modify_ssr_element.passenger_number,
                            passenger_type: modify_ssr_element.passenger_type,
                            segment_reference_number: modify_ssr_element.segment_reference_number,
                          });
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        if (pnr_info_element?.meals?.length > 0) {
          for (let meals_index = 0; meals_index < pnr_info_element?.meals?.length; meals_index++) {
            const pnr_meals_element = pnr_info_element?.meals[meals_index];
            if (pnr_meals_element.meal !== pnr_meals_element.select_previous_meal) {
              if (pnr_info_element.segmentNumbers?.length > 0) {
                for (let segmentindex = 0; segmentindex < pnr_info_element.segmentNumbers?.length; segmentindex++) {
                  const segment_no_element = pnr_info_element.segmentNumbers[segmentindex];
                  if (segment_no_element?.segment_reference_number === pnr_meals_element?.segment_reference_number) {
                    if (this.pnrForm.value.pnr_segment_meals?.length > 0) {
                      for (
                        let meal_modify_index = 0;
                        meal_modify_index < this.pnrForm.value.pnr_segment_meals?.length;
                        meal_modify_index++
                      ) {
                        const modify_meals_element = this.pnrForm.value?.pnr_segment_meals[meal_modify_index];
                        if (
                          modify_meals_element?.segment_reference_number === pnr_meals_element?.segment_reference_number
                        ) {
                          (
                            (this.pnrForm.get('pnr_segment_meals') as FormArray).at(meal_modify_index) as FormGroup
                          ).patchValue({
                            meal: pnr_meals_element?.meal,
                            previous_meal: modify_meals_element?.previous_meal,
                            select_previous_meal: pnr_meals_element?.meal,
                            last_leg: modify_meals_element.last_leg,
                            passenger_number: modify_meals_element.passenger_number,
                            passenger_type: modify_meals_element.passenger_type,
                            segment_reference_number: modify_meals_element.segment_reference_number,
                          });
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        if (pnr_info_element?.bassinet?.length > 0) {
          for (let bassinet_index = 0; bassinet_index < pnr_info_element?.bassinet?.length; bassinet_index++) {
            const pnr_bassinet_element = pnr_info_element?.bassinet[bassinet_index];
            if (pnr_bassinet_element.bassinet !== pnr_bassinet_element.select_previous_bassinet) {
              if (pnr_info_element.segmentNumbers?.length > 0) {
                for (let segmentindex = 0; segmentindex < pnr_info_element.segmentNumbers?.length; segmentindex++) {
                  const segment_no_element = pnr_info_element.segmentNumbers[segmentindex];
                  if (segment_no_element?.segment_reference_number === pnr_bassinet_element?.segment_reference_number) {
                    if (this.pnrForm.value.pnr_segment_bassinet?.length > 0) {
                      for (
                        let bassinet_modify_index = 0;
                        bassinet_modify_index < this.pnrForm.value.pnr_segment_bassinet?.length;
                        bassinet_modify_index++
                      ) {
                        const modify_bassinet_element = this.pnrForm.value?.pnr_segment_bassinet[bassinet_modify_index];
                        if (
                          modify_bassinet_element?.segment_reference_number ===
                          pnr_bassinet_element?.segment_reference_number
                        ) {
                          (
                            (this.pnrForm.get('pnr_segment_bassinet') as FormArray).at(
                              bassinet_modify_index
                            ) as FormGroup
                          ).patchValue({
                            bassinet: pnr_bassinet_element?.bassinet,
                            previous_bassinet: modify_bassinet_element?.previous_bassinet,
                            select_previous_bassinet: pnr_bassinet_element?.bassinet,
                            last_leg: modify_bassinet_element.last_leg,
                            passenger_number: modify_bassinet_element.passenger_number,
                            passenger_type: modify_bassinet_element.passenger_type,
                            segment_reference_number: modify_bassinet_element.segment_reference_number,
                          });
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        if (pnr_info_element?.classes?.length > 0) {
          for (let classe_index = 0; classe_index < pnr_info_element?.classes?.length; classe_index++) {
            const pnr_class_element = pnr_info_element?.classes[classe_index];
            if (pnr_class_element.class !== pnr_class_element.select_previous_class) {
              if (pnr_info_element.segmentNumbers?.length > 0) {
                for (let segmentindex = 0; segmentindex < pnr_info_element.segmentNumbers?.length; segmentindex++) {
                  const segment_no_element = pnr_info_element.segmentNumbers[segmentindex];
                  if (segment_no_element?.segment_reference_number === pnr_class_element?.segment_reference_number) {
                    if (this.pnrForm.value.pnr_segment_classes?.length > 0) {
                      for (
                        let class_modify_index = 0;
                        class_modify_index < this.pnrForm.value.pnr_segment_classes?.length;
                        class_modify_index++
                      ) {
                        const modify_class_element = this.pnrForm.value?.pnr_segment_classes[class_modify_index];
                        if (
                          modify_class_element?.segment_reference_number === pnr_class_element?.segment_reference_number
                        ) {
                          (
                            (this.pnrForm.get('pnr_segment_classes') as FormArray).at(class_modify_index) as FormGroup
                          ).patchValue({
                            class: pnr_class_element?.class,
                            previous_class: modify_class_element?.previous_class,
                            select_previous_class: pnr_class_element?.class,
                            last_leg: modify_class_element.last_leg,
                            passenger_number: modify_class_element.passenger_number,
                            passenger_type: modify_class_element.passenger_type,
                            segment_reference_number: modify_class_element.segment_reference_number,
                          });
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        if (pnr_info_element?.airlines?.length > 0) {
          for (let airlines_index = 0; airlines_index < pnr_info_element?.airlines?.length; airlines_index++) {
            const pnr_airline_element = pnr_info_element?.airlines[airlines_index];
            if (pnr_airline_element.airline !== pnr_airline_element.select_previous_airline) {
              const airLineCode = {
                airLineType: null,
                code: null,
                createdBy: null,
                createdDate: null,
                id: null,
                name: null,
                parentAirline: null,
                shortCode2Digit: pnr_airline_element?.airline,
                shortCode3Digit: null,
                status: null,
                udatedBy: null,
                updatedDate: null,
              };

              if (pnr_info_element.segmentNumbers?.length > 0) {
                for (let segmentindex = 0; segmentindex < pnr_info_element.segmentNumbers?.length; segmentindex++) {
                  const segment_no_element = pnr_info_element.segmentNumbers[segmentindex];
                  if (segment_no_element?.segment_reference_number === pnr_airline_element?.segment_reference_number) {
                    if (this.pnrForm.value.pnr_segment_airlines.length > 0) {
                      for (
                        let airline_modify_index = 0;
                        airline_modify_index < this.pnrForm.value.pnr_segment_airlines?.length;
                        airline_modify_index++
                      ) {
                        const modify_airline_element = this.pnrForm.value?.pnr_segment_airlines[airline_modify_index];
                        if (
                          modify_airline_element?.segment_reference_number ===
                          pnr_airline_element?.segment_reference_number
                        ) {
                          (
                            (this.pnrForm.get('pnr_segment_airlines') as FormArray).at(
                              airline_modify_index
                            ) as FormGroup
                          ).patchValue({
                            airLine: airLineCode,
                            previous_airline: modify_airline_element?.previous_airline,
                            select_previous_airline: airLineCode,
                            last_leg: modify_airline_element.last_leg,
                            passenger_number: modify_airline_element.passenger_number,
                            passenger_type: modify_airline_element.passenger_type,
                            segment_reference_number: modify_airline_element.segment_reference_number,
                          });
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  getCheckListData(requestId: any, amendment_request_id: any) {
    const checklist_params = {
      amendment_request_id: Number(amendment_request_id),
      service_request_id: Number(requestId),
    };
    this.amendmentsServices
      .getAmendmentsForChecklist(checklist_params, AMENDMENTS_URL.checkList)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (res: any) => {
          const result: CHECK_LIST_APIRESPONSE = res;
          if (result.status == true) {
            this.flightCheckList = result.check_list;

            this.generateCheckListButton = false;
            this.cdr.markForCheck();
          }
        },
        (error) => {
          this.toastrService.error(error, 'Error');
        }
      );
  }


  trackByFn(index, item) {
    return index;
  }
  ngOnInit(): void {
    this.initalizePnrForm();
    this.getMasterClass();
    this.getMealsData();
    this.epicFunction();
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param && param.booking_id) {
        this.decryptBooingId = Number(atob(unescape(param.booking_id)));
      }
      if (param && param.product_id) {
        this.selectedProductNumber = Number(param.product_id);
      }
      if (param && param.request_Id) {
        this.requestId = param.request_Id;
      }
      if (param && param.supplier_reference) {
        const supplierData = {
          supplier_reference: param.supplier_reference,
          //supplier_reference:'WGIYLV'
        };
        this.getPnrData(supplierData);
      }
      if (param && param.amendment_request_id) {
        this.amendment_request_id = param.amendment_request_id;
        this.modifyButtonDisabled = false;
        this.generateCheckListButton = true;
      }
    });
  }
  ngOnDestroy(): void {
    this.ngDestroy$.next();
    this.ngDestroy$.complete();
  }
}
