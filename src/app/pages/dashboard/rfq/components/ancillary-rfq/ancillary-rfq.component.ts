import { DatePipe, formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { Passengers } from 'app/pages/dashboard/dashboard-request/model/selectedPassengers';
import { AuthService } from 'app/shared/auth/auth.service';
import { ServiceDocuments, ServiceAttachments, ServiceAssignment } from 'app/shared/models/service-request';
import { ServiceTypeService } from 'app/shared/services/service-type.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ToastrService } from 'ngx-toastr';
import { Subscription, Subject, forkJoin, from } from 'rxjs';
import { SelectedPassengersService } from 'app/pages/dashboard/dashboard-booking/share-data-services/selected-passenger.service';
import { AddPassengerFormComponent } from 'app/pages/dashboard/dashboard-booking/components/add-passenger-form/add-passenger-form.component';
import { AncillarySelectComponent } from 'app/pages/dashboard/dashboard-request/components/search-result/ancillary-select/ancillary-select.component';
import { AncillaryAddonsComponent } from 'app/pages/dashboard/service-request/components/service-request/ancillary-addons/ancillary-addons.component';
import { ANX_API, ANX_PAX_API } from 'app/pages/dashboard/service-request/constants/anx-api';
import { MODULE } from 'app/shared/constant-url/modules';
import { SERVICE_TYPE_URL, SERVICE_PRICING_URL } from 'app/shared/constant-url/service-type';
import { ApiResponse } from 'app/shared/models/api-response';
import { environment } from 'environments/environment';
import { RfqApiResponse } from '../../rfq-models/rfq-api-response';
import { RfqService } from '../../rfq-services/rfq.service';
import * as RFQURLS from '../../rfq-url-constants/apiurl';
import { mergeMap, switchMap, takeUntil } from 'rxjs/operators';
import { SendMessage, WaApiResponse } from '../../rfq-models/sendMessage';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-ancillary-rfq',
  templateUrl: './ancillary-rfq.component.html',
  styleUrls: ['./ancillary-rfq.component.scss'],
})
export class AncillaryRfqComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
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
  srLine: number;

  //passengers list
  passengersList: Passengers[] = [];
  paxId: any[] = [];
  ancillaryAddons: any = [];
  //today date
  todayDate = new Date();
  todayDate1: string;
  todaydateAndTimeStamp: string;
  //pagination
  public isCollapsedSelectedPersons = true;
  page = 1;
  pageSize = 10;
  collectionSize: number;

  //supplier details
  public supplierDeatils: any;
  isMasterSelected: boolean;
  checkedSupplierList: any;

  contactDeatils = [];
  messageModuleID = RFQURLS.sendWaMessage.moduleId;
  messageModuleName = RFQURLS.sendWaMessage.moduleName;


  requestCreationLoading:boolean=false;
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
    private rfqServices: RfqService,
    private modalService: NgbModal ,
    private spinnerService: NgxSpinnerService,
  ) {
    this.todayDate1 = this.datepipe.transform(this.todayDate, 'yyyy-MM-dd');
    this.todaydateAndTimeStamp = formatDate(this.todayDate, 'yyyy-MM-ddThh:mm:ss', 'en-US', '+0530');
  }

  getParams() {
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      const serviceTypeId = param?.serviceTypeId;
      const requestId = param?.requestId;
      this.srLine = param?.srLine;
      const anxLineId = param?.rfqAncillary_id;
      // params data
      this.requestId = param?.requestId;
      this.contactId = param?.contactId;
      this.anxLineId = param?.rfqAncillary_id;

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
        this.getEditData(atob(unescape(serviceTypeId)), anxLineId, this.requestId, Number(this.srLine));
      }
    });
    this.selectedPassengers();
    this.getAddonsResponseData();
  }
  // form create process
  getCreateData(serviceTypeId: string) {
    let serviceTypHeader = this.serviceTypeService.read(SERVICE_TYPE_URL.GET_SERVICE_TYPE_HEADER + serviceTypeId);
    let serviceTypeLines = this.serviceTypeService.read(SERVICE_TYPE_URL.GET_SERVICE_TYPE_FORM_LINES + serviceTypeId);
    forkJoin([serviceTypHeader, serviceTypeLines])
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((results) => {
        if (results[0]?.data && results[0]?.data.length > 0 && results[1]?.data && results[1].data?.length > 0) {
          this.formInput = results[1]?.data;
          this.serviceTypeHeader = results[0]?.data[0];
          this.anxServiceRequestForm.patchValue({
            anxLineType: this.serviceTypeHeader.name,
            anxLineTypeId: this.serviceTypeHeader.id,
          });
          this.title = this.serviceTypeHeader.name;
          // this.getAttachmentsAndDocuments(serviceTypeId);
          // this.getServiceTypeAssignments(serviceTypeId);
          this.cd.markForCheck();
        }
      });
  }
  // form update process
  getEditData(serviceTypeId: string, rfq: any, requestId: any, srLine: number) {
    forkJoin(
      this.rfqServices.findRfqAncillaryByid(
        rfq,
        requestId,
        srLine,
        RFQURLS.RFQ_Ancillary.getAnxRequestLineInfoByLineAndSrAndRfqId
      ),
      this.serviceTypeService.read(SERVICE_TYPE_URL.GET_SERVICE_TYPE_HEADER + serviceTypeId),
      this.serviceTypeService.read(SERVICE_TYPE_URL.GET_SERVICE_TYPE_FORM_LINES + serviceTypeId)
    )
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
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
            this.formInputPatchData = anxLineData?.data[0]?.rfqLine?.anxLineJson;
            this.title = dataFromMethod2.data[0]?.name;
            if (anxLineData?.data[0]?.rfqLine) {
              this.anxServiceRequestForm.patchValue({
                anxLineLpoDate: this.datepipe.transform(anxLineData?.data[0]?.rfqLine.anxLineLpoDate, 'yyyy-MM-dd'),
                anxLineId: anxLineData?.data[0]?.rfqLine.anxLineId,
                anxLineAddons: anxLineData?.data[0]?.rfqLine.anxLineAddons,
                anxLineAdtCount: anxLineData?.data[0]?.rfqLine.anxLineAdtCount,
                anxLineAttr1: anxLineData?.data[0]?.rfqLine.anxLineAttr1,
                anxLineAttr2: anxLineData?.data[0]?.rfqLine.anxLineAttr2,
                anxLineAttr3: anxLineData?.data[0]?.rfqLine.anxLineAttr3,
                anxLineAttr4: anxLineData?.data[0]?.rfqLine.anxLineAttr4,
                anxLineAttr5: anxLineData?.data[0]?.rfqLine.anxLineAttr5,
                anxLineAttr6: anxLineData?.data[0]?.rfqLine.anxLineAttr6,
                anxLineChdCount: anxLineData?.data[0]?.rfqLine.anxLineChdCount,
                anxLineInfCount: anxLineData?.data[0]?.rfqLine.anxLineInfCount,
                anxLineJson: anxLineData?.data[0]?.rfqLine.anxLineJson,
                anxLineLpoAmount: anxLineData?.data[0]?.rfqLine.anxLineLpoAmount,
                anxLineLpoNumber: anxLineData?.data[0]?.rfqLine.anxLineLpoNumber,
                anxLineRequestId: anxLineData?.data[0]?.rfqLine.anxLineRequestId, // request id
                lineUuid: anxLineData?.data[0]?.rfqLine.lineUuid,
                ancillaryLineUuid: anxLineData?.data[0]?.rfqLine.ancillaryLineUuid,
                anxLineStatus: anxLineData?.data[0]?.rfqLine.anxLineStatus,
                anxLineType: anxLineData?.data[0]?.rfqLine.anxLineType,
                anxLineTypeId: anxLineData?.data[0]?.rfqLine.anxLineTypeId,
                deviceInfo: anxLineData?.data[0]?.rfqLine.deviceInfo,
                deviceIp: anxLineData?.data[0]?.rfqLine.deviceIp,
                loggedInUserId: anxLineData?.data[0]?.rfqLine.loggedInUserId,
                //anxLineLpoDate:'2022-08-30',
              });
            }
            if (anxLineData?.rfqPaxInfo?.length > 0) {
              let personArray = [];
              for (let index = 0; index < anxLineData?.rfqPaxInfo.length; index++) {
                const element = anxLineData?.rfqPaxInfo[index];
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
              this.SelectedPassengersService.sendData(personArray);
            }

            if (anxLineData?.rfqAddonInfo?.length > 0) {
              this.ancillaryAddons = anxLineData?.rfqAddonInfo;
            } else {
              this.ancillaryAddons = [];
            }
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
      ancillaryLineUuid: '',
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
    forkJoin([serviceTypeDocuments, serviceTypeAttachments])
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((results) => {
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
    this.serviceTypeService
      .read(SERVICE_TYPE_URL.GET_SERVICE_ASSIGNMENTS_BY_SERVICE_TYPE_HEADER_ID + serviceTypeId)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        const serviceResult = res;
        if (serviceResult.status === 200) {
          if (serviceResult.data && serviceResult.data?.length > 0) {
            this.serviceAssignment = serviceResult.data[0];
            // get status configuration
            this.serviceTypeService
              .read(
                SERVICE_TYPE_URL.GET_SERVICE_STATUS_CONFIGURATION_BY_DEFAULT_STATUS +
                  this.serviceAssignment.defaultStatus +
                  '&module=' +
                  MODULE.SERVICE +
                  '&organization=' +
                  this.serviceTypeHeader.organizationId
              )
              .pipe(takeUntil(this.ngDestroy$))
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
    this.serviceTypeService
      .create(ANX_API.CREATE, this.anxServiceRequestForm.value)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (res) => {
          const result: any = res;
          /*   if (result.status === 200) { */
          this.anxServiceRequestForm.patchValue(result);
          this.onSaveAncillaryPax(result);
          this.loading = false;
          this.isSubmitRequest = false;
          // this.gotoAttachments();
          this.toastr.success('Anx created');
          this.cd.markForCheck();
          this.router.navigate(['/dashboard/booking/ancillary'], {
            queryParams: {
              requestId: this.requestId,
              contactId: this.contactId,
              serviceTypeId: btoa(escape(this.serviceTypeId)),
              anxLineId: result.anxLineId,
            },
          });
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
    this.showSpinner();
    this.requestCreationLoading=true;
    const update_data = {
      anxLineId: this.anxServiceRequestForm.value.anxLineId,
      anxLineAddons: this.anxServiceRequestForm.value.anxLineAddons,
      anxLineAdtCount: this.anxServiceRequestForm.value.anxLineAdtCount,
      anxLineAttr1: this.anxServiceRequestForm.value.anxLineAttr1,
      anxLineAttr2: this.anxServiceRequestForm.value.anxLineAttr2,
      anxLineAttr3: this.anxServiceRequestForm.value.anxLineAttr3,
      anxLineAttr4: this.anxServiceRequestForm.value.anxLineAttr4,
      anxLineAttr5: this.anxServiceRequestForm.value.anxLineAttr5,
      anxLineAttr6: this.anxServiceRequestForm.value.anxLineAttr6,
      anxLineChdCount: this.anxServiceRequestForm.value.anxLineChdCount,
      anxLineInfCount: this.anxServiceRequestForm.value.anxLineInfCount,
      anxLineJson: this.anxServiceRequestForm.value.anxLineJson,
      anxLineLpoAmount: this.anxServiceRequestForm.value.anxLineLpoAmount,
      anxLineLpoDate: this.anxServiceRequestForm.value.anxLineLpoDate,
      anxLineLpoNumber: this.anxServiceRequestForm.value.anxLineLpoNumber,
      anxLineRequestId: this.anxServiceRequestForm.value.anxLineRequestId, // request id
      anxLineStatus: this.anxServiceRequestForm.value.anxLineStatus,
      anxLineType: this.anxServiceRequestForm.value.anxLineType,
      anxLineTypeId: this.anxServiceRequestForm.value.anxLineTypeId,
      anxLineUpdatedDevice: this.anxServiceRequestForm.value.deviceInfo,
      anxLineUpdatedIp: this.anxServiceRequestForm.value.deviceIp,
      ancillaryLineUuid: this.anxServiceRequestForm.value.ancillaryLineUuid,
      anxLineUpdatedBy: this.auth.getUser(),
      anxLineUpdatedDate: this.todaydateAndTimeStamp,
    };
    this.rfqServices
      .updateRfqAncillaryByid(update_data, this.anxLineId, RFQURLS.RFQ_Ancillary.update)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (res: any) => {
          const result: ApiResponse = res;
          if (result) {
            this.saveSupplierRealtion();
            //this.toastr.success(`RFQ sent  successfuly !`, 'Success');
            //this.onUpdateSaveAncillaryPax(result);
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
      this.serviceTypeService
        .create(SERVICE_PRICING_URL.CREATE_RECEIPT, data)
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe(
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
  openAddonsModal(adt: number, chd: number, inf: number) {
    const modalRef = this.modalService.open(AncillaryAddonsComponent, { size: 'xl', windowClass: 'my-class' });
    modalRef.componentInstance.name = 'Add Ons';
    modalRef.componentInstance.personCount = {
      adult: adt,
      child: chd,
      infant: inf,
      srId: this.requestId,
      srLine: this.anxLineId,
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
    this.routeSub = this.SelectedPassengersService.getData()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res: any) => {
        if (res?.length > 0) {
          for (let r = 0; r < res.length; r++) {
            this.passengersList.push(res[r]);
            this.paxId.push({
              paxId: res[r].paxId,
              prefix: res[r].prefix,
              firstName: res[r].firstName,
              lastName: res[r].lastName,
              dob: res[r].dob,
              nationality:
                res[r].nationality?.id === undefined || res[r].nationality?.id === null ? null : res[r].nationality?.id,
              //nationality: res[r].nationality?.id,
              nationalityName:
                res[r].nationality?.name === undefined || res[r].nationality?.name === null
                  ? null
                  : res[r].nationality?.name,
              issuedCountry:
                res[r].issuedCountry?.id === undefined || res[r].issuedCountry?.id === null
                  ? null
                  : res[r].issuedCountry?.id,
              issuedCountryName:
                res[r].issuedCountry?.name === undefined || res[r].issuedCountry?.name === null
                  ? null
                  : res[r].issuedCountry?.name,
              passport: res[r].passport,
              email: res[r].email,
              phone: res[r].phone,
              paxType: res[r].paxType?.id,
              passportExpiredDate: res[r].passportExpiredDate,
              passportIssueDate: res[r].passportIssueDate,
              requestLinePaxId: res[r].requestLinePaxId,
              createdDate: this.todaydateAndTimeStamp,
            });
          }
        }
        this.cd.markForCheck();
      });
  }
  getAddonsResponseData() {
    this.routeSub = this.SelectedPassengersService.getAddonsData()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        this.ancillaryAddons = res;
        this.cd.markForCheck();
      });
  }
  onSaveAncillaryPax(response: any) {
    const paxPayload = {
      paxData: this.paxId,
      requestId: response?.anxLineRequestId,
      requestLineId: response?.anxLineId,
      createdBy: this.auth.getUser(),
      updatedBy: this.auth.getUser(),
    };
    this.serviceTypeService
      .create(ANX_PAX_API.CREATEMODIFYREQUESTLINEPAX, paxPayload)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (res) => {
          if (res) {
            console.log('save on ancillary pax..');
          }
        },
        (err) => {
          this.toastr.error(err);
        }
      );
  }
  onUpdateSaveAncillaryPax(response: any) {
    const paxPayload = {
      paxData: this.paxId,
      requestId: response?.anxLineRequestId,
      requestLineId: response?.anxLineId,
      createdBy: this.auth.getUser(),
      updatedBy: this.auth.getUser(),
    };
    this.serviceTypeService
      .create(ANX_PAX_API.CREATEMODIFYREQUESTLINEPAX, paxPayload)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (res) => {
          if (res) {
            console.log('update on ancillary pax..');
            this.reloadComponent();
          }
        },
        (err) => {
          this.toastr.error(err);
        }
      );
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

      this.serviceTypeService
        .create(ANX_PAX_API.CREATEMODIFYREQUESTLINEPAX, updatePaxPayload)
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe(
          (res) => {
            if (res) {
              console.log('update on inactive  ancillary pax..');
              this.toastr.success(`${requestId} person  has been removed successfuly !`, 'Success', {
                progressBar: true,
              });
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

  getSupplierDetailes() {
    this.rfqServices
      .getAllSupplierData(RFQURLS.SUPPLIPER_URL.getAllSupplier)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((supplierData: RfqApiResponse) => {
        const result: RfqApiResponse = supplierData;
        if (result.status === 200) {
          //this.supplierDeatils = result.data;
          let data: any = result.data;
          data?.forEach((element) => {
            element.isSelected = false;
          });
          this.supplierDeatils = result.data;
          //this.collectionSize = this.supplierDeatils.length;
          this.cd.markForCheck();
        } else {
          this.toastr.error('Oops! Something went wrong while fetching the supplier data please try again.', 'Error');
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
          requestId: this.requestId,
          requestLineId: this.srLine,
          status: 1,
          rfqId: this.anxLineId,
          supplierId: this.supplierDeatils[i]?.customerId,
          supplierContactId: 0,
          createdBy: this.auth.getUser(),
          createdDate: this.todaydateAndTimeStamp,
          updatedBy: this.auth.getUser(),
          email: this.supplierDeatils[i].primaryEmail,
          //supplierNo: i+1
          updatedDate: this.todaydateAndTimeStamp,
        };
        this.checkedSupplierList.push(RfqSupplierRelation);
        if (element?.primaryConatct && element?.primaryPhoneNumber) {
          const contact = {
            contact_number: Number(element.primaryPhoneNumber),
            contact_name: element.primaryConatct,
            sender_id: this.auth.getUser(),
            message: `Hi ${element.primaryConatct},
We sent RFQ please review and provide your options.

Click below to provide options for RFQ SR # ${Number(this.requestId)}

http://travcbt.dev.com/pages/login`,
            module: this.messageModuleName,
            module_id: this.messageModuleID,
            reference: Number(this.requestId),
            sub_reference: Number(this.srLine),
            supplier_id: this.supplierDeatils[i]?.customerId,
          };
          this.contactDeatils.push(contact);
        }
      }
    }
    //this.checkedSupplierList = JSON.stringify(this.checkedSupplierList);
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
              this.auth.getUserName(),
              this.checkedSupplierList[index].requestId
            );
            await this.rfqServices.sendWaMessages(contactElement, RFQURLS.whatsAppUrl.sendWaMessageRFQ);
          } catch (error) {
            console.log(error);
          }finally {
            this.requestCreationLoading = false;
          }
        }
      }
      this.toastr.success(`RFQ sent  successfuly !`, 'Success');
      this.router.navigate(['/dashboard/rfq/ancillary-rfqs-awt-response']);
    }
  }

  saveSupplierRealtion() {
    this.rfqServices
      .ancillaryRfqSupplierRealtion(this.checkedSupplierList, RFQURLS.RFQ_Ancillary.ancillary_supplier_relation)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (requestResponse: any) => {
          if(requestResponse){
            console.log('anx supplier sent ucessfully..');
            this.sendRFQ();
          }

        },
        (error) => {
          this.toastr.error('Oops! Something went wrong please try agagin', 'Error');
        }
      );

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
  ngOnInit(): void {
    // this.user = this.tokenStorage.getUser();
    this.getParams();
  }

  ngOnDestroy(): void {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
