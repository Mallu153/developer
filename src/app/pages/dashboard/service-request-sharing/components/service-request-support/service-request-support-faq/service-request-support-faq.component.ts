import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { MASTER_URL } from 'app/shared/constant-url/service-type';
import { ServiceTypeService } from 'app/shared/services/service-type.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Faq } from '../../../models/faq';

@Component({
  selector: 'app-service-request-support-faq',
  templateUrl: './service-request-support-faq.component.html',
  styleUrls: ['./service-request-support-faq.component.scss'],
})
export class ServiceRequestSupportFaqComponent implements OnInit , OnDestroy{
  @Input() serviceType: any;
  faqs: Faq[];
  ngDestroy$ = new Subject();
  constructor(private serviceTypeService: ServiceTypeService) {}

  ngOnInit(): void {
    this.serviceTypeService.read(MASTER_URL.GET_FAQ + this.serviceType.id + '/SRTYPE').pipe(takeUntil(this.ngDestroy$)).subscribe((res:any) => {
      this.faqs = res.data;
    });
  }
  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
