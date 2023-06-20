import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DatePipe, formatDate } from '@angular/common';
import { DashboardRequestService } from '../../services/dashboard-request.service';
import { ApiResponse } from '../../model/api-response';
import * as apiUrls from '../../url-constants/url-constants';
import { SearchPaxDataService } from '../../services/search-pax-data.service';
import { SearchPaxData } from '../../model/search-pax';
import { ServiceRequestLine } from '../../model/service-request-line';
import { AuthService } from 'app/shared/auth/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AncillarySelectComponent } from '../search-result/ancillary-select/ancillary-select.component';
import { Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { PERMISSION_KEYS } from 'app/shared/data/app-premission-key';
@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss', '../../../../../../assets/sass/libs/select.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ContactComponent implements OnInit, OnDestroy {
  keys = [];
  flightButtonKey = PERMISSION_KEYS.REQUEST.NEW_CREATE_CONTACT_FLIGHT_REQUEST_BTN;
  hotelButtonKey = PERMISSION_KEYS.REQUEST.NEW_CREATE_CONTACT_HOTEL_REQUEST_BTN;
  ancillaryButtonKey = PERMISSION_KEYS.REQUEST.NEW_CREATE_CONTACT_ANCILLARY_REQUEST_BTN;
  activityButtonKey = PERMISSION_KEYS.REQUEST.NEW_CREATE_CONTACT_ACTIVITY_REQUEST_BTN;
  packageButtonKey = PERMISSION_KEYS.REQUEST.NEW_CREATE_CONTACT_HOLIDAY_REQUEST_BTN;

  PageTitle = 'Add New Contact';
  ngDestroy$ = new Subject();
  contactForm: FormGroup;
  isEdit = false;
  submitted = false;
  businessId: string;
  businessIdparams: any;
  businessName: string;
  isCollapsed = true;
  //lov
  titleListlov: any;
  designationListlov: any;
  bizListlov: any;
  roleListlov: any;
  countryListLov: any;
  id: any;
  updatedata: any;

  editFile: boolean = true;
  removeUpload: boolean = false;
  //imageUrl: any = '../assets/img/profile/profile.jpg';
  //imageUrl: any = '../../../../../../assets/img/profile/profile.jpg';
  imageUrl: any = 'assets/img/profile/profile.jpg';
  paxId: any;
  todayDate = new Date();
  todayDate1: string;
  startDate1: string;
  //contact update
  contactupdatedata: any;
  // contact edit
  iscontactEdit = false;
  submitButton = true;
  ContactdesignationData: any;
  contactfindcallpaxId: any;
  contactid: any;
  //new pax patch data
  contactId: number;
  nofoundCustomerId: SearchPaxData;
  nationalityListLov: any;
  //files to
  isloading = false;
  file: any;
  date = new Date();
  minDate: string;
  maxDate =
    new Date().getFullYear().toString() +
    '-0' +
    (new Date().getMonth() + 1).toString() +
    '-' +
    new Date().getDate().toString();

  wa_number: string;
  ticketNumber: string;
  waNumberCheck: boolean = false;
  moduleId = apiUrls.CommunicationModule.moduleId;
  moduleName = apiUrls.CommunicationModule.moduleName;
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
    private authService: AuthService,
    private modalService: NgbModal
  ) {
    this.todayDate1 = formatDate(this.todayDate, 'yyyy-MM-ddThh:mm:ss', 'en-US', '+0530');
    this.startDate1 = this.datepipe.transform(this.todayDate, 'yyyy-MM-dd');
    this.minDate = '1900-01-01';
    this.maxDate = this.startDate1;
  }

  ngOnInit(): void {
    this.keys = this.authService.getPageKeys();
    this.initializeForm();
    this.getTitle();
    this.getDesignation();
    this.getRole();
    this.getCountry();
    this.getBusiness();
    this.getNationalityLov();
    //nocustomerid found service data patch
    this.getNotFoundSearchPaxDataData();
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param && param.email && param.pax_no) {
        this.contactForm.patchValue({
          primaryEmail: param.email,
          paxId: Number(param.pax_no),
        });
      }
      if (param && param.phoneNumber && param.pax_no) {
        this.contactForm.patchValue({
          primaryPhoneNumber: param.phoneNumber,
          paxId: Number(param.pax_no),
        });
      }
      if (param && param.fname && param.lname && param.pax_no) {
        this.contactForm.patchValue({
          firstName: param.fname,
          lastName: param.lname,
          paxId: Number(param.pax_no),
        });
      }

      if (param && param.wa_number && param.ticketNumber && param.pax_no) {
        this.waNumberCheck = true;
        this.wa_number = param.wa_number;
        this.ticketNumber = param.ticketNumber;
        this.contactForm.patchValue({
          paxId: Number(param.pax_no),
        });
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
    this.contactForm = this.fb.group({
      id: '',
      paxId: '',
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
      secondaryCCP: '',
      secondaryPhoneNumber: [''],
      telephoneNumber: '',
      remarksAndNotes: '',
      startDate: [this.startDate1, [Validators.required]],
      endDate: '',
      status: true,
      nationality: '',
      dob: '',
      passport: '',
      issuedCountry: '',
      file: [null],
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
    return this.contactForm.controls;
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
          this.cdr.detectChanges();
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
          this.cdr.detectChanges();
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
          this.cdr.detectChanges();
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
          this.cdr.detectChanges();
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
          this.cdr.detectChanges();
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
          this.cdr.detectChanges();
        } else {
          this.toastr.error('Oops! Something went wrong ', 'Error');
        }
      });
  }
  //add new designation
  addDesignationNew = (term) => ({ id: 0, name: term });

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
        this.cdr.detectChanges();
        /*  this.contactForm.patchValue({
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
            this.contactForm.patchValue({
              dpImageUrl: profileResponse?.entityCdnUrl,
            });
          } else {
            this.isloading = false; // Flag variable
            this.toastr.error('image  not uploaded', 'Error');
          }

          this.cdr.detectChanges();
        },
        (err) => {
          this.isloading = false; // Flag variable
          this.toastr.error('Oops! Something went wrong ', 'Error');
        }
      );
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
  onsubmitContactForm(routesName: string, requestType?: string) {
    this.submitted = true;
    this.isEdit = true;
    // stop here if form is invalid
    if (this.contactForm.invalid) {
      return this.toastr.error('Please fill the required fields', 'Error');
    }

    if (this.contactForm.valid) {
      if (this.contactForm.value.startDate && this.contactForm.value.endDate) {
        const data: boolean = this.checkStartDateAndEndDate(
          this.contactForm.value.startDate,
          this.contactForm.value.endDate
        );
        if (!data) {
          return;
        }
      }
      /*   const editData = {
        paxId: null,
        customerId: this.contactForm.value.customerId,
        nationality: this.contactForm.value.nationality,
        dob: this.contactForm.value.dob,
        passport: this.contactForm.value.passport,
        issuedCountry: this.contactForm.value.issuedCountry,
        prefix: this.contactForm.value.prefix,
        firstName: this.contactForm.value.firstName,
        middleName: this.contactForm.value.middleName,
        lastName: this.contactForm.value.lastName,
        designationName: this.contactForm.value.designationId.name,
        designationId: this.contactForm.value.designationId.id,
        roleId: this.contactForm.value.roleId,
        primaryEmail: this.contactForm.value.primaryEmail,
        primaryCCP: this.contactForm.value.primaryCCP,
        primaryPhoneNumber: this.contactForm.value.primaryPhoneNumber,
        secondaryEmail: this.contactForm.value.secondaryEmail,
        secondaryCCP: this.contactForm.value.secondaryCCP,
        secondaryPhoneNumber: this.contactForm.value.secondaryPhoneNumber,
        telephoneNumber: this.contactForm.value.telephoneNumber,
        startDate: this.contactForm.value.startDate,
        endDate: this.contactForm.value.endDate,
        status: this.contactForm.value.status,
        remarksAndNotes: this.contactForm.value.remarksAndNotes,
        createdBy: this.authService.getUser(),
        createdDate: this.todayDate1,
        updatedBy: this.authService.getUser(),
        updatedDate: this.todayDate1,
      }; */
      let saveData = {
        //paxId: null,
        // issuedCountry: this.contactForm.value.issuedCountry !== '' ? Number(this.contactForm.value.issuedCountry) : 0,
        nationality: this.contactForm.value.nationality !== '' ? Number(this.contactForm.value.nationality) : 0,
        dob: this.contactForm.value.dob,
        passport: this.contactForm.value.passport,
        issuedCountry: this.contactForm.value.issuedCountry !== '' ? Number(this.contactForm.value.issuedCountry) : 0,
        customerId: this.contactForm.value.customerId,
        prefix: this.contactForm.value.prefix,
        firstName: this.contactForm.value.firstName,
        middleName: this.contactForm.value.middleName,
        lastName: this.contactForm.value.lastName,
        //designationName: this.newPaxForm.value.designationId.name,
        //designationId: this.newPaxForm.value.designationId.id,
        designationName:
          this.contactForm.value?.designationId?.name === undefined
            ? null
            : this.contactForm.value?.designationId?.name,
        designationId:
          this.contactForm.value?.designationId?.id === undefined ? 0 : this.contactForm.value?.designationId?.id,
        roleId: this.contactForm.value.roleId,
        primaryEmail: this.contactForm.value.primaryEmail,
        primaryCCP: Number(this.contactForm.value.primaryCCP),
        primaryPhoneNumber: Number(this.contactForm.value.primaryPhoneNumber),
        secondaryEmail: this.contactForm.value.secondaryEmail,
        secondaryCCP: this.contactForm.value.secondaryCCP,
        //secondaryPhoneNumber: this.newPaxForm.value.secondaryPhoneNumber,
        //telephoneNumber: this.newPaxForm.value.telephoneNumber,
        secondaryPhoneNumber:
          this.contactForm.value.secondaryPhoneNumber !== '' ? Number(this.contactForm.value.secondaryPhoneNumber) : 0,
        telephoneNumber:
          this.contactForm.value.telephoneNumber !== '' ? Number(this.contactForm.value.telephoneNumber) : 0,
        startDate: this.contactForm.value.startDate,
        endDate: this.contactForm.value.endDate,
        status: this.contactForm.value.status,
        remarksAndNotes: this.contactForm.value.remarksAndNotes,
        createdBy: this.authService.getUser(),
        //updatedBy: 1,
        createdDate: this.todayDate1,
        updatedBy: this.authService.getUser(),
        updatedDate: this.todayDate1,
        dpImageUrl: this.contactForm.value.dpImageUrl,
      };
      let payload = {
        paxId: this.contactForm.value.paxId,
        contactModel: saveData,
      };
      let DataPayload = Object.assign(payload);

      this.dashboardRequestService
        .createNewPax(DataPayload, apiUrls.newPax_create_url.create)
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe((res) => {
          const result: ApiResponse = res;
          this.contactId = res.data[0]?.contactModel?.id;
          if (result.status === 200) {
            this.onSubmitServiceRequestHeader(routesName, requestType);
            //this.toastr.success(result.message, 'Success');
          } else {
            if (result.status === 409) {
              this.toastr.error(
                `${this.contactForm.value.primaryEmail} email and ${this.contactForm.value.primaryPhoneNumber} mobile number alreday exists`,
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
  onSubmitServiceRequestHeader(routesName: string, requestType?: string) {
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
      customerId: this.contactForm.value.customerId,
      contactId: this.contactId,
      requestStatus: 1,
      priorityId: 1,
      severityId: 1,
      packageRequest: holiday,
      dmcFlag: dmc_flag,
    };
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
    /*  this.dashboardRequestService.createServiceRequestLine(srRequestHeaderData).pipe(takeUntil(this.ngDestroy$)).subscribe((requestResponse: ServiceRequestLine) => {
      if (requestResponse) {

        if(routesName=== 'ancillary'){
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
                if(requestResponse?.requestId){
                  this.router.navigate([`/dashboard/booking/ancillary`], {
                    queryParams: {
                      requestId: requestResponse.requestId,
                      contactId: contactId,
                      serviceTypeId: btoa(escape(result)), },
                  });
                }


              }
            },
            (err) => {}
          );
        }else{
          this.isloading = false;
          if(requestResponse?.requestId){
            this.router.navigate([`/dashboard/booking/${routesName}`], {
              queryParams: { requestId: requestResponse.requestId, contactId: contactId },
            });
          }

        }
      }


    },
      (error) => {
        this.isloading = false;
        this.toastr.error('Oops! Something went wrong ', 'Error');
      }); */
  }
  /****
   * data shared
   * from
   * Search Pax */
  getNotFoundSearchPaxDataData() {
    this.nofoundCustomerId = this.SearchPaxDataService.data;
    this.contactForm.patchValue({
      firstName: this.nofoundCustomerId?.firstName,
      lastName: this.nofoundCustomerId?.lastName,
      primaryEmail: this.nofoundCustomerId?.primaryEmail,
      primaryPhoneNumber: this.nofoundCustomerId?.primaryPhoneNumber,
    });
  }

  onSaveHandleCommunicationModuleLink(requestNumber: string, contactId: number, routesName: string) {
    if (this.waNumberCheck && this.wa_number && this.ticketNumber) {
      const onSave = {
        channel: 'WA',
        channelReference: this.ticketNumber,
        createdAt: this.todayDate1,
        createdBy: this.authService.getUser(),
        customerId: this.contactForm.value.customerId,
        moduleId: this.moduleId,
        moduleName: this.moduleName,
        moduleReference: requestNumber,
        status: 0,
        updatedAt: this.todayDate1,
        updatedBy: this.authService.getUser(),
      };

      this.dashboardRequestService
        .createCommunication(onSave, apiUrls.CommunicationModule.communicationModuleLink)
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
