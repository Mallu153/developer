import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'app/shared/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { BookingReferenceNo } from '../../models/bookingReferenceNo';
import { SrReportsService } from '../../services/sr-reports.service';
import { sr_reports } from '../../constants/sr-reports-url-constants';
import { BookingReportsApiResponse } from '../../models/invoice-api-response';

import { concat, Observable, of, OperatorFunction, Subject, throwError } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap, tap, map, filter, takeUntil } from 'rxjs/operators';
import { SystemMasterApiResponse } from '../../models/system-api-response';
import { PERMISSION_KEYS } from 'app/shared/data/app-premission-key';

@Component({
  selector: 'app-booking-search',
  templateUrl: './booking-search.component.html',
  styleUrls: ['./booking-search.component.scss', '../../../../../../assets/sass/libs/select.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BookingSearchComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  bookingSearchForm: FormGroup;
  submitted = false;

  public bookingData: any[] = [];
  public show = false;
  public loading: boolean = false;

  //booking reference no
  bookingReferenceNo$: Observable<any>;
  bookingReferenceNoLoading = false;
  bookingReferenceNoLoadingInput$ = new Subject<string>();
  minLengthBookingReferenceNoTerm = 2;
  //micro account id
  microAccountId$: Observable<any>;
  microAccountIdLoading = false;
  microAccountIdInput$ = new Subject<string>();
  minLengthMicroAccountIdTerm = 2;
  //service request no
  serviceRequest$: Observable<any>;
  serviceRequestLoading = false;
  serviceRequestInput$ = new Subject<string>();
  minLengthServiceRequestTerm = 2;
  //service request line no
  serviceRequestLine$: Observable<any>;
  serviceRequestLineLoading = false;
  serviceRequestLineInput$ = new Subject<string>();
  minLengthServiceRequestLineTerm = 2;
  //subreference type
  subReferenceTypeList: any[] = [];
  //suplierReference
  suplierReference$: Observable<any>;
  suplierReferenceLoading = false;
  suplierReferenceInput$ = new Subject<string>();
  minLengthsuplierReferenceTerm = 2;
  //supplierSubReference
  supplierSubReference$: Observable<any>;
  supplierSubReferenceLoading = false;
  supplierSubReferenceInput$ = new Subject<string>();
  minLengthsupplierSubReferenceTerm = 2;
  //supplierSubReferenceParent
  supplierSubReferenceParent$: Observable<any>;
  supplierSubReferenceParentLoading = false;
  supplierSubReferenceParentInput$ = new Subject<string>();
  minLengthsupplierSubReferenceParentTerm = 2;
  //supplierSubReferenceNumber
  supplierSubReferenceNumber$: Observable<any>;
  supplierSubReferenceNumberLoading = false;
  supplierSubReferenceNumberInput$ = new Subject<string>();
  minLengthsupplierSubReferenceNumberTerm = 2;
  //users data
  public usersData: any[] = [];
  //lation
  public locationData: any[] = [];
  //costcenter
  public costCenterData: any[] = [];
  //businessUnitData
  public businessUnitData: any[] = [];

  //office id
  officeID$: Observable<any>;
  officeIDLoading = false;
  officeIDInput$ = new Subject<string>();
  minLengthofficeIDTerm = 2;

  //price office id
  priceOfficeID$: Observable<any>;
  priceOfficeIDLoading = false;
  priceOfficeIDInput$ = new Subject<string>();
  minLengthpriceOfficeIDTerm = 2;
  //iataid
  iataID$: Observable<any>;
  iataIDLoading = false;
  iataIDInput$ = new Subject<string>();
  minLengthiataIDTerm = 2;
  //price iataid
  priceIATAID$: Observable<any>;
  priceIATAIDLoading = false;
  priceIATAIDInput$ = new Subject<string>();
  minLengthpriceIATAIDTerm = 2;
  //product
  product$: Observable<any>;
  productLoading = false;
  productInput$ = new Subject<string>();
  minLengthproductTerm = 2;

  //passengerType
  passengerType$: Observable<any>;
  passengerTypeLoading = false;
  passengerTypeInput$ = new Subject<string>();
  minLengthpassengerTypeTerm = 2;

  //customer
  customer$: Observable<any>;
  customerLoading = false;
  customerInput$ = new Subject<string>();
  minLengthcustomerTerm = 2;

  //priceCustomer
  priceCustomer$: Observable<any>;
  priceCustomerLoading = false;
  priceCustomerInput$ = new Subject<string>();
  minLengthpriceCustomerTerm = 2;

  //supplier
  supplier$: Observable<any>;
  supplierLoading = false;
  supplierInput$ = new Subject<string>();
  minLengthsupplierTerm = 2;
  //PriceSupplier
  priceSupplier$: Observable<any>;
  priceSupplierLoading = false;
  priceSupplierInput$ = new Subject<string>();
  minLengthpriceSupplierTerm = 2;
  //customer contact
  public contactData: any[] = [];

  todayDate = new Date();
  todayDate1: string;

  selectCustomerDeatils: any = {};
  public ismoreFieldsCollapsed = true;



  lineStatus = [
    {
      name: 'First',
    },
    {
      name: 'Reissue',
    },
    {
      name: 'Void',
    },
    {
      name: 'Refund',
    },
    {
      name: 'Save',
    },
    {
      name: 'Booked',
    },
    {
      name: 'Vouchered',
    },
    {
      name: 'Cancelled',
    },
    {
      name: 'Modified',
    }
    ];

    //amendments default customer
    customerDetails=[];

    //bookingCalender filters
    selectedProducts=[];

    showFilters:boolean;

    keys=[];
    userDetails:any;
    customerInputKey=PERMISSION_KEYS.REPORTS.BOOKING_REPORT_CUSTOMER_INPUT;
    contactInputKey=PERMISSION_KEYS.REPORTS.BOOKING_REPORT_CONTACT_INPUT;
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private datepipe: DatePipe,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
    private authService: AuthService,
    private srReports: SrReportsService
  ) {
    this.todayDate1 = this.datepipe.transform(this.todayDate, 'yyyy-MM-dd');
    //this.titleService.setTitle('Booking Report');
  }


  onItemSelection(show: boolean): void {

    this.showFilters=show;
  }
  trackByFn(item: any) {
    return item.booking_reference_no;
  }

  loadBookingReferenceNo() {
    this.bookingReferenceNo$ = concat(
      of([]), // default items
      this.bookingReferenceNoLoadingInput$.pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthBookingReferenceNoTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.cd.markForCheck(), (this.bookingReferenceNoLoading = true))),
        switchMap((term) => {
          return this.srReports.getAutosuggestion(sr_reports.getBookingReference, term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.bookingReferenceNoLoading = false))
          );
        })
      )
    );
  }

  loadMicroAccountId() {
    this.microAccountId$ = concat(
      of([]), // default items
      this.microAccountIdInput$.pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthMicroAccountIdTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.cd.markForCheck(), (this.microAccountIdLoading = true))),
        switchMap((term) => {
          return this.srReports.getAutosuggestion(sr_reports.getMicroAccount, term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.microAccountIdLoading = false))
          );
        })
      )
    );
  }

  loadServiceRequest() {
    this.serviceRequest$ = concat(
      of([]), // default items
      this.serviceRequestInput$.pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthServiceRequestTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.cd.markForCheck(), (this.serviceRequestLoading = true))),
        switchMap((term) => {
          return this.srReports.getAutosuggestion(sr_reports.getServiceRequest, term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.serviceRequestLoading = false))
          );
        })
      )
    );
  }

  loadServiceRequestLine() {
    this.serviceRequestLine$ = concat(
      of([]), // default items
      this.serviceRequestLineInput$.pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthServiceRequestLineTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.cd.markForCheck(), (this.serviceRequestLineLoading = true))),
        switchMap((term) => {
          return this.srReports.getAutosuggestion(sr_reports.getServiceRequestLine, term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.serviceRequestLineLoading = false))
          );
        })
      )
    );
  }

  getSubReferenceType() {
    this.srReports
      .getSubReferenceType(sr_reports.getSubReferenceType)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (res: any) => {
          if (res) {
            this.subReferenceTypeList = res;
          }
        },
        (error) => {
          this.toastr.warning(error, 'Error');
        }
      );
  }

  loadSuplierReference() {
    this.suplierReference$ = concat(
      of([]), // default items
      this.suplierReferenceInput$.pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthsuplierReferenceTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.cd.markForCheck(), (this.suplierReferenceLoading = true))),
        switchMap((term) => {
          return this.srReports.getAutosuggestion(sr_reports.getSupplierReference, term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.suplierReferenceLoading = false))
          );
        })
      )
    );
  }

  loadSuplierSubReference() {
    this.supplierSubReference$ = concat(
      of([]), // default items
      this.supplierSubReferenceInput$.pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthsupplierSubReferenceTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.cd.markForCheck(), (this.supplierSubReferenceLoading = true))),
        switchMap((term) => {
          return this.srReports.getAutosuggestion(sr_reports.getSupplierSubReference, term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.supplierSubReferenceLoading = false))
          );
        })
      )
    );
  }

  loadSuplierSubReferenceNumber() {
    this.supplierSubReferenceNumber$ = concat(
      of([]), // default items
      this.supplierSubReferenceNumberInput$.pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthsupplierSubReferenceNumberTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.cd.markForCheck(), (this.supplierSubReferenceNumberLoading = true))),
        switchMap((term) => {
          return this.srReports.getAutosuggestion(sr_reports.getSupplierSubReference, term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.supplierSubReferenceNumberLoading = false))
          );
        })
      )
    );
  }

  loadSuplierSubReferenceParent() {
    this.supplierSubReferenceParent$ = concat(
      of([]), // default items
      this.supplierSubReferenceParentInput$.pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthsupplierSubReferenceParentTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.cd.markForCheck(), (this.supplierSubReferenceParentLoading = true))),
        switchMap((term) => {
          return this.srReports.getAutosuggestion(sr_reports.getSupplierSubReferenceParent, term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.supplierSubReferenceParentLoading = false))
          );
        })
      )
    );
  }

  getBookingData() {

    this.loading = true;
    this.srReports
      .getBookingReport(this.bookingSearchForm.value, sr_reports.bookingReport)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (res) => {
          const result: BookingReportsApiResponse = res;
          if (result.status === true) {
            this.bookingData = result.data;
            this.showFilters=true;
            this.loading = false;
            this.cd.markForCheck();
            //this.cd.detectChanges();
          } else {
            this.loading = false;
            this.showFilters=false;
            this.toastr.error('Oops! Something went wrong  please try again', 'Error');
          }
        },
        (error) => {
          this.bookingData = [];
          this.showFilters=false;
          this.loading = false;
          this.toastr.warning(error, 'Error');
          this.cd.markForCheck();
        }
      );
  }

  getBookingInforamtionByCustomer(objectInfo) {

    this.loading = true;
    this.srReports
      .getBookingReport(objectInfo, sr_reports.bookingReport)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (res) => {
          const result: BookingReportsApiResponse = res;
          if (result.status === true) {
            this.bookingData = result.data;

            this.loading = false;
            this.cd.markForCheck();
            //this.cd.detectChanges();
          } else {
            this.loading = false;
            this.toastr.error('Oops! Something went wrong  please try again', 'Error');
          }
        },
        (error) => {
          this.bookingData = [];

          this.loading = false;
          this.toastr.warning(error, 'Error');
          this.cd.markForCheck();
        }
      );
  }
  findByCustomerDetails(customerId) {
    this.srReports
      .findByIdCustomer(customerId, sr_reports.findByIdCustomer)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res: SystemMasterApiResponse) => {
        const result: SystemMasterApiResponse = res;
        if (result.status === 200) {
          const customer_object = result?.data[0]?.customerId;
          this.onChangeCustomer(result?.data);
          /* this.customer$ = concat(
            of(result?.data) // default items
          ); */
          this.bookingSearchForm.patchValue({
            booking_customer_id: [customer_object],
          });
          this.cd.markForCheck();
        } else {
          this.toastr.error('Oops! Something went wrong fetching the customer data please try again', 'Error');
          this.cd.markForCheck();
        }
      });
  }

  getAllUsers() {
    this.srReports
      .getAllUsersData(sr_reports.ALLUSERS)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (res: any) => {
          if (res) {
            this.usersData = res;
            this.cd.markForCheck();
          } else {
            this.toastr.error('oops something went wrong fetching the user data  please try again', 'Error');
            this.cd.markForCheck();
          }
        },
        (error) => {
          this.toastr.error(error, 'Error');
        }
      );
  }
  onSelectAllUsers() {
    if (this.usersData) {
      const selectAll = this.usersData?.map((item) => item.userId);
      if (selectAll && selectAll?.length > 0) {
        this.bookingSearchForm.get('booking_user_id').patchValue(selectAll);
      }
    }
  }
  onClearAllUsers() {
    this.bookingSearchForm.get('booking_user_id').patchValue([]);
  }

  getLocation() {
    this.srReports
      .getsystemMasterData(sr_reports.locationList)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res: SystemMasterApiResponse) => {
        const result: SystemMasterApiResponse = res;
        if (result.status === 200) {
          this.locationData = result.data;
          this.cd.markForCheck();
        } else {
          this.toastr.error('Oops! Something went wrong fetching the location data please try again', 'Error');
          this.cd.markForCheck();
        }
      });
  }
  getCostcenter() {
    this.srReports
      .getsystemMasterData(sr_reports.costCenter)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res: SystemMasterApiResponse) => {
        const result: SystemMasterApiResponse = res;
        if (result.status === 200) {
          this.costCenterData = result.data;
          this.cd.markForCheck();
        } else {
          this.toastr.error('Oops! Something went wrong fetching the costcenter data please try again', 'Error');
          this.cd.markForCheck();
        }
      });
  }
  getBusinessUnit() {
    this.srReports
      .getsystemMasterData(sr_reports.businessUnit)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res: SystemMasterApiResponse) => {
        const result: SystemMasterApiResponse = res;
        if (result.status === 200) {
          this.businessUnitData = result.data;
          this.cd.markForCheck();
        } else {
          this.toastr.error('Oops! Something went wrong fetching the business unit data please try again', 'Error');
          this.cd.markForCheck();
        }
      });
  }

  loadOfficeID() {
    this.officeID$ = concat(
      of([]), // default items
      this.officeIDInput$.pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthofficeIDTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.cd.markForCheck(), (this.officeIDLoading = true))),
        switchMap((term) => {
          return this.srReports.getOfficeID(sr_reports.officeID, term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.officeIDLoading = false))
          );
        })
      )
    );
  }

  loadPriceOfficeID() {
    this.priceOfficeID$ = concat(
      of([]), // default items
      this.priceOfficeIDInput$.pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthpriceOfficeIDTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.cd.markForCheck(), (this.priceOfficeIDLoading = true))),
        switchMap((term) => {
          return this.srReports.getOfficeID(sr_reports.officeID, term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.priceOfficeIDLoading = false))
          );
        })
      )
    );
  }

  loadIATAID() {
    this.iataID$ = concat(
      of([]), // default items
      this.iataIDInput$.pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthiataIDTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.cd.markForCheck(), (this.iataIDLoading = true))),
        switchMap((term) => {
          return this.srReports.getOfficeID(sr_reports.IataIDController, term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.iataIDLoading = false))
          );
        })
      )
    );
  }

  loadPriceIATAID() {
    this.priceIATAID$ = concat(
      of([]), // default items
      this.priceIATAIDInput$.pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthpriceIATAIDTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.cd.markForCheck(), (this.priceIATAIDLoading = true))),
        switchMap((term) => {
          return this.srReports.getOfficeID(sr_reports.IataIDController, term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.priceIATAIDLoading = false))
          );
        })
      )
    );
  }

  loadProduct() {
    this.product$ = concat(
      of(this.selectedProducts), // default items
      this.productInput$.pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthproductTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.cd.markForCheck(), (this.productLoading = true))),
        switchMap((term) => {
          return this.srReports.getJDBCData(sr_reports.getProduct, term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.productLoading = false))
          );
        })
      )
    );
  }
  loadPassengerType() {
    this.passengerType$ = concat(
      of([]), // default items
      this.passengerTypeInput$.pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthpassengerTypeTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.cd.markForCheck(), (this.passengerTypeLoading = true))),
        switchMap((term) => {
          return this.srReports.getJDBCData(sr_reports.getPassengerType, term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.passengerTypeLoading = false))
          );
        })
      )
    );
  }

  loadCustomer() {
    this.customer$ = concat(
      of( this.customerDetails), // default items
      this.customerInput$.pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthcustomerTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.cd.markForCheck(), (this.customerLoading = true))),
        switchMap((term) => {
          return this.srReports.getCustmerDeatils(sr_reports.customer, term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.customerLoading = false))
          );
        })
      )
    );
  }
  onChangeCustomer($event) {
    if ($event.length > 0) {
      this.getCustomerContact($event[0]?.customerId);
      /* for (let index = 0; index < $event?.length; index++) {
       //const element = $event[index];
       this.getCustomerContact($event[index]?.customerId);
     } */
    } else {
      this.contactData = [];
    }
  }
  getCustomerContact(customerId) {
    this.srReports.getContact(customerId, sr_reports.contact).subscribe((res: SystemMasterApiResponse) => {
      const result: SystemMasterApiResponse = res;
      if (result.status === 200) {
        result?.data?.forEach((element) => {
          //element.fullName=
          element['fullName'] = element?.['firstName'] + '.' + element?.['lastName'];
        });
        //this.contactData.push(result.data);
        this.contactData = result.data;
        if (this.selectCustomerDeatils) {
          const contact_data = this.contactData.find((v) => v.id === this.selectCustomerDeatils?.contactId);
          if (contact_data) {
            this.bookingSearchForm.patchValue({
              booking_contact_id: [contact_data?.id],
            });
          }
        }
        //this.cd.markForCheck();
      } else {
        this.toastr.error('Oops! Something went wrong fetching the contact data please try again', 'Error');
      }
    });
  }
  loadPriceCustomer() {
    this.priceCustomer$ = concat(
      of([]), // default items
      this.priceCustomerInput$.pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthpriceCustomerTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.cd.markForCheck(), (this.priceCustomerLoading = true))),
        switchMap((term) => {
          return this.srReports.getCustmerDeatils(sr_reports.customer, term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.priceCustomerLoading = false))
          );
        })
      )
    );
  }

  loadSupplier() {
    this.supplier$ = concat(
      of([]), // default items
      this.supplierInput$.pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthsupplierTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.cd.markForCheck(), (this.supplierLoading = true))),
        switchMap((term) => {
          return this.srReports.getCustmerDeatils(sr_reports.supplier, term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.supplierLoading = false))
          );
        })
      )
    );
  }

  loadPriceSupplier() {
    this.priceSupplier$ = concat(
      of([]), // default items
      this.priceSupplierInput$.pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthpriceSupplierTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.cd.markForCheck(), (this.priceSupplierLoading = true))),
        switchMap((term) => {
          return this.srReports.getCustmerDeatils(sr_reports.supplier, term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.priceSupplierLoading = false))
          );
        })
      )
    );
  }




  initializeForm() {
    this.bookingSearchForm = this.fb.group({
      product_id: '',
      booking_id: '',
      passenger_id: '',
      price_id: '',
      passenger_type: '',
      passenger_name: '',
      passenger_mobile: '',
      passenger_email: '',
      supplier_reference: '',
      supplier_reference_from_date: '',
      supplier_reference_to_date: '',
      booking_reference_no: '',
      service_request: '',
      service_request_line: '',
      booking_iata_id: '',
      booking_office_id: '',
      price_iata_id: '',
      price_office_id: '',
      booking_supplier_id: '',
      booking_customer_id: '',
      price_supplier_id: '',
      price_customer_id: '',
      booking_contact_id: '',
      supplier_sub_reference: '',
      supplier_sub_reference_parent: '',
      supplier_sub_reference_from_date: '',
      supplier_sub_reference_to_date: '',
      supplier_sub_reference_type: '',
      supplier_sub_reference_no: '',
      micro_account_id: '',
      booking_user_id: '',
      booking_created_from_date: '',
      booking_created_to_date: '',
      sub_reference_user_id: '',
      liability_user_id: '',
      booking_location_id: '',
      booking_costcenter_id: '',
      booking_business_unit_id: '',
      sub_reference_location_id: '',
      sub_reference_costcenter_id: '',
      sub_reference_business_unit_id: '',
      liability_location_id: '',
      liability_costcenter_id: '',
      liability_business_unit_id: '',
      sub_reference_from_date:'',
      sub_reference_to_date:'',
      line_status:'',
      issued_vouchered:'',
      booking_requested_date_from:'',
      booking_requested_date_to:''
    });
  }

  get f() {
    return this.bookingSearchForm.controls;
  }

  resetForm() {
    this.submitted = false;
    this.bookingSearchForm.reset();
    this.bookingSearchForm.get('issued_vouchered').setValue('');
    //this.getBookingData();
    this.bookingData = [];
    this.contactData = [];
    this.loadProduct();
    this.loadBookingReferenceNo();
    this.loadMicroAccountId();
    this.loadServiceRequest();
    this.loadServiceRequestLine();
    this.loadSuplierReference();
    this.loadSuplierSubReference();
    this.loadSuplierSubReferenceNumber();
    this.loadSuplierSubReferenceParent();
    this.loadOfficeID();
    this.loadPriceOfficeID();
    this.loadIATAID();
    this.loadPriceIATAID();
    this.loadProduct();
    this.loadPassengerType();
    this.loadCustomer();
    this.loadPriceCustomer();
    this.loadSupplier();
    this.loadPriceSupplier();
    this.deleteQueryParameterFromCurrentRoute();
  }

  checkStartDateAndEndDate(toLabelname, fromLabelname, startDate, enddate): boolean {
    if (startDate && enddate) {
      if (startDate != null && enddate != null && enddate < startDate) {
        this.toastr.error(`${toLabelname} should be greater than  ${fromLabelname}`, 'Error');
        return false;
      } else {
        return true;
      }
    }
    return false;
  }
  onApplyFilters() {
    this.submitted = true;
    if (this.bookingSearchForm.valid) {
      if (
        this.bookingSearchForm.value.supplier_reference_from_date &&
        this.bookingSearchForm.value.supplier_reference_to_date
      ) {
        const data: boolean = this.checkStartDateAndEndDate(
          'Supplier Reference To Date',
          'Supplier Reference From Date',
          this.bookingSearchForm.value.supplier_reference_from_date,
          this.bookingSearchForm.value.supplier_reference_to_date
        );
        if (!data) {
          return;
        }
      }
      if (
        this.bookingSearchForm.value.supplier_sub_reference_from_date &&
        this.bookingSearchForm.value.supplier_sub_reference_to_date
      ) {
        const data: boolean = this.checkStartDateAndEndDate(
          'Supplier Sub Reference To Date',
          'Supplier Sub Reference From Date',
          this.bookingSearchForm.value.supplier_sub_reference_from_date,
          this.bookingSearchForm.value.supplier_sub_reference_to_date
        );
        if (!data) {
          return;
        }
      }
      if (
        this.bookingSearchForm.value.booking_created_from_date &&
        this.bookingSearchForm.value.booking_created_to_date
      ) {
        const data: boolean = this.checkStartDateAndEndDate(
          'Booking Created To Date',
          'Booking Created From Date',
          this.bookingSearchForm.value.booking_created_from_date,
          this.bookingSearchForm.value.booking_created_to_date
        );
        if (!data) {
          return;
        }
      }
      this.loading = true;
      this.getBookingData();
    }
  }
  deleteQueryParameterFromCurrentRoute() {
    const defaultCalling={
      active:false
    };
    const params = { ...this.route.snapshot.queryParams};
    delete params.booking_product_name;
    delete params.booking_product_no;
    delete params.date_of_journey;
    delete params.booking_user;
    delete params.issused;
    delete params.booking_customer_id;
    delete params.booking_customer;
    delete params.booking_contact_id;
    const data={...defaultCalling,...params};
    this.router.navigate([], { queryParams: data });
  }

  getQueryParams(){
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if(param &&param.booking_product_name&&param.booking_product_no&&param.date_of_journey && param.booking_user&&param.issused){
        let users=[];
        let productsData=[];
        const userNumber=Number(param.booking_user);
        users.push(userNumber);
        this.selectedProducts=[];
        const product={
          id:Number(param.booking_product_no),
          name:param.booking_product_name
        };
        productsData.push(Number(param.booking_product_no));
        this.selectedProducts.push(product);
        if(param.issused==="No"){
          this.bookingSearchForm.patchValue({
            booking_requested_date_from: param.date_of_journey,
            booking_requested_date_to: param.date_of_journey,
            booking_user_id:users,
            product_id:productsData,
            issued_vouchered: param.issused
          });

        }
        if(param.issused==="Yes"){
          this.bookingSearchForm.patchValue({
            sub_reference_from_date: param.date_of_journey,
            sub_reference_to_date: param.date_of_journey,
            liability_user_id:users,
            product_id:productsData,
            issued_vouchered: param.issused
          });
        }

        this.loading = true;
        this.getBookingData();
      } else if (param && param.booking_customer_id &&param.booking_customer&& param.booking_contact_id) {
        /* const booking_info_data = {
          booking_customer_id: param.booking_customer_id,
          booking_contact_id: param.booking_contact_id,
        }; */
        const booking_info = {
          customerId: Number(param.booking_customer_id),
          contactId: Number(param.booking_contact_id),
        };
        this.selectCustomerDeatils = booking_info;
        let customersArray=[];
        let customersContactArray=[];

        const customer={
          businessName:param.booking_customer,
          customerId:Number(param.booking_customer_id)
        };
        this.customerDetails.push(customer);
        customersContactArray.push(Number(param.booking_contact_id));
        customersArray.push(Number(param.booking_customer_id));
        this.bookingSearchForm.patchValue({
          booking_customer_id: customersArray,
          booking_contact_id:customersContactArray
        });
        this.onChangeCustomer(this.customerDetails);
        //this.findByCustomerDetails(Number(param.booking_customer_id));

        this.loading = true;
        this.getBookingData();
        //this.getBookingInforamtionByCustomer(booking_info_data);
      }else if(param && param.sourceType &&param.unIssued){
        if(param.unIssued==="No"){
          this.bookingSearchForm.patchValue({
            issued_vouchered: param.unIssued
          });
          this.loading = true;
          this.getBookingData();
        }
      } else {
        if(param && param.active){
        console.log('form reset');

        }else if(this.userDetails&&!this.keys?.includes(this.customerInputKey)&& !this.keys?.includes(this.contactInputKey)){

          let cbtCustomersArray=[];
          let cbtCustomersContactArray=[];
          cbtCustomersArray.push(this.userDetails?.bizId);
          cbtCustomersContactArray.push(this.userDetails?.contactId);
          this.bookingSearchForm.patchValue({
            booking_customer_id:cbtCustomersArray ,
            booking_contact_id: cbtCustomersContactArray,
            booking_created_from_date: this.todayDate1,
          });
          this.loading = true;
          this.getBookingData();
        }else{
          //this.resetForm();
          this.bookingSearchForm.patchValue({
            booking_created_from_date: this.todayDate1,
          });
          this.loading = true;
          this.getBookingData();
        }

      }
    });
  }
  ngOnInit(): void {
    this.keys = this.authService.getPageKeys();
    this.userDetails=this.authService.getUserDetails();
    this.initializeForm();
    this.getQueryParams();
    this.loadBookingReferenceNo();
    this.loadMicroAccountId();
    this.loadServiceRequest();
    this.loadServiceRequestLine();
    this.getSubReferenceType();
    this.loadSuplierReference();
    this.loadSuplierSubReference();
    this.loadSuplierSubReferenceNumber();
    this.loadSuplierSubReferenceParent();
    this.getAllUsers();
    this.getLocation();
    this.getCostcenter();
    this.getBusinessUnit();
    this.loadOfficeID();
    this.loadPriceOfficeID();
    this.loadIATAID();
    this.loadPriceIATAID();
    this.loadProduct();
    this.loadPassengerType();
    this.loadCustomer();
    this.loadPriceCustomer();
    this.loadSupplier();
    this.loadPriceSupplier();
  }
  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
