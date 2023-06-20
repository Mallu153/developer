import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ServiceTypeService } from 'app/shared/services/service-type.service';
import { SERVICE_TYPE_URL } from 'app/shared/constant-url/service-type';
import { ServiceDocuments } from 'app/shared/models/service-request';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-service-request-support-documents',
  templateUrl: './service-request-support-documents.component.html',
  styleUrls: ['./service-request-support-documents.component.scss'],
})
export class ServiceRequestSupportDocumentsComponent implements OnInit , OnDestroy {
  @Input() serviceType: any;
  documents: ServiceDocuments[];
  ngDestroy$ = new Subject();
  constructor(private serviceTypeService: ServiceTypeService) {}

  ngOnInit(): void {
    this.serviceTypeService
      .read(SERVICE_TYPE_URL.GET_SERVICE_DOCUMENTS_BY_SERVICE_TYPE_HEADER_ID + this.serviceType.id)
      .pipe(takeUntil(this.ngDestroy$)).subscribe((res:any) => {
        this.documents = res.data;
      });
  }
  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
