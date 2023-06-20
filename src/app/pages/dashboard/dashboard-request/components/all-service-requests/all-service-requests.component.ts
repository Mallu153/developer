import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DashboardRequestService } from '../../services/dashboard-request.service';
import * as apiUrls from '../../../dashboard-request/url-constants/url-constants';
import { NgbModal, NgbNavChangeEvent, NgbTypeahead, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of, OperatorFunction, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError, takeUntil } from 'rxjs/operators';
import { MasterDataService } from 'app/shared/services/master-data.service';
import { AirportSearchResponse } from 'app/shared/models/airport-search-response';
import { Customer } from 'app/shared/models/customer-apiresponse';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Products } from '../../model/products-data';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { PERMISSION_KEYS } from 'app/shared/data/app-premission-key';
import { AuthService } from 'app/shared/auth/auth.service';



@Component({
  selector: 'app-all-service-requests',
  templateUrl: './all-service-requests.component.html',
  styleUrls: ['./all-service-requests.component.scss','../../../../../../assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class AllServiceRequestsComponent implements OnInit, OnDestroy {
  allSrRequestApiResponse: Products[];
  ngDestroy$ = new Subject();
  //date
  todayDate = new Date();
  todayDate1: string;
  srListSearchForm: FormGroup;
  submitted = false;
  //Global variables to display whether is loading or failed to load the data
  noResults: boolean;
  searchTerm: string;
  customerId: any;
  contactList: any[];
  masterClassList: any[] = [];
  //ngb search
  searchResult: any[];
  searchHotelResult: any;
  formatter = (customer: Customer) => customer?.BusinessName;
  flightfromformatter = (airport: AirportSearchResponse) => airport.code;

  hotelformatter = (airport: AirportSearchResponse) => airport?.name;
  @ViewChild('typeaheadInstance') typeaheadInstance: NgbTypeahead;
  //flight setup
  public isflightCollapsed = false;
  public ishotelCollapsed = false;
  activetab = '';
  currentOrientation = 'horizontal';
  tabsdisable = false;


  public ColumnMode = ColumnMode;
  // row data
  public rows :Products[] = [];
  public columns = [
    { name: "Request ID", prop: "serviceRequestNumber" },
    { name: "Product", prop: "product" },
    { name: "Customer Name", prop: "businessName" },
    { name: "Contact Name", prop: "contactName" },
    { name: "Origin/ Destination", prop: "originDestinationLocation" },
    { name: " Date of Journey / Check In", prop: "dateOfJourneyCheckIn" },
    { name: " Class / No Of Nights / ATT Count", prop: "classDays" },
    { name: "Created Date", prop: "serviceRequestDate" },
    { name: " Pax / Room Persons", prop: "paxCount" }
  ];
  @ViewChild('tableRowDetails') tableRowDetails: any;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  public limitRef = 10;

  loading:boolean=false;
  keys=[];
  userDetails:any;
  customerInputKey=PERMISSION_KEYS.REQUEST.CREATE_REQUEST_LIST_CUSTOMER_INPUT;
  contactInputKey=PERMISSION_KEYS.REQUEST.CREATE_REQUEST_LIST_CUSTOMER_INPUT;
  constructor(
    private router: Router,
    private titleService: Title,
    private fb: FormBuilder,
    private datepipe: DatePipe,
    private toastrService: ToastrService,
    private dashboardRequestService: DashboardRequestService,
    public masterDataService: MasterDataService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,

  ) {
    this.titleService.setTitle('Service Requests List');
    this.todayDate1 = this.datepipe.transform(this.todayDate, 'yyyy-MM-dd');
  }

  ngOnInit(): void {
    this.keys = this.authService.getPageKeys();
    this.userDetails=this.authService.getUserDetails();
    this.initializeForm();
    this.onChangeCustomer('');
    this.getMasterClass();
    //default list
    if(this.userDetails&&!this.keys?.includes(this.customerInputKey)&& !this.keys?.includes(this.contactInputKey)){
      const onSerarch = {
        businessId:  this.userDetails?.bizId,
        contactId: this.userDetails?.contactId,
        fromServiceRequestDate: this.todayDate1,
      };
      this.customerId=this.userDetails?.bizId;
      this.srListSearchForm.get('requestor').enable();
      this.srListSearchForm.patchValue({
        customer: this.userDetails?.bizId,
        requestor: this.userDetails?.contactId,
        fromServiceRequestDate: this.todayDate1,
      });
      this.dynamicParamsList(onSerarch);
    }else  {
      this.loading=true;
      const Data = {
        fromServiceRequestDate: this.todayDate1,

      };
      this.dynamicParamsList(Data);
    }



  }
  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
  /**Find By Request Id Passing the corporate form */
  findByRequestId(selectedRowData) {
    const requestId = selectedRowData?.requestId;
    let LineId = '';
    if (selectedRowData?.requestLineIds) {
      LineId = selectedRowData?.requestLineIds;
    } else {
      this.toastrService.info('Service Request Lines is not Found Here', 'Info');
      return;
    }
    this.router.navigate(['/dashboard/booking/flight'], {
      queryParams: { requestId: requestId, srLineId: LineId },
    });
  }
  /*  getLinesBySrRequest(requestHeaderId) {
    const requestId = requestHeaderId?.serviceRequestNumber;
    const contactid = requestHeaderId?.contactId;
    const product = requestHeaderId?.product;
    this.router.navigate(['/dashboard/request/get-lines-by-sr-request'],
      { queryParams: { requestHeaderId: requestId, contactId: contactid,product:product } });
  } */
  /**Find By Request Id Passing the corporate form */
  getLinesBySrRequest(requestHeaderId) {

    if (requestHeaderId.product === 'Flight') {
      this.router.navigate(['/dashboard/booking/flight'], {
        queryParams: {
          requestId: requestHeaderId?.serviceRequestNumber,
          contactId: requestHeaderId?.contactId,
          srLineId: requestHeaderId?.serviceRequestLine,
        },
      });

    } else if (requestHeaderId.product === 'Hotel') {
      this.router.navigate(['/dashboard/booking/hotel'], {
        queryParams: {
          requestId: requestHeaderId?.serviceRequestNumber,
          contactId: requestHeaderId?.contactId,
          hotelLineId: requestHeaderId?.serviceRequestLine,
        },
      });
    } else if (requestHeaderId.product ===  'Ancillary') {
      this.router.navigate(['/dashboard/booking/ancillary'], {
        queryParams: {
          requestId: requestHeaderId.serviceRequestNumber,
          contactId: requestHeaderId.contactId,
          serviceTypeId: btoa(escape(requestHeaderId.typeId)),
          anxLineId: requestHeaderId.serviceRequestLine,
        },
      });
    } else if (requestHeaderId.product ===  'Package') {
      this.router.navigate(['/dashboard/booking/holidays'], {
        queryParams: {
          requestId: requestHeaderId.serviceRequestNumber,
          contactId: requestHeaderId.contactId,
          holidaysLineId:requestHeaderId?.serviceRequestLine

        },
      });
    }  else if (requestHeaderId.product ===  'Attractions') {
      this.router.navigate(['/dashboard/booking/activities'], {
        queryParams: {
          requestId: requestHeaderId.serviceRequestNumber,
          contactId: requestHeaderId.contactId,
          activitiesLineId:requestHeaderId?.serviceRequestLine
        },
      });
    } else {
      this.toastrService.info('no redirect url found', 'Info');
    }
  }

  initializeForm() {
    this.srListSearchForm = this.fb.group({
      requestId: '',
      customer: '',
      requestor: '',
      //createdDate: '',
      fromCreatedDate: this.todayDate1,
      toCreatedDate: '',
      from: '',
      to: '',
      depatureDateFrom: '',
      depatureDateTo: '',
      tripType: '',
      class: '',
      lineLocation: '',
      checkInDateFrom: '',
      checkInDateTo: '',
    });
  }

  get f() {
    return this.srListSearchForm.controls;
  }
  checkStartDateAndEndDate(startDate, enddate): boolean {
    if (startDate && enddate) {
      if (startDate != null && enddate != null && enddate < startDate) {
        this.toastrService.error('To Created Date should be greater than  From Created Date', 'Error');
        return false;
      } else {
        return true;
      }
    }
    return false;
  }

  OnSubmit() {
    this.submitted = true;
    let searchObj = {};

    if (this.srListSearchForm.valid) {
      /*  if (this.srListSearchForm.value.fromCreatedDate && this.srListSearchForm.value.toCreatedDate) {
         const data: boolean = this.checkStartDateAndEndDate(this.srListSearchForm.value.fromCreatedDate, this.srListSearchForm.value.toCreatedDate);
         if (!data) {
           return;
         }
       } */
      const requestId = Number(this.srListSearchForm.value.requestId);
      const customerId = this.customerId;
      const contactId = Number(this.srListSearchForm.value.requestor);
      //const createdDate = this.srListSearchForm.value.createdDate;
      const fromCreatedDate = this.srListSearchForm.value.fromCreatedDate;
      const toCreatedDate = this.srListSearchForm.value.toCreatedDate;

      if (requestId) {
        searchObj['serviceRequestNumber'] = requestId;
      }
      if (customerId) {
        searchObj['businessId'] = customerId;
      }
      if (contactId) {
        searchObj['contactId'] = contactId;
      }
      /*  if (createdDate) {
         searchObj['createdDate'] = createdDate;
       } */
      if (fromCreatedDate) {
        searchObj['fromServiceRequestDate'] = fromCreatedDate;
      }
      if (toCreatedDate) {
        if (fromCreatedDate && toCreatedDate) {
          const data: boolean = this.checkStartDateAndEndDate(fromCreatedDate, toCreatedDate);
          if (!data) {
            return;
          }
        }
        searchObj['toServiceRequestDate'] = toCreatedDate;
      }
      if (Object.keys(searchObj)?.length === 0) {
        this.loading=false;
        this.toastrService.error('Please give any of field and search', 'Error');
      } else {
        this.loading=true;
        this.dynamicParamsList(searchObj);
      }
    } else {
      this.toastrService.error('Please give any of field and search', 'Error');
    }
  }

  dynamicParamsList(searchinput) {
    this.dashboardRequestService
      .getAllServiceRequestSearch(searchinput, apiUrls.srsearchList_url.srsearchList)
      .pipe(takeUntil(this.ngDestroy$)).subscribe(
        (data: any) => {
          if (data.length === 0) {
            this.toastrService.info(`no data found given search criteria`, 'Info');
            this.rows = [];
            this.loading=false;
            this.cdr.detectChanges();
          } else {
            this.rows = data;
            this.loading=false;
            this.cdr.detectChanges();
          }
        },
        (error) => {
          this.loading=false;
          this.toastrService.error('oops something  went wrong  please try again', 'Error');
        }
      );
  }

  /**
   * Trigger a call to the API to get the customer
   * data for from input
   */
  onSearchCustomer: OperatorFunction<string, readonly { name; country; code }[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap((term: string) => (this.searchTerm = term)),
      switchMap((term) =>
        term.length >= 3
          ? this.dashboardRequestService.getCustomerData(term).pipe(
              tap((response) => {
                this.noResults = response.length === 0;
                if (this.noResults) {
                  this.toastrService.error(`no data found given search ${term}`, 'Error');
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
          : this.searchResult?.filter((v) => v.BusinessName.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1);
      })
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

  /**
   * A method to bind the value of seclected element from the dropdown
   * @param $event dropdown selected option
   * @param nameOfControl name of the form control in the dynamic form
   */
  bindValueOfControl($event: NgbTypeaheadSelectItemEvent, nameOfControl: string) {
    if ($event !== undefined && nameOfControl) {
      if (nameOfControl === 'customer') {
        this.customerId = Number($event.item?.CUSTOMERID);
        if (this.customerId) {
          this.customerDependsOnContactList(this.customerId);
        }
      }
    }
  }

  customerDependsOnContactList(customerNumber: number) {
    this.dashboardRequestService.getContactData(customerNumber, apiUrls.srsearchList_url.searchContact).pipe(takeUntil(this.ngDestroy$)).subscribe(
      (data: any) => {
        this.contactList = data;
        this.cdr.detectChanges();
      },
      (error) => {
        this.toastrService.error(
          'Oops! Something went wrong  while fetching the contact data please try again',
          'Error'
        );
      }
    );
  }

  onChangeCustomer(value) {
    if (value === '') {
      this.contactList = [];
      this.srListSearchForm.get('requestor').disable();
      this.tabsdisable = true;
      this.tabClose();
      this.cdr.markForCheck();
    } else {
      this.tabsdisable = false;
      this.tabClose();
      this.srListSearchForm.get('requestor').enable();
      this.cdr.markForCheck();
    }
  }
  reset() {
    this.srListSearchForm.reset();
    this.allSrRequestApiResponse = [];
    this.srListSearchForm.get('requestor').patchValue('');
    this.customerId = null;
    this.onChangeCustomer('');
    //this.activetab = '';
    this.tabClose();
    //same page refresh same routing url
    /*   const url = this.router.serializeUrl(this.router.createUrlTree([`/dashboard/request/all-service-requests`]));
      let currentUrl = url;
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.onSameUrlNavigation = 'reload';
      this.router.navigate([currentUrl]); */
  }

  tabClose() {
    this.activetab = '';
    this.srListSearchForm.controls.from.patchValue('');
    this.srListSearchForm.controls.to.patchValue('');
    this.srListSearchForm.controls.depatureDateFrom.patchValue('');
    this.srListSearchForm.controls.depatureDateTo.patchValue('');
    this.srListSearchForm.controls.tripType.patchValue('');
    this.srListSearchForm.controls.class.patchValue('');
    this.srListSearchForm.controls.lineLocation.patchValue('');
    this.srListSearchForm.controls.checkInDateFrom.patchValue('');
    this.srListSearchForm.controls.checkInDateTo.patchValue('');
    //this.reset();
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
                  this.toastrService.error(`no data found given search ${term}`, 'Error');
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
          : this.searchResult.filter((v) => v.name.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1)
      )
    );

  getMasterClass() {
    this.masterDataService.getMasterDataByTableName('master_class').pipe(takeUntil(this.ngDestroy$)).subscribe((data) => {
      if (data) {
        this.masterClassList = data;
        this.cdr.detectChanges();
      } else {
        this.toastrService.error('Oops! Something went wrong while fetching the Class Data', 'Error');
      }
    });
  }

  //hotel locations
  /**
   * Trigger a call to the API to get the hotel location
   * data for from input
   */
  onSearchHotel: OperatorFunction<string, readonly { name; country; code }[]> = (text$: Observable<string>) =>
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
                  this.toastrService.error(`no data found given search ${term}`, 'Error');
                }
                let data = response;
                data.forEach((element) => {
                  element.name = element?.name + ' , ' + element?.country + '(' + element?.code + ')';
                });
                this.searchResult = [...data];
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
   * updateLimit
   *
   * @param limit
   */
  updateLimit(limit) {
    this.limitRef = limit.target.value;
    this.cdr.markForCheck();
  }


}
