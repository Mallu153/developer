import { ChangeDetectorRef } from '@angular/core';
/* import { TokenStorageService } from 'app/shared/auth/token-storage.service'; */
import { filter } from 'rxjs/operators';
import { AuthService } from 'app/shared/auth/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';

import { SERVICE_FE_URL, SERVICE_PRICING_URL, SERVICE_TYPE_URL } from 'app/shared/constant-url/service-type';

import { ServiceTypeService } from 'app/shared/services/service-type.service';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Subject, Subscription } from 'rxjs';
import { DeviceDetectorService } from 'ngx-device-detector';
import { MODULE } from 'app/shared/constant-url/modules';
import { ServiceAssignment, ServiceAttachments, ServiceDocuments } from 'app/shared/models/service-request';
import { ApiResponse } from 'app/shared/models/api-response';
import { AnxRequest } from '../../models/anx';
import { ANX_API, ANX_PAX_API } from '../../constants/anx-api';
import { environment } from 'environments/environment';
import { AddPassengerFormComponent } from 'app/pages/dashboard/dashboard-booking/components/add-passenger-form/add-passenger-form.component';
import { AncillarySelectComponent } from 'app/pages/dashboard/dashboard-request/components/search-result/ancillary-select/ancillary-select.component';
import { Passengers } from 'app/pages/dashboard/dashboard-request/model/selectedPassengers';
import { SelectedPassengersService } from 'app/pages/dashboard/dashboard-booking/share-data-services/selected-passenger.service';
import { DatePipe, formatDate } from '@angular/common';
import { AncillaryAddonsComponent } from './ancillary-addons/ancillary-addons.component';
import { RfqService } from 'app/pages/dashboard/rfq/rfq-services/rfq.service';
import { RFQ_Ancillary } from 'app/pages/dashboard/rfq/rfq-url-constants/apiurl';
import { DashboardRequestService } from 'app/pages/dashboard/dashboard-request/services/dashboard-request.service';
import { policy, SrSummaryData } from 'app/pages/dashboard/dashboard-request/url-constants/url-constants';
import { SrSummaryDataService } from 'app/pages/dashboard/dashboard-booking/share-data-services/srsummarydata.service';
import { RequestContactInfo } from 'app/shared/models/request-contact-info';
import { MasterDataService } from 'app/shared/services/master-data.service';
import { PERMISSION_KEYS } from 'app/shared/data/app-premission-key';
import { PolicyQualifyProcessStage1Component } from 'app/pages/dashboard/dashboard-booking/components/policy-qualify-process-stage1/policy-qualify-process-stage1.component';
@Component({
  selector: 'app-service-request',
  templateUrl: './service-request.component.html',
  styleUrls: ['./service-request.component.scss'],
})
export class ServiceRequestComponent implements OnInit, OnDestroy {
  formInput: any[];
  formInputPatchData: any;
  title: string;
  serviceData: any;
  serviceTypeHeader: any;
  isEdit: boolean = false;

  active: number;
  disabled: boolean = false;
  isToggle: boolean = false;
  serviceTypeId: string;
  serviceRequestData: any = {};
  routeSub: Subscription;
  serviceDocuments: ServiceDocuments[];
  serviceAttachments: ServiceAttachments[];
  serviceAssignment: ServiceAssignment;
  serviceAssignmentTeamAndUser: { team: any; user: any };
  serviceRequestAttachments: any[];
  anxServiceRequestForm: FormGroup;

  formOnSubmitEvent: Subject<void> = new Subject<void>(); // for dynamic form event trigger
  formOnSubmitResetEvent: Subject<void> = new Subject<void>(); // for dynamic form event trigger
  attachmentOnSubmitEvent: Subject<void> = new Subject<void>(); // for attachment form event trigger
  priceOnSubmitEvent: Subject<void> = new Subject<void>(); // for attachment form event trigger

  loading: boolean = false; // for loading button
  isSubmitRequest: boolean = false; // for check submit request
  ipAddress: string;
  paramsData: any;

  srStatusOpen = 1031;
  srStatusSubmit = 1032;
  user: any;
  requestId: number;
  contactId: number;
  anxLineId: number;

  //passengers list
  passengersList: Passengers[] = [];
  paxId: any[] = [];
  ancillaryAddons:any=[]
  //today date
  todayDate = new Date();
  todayDate1: string;
  todaydateAndTimeStamp: string;
  //pagination
  public isCollapsedSelectedPersons = true;
  page = 1;
  pageSize = 10;
  collectionSize: number;
  //ipaddress
  deviceInfo = null;
  isDesktopDevice: boolean;
  isTablet: boolean;
  isMobile: boolean;

  private contactDetails: any = {};
  private productList: any = null;
/**
 *
 *
 * ANX form elements premissions
 */
keys=[];


anxAddPax=PERMISSION_KEYS.BOOKING.ANCILLARY.ANCILLARY_PAX_ADD;
anxLpo=PERMISSION_KEYS.BOOKING.ANCILLARY.ANCILLARY_LPO_DETAILS;
anxAddons=PERMISSION_KEYS.BOOKING.ANCILLARY.ANCILLARY_ADDONS;


/**
 *
 *
 *  ANX buttons premissions
 */
anxSaveBtn=PERMISSION_KEYS.BOOKING.ANCILLARY.ANCILLARY_SAVE;
anxUpdateBtn=PERMISSION_KEYS.BOOKING.ANCILLARY.ANCILLARY_UPDATE;
anxRFQBtn=PERMISSION_KEYS.BOOKING.ANCILLARY.ANCILLARY_RFQ;
anxFulfillmentBtn=PERMISSION_KEYS.BOOKING.ANCILLARY.ANCILLARY_FULFILLMENT;


/**
 *
 *
 * product link  premissions
 */
  flightLink=PERMISSION_KEYS.BOOKING.ANCILLARY.PRODUCT_LINK_FLIGHT;
  hotelLink=PERMISSION_KEYS.BOOKING.ANCILLARY.PRODUCT_LINK_HOTEL;
  ancillaryLink=PERMISSION_KEYS.BOOKING.ANCILLARY.PRODUCT_LINK_ANCILLARY;
  holidayLink=PERMISSION_KEYS.BOOKING.ANCILLARY.PRODUCT_LINK_HOLIDAY;
  activityLink=PERMISSION_KEYS.BOOKING.ANCILLARY.PRODUCT_LINK_ACTIVITY;

  policyList = [];

  lineStatusName:string;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private serviceTypeService: ServiceTypeService,
    private auth: AuthService,
    private deviceService: DeviceDetectorService,
    private cd: ChangeDetectorRef,
    private SelectedPassengersService: SelectedPassengersService,
    private datepipe: DatePipe,
    private modalService: NgbModal, // private tokenStorage: TokenStorageService
    private rfqServices:RfqService,
    private dashboardRequestService: DashboardRequestService,
    public masterDataService: MasterDataService,
  ) {
    this.todayDate1 = this.datepipe.transform(this.todayDate, 'yyyy-MM-dd');
    this.todaydateAndTimeStamp = formatDate(this.todayDate, 'yyyy-MM-ddThh:mm:ss', 'en-US', '+0530');
    this.epicFunction();

  }

  epicFunction() {
    this.deviceInfo = this.deviceService.getDeviceInfo();
    this.isMobile = this.deviceService.isMobile();
    this.isTablet = this.deviceService.isTablet();
    this.isDesktopDevice = this.deviceService.isDesktop();

  }

  getParams() {
    this.routeSub = this.route.queryParams.subscribe((param) => {
      const serviceTypeId = param?.serviceTypeId;
      const requestId = param?.requestId;
      const anxLineId = param?.anxLineId;
      // params data
      this.requestId = param?.requestId;
      this.contactId = param?.contactId;
      this.anxLineId = param?.anxLineId;
       if( this.requestId){
        this.getRequestContactDetails( this.requestId);
       }
      if (param && serviceTypeId && requestId && !anxLineId) {
        this.paramsData = param;
        this.initializeForm(atob(unescape(serviceTypeId)), requestId);
        this.active = 1;
        this.formInput = [];
        this.serviceTypeId = atob(unescape(serviceTypeId));
        this.getCreateData(atob(unescape(serviceTypeId)));
      } else if (param && serviceTypeId && requestId && anxLineId) {
        this.initializeForm(atob(unescape(serviceTypeId)), requestId);
        this.active = 1;
        this.formInput = [];
        this.serviceTypeId = atob(unescape(serviceTypeId));
        this.isEdit = true;
        this.getEditData(atob(unescape(serviceTypeId)), anxLineId, this.requestId);
      }
    });
    this.selectedPassengers();
    this.getAddonsResponseData();

  }

  // form create process
  getCreateData(serviceTypeId: string) {
    let serviceTypHeader = this.serviceTypeService.read(SERVICE_TYPE_URL.GET_SERVICE_TYPE_HEADER + serviceTypeId);
    let serviceTypeLines = this.serviceTypeService.read(SERVICE_TYPE_URL.GET_SERVICE_TYPE_FORM_LINES + serviceTypeId);
    this.routeSub = forkJoin([serviceTypHeader, serviceTypeLines]).subscribe((results) => {
      if (results[0]?.data && results[0]?.data.length > 0 && results[1]?.data && results[1].data?.length > 0) {
        this.formInput = results[1]?.data;
        this.serviceTypeHeader = results[0]?.data[0];
        this.anxServiceRequestForm.patchValue({
          anxLineType: this.serviceTypeHeader.name,
          anxLineTypeId: this.serviceTypeHeader.id,
        });
        this.title = this.serviceTypeHeader.name;
        //new form passengers empty
        this.passengersList=[];
        this.paxId = [];
        // this.getAttachmentsAndDocuments(serviceTypeId);
        // this.getServiceTypeAssignments(serviceTypeId);
        this.cd.markForCheck();
      }
    });
  }
  // form update process
  getEditData(serviceTypeId: string, anxLineId: string, requestId: any) {
    this.routeSub = forkJoin(
      this.serviceTypeService.read(ANX_API.FIND + requestId + '/' + anxLineId),
      this.serviceTypeService.read(SERVICE_TYPE_URL.GET_SERVICE_TYPE_HEADER + serviceTypeId),
      this.serviceTypeService.read(SERVICE_TYPE_URL.GET_SERVICE_TYPE_FORM_LINES + serviceTypeId)
    ).subscribe(
      ([dataFromMethod1, dataFromMethod2, dataFromMethod3]) => {
        if (
          dataFromMethod1 &&
          dataFromMethod2?.data &&
          dataFromMethod2.data?.length > 0 &&
          dataFromMethod3?.data &&
          dataFromMethod3.data?.length > 0
        ) {
          const anxLineData: any = dataFromMethod1;
          // this.serviceData = dataFromMethod2?.data[0];
          this.serviceTypeHeader = dataFromMethod2?.data[0];
          this.formInput = dataFromMethod3?.data;
          this.formInputPatchData = anxLineData?.anxServiceRequestLine?.anxLineJson;
          if(anxLineData?.anxServiceRequestLine?.ancillaryLineStatus){

            this.lineStatusName=anxLineData?.anxServiceRequestLine?.ancillaryLineStatus;
          }
          this.title = dataFromMethod2.data[0]?.name;
          if (anxLineData?.anxServiceRequestLine) {
            this.anxServiceRequestForm.patchValue({
              anxLineLpoDate: this.datepipe.transform(anxLineData.anxServiceRequestLine.anxLineLpoDate, 'yyyy-MM-dd'),
              anxLineId: anxLineData.anxServiceRequestLine.anxLineId,
              anxLineAddons: anxLineData.anxServiceRequestLine.anxLineAddons,
              anxLineAdtCount: anxLineData.anxServiceRequestLine.anxLineAdtCount,
              anxLineAttr1: anxLineData.anxServiceRequestLine.anxLineAttr1,
              anxLineAttr2: anxLineData.anxServiceRequestLine.anxLineAttr2,
              anxLineAttr3: anxLineData.anxServiceRequestLine.anxLineAttr3,
              anxLineAttr4: anxLineData.anxServiceRequestLine.anxLineAttr4,
              anxLineAttr5: anxLineData.anxServiceRequestLine.anxLineAttr5,
              anxLineAttr6: anxLineData.anxServiceRequestLine.anxLineAttr6,
              anxLineChdCount: anxLineData.anxServiceRequestLine.anxLineChdCount,
              anxLineInfCount: anxLineData.anxServiceRequestLine.anxLineInfCount,
              anxLineJson: anxLineData.anxServiceRequestLine.anxLineJson,
              anxLineLpoAmount: anxLineData.anxServiceRequestLine.anxLineLpoAmount,
              anxLineLpoNumber: anxLineData.anxServiceRequestLine.anxLineLpoNumber,
              anxLineRequestId: anxLineData.anxServiceRequestLine.anxLineRequestId, // request id
              lineUuid: anxLineData.anxServiceRequestLine.lineUuid,
              anxLineStatus: anxLineData.anxServiceRequestLine.anxLineStatus,
              anxLineType: anxLineData.anxServiceRequestLine.anxLineType,
              anxLineTypeId: anxLineData.anxServiceRequestLine.anxLineTypeId,
              deviceInfo: anxLineData.anxServiceRequestLine.deviceInfo,
              deviceIp: anxLineData.anxServiceRequestLine.deviceIp,
              loggedInUserId: anxLineData.anxServiceRequestLine.loggedInUserId,
              //anxLineLpoDate:'2022-08-30',
            });
          }
          if (anxLineData?.anxPaxServiceRequestLine.length > 0) {
            let personArray = [];
            for (let index = 0; index < anxLineData?.anxPaxServiceRequestLine.length; index++) {
              const element = anxLineData?.anxPaxServiceRequestLine[index];
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
            const paxData={
              passengers: personArray,
            }
            this.SelectedPassengersService.sendData(paxData);
          }

          if(anxLineData?.anxAddons.length > 0){
            this.ancillaryAddons=anxLineData?.anxAddons;
          }else{
            this.ancillaryAddons=[];
          }

          this.onSubmitPolicyQualifyProcessStage1();
          //this.anxServiceRequestForm.patchValue(anxLineData);
          this.cd.markForCheck();
          // this.formSetup(resData?.data[0].serviceTypesLines);
        } else {
          this.toastr.error('No data found');
        }
      },
      (error) => console.error(error),
      () => {
        // do things when all subscribes are finished
        // this.fillform();
      }
    );
  }

  initializeForm(serviceTypeId: string, requestId: any) {
    this.anxServiceRequestForm = this.fb.group({
      anxLineId: 0,
      anxLineAddons: null,
      anxLineAdtCount: 1,
      anxLineAttr1: '',
      anxLineAttr2: '',
      anxLineAttr3: '',
      anxLineAttr4: '',
      anxLineAttr5: '',
      anxLineAttr6: '',
      anxLineChdCount: 0,
      anxLineInfCount: 0,
      anxLineJson: ['', [Validators.required]],
      anxLineLpoAmount: 0,
      anxLineLpoDate: '',
      anxLineLpoNumber: '',
      anxLineRequestId: [requestId, [Validators.required]], // request id
      lineUuid: 0,
      anxLineStatus: 0,
      anxLineType: ['', [Validators.required]],
      anxLineTypeId: [serviceTypeId, [Validators.required]],
      deviceInfo: '',
      deviceIp: '',
      loggedInUserId: [this.auth.getUser(), [Validators.required]],
    });
  }

  getAttachmentsAndDocuments(serviceTypeId) {
    let serviceTypeDocuments = this.serviceTypeService.read(
      SERVICE_TYPE_URL.GET_SERVICE_DOCUMENTS_BY_SERVICE_TYPE_HEADER_ID + serviceTypeId
    );
    let serviceTypeAttachments = this.serviceTypeService.read(
      SERVICE_TYPE_URL.GET_SERVICE_ATTACHMENTS_BY_SERVICE_TYPE_HEADER_ID + serviceTypeId
    );
    this.routeSub =forkJoin([serviceTypeDocuments, serviceTypeAttachments]).subscribe((results) => {
      if (results[0]?.data && results[0]?.data.length > 0) {
        this.serviceDocuments = results[0]?.data;
        //  this.serviceRequestShareData.sendServiceDocumentsData(this.serviceDocuments);
      }
      if (results[1]?.data && results[1]?.data.length > 0) {
        this.serviceAttachments = results[1]?.data;
        // this.serviceRequestShareData.sendServiceAttachmentsData(this.serviceAttachments);
      }
    });
  }
  // get configuration
  getServiceTypeAssignments(serviceTypeId: any) {
    this.routeSub =this.serviceTypeService
      .read(SERVICE_TYPE_URL.GET_SERVICE_ASSIGNMENTS_BY_SERVICE_TYPE_HEADER_ID + serviceTypeId)
      .subscribe((res) => {
        const serviceResult = res;
        if (serviceResult.status === 200) {
          if (serviceResult.data && serviceResult.data?.length > 0) {
            this.serviceAssignment = serviceResult.data[0];
            // get status configuration
            this.routeSub= this.serviceTypeService
              .read(
                SERVICE_TYPE_URL.GET_SERVICE_STATUS_CONFIGURATION_BY_DEFAULT_STATUS +
                  this.serviceAssignment.defaultStatus +
                  '&module=' +
                  MODULE.SERVICE +
                  '&organization=' +
                  this.serviceTypeHeader.organizationId
              )
              .subscribe(
                (config) => {
                  const result = config;
                  if (result.status == 200) {
                    const team = result.data[0].team;
                    const user = result.data[0].users;
                    if (team && team.length > 0) {
                      if (team.length === 1) {
                        //this.teams = team;
                        if (user && user.length > 0) {
                          const userData = user.filter((v) => v.isTeamLeader === true);
                          if (userData.length > 1) {
                            this.toastr.error('This configuration have more assign users');
                          }
                          this.serviceAssignmentTeamAndUser = {
                            team: team[0],
                            user: userData[0],
                          };
                        } else {
                          this.toastr.error('This configuration does not have assign users');
                        }
                      } else {
                        this.toastr.error('This configuration have More teams');
                      }
                    } else {
                      this.toastr.error('No Configuration found');
                    }
                  } else {
                    this.toastr.error(result.message);
                  }
                },
                (err) => {
                  this.toastr.error('Something went wrong while fetching status');
                }
              );
          } else {
            this.toastr.error('Assignment configuration not found');
          }
        } else {
          this.toastr.error(serviceResult.message);
        }
      });
  }
  next() {
    // check if submit requested is already requested or not
    if (this.isSubmitRequest) {
      return;
    }
    // from step 1
    if (this.active === 1) {
      // check form is valid or invalid in dynamic form

      this.formOnSubmitEvent.next();
    }
    if (this.active > 1) {
      if (this.active == 2) {
        this.attachmentOnSubmitEvent.next();
      } else {
        this.active = 3;
      }
    }
  }
  back() {
    if (this.active > 1) {
      if (this.serviceAttachments && this.serviceAttachments?.length > 0 && this.active == 3) {
        this.active = 2;
      } else {
        this.active = 1;
      }
    }
  }
  getFormData(event: any) {
    this.serviceRequestData = event;
    this.anxServiceRequestForm.value.anxLineId
      ? this.updateService(this.serviceRequestData)
      : this.createService(this.serviceRequestData);
    return;
    // this.formInputPatchData = event;
    this.serviceRequestData = event;
    if (this.serviceAttachments && this.serviceAttachments?.length > 0) {
      this.anxServiceRequestForm.value.anxLineId
        ? this.updateService(this.serviceRequestData)
        : this.createService(this.serviceRequestData);
    } else {
      this.active = 3;
    }

    /* if (this.isEdit) {
      this.updateService(event);
    } else {
      this.createService(event);
    } */
  }
  getSubmittedAttachments(event: any) {
    this.serviceRequestAttachments = event;
    this.active = 3;
  }
  gotoAttachments() {
    if (this.serviceAttachments && this.serviceAttachments.length > 0) {
      this.active = 2;
    } else {
      this.active = 3;
    }
  }

  /**
   * create request
   * @param data  form data
   * @returns
   */
  createService(data: any) {
    let formData = { ...data };
    this.anxServiceRequestForm.patchValue({
      anxLineJson: formData,
      loggedInUserId: this.auth.getUser(),
      deviceInfo: this.deviceService.deviceType,
    });
    if (this.anxServiceRequestForm.invalid) {
      return;
    }
    if (this.isSubmitRequest) {
      return;
    }

    this.loading = true;
    this.isSubmitRequest = true;

    this.routeSub=this.serviceTypeService.create(ANX_API.CREATE, this.anxServiceRequestForm.value).subscribe(
      (res:any) => {
        const result: any = res;
        /*   if (result.status === 200) { */
        this.anxServiceRequestForm.patchValue(result);
        this.onSaveAncillaryPax(result);
        this.saveSrSummayData(res?.anxLineId);
        this.loading = false;
        this.isSubmitRequest = false;
        // this.gotoAttachments();
        this.toastr.success('Anx created');
        this.onSubmitPolicyQualifyProcessStage1();
        this.router.navigate(['/dashboard/booking/ancillary'], {
          queryParams: {
            requestId: this.requestId,
            contactId: this.contactId,
            serviceTypeId: btoa(escape(this.serviceTypeId)),
            anxLineId: result.anxLineId,
          },
        });
        //this.reloadComponent();
        this.cd.markForCheck();
        //  this.router.navigate(['/dashboard/request/all-service-requests']);
        /*  this.router.navigate(["/render/view/service/list"]); */
        /*  } else {

          this.toastr.error(result.message);
        } */
      },
      (err) => {
        this.loading = false;
        this.isSubmitRequest = false;
        this.toastr.error(err);
      }
    );
  }
  /**
   * update request
   * @param data dynamic form data
   * @returns
   */
  updateService(data, submit?: boolean) {
    let formData = { ...data };
    this.anxServiceRequestForm.patchValue({
      anxLineJson: formData,
      loggedInUserId: this.auth.getUser(),
      deviceInfo: this.deviceService.deviceType,
    });
    if (this.anxServiceRequestForm.invalid) {
      return;
    }
    if (this.isSubmitRequest) {
      return;
    }
    this.loading = true;
    this.isSubmitRequest = true;
    this.routeSub=this.serviceTypeService
      .update(ANX_API.UPDATE + this.anxServiceRequestForm.value.anxLineId, this.anxServiceRequestForm.value)
      .subscribe(
        (res:any) => {
          const result: any = res;
          if (result) {
            this.toastr.success('Request updated');
            //this.onSubmitPolicyQualifyProcessStage1();
            this.onUpdateSaveAncillaryPax(result);
            /*  if (submit) {
            this.router.navigate([
              'service' +
                '/receipt/' +
                this.paramsData.departmentName +
                '/' +
                this.paramsData.serviceTypeName +
                '/' +
                this.paramsData.serviceTypeId +
                '/' +
                btoa(escape(this.serviceRequestForm.value.id)),
            ]);
          } else { */
            this.anxServiceRequestForm.patchValue(result);
            this.loading = false;
            this.isSubmitRequest = false;

            //this.router.navigate(['/dashboard/request/all-service-requests']);
            this.cd.markForCheck();
            // this.gotoAttachments();
            /*   } */
          } else {
            this.toastr.error(result.message);
          }
        },
        (err) => {
          this.loading = false;
          this.isSubmitRequest = false;
          console.log(err);

          this.toastr.error(err);
        }
      );
  }
  onServicePricing(data) {
    this.priceOnSubmitEvent.next();
    /* if (this.isEdit) {
      this.updateService(this.serviceRequestData);
    } else {
      this.createService(this.serviceRequestData);
    }dfgf */
  }
  // create receipt
  onServicePricingAdd(data) {
    this.serviceTypeService.sendRequestDataCommunication(this.anxServiceRequestForm.value);
    if (data) {
      /*    const sharedData = {
        serviceRequest:  this.serviceRequestForm.value,
        serviceType:  this.serviceTypeHeader,
        attachments:  this.serviceRequestAttachments,
        receipt:  data?.priceReceipt,
        priceData:  data?.priceData
      }
      console.log(sharedData);
      this.serviceTypeService.sendRequestDataCommunication(data); */
      this.routeSub =this.serviceTypeService.create(SERVICE_PRICING_URL.CREATE_RECEIPT, data).subscribe(
        (res) => {
          const result: ApiResponse = res;
          if (result.status == 200) {
            this.toastr.success(result.message);
            this.updateService(this.serviceRequestData, true);
          } else {
            this.toastr.error(result.message);
          }
        },
        (err) => {
          this.toastr.error(err.message);
        }
      );
    } else {
      this.toastr.error('Something went wrong');
    }
  }
  openAddonsModal(adt:number,chd:number,inf:number) {
    const modalRef = this.modalService.open(AncillaryAddonsComponent, { size: 'xl', windowClass: 'my-class' });
    modalRef.componentInstance.name = 'Add Ons';
    modalRef.componentInstance.personCount = {
      adult:adt,
      child:chd,
      infant:inf,
      srId:this.requestId,
      srLine:this.anxLineId
    };
    modalRef.componentInstance.patchAddonsData = this.ancillaryAddons;
  }

  /**
   * Open person modal component to add more people to the form
   */
  openPersonModal() {
    // AddPersonModalComponent
    const modalRef = this.modalService.open(AddPassengerFormComponent, { size: 'xl', windowClass: 'my-class' });
    modalRef.componentInstance.name = 'Add Person';
    modalRef.componentInstance.attractionsType = 'ancillary';
    modalRef.componentInstance.attractionsPaxCount = null;
  }
  onNavChange(changeEvent: NgbNavChangeEvent) {
    /* if (changeEvent.nextId === 3) {
      changeEvent.preventDefault();
    } */
  }

  toggleDisabled() {
    /* this.disabled = !this.disabled;
    if (this.disabled) {
      this.active = 1;
    } */
  }

  redirect_to_Fulfillment() {
    if (this.requestId && this.anxLineId) {
      const offlineUrl = `${environment.RFQREDIRECTOFFLINE}redirect?sr_no=${this.requestId}&sr_line_no=${this.anxLineId}&product=ancillary&channel=offline`;
      window.open(offlineUrl, '_blank');
    }
  }

  formResetEvent() {
    //formOnSubmitResetEvent
    //this.isEdit=false;
    //this.formOnSubmitResetEvent.next();
    //this.deleteQueryParameterFromCurrentRoute();
    /* if(this.requestId &&this.contactId){
      this.formInputPatchData = '';
      this.isEdit=false;
      this.router.navigate(['/dashboard/booking/ancillary'], {
        queryParams: {
          requestId: this.requestId,
          contactId: this.contactId,
          serviceTypeId: btoa(escape(this.serviceTypeId)),
        }
      });
    } */

    const modalRef = this.modalService.open(AncillarySelectComponent, {
      size: 'xl',
      backdrop: 'static',
      animation: true,
    });
    modalRef.componentInstance.name = 'Add Person';
    modalRef.result.then(
      (result) => {
        if (result) {
          this.formInputPatchData = '';
          this.isEdit = false;

          this.router.navigate(['/dashboard/booking/ancillary'], {
            queryParams: {
              requestId: this.requestId,
              contactId: this.contactId,
              serviceTypeId: btoa(escape(result)),
            },
          });
          this.cd.markForCheck();
          //  this.onSubmit('ancillary', result);
        } else {
          this.toastr.error('Please select Ancillary');
        }
      },
      (err) => {}
    );
  }
  deleteQueryParameterFromCurrentRoute() {
    const params = { ...this.route.snapshot.queryParams };
    delete params.anxLineId;
    this.router.navigate([], { queryParams: params });
  }

  openSm(content) {
    this.modalService.open(content, { size: 'lg' });
  }

  // remove list
  delete(index: number) {
    if (this.passengersList.length > 0) {
      this.passengersList.splice(index, 1);
      this.paxId = this.passengersList?.map((v) => v);
    }
  }
  /**
   *
   * selected passengers
   * selectedUsers: Passengers[]
   */
  selectedPassengers() {
    this.routeSub = this.SelectedPassengersService.getData().subscribe((res: any) => {
      if (res?.passengers?.length > 0) {
        for (let r = 0; r < res.passengers.length; r++) {
          this.passengersList.push(res.passengers[r]);
          this.paxId.push({
            prefix:res.passengers[r].prefix,
            firstName: res.passengers[r].firstName,
            lastName: res.passengers[r].lastName,
            dob: res.passengers[r].dob,
            nationality:
            res.passengers[r].nationality?.id === undefined || res.passengers[r].nationality?.id === null ? null : res.passengers[r].nationality?.id,
            //nationality: res[r].nationality?.id,
            nationalityName:
            res.passengers[r].nationality?.name === undefined || res.passengers[r].nationality?.name === null
                ? null
                : res.passengers[r].nationality?.name,
            issuedCountry:
            res.passengers[r].issuedCountry?.id === undefined || res.passengers[r].issuedCountry?.id === null
                ? null
                : res.passengers[r].issuedCountry?.id,
            issuedCountryName:
            res.passengers[r].issuedCountry?.name === undefined || res.passengers[r].issuedCountry?.name === null
                ? null
                : res.passengers[r].issuedCountry?.name,
            passport: res.passengers[r].passport,
            email: res.passengers[r].email,
            phone: res.passengers[r].phone,
            paxType: res.passengers[r].paxType?.id,
            passportExpiredDate: res.passengers[r].passportExpiredDate,
            passportIssueDate: res.passengers[r].passportIssueDate,
            requestLinePaxId: res.passengers[r].requestLinePaxId,
            createdDate: this.todaydateAndTimeStamp,
          });


        }
      }
      this.cd.markForCheck();
    });
  }
  getAddonsResponseData() {
    this.routeSub =this.SelectedPassengersService.getAddonsData().subscribe((res) => {
      this.ancillaryAddons = res;
      this.cd.markForCheck();
    });
  }
  onSaveAncillaryPax(response: any) {
    if(this.paxId.length>0){
      const paxPayload = {
        paxData: this.paxId,
        requestId: response?.anxLineRequestId,
        requestLineId: response?.anxLineId,
        createdBy: this.auth.getUser(),
        updatedBy: this.auth.getUser(),
      };
      this.routeSub= this.serviceTypeService.create(ANX_PAX_API.CREATEMODIFYREQUESTLINEPAX, paxPayload).subscribe(
        (res) => {
          if (res) {
          //new form passengers empty
          this.passengersList=[];
          this.paxId = [];
            console.log('save on ancillary pax..');
          }
        },
        (err) => {
          this.toastr.error(err);
        }
      );
    }

  }
  onUpdateSaveAncillaryPax(response: any) {
    if(this.paxId.length>0){
    const paxPayload = {
      paxData: this.paxId,
      requestId: response?.anxLineRequestId,
      requestLineId: response?.anxLineId,
      createdBy: this.auth.getUser(),
      updatedBy: this.auth.getUser(),
    };
    this.routeSub=this.serviceTypeService.create(ANX_PAX_API.CREATEMODIFYREQUESTLINEPAX, paxPayload).subscribe(
      (res) => {
        if (res) {
          console.log('update on ancillary pax..');

        }
      },
      (err) => {
        this.toastr.error(err);
      }
    );
    }
    this.reloadComponent();
  }

  inActivePaxDataConversion(index) {
    let convertPaxArray: any = [];
    //this.passengerList
    this.paxId?.forEach((val) => convertPaxArray.push(Object.assign({}, val)));
    convertPaxArray.forEach((element, paxIndex) => {
      if (paxIndex === index) {
        element.paxId = element.paxId;
        element.requestLinePaxId = element.requestLinePaxId;
        element.statusId = 1;
        element.paxIsDeleted = true;
        element.createdBy = this.auth.getUser();
        element.createdDate = this.todaydateAndTimeStamp;
        element.updatedBy = this.auth.getUser();
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
      const requestLineId = this.route.snapshot.queryParams.anxLineId;
      const updatePaxPayload = {
        paxData: this.inActivePaxDataConversion(index),
        requestId: Number(requestId),
        requestLineId: Number(requestLineId),
        createdBy: this.auth.getUser(),
        updatedBy: this.auth.getUser(),
      };

      this.routeSub= this.serviceTypeService.create(ANX_PAX_API.CREATEMODIFYREQUESTLINEPAX, updatePaxPayload).subscribe(
        (res) => {
          if (res) {
            console.log('update on inactive  ancillary pax..');
            this.toastr.success(`${requestId} person  has been removed successfuly !`, 'Success',{progressBar:true});
            this.reloadComponent();
          }
        },
        (err) => {
          this.toastr.error(err);
        }
      );
    } else {
      this.passengersList.splice(index, 1);
      this.paxId = this.passengersList?.map((v) => v);
      this.reloadComponent();
    }
  }

  reloadComponent() {
    const requestLineId = this.route.snapshot.queryParams.anxLineId;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/dashboard/booking/ancillary'], {
      queryParams: {
        requestId: this.requestId,
        contactId: this.contactId,
        serviceTypeId: btoa(escape(this.serviceTypeId)),
        anxLineId: requestLineId,
      },
    });
  }

  redirectTorfqAncillary(){
    const save_data={
     anxLineId: this.anxServiceRequestForm.value.anxLineId,
     anxLineAddons: this.anxServiceRequestForm.value.anxLineAddons,
     anxLineAttr1: this.anxServiceRequestForm.value.anxLineAttr1,
     anxLineAttr2: this.anxServiceRequestForm.value.anxLineAttr2,
     anxLineAttr3: this.anxServiceRequestForm.value.anxLineAttr3,
     anxLineAttr4:this.anxServiceRequestForm.value.anxLineAttr4,
     anxLineAttr5: this.anxServiceRequestForm.value.anxLineAttr5,
     anxLineAttr6:this.anxServiceRequestForm.value.anxLineAttr6,
     anxLineAdtCount: this.anxServiceRequestForm.value.anxLineAdtCount,
     anxLineChdCount: this.anxServiceRequestForm.value.anxLineChdCount,
     anxLineInfCount:this.anxServiceRequestForm.value.anxLineInfCount,
     anxLineJson: this.anxServiceRequestForm.value.anxLineJson,
     anxLineLpoAmount: this.anxServiceRequestForm.value.anxLineLpoAmount,
     anxLineLpoDate:this.anxServiceRequestForm.value.anxLineLpoDate,
     anxLineLpoNumber: this.anxServiceRequestForm.value.anxLineLpoNumber,
     anxLineRequestId: this.anxServiceRequestForm.value.anxLineRequestId,// request id
     anxLineStatus: this.anxServiceRequestForm.value.anxLineStatus,
     anxLineType: this.anxServiceRequestForm.value.anxLineType,
     anxLineTypeId: this.anxServiceRequestForm.value.anxLineTypeId,
     anxLineCreatedDevice: this.anxServiceRequestForm.value.deviceInfo,
     anxLineCreatedIp: this.anxServiceRequestForm.value.deviceIp,
     anxLineCreatedBy: this.auth.getUser(),
     anxLineCreatedDate:this.todaydateAndTimeStamp ,

    };
    this.routeSub =this.rfqServices.saveRfqAncillary(save_data,RFQ_Ancillary.create,0).subscribe(
       (res:any) => {
         const rfqAncillaryId=res?.anxRfqId;
         if (rfqAncillaryId) {

          const queryParams = {
            requestId: this.requestId,
            contactId: this.contactId,
            serviceTypeId: btoa(escape(this.serviceTypeId)),
            srLine:this.anxLineId,
            rfqAncillary_id:rfqAncillaryId
          };
          const ANCILLARY_RFQ_URL = this.router.createUrlTree(['/dashboard/rfq/ancillary'], { queryParams }).toString();
          window.open(ANCILLARY_RFQ_URL, '_blank');

         }
       },
       (err) => {
         this.toastr.error(err);
       }
     );

   }
   getRequestContactDetails(requestId:number) {
    this.routeSub= this.dashboardRequestService.getSrRequest(requestId).subscribe(
      (resHeaderdata: any) => {
        if (resHeaderdata) {
          this.contactDetails = resHeaderdata;
          this.cd.markForCheck();
        } else {
          this.toastr.error(
            'Oops! Something went wrong while fetching the request data please try again  ',
            'Error'
          );
        }
      },
      (error) => {
        this.toastr.error('Oops! Something went wrong while fetching the SR Data  ', 'Error');
      }
    );

  }

  getProductType() {
    this.routeSub= this.masterDataService.getGenMasterDataByTableName('master_products').subscribe((data) => {
      if (data) {
        const productName = 'Ancillary';
        this.productList = data?.find((con) => con.name === productName);

       this.cd.markForCheck();
      } else {
        this.toastr.error('Oops! Something went wrong while fetching the Product type data please try again ', 'Error');
      }
    });
  }
   saveSrSummayData(anxLineId:number) {
    if (this.contactDetails&&anxLineId) {
      const total: number =
        Number(this.anxServiceRequestForm.value.anxLineAdtCount) +
        Number(this.anxServiceRequestForm.value.anxLineChdCount) +
        Number(this.anxServiceRequestForm.value.anxLineInfCount) ;
      const SUMMARYDATA = {
        contactEmail: this.contactDetails?.contact?.primaryEmail,
        contactId: this.contactDetails?.contact?.id,
        contactName: this.contactDetails?.contact?.firstName + ' ' + this.contactDetails?.contact?.lastName,
        contactPhone: this.contactDetails?.contact?.primaryPhoneNumber,
        deviceInfo: this.deviceInfo?.userAgent,
        loggedInUserId: this.auth.getUser(),
        passengerCount: Number(total),
        productId: this.productList?.id === undefined ?3 :this.productList?.id ,
        serviceRequestId: this.contactDetails?.requestId,
        serviceRequestLineId: anxLineId,
        travelDateOrCheckInDate: null,

      };
      this.routeSub=this.dashboardRequestService.saveSrSummary(SUMMARYDATA, SrSummaryData.SAVESRSUMMARYDATA).subscribe((res:any) => {
        const result: ApiResponse = res;
        if (result.status === 200) {
          console.log('anx sr summary saved ');

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



  onSubmitPolicyQualifyProcessStage1() {
    const customerDetailsBySrId = this.auth.getCustomerType();


    const ON_SAVE_POLICY = {
      productId:
      this.productList== null||
      this.productList?.id=== '' || this.productList?.id === null || this.productList === undefined
          ? 3
          : this.productList?.id,
      customerId: customerDetailsBySrId?.customerId,
      bookingDate: this.todayDate1,
      tktTypeId: 4,
      routes: [],
    };
    this.routeSub= this.dashboardRequestService
      .policyTemplateProcessStage1(policy.policyTemplateProcessStage1, ON_SAVE_POLICY)
      .subscribe((res: ApiResponse) => {
        const result = res;
        if (result.status == 200) {
          this.policyList = result.data;
          this.cd.markForCheck();
        } else {
          if (result.message == '') {
            this.toastr.error('opps someting went wrong please try agagin policy request', 'Error', {
              progressBar: true,
            });
            this.cd.markForCheck();
          } else {
            this.toastr.error(result.message, 'Error', { progressBar: true });
            this.cd.markForCheck();
          }
        }
      });
  }


openPolicyPopup(){
  const modalRef = this.modalService.open(PolicyQualifyProcessStage1Component, { size: 'xl' });
  modalRef.componentInstance.name = 'Policy';
  modalRef.componentInstance.policyList =  this.policyList;
}


trackByFn(index, item) {
  return index;
}
  ngOnInit(): void {
    this.keys= this.auth.getPageKeys();
    this.getParams();
    this.getProductType();
  }

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

}
