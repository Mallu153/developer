import { ToastrService } from 'ngx-toastr';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { DashboardRequestService } from '../../services/dashboard-request.service';
import { ApiResponse } from '../../model/api-response';
import * as apiUrls from '../../url-constants/url-constants';
import { SearchPaxDataService } from '../../services/search-pax-data.service';
import { SearchPaxData } from '../../model/search-pax';
import { DatePipe, formatDate } from '@angular/common';
import { ServiceRequestLine } from '../../model/service-request-line';
import { AuthService } from 'app/shared/auth/auth.service';
import * as moment from 'moment';
import { AncillarySelectComponent } from '../search-result/ancillary-select/ancillary-select.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { CommunicationModule } from '../../url-constants/url-constants';
import { PERMISSION_KEYS } from 'app/shared/data/app-premission-key';
@Component({
  selector: 'app-pax',
  templateUrl: './pax.component.html',
  styleUrls: ['./pax.component.scss', '../../../../../../assets/sass/libs/select.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PaxComponent implements OnInit, OnDestroy {
  keys = [];
  flightButtonKey = PERMISSION_KEYS.REQUEST.NEW_CREATE_PAX_FLIGHT_REQUEST_BTN;
  hotelButtonKey = PERMISSION_KEYS.REQUEST.NEW_CREATE_PAX_HOTEL_REQUEST_BTN;
  ancillaryButtonKey = PERMISSION_KEYS.REQUEST.NEW_CREATE_PAX_ANCILLARY_REQUEST_BTN;
  activityButtonKey = PERMISSION_KEYS.REQUEST.NEW_CREATE_PAX_ACTIVITY_REQUEST_BTN;
  packageButtonKey = PERMISSION_KEYS.REQUEST.NEW_CREATE_PAX_HOLIDAY_REQUEST_BTN;
  ngDestroy$ = new Subject();
  PageTitle = 'Create Pax';
  newPaxForm: FormGroup;
  submitted = false;
  //more button
  isCollapsed = true;
  //lov
  titleListlov: any;
  designationListlov: any;
  roleListlov: any;
  countryListLov: any;
  bizListlov: any;
  nationalityListLov: any;
  //file upload
  editFile: boolean = true;
  removeUpload: boolean = false;
  //imageUrl: any = '../../../../../../assets/img/profile/profile.jpg';
  imageUrl: any = 'assets/img/profile/profile.jpg';
  paxId: any;
  //date
  todayDate = new Date();
  todayDate1: string;
  startDate1: string;
  //new pax patch data
  object: SearchPaxData;
  contactId: number;
  //timezone variable
  fecha = new Date();
  //files to
  isloading = false;
  file: any;

  date = new Date();
  //minDate = moment(new Date()).format('yyyy-MM-dd');
  //maxDate = (new Date().getFullYear()).toString()+"-0"+(new Date().getMonth()+1).toString()+"-"+(new Date().getDate()).toString();
  minDate: string;
  maxDate: string;

  wa_number: string;
  ticketNumber: string;
  waNumberCheck: boolean = false;
  moduleId = CommunicationModule.moduleId;
  moduleName = CommunicationModule.moduleName;
  requestData: any = {};
  constructor(
    private fb: FormBuilder,
    private titleService: Title,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dashboardRequestService: DashboardRequestService,
    private SearchPaxDataService: SearchPaxDataService,
    private datepipe: DatePipe,
    private modalService: NgbModal,
    private authService: AuthService
  ) {
    // this.titleService.setTitle(' Create Contact');
    this.todayDate1 = formatDate(this.todayDate, 'yyyy-MM-ddThh:mm:ss', 'en-US', '+0530');
    this.startDate1 = this.datepipe.transform(this.todayDate, 'yyyy-MM-dd');
    this.minDate = '1900-01-01';
    this.maxDate = this.startDate1;
  }

  ngOnInit(): void {
    this.keys = this.authService.getPageKeys();
    this.initializeForm();
    this.getTitle();
    this.getRole();
    this.getCountry();
    this.getNationalityLov();
    this.getDesignation();
    this.getBusiness();
    this.getNotFoundSearchPaxDataData();
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param && param.email) {
        this.newPaxForm.patchValue({
          primaryEmail: param.email,
        });
      }
      if (param && param.phoneNumber) {
        this.newPaxForm.patchValue({
          primaryPhoneNumber: param.phoneNumber,
        });
      }
      if (param && param.fname ) {
        this.newPaxForm.patchValue({
          firstName: param.fname,

        });
      }
      if (param &&  param.lname) {
        this.newPaxForm.patchValue({

          lastName: param.lname,
        });
      }
      if (param && param.wa_number && param.ticketNumber) {
        this.waNumberCheck = true;
        this.wa_number = param.wa_number;
        this.ticketNumber = param.ticketNumber;
      } else {
        this.waNumberCheck = false;
      }
    });
  }
  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
  initializeForm() {
    this.newPaxForm = this.fb.group({
      id: '',
      customerId: ['', [Validators.required]],
      prefix: [2, [Validators.required]],
      firstName: ['', [Validators.required]],
      middleName: '',
      lastName: ['', [Validators.required]],
      designationName: '',
      designationId: '',
      roleId: '',
      primaryEmail: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      primaryCCP: '',
      //primaryPhoneNumber: ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
      primaryPhoneNumber: ['', [Validators.required]],
      secondaryEmail: ['', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      secondaryCCP: 91,
      secondaryPhoneNumber: [''],
      telephoneNumber: '',
      remarksAndNotes: '',
      startDate: this.startDate1,
      endDate: '',
      status: true,
      nationality: '',
      dob: [''],
      passport: '',
      issuedCountry: '',
      dpImageUrl: '',
    });
  }
  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  /**add  a get property to make
   * easy to access
   * the form controls on the HTML form
   * */
  get formControls() {
    return this.newPaxForm.controls;
  }

  checkStartDateAndEndDate(startDate, enddate): boolean {
    if (startDate && enddate) {
      if (startDate != null && enddate != null && enddate < startDate) {
        this.toastr.error('End date should be greater than start date', 'Error');
        return false;
      } else {
        return true;
      }
    }
    return false;
  }
  // paxid is null we can create pax and contact
  submit(routesName: string, requestType?: string) {
    this.submitted = true;
    // stop here if form is invalid
    if (this.newPaxForm.invalid) {
      return this.toastr.error('Please fill the required fields', 'Error');
    }

    if (this.newPaxForm.valid) {
      if (this.newPaxForm.value.startDate && this.newPaxForm.value.endDate) {
        const data: boolean = this.checkStartDateAndEndDate(
          this.newPaxForm.value.startDate,
          this.newPaxForm.value.endDate
        );
        if (!data) {
          return;
        }
      }
      let saveData = {
        //paxId: null,
        // issuedCountry: this.contactForm.value.issuedCountry !== '' ? Number(this.contactForm.value.issuedCountry) : 0,
        nationality: this.newPaxForm.value.nationality !== '' ? Number(this.newPaxForm.value.nationality) : 0,
        dob: this.newPaxForm.value.dob,
        passport: this.newPaxForm.value.passport,
        issuedCountry: this.newPaxForm.value.issuedCountry !== '' ? Number(this.newPaxForm.value.issuedCountry) : 0,
        customerId: this.newPaxForm.value.customerId,
        prefix: this.newPaxForm.value.prefix,
        firstName: this.newPaxForm.value.firstName,
        middleName: this.newPaxForm.value.middleName,
        lastName: this.newPaxForm.value.lastName,
        //designationName: this.newPaxForm.value.designationId.name,
        //designationId: this.newPaxForm.value.designationId.id,
        designationName:
          this.newPaxForm.value?.designationId?.name === undefined ? null : this.newPaxForm.value?.designationId?.name,
        designationId:
          this.newPaxForm.value?.designationId?.id === undefined ? 0 : this.newPaxForm.value?.designationId?.id,
        roleId: this.newPaxForm.value.roleId,
        primaryEmail: this.newPaxForm.value.primaryEmail,
        primaryCCP: Number(this.newPaxForm.value.primaryCCP),
        primaryPhoneNumber: Number(this.newPaxForm.value.primaryPhoneNumber),
        secondaryEmail: this.newPaxForm.value.secondaryEmail,
        secondaryCCP: this.newPaxForm.value.secondaryCCP,
        //secondaryPhoneNumber: this.newPaxForm.value.secondaryPhoneNumber,
        //telephoneNumber: this.newPaxForm.value.telephoneNumber,
        secondaryPhoneNumber:
          this.newPaxForm.value.secondaryPhoneNumber !== '' ? Number(this.newPaxForm.value.secondaryPhoneNumber) : 0,
        telephoneNumber:
          this.newPaxForm.value.telephoneNumber !== '' ? Number(this.newPaxForm.value.telephoneNumber) : 0,
        startDate: this.newPaxForm.value.startDate,
        endDate: this.newPaxForm.value.endDate,
        status: this.newPaxForm.value.status,
        remarksAndNotes: this.newPaxForm.value.remarksAndNotes,
        createdBy: this.authService.getUser(),
        //updatedBy: 1,
        createdDate: this.todayDate1,
        updatedBy: this.authService.getUser(),
        updatedDate: this.todayDate1,
        dpImageUrl: this.newPaxForm.value.dpImageUrl,
      };

      let payload = {
        paxId: 0,
        paxModel: saveData,
      };
      let DataPayload = Object.assign(payload);

      this.dashboardRequestService
        .createNewPax(DataPayload, apiUrls.newPax_create_url.create)
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe((res) => {
          const result: ApiResponse = res;
          this.contactId = res.data[0]?.contactModel?.id;
          if (result.status === 200) {
            this.onSubmit(routesName, requestType);
            this.cdr.markForCheck();
          } else {
            if (result.status === 409) {
              this.toastr.error(
                `${this.newPaxForm.value.primaryEmail} email and ${this.newPaxForm.value.primaryPhoneNumber} mobile number alreday exists`,
                'Error'
              );
            } else {
              this.toastr.error('Oops! Something went wrong  while send the data', 'Error');
            }
          }
        });
    } else {
      this.toastr.error('Please fill the required fields', 'Error');
    }
  }
  /*
   *Create service request submit data
   *
   */
  onSubmit(routesName: string, requestType?: string) {
    this.isloading = true;
    const contactId = this.contactId;
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
      customerId: this.newPaxForm.value.customerId,
      contactId: this.contactId,
      requestStatus: 1,
      priorityId: 1,
      severityId: 1,
      packageRequest: holiday,
      dmcFlag: dmc_flag,
    };

    /* this.dashboardRequestService.createServiceRequestLine(srRequestHeaderData).pipe(takeUntil(this.ngDestroy$)).subscribe(
      (requestResponse: ServiceRequestLine) => {
        this.isloading = false;
    },
      (error) => {
        this.isloading = false;
        this.toastr.error('Oops! Something went wrong please try again ', 'Error');
      }); */

    this.dashboardRequestService
      .createServiceRequestLine(srRequestHeaderData)
      .pipe(
        map((data) => (this.requestData = data)),
        switchMap(async (cust) =>
          this.onSaveHandleCommunicationModuleLink(this.requestData?.requestId, this.contactId, routesName)
        ),
        takeUntil(this.ngDestroy$)
      )
      .subscribe(
        (requestResponse: any) => {
          console.log('request created', this.requestData?.requestId);
        },
        (error) => {
          this.toastr.error('Oops! Something went wrong please try agagin', 'Error');
        }
      );
  }
  //business lov
  getBusiness() {
    this.dashboardRequestService
      .readBusinessList(apiUrls.business_list_url.get)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((bizListlov: ApiResponse) => {
        const result: ApiResponse = bizListlov;
        if (result.status === 200) {
          this.bizListlov = result.data;
          this.cdr.markForCheck();
        } else {
          this.toastr.error('Oops! Something went wrong ', 'Error');
        }
      });
  }
  //title lov
  getTitle() {
    this.dashboardRequestService
      .readMasterLov(apiUrls.searchpax_url.titlelov)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((titleListlov: ApiResponse) => {
        const result: ApiResponse = titleListlov;
        if (result.status === 200) {
          this.titleListlov = result.data;
          this.cdr.markForCheck();
        } else {
          this.toastr.error('Oops! Something went wrong ', 'Error');
        }
      });
  }

  // role lov
  getRole() {
    this.dashboardRequestService
      .readMasterLov(apiUrls.searchpax_url.rolelov)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((roleListlov: ApiResponse) => {
        const result: ApiResponse = roleListlov;
        if (result.status === 200) {
          this.roleListlov = result.data;
          this.cdr.markForCheck();
        } else {
          this.toastr.error('Oops! Something went wrong ', 'Error');
        }
      });
  }
  getCountry() {
    this.dashboardRequestService
      .readCompanyMasterLov(apiUrls.searchpax_url.countyLov)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((countryListLov: ApiResponse) => {
        const result: ApiResponse = countryListLov;
        if (result.status === 200) {
          this.countryListLov = result.data;
          this.cdr.markForCheck();
        } else {
          this.toastr.error('Oops! Something went wrong ', 'Error');
        }
      });
  }
  getNationalityLov() {
    this.dashboardRequestService
      .readCompanyMasterLov(apiUrls.searchpax_url.nationalityLov)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((nationalityListLov: ApiResponse) => {
        const result: ApiResponse = nationalityListLov;
        if (result.status === 200) {
          this.nationalityListLov = result.data;
          this.cdr.markForCheck();
        } else {
          this.toastr.error('Oops! Something went wrong ', 'Error');
        }
      });
  }
  getDesignation() {
    this.dashboardRequestService
      .readMasterLov(apiUrls.searchpax_url.designationlov)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((designationListlov: ApiResponse) => {
        const result: ApiResponse = designationListlov;
        if (result.status === 200) {
          this.designationListlov = result.data;
          this.cdr.markForCheck();
        } else {
          this.toastr.error('Oops! Something went wrong ', 'Error');
        }
      });
  }
  //add new designation
  addDesignationNew = (term) => ({ id: 0, name: term });

  //upload file
  uploadFile(event) {
    let reader = new FileReader(); // HTML5 FileReader API
    this.file = event.target.files[0];
    if (this.file) {
      this.callImagesServices(this.file);
    }
    if (event.target.files && event.target.files[0]) {
      reader.readAsDataURL(this.file);
      // When file uploads set it to file formcontrol
      reader.onload = () => {
        this.imageUrl = reader.result;
        // ChangeDetectorRef since file is loading outside the zone
        this.cdr.markForCheck();
        /*  this.newPaxForm.patchValue({
           file: reader.result,
         }); */
        this.editFile = false;
        this.removeUpload = true;
      };
    }
  }

  //images post call method here
  callImagesServices(file) {
    this.isloading = true; // Flag variable
    let randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let uuid = '';
    for (let i = 0; i < 6; i++) {
      uuid += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    this.dashboardRequestService
      .imageUpload(file, uuid, apiUrls.pax_image_url.imageposturl)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (profileResponse) => {
          const imageData1 = {
            entityName: profileResponse.entityName,
            entityCdnUrl: profileResponse.entityCdnUrl,
          };
          this.imageUrl = profileResponse.entityCdnUrl;
          if (profileResponse) {
            this.isloading = false; // Flag variable
            this.newPaxForm.patchValue({
              dpImageUrl: profileResponse?.entityCdnUrl,
            });
          } else {
            this.isloading = false; // Flag variable
            this.toastr.error('image  not uploaded', 'Error');
          }

          this.cdr.markForCheck();
        },
        (err) => {
          this.isloading = false; // Flag variable
          this.toastr.error('Oops! Something went wrong ', 'Error');
        }
      );
  }
  /****
   * data shared
   * from
   * Search Pax */
  getNotFoundSearchPaxDataData() {
    this.object = this.SearchPaxDataService.data;
    this.newPaxForm.patchValue({
      firstName: this.object?.firstName,
      lastName: this.object?.lastName,
      primaryEmail: this.object?.primaryEmail,
      primaryPhoneNumber: this.object?.primaryPhoneNumber,
    });
  }

  onSaveHandleCommunicationModuleLink(requestNumber: string, contactId: number, routesName: string) {
    if (this.waNumberCheck && this.wa_number && this.ticketNumber) {
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
              if (routesName === 'ancillary') {
                this.isloading = false;
                const modalRef = this.modalService.open(AncillarySelectComponent, {
                  size: 'xl',
                  backdrop: 'static',
                  animation: true,
                });
                modalRef.componentInstance.name = 'Add Person';
                modalRef.result.then(
                  (result) => {
                    if (result) {
                      if (requestNumber) {
                        this.router.navigate([`/dashboard/booking/ancillary`], {
                          queryParams: {
                            requestId: requestNumber,
                            contactId: contactId,
                            serviceTypeId: btoa(escape(result)),
                          },
                        });
                      }
                    }
                  },
                  (err) => {
                    console.log(err);
                  }
                );
              } else {
                this.isloading = false;
                if (requestNumber) {
                  this.router.navigate([`/dashboard/booking/${routesName}`], {
                    queryParams: { requestId: requestNumber, contactId: contactId },
                  });
                }
              }
              this.cdr.markForCheck();
            } else {
              console.log('create communication module link  data not saved');
              this.toastr.error('Oops! Something went wrong  please try again please try again', 'Error');
              this.cdr.markForCheck();
            }
          },
          (error) => {
            console.log('create communication module link  data not saved');
            this.toastr.warning(error, 'Error');
            this.cdr.markForCheck();
          }
        );
    } else {
      if (routesName === 'ancillary') {
        this.isloading = false;
        const modalRef = this.modalService.open(AncillarySelectComponent, {
          size: 'xl',
          backdrop: 'static',
          animation: true,
        });
        modalRef.componentInstance.name = 'Add Person';
        modalRef.result.then(
          (result) => {
            if (result) {
              if (requestNumber) {
                this.router.navigate([`/dashboard/booking/ancillary`], {
                  queryParams: {
                    requestId: requestNumber,
                    contactId: contactId,
                    serviceTypeId: btoa(escape(result)),
                  },
                });
              }
            }
          },
          (err) => {
            console.log(err);
          }
        );
      } else {
        this.isloading = false;
        if (requestNumber) {
          this.router.navigate([`/dashboard/booking/${routesName}`], {
            queryParams: { requestId: requestNumber, contactId: contactId },
          });
        }
      }
    }
  }
}
