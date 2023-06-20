import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ServiceTypeService } from 'app/shared/services/service-type.service';
import { MASTER_URL, SERVICE_TYPE_URL } from 'app/shared/constant-url/service-type';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-service-request-support-attachments',
  templateUrl: './service-request-support-attachments.component.html',
  styleUrls: ['./service-request-support-attachments.component.scss'],
})
export class ServiceRequestSupportAttachmentsComponent implements OnInit, OnDestroy {
  @Input() serviceType: any;
  attachments: any[];
  ngDestroy$ = new Subject();

  constructor(private serviceTypeService: ServiceTypeService) {}

  ngOnInit(): void {
    this.serviceTypeService
      .read(SERVICE_TYPE_URL.GET_SERVICE_ATTACHMENTS_BY_SERVICE_TYPE_HEADER_ID + this.serviceType.id)
      .pipe(takeUntil(this.ngDestroy$)).subscribe((res:any) => {
        this.attachments = res.data;
      });
  }
  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
