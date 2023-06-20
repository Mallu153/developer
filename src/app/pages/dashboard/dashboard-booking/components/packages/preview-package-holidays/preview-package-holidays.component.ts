import { DatePipe, formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PreviewPackage } from 'app/pages/dashboard/dashboard-request/model/preview-package';
import { DashboardRequestService } from 'app/pages/dashboard/dashboard-request/services/dashboard-request.service';
import {
  previewPackageItineraryInfo,
  Holiday_Package,
  sr_assignment,
  SrSummaryData,
  addons_url,
  request_hotel_url,
} from 'app/pages/dashboard/dashboard-request/url-constants/url-constants';
import { ANX_API, ANX_PAX_API } from 'app/pages/dashboard/service-request/constants/anx-api';
import { AuthService } from 'app/shared/auth/auth.service';
import { ApiResponse } from 'app/shared/models/api-response';
import { MasterDataService } from 'app/shared/services/master-data.service';
import { ServiceTypeService } from 'app/shared/services/service-type.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subject, forkJoin, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-preview-package-holidays',
  templateUrl: './preview-package-holidays.component.html',
  styleUrls: ['./preview-package-holidays.component.scss'],
})
export class PreviewPackageHolidaysComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  todayDate = new Date();
  todayDate1: string;
  todaydateAndTimeStamp: string;

  previewPackageList: PreviewPackage;
  flightDetailsList = [];
  dayCountList = [];

  daysActive = [];
  scrollClass: string;

  myDataAttribute: string;
  isFlightSelected: boolean = true;
  isHotelSelected: boolean = true;
  isActivitiesSelected: boolean = true;
  isAncillarySelected: boolean = true;
  isAllSelected: boolean = true;

  productList = [];
  masterClassList = [];
  contactDetails: any = {};

  requestId: number;

  addonsPassengers: any[] = [];

  //ipaddress
  deviceInfo = null;
  isDesktopDevice: boolean;
  isTablet: boolean;
  isMobile: boolean;

  flightRequestData: any[] = [];
  flightSegmentRequestData: any[] = [];
  flightAddons: any[] = [];

  hotelRequestData: any[] = [];
  hotelAddons = [];


  attractionRequestData: any[] = [];

  ancillaryRequestData: any[] = [];
  anxPaxRequestData = [];
  anxAdt: number = 0;
  anxChd: number = 0;
  anxInf: number = 0;


 requestCreationLoading:boolean=false;

 @ViewChild('dayList') dayList: ElementRef;

  flightAddonsHide=[];
  hotelAddonsHide=[];
  showAndHidePassengers=[];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private toastrService: ToastrService,
    private dashboardRequestService: DashboardRequestService,
    private datepipe: DatePipe,
    private authService: AuthService,
    private deviceService: DeviceDetectorService,
    private masterDataService: MasterDataService,
    private serviceTypeService: ServiceTypeService,
    private spinnerService: NgxSpinnerService,
  ) {
    this.todayDate1 = this.datepipe.transform(this.todayDate, 'yyyy-MM-dd');
    this.todaydateAndTimeStamp = formatDate(this.todayDate, 'yyyy-MM-ddThh:mm:ss', 'en-US', '+0530');
  }

  ngOnInit(): void {
    this.getProduct();
    this.getMasterClass();
    this.epicFunction();
    this.getQueryParams();
    //back button disabled
    history.pushState(null, '');
    fromEvent(window, 'popstate')
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((_) => {
        history.pushState(null, '');
      });
  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }

  getQueryParams() {
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param && param.requestId) {
        this.requestId = Number(param.requestId);
        this.getPreviewPackage(this.requestId);
        this.getSegmentDetails(this.requestId);
      }
    });
    this.contactDetails = this.authService.getRequestDetails();
  }
  epicFunction() {
    this.deviceInfo = this.deviceService.getDeviceInfo();
    this.isMobile = this.deviceService.isMobile();
    this.isTablet = this.deviceService.isTablet();
    this.isDesktopDevice = this.deviceService.isDesktop();
  }

  getProduct() {
    this.showSpinner();
    this.requestCreationLoading=true;
    this.masterDataService
      .getGenMasterDataByTableName('master_products')
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((data) => {
        if (data) {
          this.productList = data;
          this.cdr.markForCheck();
          // this.cdr.detectChanges();
          //const productName = 'Flight';
          //this.productList = data?.find((con) => con.name === productName);
          //this.cdr.detectChanges();
        } else {
          this.requestCreationLoading=false;
          this.toastrService.error(
            'Oops! Something went wrong while fetching the Product type data please try again ',
            'Error'
          );
          this.cdr.markForCheck();
        }
      });
  }

  getMasterClass() {
    this.showSpinner();
    this.requestCreationLoading=true;
    this.masterDataService
      .getMasterDataByTableName('master_class')
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((data) => {
        if (data) {
          this.masterClassList = data;
          this.requestCreationLoading=false;
          this.cdr.markForCheck();
        } else {
          this.requestCreationLoading=false;
          this.toastrService.error('Oops! Something went wrong while fetching the Class Data', 'Error');
          this.cdr.markForCheck();
        }
      });
  }

  getPreviewPackage(requestNumber: number) {
    this.showSpinner();
    this.requestCreationLoading=true;
    this.dashboardRequestService
      .getPreviewPackage(requestNumber, previewPackageItineraryInfo.getPackageItenaryInfo)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res: ApiResponse) => {
        const result: ApiResponse = res;
        if (result.statusCode == true) {
          this.previewPackageList = result.data[0];
          if(this.previewPackageList?.packageLines?.length>0){
            this.previewPackageList?.packageLines.forEach((element,index) => {
              element?.flight?.forEach((subElement,index) => {
                this.flightAddonsHide.push(true);
              });
              element?.hotel?.forEach((subElement,index) => {
                this.hotelAddonsHide.push(true);

              });
            });



          }
          this.dayCountList = new Array(this.previewPackageList?.packageHeader?.totalNoOfDays);
          this.requestCreationLoading=false;
          this.cdr.markForCheck();
        } else {
          if (result.message == '') {
            this.requestCreationLoading=false;
            this.toastrService.error('oops something  went wrong  please try again', 'Error', { progressBar: true });
            this.cdr.markForCheck();
          } else {
            this.requestCreationLoading=false;
            this.toastrService.error(result.message, 'Error', { progressBar: true });
            this.cdr.markForCheck();
          }
        }
      });
  }

  getSegmentDetails(srId: number) {

    this.showSpinner();
    this.requestCreationLoading=true;
    this.dashboardRequestService
      .getPackageRequest(Holiday_Package.getPackageRequest, srId)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(
        (requestResponse: any) => {
          if (requestResponse?.length > 0) {
            this.flightDetailsList = requestResponse;
            this.requestCreationLoading=false;
            this.cdr.markForCheck();
          }
        },
        (error) => {
          if (error == null || error == '') {
            this.requestCreationLoading=false;
            this.toastrService.error('oops something  went wrong  please try again', 'Error');
            this.cdr.markForCheck();
          } else {
            this.requestCreationLoading=false;
            this.toastrService.error(error, 'Error');
            this.cdr.markForCheck();
          }
        }
      );
  }

  scrollToElementById(id: string) {
    const element = this.__getElementById(id);
    this.scrollToElement(element);
  }
  private __getElementById(id: string): HTMLElement {
    //console.log("element id : ", id);
    // const element = <HTMLElement>document.querySelector(`#${id}`);
    const element = document.getElementById(id);
    return element;
  }

  scrollToElement(element: HTMLElement) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
  scrollToId(day: string, dayNumber: number) {
    //console.log(day+'_'+dayNumber);
    //console.log("element id : ", day+'_'+dayNumber);
    this.daysActive = [];
    this.daysActive[dayNumber - 1] = false;
    this.scrollToElementById(day + '_' + dayNumber);
    this.daysActive[dayNumber] = true;

    this.scrollClass = day + '_' + dayNumber;

    setTimeout(() => {
      this.scrollClass = '';
    }, 1000);
  }
  trackByFn(index, item) {

    return index;
  }

  getDataAttribute(category: string) {
    this.daysActive = [];
    switch (category) {
      case 'flight':
        this.isFlightSelected = true;
        this.isHotelSelected = false;
        this.isActivitiesSelected = false;
        this.isAncillarySelected = false;
        this.isAllSelected = false;
        break;
      case 'hotel':
        this.isHotelSelected = true;
        this.isActivitiesSelected = false;
        this.isFlightSelected = false;
        this.isAncillarySelected = false;
        this.isAllSelected = false;
        break;
      case 'activities':
        this.isActivitiesSelected = true;
        this.isHotelSelected = false;
        this.isFlightSelected = false;
        this.isAncillarySelected = false;
        this.isAllSelected = false;

        break;
      case 'ancillary':
        this.isAncillarySelected = true;
        this.isActivitiesSelected = false;
        this.isHotelSelected = false;
        this.isFlightSelected = false;
        this.isAllSelected = false;

        break;
      default:
        this.isAllSelected = true;
        this.isFlightSelected = true;
        this.isHotelSelected = true;
        this.isActivitiesSelected = true;
        this.isAncillarySelected = true;

        break;
    }
  }

  navigatedToPackageEditMode(routeName:string) {
    const contactId = this.route.snapshot.queryParams.contactId;
    const requestId = this.route.snapshot.queryParams.requestId;
    const holidaysLineId = this.route.snapshot.queryParams.holidaysLineId;

    if (requestId && holidaysLineId && contactId) {
      if(routeName=='package-holidays-listview'){
        const queryParams = {
          requestId: requestId,
          contactId: contactId,
          holidaysLineId: holidaysLineId,
          productsAvailability:true
        };
        this.router.navigate([`/dashboard/booking/${routeName}`], { queryParams });
      }else{
        const queryParams = {
          requestId: requestId,
          contactId: contactId,
          holidaysLineId: holidaysLineId,
          sources: `request-1`,
        };
       // this.router.navigate([`/dashboard/booking/${routeName}`], { queryParams });
        const PACKAGE_EDIT = this.router.createUrlTree([`/dashboard/booking/${routeName}`], { queryParams }).toString();
        window.open(PACKAGE_EDIT, '_blank');
      }

    }
  }

  flightRequestDataConversion(main_element: any) {
    let segment_array: any[] = [];
    let flight_pax_info: any[] = [];
    let flight_pax_Data_info: any[] = [];
    let addonsRoutesData: any[] = [];
    //let flightAddons: any[] = [];
    let adt: any;
    let chd: any;
    let inf: any;
    for (let flightindex = 0; flightindex < main_element?.flight?.length; flightindex++) {
      const flightelement = main_element?.flight[flightindex];
      // console.log("flight",flightelement);
      const SEGEMNT_DATA = {
        requestID: Number(this.requestId),
        //requestlineID:'',
        fromCode: flightelement?.segmentBoardPoint,
        fromCountryName: flightelement?.segmentBoardPoint,
        fromAirportOrCityName: flightelement?.segmentBoardCityOrAirport,
        toCode: flightelement?.segmentOffPoint,
        toCountryName: flightelement?.segmentOffPoint,
        toAirportOrCityName: flightelement?.segmentArrivalCityOrAirport,
        depatureDate: flightelement?.segmentDepartDate,
        returnDate: null,
        className: flightelement?.segmentClassDesignator,
        rbd: flightelement?.segmentRbdCode,
        validateCarrier: null,
        transitPointCode: [],
        excludePointCode: [],
        flexFromCode: [],
        flexToCode: [],
        flexDepature: [],
        flexReturn: [],
        flexClassName: [],
        flexAirLineCode: [],
        budgetFrom: null,
        budgetTo: null,
        airlineCode: flightelement?.segmentAirlineMarketing === null ? null : flightelement?.segmentAirlineMarketing,
      };

      if (flightelement.paxInfo?.length > 0) {
        for (let sub_index = 0; sub_index < flightelement.paxInfo?.length; sub_index++) {
          const flight_pax_sub_element = flightelement.paxInfo[0];
          const pax_info = {
            paxId: flight_pax_sub_element.paxId,
            prefix: flight_pax_sub_element.prefix,
            firstName: flight_pax_sub_element.firstName,
            lastName: flight_pax_sub_element.lastName,
            dob: flight_pax_sub_element.dob,
            nationality: flight_pax_sub_element.nationality,
            nationalityName: flight_pax_sub_element.nationlaityName,
            issuedCountry: flight_pax_sub_element.issuedCountry,
            issuedCountryName: flight_pax_sub_element.issuedCountryName,
            passport: flight_pax_sub_element.passport,
            email: flight_pax_sub_element.email,
            phone: flight_pax_sub_element.phone,
            paxType: flight_pax_sub_element.paxType,
            paxCode: flight_pax_sub_element.paxCode,
            passportExpiredDate: flight_pax_sub_element.passportExpiredDate,
            passportIssueDate: flight_pax_sub_element.passportIssueDate,
            //requestLinePaxId:pax_sub_element.requestLinePaxId,
            createdDate: this.todaydateAndTimeStamp,
          };
          flight_pax_info.push(pax_info);

          let linePersonCount = [];
          if (flightelement?.infCount > 0) {
            for (let lineINFIndex = 1; lineINFIndex <= flightelement?.infCount; lineINFIndex++) {
              let INFData = {
                paxNo: lineINFIndex,
                selectedAllGroup: 'Select All',
                paxTypeCode: 'Infant' + '-' + lineINFIndex,
                paxType: 'INF' + '-' + lineINFIndex,
                bindLablePaxType: 'INF' + '-' + lineINFIndex,
                paxRefence: 0,
              };
              linePersonCount.push(INFData);
            }
          }
          if (flightelement?.adtCount > 0) {
            for (let lineAdultIndex = 1; lineAdultIndex <= flightelement?.adtCount; lineAdultIndex++) {
              let adultData = {
                paxNo: lineAdultIndex,
                selectedAllGroup: 'Select All',
                paxTypeCode: 'Adult' + '-' + lineAdultIndex,
                paxType: 'ADT' + '-' + lineAdultIndex,
                bindLablePaxType: 'ADT' + '-' + lineAdultIndex,
                paxRefence: 0,
              };
              linePersonCount.push(adultData);
            }
          }
          if (flightelement?.chdCount > 0) {
            for (let lineChildIndex = 1; lineChildIndex <= flightelement?.chdCount; lineChildIndex++) {
              let childData = {
                paxNo: lineChildIndex,
                selectedAllGroup: 'Select All',
                paxTypeCode: 'Child' + '-' + lineChildIndex,
                paxType: 'CHD' + '-' + lineChildIndex,
                bindLablePaxType: 'CHD' + '-' + lineChildIndex,
                paxRefence: 0,
              };
              linePersonCount.push(childData);
            }
          }

          let passengerData = [...flightelement.paxInfo];
          passengerData = JSON.parse(JSON.stringify(passengerData));
          let adultIndex = 1;
          let childIndex = 1;
          let infIndex = 1;
          if (passengerData?.length > 0) {
            for (let passengerIndex = 0; passengerIndex < passengerData?.length; passengerIndex++) {
              if (passengerData[passengerIndex]?.paxCode === 'Adult') {
                passengerData[passengerIndex].paxTypeRefName = passengerData[passengerIndex].paxCode + '-' + adultIndex;
                adultIndex = adultIndex + 1;
              }
              if (passengerData[passengerIndex]?.paxCode === 'Child') {
                passengerData[passengerIndex].paxTypeRefName = passengerData[passengerIndex].paxCode + '-' + childIndex;
                childIndex = childIndex + 1;
              }
              if (passengerData[passengerIndex]?.paxCode === 'Infant') {
                passengerData[passengerIndex].paxTypeRefName = passengerData[passengerIndex]?.paxCode + '-' + infIndex;
                infIndex = infIndex + 1;
              }
            }
          }
          if (linePersonCount.length > 0) {
            for (let index = 0; index < linePersonCount.length; index++) {
              linePersonCount[index].paxNo = index + 1;
              if (passengerData?.length > 0) {
                for (let passengerIndex = 0; passengerIndex < passengerData?.length; passengerIndex++) {
                  if (passengerData[passengerIndex].paxTypeRefName === linePersonCount[index].paxTypeCode) {
                    //linePersonCount[index].paxType = passengerData[passengerIndex].paxTypeRefName + '-' + passengersData[passengerIndex]?.firstName;
                    linePersonCount[index].paxType =
                      passengerData[passengerIndex].paxTypeRefName + '-' + passengerData[passengerIndex]?.firstName;
                    linePersonCount[index].paxRefence = passengerData[passengerIndex]?.paxId;
                  }
                }
              }
            }
          }
          this.addonsPassengers = linePersonCount;
        }
      }

      if (flightelement.addOns?.length > 0) {
        for (let addonsindex = 0; addonsindex < flightelement.addOns?.length; addonsindex++) {
          const addonselement = flightelement.addOns[addonsindex];
          const addonsRoutes = {
            routeNo: flightindex + 1,
            selectedAllGroup: 'Select All',
            route: flightelement?.segmentBoardPoint + ' - ' + flightelement?.segmentOffPoint,
            bindLableRoute: flightelement?.segmentBoardPoint + ' - ' + flightelement?.segmentOffPoint,
          };
          addonsRoutesData.push(addonsRoutes);
          let modifyPaxDeatils = [];
          if (addonselement?.paxDetails?.length > 0) {
            for (let index = 0; index < addonselement?.paxDetails?.length; index++) {
              const element = addonselement?.paxDetails[index];
              const data = {
                paxNo: element.paxNo,
                selectedAllGroup: 'Select All',
                paxType: element.paxType,
                bindLablePaxType: element.paxType,
                paxRefence: 0,
              };
              modifyPaxDeatils.push(data);
            }
          }

          const addonsObject = {
            addOnType: {
              name: addonselement.addOnName,
              id: addonselement.addOnId,
              addOnCode: addonselement.addOnCode,
              addOnDescription: addonselement.addOnDescription,
              addOnType: addonselement.addOnType,
            },
            required: false,
            extraCost: addonselement.extraCost,
            remarks: addonselement.remarks,
            requiredRoute: {
              all: true,
              //routes: addonsRoutesData,
              routes: [addonsRoutes],
            },
            requiredPassenger: {
              all: true,
              //passengers: this.addonsPassengers,
              //passengers: addonselement.paxDetails,
              passengers: modifyPaxDeatils,
            },
          };
          this.flightAddons.push(addonsObject);
        }
      }
      flight_pax_Data_info = main_element.flight[0]?.paxInfo === null ? [] : flightelement.paxInfo;
      this.flightSegmentRequestData.push(SEGEMNT_DATA);
      adt = flightelement.adtCount;
      chd = flightelement.chdCount;
      inf = flightelement.infCount;
    }


    const flight_details_data = {
      serviceRequestLine: {
        requestId: Number(this.requestId),
        lPoDate: null,
        lpoAmount: 0.0,
        lpoNumber: 0.0,
        noofADT: adt,
        noofCHD: chd,
        noofINF: inf,
        tripTypeId: 11,
        typeOfFlight: '11',
        connectingDetails: null,
        flexStops: null,
        passengerTypeId: null,
        lineStatusId: null,
        createdBy: this.authService.getUser(),
        createdDate: this.todaydateAndTimeStamp,
        expandableParametersCode: null,
        dealCode: null,
        addons: this.flightAddons,
      },
      serviceRequestSegment:  this.flightSegmentRequestData,
      //segment_pax:flight_pax_info
      //segment_pax: flight_pax_Data_info,
      segment_pax: main_element?.flight[0]?.paxInfo === null ? [] : main_element?.flight[0]?.paxInfo,
    };
    this.flightRequestData.push(flight_details_data);
  }

  hotelRequestDataConversion(main_element: any) {
    let hotel_pax_info: any[] = [];
    if (main_element?.hotel?.length > 0) {
      for (let hotel_index = 0; hotel_index < main_element?.hotel.length; hotel_index++) {
        const hotel_element = main_element?.hotel[hotel_index];
        const location_info =
          hotel_element.hotelCityName +
          ' ' +
          hotel_element.hotelCountryName +
          '(' +
          hotel_element.hotelCountryCode +
          ')';


        if (hotel_element.paxInfo?.length > 0) {
          for (let sub_index = 0; sub_index < hotel_element?.paxInfo?.length; sub_index++) {
            const hotel_pax_sub_element = hotel_element?.paxInfo[sub_index];
            const pax_info = {
              passengerSrId: Number(this.requestId),
              passengerStatus: 0,
              passengerAddonsRequired: 0,
              passengerPaxId: hotel_pax_sub_element.paxId,
              passengerTitle: hotel_pax_sub_element.prefix,
              passengerFirstName: hotel_pax_sub_element.firstName,
              passengerLastName: hotel_pax_sub_element.lastName,
              passengerMiddleName: null,
              passengerDob: hotel_pax_sub_element.dob,
              passengerNationality: hotel_pax_sub_element.nationality,
              //nationlaityName:hotel_pax_sub_element.nationlaityName,
              passengerCoutry: hotel_pax_sub_element.issuedCountry,
              // issuedCountryName:hotel_pax_sub_element.issuedCountryName,
              //passport:hotel_pax_sub_element.passport,
              passengerEmail: hotel_pax_sub_element.email,
              passengerPhone: hotel_pax_sub_element.phone,
              passengerType: hotel_pax_sub_element.paxType,
              passengerAttr1: hotel_pax_sub_element.paxCode,
              //passportExpiredDate:hotel_pax_sub_element.passportExpiredDate,
              //passportIssueDate:hotel_pax_sub_element.passportIssueDate,
              passengerCreatedDate: this.todaydateAndTimeStamp,
              passengerCreatedBy: this.authService.getUser(),
              passengerCreatedIp: null,
              passengerCreatedDevice: this.deviceInfo?.userAgent,
            };
            hotel_pax_info.push(pax_info);
          }
        }
        let room_array: any[] = [];
        let totalAdultsCount = 0;
        let totalCHDCount = 0;
        let totalINFCount = 0;

        if (hotel_element?.roomsInfo?.length > 0) {
          for (let index = 0; index < hotel_element?.roomsInfo.length; index++) {
            const roomCountElement = hotel_element?.roomsInfo[index];
            totalAdultsCount += roomCountElement.roomAdultCount;
            totalCHDCount += roomCountElement.roomChildCount;
            totalINFCount += roomCountElement.roomInfantCount;
            const roomsInfoData = {
              //id:'',
              roomSrId: Number(this.requestId),
              //roomNumber: hotelelement?.roomNumber === ""?0:Number(hotelelement?.roomNumber),
              roomNumber: index + 1,
              roomAddonsRequired: 0,
              roomAdultCount: roomCountElement.roomAdultCount,
              roomChildCount: roomCountElement.roomChildCount,
              roomInfantCount: roomCountElement.roomInfantCount,
              roomChildAges: roomCountElement.roomChildAges,
              roomStatus: 0,
              roomCreatedIp: null,
              roomCreatedBy: this.authService.getUser(),
              roomCreatedDate: this.todaydateAndTimeStamp,
              roomCreatedDevice: this.deviceInfo?.userAgent,
              roomPassengersInfo: hotel_pax_info,
            };
            room_array.push(roomsInfoData);
          }
        } else {
          totalAdultsCount = hotel_element.adtCount;
          totalCHDCount = hotel_element.chdCount + hotel_element.infCount;
          //totalINFCount = hotel_element.infCount;
          totalINFCount = 0;
          let noRoomAdtCount = 0;
          let noRoomChdCount = 0;
          let noRoomInfCount = 0;
          if (hotel_element.paxInfo?.length > 0) {
            const groupByCategory = hotel_element.paxInfo?.reduce((group, product) => {
              const { paxCode } = product;
              group[paxCode] = group[paxCode] ?? [];
              group[paxCode].push(product);
              return group;
            }, {});

            if (groupByCategory?.Adult?.length > 0) {
              noRoomAdtCount = groupByCategory?.Adult?.length;
            } else {
              noRoomAdtCount = 0;
            }
            if (groupByCategory?.Child?.length > 0) {
              noRoomChdCount = groupByCategory?.Child?.length;
            } else {
              noRoomChdCount = 0;
            }
            if (groupByCategory?.Infant?.length > 0) {
              noRoomInfCount = groupByCategory?.Infant?.length;
            } else {
              noRoomInfCount = 0;
            }
          } else {
            noRoomAdtCount = hotel_element.adtCount;
            noRoomChdCount = hotel_element.chdCount;
          }

          const roomsInfoData = {
            //id:'',
            roomSrId: Number(this.requestId),
            //roomNumber: hotelelement?.roomNumber === ""?0:Number(hotelelement?.roomNumber),
            roomNumber: 1,
            roomAddonsRequired: 0,
            roomAdultCount: noRoomAdtCount,
            roomChildCount: noRoomChdCount,
            roomInfantCount: noRoomInfCount,
            roomChildAges: null,
            roomStatus: 0,
            roomCreatedIp: null,
            roomCreatedBy: this.authService.getUser(),
            roomCreatedDate: this.todaydateAndTimeStamp,
            roomCreatedDevice: this.deviceInfo?.userAgent,
            roomPassengersInfo: hotel_pax_info,
          };
          room_array.push(roomsInfoData);
        }
        let room_Addons_array: any[] = [];
        if (hotel_element?.addOns?.length > 0) {
          for (let hotelAddonsindex = 0; hotelAddonsindex < hotel_element?.addOns?.length; hotelAddonsindex++) {
            const hotelAddonselement = hotel_element?.addOns[hotelAddonsindex];
            let roomsPax = [];
            if (hotel_element?.roomsInfo?.length > 0) {
              for (let index = 0; index < hotel_element?.roomsInfo.length; index++) {
                const element = hotel_element?.roomsInfo[index];
                const roomNumber = index + 1;
                if (hotelAddonselement?.paxDetails?.length > 0) {
                  for (
                    let hotelAddonselementIndex = 0;
                    hotelAddonselementIndex < hotelAddonselement?.paxDetails?.length;
                    hotelAddonselementIndex++
                  ) {
                    const element = hotelAddonselement?.paxDetails[hotelAddonselementIndex];
                    const paxType = element.paxType.split('-')[0];

                    const roomPax = hotelAddonselementIndex + 1;
                    switch (paxType) {
                      case 'ADT':
                        roomsPax?.push('Room-' + roomNumber + '-Adult-' + roomPax);
                        break;
                      case 'CHD':
                        roomsPax?.push('Room-' + roomNumber + '-Child-' + roomPax);
                        break;
                      /*  case 'INF':
                        roomsPax?.push('Room-' + index+1 + '-Adult-' + roomPax)
                          break; */
                      default:
                        roomsPax = [];
                        console.log('No such paxType exists!');
                        break;
                    }
                  }
                }
              }
            }
            let roomNights = [];
            if (hotel_element.noOfDays > 0) {
              for (let roomNightsIndex = 1; roomNightsIndex <= hotel_element.noOfDays; roomNightsIndex++) {
                roomNights.push(roomNightsIndex);
              }
            }

            const hotelAddonsobject = {
              addonSrId: Number(this.requestId),
              roomsCount: hotel_element?.roomsCount,
              addonLineId: 0,
              addonRoomId: 0,
              addonTitle: hotelAddonselement?.addOnName,
              addonPassengerId: 0,
              addonPassengers: null,
              //addonPassengers: roomsPax?.length===0?null: roomsPax?.toString(),
              addonWithBooking: 0,
              addonCount: hotelAddonselement?.paxCount,
              addonNights: roomNights?.length === 0 ? null : roomNights?.toString(),
              addonRemarks: hotelAddonselement?.remarks,
              addonRequired: 0,
              addonExtraCost: hotelAddonselement?.extraCost === true ? 1 : 0,
              addonStatus: 0,
              addonSubType: null,
              addonSubTypeId: 0,
              addonType: null,
              addonTypeId: 0,
              addonDescription: null,
              addonCreatedBy: this.authService.getUser(),
              addonCreatedDate: this.todaydateAndTimeStamp,
              addonCreatedDevice: this.deviceInfo?.userAgent,
              addonCreatedIp: null,
            };
            this.hotelAddons.push(hotelAddonsobject);
            room_Addons_array.push(hotelAddonsobject);
          }
        }
        const hotel_info_data = {
          srLine: {
            lineLatitude: '',
            lineLongitude: '',
            lineRadius: '',
            lineSrId: Number(this.requestId),
            lineCountry: '',
            lineCity: '',
            lineLocation: location_info,
            lineHotelName: '',
            linePropertyType: '',
            lineMealType: '',
            lineCheckInDate: hotel_element.checkInDate,
            lineCheckOutDate: hotel_element.checkOutDate,
            lineNoOfNights: hotel_element.noOfDays,
            lineRoomCount:
              hotel_element.roomsCount === null ||
              hotel_element.roomsCount === undefined ||
              hotel_element.roomsCount === ''
                ? 1
                : hotel_element.roomsCount,
            lineCountryResidency: '',
            lineNationality: '',
            lineRatings: Number(hotel_element?.hotelRating),
            lineMarkUpType: 'P',
            lineMarkupAmount: null,
            lineMarkupPercentage: null,
            //lineAdultCount: hotel_element?.adtCount,
            //lineChildCount: hotel_element?.chdCount,
            //lineInfantCount: hotel_element?.infCount,

            lineAdultCount: totalAdultsCount,
            lineChildCount: totalCHDCount,
            lineInfantCount: totalINFCount,
            lineTotalDays: hotel_element.noOfDays,
            //lineSearchType: null,
            lineSearchType: 'Normal',
            lineAddonsRequired: 0,
            lineApis: '',
            lineCreatedBy: this.authService.getUser(),
            lineCreatedDate: this.todaydateAndTimeStamp,
            lineCreatedDevice: this.deviceInfo?.userAgent,
            lineCreatedIp: null,
            lpoDate: null,
            lpoAmount: null,
            lpoNumber: null,
          },
          srRooms: room_array,
          srRoomAddons: room_Addons_array,
        };
        this.hotelRequestData.push(hotel_info_data);
      }

      this.hotelRequestData = this.hotelRequestData?.filter(
        (hotelElement, index, array) =>
          index === array?.findIndex((p) => p?.srLine?.lineLocation === hotelElement?.srLine?.lineLocation)
      );
    }
  }
  attractionRequestDataConversion(main_element: any) {
    if (main_element.attraction?.length > 0) {
      let attractions_lines: any[] = [];
      for (let attractions_index = 0; attractions_index < main_element.attraction?.length; attractions_index++) {
        const attractions_element = main_element.attraction[attractions_index];
        let attractions_pax: any[] = [];
        if (attractions_element?.paxDetails?.length > 0) {
          let attractionsPax = [];
          attractionsPax = attractions_element.paxDetails?.map((item) => {
            if (item?.paxType?.split('-')[0] === 'ADT') {
              const pax = {
                paxCode: 'Adult',
                assign: Number(item.paxType?.split('-')[1]),
              };
              return pax;
            }
            if (item?.paxType?.split('-')[0] === 'CHD') {
              const pax = {
                paxCode: 'Child',
                assign: Number(item.paxType?.split('-')[1]),
              };
              return pax;
            }
            if (item?.paxType?.split('-')[0] === 'INF') {
              const pax = {
                paxCode: 'Infant',
                assign: Number(item.paxType?.split('-')[1]),
              };
              return pax;
            }
          });
          //console.log('attractionsPax',attractionsPax);
          let anxPax = [];
          if (this.previewPackageList?.packagePaxDetails?.length > 0) {
            anxPax = this.previewPackageList.packagePaxDetails?.filter((v) => {
              for (let index = 0; index < attractionsPax?.length; index++) {
                if (v.assign === attractionsPax[index]?.assign && v.paxCode === attractionsPax[index]?.paxCode) {
                  return v;
                }
              }
            });
          }

          if (anxPax?.length > 0) {
            for (let index = 0; index < anxPax?.length; index++) {
              const sub_element = anxPax[index];
              const attractions_pax_info = {
                attractionLinePassengerDob: sub_element.dob === null ? null : sub_element.dob,
                attractionLinePassengerEmail: sub_element.email,
                attractionLinePassengerFristName: sub_element.firstName,
                attractionLinePassengerGender: null,
                attractionLinePassengerLastName: sub_element.lastName,
                attractionLinePassengerMiddleName: null,
                attractionLinePassengerPhone: sub_element.phone,
                attractionLinePassengerTitle: sub_element.prefix,
                attractionLinePassengerType: sub_element.paxCode,
                attractionLinePaxId: sub_element.paxId,
              };
              attractions_pax.push(attractions_pax_info);
            }
          }
        }

        const attractionsLines = {
          attractionId: attractions_element.attractionID,
          attractionLineCity: attractions_element.city,
          attractionLineCountry: attractions_element.country,
          attractionLineDate: attractions_element.date,
          attractionLineDay: 0,
          attractionLineLocation:
            attractions_element.location === null ? attractions_element.city : attractions_element.location,
          attractionLineName: attractions_element.attractionName,
          attractionLinePaxCount: attractions_element.paxCount === null ? 0 : attractions_element.paxCount,
          //passengers:attractions_element.paxDetails
          passengers: attractions_pax,
        };

        attractions_lines.push(attractionsLines);
      }
      if (attractions_lines?.length > 0) {
        for (let index = 0; index < attractions_lines?.length; index++) {
          const element = attractions_lines[index];
          const attraction_info_data = {
            attractionAttribute1: 'string',
            attractionAttribute2: 'string',
            attractionAttribute3: 'string',
            attractionCreatedBy: this.authService.getUser(),
            attractionCreatedDevice: this.deviceInfo?.userAgent,
            attractionCreatedIp: 'string',
            attractionDescription: 'string',
            attractionName: element.attractionLineName,
            attractionRequestId: Number(this.requestId),
            lines: [element],
          };
          this.attractionRequestData.push(attraction_info_data);
        }
      }
    }
  }

  anxPaxGrouping(paxInfo: any) {
    const groupByCategory = paxInfo?.reduce((group, product) => {
      const { paxCode } = product;
      group[paxCode] = group[paxCode] ?? [];
      group[paxCode].push(product);
      return group;
    }, {});

    if (groupByCategory?.Adult?.length > 0) {
      this.anxAdt = groupByCategory?.Adult?.length;
    } else {
      this.anxAdt = 0;
    }
    if (groupByCategory?.Child?.length > 0) {
      this.anxChd = groupByCategory?.Child?.length;
    } else {
      this.anxChd = 0;
    }
    if (groupByCategory?.Infant?.length > 0) {
      this.anxInf = groupByCategory?.Infant?.length;
    } else {
      this.anxInf = 0;
    }
  }

  ancillaryRequestDataConversion(main_element: any) {
    let attractionsPax = [];
    if (main_element?.ancillary?.length > 0) {
      for (let attractionindex = 0; attractionindex < main_element?.ancillary?.length; attractionindex++) {
        const attractionElement = main_element?.ancillary[attractionindex];
        if (attractionElement?.paxDetails?.length > 0) {
          attractionsPax = attractionElement?.paxDetails?.map((item) => {
            if (item?.paxType?.split('-')[0] === 'ADT') {
              const pax = {
                paxCode: 'Adult',
                assign: Number(item.paxType?.split('-')[1]),
              };
              return pax;
            }
            if (item?.paxType?.split('-')[0] === 'CHD') {
              const pax = {
                paxCode: 'Child',
                assign: Number(item.paxType?.split('-')[1]),
              };
              return pax;
            }
            if (item?.paxType?.split('-')[0] === 'INF') {
              const pax = {
                paxCode: 'Infant',
                assign: Number(item.paxType?.split('-')[1]),
              };
              return pax;
            }
          });
        }

        //if(main_element?.paxInfo?.length>0){
        let anxPax = [];
        if (this.previewPackageList.packagePaxDetails?.length > 0) {
          anxPax = this.previewPackageList.packagePaxDetails?.filter((v) => {
            for (let index = 0; index < attractionsPax?.length; index++) {
              if (v.assign === attractionsPax[index]?.assign && v.paxCode === attractionsPax[index]?.paxCode) {
                return v;
              }
            }
          });
          this.anxPaxRequestData = anxPax;
          let anxRequestObject = {};
          if(attractionElement?.dynamicTabData?.length>0){
            for (let index = 0; index < attractionElement?.dynamicTabData.length; index++) {
             const element = attractionElement?.dynamicTabData[index];
             const updatedJson = { ...element };
             delete updatedJson.segmentIndex;
             delete updatedJson.srNumber;
             delete updatedJson.pax;
             delete updatedJson.adt;
             delete updatedJson.child;
             delete updatedJson.inf;
             anxRequestObject= {
               anx:{
                 anxLineId: 0,
                 anxLineAddons: {},
                 anxLineAdtCount: element.adt,
                 anxLineAttr1: '',
                 anxLineAttr2: '',
                 anxLineAttr3: '',
                 anxLineAttr4: '',
                 anxLineAttr5: '',
                 anxLineAttr6: '',
                 anxLineChdCount: element.child,
                 anxLineInfCount: element.inf,
                 anxLineJson: updatedJson,
                 anxLineLpoAmount: 0,
                 anxLineLpoDate: '',
                 anxLineLpoNumber: '',
                 anxLineRequestId: Number(this.requestId), // request id
                 lineUuid: 0,
                 anxLineStatus: 0,
                 anxLineType: attractionElement.addOnName,
                 anxLineTypeId: attractionElement.addOnId, //serviceTypeId
                 deviceInfo: this.deviceInfo?.userAgent,
                 deviceIp: null,
                 loggedInUserId: this.authService.getUser(),
               },
               paxInfo: this.anxPaxRequestData,
             };

             this.ancillaryRequestData.push(anxRequestObject);
            }
        }else if (attractionElement?.paxCount > 0) {
            //this.anxPaxGrouping(anxPax);
            this.anxPaxGrouping(attractionsPax);
            anxRequestObject = {
              anx: {
                anxLineId: 0,
                anxLineAddons: {},
                anxLineAdtCount: this.anxAdt,
                anxLineAttr1: '',
                anxLineAttr2: '',
                anxLineAttr3: '',
                anxLineAttr4: '',
                anxLineAttr5: '',
                anxLineAttr6: '',
                anxLineChdCount: this.anxChd,
                anxLineInfCount: this.anxInf,
                anxLineJson:{},
                anxLineLpoAmount: 0,
                anxLineLpoDate: '',
                anxLineLpoNumber: '',
                anxLineRequestId: Number(this.requestId), // request id
                lineUuid: 0,
                anxLineStatus: 0,
                anxLineType: attractionElement.addOnName,
                anxLineTypeId: attractionElement.addOnId, //serviceTypeId
                deviceInfo: this.deviceInfo?.userAgent,
                deviceIp: null,
                loggedInUserId: this.authService.getUser(),
              },
              paxInfo: this.anxPaxRequestData,
            };
            this.ancillaryRequestData.push(anxRequestObject);
          } else {
            this.anxAdt = 0;
            this.anxChd = 0;
            this.anxInf = 0;
            anxRequestObject = {
              anx: {
                anxLineId: 0,
                //anxLineId: 0,
                anxLineAddons: {},
                anxLineAdtCount: this.anxAdt,
                anxLineAttr1: '',
                anxLineAttr2: '',
                anxLineAttr3: '',
                anxLineAttr4: '',
                anxLineAttr5: '',
                anxLineAttr6: '',
                anxLineChdCount: this.anxChd,
                anxLineInfCount: this.anxInf,
                anxLineJson: {},
                anxLineLpoAmount: 0,
                anxLineLpoDate: '',
                anxLineLpoNumber: '',
                anxLineRequestId: Number(this.requestId), // request id
                lineUuid: 0,
                anxLineStatus: 0,
                anxLineType: attractionElement.addOnName,
                anxLineTypeId: attractionElement.addOnId, //serviceTypeId
                deviceInfo: this.deviceInfo?.userAgent,
                deviceIp: null,
                loggedInUserId: this.authService.getUser(),
              },
              paxInfo: [],
            };
            this.ancillaryRequestData.push(anxRequestObject);
          }

        } else {
          let anxRequestObject = {};
          if(attractionElement?.dynamicTabData?.length>0){
            for (let index = 0; index < attractionElement?.dynamicTabData.length; index++) {
             const element = attractionElement?.dynamicTabData[index];
             const updatedJson = { ...element };
             delete updatedJson.segmentIndex;
             delete updatedJson.srNumber;
             delete updatedJson.pax;
             delete updatedJson.adt;
             delete updatedJson.child;
             delete updatedJson.inf;
             anxRequestObject= {
               anx:{
                 anxLineId: 0,
                 anxLineAddons: {},
                 anxLineAdtCount: element.adt,
                 anxLineAttr1: '',
                 anxLineAttr2: '',
                 anxLineAttr3: '',
                 anxLineAttr4: '',
                 anxLineAttr5: '',
                 anxLineAttr6: '',
                 anxLineChdCount: element.child,
                 anxLineInfCount: element.inf,
                 anxLineJson: updatedJson,
                 anxLineLpoAmount: 0,
                 anxLineLpoDate: '',
                 anxLineLpoNumber: '',
                 anxLineRequestId: Number(this.requestId), // request id
                 lineUuid: 0,
                 anxLineStatus: 0,
                 anxLineType: attractionElement.addOnName,
                 anxLineTypeId: attractionElement.addOnId, //serviceTypeId
                 deviceInfo: this.deviceInfo?.userAgent,
                 deviceIp: null,
                 loggedInUserId: this.authService.getUser(),
               },
               paxInfo: [],
             };
             this.ancillaryRequestData.push(anxRequestObject);
            }
        }else if (attractionElement?.paxCount > 0) {
            this.anxPaxGrouping(attractionsPax);
            anxRequestObject = {
              anx: {
                anxLineId: 0,
                anxLineAddons: {},
                anxLineAdtCount: this.anxAdt,
                anxLineAttr1: '',
                anxLineAttr2: '',
                anxLineAttr3: '',
                anxLineAttr4: '',
                anxLineAttr5: '',
                anxLineAttr6: '',
                anxLineChdCount: this.anxChd,
                anxLineInfCount: this.anxInf,
                anxLineJson: {},
                anxLineLpoAmount: 0,
                anxLineLpoDate: '',
                anxLineLpoNumber: '',
                anxLineRequestId: Number(this.requestId), // request id
                lineUuid: 0,
                anxLineStatus: 0,
                anxLineType: attractionElement.addOnName,
                anxLineTypeId: attractionElement.addOnId, //serviceTypeId
                deviceInfo: this.deviceInfo?.userAgent,
                deviceIp: null,
                loggedInUserId: this.authService.getUser(),
              },
              paxInfo: [],
            };
            this.ancillaryRequestData.push(anxRequestObject);
          } else {
            this.anxAdt = 0;
            this.anxChd = 0;
            this.anxInf = 0;
            anxRequestObject = {
              anx: {
                anxLineId: 0,
                //anxLineId: 0,
                anxLineAddons: {},
                anxLineAdtCount: this.anxAdt,
                anxLineAttr1: '',
                anxLineAttr2: '',
                anxLineAttr3: '',
                anxLineAttr4: '',
                anxLineAttr5: '',
                anxLineAttr6: '',
                anxLineChdCount: this.anxChd,
                anxLineInfCount: this.anxInf,
                anxLineJson: {},
                anxLineLpoAmount: 0,
                anxLineLpoDate: '',
                anxLineLpoNumber: '',
                anxLineRequestId: Number(this.requestId), // request id
                lineUuid: 0,
                anxLineStatus: 0,
                anxLineType: attractionElement.addOnName,
                anxLineTypeId: attractionElement.addOnId, //serviceTypeId
                deviceInfo: this.deviceInfo?.userAgent,
                deviceIp: null,
                loggedInUserId: this.authService.getUser(),
              },
              paxInfo: [],
            };
            this.ancillaryRequestData.push(anxRequestObject);
          }

        }
        //}
      }
    }
  }

  flightPaxDataConversion(paxInfo: any) {
    let passengerData: any[] = [];
    for (let index = 0; index < paxInfo?.length; index++) {
      const element = paxInfo[index];
      const pax_info = {
        paxId: element.paxId,
        prefix: element.prefix,
        firstName: element.firstName,
        lastName: element.lastName,
        dob: element.dob,
        nationality: element.nationality,
        nationalityName: element.nationlaityName,
        issuedCountry: element.issuedCountry,
        issuedCountryName: element.issuedCountryName,
        passport: element.passport,
        email: element.email,
        phone: element.phone,
        paxType: element.paxType,
        paxCode: element.paxCode,
        passportExpiredDate: element.passportExpiredDate,
        passportIssueDate: element.passportIssueDate,
        //requestLinePaxId:pax_sub_element.requestLinePaxId,
        createdDate: this.todaydateAndTimeStamp,
      };
      passengerData.push(pax_info);
    }

    return passengerData;
  }

  flightSrSummaryDataConversion(flightHeaderAndSegements: any, data: any) {
    if (flightHeaderAndSegements && data && this.contactDetails) {
      const total: number =
        Number(flightHeaderAndSegements?.serviceRequestLine?.noofADT) +
        Number(flightHeaderAndSegements?.serviceRequestLine?.noofCHD) +
        Number(flightHeaderAndSegements?.serviceRequestLine?.noofINF);
      const productName = 'Flight';
      const flightdata = this.productList?.find((con) => con.name === productName);
      const SUMMARYDATA = {
        contactEmail: this.contactDetails?.contact?.primaryEmail,
        contactId: this.contactDetails?.contact?.id,
        contactName: this.contactDetails?.contact?.firstName + ' ' + this.contactDetails?.contact?.lastName,
        contactPhone: this.contactDetails?.contact?.primaryPhoneNumber,
        deviceInfo: this.deviceInfo?.userAgent,
        loggedInUserId: this.authService.getUser(),
        passengerCount: Number(total),
        productId: flightdata?.id === undefined ? 1 : flightdata?.id,
        serviceRequestId: Number(this.requestId),
        serviceRequestLineId: data?.serviceRequestLine?.requestLineId,
        travelDateOrCheckInDate: flightHeaderAndSegements?.serviceRequestSegment[0]?.depatureDate,
      };

      return SUMMARYDATA;
    }
  }

  flightResourceDataConversion(flightHeaderAndSegements: any, data: any) {
    const cabinClassId = this.masterClassList?.find(
      (con) => con?.code === flightHeaderAndSegements?.serviceRequestSegment[0]?.className
    );
    const productName = 'Flight';
    const flightdata = this.productList?.find((con) => con?.name === productName);
    let segmentsArray = [];
    for (let index = 0; index < flightHeaderAndSegements?.serviceRequestSegment?.length; index++) {
      //const element = Data.serviceRequestSegment[index];
      const segmentsData = {
        fromCity: flightHeaderAndSegements.serviceRequestSegment[index]?.fromCode,
        toCity: flightHeaderAndSegements.serviceRequestSegment[index]?.toCode,
        marketingCarrier: flightHeaderAndSegements.serviceRequestSegment[index]?.airlineCode,
        operatingCarrier: flightHeaderAndSegements.serviceRequestSegment[index]?.airlineCode,
      };
      segmentsArray.push(segmentsData);
    }

    const customerDetailsBySrId = this.authService.getCustomerType();
    const total: number =
      Number(flightHeaderAndSegements?.serviceRequestLine?.noofADT) +
      Number(flightHeaderAndSegements?.serviceRequestLine?.noofCHD) +
      Number(flightHeaderAndSegements?.serviceRequestLine?.noofINF);
    const flightResourceData = {
      productId: flightdata?.id === undefined ? 1 : flightdata?.id,
      bookingTypeId: 1,
      cabinClassId: cabinClassId?.id === undefined ? 3 : cabinClassId?.id,
      paxCount: Number(total),
      typeOfJourneyId: flightHeaderAndSegements?.serviceRequestLine?.tripTypeId,
      //hotelNoOfDays: 0,
      //hotelDestination: null,
      //hotelRoomsCount: 0,
      //hotelNightsCount: 0,
      srId: Number(this.requestId),
      //srLineId:Number(this.srLineId),
      srLineId: data?.serviceRequestLine?.requestLineId,
      budgetAmount: 0,
      companyId: this.authService.getUserOrganization(),
      locationId: this.authService.getUserLocation(),
      costCenterId: this.authService.getUserCostCenter(),
      userId: this.authService.getUser(),
      customerId: customerDetailsBySrId?.customerId,
      customerCategoryId: customerDetailsBySrId?.custcategoryId,
      customerRatingId: customerDetailsBySrId?.customerRating,
      customerTypeId: customerDetailsBySrId?.customerTypeId,
      ticketType: 'ticket',
      segments: segmentsArray,
    };
    return flightResourceData;
  }



  hotelResourcesAssignmentHotel(formData: any, data: any) {
    const HOTELFORMDATA = formData?.srLine;
    const productName = 'Hotel';
    const hoteldata = this.productList?.find((con) => con.name === productName);
    const customerDetailsBySrId = this.authService.getCustomerType();
    if (HOTELFORMDATA) {
      const sendData = {
        productId: hoteldata?.id === undefined ? 2 : hoteldata?.id,
        bookingTypeId: 1,
        cabinClassId: 0,
        paxCount: 0,
        typeOfJourneyId: 0,
        hotelNoOfDays: parseInt(HOTELFORMDATA?.lineTotalDays),
        hotelDestination: HOTELFORMDATA?.lineLocation,
        hotelRoomsCount: parseInt(HOTELFORMDATA?.lineRoomCount),
        hotelNightsCount: parseInt(HOTELFORMDATA?.lineNoOfNights),
        srId: Number(this.requestId),
        srLineId: data?.srLine?.id,
        budgetAmount: 0,
        companyId: this.authService.getUserOrganization(),
        locationId: this.authService.getUserLocation(),
        costCenterId: this.authService.getUserCostCenter(),
        userId: this.authService.getUser(),
        customerId: customerDetailsBySrId?.customerId,
        customerCategoryId: customerDetailsBySrId?.custcategoryId,
        customerRatingId: customerDetailsBySrId?.customerRating,
        customerTypeId: customerDetailsBySrId?.customerTypeId,
        ticketType: 'ticket',
        segments: [],
      };
      return sendData;
    }
  }

  hotelSrSummayHotelData(formData: any, data: any) {
    if (this.contactDetails && formData && data) {
      const productName = 'Hotel';
      const hoteldata = this.productList?.find((con) => con.name === productName);
      const total: number = Number(formData.srRooms?.roomAdultCount) + Number(formData.srRooms?.roomChildCount);
      const SUMMARYDATA = {
        contactEmail: this.contactDetails?.contact?.primaryEmail,
        contactId: this.contactDetails?.contact?.id,
        contactName: this.contactDetails?.contact?.firstName + ' ' + this.contactDetails?.contact?.lastName,
        contactPhone: this.contactDetails?.contact?.primaryPhoneNumber,
        deviceInfo: this.deviceInfo?.userAgent,
        loggedInUserId: this.authService.getUser(),
        passengerCount: Number(total),
        productId: hoteldata?.id,
        serviceRequestId: this.contactDetails?.requestId,
        serviceRequestLineId: data?.srLine?.id,
        travelDateOrCheckInDate: formData?.srLine.lineCheckInDate,
      };

      return SUMMARYDATA;
    }
  }




  saveAttractionsSrSummayData(attractionLineId:number,attractionsPaxCount:number) {

    if (this.contactDetails&&attractionLineId) {
      const productName = 'Attraction';
      const anxProductNumber=  this.productList?.find((con) => con.name === productName);
      const SUMMARYDATA = {
        contactEmail: this.contactDetails?.contact?.primaryEmail,
        contactId: this.contactDetails?.contact?.id,
        contactName: this.contactDetails?.contact?.firstName + ' ' + this.contactDetails?.contact?.lastName,
        contactPhone: this.contactDetails?.contact?.primaryPhoneNumber,
        deviceInfo: this.deviceInfo?.userAgent,
        loggedInUserId: this.authService.getUser(),
        passengerCount: attractionsPaxCount,
        productId: anxProductNumber?.id === undefined ?4:anxProductNumber?.id ,
        serviceRequestId: this.contactDetails?.requestId,
        serviceRequestLineId: attractionLineId,
        travelDateOrCheckInDate: null,
      };
      this.dashboardRequestService.saveSrSummary(SUMMARYDATA, SrSummaryData.SAVESRSUMMARYDATA).subscribe((res:any) => {
        const result: ApiResponse = res;
        if (result.status === 200) {
          console.log('attractions  sr summary saved ');

        } else if (result.message === ' ') {
          this.toastrService.error('Oops! Something went wrong  while send the attractions sr summary data please try again', 'Error', {
            progressBar: true,
          });
        } else {
          this.toastrService.error(result.message, 'Error', { progressBar: true });
        }
      });
    }
  }


  saveAnxSrSummayData(anxLineId:number,anxValues:any) {
    if (this.contactDetails&&anxLineId) {
      const productName = 'Ancillary';
      const anxProductNumber=  this.productList?.find((con) => con.name === productName);
      const total: number =
        Number(anxValues.anxLineAdtCount) +
        Number(anxValues.anxLineChdCount) +
        Number(anxValues.anxLineInfCount) ;
      const SUMMARYDATA = {
        contactEmail: this.contactDetails?.contact?.primaryEmail,
        contactId: this.contactDetails?.contact?.id,
        contactName: this.contactDetails?.contact?.firstName + ' ' + this.contactDetails?.contact?.lastName,
        contactPhone: this.contactDetails?.contact?.primaryPhoneNumber,
        deviceInfo: this.deviceInfo?.userAgent,
        loggedInUserId: this.authService.getUser(),
        passengerCount: Number(total),
        productId: anxProductNumber?.id === undefined ?3 :anxProductNumber?.id ,
        serviceRequestId: this.contactDetails?.requestId,
        serviceRequestLineId: anxLineId,
        travelDateOrCheckInDate: null,

      };
      this.dashboardRequestService.saveSrSummary(SUMMARYDATA, SrSummaryData.SAVESRSUMMARYDATA).subscribe((res:any) => {
        const result: ApiResponse = res;
        if (result.status === 200) {
          console.log('anx sr summary saved ');

        } else if (result.message === ' ') {
          this.toastrService.error('Oops! Something went wrong  while send the anx sr summary data please try again', 'Error', {
            progressBar: true,
          });
        } else {
          this.toastrService.error(result.message, 'Error', { progressBar: true });
        }
      });
    }
  }


  anxPaxDataConversion(anxPax: any) {
    let convertPax = [];
    if (anxPax?.length > 0) {
      for (let r = 0; r < anxPax?.length; r++) {
        const element = anxPax[r];
        const nationality = {
          id: element.nationality,
          name: element.nationlaityName,
        };
        const issuedCountry = {
          id: element.issuedCountry,
          name: element.issuedCountryName,
        };
        const pax = {
          prefix: element.prefix,
          firstName: element.firstName,
          lastName: element.lastName,
          dob: element.dob,
          nationality: nationality === undefined || nationality?.id === null ? null : nationality?.id,
          //nationality: res[r].nationality?.id,
          nationalityName: nationality?.name === undefined || nationality?.name === null ? null : nationality?.name,
          issuedCountry: issuedCountry?.id === undefined || issuedCountry?.id === null ? null : issuedCountry?.id,
          issuedCountryName:
            issuedCountry?.name === undefined || issuedCountry?.name === null ? null : issuedCountry?.name,
          passport: element.passport,
          email: element.email,
          phone: element.phone,
          paxType: element.paxType,
          passportExpiredDate: element.passportExpiredDate,
          passportIssueDate: element.passportIssueDate,
          //requestLinePaxId: element.requestLinePaxId,
          createdDate: this.todaydateAndTimeStamp,
        };
        convertPax.push(pax);
      }
    }

    return convertPax;
  }


  public showSpinner(): void {
    this.spinnerService.show();
    /* setTimeout(() => {
      this.spinnerService.hide();
    }, 5000); // 5 seconds */
  }
  async onCreateServiceRequest() {
    if (this.previewPackageList?.packageLines?.length > 0) {
      this.showSpinner();
      this.requestCreationLoading=true;
      for (let index = 0; index < this.previewPackageList?.packageLines?.length; index++) {
        const main_element = this.previewPackageList?.packageLines[index];
        if (main_element?.flight?.length > 0) {
          this.flightRequestDataConversion(main_element);
        }
        if (main_element?.hotel?.length > 0) {
          this.hotelRequestDataConversion(main_element);
        }
        if (main_element?.attraction?.length > 0) {
          this.attractionRequestDataConversion(main_element);
        }
        if (main_element?.ancillary?.length > 0) {
          this.ancillaryRequestDataConversion(main_element);
        }
      }

     /*  console.log('flightRequestData',this.flightRequestData);
      console.log('hotelRequestData',this.hotelRequestData);
      console.log('attractionRequestData',this.attractionRequestData);
      console.log('ancillaryRequestData',this.ancillaryRequestData);
      this.requestCreationLoading=false;
     return; */
      if (this.flightRequestData?.length > 0) {
        const flightData = this.flightRequestData;
        let flightRequestSubApis = [];
        let flightRequestPax = [];
        let flightRequestSrSummary = [];
        let flightRequestResourcesAssignment = [];
        const saveFlightData = {
          serviceRequestLine: flightData[0]?.serviceRequestLine,
          serviceRequestSegment: flightData[0]?.serviceRequestSegment,
        };


        try{
          const flightRequestResponse = await this.dashboardRequestService
          .createServiceRequestLineSegment(saveFlightData)
          .toPromise();

        if (flightRequestResponse) {
          if (flightData[0]?.segment_pax?.length > 0) {
            const pax = this.flightPaxDataConversion(flightData[0]?.segment_pax);
            const paxPayload = {
              paxData: pax,
              requestId: Number(this.requestId),
              requestLineId: flightRequestResponse?.serviceRequestLine?.requestLineId,
              createdBy: this.authService.getUser(),
              updatedBy: this.authService.getUser(),
            };
            flightRequestPax.push(paxPayload);
            // const flightServiceRequestPax = await  this.dashboardRequestService.createServiceRequestPaxRelation(paxPayload).toPromise();
          } else {
            console.log('no  flight request pax');
          }
          const flightHeaderAndSegements = {
            serviceRequestLine: flightData[0]?.serviceRequestLine,
            serviceRequestSegment: flightData[0]?.serviceRequestSegment,
          };
          // flight sr summary
          if (flightHeaderAndSegements) {
            const flightSrSummary = this.flightSrSummaryDataConversion(flightHeaderAndSegements, flightRequestResponse);
            //console.log('flightResourcesAssignment',flightSrSummary);
            flightRequestSrSummary.push(flightSrSummary);
            //const flightServiceRequestSrSummary = await this.dashboardRequestService.saveSrSummary(flightSrSummary, SrSummaryData.SAVESRSUMMARYDATA).toPromise();
            //console.log("flight sub", subAllRequestsApis.length);
          } else {
            console.log('flight Sr Summary no data');
          }
          //flight resources
          if (flightHeaderAndSegements) {
            const flightResourceData = this.flightResourceDataConversion(flightHeaderAndSegements, flightRequestResponse);
            flightRequestResourcesAssignment.push(flightResourceData);
            //console.log('flightResourceData',flightResourceData);
            // const flightServiceRequestSrSummary = await this.dashboardRequestService.resourcesAssignment(flightResourceData, sr_assignment.flightassignment).toPromise();
            //console.log("flight sub", subAllRequestsApis.length);
          } else {
            console.log('flight Service Request Resources no data');
          }

          if (flightRequestPax?.length > 0) {
            for (let index = 0; index < flightRequestPax.length; index++) {
              const element = flightRequestPax[index];
              flightRequestSubApis.push(this.dashboardRequestService.createServiceRequestPaxRelation(element));
            }
          }
          if (flightRequestSrSummary?.length > 0) {
            for (let index = 0; index < flightRequestSrSummary.length; index++) {
              const element = flightRequestSrSummary[index];
              flightRequestSubApis.push(
                this.dashboardRequestService.saveSrSummary(element, SrSummaryData.SAVESRSUMMARYDATA)
              );
            }
          }

          if (flightRequestResourcesAssignment?.length > 0) {
            for (let index = 0; index < flightRequestResourcesAssignment.length; index++) {
              const element = flightRequestResourcesAssignment[index];
              flightRequestSubApis.push(
                this.dashboardRequestService.resourcesAssignment(element, sr_assignment.flightassignment)
              );
            }
          }
          if (flightRequestSubApis?.length > 0) {
            forkJoin(flightRequestSubApis).pipe(takeUntil(this.ngDestroy$)).subscribe((results) => {
              console.log('flight  sub  apis saved');
            });
          }
        }
        }catch(error){
          this.toastrService.error('Oops! Something went wrong  while send the flight request data please try again', 'Error');
        }

      }
      if (this.hotelRequestData?.length > 0) {
        const hotelRequestData = this.hotelRequestData;
        let saveAddonsArray = [];
        let hotel_SrSummary: any[] = [];
        let hotel_ResourcesAssignmnet_Save: any[] = [];
        let hotelRequestSubApis = [];
        let hotelQueryParams: any[] = [];
        for (let hotel_index = 0; hotel_index < hotelRequestData?.length; hotel_index++) {
          const hotel_save_element = hotelRequestData[hotel_index];

          const hotel_info_data = {
            srLine: {
              lineLatitude: hotel_save_element.srLine.lineLatitude,
              lineLongitude: hotel_save_element.srLine.lineLongitude,
              lineRadius: hotel_save_element.srLine.lineRadius,
              lineSrId: hotel_save_element.srLine.lineSrId,
              lineCountry: hotel_save_element.srLine.lineCountry,
              lineCity: hotel_save_element.srLine.lineCity,
              lineLocation: hotel_save_element.srLine.lineLocation,
              lineHotelName: hotel_save_element.srLine.lineHotelName,
              linePropertyType: hotel_save_element.srLine.linePropertyType,
              lineMealType: hotel_save_element.srLine.lineMealType,
              lineCheckInDate: hotel_save_element.srLine.lineCheckInDate,
              lineCheckOutDate: hotel_save_element.srLine.lineCheckOutDate,
              lineNoOfNights: hotel_save_element.srLine.lineNoOfNights,
              lineRoomCount: hotel_save_element.srLine.lineRoomCount,
              lineCountryResidency: hotel_save_element.srLine.lineCountryResidency,
              lineNationality: hotel_save_element.srLine.lineNationality,
              lineRatings: hotel_save_element.srLine.lineRatings,
              lineMarkUpType: hotel_save_element.srLine.lineMarkUpType,
              lineMarkupAmount: hotel_save_element.srLine.lineMarkupAmount,
              lineMarkupPercentage: hotel_save_element.srLine.lineMarkupPercentage,
              lineAdultCount: hotel_save_element.srLine.lineAdultCount,
              lineChildCount: hotel_save_element.srLine.lineChildCount,
              lineInfantCount: hotel_save_element.srLine.lineInfantCount,
              lineTotalDays: hotel_save_element.srLine.lineTotalDays,
              lineSearchType: hotel_save_element.srLine.lineSearchType,
              lineAddonsRequired: hotel_save_element.srLine.lineAddonsRequired,
              lineApis: hotel_save_element.srLine.lineApis,
              lineCreatedBy: this.authService.getUser(),
              lineCreatedDate: this.todaydateAndTimeStamp,
              lineCreatedDevice: this.deviceInfo?.userAgent,
              lineCreatedIp: null,
              lpoDate: hotel_save_element.srLine.lpoDate,
              lpoAmount: hotel_save_element.srLine.lpoAmount,
              lpoNumber: hotel_save_element.srLine.lpoNumber,
            },
            srRooms: hotel_save_element.srRooms,
            // srRoomAddons:room_Addons_array
          };
          try{
            const hotelRequestResponse = await this.dashboardRequestService
            .createHotelServiceRequest(hotel_info_data, request_hotel_url.createHotel)
            .toPromise();

          hotelQueryParams.push(hotelRequestResponse?.srLine?.id);

          const hotelResouces = this.hotelResourcesAssignmentHotel(hotel_info_data, hotelRequestResponse);
          //const onSaveResourcesAssigment = await this.dashboardRequestService.resourcesAssignment(hotelResouces, sr_assignment.flightassignment).toPromise();
          const hotelSrSummary = this.hotelSrSummayHotelData(hotel_info_data, hotelRequestResponse);
          // const onSaveSrSummary= await  this.dashboardRequestService.saveSrSummary(hotelSrSummary, SrSummaryData.SAVESRSUMMARYDATA).toPromise();
          hotel_SrSummary.push(hotelSrSummary);
          hotel_ResourcesAssignmnet_Save.push(hotelResouces);

          if (hotel_save_element?.srRoomAddons?.length > 0) {
            let hotelRoomQueryParams = [];
            if (hotelRequestResponse?.srRooms?.length > 0) {
              const hotelAddonsRooms = hotelRequestResponse?.srRooms;
              hotelRoomQueryParams = [];
              for (let index = 0; index < hotelAddonsRooms?.length; index++) {
                const element = hotelAddonsRooms[index];
                hotelRoomQueryParams.push(element?.id);
              }
            }
            for (
              let hotelAddonsIndex = 0;
              hotelAddonsIndex < hotel_save_element?.srRoomAddons?.length;
              hotelAddonsIndex++
            ) {
              const hotelAddonsElement = hotel_save_element?.srRoomAddons[hotelAddonsIndex];
              const hotelAddonsobject = {
                addonSrId: Number(this.requestId),
                addonLineId: hotelRequestResponse?.srLine?.id,
                addonRoomId: hotelRoomQueryParams?.toString(),
                addonFor: hotelRoomQueryParams.length > 0 ? 'R' : 'P',
                addonTitle: hotelAddonsElement?.addonTitle,
                addonPassengerId: 0,
                addonPassengers: hotelAddonsElement?.addonPassengers,
                addonWithBooking: 0,
                addonCount: hotelAddonsElement?.addonCount,
                addonNights: hotelAddonsElement.addonNights,
                addonRemarks: hotelAddonsElement?.addonRemarks,
                addonRequired: 0,
                addonExtraCost: hotelAddonsElement?.addonExtraCost === true ? 1 : 0,
                addonStatus: 0,
                addonSubType: null,
                addonSubTypeId: 0,
                addonType: null,
                addonTypeId: 0,
                addonDescription: null,
                addonCreatedBy: this.authService.getUser(),
                addonCreatedDate: this.todaydateAndTimeStamp,
                addonCreatedDevice: this.deviceInfo?.userAgent,
                addonCreatedIp: null,
              };
              saveAddonsArray.push(hotelAddonsobject);
            }
          }
          }catch(error){
            this.toastrService.error('Oops! Something went wrong  while send the hotel request data please try again', 'Error');
          }
        }

        if (saveAddonsArray?.length > 0) {
          for (let index = 0; index < saveAddonsArray?.length; index++) {
            const element = saveAddonsArray[index];
            let saveHotelAddonsArray = [];
            saveHotelAddonsArray.push(element);
            hotelRequestSubApis.push(
              this.dashboardRequestService.createAddons(saveHotelAddonsArray, addons_url.createAddons)
            );
            //const onSaveHotelAddons= await  this.dashboardRequestService.createAddons(saveHotelAddonsArray, addons_url.createAddons).toPromise();
          }
        }

        if (hotel_ResourcesAssignmnet_Save?.length > 0) {
          for (let resourxesindex = 0; resourxesindex < hotel_ResourcesAssignmnet_Save.length; resourxesindex++) {
            const resourceselement = hotel_ResourcesAssignmnet_Save[resourxesindex];
            hotelRequestSubApis.push(
              this.dashboardRequestService.resourcesAssignment(resourceselement, sr_assignment.flightassignment)
            );
          }
        }

        if (hotel_SrSummary?.length > 0) {
          for (let srindex = 0; srindex < hotel_SrSummary.length; srindex++) {
            const srSummaryelement = hotel_SrSummary[srindex];
            hotelRequestSubApis.push(
              this.dashboardRequestService.saveSrSummary(srSummaryelement, SrSummaryData.SAVESRSUMMARYDATA)
            );
          }
        }

        if (hotelRequestSubApis?.length > 0) {
          forkJoin(hotelRequestSubApis).pipe(takeUntil(this.ngDestroy$)).subscribe((results) => {
            console.log('hotel  sub  apis saved');
          });
        }
      }
      if (this.attractionRequestData?.length > 0) {
        for (let index = 0; index < this.attractionRequestData.length; index++) {
         const element = this.attractionRequestData[index];
        try{
          const onSaveAttractions = await this.dashboardRequestService.createPackageItineraryAttractions(element,Holiday_Package.attractionsServiceRequest).toPromise();
          if(onSaveAttractions){
            this.saveAttractionsSrSummayData(onSaveAttractions?.attractionId,0);
          }
        }catch(error){
          this.toastrService.error('Oops! Something went wrong  while send the activities request data please try again', 'Error');
        }
       }
       }
      if (this.ancillaryRequestData?.length > 0) {

        const anxRequest=this.ancillaryRequestData;
        let anxRequestPax=[];
        let anxRequestSubApis=[];
        let anxQueryParams=[];
        for (let anxindex = 0; anxindex < anxRequest?.length; anxindex++) {
          const anxelement = anxRequest[anxindex];
           try{
            const anxRequestResponse:any = await this.serviceTypeService.create(ANX_API.CREATE, anxelement.anx).toPromise();
            this.saveAnxSrSummayData(anxRequestResponse?.anxLineId,anxRequestResponse);
            const pax = this.anxPaxDataConversion(anxelement?.paxInfo);
            anxQueryParams.push(anxRequestResponse?.anxLineId);
            if (pax?.length > 0) {
              const paxPayload = {
                paxData: pax,
                requestId: Number(this.requestId),
                requestLineId: anxRequestResponse?.anxLineId,
                createdBy: this.authService.getUser(),
                updatedBy: this.authService.getUser(),
              };
              anxRequestPax.push(paxPayload);
              //const onSaveAnxRequestPax= await this.serviceTypeService.create(ANX_PAX_API.CREATEMODIFYREQUESTLINEPAX, paxPayload).toPromise();
            }
           }catch(error){
            this.toastrService.error('Oops! Something went wrong  while send the ancillary request data please try again', 'Error');
           }
        }

        if(anxRequestPax?.length>0){
          for (let index = 0; index < anxRequestPax.length; index++) {
            const element = anxRequestPax[index];
            anxRequestSubApis.push(this.serviceTypeService.create(ANX_PAX_API.CREATEMODIFYREQUESTLINEPAX, element));
          }
        }

        if (anxRequestSubApis?.length > 0) {
          forkJoin(anxRequestSubApis).pipe(takeUntil(this.ngDestroy$)).subscribe((results) => {
            console.log('anx  sub  apis saved');
          });
        }


      }
      this.toastrService.success('The service request has been sent successfuly !', 'Success');
      this.requestCreationLoading=false;
      this.navigatedToPackageEditMode('package-holidays-listview');
    }
  }


  dayScrollLeft() {
    this.dayList.nativeElement.scrollLeft -= 100;
  }

  dayScrollRight() {
    this.dayList.nativeElement.scrollLeft += 100;
  }

  showAndHideFlightAddons(index:number){
    this.flightAddonsHide[index]= !this.flightAddonsHide[index];
  }

  showAndHideHotelAddons(index:number){
    this.hotelAddonsHide[index]= !this.hotelAddonsHide[index];

  }


  showAndHidePassenger(index:number){
    this.showAndHidePassengers[index]= !this.showAndHidePassengers[index];
  }
}
