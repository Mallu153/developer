//import { TokenStorageService } from 'app/shared/auth/token-storage.service';

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SERVICE_TYPE_URL } from 'app/shared/constant-url/service-type';

import { ServiceTypeService } from 'app/shared/services/service-type.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';
import { ServiceRequestPricingTaxDetailsComponent } from './service-request-pricing-tax-details/service-request-pricing-tax-details.component';
import { DatePipe } from '@angular/common';
import { ServiceRequest, ServiceTypePricing } from 'app/shared/models/service-request';
import { FormInput } from 'app/shared/models/form-input';
import { AuthService } from 'app/shared/auth/auth.service';
import { LinesData, ModesData, PriceReceipt } from 'app/shared/models/price-receipt';
@Component({
  selector: 'app-service-request-pricing',
  templateUrl: './service-request-pricing.component.html',
  styleUrls: ['./service-request-pricing.component.scss'],
})
export class ServiceRequestPricingComponent implements OnInit, OnDestroy {
  @Input() serviceTpeHeaderId: string;
  @Input() serviceRequestData: any[];
  @Input() serviceRequest: ServiceRequest;
  @Input() formInput: FormInput[];
  @Input() staticFormInput: any;
  priceData: ServiceTypePricing[] = [];
  totalPriceCharge: number = 0;

  private eventsSubscription: Subscription;
  @Input() events: Observable<void>;
  @Output() submittedPriceData = new EventEmitter<any>();

  user: any;
  constructor(
    private serviceTypeService: ServiceTypeService,
    public modalService: NgbModal,
    private toastr: ToastrService,
    private auth: AuthService,
    private datePipe: DatePipe
  ) // private tokenStorage: TokenStorageService
  {}

  ngOnInit(): void {
    // this.user = this.tokenStorage.getUser();
    this.eventsSubscription = this.events.subscribe(() => this.onSubmit());
    let data = {};
    // for dynamic
    if (this.formInput && this.formInput?.length > 0 && this.serviceRequestData) {
      for (const iterator of this.formInput) {
        if (iterator.isPricing == 1 && this.serviceRequestData[iterator.name]) {
          data[iterator.name] =
            typeof this.serviceRequestData[iterator.name] === 'object'
              ? this.serviceRequestData[iterator.name]?.id
              : this.serviceRequestData[iterator.name];
          // iterator.name
          // data[iterator.name] = this.serviceRequestData[iterator.name]
        }
      }
    }
    // from static form
    if (this.staticFormInput) {
      data = this.staticFormInput;
    }
    const dataToSend = {
      qualifiers: data,
    };
    this.eventsSubscription = this.serviceTypeService
      .getPricingForServiceRequest(
        SERVICE_TYPE_URL.GET_PRICING_BY_SERVICE_TYPE_HEADER_ID + this.serviceTpeHeaderId,
        data
      )
      .subscribe((res) => {
        if (res.data && res.data?.length > 0) {
          this.priceData = res.data;
          for (const iterator of this.priceData) {
            this.totalPriceCharge = this.totalPriceCharge + Number(iterator.totalPrice);
          }
        } else {
          this.toastr.error(res.message);
        }
      });
  }
  ngOnDestroy() {
    if (this.eventsSubscription) {
      this.eventsSubscription.unsubscribe();
    }
  }
  onSubmit(): void {
    if (this.priceData.length === 0) {
      this.toastr.error('No price record found for this request');
      return;
    }
    let linesData: LinesData[] = [];
    this.priceData.forEach((price: ServiceTypePricing) => {
      let line: LinesData = {
        lineAmount: price.itemPrice,
        lineExternalRemarks: '',
        lineInternalRemarks: '',
        lineItemId: price.itemId,
        lineItemName: price.itemName,
        linePriceId: price.priceLineId,
        lineTaxAmount: price.taxPrice,
        lineTaxBreakInfo: JSON.stringify(price.taxBreakup),
      };
      linesData.push(line);
    });
    let modesData: ModesData[] = [];
    let mode: ModesData = {
      modeAmount: this.totalPriceCharge,
      modeBank: 'HDFC',
      modeBankBranch: 'Pragathi Nagar',
      modeBankReferenceNumber: '967867676',
      modeCardCharges: 0,
      modeCardNumber: '',
      modeCardType: '',
      modeChequeDate: '',
      modeChequeEncashDate: '',
      modeChequeNumber: '',
      modeEmployee: '8',
      modeExternalRemarks: '',
      modeName: '',
      modePercentage: 0,
      modeStatusCode: '',
      modeStatusId: 0,
      modeTypeId: 0,
    };
    modesData.push(mode);
    const priceReceipt: PriceReceipt = {
      linesData: linesData,
      modesData: modesData,
      receiptAmount: this.totalPriceCharge,
      receiptBy: this.user.userId,
      receiptContactCountryId: 43,
      receiptContactEmail: this.user.email,
      receiptContactId: 45,
      receiptContactMobile: this.user.phoneNo,
      receiptContactName: this.user.customerName,
      receiptCreatedBy: this.user.userId,
      receiptCreatedDevice: '',
      receiptCreatedIp: '',
      receiptCurrencyCode: '',
      receiptCustomerCompanyId: this.user.customerId,
      receiptCustomerCostCenterId: 78,
      receiptCustomerId: 34,
      receiptCustomerLocationId: 34,
      receiptCustomerTypeId: 54,
      receiptDate: this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
      receiptExternalRemarks: '',
      receiptInternalRemarks: '',
      receiptSrId: this.serviceRequest.id,
      receiptSrLineId: 41,
      receiptStatusCode: '',
      receiptStatusId: 23,
      receiptUserCompanyId: 45,
      receiptUserCostCenterId: 43,
      receiptUserLocationId: 43,
    };
    const data = {
      priceReceipt: priceReceipt,
      priceData: this.priceData,
    };
    this.submittedPriceData.emit(priceReceipt);
  }
  openTaxModal(pricingData) {
    const modalRef = this.modalService.open(ServiceRequestPricingTaxDetailsComponent, { centered: true, size: 'xl' });
    modalRef.componentInstance.pricingData = pricingData;
    modalRef.result.then(
      (result) => {
        if (result) {
          console.log(result);
        }
      },
      (err) => {}
    );
  }
}
