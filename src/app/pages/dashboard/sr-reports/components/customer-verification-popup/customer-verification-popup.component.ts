import { formatDate } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'app/shared/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import {  takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-customer-verification-popup',
  templateUrl: './customer-verification-popup.component.html',
  styleUrls: ['./customer-verification-popup.component.scss']
})
export class CustomerVerificationPopupComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  @Input() selectedContact: any={};
   // today date
   todayDate = new Date();
   todayDate1: string;
  constructor(
    private modalService: NgbModal,
    public modal: NgbActiveModal,
    private router: Router,
    private toastrService: ToastrService,
    private authService: AuthService,

    ) {
      this.todayDate1 = formatDate(this.todayDate, 'yyyy-MM-ddThh:mm:ss', 'en-US', '+0530');
    }

  ngOnInit(): void {



  }
  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }

/*   createServiceRequest() {
    if (this.selectedContact) {
      const srRequestHeaderData = {
        createdBy: this.authService.getUser(),
        createdDate: this.todayDate1,
        customerId: Number(this.selectedContact?.booking_customer_id),
        contactId: Number(this.selectedContact?.booking_contact_id),
        requestStatus: 1,
        priorityId: 1,
        severityId: 1,
      };

      this.dashboardRequestService.createServiceRequestLine(srRequestHeaderData).pipe(takeUntil(this.ngDestroy$)).subscribe(
        (requestResponse: any) => {
          this.redirectToAmendmentsRequestFlight(this.selectedContact?.booking_id,requestResponse.requestId,this.selectedContact.booking_customer_name,this.selectedContact.booking_contact_name,this.selectedContact.supplier_reference,this.selectedContact.booking_contact_mobile,this.selectedContact.product_id,this.selectedContact.booking_channel,this.selectedContact.booking_reference_no);
          this.closeModalWindowForCustomerVerification();
        },
        (error) => {
          this.toastrService.error('Oops! Something went wrong  please try again', 'Error');
        }
      );
    } else {
      return this.toastrService.error('Opps Something went wrong please try again');
    }
  } */
  redirectToAmendmentsRequestFlight(bookingId:any,requestId:number,customer:string,contact:string,supplier_reference:string,contactNumber:string,productId:string,channel:string,booking_reference:string){
    if(bookingId&&requestId&&customer&&contact&&productId&&channel&&supplier_reference&&booking_reference&&customer&&contactNumber){
      const encryptBookingId = btoa(escape(bookingId));
      this.router.navigate(['/dashboard/amendments/request/flight'],{ queryParams: {
        product_id:productId,
        channel:channel,
        booking_id: encryptBookingId,
        supplier_reference:supplier_reference,
        booking_reference:booking_reference,
        request_Id:requestId,
        customer_name: customer,
        contact_name:contact,
        contactNumber:contactNumber
      } });
    }
  }

  closeModalWindowForCustomerVerification() {
    if (this.modalService.hasOpenModals()) {
      this.modalService.dismissAll();

    }
  }
}
