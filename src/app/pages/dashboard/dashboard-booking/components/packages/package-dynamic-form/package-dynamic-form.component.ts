import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SERVICE_TYPE_URL } from '../../../../../../shared/constant-url/service-type';
import { ToastrService } from 'ngx-toastr';
import { ServiceTypeService } from '../../../../../../shared/services/service-type.service';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../../../../shared/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-package-dynamic-form',
  templateUrl: './package-dynamic-form.component.html',
  styleUrls: ['./package-dynamic-form.component.scss'],
})
export class PackageDynamicFormComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject();
  public formInput: any[];
  public formInputPatchData: any;
  public serviceTypeHeader: any;
  public formNameTitle: string;
  public anxServiceRequestForm: FormGroup;
  public isEdit: boolean = false;
  public serviceRequestData: any = {};
  public formOnSubmitEvent: Subject<void> = new Subject<void>(); // for dynamic form event trigger
  public attachmentOnSubmitEvent: Subject<void> = new Subject<void>(); // for attachment form event trigger

  private requestNumber: number;
  public isSubmitRequest: boolean = false; // for check submit request
  public active: number = 1;

  @Output() selectedItem = new EventEmitter<any>();
  @Output() selectedItemRemove = new EventEmitter<any>();
  @Input() flightSegmentIndex:number;
  @Input() viewCarRental:any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private auth: AuthService,
    private serviceTypeService: ServiceTypeService
  ) {

  }

  ngOnInit(): void {
    this.getQueryParams();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getQueryParams() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((param) => {
      if (param && param.requestId) {
        this.requestNumber = Number(param.requestId);
        this.initializeForm(269, this.requestNumber);
        this.getCreateData(269);
      }
      /* if (param.requestId && param.holidaysLineId) {
        const myArrayString = localStorage.getItem(`carRentalData`);
        if(myArrayString){
          this.formInputPatchData = JSON.parse(myArrayString);
        }
        const carRentalData=this.requestNumber+'-'+`carRentalData`;
        const myArrayString =localStorage.getItem(carRentalData);
        if(myArrayString){
          this.viewCarRental = JSON.parse(myArrayString);
        }
      } */
      this.cd.markForCheck();
    });
  }
  // form create process
  private getCreateData(serviceTypeId: number) {
    let serviceTypHeader = this.serviceTypeService.read(SERVICE_TYPE_URL.GET_SERVICE_TYPE_HEADER + serviceTypeId);
    let serviceTypeLines = this.serviceTypeService.read(SERVICE_TYPE_URL.GET_SERVICE_TYPE_FORM_LINES + serviceTypeId);
    forkJoin([serviceTypHeader, serviceTypeLines])
      .pipe(takeUntil(this.destroy$))
      .subscribe((results) => {
        if (results[0]?.data && results[0]?.data.length > 0 && results[1]?.data && results[1].data?.length > 0) {
          this.formInput = results[1]?.data;
          this.serviceTypeHeader = results[0]?.data[0];
          this.formNameTitle = this.serviceTypeHeader?.name;
          this.anxServiceRequestForm.patchValue({
            anxLineType: this.serviceTypeHeader?.name,
            anxLineTypeId: this.serviceTypeHeader?.id,
          });

          this.cd.markForCheck();
        }
      });
  }

  private initializeForm(serviceTypeId: number, requestId: number) {
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

  public next() {
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

  public getFormData(event: any) {
   /*  console.log(event);
    this.formInputPatchData=null;
    return; */

    const flightIndex={
      segmentIndex:this.flightSegmentIndex,
      srNumber:this.requestNumber
    };
    const data ={
      ...flightIndex,
      ...event
    };
    if(this.formInputPatchData){
      this.removeSelectedCars(this.flightSegmentIndex,data);
    }
    this.serviceRequestData = data;
    this.selectedItem.emit(this.serviceRequestData);
    this.formInputPatchData=null;
  }

  onEditAncillaryForm(selectedCar:any){
    const updatedJson = { ...selectedCar };
    if(selectedCar){
    this.formInputPatchData=null;
    delete updatedJson.segmentIndex;
    delete updatedJson.srNumber;
    delete updatedJson.pax;
    delete updatedJson.adt;
    delete updatedJson.child;
    delete updatedJson.inf;
    const formInput = [...this.formInput];
    this.formInput = [];
    this.formInput =formInput;
    this.formInputPatchData=updatedJson;
    this.cd.markForCheck();
    }
  }

  removeSelectedCars(i: number,item:any) {
    const carRentalData=this.requestNumber+'-'+`carRentalData`;
   const segmentKey=`segment-${this.flightSegmentIndex}`;
    if (this.viewCarRental[segmentKey]?.length > 0) {
      const getCarRentalData=localStorage.getItem(carRentalData);
      if(getCarRentalData){
        const ancillaryData=JSON.parse(getCarRentalData);
        this.viewCarRental[segmentKey].splice(i, 1);
        ancillaryData[segmentKey].splice(i, 1);
        localStorage.setItem(carRentalData, JSON.stringify(ancillaryData));
        this.selectedItemRemove.emit(ancillaryData);

      }
    }
  }



}
