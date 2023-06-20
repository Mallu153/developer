import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardRequestService } from 'app/pages/dashboard/dashboard-request/services/dashboard-request.service';
import { AuthService } from 'app/shared/auth/auth.service';
import { MasterDataService } from 'app/shared/services/master-data.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ToastrService } from 'ngx-toastr';

import { SelectedPassengersService } from '../../../../dashboard-booking/share-data-services/selected-passenger.service';
import * as apiUrls from '../../../../dashboard-request/url-constants/url-constants';
import { ApiResponse } from '../../../../dashboard-request/model/api-response';
import { concat, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
@Component({
  selector: 'app-hotel-rfq-addons',
  templateUrl: './hotel-rfq-addons.component.html',
  styleUrls: ['./hotel-rfq-addons.component.scss'],
})
export class HotelRfqAddonsComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  addonsForm: FormGroup;
  submitted = false;
  isEdit = false;
  isValidFormSubmitted = null;
  //master data
  addonsListLov: any;
  //search addons
  searchAddons$: Observable<any>;
  searchAddonsLoading = false;
  searchAddonsInput$ = new Subject<string>();
  minLengthSearchAddonsTerm = 2;
  @Input() public user;
  @Input() public patchAddonsData;
  //public user: any = quotesDummayArrayResponse;
  //public user: any = quotesDummayArrayResponse;
  nights: any[] = [];
  roomsData: any[] = [];
  passengerData: any[] = [];
  roomWithoutCount: any[] = [];
  SrId: number;
  hotelLineId: number;
  passengerAdult: any[] = [];
  passengerChild: any[] = [];
  defaultPassengersData: any = [];
  //ipaddress
  deviceInfo = null;
  isDesktopDevice: boolean;
  isTablet: boolean;
  isMobile: boolean;
  //today date
  todayDate = new Date();
  todayDate1: string;
  //pop open shows data responses
  addonsPopData: any[] = [];
  selectDataSub: Subscription;
  marked = false;
  disable = false;
  constructor(
    private fb: FormBuilder,
    private titleService: Title,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dashboardRequestService: DashboardRequestService,
    public masterDataService: MasterDataService,
    private datepipe: DatePipe,
    private toastrService: ToastrService,
    private deviceService: DeviceDetectorService,
    private authService: AuthService,
    private SelectedPassengersService: SelectedPassengersService
  ) {
    this.todayDate1 = this.datepipe.transform(this.todayDate, 'yyyy-MM-dd');
  }
  getAddonsData() {
    if (this.user) {

      this.roomsData = this.user?.roomsInfo?.map((v) => ({
        id: v.id,
        roomNumber: 'Room-' + v.roomNumber,
        roomNo: v.roomNumber,
        //roomPassengersInfo: v.passengersInfo,
        roomPassengersInfo: this.user?.passengersInfo,
        roomAdultCount: v.roomAdultCount,
        roomChildCount: v.roomChildCount,
      }));

      this.SrId = this.user?.roomsInfo[0]?.roomSrId;
      this.hotelLineId = this.user?.roomsInfo[0]?.roomLineId;
      if(this.user?.lineNoOfNights){
        for (let n = 1; n <= this.user?.lineNoOfNights; n++) {
          const totalData = 'Night-' + n;
          const nightsobject = {
            id: n,
            name: 'Night-' + n,
          };
          this.nights?.push(nightsobject);
        }
      }

    }
  }
  public onSelectNightsAll(i) {
    if (this.user) {
      const selectAll = this.nights?.map((item) => item.id);
      if (selectAll && selectAll?.length > 0) {
        ((this.addonsForm.get('addonsLine') as FormArray).at(i) as FormGroup).patchValue({
          addonNights: selectAll,
        });
      }
    }
  }
  public onClearNightsAll(i) {
    this.addonsLine().at(i).get('addonNights').patchValue([]);
  }

  getDefaultData() {
    let addOnIndex = this.addonsLine()?.length;
    let roomPeoples: any = [];
    let PassengersData: any = [];

    this.user?.roomsInfo.forEach((val) => PassengersData.push(Object.assign({}, val)));
    PassengersData.forEach((element, roomIndex) => {
      let adultData: any = [];
      let childsData: any = [];

      if (element.roomAdultCount > 0) {
        for (let index = 1; index <= element.roomAdultCount; index++) {
          let data = {
            roomNo: element.roomNumber,
            roomId: element.id,
            //passengerId: roomPassenger.id,
            //passengerType: roomPassenger.passengerType,
            labelName: 'Room-' + element.roomNumber + '-ADT-' + index,
            /*passengerLineId: roomPassenger.passengerLineId */
          };
          roomPeoples.push(data);
        }
      }
      if (element.roomChildCount > 0) {
        for (let index = 1; index <= element.roomChildCount; index++) {
          let data = {
            roomNo: element.roomNumber,
            roomId: element.id,
            /*    passengerId: roomPassenger.id,
               passengerType: roomPassenger.passengerType, */
            labelName: 'Room-' + element.roomNumber + '-CHD-' + index,
            /*     passengerLineId: roomPassenger.passengerLineId */
          };
          roomPeoples.push(data);
        }
      }
    });
    // this.roomWithoutCount?.splice(addOnIndex, 0, PassengersData);
    this.defaultPassengersData = roomPeoples;
    this.roomWithoutCount?.splice(addOnIndex, 0, roomPeoples);
  }
  initializeAddonsForm() {
    this.addonsForm = this.fb.group({
      addonsLine: this.fb.array([this.createNewAddonsFormGroup()]),
    });
    this.getDefaultData();
  }
  createNewAddonsFormGroup() {
    return this.fb.group({
      id: '',
      addonTitle: '',
      addonFor: '',
      addonSrId: '',
      addonLineId: '',
      addonRoomId: '',
      addonPassengerId: '',
      addonPassengers: '',
      addonWithBooking: '',
      addonCount: '',
      addonNights: '',
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
    this.getDefaultData();
  }
  delete(idx: number) {
    //this.addonsLine().removeAt(idx);
    if (this.addonsLine().controls?.length > 1) {
      this.addonsLine().removeAt(idx);
      this.roomWithoutCount.splice(idx, 1);
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



  public onSelectRoomAll(i) {
    if (this.user) {
      const selectAll = this.roomsData.map((item) => item.id);
      if (selectAll && selectAll?.length > 0) {
        ((this.addonsForm.get('addonsLine') as FormArray).at(i) as FormGroup).patchValue({
          addonRoomId: selectAll,
        });
        let data: any = [];
        this.roomsData.forEach((element) => {
          let roomNumber = 'Room-' + element.roomNumber;
          let roomData1 = this.roomBasedPassengers(element, roomNumber);
          roomData1?.forEach((element) => {
            data.push(element);
          });
        });
        this.roomWithoutCount?.splice(i, 0, data);
      }
    }
  }
  getClearData(i) {
    let data: any = [];
    this.roomsData.forEach((element) => {
      let roomNumber = 'Room-' + element.roomNumber;
      let roomData = this.roomBasedPassengers(element, roomNumber);
      roomData?.forEach((element) => {
        data.push(element);
      });
    });
    this.roomWithoutCount?.splice(i, 0, data);
  }
  public onClearRoomAll(i) {
    this.getClearData(i);
    this.addonsLine().at(i).get('addonRoomId').patchValue([]);
  }
  roomDependsOnPax(roomId, index) {

    let data: any = [];
    roomId.forEach((element) => {
      let roomData = this.roomBasedPassengers(element, element.roomNumber);
      roomData?.forEach((element) => {
        data.push(element);
      });
    });
    // this.roomWithoutCount?.splice(index, 0, roomId);
    this.roomWithoutCount?.splice(index, 0, data);
    if (this.roomWithoutCount[index]?.length === 0) {
      this.onClearRoomsWithoutPaxAll(index);
      this.roomWithoutCount?.splice(index, 0, this.defaultPassengersData);
    }
  }
  roomBasedPassengers(data: any, roomNumber: any) {

    let roomBasedData = data;
    let roomPeoples: any = [];
    if (roomBasedData.roomAdultCount > 0) {
      for (let index = 1; index <= roomBasedData.roomAdultCount; index++) {
        let data = {
          roomNo: roomBasedData.roomNumber,
          roomId: roomBasedData.id,
          labelName: 'Room-' + roomBasedData.roomNo + '-Adult-' + index,
        };
        roomPeoples.push(data);
      }
    }
    if (roomBasedData.roomChildCount > 0) {
      for (let index = 1; index <= roomBasedData.roomChildCount; index++) {
        let data = {
          roomNo: roomBasedData.roomNumber,
          roomId: roomBasedData.id,
          labelName: 'Room-' + roomBasedData.roomNo + '-Child-' + index,
        };
        roomPeoples.push(data);
      }
    }
    return roomPeoples;
  }

  public onSelectRoomsWithoutPaxAll(i) {
    if (this.roomWithoutCount) {
      //this.passengerData = this.user?.roomsInfo;
      //const selectAll = this.roomWithoutCount[i]?.map((item) => item?.personsCount);
      const selectAll = this.roomWithoutCount[i]?.map((item) => item.labelName);
      if (selectAll && selectAll?.length > 0) {
        ((this.addonsForm.get('addonsLine') as FormArray).at(i) as FormGroup).patchValue({
          //addonPassengerId: this.passengerIDs,
          addonPassengers: selectAll,
        });
      }
    }
  }

  public onClearRoomsWithoutPaxAll(i) {
    this.getClearData(i);
    this.addonsLine().at(i).get('addonPassengers').patchValue([]);
  }

  epicFunction() {
    this.deviceInfo = this.deviceService.getDeviceInfo();
    this.isMobile = this.deviceService.isMobile();
    this.isTablet = this.deviceService.isTablet();
    this.isDesktopDevice = this.deviceService.isDesktop();
  }
  onSubmitAddonsForm() {
    this.submitted = true;
    this.isValidFormSubmitted = false;
    if (this.addonsForm.valid) {
      let addonsLineData: any = [];
      this.addonsLine().value?.forEach((val) => addonsLineData.push(Object.assign({}, val)));
      for (let i in addonsLineData) {
        addonsLineData[i].addonSrId = this.SrId;
        addonsLineData[i].addonLineId = this.hotelLineId;
        addonsLineData[i].addonRoomId =
          addonsLineData[i].addonRoomId === '' ? null : addonsLineData[i].addonRoomId?.toString();
        addonsLineData[i].addonPassengerId =
          addonsLineData[i].addonPassengerId === '' ? null : addonsLineData[i].addonPassengerId;
        addonsLineData[i].addonPassengers =
          addonsLineData[i].addonPassengers === '' ? null : addonsLineData[i].addonPassengers?.toString();
        addonsLineData[i].addonFor = addonsLineData[i].addonRoomId ? 'R' : 'P';
        addonsLineData[i].addonWithBooking = addonsLineData[i].addonWithBooking === true ? 1 : 0;
        addonsLineData[i].addonCount = addonsLineData[i].addonCount;
        addonsLineData[i].addonNights =
          addonsLineData[i].addonNights === '' ? null : addonsLineData[i].addonNights?.toString();
        addonsLineData[i].addonRemarks = addonsLineData[i].addonRemarks;
        addonsLineData[i].addonRequired = addonsLineData[i].addonRequired === true ? 1 : 0;
        addonsLineData[i].addonExtraCost = addonsLineData[i].addonExtraCost === true ? 1 : 0;
        addonsLineData[i].addonStatus = addonsLineData[i].addonStatus;
        addonsLineData[i].addonSubType = addonsLineData[i].addonSubType;
        addonsLineData[i].addonSubTypeId = addonsLineData[i].addonSubTypeId;
        addonsLineData[i].addonTitle = addonsLineData[i].addonTitle?.name
          ? addonsLineData[i].addonTitle?.name
          : addonsLineData[i].addonTitle;
        addonsLineData[i].addonType = addonsLineData[i].addonType;
        addonsLineData[i].addonTypeId = addonsLineData[i].addonTypeId;
        addonsLineData[i].addonDescription = addonsLineData[i].addonDescription;
        addonsLineData[i].addonCreatedBy = this.authService.getUser();
        addonsLineData[i].addonCreatedDate = this.todayDate1;
        addonsLineData[i].addonCreatedDevice = this.deviceInfo?.userAgent;
        addonsLineData[i].addonCreatedIp = null;
      }
      const saveData = addonsLineData;
      this.dashboardRequestService.createAddons(saveData, apiUrls.addons_url.createAddons).pipe(takeUntil(this.ngDestroy$)).subscribe(
        (data: any) => {
          this.SelectedPassengersService.sendAddonsData(data);
          this.toastr.success('The addons request has been sent successfuly !', 'Success');
          this.cdr.detectChanges();
        },
        (error) => {
          this.toastr.error('Oops! Something went wrong  while send the data', 'Error');
        }
      );
    } else {
      this.toastrService.error('Please fill the required fields ', 'Error');
    }
  }
  onEditSubmitAddonsForm() {
    this.isEdit = true;
    this.submitted = true;
    this.isValidFormSubmitted = false;
    if (this.addonsForm.valid) {
      let addonsLineData: any = [];
      this.addonsLine().value?.forEach((val) => addonsLineData.push(Object.assign({}, val)));
      for (let i in addonsLineData) {
        addonsLineData[i].id = addonsLineData[i].id;
        addonsLineData[i].addonSrId = this.SrId;
        addonsLineData[i].addonLineId = this.hotelLineId;
        addonsLineData[i].addonRoomId =
          addonsLineData[i].addonRoomId === '' ? null : addonsLineData[i].addonRoomId?.toString();
        addonsLineData[i].addonPassengerId =
          addonsLineData[i].addonPassengerId === '' ? null : addonsLineData[i].addonPassengerId;
        addonsLineData[i].addonPassengers =
          addonsLineData[i].addonPassengers === '' ? null : addonsLineData[i].addonPassengers?.toString();
        addonsLineData[i].addonFor = addonsLineData[i].addonRoomId ? 'R' : 'P';
        addonsLineData[i].addonWithBooking = addonsLineData[i].addonWithBooking === true ? 1 : 0;
        addonsLineData[i].addonCount = addonsLineData[i].addonCount;
        addonsLineData[i].addonNights =
          addonsLineData[i].addonNights === '' ? null : addonsLineData[i].addonNights?.toString();
        addonsLineData[i].addonRemarks = addonsLineData[i].addonRemarks;
        addonsLineData[i].addonRequired = addonsLineData[i].addonRequired === true ? 1 : 0;
        addonsLineData[i].addonExtraCost = addonsLineData[i].addonExtraCost === true ? 1 : 0;
        addonsLineData[i].addonStatus = addonsLineData[i].addonStatus;
        addonsLineData[i].addonSubType = addonsLineData[i].addonSubType;
        addonsLineData[i].addonSubTypeId = addonsLineData[i].addonSubTypeId;
        addonsLineData[i].addonTitle = addonsLineData[i].addonTitle?.name
          ? addonsLineData[i].addonTitle?.name
          : addonsLineData[i].addonTitle;
        addonsLineData[i].addonType = addonsLineData[i].addonType;
        addonsLineData[i].addonTypeId = addonsLineData[i].addonTypeId;
        addonsLineData[i].addonDescription = addonsLineData[i].addonDescription;

        addonsLineData[i].addonUpdatedBy = this.authService.getUser();
        addonsLineData[i].addonUpdaatedDate = this.todayDate1;
        addonsLineData[i].addonUpdaatedDevice = this.deviceInfo?.userAgent;
        addonsLineData[i].addonUpdatedIp = null;
      }
      const editData = addonsLineData;
      this.dashboardRequestService.updateAddons(editData, apiUrls.addons_url.updateAddons).pipe(takeUntil(this.ngDestroy$)).subscribe(
        (data: any) => {
          this.SelectedPassengersService.sendAddonsData(data);
          this.toastr.success('The addons updated successfuly !', 'Success');
          //update records popup closed

          this.cdr.detectChanges();
        },
        (error) => {
          this.toastr.error('Oops! Something went wrong  while send the data', 'Error');
        }
      );
    } else {
      this.toastrService.error('Please fill the required fields ', 'Error');
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
          this.getDefaultData();
          const fg = this.createNewAddonsFormGroup();
          this.addonsLine().push(fg);
        }
        let booking = {
          target: { checked: this.addonsPopData[i].addonWithBooking === 1 ? true : false },
        };
        this.toggleVisibilityBookingEdit(booking, i);
        const addonsTitle = {
          code: null,
          description: null,
          id: null,
          name: this.addonsPopData[i]?.addonTitle,
          status: null,
        };
        if (this.addonsPopData[i].addonRoomId) {
          this.addonsPopData[i].addonRoomId =
            this.addonsPopData[i]?.addonRoomId === null ? '' : this.addonsPopData[i].addonRoomId.toString().split(',');
          ((this.addonsForm.get('addonsLine') as FormArray).at(i) as FormGroup).patchValue({
            addonRoomId: this.addonsPopData[i].addonRoomId,
          });
        }
        if (this.addonsPopData[i].addonNights) {
          this.addonsPopData[i].addonNights =
            this.addonsPopData[i].addonNights === null ? '' : this.addonsPopData[i].addonNights.toString().split(',');
          ((this.addonsForm.get('addonsLine') as FormArray).at(i) as FormGroup).patchValue({
            addonNights: this.patchAddonsData[i].addonNights,
          });
        }
        if (this.addonsPopData[i].addonPassengers) {
          this.addonsPopData[i].addonPassengers =
            this.addonsPopData[i].addonPassengers === null
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
          addonTitle: addonsTitle,
          addonFor: this.addonsPopData[i].addonFor,
          addonWithBooking: this.addonsPopData[i].addonWithBooking === 1 ? true : false,
          addonCount: this.addonsPopData[i].addonCount,
          addonRemarks: this.addonsPopData[i].addonRemarks,
          addonRequired: this.addonsPopData[i].addonRequired === 1 ? true : false,
          addonExtraCost: this.addonsPopData[i].addonExtraCost === 1 ? true : false,
        });
      }
    }
  }
  // (change)="toggleVisibilityBooking($event, i)"
  toggleVisibilityBooking(e, index: number) {
    this.marked = e.target.checked;
    if (this.marked) {
      this.addonsLine().at(index).get('addonRoomId').disable();
      this.addonsLine().at(index).get('addonNights').disable();
      this.addonsLine().at(index).get('addonPassengers').disable();
      this.addonsLine().at(index).get('addonCount').disable();
      //patch value remove
      this.addonsLine().at(index).get('addonRoomId').patchValue([]);
      this.addonsLine().at(index).get('addonCount').patchValue('');
      this.addonsLine().at(index).get('addonNights').patchValue([]);
      this.addonsLine().at(index).get('addonPassengers').patchValue([]);
    } else {
      this.marked = false;
      this.addonsLine().at(index).get('addonRoomId').enable();
      this.addonsLine().at(index).get('addonNights').enable();
      this.addonsLine().at(index).get('addonPassengers').enable();
      this.addonsLine().at(index).get('addonCount').enable();
    }
  }
  toggleVisibilityBookingEdit(e, index: number) {
    this.marked = e.target.checked;
    if (this.marked) {
      this.addonsLine().at(index).get('addonRoomId').disable();
      this.addonsLine().at(index).get('addonNights').disable();
      this.addonsLine().at(index).get('addonPassengers').disable();
      this.addonsLine().at(index).get('addonCount').disable();
      //patch value remove
      //this.addonsLine().at(index).get('addonRoomId').patchValue([]);
    } else {
      this.marked = false;
      this.addonsLine().at(index).get('addonRoomId').enable();
      this.addonsLine().at(index).get('addonNights').enable();
      this.addonsLine().at(index).get('addonPassengers').enable();
      this.addonsLine().at(index).get('addonCount').enable();
    }
  }

  //remove tax slab lines
  removeLines(index, lineId) {
    let addonsLineData: any = [];
    this.addonsLine().value?.forEach((val) => addonsLineData.push(Object.assign({}, val)));
    for (let i in addonsLineData) {
      addonsLineData[i].id = lineId;
      (addonsLineData[i].addonIsDeleted = true), (addonsLineData[i].addonSrId = this.SrId);
      addonsLineData[i].addonLineId = this.hotelLineId;
      addonsLineData[i].addonRoomId =
        addonsLineData[i].addonRoomId === '' ? null : addonsLineData[i].addonRoomId?.toString();
      addonsLineData[i].addonPassengerId =
        addonsLineData[i].addonPassengerId === '' ? null : addonsLineData[i].addonPassengerId;
      addonsLineData[i].addonPassengers =
        addonsLineData[i].addonPassengers === '' ? null : addonsLineData[i].addonPassengers?.toString();
      addonsLineData[i].addonFor = addonsLineData[i].addonRoomId ? 'R' : 'P';
      addonsLineData[i].addonWithBooking = addonsLineData[i].addonWithBooking === true ? 1 : 0;
      addonsLineData[i].addonCount = addonsLineData[i].addonCount;
      addonsLineData[i].addonNights =
        addonsLineData[i].addonNights === '' ? null : addonsLineData[i].addonNights?.toString();
      addonsLineData[i].addonRemarks = addonsLineData[i].addonRemarks;
      addonsLineData[i].addonRequired = addonsLineData[i].addonRequired === true ? 1 : 0;
      addonsLineData[i].addonExtraCost = addonsLineData[i].addonExtraCost === true ? 1 : 0;
      addonsLineData[i].addonStatus = addonsLineData[i].addonStatus;
      addonsLineData[i].addonSubType = addonsLineData[i].addonSubType;
      addonsLineData[i].addonSubTypeId = addonsLineData[i].addonSubTypeId;
      addonsLineData[i].addonTitle = addonsLineData[i].addonTitle?.name
        ? addonsLineData[i].addonTitle?.name
        : addonsLineData[i].addonTitle;
      addonsLineData[i].addonType = addonsLineData[i].addonType;
      addonsLineData[i].addonTypeId = addonsLineData[i].addonTypeId;
      addonsLineData[i].addonDescription = addonsLineData[i].addonDescription;

      (addonsLineData[i].addonUpdatedBy = this), this.authService.getUser();
      addonsLineData[i].addonUpdaatedDate = this.todayDate1;
      addonsLineData[i].addonUpdaatedDevice = this.deviceInfo?.userAgent;
      addonsLineData[i].addonUpdatedIp = null;
    }
    let tabData = addonsLineData;
    const InactiveData = [tabData[index]];
    this.dashboardRequestService.updateAddons(InactiveData, apiUrls.addons_url.updateAddons).pipe(takeUntil(this.ngDestroy$)).subscribe(
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


  loadAddons() {
    this.searchAddons$ = concat(
      of([]), // default items
      this.searchAddonsInput$.pipe(
        filter((res) => {

          return res !== null && res.length >= this.minLengthSearchAddonsTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.cdr.markForCheck(),this.searchAddonsLoading = true)),
        switchMap((term) => {
          return this.masterDataService.getHotelAddons(term).pipe(
            catchError(() => of(
              []

            )), // empty list on error
            tap(() => (this.searchAddonsLoading = false))
          );
        })
      )
    );
  }
  ngOnInit(): void {
    if (this.user){

      this.getAddonsData();
    }

    this.initializeAddonsForm();
    //this.getAddonsLov();
    this.loadAddons();
    this.epicFunction();
    if (this.patchAddonsData) {
      this.isEdit = true;
      this.getAddonsResponseData(this.patchAddonsData);
      this.cdr.detectChanges();
    }
  }
  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
