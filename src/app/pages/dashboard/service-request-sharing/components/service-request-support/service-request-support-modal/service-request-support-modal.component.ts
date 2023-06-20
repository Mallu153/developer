import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-service-request-support-modal',
  templateUrl: './service-request-support-modal.component.html',
  styleUrls: ['./service-request-support-modal.component.scss'],
})
export class ServiceRequestSupportModalComponent implements OnInit {
  @Input() serviceType: any;
  @Input() type: string;
  active: any;
  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}
}
