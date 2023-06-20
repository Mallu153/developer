import { log } from 'util';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-product-price-flight-form',
  templateUrl: './product-price-flight-form.component.html',
  styleUrls: ['./product-price-flight-form.component.scss'],
})
export class ProductPriceFlightFormComponent implements OnInit {
  @Input() flightForm: FormGroup;
  @Input() flightFormData: any;
  @Input() flightFormIndex: number;
  @Input() supplierData: any;
  @Output() removeFlightForm: EventEmitter<void> = new EventEmitter<void>();
  private fieldChangesSubscription: Subscription;
  isCalculating: boolean = false;
  paxTypesData = [];
  flightFormDataStore: any;
  divStates: boolean;
  constructor() {}

  ngOnInit(): void {
    //console.log("flightForm",this.flightForm);
    // console.log('flightFormData', this.flightFormData);

    const flightFormDataNew = this.flightFormData;

    this.flightFormDataStore = flightFormDataNew;

    const passengers = this.flightFormData.pax;

    const paxTypeCounts = passengers.reduce((acc, passenger) => {
      const paxType = passenger.paxType;
      acc[paxType] = (acc[paxType] || 0) + 1;
      return acc;
    }, {});

    const paxTypesWithCounts = Object.entries(paxTypeCounts).map(([paxType, count]) => ({ paxType, count }));

    // console.log('one',paxTypesWithCounts);

    this.paxTypesData = paxTypesWithCounts;

    this.paxInfo();
    this.segmentInfo();
    this.paxTypePriceInfo();

    this.fieldChangesSubscription = this.paxTypePrice.valueChanges.subscribe(() => {
      if (!this.isCalculating) {
        this.calculateSum();
      }
    });
  }

  calculateSum() {
    if (this.isCalculating) {
      return;
    }

    this.isCalculating = true;

    let basesum = 0;
    let taxsum = 0;
    let inputvatsum = 0;
    let markupsum = 0;
    let discountsum = 0;
    let outputvatsum = 0;
    let totalsum = 0;

    this.paxTypePrice.controls.forEach((field) => {
      let base = field.get('base').value;
      let tax = field.get('tax').value;

      // console.log('base',base);

      if (!isNaN(base) && base !== '') {
        basesum += parseFloat(base);
      } else {
        base = 0;
      }

      // console.log('tax',tax);

      if (!isNaN(tax) && tax !== '') {
        taxsum += parseFloat(tax);
      } else {
        tax = 0;
      }

      field.get('total').setValue(parseFloat(base) + parseFloat(tax));
    });

    totalsum = basesum + taxsum + inputvatsum + markupsum - discountsum + outputvatsum;

    /*  this.myForm.patchValue({
      grandBase: basesum,
      grandTax: taxsum,
      grandInputVat: inputvatsum,
      grandMarkup: markupsum,
      grandDiscount: discountsum,
      grandOutputVat: outputvatsum,
      grandTotal: totalsum,
    }); */

    this.isCalculating = false;
  }

  toggleContent() {
    this.divStates = !this.divStates;
  }

  paxInfo() {
    if (this.flightFormData.pax?.length > 0) {
      for (let index = 0; index < this.flightFormData.pax.length; index++) {
        const element = this.flightFormData.pax[index];
        this.addPassenger();
        this.passengers.at(index).patchValue({
          passengerFirstName: element.firstName,
          passengerLastName: element.lastName,
          passengerMobile: element.mobile,
          passengerEmail: element.email,
          passengerRequestLinePaxId: element.requestLinePaxId,
          passengerPaxId: element.paxId,
          passengerPaxTypeId: element.paxTypeId,
          passengerPaxType: element.paxType,
          passengerPaxTitleId: element.paxTitleId,
          passengerPaxTitle: element.paxTitle,
        });
      }
    }
  }

  get passengers(): FormArray {
    return this.flightForm.get('passengers') as FormArray;
  }

  addPassenger(): void {
    this.passengers.push(this.createPassengerForm());
  }

  removePassenger(index: number): void {
    this.passengers.removeAt(index);
  }

  private createPassengerForm(): FormGroup {
    return new FormGroup({
      passengerFirstName: new FormControl(''),
      passengerLastName: new FormControl(''),
      passengerMobile: new FormControl(''),
      passengerEmail: new FormControl('', [Validators.email]),
      passengerRequestLinePaxId: new FormControl(''),
      passengerPaxId: new FormControl(''),
      passengerPaxTypeId: new FormControl(''),
      passengerPaxType: new FormControl(''),
      passengerPaxTitleId: new FormControl(''),
      passengerPaxTitle: new FormControl(''),
      passengerTicket: new FormControl(''),
    });
  }

  get segments(): FormArray {
    return this.flightForm.get('segments') as FormArray;
  }

  addSegment(): void {
    this.segments.push(this.createSegmentForm());
  }

  removeSegment(index: number): void {
    this.segments.removeAt(index);
  }

  private createSegmentForm(): FormGroup {
    return new FormGroup({
      deptCode: new FormControl(''),
      arrCode: new FormControl(''),
      deptDate: new FormControl(''),
      deptTime: new FormControl(''),
      arrDate: new FormControl(''),
      arrTime: new FormControl(''),
      airlineCodeSegment: new FormControl(''),
      airlineNumberSegment: new FormControl(''),
    });
  }

  segmentInfo() {
    if (this.flightFormData.routes?.length > 0) {
      for (let index = 0; index < this.flightFormData.routes.length; index++) {
        const element = this.flightFormData.routes[index];
        this.addSegment();
        this.segments.at(index).patchValue({
          deptCode: element.fromCode,
          arrCode: element.toCode,
          deptDate: element.deptDate,
          arrDate: element.arrDate,
        });
      }
    }
  }

  get paxTypePrice(): FormArray {
    return this.flightForm.get('paxTypePrice') as FormArray;
  }

  addPaxTypePrice(): void {
    this.paxTypePrice.push(this.createPaxTypePriceForm());
  }

  removePaxTypePrice(index: number): void {
    this.paxTypePrice.removeAt(index);
  }

  private createPaxTypePriceForm(): FormGroup {
    return new FormGroup({
      paxType: new FormControl(''),
      base: new FormControl(''),
      tax: new FormControl(''),
      total: new FormControl(''),
    });
  }

  paxTypePriceInfo() {
    // console.log('this.paxTypesData',this.paxTypesData);
    if (this.paxTypesData?.length > 0) {
      for (let index = 0; index < this.paxTypesData.length; index++) {
        const element = this.paxTypesData[index].paxType;
        // console.log('paxType',element);

        this.addPaxTypePrice();
        this.paxTypePrice.at(index).patchValue({
          paxType: element,
        });
      }
    }
  }

  onChangePriceInputs() {
    const baseInput: number = this.flightForm.value.headerBase;
    const taxInput: number = this.flightForm.value.headerTax;
    const priceForPaxInput: boolean = this.flightForm.value.priceForPax;

    console.log('baseInput', baseInput);
    console.log('taxInput', taxInput);
    console.log('priceForPaxInput', priceForPaxInput);

    this.paxTypePrice.controls.forEach((field) => {
      if (priceForPaxInput) {
        let base = baseInput ? baseInput.toString() : '0';
        let tax = taxInput ? taxInput.toString() : '0';
        field.get('base').setValue(parseFloat(base));
        field.get('tax').setValue(parseFloat(tax));
        field.get('total').setValue(parseFloat(base) + parseFloat(tax));
      } else {
        const passengers = this.flightFormData.pax;
        const passengersCount: number = passengers.length;

        console.log('passengersCount', passengersCount);
        let base = baseInput ? (baseInput / passengersCount).toString() : '0';
        let tax = taxInput ? (taxInput / passengersCount).toString() : '0';

        field.get('base').setValue(base.toString());
        field.get('tax').setValue(tax.toString());
        field.get('total').setValue((parseFloat(base) + parseFloat(tax)).toString());

      }
    });
  }

}
