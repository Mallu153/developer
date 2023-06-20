import { DatePipe, formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/shared/auth/auth.service';
import { MasterDataService } from 'app/shared/services/master-data.service';
import { environment } from 'environments/environment';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AMENDMENTS_URL } from '../../amendments.constants';
import { CreateCheckListResponse } from '../../amendments.model';
import { AmendmentsService } from '../../amendments.service';

@Component({
  selector: 'app-generate-check-list',
  templateUrl: './generate-check-list.component.html',
  styleUrls: ['./generate-check-list.component.scss']
})
export class GenerateCheckListComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
@Input() generated_check_list: any[];
@Input() check_list_action_type: any;
deviceInfo = null;
requestId: number;
//today date
todayDate = new Date();
todayDate1: string;
//checkList
flightCheckList: any[] = [];
isCheckListMasterSelected: boolean;
checkedAmendmentsList: any;
generateCheckListButton:boolean=false;
amendment_request_id:number;
cancelFormButton:boolean=false;
modifyButtonDisabled: boolean = true;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toastrService: ToastrService,
    private datepipe: DatePipe,
    private authService: AuthService,
    private deviceService: DeviceDetectorService,
    private amendmentsServices: AmendmentsService
  ) {
     this.todayDate1 = formatDate(this.todayDate, 'yyyy-MM-ddThh:mm:ss', 'en-US', '+0530');
    }


    trackByFn(index, item) {
      return index;
    }


  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param && param.request_Id) {
        this.requestId = param.request_Id;
      }
      if (param && param.from) {
        if(param.from==='flight'){
          this.check_list_action_type = 'flight';
        }else if(param.from==='hotel'){
          this.check_list_action_type = 'hotel';
        }else{
          this.check_list_action_type = null;
        }
      }
      if (param && param.amendment_request_id) {
        this.amendment_request_id=param.amendment_request_id;
        this.modifyButtonDisabled=false;
        this.generateCheckListButton=true;
      }
    });

    if(this.generated_check_list){
      if(this.generated_check_list.length>0){
        for (let index = 0; index < this.generated_check_list.length; index++) {
          const element = this.generated_check_list[index];
          this.flightCheckList.push(element);
        }
      }
    }

    this.epicFunction();
  }
  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
  epicFunction() {
    this.deviceInfo = this.deviceService.getDeviceInfo();
  }

  checkListAllSelected() {
    this.isCheckListMasterSelected = this.flightCheckList?.every( (item: any)=> {
      return item.check_flag == true;
    });
    this.getAmendmentsCheckedTicketList();
  }

  checkListUncheckAll() {
    for (let index = 0; index < this.flightCheckList?.length; index++) {
      const element = this.flightCheckList[index];

      element.check_flag = this.isCheckListMasterSelected;
      this.getAmendmentsCheckedTicketList();
    }
  }

  getAmendmentsCheckedTicketList() {
    this.checkedAmendmentsList = [];
    if (this.flightCheckList?.length > 0) {
      for (let index = 0; index < this.flightCheckList.length; index++) {
        const checkListElement = this.flightCheckList[index];

        if (checkListElement.check_flag) {
         /*  const checkedList = {
            amendment_request_id :  Number(this.amendment_request_id),
            service_request_id : Number(this.requestId),
            request_for: checkListElement.request_for,
            request_for_text: checkListElement.request_for_text,
            from: checkListElement.from,
            to: checkListElement.to,
            passenger_type: checkListElement.passenger_type,
            passenger_number: checkListElement.passenger_number,
            segment_reference_number: checkListElement.segment_reference_number,
            segment_number: checkListElement.segment_number,
            passenger_name: checkListElement.passenger_name,
            check_flag: checkListElement.check_flag,
          }; */
          this.checkedAmendmentsList.push(checkListElement);
        }
      }
    }
    //console.log('checked list', this.checkedAmendmentsList);
  }


  checkListCancel(){
    //this.modifyButtonDisabled=true;
    this.reloadComponent();
  }

  onSubmitGenerateCheckList(actionType:string){
    if (this.checkedAmendmentsList === undefined) {
      return this.toastrService.error('Please select at least one then submit', 'Error');
    }
    if (this.checkedAmendmentsList.length === 0) {
      return this.toastrService.error('Please select at least one then submit', 'Error');
    }
    const check_list_data={
      check_list:this.checkedAmendmentsList,
      amendment_request_id :  Number(this.amendment_request_id),
      service_request_id : Number(this.requestId),
      checkListCreatedBy: this.authService.getLoginttuserId(),
      checkListCreatedDate: this.todayDate1,
      checkListCreatedDevice: this.deviceInfo?.userAgent,
      checkListCreatedIp: null,
    };

    this.amendmentsServices.createCheckList(check_list_data, AMENDMENTS_URL.create_check_list_for_amendments).pipe(takeUntil(this.ngDestroy$)).subscribe(
      (res: any) => {
        const result: CreateCheckListResponse = res;
        if (result.status == true) {
          this.toastrService.success(result.message,"Success");
          this.generateCheckListButton=false;
          this.modifyButtonDisabled=false;
          if(actionType=== 'REDIRECT_TO_PNR'){
            this.refernceNumberToRedirectPnr();
          }
          //this.reloadComponent();
          this.cdr.markForCheck();
        }
      },
      (error) => {
        this.toastrService.error(error, 'Error');
      }
    );

  }

  refernceNumberToRedirectPnr(){
    let productID = this.route.snapshot.queryParams.product_id;
    let channel = this.route.snapshot.queryParams.channel;
    let bookingReferenceNumber=this.route.snapshot.queryParams.booking_reference;
    let bookingID = this.route.snapshot.queryParams.booking_id;
    let supplierReference=this.route.snapshot.queryParams.supplier_reference;
    if(productID&&channel&&bookingID&&bookingReferenceNumber){
      const redirectpnr_url = `${environment.RFQREDIRECTOFFLINE}redirect/booking?product=${productID}&channel=${channel}&booking_id=${Number(atob(unescape(bookingID)))}&supplier_reference=${supplierReference}&booking_reference=${bookingReferenceNumber}&from=amendments`;
      window.open(redirectpnr_url, '_blank');
    }
  }


  reloadComponent() {
    const booking_id = this.route.snapshot.queryParams.booking_id;
    const requestId = this.route.snapshot.queryParams.request_Id;
    const customer_name = this.route.snapshot.queryParams.customer_name;
    const contact_name = this.route.snapshot.queryParams.contact_name;
    const supplier_reference = this.route.snapshot.queryParams.supplier_reference;
    const contactNumber = this.route.snapshot.queryParams.contactNumber;
    const productID = this.route.snapshot.queryParams.product_id;
    const channel = this.route.snapshot.queryParams.channel;
    const bookingReferenceNumber=this.route.snapshot.queryParams.booking_reference;
    const from=this.route.snapshot.queryParams.from;
    //const amendment_request_id=this.route.snapshot.queryParams.amendment_request_id;

    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([`/dashboard/amendments/request/${from}`], {
      queryParams: {
        product_id:productID,
        channel:channel,
        booking_id: booking_id,
        supplier_reference: supplier_reference,
        booking_reference: bookingReferenceNumber,
        request_Id: requestId,
        customer_name: customer_name,
        contact_name: contact_name,
        contactNumber: contactNumber,
        from:from

      },
    });


  }
}
