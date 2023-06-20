import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { MASTER_URL } from 'app/shared/constant-url/service-type';
import { ServiceTypeService } from 'app/shared/services/service-type.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SupportPricing } from '../../../models/support-pricing';

@Component({
  selector: 'app-service-request-support-pricing',
  templateUrl: './service-request-support-pricing.component.html',
  styleUrls: ['./service-request-support-pricing.component.scss'],
})
export class ServiceRequestSupportPricingComponent implements OnInit, OnDestroy  {
  @Input() serviceType: any;
  items: any[];
  prices: SupportPricing[];
  ngDestroy$ = new Subject();
  constructor(private serviceTypeService: ServiceTypeService) {}

  ngOnInit(): void {
    this.serviceTypeService.read(MASTER_URL.GET_SUPPORT_PRICING + this.serviceType.id).pipe(takeUntil(this.ngDestroy$)).subscribe((res:any) => {
      const data = res.data;
      data.map((v) => {
        if (v.fieldValue) {
          v.fieldValue = JSON.parse(v.fieldValue);
          v.fieldValue = v.fieldValue?.value;
        }
        return v;
      });
      this.prices = data;
    });
  }
  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
