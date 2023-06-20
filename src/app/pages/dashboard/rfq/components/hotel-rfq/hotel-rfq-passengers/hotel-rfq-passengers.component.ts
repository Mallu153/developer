import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription } from 'rxjs';
import { Passengers } from 'app/pages/dashboard/dashboard-request/model/selectedPassengers';
import { DatePipe } from '@angular/common';
import { MasterDataService } from 'app/shared/services/master-data.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { AuthService } from 'app/shared/auth/auth.service';
import { DashboardRequestService } from 'app/pages/dashboard/dashboard-request/services/dashboard-request.service';
import { SelectedPassengersService } from '../../../../dashboard-booking/share-data-services/selected-passenger.service';
import * as apiUrls from '../../../../dashboard-request/url-constants/url-constants';
import { ApiResponse } from '../../../../dashboard-request/model/api-response';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-hotel-rfq-passengers',
  templateUrl: './hotel-rfq-passengers.component.html',
  styleUrls: ['./hotel-rfq-passengers.component.scss']
})
export class HotelRfqPassengersComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  //page title
  PageTitle = 'Sr Contact Search';
  //formgroup define
  selectedFormGroup: FormGroup;
  searchpaxForm: FormGroup;
  editresultForm: FormGroup;
  fourFieldsForm: FormGroup;
  updatedata: any;
  submitted = false;
  isValidFormSubmitted = null;
  //lov for pax type
  masterPaxTypeList: any;
  //search data
  ApiResponseSearchData: any;
  show = true;
  resultShow = false;
  bizid: any;
  emptyData = false;
  createnewContact = false;
  apipaxId: any;
  //table select array
  selectedUserProfiles: any = [];
  //no Foundpax data
  noFoundData: any;
  // create new persons
  newPerson = false;
  SelectedPassengers: Passengers[] = [];
  SelectedPassengersSub: Subscription;
  //lov
  countryListLov: any;
  titleListlov: any;
  nationalityListLov: any;
  @Input() roomIndex: number;
  //added persons
  addedPersonList = [];
  requestId: number;
  //ipaddress
  deviceInfo = null;
  isDesktopDevice: boolean;
  isTablet: boolean;
  isMobile: boolean;
  //today date
  todayDate = new Date();
  todayDate1: string;
  constructor(
    private fb: FormBuilder,
    private titleService: Title,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dashboardRequestService: DashboardRequestService,
    public masterDataService: MasterDataService,
    private SelectedPassengersService: SelectedPassengersService,
    private modalService: NgbModal,
    private datepipe: DatePipe,
    private deviceService: DeviceDetectorService,
    private authService:AuthService
  ) {
    this.todayDate1 = this.datepipe.transform(this.todayDate, 'yyyy-MM-dd');
    /* this.SelectedPassengersSub = this.SelectedPassengersService.getData().subscribe(res => {
      this.SelectedPassengers = res;
    }); */
  }
  epicFunction() {
    this.deviceInfo = this.deviceService.getDeviceInfo();
    this.isMobile = this.deviceService.isMobile();
    this.isTablet = this.deviceService.isTablet();
    this.isDesktopDevice = this.deviceService.isDesktop();

  }
  selectedProfiles() {
    this.selectedFormGroup = this.fb.group({
      selectedUserProfiles: this.fb.array([]),
    });
  }
  FourFieldsSearchForm() {
    this.fourFieldsForm = this.fb.group({
      firstName: '',
      lastName: '',
      primaryEmail: ['', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      primaryPhoneNumber: ['', [Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
    });
  }
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }
  initializeForm() {
    this.searchpaxForm = this.fb.group({
      searchArrayData: this.fb.array([this.createSearchFormGroup()], [Validators.required])
    });
  }
  get d() {
    return this.fourFieldsForm.controls;
  }
  createSearchFormGroup() {
    return this.fb.group({
      //passengerSrId: this.requestId,
      passengerPaxId: '',
      passengerTitle: ['', [Validators.required]],
      passengerFirstName: ['', [Validators.required]],
      passengerMiddleName: '',
      passengerLastName: ['', [Validators.required]],
      passengerEmail: ['', [Validators.required, Validators.email]],
      passengerPhone: ['', [Validators.required]],
      passengerNationality: '',
      dob: ['', [Validators.required]],
      passport: '',
      passengerCoutry: '',
      passengerType: ['', [Validators.required]],
      passportIssueDate: '',
      passportExpiredDate: '',
      passengerCreatedBy: 1,
      passengerCreatedDate: this.todayDate1,
      passengerCreatedDevice: this.deviceInfo?.userAgent,
      passengerCreatedIp: null,
    });
    /*   id?: number;
      passengerAddonsRequired: number;
      passengerCountryResidency: number;
      passengerCoutry: number;
      passengerEmail: string;
      passengerFirstName: string;
      passengerLastName: string;
      passengerLineId: number;
      passengerMiddleName: string;
      passengerNationality: number;
      passengerPaxId: number;
      passengerPhone: string;
      passengerRoomId: number;
      passengerSrId: number;
      passengerStatus: number;
      passengerTitle: string;
      passengerType: number;
      passengerCreatedBy?: number;
      passengerCreatedDate?: Date;
      passengerCreatedDevice?: string;
      passengerCreatedIp?: string;
      passengerUpdatedBy?: number;
      passengerUpdatedDate?: Date;
      passengerUpdatedDevice?: string;
      passengerUpdatedIp?: string; */
  }
  initializeEditForm() {
    this.editresultForm = this.fb.group({
      editArrayData: this.fb.array([this.createEditFormGroup()], [Validators.required])
      /* firstName: '',
      lastName: '',
      primaryEmail: '',
      primaryPhoneNumber: '', */
    });
  }
  createEditFormGroup() {
    return this.fb.group({
      /*    paxId: '',
         prefix: '',
         firstName: '',
         lastName: '',
         email: ['', [Validators.email]],
         phone: '',
         nationality: '',
         dob: '',
         passport: '',
         issuedCountry: '',
         paxType: '',
         passportIssueDate: '',
         passportExpiredDate: '', */

      //passengerSrId: Number(this.requestId),
      passengerPaxId: '',
      passengerTitle: ['', [Validators.required]],
      passengerFirstName: ['', [Validators.required]],
      passengerMiddleName: '',
      passengerLastName: ['', [Validators.required]],
      passengerEmail: ['', [Validators.required, Validators.email]],
      passengerPhone: ['', [Validators.required]],
      passengerNationality: '',
      dob: ['', [Validators.required]],
      passport: '',
      passengerCoutry: '',
      passengerType: ['', [Validators.required]],
      passportIssueDate: '',
      passportExpiredDate: '',
      passengerCreatedBy: this.authService.getUser(),
      passengerCreatedDate: this.todayDate1,
      passengerCreatedDevice: this.deviceInfo?.userAgent,
      passengerCreatedIp: null,

    });
  }
  get editArrayData(): FormArray {
    return this.editresultForm.get('editArrayData') as FormArray;
  }
  get searchArrayData(): FormArray {
    return this.searchpaxForm.get('searchArrayData') as FormArray;
  }
  add() {
    const fg = this.createEditFormGroup();
    this.editArrayData.push(fg);
  }
  deleteAPPGenS(idx: number) {
    //this.appgens.removeAt(idx);
    if (this.editArrayData.controls?.length > 0) {
      this.editArrayData.removeAt(idx);
    }
  }
  addSearch() {
    const fg = this.createSearchFormGroup();
    this.searchArrayData.push(fg);
  }
  //get the formcontrols here
  get f() {
    return this.searchpaxForm.controls;
  }
  get e() {
    return this.editresultForm.controls;
  }
  // master Lov methods
  getCountry() {
    this.dashboardRequestService.readCompanyMasterLov(apiUrls.searchpax_url.countyLov).pipe(takeUntil(this.ngDestroy$)).subscribe((countryListLov: ApiResponse) => {
      const result: ApiResponse = countryListLov;
      if (result.status === 200) {
        this.countryListLov = result.data;
        this.cdr.detectChanges();
      } else {
        this.toastr.error('Oops! Something went wrong  while fetching the country data', 'Error');
      }
    });
  }
  getNationality() {
    this.dashboardRequestService.readCompanyMasterLov(apiUrls.searchpax_url.nationalityLov).pipe(takeUntil(this.ngDestroy$)).subscribe((countryListLov: ApiResponse) => {
      const result: ApiResponse = countryListLov;
      if (result.status === 200) {
        this.nationalityListLov = result.data;
        this.cdr.detectChanges();
      } else {
        this.toastr.error('Oops! Something went wrong  while fetching the Nationality data', 'Error');
      }
    });
  }
  getTitle() {
    this.dashboardRequestService.readMasterLov(apiUrls.searchpax_url.titlelov).pipe(takeUntil(this.ngDestroy$)).subscribe((titleListlov: ApiResponse) => {
      const result: ApiResponse = titleListlov;
      if (result.status === 200) {
        this.titleListlov = result.data;
        this.cdr.detectChanges();
      } else {
        this.toastr.error('Oops! Something went wrong  while fetching the title data', 'Error');
      }
    });
  }
  getMasterPaxType() {
    this.masterDataService.getMasterDataByTableName('master_pax_type').pipe(takeUntil(this.ngDestroy$)).subscribe((data) => {
      if (data) {
        this.masterPaxTypeList = data;
        this.cdr.detectChanges();
      } else {
        this.toastr.error('Oops! Something went wrong  while fetching the Pax Type data', 'Error');
      }
    });
  }

  reset() {
    this.fourFieldsForm.reset();
  }

  //search pax service call
  onSubmitPaxSearch() {
    this.submitted = true;
    const mail = this.fourFieldsForm.value.primaryEmail;
    const primaryPhoneNumber = this.fourFieldsForm.value.primaryPhoneNumber;
    const firstName = this.fourFieldsForm.value.firstName;
    const lastName = this.fourFieldsForm.value.lastName;
    let searchObj = {};
    if (mail) {
      searchObj['primaryEmail'] = this.fourFieldsForm.value.primaryEmail;
      if (this.fourFieldsForm.invalid) {
        return;
      }
      if (this.fourFieldsForm.valid) {
        this.searchPax(searchObj);
      }
      //this.searchPax(searchObj);
    } else if (primaryPhoneNumber) {
      searchObj['primaryPhoneNumber'] = this.fourFieldsForm.value.primaryPhoneNumber;
      this.searchPax(searchObj);
      if (this.fourFieldsForm.invalid) {
        return;
      }
      if (this.fourFieldsForm.valid) {
        this.searchPax(searchObj);
      }
    } else if (firstName && lastName) {
      if (firstName && lastName) {
        searchObj['firstName'] = this.fourFieldsForm.value.firstName;
        searchObj['lastName'] = this.fourFieldsForm.value.lastName;
        if (this.fourFieldsForm.invalid) {
          return;
        }
        if (this.fourFieldsForm.valid) {
          this.searchPax(searchObj);
        }
      } else {
        this.toastr.error('Please give both first and last name for search', 'Error');
      }
    } else {
      this.toastr.error('Please give any of field and search', 'Error');
    }
  }
  searchPax(data: any) {
    this.dashboardRequestService.SearchPax(data, apiUrls.searchpax_url.paxtableSearch).pipe(takeUntil(this.ngDestroy$)).subscribe((contactList: ApiResponse) => {
      const result: ApiResponse = contactList;
      if (result.status === 200) {
        this.ApiResponseSearchData = result.data;
        this.newPerson = false;
        this.createnewContact = false;
        this.getPatchdata(this.ApiResponseSearchData);
        this.cdr.detectChanges();
        this.apipaxId = result.data[0].id;
        const resultLength = this.ApiResponseSearchData.length;
        if (resultLength) {
          this.resultShow = true;
          this.show = false;
          this.emptyData = false;
          this.cdr.detectChanges();
        }
        //this.cdr.detectChanges();
      } else {
        if (result.message === 'NOT_FOUND') {
          const totalLength = result.data.length;
          if (totalLength === 0) {
            this.resultShow = false;
            this.noFoundData = this.fourFieldsForm.value;
            this.getNoFoundData([this.noFoundData]);
            this.emptyData = true;
            this.createnewContact = true;
            this.cdr.detectChanges();
          }
        } else {
          this.toastr.error('Oops! Something went wrong ', 'Error');
        }
      }
    });
  }

  getPatchdata(ApiResponseSearchData) {
    this.updatedata = ApiResponseSearchData;
    for (let i = 0; i < this.updatedata?.length; i++) {
      if (i > 0) {
        const fg = this.createEditFormGroup();
        this.searchArrayData.push(fg);
      }
      const nalitionaliyname = this.nationalityListLov?.find((v) => v.id === this.updatedata[i]?.nationality);
      const countryname = this.countryListLov?.find((v) => v.id === this.updatedata[i]?.issuedCountry);
      ((this.searchpaxForm.get('searchArrayData') as FormArray).at(i) as FormGroup).patchValue({
        passengerPaxId: this.updatedata[i]?.id,
        passengerTitle: this.updatedata[i]?.prefix,
        passengerFirstName: this.updatedata[i]?.firstName,
        passengerLastName: this.updatedata[i]?.lastName,
        passengerEmail: this.updatedata[i]?.primaryEmail,
        passengerPhone: this.updatedata[i]?.primaryPhoneNumber,
        passengerNationality: this.updatedata[i]?.nationality,
        //passengerNationality: nalitionaliyname,
        dob: this.datepipe.transform(this.updatedata[i]?.dob, 'yyyy-MM-dd'),
        passport: this.updatedata[i]?.passport,
        issuedCountry: this.updatedata[i]?.issuedCountry,
        //issuedCountry: countryname,
        passengerType: this.updatedata[i]?.paxType,
      });

      this.cdr.markForCheck();
    }
  }
  /**
  * Triggers event on selected profile from the table
  * @param index
  * @param selectedData
  */
  onProfileCheckboxChage(e, j,mainIndex) {

    const data: FormArray = this.selectedFormGroup.get('selectedUserProfiles') as FormArray;
    if (e.target.checked) {
      data.push(new FormControl(j));

    } else {
      const index = data.controls.findIndex(x => x.value === j);
      data.removeAt(index);

    }


  }
  onSubmitSelectList() {
    this.submitted = true;
    this.isValidFormSubmitted = false;

   /*  if (this.searchArrayData.invalid) {
      return this.toastr.error("Please fill the required fields and submit the form ")
    } */
    this.searchArrayData.controls.forEach(c => c.clearValidators());
    if (this.selectedFormGroup.value.selectedUserProfiles?.length === 0) {
      this.submitted = false;
      this.isValidFormSubmitted = true;
      return alert('select atleast one ');
    } else {
      let data = {
        passengers: this.selectedFormGroup.value.selectedUserProfiles,
        roomIndex: this.roomIndex
      }
      this.SelectedPassengersService.sendHotelData(data);
      for (let r = 0; r < this.selectedFormGroup.value.selectedUserProfiles?.length; r++) {
        this.addedPersonList?.push(this.selectedFormGroup?.value?.selectedUserProfiles[r]);
      }
      const control = <FormArray>this.selectedFormGroup?.controls['selectedUserProfiles'];
      for (let i = control?.length - 1; i >= 0; i--) {
        control?.removeAt(i);
      }
      this.resultShow = false;

      //this.closeModalWindowForAddPerson();
    }

    this.cdr.markForCheck();
  }
  NoPaxFoundonProfileCheckboxChage(data) {
    this.submitted = true;
    this.isValidFormSubmitted = false;
    if (this.editresultForm.invalid) {
      return this.toastr.error("Please fill required fields and submit", "Error")
    }
    this.selectedUserProfiles.push(data);
    let nodData = {
      passengers: this?.selectedUserProfiles,
      roomIndex: this.roomIndex
    }
    this.SelectedPassengersService.sendHotelData(nodData);
    for (let n = 0; n < this.selectedUserProfiles?.length; n++) {
      this.addedPersonList.push(this.selectedUserProfiles[n]);
    }
    const control = <FormArray>this.selectedFormGroup.controls['selectedUserProfiles'];
    for (let i = control.length - 1; i >= 0; i--) {
      control.removeAt(i);
    }
    if (this.selectedUserProfiles?.length > 0) {
      this.selectedUserProfiles?.splice(0, 1);
    }
    for (let i = this.editArrayData.length; i > 0; i--) {
      this.deleteAPPGenS(i);
    }
    this.resetArry();
    this.newPerson = false;
    //this.closeModalWindowForAddPerson();
  }
  resetArry() {
    this.editArrayData?.reset();
    this.submitted = false;
    this.isValidFormSubmitted = true;
  }
  /**
     * A method to close the add person modal on clicking go button
     */
  closeModalWindowForAddPerson() {
    if (this.modalService.hasOpenModals()) {
      this.modalService.dismissAll();
      this.submitted = false;
      this.isValidFormSubmitted = true;
    }
  }

  getNoFoundData(patchdata) {
    const Data = patchdata;
    if (Data) {
      ((this.editresultForm.get('editArrayData') as FormArray).at(0) as FormGroup).patchValue({
        passengerPaxId: 0,
        passengerFirstName: Data[0]?.firstName,
        passengerLastName: Data[0]?.lastName,
        passengerEmail: Data[0]?.primaryEmail,
        passengerPhone: Data[0]?.primaryPhoneNumber,
      });

      this.cdr.markForCheck();
    }
  }

  goEmptyFormOpen() {
    this.newPerson = true;
    this.createnewContact = false;
    this.cdr.markForCheck();
  }
  trackByFn(index, item) {
    return index;
  }

  ngOnInit(): void {
    this.FourFieldsSearchForm();
    this.initializeForm();
    this.initializeEditForm();
    this.selectedProfiles();
    //master lov
    this.getCountry();
    this.getNationality();
    this.getMasterPaxType();
    this.getTitle();

  }
  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
