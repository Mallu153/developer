import { DatePipe, formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {  NgbModal, NgbTypeahead, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { DashboardRequestService } from 'app/pages/dashboard/dashboard-request/services/dashboard-request.service';
import { Holiday_Package, SrSummaryData } from 'app/pages/dashboard/dashboard-request/url-constants/url-constants';
import { RfqService } from 'app/pages/dashboard/rfq/rfq-services/rfq.service';
import { AuthService } from 'app/shared/auth/auth.service';
import { AirportSearchResponse } from 'app/shared/models/airport-search-response';
import { MasterDataService } from 'app/shared/services/master-data.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ToastrService } from 'ngx-toastr';
import { Observable, of, OperatorFunction, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError, takeUntil, map } from 'rxjs/operators';

import swal from 'sweetalert2';
import { RfqApiResponse } from '../../../rfq-models/rfq-api-response';
import { SendMessage, WaApiResponse } from '../../../rfq-models/sendMessage';
import { Supplier } from '../../../rfq-models/supplier-api-response';
import { RFQAttractions, sendWaMessage, SUPPLIPER_URL, whatsAppUrl } from '../../../rfq-url-constants/apiurl';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-attractions-rfq-supplier-mapping-form',
  templateUrl: './attractions-rfq-supplier-mapping-form.component.html',
  styleUrls: ['./attractions-rfq-supplier-mapping-form.component.scss']
})
export class AttractionsRfqSupplierMappingFormComponent implements OnInit  , OnDestroy {

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

   requestId:number;
   contactId:number;
   activitiesHeaderNumber:number;
   activitiesRfqNumber:number;

// supplier array
supplierDeatils=[];
isMasterSelected:boolean=false;
checkedSupplierList:any;
contactDetails:any;
messageModuleID=sendWaMessage.moduleId;
messageModuleName=sendWaMessage.moduleName;


requestCreationLoading:boolean=false;
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
    private spinnerService: NgxSpinnerService,

  ) {

    this.todayDate1 = this.datepipe.transform(this.todayDate, 'yyyy-MM-dd');
    this.todaydateAndTimeStamp = formatDate(this.todayDate, 'yyyy-MM-ddThh:mm:ss', 'en-US', '+0530');
    this.epicFunction();
  }


  epicFunction() {
    this.deviceInfo = this.deviceService.getDeviceInfo();

  }

  getSupplierDetailes(){
    this.rfqServices.getAllSupplierData(SUPPLIPER_URL.getAllSupplier).pipe(takeUntil(this.ngDestroy$)).subscribe((supplierData: RfqApiResponse) => {
      const result: RfqApiResponse = supplierData;
      if (result.status === 200) {
        //this.supplierDeatils = result.data;
        let data:any = result.data;
        data?.forEach((element) => {
          element.isSelected = false;
        });
        this.supplierDeatils = result.data;

        this.cdr.markForCheck();
      } else {
        this.toastr.error('Oops! Something went wrong while fetching the supplier data please try again.', 'Error');
      }
    });
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
    onChangeActivites(event: any,mainIndex:number) {
      if (event.target.value === "") {
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


  showActivitiesPaxInfo(mainIndex:number) {
      this.activitiesPaxHide[mainIndex] = !this.activitiesPaxHide[mainIndex];
    }

 locationCopyToNextLines(mainIndex:number){
  const MODIFY_INDEX = mainIndex + 1;
  const location=this.activites.value[mainIndex].attractionLineLocation;
  const PaxCount=this.activites.value[mainIndex].attractionLinePaxCount;
  this.activites.at(MODIFY_INDEX)?.patchValue({
    attractionLineLocation:location,
    attractionLinePaxCount:PaxCount
  });
  const attractionsSendData = {
    city: location.city,
  };
  this.getAttrationsData(attractionsSendData, mainIndex);
  if (this.activites.at(mainIndex).value.activitiesPax.length> 0) {
    for (let index = 0; index < this.activites.at(mainIndex).value.activitiesPax?.length; index++) {
      const element = this.activites.at(mainIndex).value.activitiesPax[index];
      (this.activites.at(MODIFY_INDEX)?.get('activitiesPax') as FormArray)?.push(this.fb.group(element));
    }
  }

 }

 findById(rfqId:number,requestId:number,srLine:number){

  this.rfqServices.findRfqAttractionByid(rfqId,requestId,srLine,RFQAttractions.findById).pipe(takeUntil(this.ngDestroy$)).subscribe((res:any)=>{
    const result:RfqApiResponse=res;
    if(result.statusCode=== true){

    this.formPacthData(result.data[0]);
    }else{
      this.toastr.error(result.message,"Error");
    }

  });
}


formPacthData(formData:any){
  this.isEdit=true;
  const patchData=formData;
  this.activitiesForm.patchValue({
    attractionName:patchData.attractionName,
    attractionRequestId:patchData.attractionRequestId,
    rfqAttractionId:patchData.rfqAttractionId,
    attractionRequestLineId:patchData.attractionRequestLineId,
    rfqAttractionUuid:patchData.rfqAttractionUuid,
    attractionStatus:patchData.attractionStatus,
  });
  if(patchData?.lines?.length > 0){
  for (let index = 0; index < patchData?.lines.length; index++) {
    const linesElement = patchData?.lines[index];

    if(index > 0 ){
      const fg = this.createFormGroup();
      this.activites.push(fg);
    }

    const location={
      name:linesElement.attractionLineLocation
    };
    const attractionName={
      activityName:linesElement.attractionLineName,
      activityID:linesElement.attractionId,
      city:linesElement.attractionLineCity,
      country:linesElement.attractionLineCountry,

    }
    const attractionsSendData = {
      city: linesElement.attractionLineCity,
    };
    this.getAttrationsData(attractionsSendData, index);
    this.activites.at(index)?.patchValue({
      rfqAttractionUuid:linesElement.rfqAttractionUuid,
      attractionRequestId:linesElement.attractionRequestId,
      rfqAttractionId:linesElement.rfqAttractionId,
      attractionLineStatus:linesElement.attractionLineStatus,
      rfqAttractionLineId:linesElement.rfqAttractionLineId,
      attractionLineLocation:location,
      attractionLinePaxCount:linesElement.attractionLinePaxCount,
      attractionId:linesElement.attractionId,
      attractionLineCity:linesElement.attractionLineCity,
      attractionLineCountry:linesElement.attractionLineCountry,
      attractionLineName:attractionName,
      attractionHeaderId:linesElement.attractionHeaderId,
      attractionLineId:linesElement.attractionLineId,
      attractionLineDate:this.datepipe.transform(linesElement.attractionLineDate, 'yyyy-MM-dd'),
    });

    if(linesElement?.passengers?.length>0){
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


}


isAllSelected() {
  this.isMasterSelected = this.supplierDeatils.every((item:any) =>{
      return item.isSelected == true;
    });
  this.getCheckedItemList();
}
getCheckedItemList(){
  this.checkedSupplierList = [];
  this.contactDetails = [];
  for (let i = 0; i < this.supplierDeatils.length; i++) {
    if(this.supplierDeatils[i]?.isSelected){
      const element = this.supplierDeatils[i];
      const  RfqSupplierRelation = {
        requestId: this.requestId,
        rfqId: this.activitiesRfqNumber,
        requestLineId: this.activitiesHeaderNumber,
        status: 1,
        supplierId:  this.supplierDeatils[i]?.customerId,
        supplierContactId:  this.supplierDeatils[i]?.contactId,
        createdBy:this.authService.getUser(),
        createdDate:this.todaydateAndTimeStamp,
        updatedBy:  this.authService.getUser(),
        email:this.supplierDeatils[i].primaryEmail,
        //supplierNo: i+1
        updatedDate:this.todaydateAndTimeStamp
    };
      this.checkedSupplierList.push(RfqSupplierRelation);
      if (element?.primaryConatct && element?.primaryPhoneNumber) {
        const contact = {
          contact_number: Number(element.primaryPhoneNumber),
          contact_name: element.primaryConatct,
          sender_id: this.authService.getUser(),
          message: `Hi ${element.primaryConatct},
We sent RFQ please review and provide your options.

Click below to provide options for RFQ SR # ${Number(this.requestId)}

http://travcbt.dev.com/pages/login`,
          module: this.messageModuleName,
          module_id: this.messageModuleID,
          reference: this.requestId,
          sub_reference: this.activitiesHeaderNumber,
          supplier_id: this.supplierDeatils[i]?.customerId,
        };
        this.contactDetails.push(contact);
      }
    }
  }


}

onSaveAttractionsRfqSupplier(supplier:any[]) {
  this.rfqServices.rfqAttractionsSupplier(supplier, RFQAttractions.rfqAttractionsSupplier).pipe(takeUntil(this.ngDestroy$)).subscribe(
    (data: any) => {
      if (data) {

        console.log('rfq attractions suplier  data saved');
        this.sendRFQ();
      }
    },
    (error) => {
      if (error === '') {
        this.toastr.error(
          'Oops! Something went wrong  while send the attractions rfq  supplier data please try again',
          'Error'
        );
      } else {
        this.toastr.error(error, 'Error');
      }
    }
  );

}



 async sendRFQ() {
  if (this.checkedSupplierList.length > 0) {
    for (let index = 0; index < this.checkedSupplierList.length; index++) {
      //const element = this.checkedSupplierList[index];
      if (this.checkedSupplierList[index].email) {
        const contactElement = this.contactDetails[index];
        try {
          await this.rfqServices.sendRFQEmails(
            this.checkedSupplierList[index].email,
            this.authService.getUserName(),
            this.checkedSupplierList[index].requestId
          );
          await this.rfqServices.sendWaMessages(contactElement, whatsAppUrl.sendWaMessageRFQ);
        } catch (error) {
          console.log(error);
        }finally {
          this.requestCreationLoading = false;
        }
      }
    }
    this.toastr.success(`RFQ sent  successfuly !`, 'Success');
    this.router.navigate(['/dashboard/rfq/attractions-awt-response']);
  }
}






activitiesLinesDataConversion(){
  let convertLines=[];
  for (let index = 0; index < this.activites.value.length; index++) {
    const element = this.activites.value[index];
    const linesData = {
      rfqAttractionUuid:element.rfqAttractionUuid,
      attractionRequestId:element.attractionRequestId,
      rfqAttractionId:element.rfqAttractionId,
      attractionLineStatus:element.attractionLineStatus,
      rfqAttractionLineId:element.rfqAttractionLineId,
      attractionHeaderId:element.attractionHeaderId,
      attractionLineId:element.attractionLineId,
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
     /*  attractionLineCreatedBy: this.authService.getUser(),
      attractionLineCreatedDate:  this.todaydateAndTimeStamp,
      attractionLineCreatedDevice: this.deviceInfo?.userAgent,
      attractionLineCreatedIp: "string", */
      attractionLineUpdatedBy: this.authService.getUser(),
      attractionLineUpdatedDate: this.todaydateAndTimeStamp,
      attractionLineUpdatedDevice: this.deviceInfo?.userAgent,
      attractionLineUpdatedIp: "string",

    };
    convertLines.push(linesData);

  }
  return convertLines;
 }
onUpdateRfq(){
  this.submitted = true;
  this.isValidFormSubmitted = false;
  if(this.activitiesForm.invalid){
    return this.toastr.error("Please fill the required fields","Error");
  }

  if(this.checkedSupplierList === undefined || this.checkedSupplierList.length === 0){
    return this.toastr.error("Please select at least one supplier then submit", "Error");
  }
  if(this.activitiesForm.valid){
    this.showSpinner();
    this.requestCreationLoading=true;
    const onUpdateSave={
      attractionCreatedBy: this.authService.getUser(),
      attractionCreatedDevice: this.deviceInfo?.userAgent,
      attractionCreatedIp: "string",
      attractionUpdatedBy: this.authService.getUser(),
      attractionUpdatedDevice: this.deviceInfo?.userAgent,
      attractionUpdatedIp: "string",
      attractionDescription: "string",
      attractionName: `Attractions-${this.activitiesForm.value.attractionRequestId}`,
      attractionRequestId:this.activitiesForm.value.attractionRequestId,
      attractionStatus: this.activitiesForm.value.attractionStatus,
      rfqAttractionId:this.activitiesForm.value.rfqAttractionId,
      attractionRequestLineId:this.activitiesForm.value.attractionRequestLineId,
      rfqAttractionUuid:this.activitiesForm.value.rfqAttractionUuid,
      lines: this.activitiesLinesDataConversion()
    };

    this.rfqServices.updateRfqAttractions(onUpdateSave, RFQAttractions.updateRfq).pipe(takeUntil(this.ngDestroy$)).subscribe((res:any)=>{
     if(res.rfqAttractionId){
       console.log("attractions updated");
       this.onSaveAttractionsRfqSupplier(this.checkedSupplierList );
     }
    },(error)=>{this.toastr.error(error,"Error");});


  }


}


  initializeForm(){
    this.activitiesForm= this.fb.group({
      attractionName:'',
      rfqAttractionId:'',
      attractionStatus:'',
      attractionRequestId:'',
      attractionRequestLineId:'',
      rfqAttractionUuid:'',
      activites: this.fb.array([this.createFormGroup()], [Validators.required]),//this.createFormGroup()
    });
  }

  createFormGroup() {
    return this.fb.group({
      rfqAttractionUuid:'',
      attractionRequestId:'',
      rfqAttractionId:'',
      attractionLineStatus:'',
      rfqAttractionLineId:'',
      attractionHeaderId:'',
      attractionLineId:'',
      attractionId: '',
      attractionLineCity: '',
      attractionLineCountry: '',
      attractionLineDate: ['', [Validators.required]],
      attractionLineDay: '',
      attractionLineLocation:['', [Validators.required]],
      attractionLineName: [null, [Validators.required]],
      attractionLinePaxCount:'1',
      activitiesPax: this.fb.array([]),

    });
  }

  get activites(): FormArray {
    return this.activitiesForm.get('activites') as FormArray;
  }
  addActivities(mainIndex:number) {
    this.isValidFormSubmitted = true;
    const fg = this.createFormGroup();
    this.activites.push(fg);
    this.locationCopyToNextLines(mainIndex);
  }
  deleteActivities(idx: number) {

    swal.fire({
      title: 'Are you sure ',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: "No, cancel!",
      customClass: {
        confirmButton: 'btn btn-outline-primary',
        cancelButton: 'btn btn-outline-primary  ml-1'
      },
      buttonsStyling: false,
    }).then( (result) =>{

      if (result.value) {
        if (this.activites.controls?.length > 1) {
          this.activites.removeAt(idx);
        }
       this.cdr.markForCheck();
      }

    });

  }
  activitiesPersonListData(i: number): FormArray {
    return this.activites.at(i).get('activitiesPax') as FormArray;
  }
  // remove activities pax list
  deleteActivitiesPax(mainIndex: number, subIndex: number) {

    swal.fire({
      title: 'Are you sure ',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: "No, cancel!",
      customClass: {
        confirmButton: 'btn btn-outline-primary',
        cancelButton: 'btn btn-outline-primary  ml-1'
      },
      buttonsStyling: false,
    }).then( (result) =>{

      if (result.value) {
        if (this.activitiesPersonListData(mainIndex).length > 0) {
          this.activitiesPersonListData(mainIndex).removeAt(subIndex);
          this.showActivitiesPaxInfo(mainIndex);
        }
       this.cdr.markForCheck();
      }

    });


  }
  get f() {
    return this.activitiesForm.controls;
  }

  public showSpinner(): void {
    this.spinnerService.show();
    /* setTimeout(() => {
      this.spinnerService.hide();
    }, 5000); // 5 seconds */
  }
  trackByFn(index, item) {
    return index;
  }
  ngOnInit(): void {
    this.initializeForm();
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param && param.requestId && param.contactId&&param.srLine &&param.activitiesRfq) {
        this.requestId = Number(param.requestId);
        this.contactId = Number(param.contactId);
        this.activitiesHeaderNumber=Number(param.srLine);
        this.activitiesRfqNumber=Number(param.activitiesRfq);
        this.findById( this.activitiesRfqNumber,this.requestId ,this.activitiesHeaderNumber);
      }
    });
  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }

}
