import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SearchPaxData } from '../../model/search-pax';
import { SearchResponsesService } from '../../services/search-responses.service';
import { DashboardRequestService } from '../../services/dashboard-request.service';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ServiceRequestLine } from '../../model/service-request-line';
import { DatePipe, formatDate } from '@angular/common';
import { Pax } from '../../model/pax-model';
import { AuthService } from 'app/shared/auth/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AncillarySelectComponent } from './ancillary-select/ancillary-select.component';
import { BookingReportsApiResponse } from 'app/pages/dashboard/sr-reports/models/invoice-api-response';
import { sr_reports } from 'app/pages/dashboard/sr-reports/constants/sr-reports-url-constants';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { CommunicationModule } from '../../url-constants/url-constants';
import { ApiResponse } from '../../model/api-response';
import { PERMISSION_KEYS } from 'app/shared/data/app-premission-key';
@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss'],
})
export class SearchResultComponent implements OnInit, OnDestroy {
  keys = [];
  normarlSearch: boolean = true;
  import: any[] = [];
  flightButtonKey = PERMISSION_KEYS.REQUEST.FLIGHT_REQUEST_BUTTON;
  importButtonKey = PERMISSION_KEYS.REQUEST.IMPORT_REQUEST_BUTTON;
  hotelButtonKey = PERMISSION_KEYS.REQUEST.HOTEL_REQUEST_BUTTON;
  ancillaryButtonKey = PERMISSION_KEYS.REQUEST.ANCILLARY_REQUEST_BUTTON;
  activityButtonKey = PERMISSION_KEYS.REQUEST.ACTIVITY_REQUEST_BUTTON;
  packageButtonKey = PERMISSION_KEYS.REQUEST.PACKAGE_REQUEST_BUTTON;
  amendmentButtonKey = PERMISSION_KEYS.REQUEST.AMENDMENT_REQUEST_BUTTON;
  ngDestroy$ = new Subject();
  selectedFormGroup: FormGroup;
  submitted = false;
  showImport = false;
  subscription: Subscription;
  //new pax patch data
  object: any;
  paxId: number;
  // today date
  todayDate = new Date();
  todayDate1: string;
  //timezone variable
  fecha = new Date();
  //check box
  selectedUserProfiles: Pax[] = [];
  showOnCheckedButton = false;
  hideonSubmitButton = true;
  public bookingData: any[] = [];
  selectCustomerDeatils: any = {};
  waTicket = false;
  searchData: any = [];
  wa_number: string;
  ticketNumber: string;
  moduleId = CommunicationModule.moduleId;
  moduleName = CommunicationModule.moduleName;
  requestData: any = {};
  constructor(
    private fb: FormBuilder,
    private titleService: Title,
    private SearchResponsesService: SearchResponsesService,
    private router: Router,
    private route: ActivatedRoute,
    private toastrService: ToastrService,
    private dashboardRequestService: DashboardRequestService,
    private authService: AuthService,
    private modalService: NgbModal,
    private cd: ChangeDetectorRef
  ) {
    this.titleService.setTitle('Contact List');
    this.todayDate1 = formatDate(this.todayDate, 'yyyy-MM-ddThh:mm:ss', 'en-US', '+0530');
  }

  ngOnInit(): void {
    this.keys = this.authService.getPageKeys();
    this.getQueryParams();
    this.selectedFormGroup = this.fb.group({
      selectedUserProfiles: this.fb.array([]),
    });
    this.getSearchData();
  }
  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }

  getQueryParams() {
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param && param.sources === 'waTicket' && param.wa_number && param.ticketNumber) {
        this.waTicket = true;
        this.wa_number = param.wa_number;
        this.ticketNumber = param.ticketNumber;
      } else {
        this.waTicket = false;
      }
    });
  }
  /*Paxdata Found We Can Move To Flight Form */
  goToFlightForm() {
    //this.router.navigate(['/dashboard/booking/flight']);
    const paxId = this.paxId;
    this.router.navigate(['/dashboard/booking/flight'], {
      queryParams: { paxId: paxId },
    });
  }
  /****
   * Search Responses
   * */
  getSearchData() {
    this.object = this.SearchResponsesService.data;
    if (this.object?.length === 1) {
      //this.selectedUserProfiles.push(this.object);
      const data: FormArray = this.selectedFormGroup.get('selectedUserProfiles') as FormArray;
      data.push(new FormControl(this.object[0]));
      this.amendmentsRequest();
      this.showOnCheckedButton = true;
      this.hideonSubmitButton = false;
    }
    if (this.object === undefined || this.object === null) {
      if (this.waTicket && this.ticketNumber) {
        this.router.navigate(['/dashboard/request/pax-search'], {
          queryParams: { wa_number: this.wa_number, ticketNumber: this.ticketNumber },
        });
      } else {
        this.router.navigate(['/dashboard/request/pax-search']);
      }
    }
  }

  /**
   * Triggers event on selected profile from the table
   * @param event
   * @param user
   */
  onProfileCheckboxChange(e, j, index) {
    const data: FormArray = this.selectedFormGroup.get('selectedUserProfiles') as FormArray;
    const removeIndex = data.controls.findIndex((x) => x.value === j);
    data.removeAt(removeIndex);
    this.bookingData = [];
    if (e.target.checked) {
      this.object?.forEach((contact, i) => {
        if (e.target.checked) {
          if (index === i) {
            contact.checked = true;
          } else {
            contact.checked = false;
          }
        }
      });
      data.push(new FormControl(j));
      if (this.selectedFormGroup.value.selectedUserProfiles?.length === 1) {
        this.amendmentsRequest();
      } /* else{

        return this.toastrService.error('Please select only  one contact and go', 'Error');
      } */
    } else {
      this.bookingData = [];
      const index = data.controls.findIndex((x) => x.value === j);
      data.removeAt(index);
    }
  }
  ancillarySelect() {
    if (this.selectedFormGroup.value.selectedUserProfiles?.length === 0) {
      return this.toastrService.error('Please select at least one contact and go', 'Error');
    }
    if (this.selectedFormGroup.value.selectedUserProfiles?.length > 1) {
      return this.toastrService.error('Please select only  one contact and go', 'Error');
    }

    const modalRef = this.modalService.open(AncillarySelectComponent, {
      size: 'xl',
      backdrop: 'static',
      animation: true,
    });
    modalRef.componentInstance.name = 'Add Person';
    modalRef.result.then(
      (result) => {
        if (result) {
          this.onSubmit('ancillary', result);
        }
      },
      (err) => {}
    );
  }

  /*
   *Create service request submit data
   *
   */
  onSubmit(routesName: string, serviceTypeId?: string, requestType?: string) {
    if (this.selectedFormGroup.value.selectedUserProfiles?.length === 0) {
      return this.toastrService.error('Please select at least one contact and go', 'Error');
    }
    if (this.selectedFormGroup.value.selectedUserProfiles?.length === 1) {
      let holiday: number = 0;
      if (routesName === 'holidays') {
        holiday = 1;
      } else {
        holiday = 0;
      }
      let dmc_flag: number = 0;
      if (requestType === 'dmc') {
        dmc_flag = 1;
      }
      let imports: number = 0;
      if (routesName === 'import') {
        imports = 1;
      } else {
        imports = 0;
      }
      const contactId = this.selectedFormGroup.value.selectedUserProfiles[0]?.contactId;
      const srRequestHeaderData = {
        createdBy: this.authService.getUser(),
        createdDate: this.todayDate1,
        customerId: this.selectedFormGroup.value.selectedUserProfiles[0]?.customerId,
        contactId: this.selectedFormGroup.value.selectedUserProfiles[0]?.contactId,
        requestStatus: 1,
        priorityId: 1,
        severityId: 1,
        packageRequest: holiday,
        dmcFlag: dmc_flag,
        // customerId: this.object[0]?.customerId,
        //contactId: this.object[0]?.id,
      };

      this.dashboardRequestService
        .createServiceRequestLine(srRequestHeaderData)
        .pipe(
          map((data) => (this.requestData = data)),
          switchMap(async (cust) =>
            this.onSaveHandleCommunicationModuleLink(
              this.requestData?.requestId,
              this.selectedFormGroup?.value?.selectedUserProfiles[0]?.contactId,
              routesName,
              serviceTypeId
            )
          ),
          takeUntil(this.ngDestroy$)
        )
        .subscribe(
          (requestResponse: any) => {
            console.log(`${routesName} request created...`);
          },
          (error) => {
            this.toastrService.error('Oops! Something went wrong ', 'Error');
          }
        );
    } else {
      return this.toastrService.error('Please select only  one contact and go', 'Error');
    }
  }

  /*****
   * One pax found automatic checked goto Flight form, hotel form, ancilillary form
   */
  onCheckedbox(routesName: string, requestType?: string) {
    if (this.object?.length === 1) {
      const contactId = this.object[0]?.contactId;
      let holiday: number = 0;
      if (routesName === 'holidays') {
        holiday = 1;
      } else {
        holiday = 0;
      }
      let dmc_flag: number = 0;
      if (requestType === 'dmc') {
        dmc_flag = 1;
      }

      const srRequestHeaderData = {
        createdBy: this.authService.getUser(),
        createdDate: this.todayDate1,
        customerId: this.object[0]?.customerId,
        contactId: this.object[0]?.contactId,
        requestStatus: 1,
        priorityId: 1,
        severityId: 1,
        packageRequest: holiday,
        dmcFlag: dmc_flag,
        // customerId: this.object[0]?.customerId,
        //contactId: this.object[0]?.id,
      };

      /* this.dashboardRequestService.createServiceRequestLine(srRequestHeaderData).pipe(takeUntil(this.ngDestroy$)).subscribe(
        (requestResponse: any) => {
          if(requestResponse.requestId){
            this.router.navigate([`/dashboard/booking/${routesName}`], {
              queryParams: { requestId: requestResponse.requestId, contactId: contactId },
            });
          }
        },
        (error) => {
          this.toastrService.error('Oops! Something went wrong ', 'Error');
        }
      ); */

      this.dashboardRequestService
        .createServiceRequestLine(srRequestHeaderData)
        .pipe(
          map((data) => (this.requestData = data)),
          switchMap(async (cust) =>
            this.onSaveHandleCommunicationModuleLink(
              this.requestData?.requestId,
              this.selectedFormGroup?.value?.selectedUserProfiles[0]?.contactId,
              routesName,
              null
            )
          ),
          takeUntil(this.ngDestroy$)
        )
        .subscribe(
          (requestResponse: any) => {
            console.log(`${routesName} request created...`);
          },
          (error) => {
            this.toastrService.error('Oops! Something went wrong ', 'Error');
          }
        );
    } else {
      return this.toastrService.error('Something went wrong');
    }
  }

  amendmentsRequest() {
    if (this.selectedFormGroup.value.selectedUserProfiles.length === 1) {
      const selectedPax = this.selectedFormGroup.value.selectedUserProfiles[0];

      const booking_report_data = {
        booking_customer_id: [selectedPax.customerId],
        booking_contact_id: [selectedPax.contactId],
      };
      this.selectCustomerDeatils = selectedPax;

      this.getBookingData(booking_report_data);
    }
  }

  getBookingData(objectData) {
    this.dashboardRequestService
      .getBookingReport(objectData, sr_reports.bookingReport)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (res: any) => {
          const result: BookingReportsApiResponse = res;
          if (result.status === true) {
            this.bookingData = result.data;

            this.cd.markForCheck();
          } else {
            this.toastrService.error('Oops! Something went wrong  please try again please try again', 'Error');
          }
        },
        (error) => {
          this.bookingData = [];
          this.toastrService.warning(error, 'Error');
          this.cd.detectChanges();
        }
      );
  }

  redirectToBooking() {
    if (this.selectedFormGroup.value.selectedUserProfiles.length === 1) {
      const selectedPax = this.selectedFormGroup.value.selectedUserProfiles[0];
      this.selectCustomerDeatils = selectedPax;
      this.router.navigate([`/dashboard/reports/booking`], {
        queryParams: {
          booking_customer_id: selectedPax?.customerId,
          booking_customer: selectedPax?.customerName,
          booking_contact_id: selectedPax?.contactId,
        },
      });
    } else {
      return this.toastrService.error('Please select only  one contact and go', 'Error');
    }
  }

  onSaveHandleCommunicationModuleLink(
    requestNumber: string,
    contactId: number,
    routesName: string,
    serviceTypeId: string
  ) {
    if (this.waTicket && this.wa_number && this.ticketNumber) {
      const onSave = {
        channel: 'WA',
        channelReference: this.ticketNumber,
        createdAt: this.todayDate1,
        createdBy: this.authService.getUser(),
        customerId: this.object[0]?.customerId,
        moduleId: this.moduleId,
        moduleName: this.moduleName,
        moduleReference: requestNumber,
        status: 0,
        updatedAt: this.todayDate1,
        updatedBy: this.authService.getUser(),
      };
      this.dashboardRequestService
        .createCommunication(onSave, CommunicationModule.communicationModuleLink)
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe(
          (res: any) => {
            const result: ApiResponse = res;
            if (result.status === 200) {
              console.log('create communication module link data saved');
              if (requestNumber) {
                if (routesName === 'ancillary') {
                  if (serviceTypeId !== null) {
                    if (requestNumber) {
                      this.router.navigate([`/dashboard/booking/${routesName}`], {
                        queryParams: {
                          requestId: requestNumber,
                          contactId: contactId,
                          serviceTypeId: btoa(escape(serviceTypeId)),
                        },
                      });
                      return;
                    }
                  } else {
                    this.toastrService.error('No Services found');
                  }
                } else if (routesName === 'import') {
                  console.log('test');

                  /* this.router.navigate([], {
                  relativeTo: this.route,
                  queryParams: {
                    requestId: requestNumber,
                    contactId: contactId,
                  },
                  queryParamsHandling: 'merge' // Preserve existing query params
                }); */
                } else {
                  if (requestNumber) {
                    this.router.navigate([`/dashboard/booking/${routesName}`], {
                      queryParams: {
                        requestId: requestNumber,
                        contactId: contactId,
                      },
                    });
                  }
                }
                console.log('test', routesName);
              }
              this.cd.markForCheck();
            } else {
              console.log('create communication module link  data not saved');
              this.toastrService.error('Oops! Something went wrong  please try again please try again', 'Error');
              this.cd.markForCheck();
            }
          },
          (error) => {
            console.log('create communication module link data not saved');
            this.toastrService.warning(error, 'Error');
            this.cd.markForCheck();
          }
        );
    } else {
      if (requestNumber) {
        if (routesName === 'ancillary') {
          if (serviceTypeId !== null) {
            if (requestNumber) {
              this.router.navigate([`/dashboard/booking/${routesName}`], {
                queryParams: {
                  requestId: requestNumber,
                  contactId: contactId,
                  serviceTypeId: btoa(escape(serviceTypeId)),
                },
              });
              return;
            }
          } else {
            this.toastrService.error('No Services found');
          }
        } else if (routesName === 'import') {
          // console.log("test");
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
              requestId: requestNumber,
              contactId: contactId,
            },
            queryParamsHandling: 'merge', // Preserve existing query params
          });
        } else {
          if (requestNumber) {
            this.router.navigate([`/dashboard/booking/${routesName}`], {
              queryParams: {
                requestId: requestNumber,
                contactId: contactId,
              },
            });
          }
        }
      }
    }
  }
  trackByFn(index, item) {
    return index;
  }
}
