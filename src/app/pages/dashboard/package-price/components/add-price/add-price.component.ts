import { DatePipe, formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/shared/auth/auth.service';
import { MasterDataService } from 'app/shared/services/master-data.service';

import { ToastrService } from 'ngx-toastr';
import { concat, Observable, of, Subject } from 'rxjs';
import { filter, distinctUntilChanged, debounceTime, tap, switchMap, catchError, takeUntil } from 'rxjs/operators';
import swal from 'sweetalert2';
import {
  CREATEPACKAGEPRICE,
  ITEMLIST,
  ITINERARAYINFO,
  ITINERARAYLIST,
  MASTERDATA,
} from '../../constants/addPrice-packages-url';
import { AddpricePackageService, PackagesAddPrice } from '../../services/addprice-package.service';

@Component({
  selector: 'app-add-price',
  templateUrl: './add-price.component.html',
  styleUrls: ['./add-price.component.scss', '../../../../../../assets/sass/libs/select.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AddPriceComponent implements OnInit, OnDestroy {
  pageTitle: string = 'Search Itinerary';
  priceTitle: string = 'Add Price to Itinerary';
  ngDestroy$ = new Subject();

  addPriceForm: FormGroup;
  submitted: boolean = false;
  isValidFormSubmitted = null;
  edit: boolean = false;

  //itinerary serach
  itinerary$: Observable<any>;
  itineraryLoading = false;
  itineraryInput$ = new Subject<string>();
  minLengthItineraryTerm = 3;

  itineraryInfo = [];
  itemListInfo = [];

  //today date
  todayDate = new Date();
  todayDate1: string;
  todaydateAndTimeStamp: string;
  //master data lov
  businessUnit = [];
  costCenter = [];
  location = [];
  customerType = [];

  hideItinerarySearch = [];
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private addPriceServices: AddpricePackageService,
    private authServices: AuthService,
    private datepipe: DatePipe,
    private masterServices: MasterDataService
  ) {
    this.todayDate1 = this.datepipe.transform(this.todayDate, 'yyyy-MM-dd');
    this.todaydateAndTimeStamp = formatDate(this.todayDate, 'yyyy-MM-ddThh:mm:ss', 'en-US', '+0530');
  }

  showItinerayInfo(mainIndex: number) {
    this.hideItinerarySearch[mainIndex] = !this.hideItinerarySearch[mainIndex];
  }

  getBusinessList() {
    this.masterServices
      .readSystemMaster(MASTERDATA.getbusinessunitLov)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (res: PackagesAddPrice) => {
          const result = res;
          if (result.status === 200 && result.data?.length > 0) {
            this.businessUnit = result.data;
            this.cdr.markForCheck();
          } else {
            this.businessUnit = [];
            this.toastr.error(result.message, 'Error');
            this.cdr.markForCheck();
          }
        },
        (error) => {
          this.businessUnit = [];
          this.toastr.error(error, 'Error');
          this.cdr.markForCheck();
        }
      );
  }

  onChangeBuisnessUnit(event) {
    if (event) {
      this.masterServices
        .readSystemMaster(MASTERDATA.getcostcenterLov)
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe(
          (res: PackagesAddPrice) => {
            const result: PackagesAddPrice = res;
            if (result.status === 200 && result.data?.length > 0) {
              this.costCenter = result.data.filter((v) => v.BusinessUnitId === Number(event));

              this.cdr.markForCheck();
            } else {
              this.costCenter = [];
              this.toastr.error(result.message, 'Error');
              this.cdr.markForCheck();
            }
          },
          (error) => {
            this.costCenter = [];
            this.toastr.error(error, 'Error');
            this.cdr.markForCheck();
          }
        );
    } else {
      this.costCenter = [];
      this.location = [];
      if (this.addPriceForm.value.businessUnit === '') {
        this.addPriceForm.patchValue({
          costCenter: '',
          location: '',
        });
      }
    }
  }

  onChangeCostCenter(event) {
    if (event) {
      this.masterServices
        .readSystemMaster(MASTERDATA.getLocationLov)
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe(
          (res: PackagesAddPrice) => {
            const result: PackagesAddPrice = res;
            if (result.status === 200 && result.data?.length > 0) {
              this.location = result.data.filter((v) => v.costcenterId === Number(event));
              this.cdr.markForCheck();
            } else {
              this.location = [];
              this.toastr.error(result.message, 'Error');
              this.cdr.markForCheck();
            }
          },
          (error) => {
            this.location = [];
            this.toastr.error(error, 'Error');
            this.cdr.markForCheck();
          }
        );
    } else {
      this.location = [];
      if (this.addPriceForm.value.costCenter === '') {
        this.addPriceForm.patchValue({
          location: '',
        });
      }
    }
  }

  getCustomerType() {
    this.masterServices
      .readJdbcMaster(MASTERDATA.getcustomertype)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (res: PackagesAddPrice) => {
          const result: PackagesAddPrice = res;
          if (result.status === 200 && result.data?.length > 0) {
            this.customerType = result.data;
            this.cdr.markForCheck();
          } else {
            this.customerType = [];
            this.toastr.error(result.message, 'Error');
            this.cdr.markForCheck();
          }
        },
        (error) => {
          this.customerType = [];
          this.toastr.error(error, 'Error');
          this.cdr.markForCheck();
        }
      );
  }
  loadItineraryList() {
    this.itinerary$ = concat(
      of([]), // default items
      this.itineraryInput$.pipe(
        filter((res) => {
          return res !== null && res.length >= this.minLengthItineraryTerm;
        }),
        distinctUntilChanged(),
        debounceTime(800),
        tap(() => (this.cdr.markForCheck(), (this.itineraryLoading = true))),
        switchMap((term) => {
          return this.addPriceServices.getItineraryList(ITINERARAYLIST.get, term).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.itineraryLoading = false))
          );
        })
      )
    );
  }

  getItemList() {
    this.addPriceServices
      .getItemListInfo(ITEMLIST.get)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (res: PackagesAddPrice) => {
          const result = res;
          if (result.status === 200 && result.data.length > 0) {
            this.itemListInfo = result.data;
            this.cdr.markForCheck();
          } else {
            this.itemListInfo = [];
            this.toastr.error(result.message, 'Error');
            this.cdr.markForCheck();
          }
        },
        (error) => {
          this.itemListInfo = [];
          this.toastr.error(error, 'Error');
          this.cdr.markForCheck();
        }
      );
  }
  onChangeItinerary(selectedItineray: any) {
    if (selectedItineray) {
      this.addPriceServices
        .getItineraryInfo(selectedItineray?.id, ITINERARAYINFO.get)
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe(
          (res: PackagesAddPrice) => {
            const result = res;
            if (result.status === 200 && result.data.length > 0) {
              this.itineraryInfo = result.data;
              for (let i = this.priceLines.value.length - 1; i >= 0; i--) {
                this.priceLines.removeAt(i);
              }
              this.showItinerayInfo(0);
              this.patchPriceLinesInfo(result.data);
              this.cdr.markForCheck();
            } else {
              this.itineraryInfo = [];
              this.toastr.error(result.message, 'Error');
              this.cdr.markForCheck();
            }
          },
          (error) => {
            this.itineraryInfo = [];
            this.toastr.error(error, 'Error');
          }
        );
    } else {
      this.itineraryInfo = [];
    }
  }

  patchPriceLinesInfo(linesInfo: any[]) {
    const lines = linesInfo;
    for (let index = 0; index < lines.length; index++) {
      const element = lines[index];
      if (this.edit) {
        this.isValidFormSubmitted = false;
        this.showItinerayInfo(0);
        const ITINERARYOBJECT = {
          itineraryName: element?.itineraryName,
          id: element?.itineraryId,
        };
        this.onChangeBuisnessUnit(element.businessUnit);
        this.onChangeCostCenter(element.costCenter);
        this.addPriceForm.patchValue({
          id: element.id,
          itinerary: ITINERARYOBJECT,
          priceName: element.name,
          description: element.description,
          businessUnit: element.businessUnit === 0 ? '' : element.businessUnit,
          costCenter: element.costCenter === 0 ? '' : element.costCenter,
          location: element.location === 0 ? '' : element.location,
          customerType: element.customerType === 0 ? '' : element.customerType,
          fromDate: this.datepipe.transform(element?.validFrom, 'yyyy-MM-dd'),
          toDate: this.datepipe.transform(element?.validTo, 'yyyy-MM-dd'),
        });
        if (element?.itineraryPriceLines?.length > 0) {
          for (let subindex = 0; subindex < element?.itineraryPriceLines.length; subindex++) {
            const subelement = element?.itineraryPriceLines[subindex];
            this.addPriceLines();
            const dynamicCheckBox = {
              target: {
                checked: subelement.dynamicPrice === 'Yes' ? true : false,
              },
            };
            this.onChangeDynamicInput(dynamicCheckBox, subindex, 'noChange');
            this.priceLines.at(subindex)?.patchValue({
              lineId: subelement.lineId,
              day: subelement.itineraryDay?.match(/\d+/)[0],
              activity: subelement.category,
              lineIndexNumber: subindex,
              line: subindex + 1,
              itineraryInfoNumber: subelement.itineraryLineId,
              dynamic: subelement.dynamicPrice === 'Yes' ? true : false,
              breakup: subelement.breakup === 'Yes' ? true : false,
              standard: subelement.strandedPrice === 'Yes' ? true : false,
              setGroup: subelement.setOption === 'Yes' ? true : false,
              setH: subelement.setPrimary === 'Yes' ? true : '',
              setName: subelement.setName=== null?'':subelement.setName,
              hiddenSetName: subelement.setName,
              item: subelement.itemId === 0 ? '' : subelement.itemId,
              adult: subelement.adtPrice === 0 ? '00.00' : subelement.adtPrice?.toFixed(2),
              //subelement.infPrice === 0 ||
              child:  subelement.chdPrice === null ? '' : subelement.chdPrice?.toFixed(2),
              infant:  subelement.infPrice === null ? '' : subelement.infPrice?.toFixed(2),
            });
          }
        }
        this.itineraryInfo = element?.itineraryPriceLines;
        const GROUPING = this.addPriceForm.value.priceLines.filter((v) => v.setName === v.hiddenSetName && !v.setH);
        if (GROUPING.length > 0) {
          for (let index = 0; index < GROUPING.length; index++) {
            const element = GROUPING[index];
            if (element.setName) {
              this.priceLines.at(element.lineIndexNumber).get('setH').disable();
              this.priceLines.at(element.lineIndexNumber).get('item').disable();
              this.priceLines.at(element.lineIndexNumber).get('adult').disable();
              this.priceLines.at(element.lineIndexNumber).get('breakup').disable();
            }
          }
        }
      } else {
        this.addPriceLines();
        this.priceLines.at(index)?.patchValue({
          lineIndexNumber: index,
          line: index + 1,
          day: element.ItineraryDay?.match(/\d+/)[0],
          activity: element.Category,
          itineraryInfoNumber: element.ITINERARY_ID,
          flightFrom:element.FlightFrom===''||element.FlightFrom===null?"NA":element.FlightFrom,
          flightTo:element.FlightTo===''||element.FlightTo===null?"NA":element.FlightTo,
          flightAirline:element.FlightAirline ===''||element.FlightAirline===null?"NA":element.FlightAirline,
          flightClass:element.FlightClass ===''||element.FlightClass===null?"NA":element.FlightClass,
          startTime:element.DayStartTime===''||element.DayStartTime===null?"NA":element.DayStartTime,
          endTime:element.DayEndTime===''||element.DayEndTime===null?"NA":element.DayEndTime,
          hotelName:element.HotelName===''||element.HotelName===null?"NA":element.HotelName,
          hotelRoomType:element.HotelRoomType===''||element.HotelRoomType===null?"NA":element.HotelRoomType,
          activityName:element.ActivityName===''||element.ActivityName===null?"NA":element.ActivityName,
          activityLocation:element.ItineraryLocation===''||element.ItineraryLocation===null?"NA":element.ItineraryLocation,
        });
      }
    }
  }

  initializeAddPriceForm() {
    this.addPriceForm = this.fb.group({
      id: '',
      priceName: ['', [Validators.required]],
      description: '',
      businessUnit: '',
      costCenter: '',
      location: '',
      customerType: '',
      itinerary: [null, [Validators.required]],
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]],
      priceLines: this.fb.array([], [Validators.required]),
    });
  }

  get f() {
    return this.addPriceForm.controls;
  }

  reset() {
    this.submitted = false;
    this.isValidFormSubmitted = false;
    this.addPriceForm.reset();
    this.hideItinerarySearch[0] = true;
    this.addPriceForm.get('businessUnit').setValue('');
    this.addPriceForm.get('costCenter').setValue('');
    this.addPriceForm.get('location').setValue('');
    this.addPriceForm.get('customerType').setValue('');

    this.itineraryInfo = [];
    this.loadItineraryList();
  }
  createLinesFormGroup() {
    return this.fb.group({
      lineId: '',
      lineIndexNumber: '',
      line: '',
      day: '',
      activity: '',
      breakup: false,
      dynamic: false,
      standard: true,
      setGroup: false,
      setName: '',
      hiddenSetName: '',
      setH: '',
      item: ['', [Validators.required]],
      adult: ['00.00', [Validators.required]],
      child: '',
      infant: '',
      itineraryInfoNumber: '',

      flightFrom:'',
      flightTo:'',
      flightAirline:'',
      flightClass:'',
      startTime:'',
      endTime:'',
      hotelName:'',
      hotelRoomType:'',
      activityName:'',
      activityLocation:'',


    });
  }

  get priceLines(): FormArray {
    return this.addPriceForm.get('priceLines') as FormArray;
  }
  addPriceLines(index?: number) {
    this.isValidFormSubmitted = true;
    const fg = this.createLinesFormGroup();
    this.priceLines.push(fg);
  }

  deletePriceLines(idx: number) {
    swal
      .fire({
        title: 'Are you sure ',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        customClass: {
          confirmButton: 'btn btn-outline-primary',
          cancelButton: 'btn btn-outline-primary  ml-1',
        },
        buttonsStyling: false,
      })
      .then((result) => {
        if (result.value) {
          this.priceLines.removeAt(idx);
          this.cdr.markForCheck();
        }
      });
  }

  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  validatenumber(evt) {
    let theEvent = evt || window.event;
    let key = theEvent.keyCode || theEvent.which;
    key = String.fromCharCode(key);
    let regex = /[0-9\s\b\.]|\./;
    if (!regex.test(key)) {
      theEvent.returnValue = false;
      if (theEvent.preventDefault) theEvent.preventDefault();
    }
  }

  onChangeDynamicInput(e: any, index: number, actionType: string) {
    const DYNAMIC = e.target.checked;
    if (DYNAMIC) {
      /* if(this.edit&&actionType==='change'){
        const setName= this.priceLines.at(index).get('setName').value;
        const setH={
          target:{
            checked:false
          }
        };
        this.onChangeSetH(setH, index, setName,actionType);
      } */
      const setName = this.priceLines.at(index).get('setName').value;
      const setH = this.priceLines.at(index).get('setH').value;


      this.priceLines.at(index).get('hiddenSetName').patchValue(setName);
      const HIDDENSETNAMECONTROL = this.priceLines.at(index).get('hiddenSetName').value;

      const DYNAMIC_GROUPING_ALL_DISABLED = this.addPriceForm.value.priceLines.filter(
        (v) => v.setName === HIDDENSETNAMECONTROL && !v.setH
      );

      if (DYNAMIC_GROUPING_ALL_DISABLED.length > 0&&setH) {


        for (let subindex = 0; subindex < DYNAMIC_GROUPING_ALL_DISABLED.length; subindex++) {
          const subelement = DYNAMIC_GROUPING_ALL_DISABLED[subindex];
          this.priceLines.at(subelement.lineIndexNumber)?.get('setH').setValidators([Validators.required]);
          //this.priceLines.at(subelement.lineIndexNumber)?.get('setH').setValue(false);
          this.priceLines.at(subelement.lineIndexNumber)?.get('setH').enable();
          this.priceLines.at(subelement.lineIndexNumber)?.get('item').enable();
          this.priceLines.at(subelement.lineIndexNumber)?.get('adult').enable();
          this.priceLines.at(subelement.lineIndexNumber)?.get('breakup').enable();
        }
      }

      //this.onChangeSetName(index, null, null);

      this.priceLines.at(index).get('standard').setValue(false);
      this.priceLines.at(index).get('setGroup').setValue('');
      this.priceLines.at(index).get('setName').setValue('');
      this.priceLines.at(index).get('setH').setValue('');
      this.priceLines.at(index).get('item').setValue('');
      this.priceLines.at(index).get('adult').setValue('00.00');
      this.priceLines.at(index).get('breakup').setValue(false);

      this.priceLines.at(index).get('standard').disable();
      this.priceLines.at(index).get('setGroup').disable();
      this.priceLines.at(index).get('setName').disable();
      this.priceLines.at(index).get('setH').disable();
      this.priceLines.at(index).get('item').disable();
      this.priceLines.at(index).get('adult').disable();
      this.priceLines.at(index).get('breakup').disable();
    } else {
      this.priceLines.at(index).get('standard').setValue(true);
      this.priceLines.at(index).get('setH').setValue('');
      this.priceLines.at(index).get('standard').enable();
      this.priceLines.at(index).get('setGroup').enable();
      this.priceLines.at(index).get('setName').enable();
      this.priceLines.at(index).get('setH').enable();
      this.priceLines.at(index).get('item').enable();
      this.priceLines.at(index).get('adult').enable();
      this.priceLines.at(index).get('breakup').enable();


    }
  }

  onChangeSetName(index: number, setName: string, setGrouping: boolean) {
    if (setName) {
      this.priceLines.at(index).get('hiddenSetName').patchValue(setName);
      const HIDDENSETNAMECONTROL = this.priceLines.at(index).get('hiddenSetName').value;

      const GROUPINGTRUE = this.addPriceForm.value.priceLines.filter(
        (v) => v.setName === HIDDENSETNAMECONTROL && v.setH
      );


      this.priceLines.at(index).get('setH').setValidators([Validators.required]);

      //const GROUPINGFALSE = this.addPriceForm.value.priceLines.filter((v) => v.setName === HIDDENSETNAMECONTROL && !v.setH);

      //const GROUPINGEMPTY = this.addPriceForm.value.priceLines.filter((v) => v.setName === HIDDENSETNAMECONTROL && v.setH==='');

      /* if(GROUPINGEMPTY.length>0){
        for (let groupingIndex = 0; groupingIndex < GROUPINGEMPTY.length; groupingIndex++) {
          this.priceLines.at(groupingIndex).get('setH').setValidators([Validators.required]);
        }
      } */
      /* if(GROUPINGFALSE.length>0){
        for (let groupingIndex = 0; groupingIndex < GROUPINGFALSE.length; groupingIndex++) {
          this.priceLines.at(groupingIndex).get('setH').setValidators([Validators.required]);
        }
      }else{
        this.priceLines.at(index).get('setH').setValidators([Validators.required]);
      } */

      if (GROUPINGTRUE?.length > 0) {
        for (let index = 0; index < GROUPINGTRUE.length; index++) {
          const element = GROUPINGTRUE[index];
          this.priceLines.at(element?.lineIndexNumber).get('breakup').setValue(false);
          this.priceLines.at(element?.lineIndexNumber).get('setH').setValue('');
          this.priceLines.at(element?.lineIndexNumber).get('item').setValue('');
          this.priceLines.at(element?.lineIndexNumber).get('adult').setValue('00.00');
        }
      }


      const SETNAME_GROUPING_DISABLED = this.addPriceForm.value.priceLines.filter(
        (v) => v.setName === HIDDENSETNAMECONTROL && !v.setH
      );

      if (SETNAME_GROUPING_DISABLED.length > 0) {
        for (let index = 0; index < SETNAME_GROUPING_DISABLED.length; index++) {
          const element = SETNAME_GROUPING_DISABLED[index];
          //empty
          this.priceLines.at(element.lineIndexNumber).get('setH').setValue('');

          this.priceLines.at(element.lineIndexNumber).get('item').setValue('');
          this.priceLines.at(element.lineIndexNumber).get('adult').setValue('00.00');
          //diabled
          this.priceLines.at(element.lineIndexNumber).get('setH').enable();
          this.priceLines.at(element.lineIndexNumber).get('breakup').enable();
          this.priceLines.at(element.lineIndexNumber).get('item').enable();
          this.priceLines.at(element.lineIndexNumber).get('adult').enable();
        }
      }

    } else {

      this.priceLines.at(index).get('setH').enable();
      this.priceLines.at(index).get('item').enable();
      this.priceLines.at(index).get('breakup').enable();
      this.priceLines.at(index).get('adult').enable();

      this.priceLines.at(index).get('setH').setValue(false);
      this.priceLines.at(index).get('setH').setValidators(null);

      const setGroup = this.priceLines.at(index).get('setGroup').value;
      if (setGroup === true) {


        this.priceLines.at(index).get('setName').setValidators([Validators.required]);

      } else {

        this.priceLines.at(index).get('setName').setValidators(null);

      }

      const HIDDEN_VALE = this.priceLines.at(index).get('hiddenSetName').value;
      const SETNAME_GROUPING_ALL_DISABLED = this.addPriceForm.value.priceLines.filter(
        (v) => v.setName === HIDDEN_VALE && !v.setH
      );


      if (SETNAME_GROUPING_ALL_DISABLED.length > 0) {
        for (let disabledPsIndex = 0; disabledPsIndex < SETNAME_GROUPING_ALL_DISABLED.length; disabledPsIndex++) {
          const element = SETNAME_GROUPING_ALL_DISABLED[disabledPsIndex];
          //this.priceLines.at(element.lineIndexNumber)?.get('setH').setValidators([Validators.required]);
          this.priceLines.at(element.lineIndexNumber)?.get('setH').enable();
          this.priceLines.at(element.lineIndexNumber)?.get('item').enable();
          this.priceLines.at(element.lineIndexNumber)?.get('breakup').enable();
          this.priceLines.at(element.lineIndexNumber)?.get('adult').enable();
        }
      }

      const SETNAME_GROUPING_ALL_TRUE = this.addPriceForm.value.priceLines.filter(
        (v) => v.setName === HIDDEN_VALE && v.setH===true
      );


      if (SETNAME_GROUPING_ALL_TRUE.length > 0) {
        for (let subindex = 0; subindex < SETNAME_GROUPING_ALL_TRUE.length; subindex++) {
          const element = SETNAME_GROUPING_ALL_TRUE[subindex];
          this.priceLines.at(element.lineIndexNumber)?.get('setH').setValue('');
        }
      }
    }

    this.priceLines.at(index).get('setName').updateValueAndValidity();

    this.priceLines.at(index).get('setH').updateValueAndValidity();
  }

  onChangeSetH(e: any, index: number, setName: string, actionType?: string) {
    const PRIMARYKEY = e.target.checked;

    if (PRIMARYKEY) {
      this.priceLines.at(index).get('setH').setValidators([Validators.required]);
      this.priceLines.at(index).get('hiddenSetName').patchValue(setName);

      const HIDDENSETNAMECONTROL = this.priceLines.at(index).get('hiddenSetName').value;

      this.priceLines.at(index).get('hiddenSetName').patchValue(setName);

      const GROUPING = this.addPriceForm.value.priceLines.filter((v) => v.setName === HIDDENSETNAMECONTROL && !v.setH);


      if (GROUPING.length > 0) {
        for (let index = 0; index < GROUPING.length; index++) {
          const element = GROUPING[index];
          //empty
          this.priceLines.at(element.lineIndexNumber).get('setH').setValue('');
          this.priceLines.at(element.lineIndexNumber).get('item').setValue('');
          this.priceLines.at(element.lineIndexNumber).get('breakup').setValue(false);

          this.priceLines.at(element.lineIndexNumber).get('adult').setValue('00.00');
          //diabled
          this.priceLines.at(element.lineIndexNumber).get('setH').disable();
          this.priceLines.at(element.lineIndexNumber).get('item').disable();
          this.priceLines.at(element.lineIndexNumber).get('breakup').disable();

          this.priceLines.at(element.lineIndexNumber).get('adult').disable();
        }
      }

      //form value empty

      this.priceLines.at(index).get('item').setValue('');
      this.priceLines.at(index).get('breakup').setValue(false);
      this.priceLines.at(index).get('adult').setValue('00.00');
    } else {
      if (setName) {
        this.priceLines.at(index).get('setH').setValidators([Validators.required]);
      } else {
        this.priceLines.at(index).get('setH').setValue(false);
        this.priceLines.at(index).get('setH').setValidators(null);
      }
      //form value empty
      this.priceLines.at(index).get('setH').setValue(false);
      this.priceLines.at(index).get('item').setValue('');
      this.priceLines.at(index).get('breakup').setValue(false);
      this.priceLines.at(index).get('adult').setValue('00.00');
      this.priceLines.at(index).get('hiddenSetName').patchValue(setName);

      const HIDDENSETNAMECONTROL = this.priceLines.at(index).get('hiddenSetName').value;
      const GROUPINGENABLED = this.addPriceForm.value.priceLines.filter(
        (v) => v.setName === HIDDENSETNAMECONTROL && !v.setH
      );
      if (GROUPINGENABLED.length > 0 && actionType === 'change') {
        //this.priceLines.at(index)?.get('setH')?.setValidators([Validators.required]);
        //this.priceLines.at(index).get('item').setValidators([Validators.required]);
        this.priceLines.at(index).get('item').enable();
        this.priceLines.at(index).get('breakup').enable();
        this.priceLines.at(index).get('setH').enable();
        this.priceLines.at(index).get('adult').enable();
      } else {
        if (GROUPINGENABLED.length > 0) {
          for (let index = 0; index < GROUPINGENABLED.length; index++) {
            const element = GROUPINGENABLED[index];
            //this.priceLines.at(element.lineIndexNumber)?.get('setH')?.setValidators([Validators.required]);
            //this.priceLines.at(element.lineIndexNumber).get('item').setValidators([Validators.required]);
            this.priceLines.at(element.lineIndexNumber).get('setH').enable();
            this.priceLines.at(element.lineIndexNumber).get('breakup').enable();
            this.priceLines.at(element.lineIndexNumber).get('item').enable();
            this.priceLines.at(element.lineIndexNumber).get('adult').enable();
          }
        }
      }
    }
    this.priceLines.at(index).get('setH').updateValueAndValidity();
  }

  onChangeSetGroup(value: boolean, index: number, setName: string) {
    if (value) {
      this.priceLines.at(index).get('setName').setValidators([Validators.required]);
    } else {
      this.priceLines.at(index).get('setName').setValidators(null);
    }
    this.priceLines.at(index).get('setName').updateValueAndValidity();

    if (!value) {
      this.priceLines.at(index).get('hiddenSetName').patchValue(setName);
      const HIDDENSETNAMECONTROL = this.priceLines.at(index).get('hiddenSetName').value;
      const SET_GROUPING_TRUE = this.addPriceForm.value.priceLines.filter((v) => v.setName === HIDDENSETNAMECONTROL && v.setH);

      if (SET_GROUPING_TRUE.length > 0) {
        for (let subindex = 0; subindex < SET_GROUPING_TRUE.length; subindex++) {
          const subelement = SET_GROUPING_TRUE[subindex];
          this.priceLines.at(subelement.lineIndexNumber)?.get('breakup').setValue(false);
          this.priceLines.at(subelement.lineIndexNumber)?.get('setH').setValue('');
          this.priceLines.at(subelement.lineIndexNumber)?.get('item').setValue('');
          this.priceLines.at(subelement.lineIndexNumber)?.get('adult').setValue('00.00');
        }
      }
      const SET_GROUPING = this.addPriceForm.value.priceLines.filter((v) => v.setName === HIDDENSETNAMECONTROL && !v.setH);

      if (SET_GROUPING.length > 0) {
        for (let index = 0; index < SET_GROUPING.length; index++) {
          const element = SET_GROUPING[index];
          this.priceLines.at(element.lineIndexNumber)?.get('breakup').enable();
          this.priceLines.at(element.lineIndexNumber)?.get('setH').enable();
          this.priceLines.at(element.lineIndexNumber)?.get('item').enable();
          this.priceLines.at(element.lineIndexNumber)?.get('adult').enable();

         /*  this.priceLines.at(element.lineIndexNumber)?.get('breakup').disable();
          this.priceLines.at(element.lineIndexNumber)?.get('setH').disable();
          this.priceLines.at(element.lineIndexNumber)?.get('item').disable();
          this.priceLines.at(element.lineIndexNumber)?.get('adult').disable(); */
        }
      }



      //enable
      this.priceLines.at(index).get('setH').enable();
      this.priceLines.at(index).get('breakup').enable();
      this.priceLines.at(index).get('item').enable();
      this.priceLines.at(index).get('adult').enable();

      //form value empty
      this.priceLines.at(index).get('setName').setValue('');
      this.priceLines.at(index).get('setH').setValue(false);
      this.priceLines.at(index).get('breakup').setValue(false);
      this.priceLines.at(index).get('item').setValue('');
      this.priceLines.at(index).get('adult').setValue('00.00');
      this.priceLines.at(index).get('child').setValue('');
      this.priceLines.at(index).get('infant').setValue('');
    }
  }

  onChangeBreakUps(e: any, index: number) {
    const BREAKCHECKED = e.target.checked;

    if (BREAKCHECKED) {
      this.priceLines.at(index).get('child').setValue('');
      this.priceLines.at(index).get('infant').setValue('');
      this.priceLines.at(index).get('child').setValidators([Validators.required]);
      this.priceLines.at(index).get('infant').setValidators([Validators.required]);
    } else {
      this.priceLines.at(index).get('child').setValue('');
      this.priceLines.at(index).get('infant').setValue('');
      this.priceLines.at(index).get('child').setValidators(null);
      this.priceLines.at(index).get('infant').setValidators(null);
    }
    this.priceLines.at(index).get('child').updateValueAndValidity();
    this.priceLines.at(index).get('infant').updateValueAndValidity();
  }

  onChangeStandard(e: any, index: number) {
    const STANDARDCHECKED = e.target.checked;
    if (STANDARDCHECKED) {
      this.priceLines.at(index).get('dynamic').setValue(false);
    } else {
      const DYNAMIC = {
        target: {
          checked: true,
        },
      };
      this.onChangeDynamicInput(DYNAMIC, index, 'noChange');
      this.priceLines.at(index).get('dynamic').setValue(true);
    }
  }
  checkStartDateAndEndDate(startDate, enddate): boolean {
    if (startDate && enddate) {
      if (startDate != null && enddate != null && enddate < startDate) {
        this.toastr.error('to date should be greater than from date', 'Error', { progressBar: true });
        return false;
      } else {
        return true;
      }
    }
    return false;
  }
  addPriceLinesDataConversion() {
    let convertLines = [];
    for (let index = 0; index < this.priceLines.value.length; index++) {
      const element = this.priceLines.value[index];
      const linesModifiedData = {
        lineId: element.lineId === '' || element.lineId === null || element.lineId === undefined ? 0 : element.lineId,
        adtPrice:
          element.adult === undefined || element.adult === '' || element.adult === null ? 0.0 : Number(element.adult),
        chdPrice:
          element.child === undefined || element.child === '' || element.child === null ? 0.0 : Number(element.child),
        infPrice:
          element.infant === undefined || element.infant === '' || element.infant === null
            ? 0.0
            : Number(element.infant),
        createdBy: this.authServices.getUser(),
        updatedBy: this.authServices.getUser(),
        createdDate: this.todaydateAndTimeStamp,
        dynamicPrice: element.dynamic === true ? 'Yes' : 'No',
        ipAddress: 'string',
        itemId: element.item === undefined || element.item === '' || element.item === null ? 0 : Number(element.item),
        setName: element.setName,
        setOption: element.setGroup === true ? 'Yes' : 'No',
        setPrimary: element.setH === true ? 'Yes' : 'No',
        strandedPrice: element.standard === true ? 'Yes' : 'No',
        breakup: element.breakup === true ? 'Yes' : 'No',
        itineraryLineId:
          element.itineraryInfoNumber === '' ||
          element.itineraryInfoNumber === null ||
          element.itineraryInfoNumber === undefined
            ? 0
            : element.itineraryInfoNumber,
      };
      convertLines.push(linesModifiedData);
    }
    return convertLines;
  }

  groupByValidation<T, K extends keyof any>(arr: T[], key: K): Record<string, T[]> {
    return arr.reduce((result, item: any) => {
      const group = String(item[key]);
      if (result[group]) {
        result[group].push(item);
      } else {
        result[group] = [item];
      }
      return result;
    }, {} as Record<string, T[]>);
  }
  onSubmitAddPriceForm(actionType: string) {
    this.submitted = true;
    this.isValidFormSubmitted = false;

    const SET_GROUPING_EMPTY = this.addPriceForm.value.priceLines.filter((v) => v.setName === v.hiddenSetName && v.setGroup&&v.setH==='');

      if(SET_GROUPING_EMPTY.length>0){
        for (let subindex = 0; subindex < SET_GROUPING_EMPTY.length; subindex++) {
          //const subelement = SET_GROUPING_EMPTY[subindex];
          return this.toastr.error('Please select atleast one primary set', 'Error', { progressBar: true });
        }
      }
    const setNameValidation = this.groupByValidation(this.priceLines.value, 'setName');
    let priceValidationsArray = [];
    if (this.priceLines.value.length > 0) {
      priceValidationsArray = this.priceLines.value.filter((v) => v.adult === '00.00' || v.adult === '0.00' );
      /*  for (let index = 0; index < this.priceLines.value.length; index++) {
        const element = this.priceLines.value[index];
        if (element.adult ==="00.00") {
          const modifiedData = {
            lineId: element.lineId,
            lineIndexNumber:  element.lineId,
            line:  element.lineId,
            day:  element.lineId,
            activity:  element.activity,
            breakup:  element.breakup,
            dynamic:  element.dynamic,
            standard:  element.standard,
            setGroup:  element.setGroup,
            setName:  element.setName,
            hiddenSetName:  element.hiddenSetName,
            setH:  element.setH,
            item:  element.item,
            adult:  element.adult,
            child:  element.child,
            infant:  element.infant,
            itineraryInfoNumber:  element.itineraryInfoNumber,
          };
          priceValidationsArray.push(modifiedData);
        }
      } */
    }

    const adtPriceValidation = this.groupByValidation(priceValidationsArray, 'adult');
    if (this.addPriceForm.invalid) {
      return this.toastr.error('Please fill the required fields', 'Error', { progressBar: true });
    }


    if (setNameValidation) {
      for (const setName in setNameValidation) {
        if (setName !== 'undefined' && setName !== '' && setName !== '0'&& setName !== null) {
          if (setNameValidation[setName].length === 1) {
            return this.toastr.error('Set name allowed more than one ', 'Error', { progressBar: true });
          }
        }
      }
    }

    const addPriceLength = Object.keys(adtPriceValidation).length;

    //const GROUPING = this.addPriceForm.value.priceLines.filter((v) => v.setName === v.hiddenSetName && !v.setH);
    //console.log("GROUPING",GROUPING);

    if (adtPriceValidation) {
      for (const adult in adtPriceValidation) {
        if (adult !== '0') {
          return this.onSubmitConfirmation(adtPriceValidation[adult].length, actionType);
        } else {
          return this.onSubmitConfirmation(0, actionType);
        }
      }
    }
    if (addPriceLength === 0) {
      return this.onSubmitConfirmation(0, actionType);
    }
  }

  onSavePriceForm() {
    if (this.addPriceForm.valid) {
      if (this.addPriceForm.value.fromDate && this.addPriceForm.value.toDate) {
        const data: boolean = this.checkStartDateAndEndDate(
          this.addPriceForm.value.fromDate,
          this.addPriceForm.value.toDate
        );
        if (!data) {
          return;
        }
      }
      const onSave = {
        createdBy: this.authServices.getUser(),
        ipAddress: 'string',
        itineraryId: this.addPriceForm.value.itinerary?.id,
        validFromDate: this.addPriceForm.value.fromDate,
        validToDate: this.addPriceForm.value.toDate,
        name: this.addPriceForm.value.priceName,
        description: this.addPriceForm.value.description,
        businessUnit:
          this.addPriceForm.value.businessUnit === '' ||
          this.addPriceForm.value.businessUnit === null ||
          this.addPriceForm.value.businessUnit === undefined
            ? 0
            : Number(this.addPriceForm.value.businessUnit),
        costCenter:
          this.addPriceForm.value.costCenter === '' ||
          this.addPriceForm.value.costCenter === null ||
          this.addPriceForm.value.costCenter === undefined
            ? 0
            : Number(this.addPriceForm.value.costCenter),
        location:
          this.addPriceForm.value.location === '' ||
          this.addPriceForm.value.location === null ||
          this.addPriceForm.value.location === undefined
            ? 0
            : Number(this.addPriceForm.value.location),
        customerType:
          this.addPriceForm.value.customerType === '' ||
          this.addPriceForm.value.customerType === null ||
          this.addPriceForm.value.customerType === undefined
            ? 0
            : Number(this.addPriceForm.value.customerType),
        itineraryPriceLines: this.addPriceLinesDataConversion(),
      };

      this.addPriceServices
        .createPackagePricing(onSave, CREATEPACKAGEPRICE.post)
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe(
          (res: PackagesAddPrice) => {
            const result = res;
            if (result.status === 200) {
              this.toastr.success(result.message, 'Sucess', { progressBar: true });
              this.reset();
              this.cdr.markForCheck();
            } else {
              this.toastr.error(result.message, 'Error', { progressBar: true });
              this.cdr.markForCheck();
            }
          },
          (error) => {
            this.cdr.markForCheck();
            this.toastr.error(error, 'Error', { progressBar: true });
          }
        );
    }
  }
  getPackagePriceInfo(headerId: number) {
    this.addPriceServices
      .getPackagePriceInfo(headerId, CREATEPACKAGEPRICE.getFindById)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (res: PackagesAddPrice) => {
          const result = res;
          if (result.status === 200 && result.data.length > 0) {
            this.edit = true;

            for (let i = this.priceLines.value.length - 1; i >= 0; i--) {
              this.priceLines.removeAt(i);
            }
            this.patchPriceLinesInfo(result.data);
            this.cdr.markForCheck();
          } else {
            this.toastr.error(result.message, 'Error', { progressBar: true });
            this.cdr.markForCheck();
          }
        },
        (error) => {
          this.cdr.markForCheck();
          this.toastr.error(error, 'Error', { progressBar: true });
        }
      );
  }

  getQueryParams() {
    this.route.params.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param && param.headerId) {
        const headerId = Number(param.headerId);

        this.getPackagePriceInfo(headerId);
      }
      this.cdr.markForCheck();
    });
  }

  onUpdateAddPriceForm() {
   /*  this.submitted = true;
    this.isValidFormSubmitted = false;

    if (this.addPriceForm.invalid) {
      return this.toastr.error('Please fill the required fields', 'Error', { progressBar: true });
    } */
    if (this.addPriceForm.valid) {
      if (this.addPriceForm.value.fromDate && this.addPriceForm.value.toDate) {
        const data: boolean = this.checkStartDateAndEndDate(
          this.addPriceForm.value.fromDate,
          this.addPriceForm.value.toDate
        );
        if (!data) {
          return;
        }
      }
      const onSave = {
        updatedBy: this.authServices.getUser(),
        ipAddress: 'string',
        itineraryId: this.addPriceForm.value.itinerary?.id,
        validFromDate: this.addPriceForm.value.fromDate,
        validToDate: this.addPriceForm.value.toDate,
        name: this.addPriceForm.value.priceName,
        description: this.addPriceForm.value.description,
        businessUnit:
          this.addPriceForm.value.businessUnit === '' ||
          this.addPriceForm.value.businessUnit === null ||
          this.addPriceForm.value.businessUnit === undefined
            ? 0
            : Number(this.addPriceForm.value.businessUnit),
        costCenter:
          this.addPriceForm.value.costCenter === '' ||
          this.addPriceForm.value.costCenter === null ||
          this.addPriceForm.value.costCenter === undefined
            ? 0
            : Number(this.addPriceForm.value.costCenter),
        location:
          this.addPriceForm.value.location === '' ||
          this.addPriceForm.value.location === null ||
          this.addPriceForm.value.location === undefined
            ? 0
            : Number(this.addPriceForm.value.location),
        customerType:
          this.addPriceForm.value.customerType === '' ||
          this.addPriceForm.value.customerType === null ||
          this.addPriceForm.value.customerType === undefined
            ? 0
            : Number(this.addPriceForm.value.customerType),
        itineraryPriceLines: this.addPriceLinesDataConversion(),
      };

      this.addPriceServices
        .updatePackagePricing(this.addPriceForm.value.id, onSave, CREATEPACKAGEPRICE.updatePut)
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe(
          (res: PackagesAddPrice) => {
            const result = res;
            if (result.status === 200) {
              this.toastr.success(result.message, 'Sucess', { progressBar: true });

              this.cdr.markForCheck();
            } else {
              this.toastr.error(result.message, 'Error', { progressBar: true });
              this.cdr.markForCheck();
            }
          },
          (error) => {
            this.cdr.markForCheck();
            this.toastr.error(error, 'Error', { progressBar: true });
          }
        );
    }
  }

  onSubmitConfirmation(adlt: number, actionType: string) {
    if (adlt !== 0) {
      swal
        .fire({
          title: 'Are you sure ',
          text: `Some of ${adlt} adult lines prices are zero if yes form is submitted `,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
          customClass: {
            confirmButton: 'btn btn-outline-primary',
            cancelButton: 'btn btn-outline-primary  ml-1',
          },
          buttonsStyling: false,
        })
        .then((result) => {
          if (result.value) {
            if (this.edit && actionType === 'update') {
              this.onUpdateAddPriceForm();
            } else {
              this.onSavePriceForm();
            }
          }
        });
    } else {
      if (this.edit && actionType === 'update') {
        this.onUpdateAddPriceForm();
      } else {
        this.onSavePriceForm();
      }
    }
  }
  ngOnInit(): void {
    this.showItinerayInfo(0);
    this.initializeAddPriceForm();
    this.loadItineraryList();
    this.getItemList();
    this.getQueryParams();
    this.getBusinessList();
    this.getCustomerType();
  }
  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
