import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ServiceTypeService } from 'app/shared/services/service-type.service';
import { SERVICE_PRICING_URL } from 'app/shared/constant-url/service-type';
import { ApiResponse } from 'app/shared/models/api-response';

@Component({
  selector: 'app-service-request-payment',
  templateUrl: './service-request-payment.component.html',
  styleUrls: ['./service-request-payment.component.scss'],
})
export class ServiceRequestPaymentComponent implements OnInit, OnDestroy {
  dataSub: Subscription;
  receiptData: any;
  constructor(private serviceTypeService: ServiceTypeService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.dataSub = this.serviceTypeService.getRequestDataCommunication().subscribe((data) => {
      console.log('gfhf', data);
      // this.receiptData = data;
    });
  }
  ngOnDestroy(): void {
    if (this.dataSub) {
      this.dataSub.unsubscribe();
    }
  }
  onPayment() {
    this.dataSub = this.serviceTypeService.create(SERVICE_PRICING_URL.CREATE_RECEIPT, this.receiptData).subscribe(
      (res) => {
        const result: ApiResponse = res;
        if (result.status == 200) {
          this.toastr.success(result.message);
          // this.receiptData = result.data;
          // this.router.navigate(['/dashboard']);
        } else {
          this.toastr.error(result.message);
        }
      },
      (err) => {
        this.toastr.error(err.message);
      }
    );
  }
}
