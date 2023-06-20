import { ServiceRequestSupportModalComponent } from './service-request-support-modal/service-request-support-modal.component';
import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-service-request-support',
  templateUrl: './service-request-support.component.html',
  styleUrls: ['./service-request-support.component.scss'],
})
export class ServiceRequestSupportComponent implements OnInit {
  @Input() serviceType: any;
  constructor(private modalService: NgbModal) {}

  ngOnInit(): void {
    // console.log(this.serviceType);
  }
  openSupportView(type: string) {
    const modalRef = this.modalService.open(ServiceRequestSupportModalComponent, {
      windowClass: 'modal-w-100' /* centered: true */,
    });
    modalRef.componentInstance.serviceType = this.serviceType;
    modalRef.componentInstance.type = type;
    modalRef.result.then(
      (result) => {
        if (result) {
        }
      },
      (err) => {}
    );
  }
}
