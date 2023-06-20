import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DashboardRequestService } from '../../../dashboard-request/services/dashboard-request.service';
import { ApiResponse } from '../../../dashboard-request/model/api-response';
import * as apiUrls from '../../../dashboard-request/url-constants/url-constants';
import { SelectedPassengersService } from '../../share-data-services/selected-passenger.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription } from 'rxjs';
import { Passengers } from 'app/pages/dashboard/dashboard-request/model/selectedPassengers';
import { DatePipe } from '@angular/common';
import { MasterDataService } from 'app/shared/services/master-data.service';
import { AuthService } from 'app/shared/auth/auth.service';
import { takeUntil, filter } from 'rxjs/operators';
import { AssignTypeMustMatch } from 'app/shared/directives/assign-type-must-match';

@Component({
  selector: 'app-passenger-search',
  templateUrl: './passenger-search.component.html',
  styleUrls: ['./passenger-search.component.scss'],
})
export class PassengerSearchComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  //page title
  PageTitle = 'Sr Contact Search';
  //formgroup define
  selectedFormGroup: FormGroup;
  searchpaxForm: FormGroup;
  editresultForm: FormGroup;
  fourFieldsForm: FormGroup;
  updatedata: any = [];
  submitted = false;
  isValidFormSubmitted = null;
  //lov for pax type
  masterPaxTypeList: any;
  //search data
  ApiResponseSearchData: any[] = [];
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
  //added persons show titleList
  addedPersonList = [];
  nationalityData: any;
  todayDate = new Date();
  todayDate1: string;

  date = new Date();
  minDate: string;
  maxDate =
    new Date().getFullYear().toString() +
    '-0' +
    (new Date().getMonth() + 1).toString() +
    '-' +
    new Date().getDate().toString();

   //checkbox
    masterSelected: boolean;
    checkedArraylist: any;
    //holiday passenger
    @Input() holidayIndex: number;
    //attracton type pax
    addonsPassengers: any[] = [];
    @Input() sourceType: string;
    @Input() paxCount: any;
    attractionsType:boolean=false;
    duplicates = [];
    activitiesPax:boolean=false;
    newActivitiesPax:boolean=false;
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private dashboardRequestService: DashboardRequestService,
    public masterDataService: MasterDataService,
    private SelectedPassengersService: SelectedPassengersService,
    private modalService: NgbModal,
    private datepipe: DatePipe,

  ) {
    /* this.SelectedPassengersSub = this.SelectedPassengersService.getData().subscribe(res => {
      this.SelectedPassengers = res;
    }); */
    this.todayDate1 = this.datepipe.transform(this.todayDate, 'yyyy-MM-dd');
    this.minDate = '1900-01-01';
    this.maxDate = this.todayDate1;
  }

  ngOnInit(): void {


    if(this.sourceType==='package'){
      this.attractionsType=true;
      this.activitiesPax=false;
      this.onChangePax(this.holidayIndex,this.paxCount);
    }else if(this.sourceType==='activities'){
      this.activitiesPax=true;
      this.attractionsType=false;
    }else{
      this.activitiesPax=false;
      this.attractionsType=false;
    }
    this.FourFieldsSearchForm();
    this.initializeForm();
    this.initializeEditForm();
    this.selectedProfiles();
    //master lov
    this.getCountry();
    this.getNationality();
    this.getMasterPaxType();
    this.getTitle();

    this.searchArrayData.valueChanges.pipe(takeUntil(this.ngDestroy$)).subscribe((formValues) => {
      if(this.sourceType==='package'){
        this.checkDuplicatesName('assigned');
      }
    });



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
      primaryPhoneNumber: ['', [Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$')]],
    });
  }

  reset() {
    this.fourFieldsForm.reset();
    const control = <FormArray>this.searchpaxForm.controls['searchArrayData'];
      for (let i = control.length - 1; i >= 0; i--) {
        control.removeAt(i);
      }
      this.resultShow = false;
      /* const editcontrol = <FormArray>this.editresultForm.controls['editArrayData'];
      for (let i = editcontrol.length - 1; i >= 0; i--) {
        editcontrol.removeAt(i);
      } */
    this.newPerson = false;
  }
  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  initializeForm() {
    this.searchpaxForm = this.fb.group({
      searchArrayData: this.fb.array([],[Validators.required]), //this.createSearchFormGroup()
    });

  }
  get d() {
    return this.fourFieldsForm.controls;
  }

  setDynamicValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (this.sourceType === 'flight' || this.sourceType === 'ancillary') {
        return null;
      }else{
        return { required: true };
      }

    };
  }
  createSearchFormGroup() {
    return this.fb.group({
      paxId: '',
      prefix: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      nationality: '',
      dob: '',
      passport: '',
      issuedCountry: '',
      passportIssueDate: '',
      passportExpiredDate: '',
      customerId: '',
      paxType: ['', Validators.required],
      assigned:['', Validators.required],
      gender:'Male',
      isSelected:false,
      //isSelected:new FormControl({value: false, disabled: true}),
      //isSelected: false,

    },{
      validator: AssignTypeMustMatch('assigned', 'paxType')
    });
  }


  initializeEditForm() {
    if(this.sourceType==='package'){
      this.editresultForm = this.fb.group({
        editArrayData: this.fb.array([this.createPackageEditFormGroup()], [Validators.required]),

      });
    }else if(this.sourceType==='activities'){
      this.editresultForm = this.fb.group({
        editArrayData: this.fb.array([this.createActivitiesPaxEditFormGroup()], [Validators.required]),
      });
    }else{
      this.editresultForm = this.fb.group({
        editArrayData: this.fb.array([this.createEditFormGroup()], [Validators.required]),

      });
    }
  }


  createActivitiesPaxEditFormGroup() {
    return this.fb.group({
      prefix: '2',
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      dob: '',
      gender:'Male',
      paxType: ['', [Validators.required]],
    });
  }
  createPackageEditFormGroup() {
    return this.fb.group({
      paxId: '',
      prefix: '2',
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      nationality: '',
      dob: '',
      passport: '',
      issuedCountry: '',
      passportIssueDate: '',
      passportExpiredDate: '',
      customerId: '',
      paxType: ['', [Validators.required]],
      assigned:['', [Validators.required]],
    },{
      validator: AssignTypeMustMatch('assigned', 'paxType')
    });
  }
  createEditFormGroup() {
    return this.fb.group({
      paxId: '',
      prefix: '2',
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      nationality: '',
      dob: '',
      passport: '',
      issuedCountry: '',
      passportIssueDate: '',
      passportExpiredDate: '',
      customerId: '',
      paxType: ['', [Validators.required]],
      assigned:'',
    });
  }
  get editArrayData(): FormArray {
    return this.editresultForm.get('editArrayData') as FormArray;
  }
  get searchArrayData(): FormArray {
    return this.searchpaxForm.get('searchArrayData') as FormArray;
  }
  add() {
    this.isValidFormSubmitted = true;
    const fg = this.createEditFormGroup();
    this.editArrayData.push(fg);
  }
  addSearch() {
    this.isValidFormSubmitted = true;
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
    this.dashboardRequestService
      .SearchPax(data, apiUrls.searchpax_url.paxtableSearch)
      .pipe(takeUntil(this.ngDestroy$)).subscribe((contactList: ApiResponse) => {
        const result: ApiResponse = contactList;
        if (result.status === 200) {

          /* result.data?.forEach((element) => {
            element.isSelected = false;
          }); */
          //this.ApiResponseSearchData=[];
          this.ApiResponseSearchData = result.data;


          /* if (this.ApiResponseSearchData) {
          const a = this.ApiResponseSearchData;
          const b = this.addedPersonList;
          // A comparer used to determine if two entries are equal.
          const isSameUser = (a, b) => a.id == b.id
          //&& a.primaryPhoneNumber == b.phone;
          // Get items that only occur in the left array,
          // using the compareFunction to determine equality.
          const onlyInLeft = (left, right, compareFunction) =>
            left.filter(leftValue => !right.some(rightValue => compareFunction(leftValue, rightValue)));
          const onlyInA = onlyInLeft(a, b, isSameUser);
          const onlyInB = onlyInLeft(b, a, isSameUser);
          const result = [...onlyInA, ...onlyInB];
          console.log(result);
          if (result.length === 0) {
            return this.toastr.warning("alreday exists these record");
          } else {
            this.getPatchdata(result);
          }
        } */
          this.getPatchdata(this.ApiResponseSearchData);
          this.apipaxId = result.data[0]?.id;
          this.newPerson = false;
          this.createnewContact = false;
          this.cdr.detectChanges();
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

    this.searchArrayData.clear();
    this.submitted = false;
    this.isValidFormSubmitted = true;
    if (this.updatedata?.length>0) {
      for (let i = 0; i < this.updatedata?.length; i++) {
        if (i >= 0) {
          const fg = this.createSearchFormGroup();
          this.searchArrayData.push(fg);

        }
        const nalitionaliyname = this.nationalityListLov?.find((v) => v.id === this.updatedata[i]?.nationality);

        const countryname = this.countryListLov?.find((v) => v.id === this.updatedata[i]?.issuedCountry);

        /*   this.nationalityData = {
            id: nalitionaliyname?.id,
            code: null,
            currency: null,
            description: null,
            iso2: null,
            iso3: null,
            name: nalitionaliyname?.name,
            status: null,
            timeZone: null,
          };
          console.log(this.nationalityData); */

        ((this.searchpaxForm.get('searchArrayData') as FormArray)?.at(i) as FormGroup)?.patchValue({
          paxId: this.updatedata[i]?.id,
          prefix: this.updatedata[i]?.prefix === '' ? ' ' : this.updatedata[i]?.prefix,
          firstName: this.updatedata[i]?.firstName,
          lastName: this.updatedata[i]?.lastName,
          email: this.updatedata[i]?.primaryEmail,
          phone: this.updatedata[i]?.primaryPhoneNumber,
          nationality: nalitionaliyname === undefined ? '' : nalitionaliyname,
          dob: this.datepipe.transform(this.updatedata[i]?.dob, 'yyyy-MM-dd'),
          passport: this.updatedata[i]?.passport,
          issuedCountry: countryname === undefined ? '' : countryname,
          //paxType: this.updatedata[i]?.paxType  === '' ? "" :this.updatedata[i]?.paxType,
          customerId: this.updatedata[i]?.customerId,
          //isSelected: this.updatedata[i]?.isSelected,
        });

        //const assignedControl = (this.searchpaxForm.get('searchArrayData') as FormArray)?.at(i).get('assigned');
        const assignedControl =  this.searchArrayData.controls[i].get('assigned');
         if(this.sourceType==='package'){
          assignedControl.setValidators([Validators.required]);
         }else{
          assignedControl.setValidators(null);
         }
         assignedControl.updateValueAndValidity();
        //this.searchArrayData.at(i).get('isSelected').disable();
        /* this.searchArrayData.at(i).get('customerId').disable();
        this.searchArrayData.at(i).get('paxId').disable();
        this.searchArrayData.at(i).get('paxType').disable();
        this.searchArrayData.at(i).get('issuedCountry').disable();
        this.searchArrayData.at(i).get('passport').disable();
        this.searchArrayData.at(i).get('dob').disable();
        this.searchArrayData.at(i).get('nationality').disable();
        this.searchArrayData.at(i).get('phone').disable();
        this.searchArrayData.at(i).get('email').disable();
        this.searchArrayData.at(i).get('lastName').disable();
        this.searchArrayData.at(i).get('firstName').disable();
        this.searchArrayData.at(i).get('prefix').disable();
        this.searchArrayData.at(i).get('passportIssueDate').disable();
        this.searchArrayData.at(i).get('passportExpiredDate').disable(); */
        this.cdr.markForCheck();
      }

    }
  }

  /**
   * Triggers event on selected profile from the table
   * @param index
   * @param selectedData
   */
  onProfileCheckboxChage(e, j) {
    const data: FormArray = this.selectedFormGroup.get('selectedUserProfiles') as FormArray;
    if (e.target.checked) {
      data.push(new FormControl(j));
    } else {
      const index = data.controls.findIndex((x) => x.value === j);
      data.removeAt(index);
    }
    //this.onSubmitSelectList(j)
  }



  isAllSelected() {
    this.masterSelected = this.searchArrayData.value.every((item:any)=> {
        return item.isSelected == true;
      })
    this.getCheckedItemList();
  }
  getCheckedItemList(){
    this.checkedArraylist = [];
    for (let i = 0; i < this.searchArrayData.value.length; i++) {
      if(this.searchArrayData.value[i]?.isSelected){
        //this.searchArrayData.at(i).get('isSelected').enable();
        /* this.searchArrayData.at(i).get('customerId').enable();
        this.searchArrayData.at(i).get('paxId').enable();
        this.searchArrayData.at(i).get("paxType").enable();
        this.searchArrayData.at(i).get("issuedCountry").enable();
        this.searchArrayData.at(i).get("passport").enable();
        this.searchArrayData.at(i).get("dob").enable();
        this.searchArrayData.at(i).get("nationality").enable();
        this.searchArrayData.at(i).get("phone").enable();
        this.searchArrayData.at(i).get("email").enable();
        this.searchArrayData.at(i).get("lastName").enable();
        this.searchArrayData.at(i).get("firstName").enable();
        this.searchArrayData.at(i).get("prefix").enable();
        this.searchArrayData.at(i).get("passportIssueDate").enable();
        this.searchArrayData.at(i).get("passportExpiredDate").enable(); */
        //this.checkedArraylist.push(this.searchArrayData.value[i]);
      }else{
        //this.searchArrayData.at(i).get('isSelected').disable();
        /* this.searchArrayData.at(i).get('customerId').disable();
        this.searchArrayData.at(i).get('paxId').disable();
        this.searchArrayData.at(i).get('paxType').disable();
        this.searchArrayData.at(i).get('issuedCountry').disable();
        this.searchArrayData.at(i).get('passport').disable();
        this.searchArrayData.at(i).get('dob').disable();
        this.searchArrayData.at(i).get('nationality').disable();
        this.searchArrayData.at(i).get('phone').disable();
        this.searchArrayData.at(i).get('email').disable();
        this.searchArrayData.at(i).get('lastName').disable();
        this.searchArrayData.at(i).get('firstName').disable();
        this.searchArrayData.at(i).get('prefix').disable();
        this.searchArrayData.at(i).get('passportIssueDate').disable();
        this.searchArrayData.at(i).get('passportExpiredDate').disable(); */
      }

    }


  }


  onSubmitSelectList() {
    this.submitted = true;
    this.isValidFormSubmitted = false;

    if(this.sourceType==='package'){
      if(this.searchpaxForm.invalid){
        return this.toastr.error('Please fill the required fields and assigned fileld are required',"Error");
      }
    }else{
      if(this.searchpaxForm.invalid){
        return this.toastr.error('Please fill the required fields',"Error");
      }
    }

     if(this.searchArrayData.value.length>0){
      const SELECTED_PAX=this.searchArrayData.value.filter((v)=>v.isSelected===true);
      if(SELECTED_PAX?.length===0){
        this.submitted = false;
        this.isValidFormSubmitted = true;
        return alert('please select atleast one ');
      }else{
        this.addedPersonList=SELECTED_PAX;
        const selectedData = SELECTED_PAX;
        const uniqueData = Array.from(new Set(selectedData.map((a) => a.paxId))).map((paxId) => {
          return selectedData.find((a) => a.paxId === paxId);
        });
        const SelectedPersons={
          passengers: uniqueData,
          holidayIndex: this.holidayIndex
        };

        this.SelectedPassengersService.sendData(SelectedPersons);
        this.resultShow = false;
         this.cdr.markForCheck();
      }
     }

     return;
    if (this.selectedFormGroup.value.selectedUserProfiles?.length === 0) {
      this.submitted = false;
      this.isValidFormSubmitted = true;
      return alert('please select atleast one ');
    } else {
      const selectedData = this.selectedFormGroup.value.selectedUserProfiles;
      const uniqueData = Array.from(new Set(selectedData.map((a) => a.paxId))).map((paxId) => {
        return selectedData.find((a) => a.paxId === paxId);
      });
      const SelectedPersons={
        passengers: uniqueData,
        holidayIndex: this.holidayIndex
      };

      this.SelectedPassengersService.sendData(SelectedPersons);
      if (SelectedPersons?.passengers?.length > 0) {
        for (let r = 0; r < SelectedPersons?.passengers?.length; r++) {
          this.addedPersonList.push(SelectedPersons?.passengers[r]);
        }
      }

      const control = <FormArray>this.searchpaxForm.controls['searchArrayData'];
      for (let i = control.length - 1; i >= 0; i--) {
        control.removeAt(i);
      }
      const control1 = <FormArray>this.selectedFormGroup.controls['selectedUserProfiles'];
      for (let i = control1.length - 1; i >= 0; i--) {
        control1.removeAt(i);
      }

      this.resultShow = false;
      //this.selectedUserProfiles.reset();
      this.cdr.markForCheck();
      //this.closeModalWindowForAddPerson();
    }
    ///this.SelectedPassengersService.sendData(this.selectedFormGroup.value.selectedUserProfiles);
    //this.closeModalWindowForAddPerson();
    //this.cdr.markForCheck();
  }

  // remove searchArrayData list list
  deleteSearchArrayData(index: number) {
    this.searchArrayData.removeAt(index);
  }

  NoPaxFoundonProfileCheckboxChage(data) {
    this.submitted = true;
    this.isValidFormSubmitted = false;
    if (this.editArrayData.invalid) {
      return this.toastr.error('Please fill the required fields', 'Error');
    }
    this.selectedUserProfiles.push(data);
    const SelectedPersons={
      passengers:  this.selectedUserProfiles,
      holidayIndex: this.holidayIndex
    };
    //this.selectedUserProfiles.push(SelectedPersons);
    this.SelectedPassengersService.sendData(SelectedPersons);
    for (let n = 0; n < SelectedPersons.passengers?.length; n++) {
      this.addedPersonList.push(SelectedPersons?.passengers[n]);
    }

    if (this.selectedUserProfiles.length > 0) {
      this.selectedUserProfiles.splice(0, 1);
    }
    /*  const control1 = <FormArray>this.selectedFormGroup.controls['selectedUserProfiles'];
     for (let i = control1.length - 1; i >= 0; i--) {
       control1.removeAt(i);
     } */
    this.newPerson = false;
    this.newActivitiesPax = false;
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
      ((this.editresultForm.get('editArrayData') as FormArray)?.at(0) as FormGroup).patchValue({
        paxId: 0,
        firstName: Data[0]?.firstName,
        lastName: Data[0]?.lastName,
        email: Data[0]?.primaryEmail,
        phone: Data[0]?.primaryPhoneNumber,
      });
      this.cdr.markForCheck();
    }
  }

  goEmptyFormOpen() {

    if(this.sourceType==='activities'){
      this.newActivitiesPax=true;
    }else{
      this.newActivitiesPax=false;
      this.newPerson = true;
      this.createnewContact = false;
    }
    this.cdr.markForCheck();
  }
  /* ngOnDestroy(): void {
    this.SelectedPassengersSub.unsubscribe();
  } */

  // master Lov methods
  getCountry() {
    this.dashboardRequestService
      .readCompanyMasterLov(apiUrls.searchpax_url.countyLov)
      .pipe(takeUntil(this.ngDestroy$)).subscribe((countryListLov: ApiResponse) => {
        const result: ApiResponse = countryListLov;
        if (result.status === 200) {
          this.countryListLov = result.data;
          this.cdr.detectChanges();
        } else {
          this.toastr.error('Oops! Something went wrong while fetching the country data ', 'Error');
        }
      });
  }
  getNationality() {
    this.dashboardRequestService
      .readCompanyMasterLov(apiUrls.searchpax_url.nationalityLov)
      .pipe(takeUntil(this.ngDestroy$)).subscribe((countryListLov: ApiResponse) => {
        const result: ApiResponse = countryListLov;
        if (result.status === 200) {
          this.nationalityListLov = result.data;
          this.cdr.detectChanges();
        } else {
          this.toastr.error('Oops! Something went wrong while the fetching the Nationality data ', 'Error');
        }
      });
  }

  getTitle() {
    this.dashboardRequestService
      .readMasterLov(apiUrls.searchpax_url.titlelov)
      .pipe(takeUntil(this.ngDestroy$)).subscribe((titleListlov: ApiResponse) => {
        const result: ApiResponse = titleListlov;
        if (result.status === 200) {
          this.titleListlov = result.data;
          this.cdr.detectChanges();
        } else {
          this.toastr.error('Oops! Something went wrong while the fetching Title data ', 'Error');
        }
      });
  }
  getMasterPaxType() {
    this.masterDataService.getMasterDataByTableName('master_pax_type').pipe(takeUntil(this.ngDestroy$)).subscribe((data) => {
      if (data) {
        this.masterPaxTypeList = data;
        this.cdr.detectChanges();
      } else {
        this.toastr.error('Oops! Something went wrong while fetching the PaxType data ', 'Error');
      }
    });
  }



  onChangePax(mainIndex: number,flightData:any) {
    const fromControl = flightData;
    if (fromControl) {
      let PersonCount = [];
      const passenger_count_data = {
        noofInf: fromControl.noofInf,
        noofAdt: fromControl.noofAdt,
        noofChd: fromControl.noofChd,
      };
      PersonCount.push(passenger_count_data);
      if (PersonCount) {
        this.getAddonsRoutesData(mainIndex, PersonCount);
      }
    }
  }

  getAddonsRoutesData(mainIndex: number, lineData: any[]) {
    let linePersonCount = [];
    if (lineData.length > 0) {
      for (let segMentIndex = 0; segMentIndex < lineData.length; segMentIndex++) {
        const element = lineData[segMentIndex];

        if (element.noofAdt > 0) {
          for (let lineAdultIndex = 1; lineAdultIndex <= element.noofAdt; lineAdultIndex++) {
            let ADTData = {
              paxNo: lineAdultIndex,
              selectedAllGroup: 'Select All',
              paxType: 'ADT' + '-' + lineAdultIndex,
              paxRefence: 0,
            };
            linePersonCount.push(ADTData);
          }
        }
        if (element.noofChd > 0) {
          for (let lineChildIndex = 1; lineChildIndex <= element.noofChd; lineChildIndex++) {
            let CHDData = {
              paxNo: lineChildIndex,
              selectedAllGroup: 'Select All',
              paxType: 'CHD' + '-' + lineChildIndex,
              paxRefence: 0,
            };
            linePersonCount.push(CHDData);
          }
        }
        if (element.noofInf > 0) {
          for (let lineINFIndex = 1; lineINFIndex <= element.noofInf; lineINFIndex++) {
            let INFData = {
              paxNo: lineINFIndex,
              selectedAllGroup: 'Select All',
              paxType: 'INF' + '-' + lineINFIndex,
              paxRefence: 0,
            };
            linePersonCount.push(INFData);
          }
        }
      }
      this.addonsPassengers=linePersonCount;
      //this.addonsPassengers?.splice(mainIndex, 0, linePersonCount);
      //console.log(this.addonsPassengers);

    } else {
      //this.addonsPassengers?.splice(mainIndex, 0, []);
      this.addonsPassengers=[];
    }

  }


  checkDuplicatesName(key_form) {
    for (const index of this.duplicates) {
      let errors =
        (this.searchArrayData?.at(index)?.get(key_form)?.errors as Object) || {};
      delete errors['duplicated'];
      this.searchArrayData?.at(index)?.get(key_form)?.setErrors(errors as ValidationErrors);

    }
    this.duplicates = [];
    let dict = {};
    this.searchArrayData?.value?.forEach((item, index) => {
      if (item.assigned === '') {
        return;
      } else {
        dict[item.assigned] = dict[item.assigned] || [];
        dict[item.assigned].push(index);
      }
    });
    for (let key in dict) {
      if (dict[key].length > 1)
        this.duplicates = this.duplicates.concat(dict[key]);
    }
    for (const index of this.duplicates) {
      this.searchArrayData.at(index)?.get(key_form)?.setErrors({ duplicated: true });
    }
  }
  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }

  trackByFn(index, item) {
    return index;
  }
}
