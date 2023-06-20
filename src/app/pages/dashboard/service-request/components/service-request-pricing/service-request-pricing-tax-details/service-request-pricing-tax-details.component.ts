import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ServiceTypePricing } from 'app/shared/models/service-request';

@Component({
  selector: 'app-service-request-pricing-tax-details',
  templateUrl: './service-request-pricing-tax-details.component.html',
  styleUrls: ['./service-request-pricing-tax-details.component.scss'],
})
export class ServiceRequestPricingTaxDetailsComponent implements OnInit {
  @Input() public pricingData: ServiceTypePricing;
  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}
}
