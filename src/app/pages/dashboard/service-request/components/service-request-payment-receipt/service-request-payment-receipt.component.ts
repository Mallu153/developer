import { ActivatedRoute } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ServiceTypeService } from 'app/shared/services/service-type.service';
import { SERVICE_PRICING_URL } from 'app/shared/constant-url/service-type';
import { LinesData } from 'app/shared/models/price-receipt';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-service-request-payment-receipt',
  templateUrl: './service-request-payment-receipt.component.html',
  styleUrls: ['./service-request-payment-receipt.component.scss'],
})
export class ServiceRequestPaymentReceiptComponent implements OnInit , OnDestroy{
  priceReceipt: any;
  price: number = 0;
  tax: number = 0;
  totalPrice: number = 0;
  requestId: any;
  SRType: string;
  ngDestroy$ = new Subject();
  constructor(private serviceTypeService: ServiceTypeService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.ngDestroy$)).subscribe((params) => {
      if (params.serviceRequestId && params && params.serviceTypeName) {
        this.requestId = atob(unescape(params.serviceRequestId));
        this.SRType = params.serviceTypeName;
        this.serviceTypeService
          .read(SERVICE_PRICING_URL.GET_RECEIPT_BY_SERVICE_REQUEST + this.requestId)
          .pipe(takeUntil(this.ngDestroy$)).subscribe((res) => {
            if (res.data && res.data.length > 0) {
              this.priceReceipt = res.data[0];

              this.totalPrice = this.priceReceipt.receiptAmount;
              this.priceReceipt?.priceItems?.forEach((element: LinesData) => {
                this.price += element.lineAmount;
                this.tax += element.lineTaxAmount;
              });
            }
          });
      }
    });
  }
  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
