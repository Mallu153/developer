import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DashboardBookingAsyncService } from '../../services/dashboard-booking-async.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/shared/auth/auth.service';
import { formatDate } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

export interface RouteRoom {
  fromCode: string;
  fromCityCode: string;
  fromCountryName: string;
  toCode: string;
  toCityCode: string;
  toCountryName: string;
  airLine: string;
  flightNo: string;
  depDate: string;
  depTime: string;
  arrDate: string;
  arrTime: string;
  cabinClass: string;
  rbd: string;
  bag: string;
  operatingCarrier: string;
  hotelAnxName: string;
  hotelAnxCode: string;
  roomOrServiceName: string;
  roomOrServiceType: string;
  roomOrServiceNo: number;
  roomOrServiceId: number;
  address: string;
  showLabel: string;
}

export interface IQuoteSegements {
  segFrom: string;
  segTo: string;
  airLine: string;
  flightNo: string;
  depDate: string;
  depTime: string;
  arrDate: string;
  arrTime: string;
  cabinClass: string;
  rbd: string;
  bag: string;
  operatingCarrier: string;
  fareRules: string;
  hotelAnxName: string;
  hotelAnxCode: string;
  roomOrServiceName: string;
  roomOrServiceType: string;
  roomOrServiceNo: number;
  city: string;
  address: string;
  supplierCancellationPolicy: string;
  internalCancellationPolicy: string;
}

export interface IQuotePax {
  roomNo: number;
  paxType: string;
  paxTitle: string;
  firstName: string;
  lastName: string;
  lead: number;
  dob: string;
  mailId: string;
  phoneNumber: string;
  passportNo: string;
  passportIssuedDate: string;
  passportExpireDate: string;
}

@Component({
  selector: 'app-product-pricing',
  templateUrl: './product-pricing.component.html',
  styleUrls: ['./product-pricing.component.scss'],
})
export class ProductPricingComponent implements OnInit {
  myForm: FormGroup;
  private fieldChangesSubscription: Subscription;
  isCalculating: boolean = false;
  basesum: number = 0;
  taxsum: number = 0;
  markupsum: number = 0;
  discountsum: number = 0;
  totalsum: number = 0;
  todayDate = new Date();
  todaydateAndTimeStamp: string;

  serviceRequest = 0;
  contactId = 0;

  priceLinesListForSel: any[] = [];

  filteredItems: any[] = [];
  filteredItemsPax: any[] = [];

  showPriceLineBlock = false;

  loadingBooking: boolean = false;
  loadingQuote: boolean = false;

  constructor(
    private fb: FormBuilder,
    private toaster: ToastrService,
    private fd4pl: DashboardBookingAsyncService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.todaydateAndTimeStamp = formatDate(this.todayDate, 'yyyy-MM-ddThh:mm:ss', 'en-US', '+0530');
    this.myForm = this.fb.group({
      grandBase: '',
      grandTax: '',
      grandInputVat: '',
      grandMarkup: '',
      grandDiscount: '',
      grandOutputVat: '',
      grandTotal: '',
      fields: this.fb.array([]), // Initialize an empty form array
    });
  }

  ngOnInit(): void {
    this.getQueryParms();
    this.fieldChangesSubscription = this.myForm.valueChanges.subscribe(() => {
      if (!this.isCalculating) {
        this.calculateSum();
      }
    });
  }

  ngOnDestroy(): void {
    this.fieldChangesSubscription.unsubscribe();
  }

  get fields(): FormArray {
    return this.myForm.get('fields') as FormArray;
  }

  getQueryParms() {
    this.route.queryParams.subscribe((params) => {
      if (params && params.requestId) {
        this.serviceRequest = params.requestId;
        this.contactId = params.contactId;
        this.fetchSRDataForPriceLine(Number(params.requestId));
      }
    });
  }

  addPriceLine(): void {
    const fieldGroup = this.fb.group({
      productDetails: ['', Validators.required],
      referenceOne: ['', Validators.required],
      referenceTwo: ['', Validators.required],
      priceBreakdownFlag: true,
      supplierReference: [''],
      base: [0, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      tax: [0, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      inputVat: [0, [Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      markup:  [0, [Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      discount: [0, [Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      outputVat:  [0, [Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      total: 0,
    });

    this.fields.push(fieldGroup);
  }

  removeField(index: number): void {
    this.fields.removeAt(index);
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

    this.fields.controls.forEach((field) => {
      let base = field.get('base').value;
      let tax = field.get('tax').value;
      let inputvat = field.get('inputVat').value;
      let markup = field.get('markup').value;
      let discount = field.get('discount').value;
      let outputvat = field.get('outputVat').value;
      // const total = field.get('total').value;

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

      if (!isNaN(inputvat) && inputvat !== '') {
        inputvatsum += parseFloat(inputvat);
      } else {
        inputvat = 0;
      }

      // console.log('markup',markup);

      if (!isNaN(markup) && markup !== '') {
        markupsum += parseFloat(markup);
      } else {
        markup = 0;
      }

      // console.log('discount',discount);

      if (!isNaN(discount) && discount !== '') {
        discountsum += parseFloat(discount);
      } else {
        discount = 0;
      }

      if (!isNaN(outputvat) && outputvat !== '') {
        outputvatsum += parseFloat(outputvat);
      } else {
        outputvat = 0;
      }

      // console.log('total',total);

      /* if (!isNaN(total) && total !=='') {
        totalsum += parseFloat(total);
      } */

      field
        .get('total')
        .setValue(
          parseFloat(base) +
            parseFloat(tax) +
            parseFloat(inputvat) +
            parseFloat(markup) -
            parseFloat(discount) +
            parseFloat(outputvat)
        );
    });

    totalsum = basesum + taxsum + inputvatsum + markupsum - discountsum + outputvatsum;

    this.myForm.patchValue({
      grandBase: basesum,
      grandTax: taxsum,
      grandInputVat: inputvatsum,
      grandMarkup: markupsum,
      grandDiscount: discountsum,
      grandOutputVat: outputvatsum,
      grandTotal: totalsum,
    });

    this.isCalculating = false;
  }

  fetchSRDataForPriceLine = async (serviceRequestNum: number) => {
    try {
      const srDataPriceLines = await this.fd4pl.getServiceRequestDataForPriceLine(
        `/sr-request-data-for-price-lines?requestId=${serviceRequestNum}`
      );

      if (srDataPriceLines.data.length > 0) {
        this.showPriceLineBlock = true;

        let indexNew = 0;

        srDataPriceLines.data.forEach((element, index) => {
          if (element.productId === 1) {
            // console.log('element.productId',element.productId);

            const paxArray = element.pax;

            const distinctPaxTypes = [];
            const paxTypeSet = new Set();

            paxArray.forEach((pax) => {
              if (!paxTypeSet.has(pax.paxType)) {
                paxTypeSet.add(pax.paxType);
                distinctPaxTypes.push(pax.paxType);
              }
            });

            //  console.log(distinctPaxTypes);

            distinctPaxTypes.forEach((paxType) => {
              //console.log(paxType);
              this.addPriceLine();
              this.fields.at(indexNew)?.get('productDetails')?.patchValue(element);
              element.showLabel = element.product + ' - ' + element.requestLineId;
              this.onChangeProduct(element, indexNew, paxType);
              indexNew++;
            });
          } else {
            this.addPriceLine();
            this.fields.at(indexNew)?.get('productDetails')?.patchValue(element);
            element.showLabel = element.product + ' - ' + element.requestLineId;

            this.onChangeProduct(element, indexNew);
            indexNew++;
          }
        });

        // console.log('srDataPriceLines',srDataPriceLines.data);

        this.priceLinesListForSel = srDataPriceLines.data;
      }
    } catch (err) {
      console.log('Please check the error ', err);
    }
  };

  onChangeProduct(productData: any, index: number, paxType?: string | null) {
    // console.log('productData',productData);

    // Logic to filter items based on selectedValue1
    if (productData.productId === 1) {
      if (productData.routes.length > 0) {
        productData.routes.forEach((element) => {
          element.showLabel = element.fromCode + ' - ' + element.toCode;
        });
        this.filteredItems[index] = productData.routes;
      }

      if (productData.pax.length > 0) {
        if (paxType !== undefined && paxType !== '' && paxType !== null) {
          // console.log('paxType',paxType);

          const indexPax = productData.pax.findIndex((pax) => pax.paxType === paxType);
          // console.log(indexPax);

          this.filteredItemsPax[index] = [];
          productData.pax[indexPax].showLabel = paxType;
          this.filteredItemsPax[index][0] = productData.pax[indexPax];
        } else {
          let valuesToSkip = [];

          productData.pax.forEach((element, index) => {
            if (valuesToSkip.includes(element.paxType)) {
              productData.pax.splice(index, 1);
              return; // Skip this iteration and move to the next one
            }
            valuesToSkip.push(element.paxType);
            element.showLabel = element.paxType;
          });
          this.filteredItemsPax[index] = productData.pax;
        }
      }
    } else if (productData.productId === 2) {
      if (productData.rooms.length > 0) {
        let paxdata = [];

        productData.rooms.forEach((element) => {
          element.showLabel = 'Room ' + element.roomNumber;

          // console.log('paxData',element.pax);

          element.pax.forEach((elementPax) => {
            elementPax.showLabel = elementPax.firstName;
            elementPax.roomNo = element.roomNumber;

            paxdata.push(elementPax);
          });
        });
        this.filteredItems[index] = productData.rooms;

        this.filteredItemsPax[index] = paxdata;
      }
    } else if (productData.productId === 3) {
      this.filteredItems[index] = ['NA'];

      if (productData.pax.length > 0) {
        let valuesToSkip = [];

        productData.pax.forEach((element, index) => {
          if (valuesToSkip.includes(element.paxType)) {
            productData.pax.splice(index, 1);
            return; // Skip this iteration and move to the next one
          }
          valuesToSkip.push(element.paxType);
          element.showLabel = element.paxType;
        });
        this.filteredItemsPax[index] = productData.pax;
      }
    } else if (productData.productId === 4) {
      this.filteredItems[index] = ['NA'];

      if (productData.pax.length > 0) {
        productData.pax.forEach((element, index) => {
          element.showLabel = element.firstName;
        });
        this.filteredItemsPax[index] = productData.pax;
      }
    } else {
      this.filteredItems[index] = [];
      this.filteredItemsPax[index] = [];
    }

    //console.log('this.filteredItems',this.filteredItems[index]);
    this.fields.at(index)?.get('referenceOne')?.patchValue(this.filteredItems[index]);
    this.fields.at(index)?.get('referenceTwo')?.patchValue(this.filteredItemsPax[index]);
  }

  getFilteredItem(index: number): string[] {
    if (this.filteredItems !== undefined) {
      return this.filteredItems[index] || [];
    } else {
      return [];
    }
  }
  getFilteredItemsPax(index: number): string[] {
    if (this.filteredItemsPax !== undefined) {
      return this.filteredItemsPax[index] || [];
    } else {
      return [];
    }
  }

  async comfirmPriceLines() {
    // console.log('this.myForm',this.myForm.value);

    this.loadingBooking = true;

    if (this.myForm.valid) {
      const formData = this.myForm.value.fields;

      let formDataToSubmit = [];

      formData.forEach((element) => {
        // console.log('element',element);

        const priceData = {
          base: element?.base,
          tax: element?.tax,
          inputVat: element?.inputVat,
          markup: element?.markup,
          discount: element?.discount,
          outputVat: element?.outputVat,
          total: element?.total,
          priceBreakdownFlag: element?.priceBreakdownFlag,
          supplierReference: element?.supplierReference,
        };
        // console.log('element?.referenceOne',element?.referenceOne);

        let RouteOrRoomData = [];
        let paxData = [];

        if (element?.referenceTwo !== undefined && element?.referenceTwo[0] !== 'NA') {
          paxData = element?.referenceTwo;
        }

        if (element?.referenceOne !== undefined && element?.referenceOne[0] !== 'NA') {
          // console.log('if');

          element?.referenceOne.forEach((routeorroom) => {
            let routeorroomdata: RouteRoom = {
              fromCode: '',
              fromCityCode: '',
              fromCountryName: '',
              toCode: '',
              toCityCode: '',
              toCountryName: '',
              airLine: '',
              flightNo: '',
              depDate: '',
              depTime: '',
              arrDate: '',
              arrTime: '',
              cabinClass: '',
              rbd: '',
              bag: '',
              operatingCarrier: '',
              hotelAnxName: '',
              hotelAnxCode: '',
              roomOrServiceName: '',
              roomOrServiceType: '',
              roomOrServiceNo: 0,
              roomOrServiceId: 0,
              address: '',
              showLabel: '',
            };
            routeorroomdata.fromCode = routeorroom?.fromCode;
            routeorroomdata.fromCityCode = routeorroom?.fromCityCode;
            routeorroomdata.fromCountryName = routeorroom?.fromCountryName;
            routeorroomdata.toCode = routeorroom?.toCode;
            routeorroomdata.toCityCode = routeorroom?.toCityCode;
            routeorroomdata.toCountryName = routeorroom?.toCountryName;
            routeorroomdata.airLine = routeorroom?.airLine;
            routeorroomdata.flightNo = routeorroom?.flightNo;
            routeorroomdata.depDate = routeorroom?.depDate;
            routeorroomdata.depTime = routeorroom?.depTime;
            routeorroomdata.arrDate = routeorroom?.arrDate;
            routeorroomdata.arrTime = routeorroom?.arrTime;
            routeorroomdata.cabinClass = routeorroom?.cabinClass;
            routeorroomdata.rbd = routeorroom?.rbd;
            routeorroomdata.bag = routeorroom?.bag;
            routeorroomdata.operatingCarrier = routeorroom?.operatingCarrier;
            routeorroomdata.hotelAnxName = routeorroom?.hotelAnxName;
            routeorroomdata.hotelAnxCode = routeorroom?.hotelAnxCode;
            routeorroomdata.roomOrServiceName = routeorroom?.roomOrServiceName;
            routeorroomdata.roomOrServiceType = routeorroom?.roomOrServiceType;
            routeorroomdata.roomOrServiceNo = routeorroom?.roomOrServiceNo;
            routeorroomdata.roomOrServiceId = routeorroom?.roomOrServiceId;
            routeorroomdata.address = routeorroom?.address;
            routeorroomdata.showLabel = routeorroom?.showLabel;

            if (element?.productDetails.productId === 2) {
              routeorroomdata.fromCode = routeorroom?.roomCity;
              routeorroomdata.fromCityCode = routeorroom?.roomLocation;
              routeorroomdata.fromCountryName = routeorroom?.roomCity;
              routeorroomdata.depDate = routeorroom?.checkInDate;
              routeorroomdata.arrDate = routeorroom?.checkOutDate;
              routeorroomdata.hotelAnxName = routeorroom?.roomLocation;
              routeorroomdata.hotelAnxCode = routeorroom?.roomCity;
              routeorroomdata.roomOrServiceNo = routeorroom?.roomNumber;
            }

            RouteOrRoomData.push(routeorroomdata);
          });
        } else if (element?.referenceOne !== undefined && element?.referenceOne[0] === 'NA') {
          let routeorroom: RouteRoom = {
            fromCode: '',
            fromCityCode: '',
            fromCountryName: '',
            toCode: '',
            toCityCode: '',
            toCountryName: '',
            airLine: '',
            flightNo: '',
            depDate: '',
            depTime: '',
            arrDate: '',
            arrTime: '',
            cabinClass: '',
            rbd: '',
            bag: '',
            operatingCarrier: '',
            hotelAnxName: '',
            hotelAnxCode: '',
            roomOrServiceName: '',
            roomOrServiceType: '',
            roomOrServiceNo: 0,
            roomOrServiceId: 0,
            address: '',
            showLabel: '',
          };
          //console.log('else if');
          routeorroom.fromCode = undefined;
          routeorroom.fromCityCode = undefined;
          routeorroom.fromCountryName = undefined;
          routeorroom.toCode = undefined;
          routeorroom.toCityCode = undefined;
          routeorroom.toCountryName = undefined;
          routeorroom.airLine = undefined;
          routeorroom.flightNo = undefined;
          routeorroom.depTime = undefined;
          routeorroom.arrDate = undefined;
          routeorroom.arrTime = undefined;
          routeorroom.cabinClass = undefined;
          routeorroom.rbd = undefined;
          routeorroom.bag = undefined;
          routeorroom.operatingCarrier = undefined;

          if (element?.productDetails.productId === 4) {
            routeorroom.depDate = element?.productDetails.attractionDate;
            routeorroom.hotelAnxName = element?.productDetails.product;
            routeorroom.hotelAnxCode = element?.productDetails.requestLineId;
          } else if (element?.productDetails.productId === 3) {
            routeorroom.depDate = undefined;
            routeorroom.hotelAnxName = element?.productDetails.srType;
            routeorroom.hotelAnxCode = element?.productDetails.srTypeId;
          }
          routeorroom.roomOrServiceName = undefined;
          routeorroom.roomOrServiceType = undefined;
          routeorroom.roomOrServiceNo = undefined;
          routeorroom.roomOrServiceId = undefined;
          routeorroom.address = undefined;
          routeorroom.showLabel = undefined;
          RouteOrRoomData.push(routeorroom);
          // console.log("RouteOrRoomData",RouteOrRoomData);
        }

        const index = formDataToSubmit.findIndex(
          (obj) => obj.serviceRequestLine === element?.productDetails?.requestLineId
        );

        if (index !== -1) {
          console.log(`The value exists in the serviceRequestLine array at index ${index}.`);
          formDataToSubmit[index].dataInfo.push({ routesRooms: RouteOrRoomData, pax: paxData, priceData: priceData });
        } else {
          console.log('The value does not exist in the serviceRequestLine array.');

          let data = {
            serviceRequest: element?.productDetails?.requestId,
            serviceRequestLine: element?.productDetails?.requestLineId,
            serviceProductId: element?.productDetails?.productId,
            serviceProduct: element?.productDetails?.product,
            dataInfo: [],
            createdBy: this.authService.getUser(),
            createdDate: this.todaydateAndTimeStamp,
          };
          data.dataInfo.push({ routesRooms: RouteOrRoomData, pax: paxData, priceData: priceData });
          formDataToSubmit.push(data);
          // console.log("data",data);
        }
      });

      console.log('formDataToSubmit', formDataToSubmit);

      try {
        const saveSrDataPriceLines = await this.fd4pl.saveServiceRequestDataForPriceLine(
          'create-booking-and-receipt',
          formDataToSubmit
        );
        console.log('saveSrDataPriceLines : ', saveSrDataPriceLines);

        let toasterText = 'Booking created!';

        if (saveSrDataPriceLines?.data[0]?.receiptInfo?.number !== undefined) {
          toasterText = ` ${saveSrDataPriceLines?.data[0]?.receiptInfo?.number} Receipt created!`;
        }

        this.toaster.success(toasterText, 'Success', { progressBar: true });
        this.myForm.reset();
        const fieldsArray = this.myForm.get('fields') as FormArray;
        fieldsArray.clear();

        this.fetchSRDataForPriceLine(this.serviceRequest);
      } catch (err) {
        console.log('Please check the error ', err);
      }
    } else {
      // Form is invalid, handle error or display validation messages
        console.log('Error');


    }

    this.loadingBooking = false;
  }

  async quotePriceLines() {
    this.loadingQuote = true;

    // console.log('this.myForm',this.myForm.value);

    const srServiceData = await this.fd4pl.fetchSrRequest(this.serviceRequest);

    console.log('srServiceData', srServiceData);

    const formData = this.myForm.value.fields;

    let quoteDataToSubmit = [];

    formData.forEach((element) => {
      // console.log('element', element);

      const priceData = [
        {
          base: element?.base,
          tax: element?.tax,
          commission: 0,
          inputVat: element?.inputVat,
          m1: element?.markup,
          m2: 0,
          d1: element?.discount,
          d2: 0,
          outputVat: element?.outputVat,
          totalPrice: element?.total,
          paxOrRoomType: '',
          paxOrRoomsCount: 0,
          roomNo: 0,
          nightsInfo: '',
        },
      ];

      let paxData = [];

      if (element?.referenceTwo !== undefined && element?.referenceTwo[0] !== 'NA') {
        element?.referenceTwo.forEach((paxList) => {
          let PaxList: IQuotePax = {
            roomNo: 0,
            paxType: '',
            paxTitle: '',
            firstName: '',
            lastName: '',
            lead: 0,
            dob: null,
            mailId: '',
            phoneNumber: '',
            passportNo: '',
            passportIssuedDate: null,
            passportExpireDate: null,
          };

          PaxList.paxType = paxList.paxType;
          PaxList.paxTitle = paxList.paxTitle;
          PaxList.firstName = paxList.firstName;
          PaxList.lastName = paxList.lastName;
          PaxList.phoneNumber = paxList.phoneNo;
          PaxList.mailId = paxList.email;

          paxData.push(PaxList);
        });

        console.log('paxData', paxData);
      }
      let QuotesSegements = [];
      if (element?.referenceOne !== undefined && element?.referenceOne[0] !== 'NA') {
        // console.log('if');

        element?.referenceOne.forEach((routeorroom) => {
          let QuoteSegements: IQuoteSegements = {
            segFrom: '',
            segTo: '',
            airLine: '',
            flightNo: '',
            depDate: '',
            depTime: '',
            arrDate: '',
            arrTime: '',
            cabinClass: '',
            rbd: '',
            bag: '',
            operatingCarrier: '',
            fareRules: '',
            hotelAnxName: '',
            hotelAnxCode: '',
            roomOrServiceName: '',
            roomOrServiceType: '',
            roomOrServiceNo: 0,
            city: '',
            address: '',
            supplierCancellationPolicy: '',
            internalCancellationPolicy: '',
          };
          QuoteSegements.segFrom = routeorroom?.fromCode;
          QuoteSegements.segTo = routeorroom?.toCode;
          QuoteSegements.airLine = routeorroom?.airLine;
          QuoteSegements.flightNo = routeorroom?.flightNo;
          QuoteSegements.depDate = routeorroom?.depDate;
          QuoteSegements.depTime = routeorroom?.depTime;
          QuoteSegements.arrDate = routeorroom?.arrDate;
          QuoteSegements.arrTime = routeorroom?.arrTime;
          QuoteSegements.cabinClass = routeorroom?.cabinClass;
          QuoteSegements.rbd = routeorroom?.rbd;
          QuoteSegements.bag = routeorroom?.bag;
          QuoteSegements.operatingCarrier = routeorroom?.operatingCarrier;
          QuoteSegements.hotelAnxName = routeorroom?.hotelAnxName;
          QuoteSegements.hotelAnxCode = routeorroom?.hotelAnxCode;
          QuoteSegements.roomOrServiceName = routeorroom?.roomOrServiceName;
          QuoteSegements.roomOrServiceType = routeorroom?.roomOrServiceType;
          QuoteSegements.roomOrServiceNo = routeorroom?.roomOrServiceNo;
          QuoteSegements.address = routeorroom?.address;

          if (element?.productDetails.productId === 2) {
            QuoteSegements.depDate = routeorroom?.checkInDate;
            QuoteSegements.arrDate = routeorroom?.checkOutDate;
            QuoteSegements.hotelAnxName = routeorroom?.roomLocation;
            QuoteSegements.hotelAnxCode = routeorroom?.roomCity;
            QuoteSegements.roomOrServiceNo = routeorroom?.roomNumber;
          }

          QuotesSegements.push(QuoteSegements);
        });
      } else if (element?.referenceOne !== undefined && element?.referenceOne[0] === 'NA') {
        let QuoteSegements: IQuoteSegements = {
          segFrom: '',
          segTo: '',
          airLine: '',
          flightNo: '',
          depDate: '',
          depTime: '',
          arrDate: '',
          arrTime: '',
          cabinClass: '',
          rbd: '',
          bag: '',
          operatingCarrier: '',
          fareRules: '',
          hotelAnxName: '',
          hotelAnxCode: '',
          roomOrServiceName: '',
          roomOrServiceType: '',
          roomOrServiceNo: 0,
          city: '',
          address: '',
          supplierCancellationPolicy: '',
          internalCancellationPolicy: '',
        };
        //console.log('else if');
        QuoteSegements.segFrom = undefined;
        QuoteSegements.segTo = undefined;
        QuoteSegements.airLine = undefined;
        QuoteSegements.flightNo = undefined;
        QuoteSegements.depDate = undefined;
        QuoteSegements.depTime = undefined;
        QuoteSegements.arrDate = undefined;
        QuoteSegements.arrTime = undefined;
        QuoteSegements.cabinClass = undefined;
        QuoteSegements.rbd = undefined;
        QuoteSegements.bag = undefined;
        QuoteSegements.operatingCarrier = undefined;
        QuoteSegements.hotelAnxName = undefined;
        QuoteSegements.hotelAnxCode = undefined;
        QuoteSegements.roomOrServiceName = undefined;
        QuoteSegements.roomOrServiceType = undefined;
        QuoteSegements.roomOrServiceNo = undefined;
        QuoteSegements.address = undefined;

        if (element?.productDetails.productId === 4) {
          QuoteSegements.depDate = element?.productDetails.attractionDate;
          QuoteSegements.hotelAnxName = element?.productDetails.product;
          QuoteSegements.hotelAnxCode = element?.productDetails.requestLineId;
        } else if (element?.productDetails.productId === 3) {
          QuoteSegements.depDate = undefined;
          QuoteSegements.hotelAnxName = element?.productDetails.srType;
          QuoteSegements.hotelAnxCode = element?.productDetails.srTypeId;
        }
        QuoteSegements.roomOrServiceName = undefined;
        QuoteSegements.roomOrServiceType = undefined;
        QuoteSegements.roomOrServiceNo = undefined;
        QuoteSegements.address = undefined;
        QuotesSegements.push(QuoteSegements);
        // console.log("RouteOrRoomData",RouteOrRoomData);
      }

      let quotesHeader = {
        srId: element?.productDetails?.requestId,
        srLineId: element?.productDetails?.requestLineId,
        productId: element?.productDetails?.productId,
        custmerId: srServiceData?.customerId,
        contactId: srServiceData?.contactId,
        bookingRefNo: '',
        statusId: 0,
        statusCode: '',
        channel: 'Offline',
        remarks: '',
        fareRules: '',
        internalPolicies: '',
        createdBy: this.authService.getUser(),
        createdDate: this.todaydateAndTimeStamp,
      };
      quoteDataToSubmit.push({
        quotesHeader: quotesHeader,
        QuotesSegements: QuotesSegements,
        quotesPax: paxData,
        quotesPrice: priceData,
      });
    });

    console.log('quoteDataToSubmit', quoteDataToSubmit);

    try {
      const saveQuoteDataPriceLines = await this.fd4pl.saveQuoteDataForPriceLine('save-multi-quote', quoteDataToSubmit);
      console.log('saveQuoteDataPriceLines : ', saveQuoteDataPriceLines);

      this.toaster.success(saveQuoteDataPriceLines.message, 'Info', { progressBar: true });
      this.myForm.reset();
      const fieldsArray = this.myForm.get('fields') as FormArray;
      fieldsArray.clear();

      this.fetchSRDataForPriceLine(this.serviceRequest);
    } catch (err) {
      console.log('Please check the error ', err);
    }
    this.loadingQuote = false;
  }
}
