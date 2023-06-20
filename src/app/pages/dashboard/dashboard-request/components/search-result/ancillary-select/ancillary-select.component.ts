import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ServiceTypeService } from 'app/shared/services/service-type.service';
import { environment } from 'environments/environment';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiResponse } from '../../../model/api-response';

@Component({
  selector: 'app-ancillary-select',
  templateUrl: './ancillary-select.component.html',
  styleUrls: ['./ancillary-select.component.scss'],
})
export class AncillarySelectComponent implements OnInit , OnDestroy{
  serviceTypes: any[];
  ngDestroy$ = new Subject();
  constructor(
    public activeModal: NgbActiveModal,
    private serviceTypeService: ServiceTypeService,
    ) {}

  ngOnInit(): void {
    this.getServiceTypes();

  }
  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
  getServiceTypes() {
    this.serviceTypeService.read(environment.SERVICE_CONFIG + 'get-menu/1/9').pipe(takeUntil(this.ngDestroy$)).subscribe((res:any) => {
      this.serviceTypes = res.data;
    });
  }

  onSubmit() {}

  OnChangeService(serviceTypeId) {
    if (serviceTypeId) {
      this.activeModal.close(serviceTypeId);
      //this.closeModalWindow();
     /*  this.router.navigate([`/dashboard/booking/ancillary`], {
        queryParams: {
          requestId: this.requestId,
          contactId:  this.contactId,
          serviceTypeId: btoa(escape(serviceTypeId)),
        },
      }); */
    }
  }
}
