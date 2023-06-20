import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DashboardBookingAsyncService } from '../../../services/dashboard-booking-async.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'app/shared/auth/auth.service';
import { formatDate } from '@angular/common';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-multiple-product-forms',
  templateUrl: './multiple-product-forms.component.html',
  styleUrls: ['./multiple-product-forms.component.scss'],
})
export class MultipleProductFormsComponent implements OnInit {
  allForms: FormGroup;
  productPriceFlightForms: FormGroup[] = [];
  productPriceHotelForms: FormGroup[] = [];

  serviceRequest = 0;
  contactId = 0;
  serviceRequestData = [];
  selectedValues: any[] = [];
  formShow: boolean = false;
  loadingBooking: boolean = false;
  loadingQuote: boolean = false;
  todayDate = new Date();
  todaydateAndTimeStamp: string;

  supplierData = [];

  constructor(
    private formBuilder: FormBuilder,
    private fd4pl: DashboardBookingAsyncService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private toaster: ToastrService,
    private authService: AuthService
  ) {
    this.todaydateAndTimeStamp = formatDate(this.todayDate, 'yyyy-MM-ddThh:mm:ss', 'en-US', '+0530');
  }

  ngOnInit() {
    this.allForms = this.formBuilder.group({
      productPriceFlightForms: this.formBuilder.array([]),
      productPriceHotelForms: this.formBuilder.array([]),
    });

    // this.addFlightForm();
    //this.addHotelForm();

    this.getQueryParms();
  }

  getQueryParms() {
    this.route.queryParams.subscribe((params) => {
      if (params && params.requestId) {
        this.serviceRequest = params.requestId;
        this.contactId = params.contactId;
        this.fetchSRDataForPriceLine(Number(params.requestId));
        this.fetchSupplierData();
      }
    });
  }

  createFlightForm(): FormGroup {
    return this.formBuilder.group({
      serviceRequest: [''],
      serviceRequestLine: [''],
      serviceProductId: [''],
      serviceProduct: [''],
      supplierData: ['', Validators.required],
      supplierReference: ['', Validators.required],
      supplierReferenceDate: [''],
      headerAirlineCode: [''],
      headerAirlineNumber: [''],
      headerDeptTime: [''],
      headerArrTime: [''],
      headerArrDays: [''],
      headerBase: [''],
      headerTax: [''],
      priceForPax:[true],
      paxTypePrice: this.formBuilder.array([]),
      segments: this.formBuilder.array([]),
      passengers: this.formBuilder.array([]),
      // Additional flight form fields
    });
  }

  /* createPassengerForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', Validators.required],
      mobile: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  } */

  createHotelForm(): FormGroup {
    return this.formBuilder.group({
      hotelName: [''],
      // Additional hotel form fields
    });
  }

  addFlightForm(selectedProduct: any): void {
    const productPriceFlightForm = this.createFlightForm();
    (this.allForms.get('productPriceFlightForms') as FormArray).push(productPriceFlightForm);
    this.productPriceFlightForms.push(productPriceFlightForm);
    if (!selectedProduct) return;

    (this.allForms.get('productPriceFlightForms') as FormArray).at(this.productPriceFlightForms.length - 1).patchValue({
      serviceRequest: selectedProduct?.requestId,
      serviceRequestLine: selectedProduct?.requestLineId,
      serviceProductId: selectedProduct?.productId,
      serviceProduct: selectedProduct?.product,
    });
    // console.log("form data",this.allForms);
  }

  addHotelForm(): void {
    const productPriceHotelForm = this.createHotelForm();
    (this.allForms.get('productPriceHotelForms') as FormArray).push(productPriceHotelForm);

    this.productPriceHotelForms.push(productPriceHotelForm);
  }

  async submitAllForms(): Promise<void> {
    // console.log('allForms',this.allForms);
    this.loadingBooking = true;
    if (this.allForms.valid) {
      let allFormDataaToSubmit = [];

      // Perform your desired actions here

      if (this.allForms.value.productPriceFlightForms) {
        console.log('productPriceFlightForms', this.allForms.value.productPriceFlightForms);

        const priceFlightForms = this.allForms.value.productPriceFlightForms;

        priceFlightForms.forEach((priceFlightForm) => {
          let flightFormDataToSubmit: any = {};

          flightFormDataToSubmit.serviceRequest = priceFlightForm.serviceRequest;
          flightFormDataToSubmit.serviceRequestLine = priceFlightForm.serviceRequestLine;
          flightFormDataToSubmit.serviceProductId = priceFlightForm.serviceProductId;
          flightFormDataToSubmit.serviceProduct = priceFlightForm.serviceProduct;
          flightFormDataToSubmit.supplierId = priceFlightForm.supplierData?.customerId;
          flightFormDataToSubmit.bookingRefNo = priceFlightForm.supplierReference;
          flightFormDataToSubmit.createdBy = this.authService.getUser();
          flightFormDataToSubmit.createdDate = this.todaydateAndTimeStamp;
          let dataInfo = [];

          let routes = [];

          priceFlightForm.segments.forEach((segment) => {
            let route: any = {};
            if (segment?.deptCode) {
              route.fromCode = segment?.deptCode;
              route.fromAirportCityCode = segment?.deptCode;
            }
            if (segment?.arrCode) {
              route.toCode = segment?.arrCode;
              route.toAirportCityCode = segment?.arrCode;
            }
            if (segment?.deptDate) {
              route.depDate = segment?.deptDate;
            }
            if (segment?.deptTime) {
              route.depTime = segment?.deptTime;
            }
            if (segment?.arrDate) {
              route.arrDate = segment?.arrDate;
            }
            if (segment?.arrTime) {
              route.arrTime = segment?.arrTime;
            }
            if (segment?.airlineCodeSegment) {
              route.airLine = segment?.airlineCodeSegment;
              route.operatingCarrier = segment?.airlineCodeSegment;
            }
            if (segment?.airlineNumberSegment) {
              route.flightNo = segment?.airlineNumberSegment;
            }

            routes.push(route);
          });

          console.log('routes', routes);

          let paxData = [];

          priceFlightForm.passengers.forEach((passenger) => {
            let paxInfo: any = {};

            paxInfo.requestLinePaxId = passenger.passengerRequestLinePaxId;
            paxInfo.paxId = passenger.passengerPaxId;
            paxInfo.firstName = passenger.passengerFirstName;
            paxInfo.lastName = passenger.passengerLastName;
            paxInfo.email = passenger.passengerEmail;
            paxInfo.phoneNo = passenger.passengerMobile;
            paxInfo.paxTypeId = passenger.passengerPaxTypeId;
            paxInfo.paxType = passenger.passengerPaxType;
            paxInfo.middleName = '';
            paxInfo.paxTitleId = passenger.passengerPaxTitleId;
            paxInfo.paxTitle = passenger.passengerPaxTitle;
            paxInfo.ticket = passenger.passengerTicket;

            paxData.push(paxInfo);
          });

          priceFlightForm.paxTypePrice.forEach((paxTypePrice) => {
            let priceData: any = {};

            priceData.paxType = paxTypePrice.paxType;
            priceData.base = paxTypePrice?.base ? paxTypePrice?.base : 0;
            priceData.tax = paxTypePrice?.tax ? paxTypePrice?.tax : 0;
            priceData.markup = paxTypePrice?.markup ? paxTypePrice?.markup : 0;
            priceData.discount = paxTypePrice?.discount ? paxTypePrice?.discount : 0;
            priceData.inputVat = paxTypePrice?.inputVat ? paxTypePrice?.inputVat : 0;
            priceData.outputVat = paxTypePrice?.outputVat ? paxTypePrice?.outputVat : 0;
            priceData.total = paxTypePrice?.total ? paxTypePrice?.total : 0;
            priceData.priceBreakdownFlag = paxTypePrice?.priceBreakdownFlag ? paxTypePrice?.priceBreakdownFlag : true;

            console.log('priceData', priceData);

            const passengers = paxData.filter((passenger) => passenger.paxType === paxTypePrice.paxType);

            console.log(passengers);

            dataInfo.push({
              routesRooms: routes,
              priceData: priceData,
              pax: passengers,
            });
          });

          console.log('dataInfo', dataInfo);

          flightFormDataToSubmit.dataInfo = dataInfo;

          console.log('flightFormDataToSubmit', flightFormDataToSubmit);

          allFormDataaToSubmit.push(flightFormDataToSubmit);
        });

        console.log('allFormDataaToSubmit', allFormDataaToSubmit);

        if (allFormDataaToSubmit.length > 0) {
          try {
            const saveSrDataPriceLines = await this.fd4pl.saveServiceRequestDataForPriceLine(
              'create-booking-and-receipt',
              allFormDataaToSubmit
            );
            console.log('saveSrDataPriceLines : ', saveSrDataPriceLines);

            let toasterText = 'Booking created!';

            if (saveSrDataPriceLines?.data[0]?.receiptInfo?.number !== undefined) {
              toasterText = ` ${saveSrDataPriceLines?.data[0]?.receiptInfo?.number} Receipt created!`;
            }

            this.toaster.success(toasterText, 'Success', { progressBar: true });

            // Reset the forms
            console.log('this.productPriceFlightForms.length', this.productPriceFlightForms.length);

            for (let index = 0; index < this.productPriceFlightForms.length; index++) {
              console.log('index', index);

              this.removeFlightForm(index);
            }
          } catch (error) {
            console.log('Please check the error ', error);
          }
        }
      }
    } else {
      console.log('Form validation failed!');
      // Handle validation errors
    }
    this.loadingBooking = false;
    this.cdr.markForCheck();
  }

  async quotePriceLines() {
    this.loadingQuote = true;
    if (this.allForms.valid) {
      let allFormDataaToSubmit = [];

      // Perform your desired actions here

      const srServiceData = await this.fd4pl.fetchSrRequest(this.serviceRequest);

      console.log('srServiceData', srServiceData);

      if (this.allForms.value.productPriceFlightForms) {
        console.log('productPriceFlightForms', this.allForms.value.productPriceFlightForms);

        const priceFlightForms = this.allForms.value.productPriceFlightForms;

        priceFlightForms.forEach((priceFlightForm) => {
          let flightFormDataToSubmit: any = {};

          let quotesHeader: any = {};

          quotesHeader.srId = priceFlightForm.serviceRequest;
          quotesHeader.srLineId = priceFlightForm.serviceRequestLine;
          quotesHeader.productId = priceFlightForm.serviceProductId;
          quotesHeader.pnrOrVoucheredNo = priceFlightForm.supplierReference;
          quotesHeader.pnrOrVoucheredDate = priceFlightForm.supplierReferenceDate;
          quotesHeader.custmerId = srServiceData?.customerId;
          quotesHeader.contactId = srServiceData?.contactId;
          quotesHeader.statusId = 30;
          quotesHeader.statusCode = 'QTSASSIGN';
          quotesHeader.channel = 'Offline';
          quotesHeader.remarks = '';
          quotesHeader.fareRules = '';
          quotesHeader.internalPolicies = '';
          quotesHeader.createdBy = this.authService.getUser();
          quotesHeader.createdDate = this.todaydateAndTimeStamp;

          let routes = [];

          priceFlightForm.segments.forEach((segment) => {
            let route: any = {};
            if (segment?.deptCode) {
              route.segFrom = segment?.deptCode;
            }
            if (segment?.arrCode) {
              route.segTo = segment?.arrCode;
            }
            if (segment?.deptDate) {
              route.depDate = segment?.deptDate;
            }
            if (segment?.deptTime) {
              route.depTime = segment?.deptTime;
            }
            if (segment?.arrDate) {
              route.arrDate = segment?.arrDate;
            }
            if (segment?.arrTime) {
              route.arrTime = segment?.arrTime;
            }
            if (segment?.airlineCodeSegment) {
              route.airLine = segment?.airlineCodeSegment;
              route.operatingCarrier = segment?.airlineCodeSegment;
            }
            if (segment?.airlineNumberSegment) {
              route.flightNo = segment?.airlineNumberSegment;
            }

            routes.push(route);
          });

          console.log('routes', routes);

          let paxData = [];

          priceFlightForm.passengers.forEach((passenger) => {
            let paxInfo: any = {};

            paxInfo.firstName = passenger.passengerFirstName;
            paxInfo.lastName = passenger.passengerLastName;
            paxInfo.mailId = passenger.passengerEmail;
            paxInfo.phoneNumber = passenger.passengerMobile;
            paxInfo.paxType = passenger.passengerPaxType;
            paxInfo.paxTitle = passenger.passengerPaxTitle;

            paxData.push(paxInfo);
          });

          let priceData = [];

          priceFlightForm.paxTypePrice.forEach((paxTypePrice) => {
            let priceInfo: any = {};

            const passengers = paxData.filter((passenger) => passenger.paxType === paxTypePrice.paxType);

            console.log(passengers);

            priceInfo.paxOrRoomType = paxTypePrice.paxType;
            priceInfo.paxOrRoomsCount = passengers.length;
            priceInfo.base = paxTypePrice?.base ? paxTypePrice?.base : 0;
            priceInfo.tax = paxTypePrice?.tax ? paxTypePrice?.tax : 0;
            priceInfo.m1 = paxTypePrice?.markup ? paxTypePrice?.markup : 0;
            priceInfo.d1 = paxTypePrice?.discount ? paxTypePrice?.discount : 0;
            priceInfo.inputVat = paxTypePrice?.inputVat ? paxTypePrice?.inputVat : 0;
            priceInfo.outputVat = paxTypePrice?.outputVat ? paxTypePrice?.outputVat : 0;
            priceInfo.totalPrice = paxTypePrice?.total ? paxTypePrice?.total : 0;

            console.log('priceData', priceInfo);

            priceData.push(priceInfo);
          });

          flightFormDataToSubmit.quotesHeader = quotesHeader;
          flightFormDataToSubmit.QuotesSegements = routes;
          flightFormDataToSubmit.quotesPax = paxData;
          flightFormDataToSubmit.quotesPrice = priceData;

          console.log('flightFormDataToSubmit', flightFormDataToSubmit);

          allFormDataaToSubmit.push(flightFormDataToSubmit);
        });

        console.log('allFormDataaToSubmit', allFormDataaToSubmit);

        if (allFormDataaToSubmit.length > 0) {
          try {
            const saveQuoteDataPriceLines = await this.fd4pl.saveQuoteDataForPriceLine(
              'save-multi-quote',
              allFormDataaToSubmit
            );
            console.log('saveQuoteDataPriceLines : ', saveQuoteDataPriceLines);

            this.toaster.success(saveQuoteDataPriceLines.message, 'Info', { progressBar: true });

            // Reset the forms
            /* console.log('this.productPriceFlightForms.length', this.productPriceFlightForms.length);

            for (let index = 0; index < this.productPriceFlightForms.length; index++) {
              console.log('index', index);

              this.removeFlightForm(index);
            } */
          } catch (error) {
            console.log('Please check the error ', error);
          }
        }
      }
    } else {
      console.log('Form validation failed!');
      // Handle validation errors
    }
    this.loadingQuote = false;
    this.cdr.markForCheck();
  }

  fetchSRDataForPriceLine = async (serviceRequestNum: number) => {
    try {
      const srDataPriceLines = await this.fd4pl.getServiceRequestDataForPriceLine(
        `/sr-request-data-for-price-lines?requestId=${serviceRequestNum}`
      );

      // console.log('srDataPriceLines ', srDataPriceLines);

      srDataPriceLines.data.forEach((option) => {
        let iconInfo = '';

        switch (option.productId) {
          case '2':
            iconInfo = '<i class="fas fa-plane"></i>';
            break;
          case '3':
            iconInfo = '<i class="fas fa-plane"></i>';
            break;
          case '4':
            iconInfo = '<i class="fas fa-plane"></i>';
            break;
          default:
            iconInfo = '<i class="fas fa-plane fa-rotate-270 rounded bg-white text-primary shadow-sm p-1"></i>';
            break;
        }

        option.showLabel = `${iconInfo} ${option.requestId}-${option.requestLineId}`;
      });

      this.serviceRequestData = srDataPriceLines.data;
      this.cdr.markForCheck();
    } catch (err) {
      console.log('Please check the error ', err);
      this.cdr.markForCheck();
    }
  };

  addPriceLine() {
    //console.log(this.selectedValues);
    if (this.selectedValues) {
      this.formShow = true;
      this.addFlightForm(this.selectedValues);
    }
  }

  onSelectionChange(event: any) {
    this.selectedValues = event;
  }

  showSubmitButton(): boolean {
    return this.productPriceFlightForms.length > 0 || this.productPriceHotelForms.length > 0;
  }

  removeFlightForm(index: number): void {
    this.productPriceFlightForms.splice(index, 1);
    (this.allForms.get('productPriceFlightForms') as FormArray).removeAt(index);
  }

  fetchSupplierData = async () => {
    try {
      const supplierDataFetch = await this.fd4pl.getSupplierDataForPriceLine(`customer/supplier/all`);

      // console.log('supplierDataFetch',supplierDataFetch);

      this.supplierData = supplierDataFetch.data;
      this.cdr.markForCheck();
    } catch (error) {}
  };

  formatLabel(label: string): string {
    // Apply custom formatting to the label
    const formattedLabel = `${label}`; // Example: Wrap the label in a <strong> tag

    return formattedLabel;
  }

  redirectQuote(srId) {
    if (srId) {
      const redirectRfqUrl = `${environment.Quote}quote/info/${srId}`;
      //alert(redirectRfqUrl);
      window.open(redirectRfqUrl, '_blank');
    }
  }
}
