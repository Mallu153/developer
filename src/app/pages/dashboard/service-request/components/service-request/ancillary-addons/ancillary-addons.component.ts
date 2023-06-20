import { DatePipe, formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashboardRequestService } from 'app/pages/dashboard/dashboard-request/services/dashboard-request.service';
import { AuthService } from 'app/shared/auth/auth.service';
import { MasterDataService } from 'app/shared/services/master-data.service';
import { ServiceTypeService } from 'app/shared/services/service-type.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ToastrService } from 'ngx-toastr';
import { concat, Observable, of, Subject, Subscription } from 'rxjs';
import { filter, distinctUntilChanged, debounceTime, tap, switchMap, catchError, takeUntil } from 'rxjs/operators';
import { ANX_ADDONS } from '../../../constants/anx-api';
import { SelectedPassengersService } from 'app/pages/dashboard/dashboard-booking/share-data-services/selected-passenger.service';

@Component({
  selector: 'app-ancillary-addons',
  templateUrl: './ancillary-addons.component.html',
  styleUrls: ['./ancillary-addons.component.scss']
})
export class AncillaryAddonsComponent implements OnInit, OnDestroy  {
  ngDestroy$ = new Subject();

  addonsForm: FormGroup;
  submitted = false;
  isEdit = false;
  isValidFormSubmitted = null;

  //search addons
  searchAddons$: Observable<any>;
  searchAddonsLoading = false;
  searchAddonsInput$ = new Subject<string>();
  minLengthSearchAddonsTerm = 2;
  @Input() public personCount:any={};
  @Input() public patchAddonsData:any=[];
  //ipaddress
  deviceInfo = null;
  isDesktopDevice: boolean;
  isTablet: boolean;
  isMobile: boolean;
  //today date
  todayDate = new Date();
  todayDate1: string;
  todaydateAndTimeStamp: string;
  marked = false;
  paxCount:any[]=[];
  //pop open shows data responses
  addonsPopData: any[] = [];
  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    public masterDataService: MasterDataService,
    private modalService: NgbModal,
    private datepipe: DatePipe,
    private deviceService: DeviceDetectorService,
    private authService: AuthService,
    private serviceTypeService: ServiceTypeService,
    private SelectedPassengersService: SelectedPassengersService,

    ) {
      this.todayDate1 = this.datepipe.transform(this.todayDate, 'yyyy-MM-dd');
      this.todaydateAndTimeStamp = formatDate(this.todayDate, 'yyyy-MM-ddThh:mm:ss', 'en-US', '+0530');
    }


    epicFunction() {
      this.deviceInfo = this.deviceService.getDeviceInfo();
      this.isMobile = this.deviceService.isMobile();
      this.isTablet = this.deviceService.isTablet();
      this.isDesktopDevice = this.deviceService.isDesktop();
    }
    initializeAddonsForm() {
      this.addonsForm = this.fb.group({
        addonsLine: this.fb.array([this.createNewAddonsFormGroup()]),
      });
    }
    createNewAddonsFormGroup() {
      return this.fb.group({
        id: '',
        addonTitle: '',
        addonSrId: '',
        addonLineId: '',
        addonPassengerId: '',
        addonPassengers: '',
        addonWithBooking: '',
        addonCount: '',
        addonRemarks: '',
        addonRequired: '',
        addonExtraCost: '',
        addonStatus: 0,
        addonSubType: null,
        addonSubTypeId: 0,
        addonType: null,
        addonTypeId: 0,
        addonDescription: null,
      });
    }
    addonsLine(): FormArray {
      return this.addonsForm.get('addonsLine') as FormArray;
    }
    add(i) {
      this.isValidFormSubmitted = true;
      const fg = this.createNewAddonsFormGroup();
      this.addonsLine().push(fg);

    }
    delete(idx: number) {
      //this.addonsLine().removeAt(idx);
      if (this.addonsLine().controls?.length > 1) {
        this.addonsLine().removeAt(idx);
      }
    }
  loadAddons() {
    this.searchAddons$ = concat(
      of([]), // default items
      this.searchAddonsInput$.pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthSearchAddonsTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.cdr.markForCheck(), (this.searchAddonsLoading = true))),
        switchMap((term) => {
          return this.masterDataService.getHotelAddons(term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.searchAddonsLoading = false))
          );
        })
      )
    );
  }

   /**
   * A method to close the add ons on clicking go button
   */
    closeModalWindowForAddOns() {
      if (this.modalService.hasOpenModals()) {
        this.modalService.dismissAll();
      }
    }

    toggleVisibilityBookingEdit(e, index: number) {
      this.marked = e.target.checked;
      if (this.marked) {
        this.addonsLine().at(index).get('addonPassengers').disable();
        this.addonsLine().at(index).get('addonCount').disable();
        //patch value remove
        //this.addonsLine().at(index).get('addonRoomId').patchValue([]);
      } else {
        this.marked = false;
        this.addonsLine().at(index).get('addonPassengers').enable();
        this.addonsLine().at(index).get('addonCount').enable();
      }
    }

    toggleVisibilityBooking(e, index: number) {
      this.marked = e.target.checked;
      if (this.marked) {
        this.addonsLine().at(index).get('addonPassengers').disable();
        this.addonsLine().at(index).get('addonCount').disable();
        //patch value remove
        this.addonsLine().at(index).get('addonCount').patchValue('');
        this.addonsLine().at(index).get('addonPassengers').patchValue([]);
      } else {
        this.marked = false;
        this.addonsLine().at(index).get('addonPassengers').enable();
        this.addonsLine().at(index).get('addonCount').enable();
      }
    }

    paxData(personData:any){
      if (personData.adult > 0) {
        for (let adtindex = 1; adtindex <= personData.adult; adtindex++) {
          let data = {
            selectedAllGroup:'Select All',
            labelName: 'Adult-' + adtindex,
          };
          this.paxCount.push(data);
        }
      }
      if (personData.child > 0) {
        for (let chdindex = 1; chdindex <= personData.child; chdindex++) {
          let data = {
            selectedAllGroup:'Select All',
            labelName: 'Child-' + chdindex,
          };
          this.paxCount.push(data);
        }
      }
      if (personData.infant > 0) {
        for (let infindex = 1; infindex <= personData.infant; infindex++) {
          let data = {
            selectedAllGroup:'Select All',
            labelName: 'INFant-' + infindex,
          };
          this.paxCount.push(data);
        }
      }
    }

    onSubmitAddonsForm() {
      this.submitted = true;
      this.isValidFormSubmitted = false;
      if (this.addonsForm.valid) {
        let addonsLineData: any = [];
        this.addonsLine().value?.forEach((val) => addonsLineData.push(Object.assign({}, val)));
        for (let i in addonsLineData) {
          addonsLineData[i].addonSrId = this.personCount?.srId;
          addonsLineData[i].addonLineId = this.personCount?.srLine;
          addonsLineData[i].addonPassengerId =
            addonsLineData[i].addonPassengerId === '' ? null : addonsLineData[i].addonPassengerId;
          addonsLineData[i].addonPassengers =
            addonsLineData[i].addonPassengers === '' ? null : addonsLineData[i].addonPassengers?.toString();
          addonsLineData[i].addonWithBooking = addonsLineData[i].addonWithBooking === true ? 1 : 0;
          addonsLineData[i].addonCount = addonsLineData[i].addonCount;
          addonsLineData[i].addonRemarks = addonsLineData[i].addonRemarks;
          addonsLineData[i].addonRequired = addonsLineData[i].addonRequired === true ? 1 : 0;
          addonsLineData[i].addonExtraCost = addonsLineData[i].addonExtraCost === true ? 1 : 0;
          addonsLineData[i].addonStatus = addonsLineData[i].addonStatus;
          addonsLineData[i].addonSubType = addonsLineData[i].addonSubType;
          addonsLineData[i].addonSubTypeId = addonsLineData[i].addonSubTypeId;
         /*  addonsLineData[i].addonTitle = addonsLineData[i].addonTitle?.name
            ? addonsLineData[i].addonTitle?.name
            : addonsLineData[i].addonTitle; */
            addonsLineData[i].addonTitle = addonsLineData[i].addonTitle === null
          ? ''
          : addonsLineData[i].addonTitle;
          addonsLineData[i].addonType = addonsLineData[i].addonType;
          addonsLineData[i].addonTypeId = addonsLineData[i].addonTypeId;
          addonsLineData[i].addonDescription = addonsLineData[i].addonDescription;
          addonsLineData[i].addonCreatedBy = this.authService.getUser();
          addonsLineData[i].addonCreatedDate = this.todaydateAndTimeStamp;
          addonsLineData[i].addonCreatedDevice = this.deviceInfo?.userAgent;
          addonsLineData[i].addonCreatedIp = null;
        };
        const saveData = addonsLineData;
        this.serviceTypeService.create(ANX_ADDONS.CREATEUPDATEANXADDONS,saveData).pipe(takeUntil(this.ngDestroy$)).subscribe(
          (data: any) => {
            this.SelectedPassengersService.sendAddonsData(data);
            this.closeModalWindowForAddOns();
            this.toastr.success('The addons request has been sent successfuly !', 'Success');
            this.cdr.markForCheck();
          },
          (error) => {
            this.toastr.error('Oops! Something went wrong  while send the data', 'Error');
            this.cdr.markForCheck();
          }
        );
      } else {
        this.toastr.error('Please fill the required fields ', 'Error');
      }
    }


    getAddonsResponseData(data) {
      if (!data && data?.length === 0) {
        return;
      }
      this.addonsPopData = data;
      if (this.addonsPopData) {

        for (let i = 0; i < this.addonsPopData?.length; i++) {
          if (i > 0) {
            const fg = this.createNewAddonsFormGroup();
            this.addonsLine().push(fg);
          }
          let booking = {
            target: { checked: this.addonsPopData[i].addonWithBooking === 1 ? true : false },
          };
          this.toggleVisibilityBookingEdit(booking, i);
          if (this.addonsPopData[i].addonPassengers) {
            this.addonsPopData[i].addonPassengers =
              this.addonsPopData[i].addonPassengers === null||this.addonsPopData[i].addonPassengers === ''
                ? ''
                : this.addonsPopData[i].addonPassengers.toString().split(',');
            ((this.addonsForm.get('addonsLine') as FormArray).at(i) as FormGroup).patchValue({
              addonPassengers: this.addonsPopData[i].addonPassengers,
            });
          }
          ((this.addonsForm.get('addonsLine') as FormArray).at(i) as FormGroup).patchValue({
            id: this.addonsPopData[i].id,
            addonSrId: this.addonsPopData[i].addonSrId,
            addonLineId: this.addonsPopData[i].addonLineId,
            addonTitle: this.addonsPopData[i]?.addonTitle,
            addonWithBooking: this.addonsPopData[i].addonWithBooking === 1 ? true : false,
            addonCount: this.addonsPopData[i].addonCount,
            addonRemarks: this.addonsPopData[i].addonRemarks,
            addonRequired: this.addonsPopData[i].addonRequired === 1 ? true : false,
            addonExtraCost: this.addonsPopData[i].addonExtraCost === 1 ? true : false,
          });
        }
      }
    }

    onEditSubmitAddonsForm() {
      //this.isEdit = true;
      this.submitted = true;
      this.isValidFormSubmitted = false;
      if (this.addonsForm.valid) {
        let addonsLineData: any = [];
        this.addonsLine().value?.forEach((val) => addonsLineData.push(Object.assign({}, val)));
        for (let i in addonsLineData) {
          addonsLineData[i].id = addonsLineData[i].id;
          addonsLineData[i].addonSrId = this.personCount?.srId;
          addonsLineData[i].addonLineId = this.personCount?.srLine;
          addonsLineData[i].addonPassengerId =
            addonsLineData[i].addonPassengerId === '' ? null : addonsLineData[i].addonPassengerId;
          addonsLineData[i].addonPassengers =
            addonsLineData[i].addonPassengers === '' ? null : addonsLineData[i].addonPassengers?.toString();

          addonsLineData[i].addonWithBooking = addonsLineData[i].addonWithBooking === true ? 1 : 0;
          addonsLineData[i].addonCount = addonsLineData[i].addonCount;

          addonsLineData[i].addonRemarks = addonsLineData[i].addonRemarks;
          addonsLineData[i].addonRequired = addonsLineData[i].addonRequired === true ? 1 : 0;
          addonsLineData[i].addonExtraCost = addonsLineData[i].addonExtraCost === true ? 1 : 0;
          addonsLineData[i].addonStatus = addonsLineData[i].addonStatus;
          addonsLineData[i].addonSubType = addonsLineData[i].addonSubType;
          addonsLineData[i].addonSubTypeId = addonsLineData[i].addonSubTypeId;
          /* addonsLineData[i].addonTitle = addonsLineData[i].addonTitle?.name
            ? addonsLineData[i].addonTitle?.name
            : addonsLineData[i].addonTitle; */
            addonsLineData[i].addonTitle = addonsLineData[i].addonTitle === null
          ? ''
          : addonsLineData[i].addonTitle;
          addonsLineData[i].addonType = addonsLineData[i].addonType;
          addonsLineData[i].addonTypeId = addonsLineData[i].addonTypeId;
          addonsLineData[i].addonDescription = addonsLineData[i].addonDescription;

          addonsLineData[i].addonUpdatedBy = this.authService.getUser();
          addonsLineData[i].addonUpdaatedDate = this.todaydateAndTimeStamp;
          addonsLineData[i].addonUpdaatedDevice = this.deviceInfo?.userAgent;
          addonsLineData[i].addonUpdatedIp = null;
        }
        const editData = addonsLineData;
        this.serviceTypeService.create(ANX_ADDONS.CREATEUPDATEANXADDONS,editData).pipe(takeUntil(this.ngDestroy$)).subscribe(
          (data: any) => {
            this.SelectedPassengersService.sendAddonsData(data);
            this.toastr.success('The addons updated successfuly !', 'Success');
            this.closeModalWindowForAddOns();
            this.cdr.markForCheck();
          },
          (error) => {
            this.toastr.error('Oops! Something went wrong  while send the data please try again', 'Error');
          }
        );
      } else {
        this.toastr.error('Please fill the required fields ', 'Error');
      }
    }

      //edit delete method
  editdelete(editidx: number, lineId: number) {
    const lineIdd: Number = lineId;
    const indexId: Number = editidx;
    if (this.addonsLine().controls?.length > 1) {
      if (lineIdd) {
        if (confirm('Are sure you want to delete this line ?') == true) {
          this.removeLines(editidx, lineId);
          this.cdr.markForCheck();
        }
      } else {
        this.addonsLine().removeAt(editidx);
      }
    }
  }

   //remove tax slab lines
   removeLines(index, lineId) {
    let addonsLineData: any = [];
    let InactiveData: any = [];
    this.addonsLine().value?.forEach((val) => addonsLineData.push(Object.assign({}, val)));
    for (let i in addonsLineData) {
      addonsLineData[i].id = lineId;
      addonsLineData[i].addonIsDeleted = true;
       addonsLineData[i].addonSrId = this.personCount?.srId;
      addonsLineData[i].addonLineId = this.personCount?.srLine;
      addonsLineData[i].addonPassengerId =
        addonsLineData[i].addonPassengerId === '' ? null : addonsLineData[i].addonPassengerId;
      addonsLineData[i].addonPassengers =
        addonsLineData[i].addonPassengers === '' ? null : addonsLineData[i].addonPassengers?.toString();

      addonsLineData[i].addonWithBooking = addonsLineData[i].addonWithBooking === true ? 1 : 0;
      addonsLineData[i].addonCount = addonsLineData[i].addonCount;

      addonsLineData[i].addonRemarks = addonsLineData[i].addonRemarks;
      addonsLineData[i].addonRequired = addonsLineData[i].addonRequired === true ? 1 : 0;
      addonsLineData[i].addonExtraCost = addonsLineData[i].addonExtraCost === true ? 1 : 0;
      addonsLineData[i].addonStatus = addonsLineData[i].addonStatus;
      addonsLineData[i].addonSubType = addonsLineData[i].addonSubType;
      addonsLineData[i].addonSubTypeId = addonsLineData[i].addonSubTypeId;
      /* addonsLineData[i].addonTitle = addonsLineData[i].addonTitle?.name
        ? addonsLineData[i].addonTitle?.name
        : addonsLineData[i].addonTitle; */
        addonsLineData[i].addonTitle = addonsLineData[i].addonTitle === null
        ? ''
        : addonsLineData[i].addonTitle;
      addonsLineData[i].addonType = addonsLineData[i].addonType;
      addonsLineData[i].addonTypeId = addonsLineData[i].addonTypeId;
      addonsLineData[i].addonDescription = addonsLineData[i].addonDescription;

      addonsLineData[i].addonUpdatedBy =  this.authService.getUser();
      addonsLineData[i].addonUpdatedDate = this.todayDate1;
      addonsLineData[i].addonUpdatedDevice = this.deviceInfo?.userAgent;
      addonsLineData[i].addonUpdatedIp = null;
    }
    let tabData = addonsLineData;
    InactiveData.push(tabData[index]);
    this.serviceTypeService.create(ANX_ADDONS.CREATEUPDATEANXADDONS,InactiveData).pipe(takeUntil(this.ngDestroy$)).subscribe(
      (data: any) => {
        this.addonsLine().removeAt(index);
        this.deletePatchData(index);
        this.SelectedPassengersService.sendAddonsData(this.patchAddonsData);
        this.toastr.success('The addon deleted successfuly !', 'Success');
        this.cdr.detectChanges();
      },
      (error) => {
        this.toastr.error('Oops! Something went wrong  while send the data', 'Error');
      }
    );
  }

  deletePatchData(index: number) {
    if (this.patchAddonsData.length > 0) {
      this.patchAddonsData.splice(index, 1);
      //const totalData = this.patchAddonsData?.map((v) => v);
    }
  }
  ngOnInit(): void {
    if(this.personCount){
      this.isEdit = false;
      this.paxData(this.personCount);
    }
    this.initializeAddonsForm();
    this.loadAddons();
    this.epicFunction();
    if(this.patchAddonsData.length>0){
      this.isEdit = true;
      this.getAddonsResponseData(this.patchAddonsData);
    }
  }
  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
