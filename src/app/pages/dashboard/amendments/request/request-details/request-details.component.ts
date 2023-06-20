import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/shared/auth/auth.service';
import { environment } from 'environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-request-details',
  templateUrl: './request-details.component.html',
  styleUrls: ['./request-details.component.scss']
})
export class RequestDetailsComponent implements OnInit , OnDestroy{
  serviceRequestData:any={};
  ngDestroy$ = new Subject();
  constructor(
     private route: ActivatedRoute,
    private router: Router,
    private authService:AuthService
    ) { }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {

      if (param && param.request_Id&&param.product_id&& param.customer_name&& param.contact_name &&param.contactNumber &&param.channel &&param.supplier_reference) {
        this.serviceRequestData={
        requestId:param.request_Id,
        customerName:param.customer_name,
        contact:param.contact_name,
        contactNumber:param.contactNumber,
        channel:param.channel,
        supplier_reference:param.supplier_reference,
        product_id:param.product_id
       };


      }
    });
  }
  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
  openGetSrMailBox() {
    //this.authService.getLoginttuserId()
    //window.open(environment.TT_MAIL_BOX + this.requestId, '_blank');
    //window.open(environment.TT_MAIL_BOX + this.requestId, '_blank');
    const onlineUrl = `${environment.TT_MAIL_BOX}login/index_direct?id=${this.authService.getLoginttuserId()}&continue=${environment.TT_MAIL_BOX}mailbox/mailbox/get_sr_mailbox_tt/${this.serviceRequestData?.requestId}`;
    window.open(onlineUrl, '_blank');
  }

  openChat(){
    //http://travpx.dev.com/tt-chat/chat/history
    const chatUrl = `${environment.TTCHAT}chat/history?user-id=${this.authService.getLoginttuserId()}&&sr=${ this.serviceRequestData?.requestId}`;
    window.open(chatUrl, '_blank');
  }
}


