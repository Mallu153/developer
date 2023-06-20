import { DatePipe, formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbModal, NgbTypeahead, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { DashboardRequestService } from 'app/pages/dashboard/dashboard-request/services/dashboard-request.service';
import {
  Holiday_Package,
  SrSummaryData,
  policy,
} from 'app/pages/dashboard/dashboard-request/url-constants/url-constants';
import { RfqService } from 'app/pages/dashboard/rfq/rfq-services/rfq.service';
import { AuthService } from 'app/shared/auth/auth.service';
import { AirportSearchResponse } from 'app/shared/models/airport-search-response';
import { MasterDataService } from 'app/shared/services/master-data.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ToastrService } from 'ngx-toastr';
import { Observable, of, OperatorFunction, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError, takeUntil, map, filter } from 'rxjs/operators';
import { SrSummaryDataService } from '../../share-data-services/srsummarydata.service';
import { TeamDataDataService } from '../../share-data-services/team-data.service';
import { AddPassengerFormComponent } from '../add-passenger-form/add-passenger-form.component';
import { SelectedPassengersService } from '../../share-data-services/selected-passenger.service';
import swal from 'sweetalert2';
import { ApiResponse } from 'app/shared/models/api-response';
import { environment } from 'environments/environment';
import { RFQAttractions } from 'app/pages/dashboard/rfq/rfq-url-constants/apiurl';
import { PERMISSION_KEYS } from 'app/shared/data/app-premission-key';
import { PolicyQualifyProcessStage1Component } from '../policy-qualify-process-stage1/policy-qualify-process-stage1.component';
import { DashboardBookingAsyncService } from '../../services/dashboard-booking-async.service';
@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss'],
})
export class ActivitiesComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  activitiesForm: FormGroup;
  isEdit = false;
  submitted = false;
  isValidFormSubmitted = null;

  //today date
  todayDate = new Date();
  todayDate1: string;
  todaydateAndTimeStamp: string;

  // Global variables to display whether is loading or failed to load the data
  noResults: boolean;
  searchTerm: string;
  searchResult: AirportSearchResponse[];
  formatter = (airport: AirportSearchResponse) => airport?.name;
  @ViewChild('typeaheadInstance') typeaheadInstance: NgbTypeahead;

  //activities dropdown list array
  attractionsData: any[] = [];

  //pagination
  page = 1;
  pageSize = 10;
  collectionSize: number;

  //hide activities Pax
  activitiesPaxHide = [];
  //ipaddress
  deviceInfo = null;

  requestId: number;
  contactId: number;
  activitiesHeaderNumber: number;

  //master lov
  productList = [];
  srcontactDeatils: any = {};

  /**
   *
   *
   * activities form elements premissions
   */
  keys = [];

  activitiesAddPax = PERMISSION_KEYS.BOOKING.ACTIVITIES.ACTIVITIES_ADD_PAX;

  /**
   *
   *
   *  activities buttons premissions
   */
  activitiesSaveBtn = PERMISSION_KEYS.BOOKING.ACTIVITIES.ACTIVITIES_SAVE_BTN;
  activitiesUpdateBtn = PERMISSION_KEYS.BOOKING.ACTIVITIES.ACTIVITIES_UPDATE_BTN;
  activitiesRFQBtn = PERMISSION_KEYS.BOOKING.ACTIVITIES.ACTIVITIES_RFQ_BTN;
  activitiesOfflineBtn = PERMISSION_KEYS.BOOKING.ACTIVITIES.ACTIVITIES_OFFLINE_BTN;

  /**
   *
   *
   * product link  premissions
   */
  flightLink = PERMISSION_KEYS.BOOKING.ACTIVITIES.PRODUCT_LINK_FLIGHT;
  hotelLink = PERMISSION_KEYS.BOOKING.ACTIVITIES.PRODUCT_LINK_HOTEL;
  ancillaryLink = PERMISSION_KEYS.BOOKING.ACTIVITIES.PRODUCT_LINK_ANCILLARY;
  holidayLink = PERMISSION_KEYS.BOOKING.ACTIVITIES.PRODUCT_LINK_HOLIDAY;
  activityLink = PERMISSION_KEYS.BOOKING.ACTIVITIES.PRODUCT_LINK_ACTIVITY;

  policyList = [];

  lineStatusName: string;
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private dashboardRequestService: DashboardRequestService,
    private cdr: ChangeDetectorRef,
    private datepipe: DatePipe,
    private deviceService: DeviceDetectorService,
    public masterDataService: MasterDataService,
    private authService: AuthService,
    private rfqServices: RfqService,
    private srSummaryData: SrSummaryDataService,
    private teamDataService: TeamDataDataService,
    private SelectedPassengersService: SelectedPassengersService,
    private dashboardAsyncApiServices: DashboardBookingAsyncService
  ) {
    this.todayDate1 = this.datepipe.transform(this.todayDate, 'yyyy-MM-dd');
    this.todaydateAndTimeStamp = formatDate(this.todayDate, 'yyyy-MM-ddThh:mm:ss', 'en-US', '+0530');
    this.epicFunction();
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
                let data = response;
                data.forEach((element) => {
                  element.name = element?.name + ' , ' + element?.country + '(' + element?.code + ')';
                });
                this.searchResult = [...data];
                if (this.noResults) {
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
        this.searchTerm === '' || this.searchTerm.length <= 2
          ? []
          : this.searchResult.filter((v) => v.name.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1);
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
    let parent = elem.parentElement,
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

  // get the selected location values
  bindValueOfLocationControl($event: NgbTypeaheadSelectItemEvent, index: number, nameOfControl: string) {
    if ($event && index !== undefined && nameOfControl) {
      if (nameOfControl === 'attractionLineLocation') {
        const attractionsSendData = {
          city: $event.item.city,
        };
        this.getAttrationsData(attractionsSendData, index);
      }
    }
  }
  onChangeActivites(event: any, mainIndex: number) {
    if (event.target.value === '') {
      this.attractionsData?.splice(mainIndex, 0, []);
    }
    this.cdr.markForCheck();
  }
  getAttrationsData(toCodeData: any, mainIndex: number) {
    this.dashboardRequestService
      .getPackageActivity(toCodeData, Holiday_Package.packageActivity)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (res: any) => {
          if (res.length > 0) {
            this.attractionsData?.splice(mainIndex, 0, res);
            this.cdr.markForCheck();
          } else {
            this.attractionsData?.splice(mainIndex, 0, []);
            this.cdr.markForCheck();
          }
        },
        (error) => {
          this.attractionsData?.splice(mainIndex, 0, []);
          this.toastr.error(error, 'Error');
          this.cdr.markForCheck();
        }
      );
  }

  getProductType() {
    this.masterDataService
      .getGenMasterDataByTableName('master_products')
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((data: any) => {
        if (data) {
          this.productList = data;
          this.cdr.markForCheck();
        } else {
          this.toastr.error(
            'Oops! Something went wrong while fetching the Product type data please try again ',
            'Error'
          );
        }
      });
  }

  getRequestContactDetails() {
    this.srSummaryData
      .getData()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        this.srcontactDeatils = res;
        this.cdr.markForCheck();
      });
  }
  /**
   * Open person modal component to add more people to the form
   */
  openPersonModal(mainIndex: number) {
    // AddPersonModalComponent
    const modalRef = this.modalService.open(AddPassengerFormComponent, { size: 'xl', windowClass: 'my-class' });
    modalRef.componentInstance.name = 'Add Person';
    modalRef.componentInstance.flightIndex = mainIndex;
    modalRef.componentInstance.attractionsType = 'activities';
    modalRef.componentInstance.attractionsPaxCount = null;
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
            const modifyHolidayPaxData = {
              attractionLinePassengerTitle: res?.passengers[r].prefix,
              attractionLinePaxId:
                res?.passengers[r].paxId === null ||
                res?.passengers[r].paxId === '' ||
                res?.passengers[r].paxId === undefined
                  ? 0
                  : res?.passengers[r].paxId,
              attractionLinePassengerFristName: res?.passengers[r].firstName,
              attractionLinePassengerLastName: res?.passengers[r].lastName,
              attractionLinePassengerGender: res?.passengers[r].gender,
              attractionLinePassengerDob:
                res?.passengers[r].dob === '' || res?.passengers[r].dob === null || res?.passengers[r].dob === undefined
                  ? null
                  : res?.passengers[r].dob,
              attractionLinePassengerEmail: res?.passengers[r].email,
              attractionLinePassengerPhone: res?.passengers[r].phone,
              attractionLinePassengerType: res?.passengers[r].paxType?.name,
              attractionLinePassengerId: 0,
              //attractionLineId:2258,
              attractionLinePassengerStatus: 1,
            };

            (this.activites.at(res?.holidayIndex)?.get('activitiesPax') as FormArray)?.push(
              this.fb.group(modifyHolidayPaxData)
            );
          }
        }
        this.cdr.markForCheck();
      });
  }

  showActivitiesPaxInfo(mainIndex: number) {
    this.activitiesPaxHide[mainIndex] = !this.activitiesPaxHide[mainIndex];
  }

  locationCopyToNextLines(mainIndex: number) {
    const MODIFY_INDEX = mainIndex + 1;
    const location = this.activites.value[mainIndex].attractionLineLocation;
    //const attractionLineCity=this.activites.value[mainIndex].attractionLineCity;
    const PaxCount = this.activites.value[mainIndex].attractionLinePaxCount;
    this.activites.at(MODIFY_INDEX)?.patchValue({
      attractionLineLocation: location,
      attractionLinePaxCount: PaxCount,
    });
    const attractionsSendData = {
      city: location.city,
    };

    this.getAttrationsData(attractionsSendData, mainIndex);
    if (this.activites.at(mainIndex).value.activitiesPax.length > 0) {
      for (let index = 0; index < this.activites.at(mainIndex).value.activitiesPax?.length; index++) {
        const element = this.activites.at(mainIndex).value.activitiesPax[index];
        if (this.isEdit) {
          const modifyHolidayPaxData = {
            attractionLinePassengerTitle: element.attractionLinePassengerTitle,
            attractionLinePaxId: element.attractionLinePaxId,
            attractionLinePassengerFristName: element.attractionLinePassengerFristName,
            attractionLinePassengerLastName: element.attractionLinePassengerLastName,
            attractionLinePassengerGender: element.attractionLinePassengerGender,
            attractionLinePassengerDob: element.attractionLinePassengerDob,
            attractionLinePassengerEmail: element.attractionLinePassengerEmail,
            attractionLinePassengerPhone: element.attractionLinePassengerPhone,
            attractionLinePassengerType: element.attractionLinePassengerType,
            attractionLinePassengerId: null,
            attractionLineId: null,
            attractionLinePassengerStatus: 1,
          };
          (this.activites.at(MODIFY_INDEX)?.get('activitiesPax') as FormArray)?.push(
            this.fb.group(modifyHolidayPaxData)
          );
        } else {
          (this.activites.at(MODIFY_INDEX)?.get('activitiesPax') as FormArray)?.push(this.fb.group(element));
        }
      }
    }
  }

  activitiesLinesDataConversion() {
    let convertLines = [];
    for (let index = 0; index < this.activites.value.length; index++) {
      const element = this.activites.value[index];
      if (this.isEdit === true) {
        let modifyPax = [];
        if (element.activitiesPax?.length > 0) {
          for (let subindex = 0; subindex < element.activitiesPax.length; subindex++) {
            const subelement = element.activitiesPax[subindex];
            const modifyHolidayPaxData = {
              attractionLinePassengerTitle: subelement.attractionLinePassengerTitle,
              attractionLinePaxId: subelement.attractionLinePaxId,
              attractionLinePassengerFristName: subelement.attractionLinePassengerFristName,
              attractionLinePassengerLastName: subelement.attractionLinePassengerLastName,
              attractionLinePassengerGender: subelement.attractionLinePassengerGender,
              attractionLinePassengerDob: subelement.attractionLinePassengerDob,
              attractionLinePassengerEmail: subelement.attractionLinePassengerEmail,
              attractionLinePassengerPhone: subelement.attractionLinePassengerPhone,
              attractionLinePassengerType: subelement.attractionLinePassengerType,
              attractionLinePassengerId:
                subelement.attractionLinePassengerId === null ||
                subelement.attractionLinePassengerId === '' ||
                subelement.attractionLinePassengerId === undefined
                  ? 0
                  : subelement.attractionLinePassengerId,
              attractionLineId:
                element.attractionLineId === null ||
                element.attractionLineId === '' ||
                element.attractionLineId === undefined
                  ? 0
                  : element.attractionLineId,
              attractionLinePassengerStatus: 1,
              attractionLinePassengerCreatedBy: this.authService.getUser(),
              attractionLinePassengerCreatedDate: this.todaydateAndTimeStamp,
              attractionLinePassengerCreatedDevice: this.deviceInfo?.userAgent,
              attractionLinePassengerCreatedIp: 'string',
            };
            modifyPax.push(modifyHolidayPaxData);
          }
        }

        const linesData = {
          // this.activitiesHeaderNumber
          attractionHeaderId:
            element.attractionHeaderId === '' ? this.activitiesHeaderNumber : element.attractionHeaderId,
          attractionLineId:
            element.attractionLineId === null ||
            element.attractionLineId === '' ||
            element.attractionLineId === undefined
              ? 0
              : element.attractionLineId,
          attractionId: Number(element.attractionLineName.activityID),
          attractionLineCity: element.attractionLineName?.city,
          attractionLineCountry: element.attractionLineName?.country,
          attractionLineDate: element.attractionLineDate,
          attractionLineDay: 0,
          attractionLinePassengerStatus: 1,
          //attractionLinePassengerStatus: 1,
          attractionLineLocation: element.attractionLineLocation?.name,
          attractionLineName: element.attractionLineName?.activityName,
          attractionLinePaxCount: Number(element.attractionLinePaxCount),
          passengers: modifyPax,
          //passengers: element.activitiesPax,
          attractionLineCreatedBy: this.authService.getUser(),
          attractionLineCreatedDate: this.todaydateAndTimeStamp,
          attractionLineCreatedDevice: this.deviceInfo?.userAgent,
          attractionLineCreatedIp: 'string',
        };
        convertLines.push(linesData);
      } else {
        const linesData = {
          attractionId: Number(element.attractionLineName.activityID),
          attractionLineCity: element.attractionLineName?.city,
          attractionLineCountry: element.attractionLineName?.country,
          attractionLineDate: element.attractionLineDate,
          attractionLineDay: 0,
          attractionLinePassengerStatus: 1,
          attractionLineLocation: element.attractionLineLocation?.name,
          attractionLineName: element.attractionLineName?.activityName,
          attractionLinePaxCount: Number(element.attractionLinePaxCount),
          passengers: element.activitiesPax,
        };
        convertLines.push(linesData);
      }
    }
    return convertLines;
  }
  clearItems() {
    const items = this.activites.value;
    for (let i = items.length - 1; i >= 0; i--) {
      this.activites.removeAt(i);
    }
  }

  activitiesPaxCount() {
    let totalPaxCount = 0;
    for (let i = 0; i < this.activites.value.length; i++) {
      const element = this.activites.value[i];
      totalPaxCount += Number(element.attractionLinePaxCount);
    }
    return totalPaxCount;
  }

  async onSubmitActivitiesForm() {
    this.submitted = true;
    this.isValidFormSubmitted = false;
    if (this.activitiesForm.invalid) {
      return this.toastr.error('Please fill the required fields', 'Error');
    }
    if (this.activitiesForm.valid) {
      const LINES = this.activitiesLinesDataConversion();
      const onSave = {
        attractionCreatedBy: this.authService.getUser(),
        attractionCreatedDevice: this.deviceInfo?.userAgent,
        attractionCreatedIp: 'string',
        attractionDescription: 'string',
        attractionStatus: 1,
        attractionName: LINES[0]?.attractionLineName,
        attractionRequestId: this.requestId,
        lines: LINES,
      };

      const paxCount = this.activitiesPaxCount();
      try {
        const response = await this.dashboardAsyncApiServices.createPackageItineraryAttractions(
          onSave,
          Holiday_Package.attractionsServiceRequest
        );

        if (response?.attractionId) {

          await this.onSubmitPolicyQualifyProcessStage1();
          await  this.saveAttractionsSrSummayData(response?.attractionId, paxCount);
          this.toastr.success('The service request has been sent successfuly !', 'Success');
          this.router.navigate([`/dashboard/booking/activities`], {
            queryParams: {
              requestId: this.requestId,
              contactId: this.contactId,
              activitiesLineId: response?.attractionId,
              sources: `request-1`,
            },
          });
          this.cdr.markForCheck();
        }
      } catch (error) {
        console.log(error);
      }

    }
  }

  async saveAttractionsSrSummayData(attractionHeaderNumber: number, attractionsPaxCount: number) {
    if (this.srcontactDeatils && attractionHeaderNumber) {
      const productName = 'Attraction';
      const activitiesProductNumber = this.productList?.find((con) => con.name === productName);
      const SUMMARYDATA = {
        contactEmail: this.srcontactDeatils?.contact?.primaryEmail,
        contactId: this.srcontactDeatils?.contact?.id,
        contactName: this.srcontactDeatils?.contact?.firstName + ' ' + this.srcontactDeatils?.contact?.lastName,
        contactPhone: this.srcontactDeatils?.contact?.primaryPhoneNumber,
        deviceInfo: this.deviceInfo?.userAgent,
        loggedInUserId: this.authService.getUser(),
        passengerCount: attractionsPaxCount,
        productId: activitiesProductNumber?.id === undefined ? 4 : activitiesProductNumber?.id,
        serviceRequestId: this.requestId,
        serviceRequestLineId: attractionHeaderNumber,
        travelDateOrCheckInDate: null,
      };
      try {
        await this.dashboardAsyncApiServices.saveSrSummary(SUMMARYDATA, SrSummaryData.SAVESRSUMMARYDATA);
      } catch (error) {
        console.log(error);
        this.toastr.error('Oops! Something went wrong  while send the data please try again', 'Error', {
          progressBar: true,
        });
      }
    }
  }

  findById(activitiesNumber: number) {
    for (let i = this.activites.value?.length - 1; i >= 0; i--) {
      this.activites.removeAt(i);
    }
    this.dashboardRequestService
      .getAttractionsData(activitiesNumber, Holiday_Package.attractionsGetData)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (res: any) => {
          if (res?.attractionId) {
            this.formPacthData(res);
            this.cdr.markForCheck();
          }
        },
        (error) => {
          this.toastr.error(error, 'Error');
          this.cdr.markForCheck();
        }
      );
  }

  formPacthData(formData: any) {
    this.isEdit = true;
    const patchData = formData;
    this.activitiesForm.patchValue({
      attractionName: patchData.attractionName,
      attractionRequestId: patchData.attractionRequestId,
    });
    if (patchData?.lines?.length > 0) {
      for (let index = 0; index < patchData?.lines.length; index++) {
        const linesElement = patchData?.lines[index];
        if (linesElement?.attractionStatus) {
          this.lineStatusName = linesElement.attractionStatus;
        }
        /* if(index > 0 ){
      const fg = this.createFormGroup();
      this.activites.push(fg);
    } */
        const fg = this.createFormGroup();
        this.activites.push(fg);
        const location = {
          name: linesElement.attractionLineLocation,
          city: linesElement.attractionLineCity,
        };
        const attractionName = {
          activityName: linesElement.attractionLineName,
          activityID: linesElement.attractionId,
          city: linesElement.attractionLineCity,
          country: linesElement.attractionLineCountry,
        };
        const attractionsSendData = {
          city: linesElement.attractionLineCity,
        };
        this.getAttrationsData(attractionsSendData, index);
        this.activites.at(index)?.patchValue({
          attractionLineLocation: location,
          attractionLinePaxCount: linesElement.attractionLinePaxCount,
          attractionId: linesElement.attractionId,
          attractionLineCity: linesElement.attractionLineCity,
          attractionLineCountry: linesElement.attractionLineCountry,
          attractionLineName: attractionName,
          attractionHeaderId: linesElement.attractionHeaderId,
          attractionLineId: linesElement.attractionLineId,
          attractionLineDate: this.datepipe.transform(linesElement.attractionLineDate, 'yyyy-MM-dd'),
        });

        if (linesElement?.passengers?.length > 0) {
          //attractionLinePassengerId
          /*  let uniqueArray = linesElement?.passengers.filter((obj, index, self) => {
        return self.map(obj => obj.attractionLinePassengerId).indexOf(obj.attractionLinePassengerId) === index;
    });
    console.log(uniqueArray); */

          for (let subIndex = 0; subIndex < linesElement?.passengers?.length; subIndex++) {
            const element = linesElement?.passengers[subIndex];
            (this.activites.at(index)?.get('activitiesPax') as FormArray)?.push(this.fb.group(element));
          }
        }
      }
    }
    this.onSubmitPolicyQualifyProcessStage1();
  }

  onUpdateActivitiesForm() {
    this.submitted = true;
    this.isValidFormSubmitted = false;
    if (this.activitiesForm.invalid) {
      return this.toastr.error('Please fill the required fields', 'Error');
    }

    if (this.activitiesForm.valid) {
      const LINES = this.activitiesLinesDataConversion();
      const onUpdateSave = {
        attractionUpdatedBy: this.authService.getUser(),
        attractionUpdatedDevice: this.deviceInfo?.userAgent,
        attractionUpdatedIp: 'string',
        attractionDescription: 'string',
        attractionName: LINES[0]?.attractionLineName,
        attractionRequestId: this.requestId,
        attractionStatus: 1,
        lines: LINES,
      };

      this.dashboardRequestService
        .updatePackageItineraryAttractions(
          this.activites.value[0].attractionHeaderId,
          onUpdateSave,
          Holiday_Package.attractionsUpdate
        )
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe(
          (res: any) => {
            if (res?.attractionId) {
              //this.onSubmitPolicyQualifyProcessStage1();
              this.toastr.success('The service request has been updated successfuly !', 'Success');
              let updateValue = 1;
              updateValue += Number(this.route.snapshot.queryParams?.sources?.split('-')[1]);
              this.router.navigate([`/dashboard/booking/activities`], {
                queryParams: {
                  requestId: this.requestId,
                  contactId: this.contactId,
                  activitiesLineId: res?.attractionId,
                  sources: `request-${Number.isNaN(updateValue) ? 1 : updateValue}`,
                },
              });
              this.cdr.markForCheck();
            }
          },
          (error) => {
            this.toastr.error(error, 'Error');
            this.cdr.markForCheck();
          }
        );
    }
  }

  offline() {
    let requestId = this.requestId;
    let reqLineId = this.activitiesHeaderNumber;
    if (requestId && reqLineId) {
      const offlineUrl = `${environment.RFQREDIRECTOFFLINE}redirect?sr_no=${requestId}&sr_line_no=${reqLineId}&product=attraction&channel=offline`;
      window.open(offlineUrl, '_blank');
    }
  }

  createActivitiesRfq() {
    this.submitted = true;
    this.isValidFormSubmitted = false;
    if (this.activitiesForm.invalid) {
      return this.toastr.error('Please fill the required fields', 'Error');
    }
    if (this.activitiesForm.valid) {
      const LINES = this.activitiesLinesDataConversion();
      const onSave = {
        attractionCreatedBy: this.authService.getUser(),
        attractionCreatedDevice: this.deviceInfo?.userAgent,
        attractionCreatedIp: 'string',
        attractionDescription: 'string',
        attractionStatus: 1,
        attractionName: LINES[0]?.attractionLineName,
        attractionRequestId: this.requestId,
        attractionRequestLineId: this.activitiesHeaderNumber,
        lines: LINES,
      };

      this.rfqServices
        .saveRfqAttractions(onSave, RFQAttractions.rfqAttractionsRequest, 0)
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe(
          (res: any) => {
            if (res?.rfqAttractionId) {
              const queryParams = {
                requestId: this.requestId,
                contactId: this.contactId,
                srLine: res?.attractionRequestLineId,
                activitiesRfq: res?.rfqAttractionId,
              };
              const ACTIVITIES_RFQ_URL = this.router
                .createUrlTree(['/dashboard/rfq/activities'], { queryParams })
                .toString();
              window.open(ACTIVITIES_RFQ_URL, '_blank');
            }
          },
          (error) => {
            this.toastr.error(error, 'Error');
          }
        );
    }
  }

  removeActivitiesLinesDataConversion(removeLine: any[], attractionLinePassengerId: number, lineStatus: number) {
    let convertLines = [];
    if (removeLine?.length > 0) {
      for (let index = 0; index < removeLine.length; index++) {
        const element = removeLine[index];
        let modifyPax = [];
        if (element.activitiesPax?.length > 0) {
          for (let subindex = 0; subindex < element.activitiesPax.length; subindex++) {
            const subelement = element.activitiesPax[subindex];
            const modifyHolidayPaxData = {
              attractionLinePassengerTitle: subelement.attractionLinePassengerTitle,
              attractionLinePaxId: subelement.attractionLinePaxId,
              attractionLinePassengerFristName: subelement.attractionLinePassengerFristName,
              attractionLinePassengerLastName: subelement.attractionLinePassengerLastName,
              attractionLinePassengerGender: subelement.attractionLinePassengerGender,
              attractionLinePassengerDob: subelement.attractionLinePassengerDob,
              attractionLinePassengerEmail: subelement.attractionLinePassengerEmail,
              attractionLinePassengerPhone: subelement.attractionLinePassengerPhone,
              attractionLinePassengerType: subelement.attractionLinePassengerType,
              attractionLinePassengerId:
                subelement.attractionLinePassengerId === null ||
                subelement.attractionLinePassengerId === '' ||
                subelement.attractionLinePassengerId === undefined
                  ? 0
                  : subelement.attractionLinePassengerId,
              attractionLineId:
                element.attractionLineId === null ||
                element.attractionLineId === '' ||
                element.attractionLineId === undefined
                  ? 0
                  : element.attractionLineId,
              attractionLinePassengerStatus: 0,
              attractionLinePassengerCreatedBy: this.authService.getUser(),
              attractionLinePassengerCreatedDate: this.todaydateAndTimeStamp,
              attractionLinePassengerCreatedDevice: this.deviceInfo?.userAgent,
              attractionLinePassengerCreatedIp: 'string',
            };
            modifyPax.push(modifyHolidayPaxData);
          }
        }

        if (attractionLinePassengerId) {
          const linesData = {
            // this.activitiesHeaderNumber
            attractionHeaderId:
              element.attractionHeaderId === '' ? this.activitiesHeaderNumber : element.attractionHeaderId,
            attractionLineId:
              element.attractionLineId === null ||
              element.attractionLineId === '' ||
              element.attractionLineId === undefined
                ? 0
                : element.attractionLineId,
            attractionId: Number(element.attractionLineName.activityID),
            attractionLineCity: element.attractionLineName?.city,
            attractionLineCountry: element.attractionLineName?.country,
            attractionLineDate: element.attractionLineDate,
            attractionLineDay: 0,
            attractionLinePassengerStatus: lineStatus,
            attractionLineLocation: element.attractionLineLocation?.name,
            attractionLineName: element.attractionLineName?.activityName,
            attractionLinePaxCount: Number(element.attractionLinePaxCount),
            passengers: modifyPax.filter((v) => v.attractionLinePassengerId === attractionLinePassengerId),
            attractionLineCreatedBy: this.authService.getUser(),
            attractionLineCreatedDate: this.todaydateAndTimeStamp,
            attractionLineCreatedDevice: this.deviceInfo?.userAgent,
            attractionLineCreatedIp: 'string',
          };
          convertLines.push(linesData);
        } else {
          const linesData = {
            // this.activitiesHeaderNumber
            attractionHeaderId:
              element.attractionHeaderId === '' ? this.activitiesHeaderNumber : element.attractionHeaderId,
            attractionLineId:
              element.attractionLineId === null ||
              element.attractionLineId === '' ||
              element.attractionLineId === undefined
                ? 0
                : element.attractionLineId,
            attractionId: Number(element.attractionLineName.activityID),
            attractionLineCity: element.attractionLineName?.city,
            attractionLineCountry: element.attractionLineName?.country,
            attractionLineDate: element.attractionLineDate,
            attractionLineDay: 0,
            attractionLinePassengerStatus: lineStatus,
            attractionLineLocation: element.attractionLineLocation?.name,
            attractionLineName: element.attractionLineName?.activityName,
            attractionLinePaxCount: Number(element.attractionLinePaxCount),
            passengers: modifyPax,
            attractionLineCreatedBy: this.authService.getUser(),
            attractionLineCreatedDate: this.todaydateAndTimeStamp,
            attractionLineCreatedDevice: this.deviceInfo?.userAgent,
            attractionLineCreatedIp: 'string',
          };
          convertLines.push(linesData);
        }
      }
    }

    return convertLines;
  }

  removeLines(
    selectedLines: any[],
    mainIndex: number,
    subIndex: number,
    attractionLinePassengerId: number,
    lineStatus: number
  ) {
    this.submitted = true;
    this.isValidFormSubmitted = false;
    if (this.activitiesForm.invalid) {
      return this.toastr.error('Please fill the required fields', 'Error');
    }

    if (this.activitiesForm.valid) {
      const onUpdateSave = {
        attractionUpdatedBy: this.authService.getUser(),
        attractionUpdatedDevice: this.deviceInfo?.userAgent,
        attractionUpdatedIp: 'string',
        attractionDescription: 'string',
        attractionName: `Attractions-${this.requestId}`,
        attractionRequestId: this.requestId,
        attractionStatus: 1,
        lines: this.removeActivitiesLinesDataConversion(selectedLines, attractionLinePassengerId, lineStatus),
      };

      this.dashboardRequestService
        .updatePackageItineraryAttractions(
          this.activites.value[0].attractionHeaderId,
          onUpdateSave,
          Holiday_Package.attractionsUpdate
        )
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe(
          (res: any) => {
            if (res?.attractionId) {
              if (attractionLinePassengerId) {
                this.activitiesPersonListData(mainIndex).removeAt(subIndex);
                this.showActivitiesPaxInfo(mainIndex);
                this.toastr.success('The activitie  pax has been delete successfuly !', 'Success');

                let updateValue = 1;
                updateValue += Number(this.route.snapshot.queryParams?.sources?.split('-')[1]);
                this.router.navigate([`/dashboard/booking/activities`], {
                  queryParams: {
                    requestId: this.requestId,
                    contactId: this.contactId,
                    activitiesLineId: res?.attractionId,
                    sources: `request-${Number.isNaN(updateValue) ? 1 : updateValue}`,
                  },
                });
                this.cdr.markForCheck();
              } else {
                this.activites.removeAt(mainIndex);
                this.toastr.success('The activitie has been delete successfuly !', 'Success');

                let updateValue = 1;
                updateValue += Number(this.route.snapshot.queryParams?.sources?.split('-')[1]);
                this.router.navigate([`/dashboard/booking/activities`], {
                  queryParams: {
                    requestId: this.requestId,
                    contactId: this.contactId,
                    activitiesLineId: res?.attractionId,
                    sources: `request-${Number.isNaN(updateValue) ? 1 : updateValue}`,
                  },
                });
                this.cdr.markForCheck();
              }
            }
          },
          (error) => {
            this.toastr.error(error, 'Error');
            this.cdr.markForCheck();
          }
        );
    }
  }

  initializeForm() {
    this.activitiesForm = this.fb.group({
      attractionName: '',
      attractionRequestId: '',

      activites: this.fb.array([], [Validators.required]), //this.createFormGroup()
    });
  }

  createFormGroup() {
    return this.fb.group({
      attractionHeaderId: '',
      attractionLineId: '',
      attractionId: '',
      attractionLineCity: '',
      attractionLineCountry: '',
      attractionLineDate: ['', [Validators.required]],
      attractionLineDay: '',
      attractionLineLocation: ['', [Validators.required]],
      attractionLineName: [null, [Validators.required]],
      attractionLinePaxCount: '1',
      activitiesPax: this.fb.array([]),
    });
  }

  get activites(): FormArray {
    return this.activitiesForm.get('activites') as FormArray;
  }
  addActivities(mainIndex: number) {
    this.isValidFormSubmitted = true;
    const fg = this.createFormGroup();
    this.activites.push(fg);
    this.locationCopyToNextLines(mainIndex);
  }
  deleteActivities(idx: number, lineNumber: number) {
    swal
      .fire({
        title: 'Are you sure ',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, remove it!',
        cancelButtonText: 'No, cancel!',
        customClass: {
          confirmButton: 'btn btn-outline-primary',
          cancelButton: 'btn btn-outline-primary  ml-1',
        },
        buttonsStyling: false,
      })
      .then((result) => {
        if (result.value) {
          if (this.activites.controls?.length > 1) {
            if (lineNumber) {
              const removeActivitieLine = this.activites.value.filter((v) => v.attractionLineId === lineNumber);
              this.removeLines(removeActivitieLine, idx, 0, null, 0);
            } else {
              this.activites.removeAt(idx);
            }
          }
          this.cdr.markForCheck();
        }
      });
  }
  activitiesPersonListData(i: number): FormArray {
    return this.activites.at(i).get('activitiesPax') as FormArray;
  }
  // remove activities pax list
  deleteActivitiesPax(
    mainIndex: number,
    subIndex: number,
    attractionLinePassengerId: number,
    attractionLineId: number
  ) {
    swal
      .fire({
        title: 'Are you sure ',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, remove it!',
        cancelButtonText: 'No, cancel!',
        customClass: {
          confirmButton: 'btn btn-outline-primary',
          cancelButton: 'btn btn-outline-primary  ml-1',
        },
        buttonsStyling: false,
      })
      .then((result) => {
        if (result.value) {
          if (this.activitiesPersonListData(mainIndex).length > 0) {
            if (attractionLinePassengerId && attractionLineId) {
              //const reomovePax=this.activites.at(mainIndex).value.activitiesPax.filter((v)=>v.attractionLinePassengerId ===attractionLinePassengerId);

              const removeActivitieLine = this.activites.value.filter((v) => v.attractionLineId === attractionLineId);

              this.removeLines(removeActivitieLine, mainIndex, subIndex, attractionLinePassengerId, 1);
            } else {
              this.activitiesPersonListData(mainIndex).removeAt(subIndex);
              this.showActivitiesPaxInfo(mainIndex);
            }
          }
          this.cdr.markForCheck();
        }
      });
  }
  get f() {
    return this.activitiesForm.controls;
  }

  activitiesFormReset() {
    this.submitted = false;
    this.isValidFormSubmitted = false;
    this.activitiesForm.reset();
  }
  deleteQueryParameterFromCurrentRoute() {
    this.isEdit = false;

    for (let i = this.activites.value?.length - 1; i >= 0; i--) {
      this.activites.removeAt(i);
    }

    let updateValue = 1;
    updateValue += Number(this.route.snapshot.queryParams?.sources?.split('-')[1]);
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([`/dashboard/booking/activities`], {
      queryParams: {
        requestId: this.requestId,
        contactId: this.contactId,
        sources: `request-${Number.isNaN(updateValue) ? 1 : updateValue}`,
      },
    });
  }

 async  onSubmitPolicyQualifyProcessStage1() {
    const productName = 'Attraction';
    const customerDetailsBySrId = this.authService.getCustomerType();
    const activitiesProductNumber = this.productList?.find((con) => con.name === productName);
    const ON_SAVE_POLICY = {
      productId:
        activitiesProductNumber?.id === '' ||
        activitiesProductNumber?.id === null ||
        this.productList === undefined ||
        activitiesProductNumber == undefined ||
        activitiesProductNumber == null
          ? 4
          : activitiesProductNumber?.id,
      customerId: customerDetailsBySrId?.customerId,
      bookingDate: this.activites.at(0)?.value?.attractionLineDate,
      tktTypeId: 4,
      routes: [],
    };
    try {
      const response:any = await this.dashboardAsyncApiServices.policyTemplateProcessStage1(
        policy.policyTemplateProcessStage1, ON_SAVE_POLICY
      );
      const result = response;
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
    } catch (error) {
      console.log(error);
      this.toastr.error('opps someting went wrong please try agagin policy request', 'Error', {
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
    // get the paramas
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param && param.requestId && param.contactId) {
        this.requestId = Number(param.requestId);
        this.contactId = Number(param.contactId);
      }

      if (param && param.activitiesLineId) {
        this.activitiesHeaderNumber = Number(param.activitiesLineId);
        this.findById(Number(param.activitiesLineId));
      } else {
        this.addActivities(0);
      }
    });
    this.srcontactDeatils = this.authService.getRequestDetails();
  }

  trackByFn(index, item) {
    return index;
  }
  ngOnInit(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.keys = this.authService.getPageKeys();
    this.initializeForm();
    this.selectedPassengers();
    this.getProductType();
    this.getRequestContactDetails();

    this.getQueryParams();
  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
