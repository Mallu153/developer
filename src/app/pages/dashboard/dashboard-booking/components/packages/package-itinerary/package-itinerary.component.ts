import { DatePipe, formatDate } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ItineraryHotel } from 'app/pages/dashboard/dashboard-request/model/package-itinerary';
import { Products } from 'app/pages/dashboard/dashboard-request/model/products-data';
import { DashboardRequestService } from 'app/pages/dashboard/dashboard-request/services/dashboard-request.service';
import {
  addons_url,
  Holiday_Package,
  master_data_url,
  request_hotel_url,
  srsearchList_url,
  SrSummaryData,
  sr_assignment,
  SUPPLIPER_URL,
} from 'app/pages/dashboard/dashboard-request/url-constants/url-constants';
import { RfqApiResponse } from 'app/pages/dashboard/rfq/rfq-models/rfq-api-response';
import { SendMessage, WaApiResponse } from 'app/pages/dashboard/rfq/rfq-models/sendMessage';
import { RfqService } from 'app/pages/dashboard/rfq/rfq-services/rfq.service';
import {
  HOTEL_RFQ_LIST,
  RFQAttractions,
  RFQSequenceNo,
  RFQ_Ancillary,
  sendWaMessage,
  whatsAppUrl,
} from 'app/pages/dashboard/rfq/rfq-url-constants/apiurl';
import { ANX_API, ANX_PAX_API } from 'app/pages/dashboard/service-request/constants/anx-api';
import { AuthService } from 'app/shared/auth/auth.service';
import { PERMISSION_KEYS } from 'app/shared/data/app-premission-key';
import { ApiResponse } from 'app/shared/models/api-response';
import { MasterDataService } from 'app/shared/services/master-data.service';
import { ServiceTypeService } from 'app/shared/services/service-type.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, fromEvent, Subject, Subscription } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { ProductsDataService } from '../../../share-data-services/products-data';
import { SrSummaryDataService } from '../../../share-data-services/srsummarydata.service';
import { DashboardBookingAsyncService } from '../../../services/dashboard-booking-async.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-package-itinerary',
  templateUrl: './package-itinerary.component.html',
  styleUrls: ['./package-itinerary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackageItineraryComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  layoutSub: Subscription;
  requestId: number = null;

  PackageDetailedInfo: any = [];
  SubPackageDetailedInfo: any = [];
  flight_data: any[] = [];
  hotel_data: any[] = [];
  attractions_data: any[] = [];
  anxRequestData = [];
  anxPaxRequestData = [];
  hotelAddons = [];

  productList: any;
  masterClassList: any = {};
  //today date
  todayDate = new Date();
  todayDate1: string;
  todaydateAndTimeStamp: string;
  //ipaddress
  deviceInfo = null;

  //supplier details
  public supplierDeatils: any = [];
  isMasterSelected: boolean = false;
  checkedSupplierList: any[] = [];

  showCheckBox: boolean = false;
  submitButton: boolean = true;
  selectedProduct: any[] = [];
  isAllMasterSelected: boolean = false;
  //rfq
  flightRfq: any[] = [];
  hotelRfq: any[] = [];
  attractionsRfq: any[] = [];
  attractionsSupplier: any[] = [];
  attractionsRequestLineid: any;
  addonsPassengers: any = [];
  anxRequestRfq = [];
  anPaxRequestRfq = [];
  //details button variables
  hideme = [];
  anxAdt: number = 0;
  anxChd: number = 0;
  anxInf: number = 0;

  itineraryInfo: any[] = [];

  contactDeatils = [];
  messageModuleID = sendWaMessage.moduleId;
  messageModuleName = sendWaMessage.moduleName;
  loading: boolean = false;
  requestLoading: boolean = false;
  isEdit = false;
  //search setup
  searchText: any;
  //pagination
  page = 1;
  pageSize = 10;
  collectionSize: number;

  srcontactDeatils:any={};
  appendQueryParamsApisResponse: any = {};

   /**
   *
   *
   * package itinerary premissions
   */
   keys = [];
   backBtn = PERMISSION_KEYS.BOOKING.PACKAGE_ITINERARY.PACKAGE_ITINERARY_BACK_BTN;
   rfqPackageListBtn = PERMISSION_KEYS.BOOKING.PACKAGE_ITINERARY.PACKAGE_ITINERARY_RFQ_PACKAGE_LIST_BTN;
   supplierBtn = PERMISSION_KEYS.BOOKING.PACKAGE_ITINERARY.PACKAGE_ITINERARY_GET_SUPPLIER_BTN;
   sendBtn = PERMISSION_KEYS.BOOKING.PACKAGE_ITINERARY.PACKAGE_ITINERARY_SEND_BTN;


   requestCreationLoading:boolean=false;
  constructor(
    private fb: FormBuilder,
    public masterDataService: MasterDataService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private datepipe: DatePipe,
    private titleService: Title,
    private serviceTypeService: ServiceTypeService,
    private srSummaryData: SrSummaryDataService,
    private authService: AuthService,
    private deviceService: DeviceDetectorService,
    private rfqServices: RfqService,
    private dashboardRequestService: DashboardRequestService,
    private productsDataService: ProductsDataService,
    private dashboardAsyncApiServices: DashboardBookingAsyncService,
    private spinnerService: NgxSpinnerService,
  ) {
    this.todaydateAndTimeStamp = formatDate(this.todayDate, 'yyyy-MM-ddThh:mm:ss', 'en-US', '+0530');

  }
  epicFunction() {
    this.deviceInfo = this.deviceService.getDeviceInfo();
  }
 /*  fetchCustomerDetailsBySrId(requestId: number) {
    this.dashboardRequestService
      .getCustomerDetailsBySrId(requestId, master_data_url.fetchCustomerDetailsBySrId)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res: any) => {
        if (res) {
          this.customerDetailsBySrId = res;
          this.authService.setCustomerType(res);
          this.cdr.markForCheck();
        } else {
          this.toastr.error(
            'Oops! Something went wrong while fetching the customer Details please try again  ',
            'Error'
          );
        }
      });
  } */
  /*  getPackageDetailedInfo(requestId: number) {
    this.dashboardRequestService
      .getPackageDetailedInfo(Holiday_Package.packageItinerary, requestId)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res: any) => {
        const result: ApiResponse = res;
        if (result.status === 200) {
          this.PackageDetailedInfo = result.data;
          if(this.PackageDetailedInfo?.length>0){
            this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
              if(param.actionType ==='rfq' &&param.productsAvailability==='true'){
                this.productsDataService.getData().pipe(takeUntil(this.ngDestroy$)).subscribe((res:Products[]) => {
                  if(res?.length>0){
                    let flightRequestLine=[];
                    let hotelSrLine=[];
                    let anxRequestLine=[];
                    let attractionsRequestLines=[];
                    let attractionHeaderID:number;
                    for (let index = 0; index < res?.length; index++) {
                      const element = res[index];
                      if(element.product==='Flight'){
                        flightRequestLine.push(element.serviceRequestLine);
                      }else if(element.product==='Hotel'){
                        hotelSrLine.push(element.serviceRequestLine);
                      }else if(element.product==='Ancillary'){
                        anxRequestLine.push(element.serviceRequestLine);
                      }else if(element.product==="Attractions"){
                        attractionHeaderID=element.serviceRequestLine;
                        attractionsRequestLines=element.classDays?.toString().split(',');
                      }
                    }
                    this.showCheckBox = true;
                    this.submitButton = false;
                    let hotelRequestLine: number[] = [];
                    let attractionsLinesIDs: any[] = [];
                    let anxRequestLineId: any[] = [];
                    hotelRequestLine = hotelSrLine?.sort((a, b) => a - b);
                    anxRequestLineId = anxRequestLine?.sort((a, b) => a - b);
                    attractionsLinesIDs=attractionsRequestLines?.sort((a, b) => a - b);
                    this.attractionsRequestLineid = Number(attractionHeaderID);
                      if (this.PackageDetailedInfo?.length > 0) {
                        //let attractionspax:any=[];
                        this.PackageDetailedInfo?.forEach((mainelement) => {
                          mainelement?.flight?.forEach((flightelement) => {
                            flightelement.flightrequestlineID = flightRequestLine[0];
                            flightelement.isChecked = false;
                            flightelement?.paxInfo?.forEach((flightpaxelement,index) => {
                              flightpaxelement.flightrequestLineId = flightRequestLine[0];
                              //attractionspax=flightpaxelement.paxInfo;
                            });
                           //pax need newadded
                            if(flightelement?.paxInfo === null){
                              flightelement.paxInfo= mainelement?.flight[0]?.paxInfo
                              //flightelement.paxInfo= mainelement?.flight[0]?.paxInfo
                            }
                          });
                          mainelement?.hotels?.forEach((hotelelement, index) => {
                            hotelelement.hotelrequestlineID = hotelRequestLine[index];
                            hotelelement.isChecked = false;
                            //pax need newadded
                            if(hotelelement?.paxInfo === null){
                              hotelelement.paxInfo= mainelement?.hotels[0]?.paxInfo
                              //flightelement.paxInfo= mainelement?.flight[0]?.paxInfo
                            }
                          });
                          mainelement?.attractions?.forEach((attractionselement, index) => {
                            attractionselement.attractionrequestlineID = Number(attractionHeaderID);
                            attractionselement.isChecked = false;
                            attractionselement.attractionLineId = attractionsLinesIDs[index];
                            //attractionselement.paxInfo=attractionspax;

                          });
                          mainelement?.ancillaries?.forEach((ancillarieselement, index) => {
                            ancillarieselement.isChecked = false;
                            ancillarieselement.anxrequestlineID = anxRequestLineId[index];
                          });
                        });
                         this.itineraryDataConvert();
                      }
                  }else {
                    this.showCheckBox = false;
                    this.submitButton = true;
                    this.itineraryDataConvert();
                  }
                });
              }else{
                if(param.actionType ==='rfq'&&param.productsAvailability==='false'){
                  this.onCreateServiceRequest();
                }
                this.showCheckBox = false;
                this.submitButton = true;
                this.modifyData();
              }
            });
          }


          this.cdr.markForCheck();
        } else {
          this.PackageDetailedInfo =[];
          this.toastr.error(result.message, 'Error');
          this.cdr.markForCheck();
        }
      });

  }
 */

  getPackageDetailedInfo(requestId: number) {
    this.dashboardRequestService
      .getPackageDetailedInfo(Holiday_Package.packageItinerary, requestId)
      .pipe(takeUntil(this.ngDestroy$)).subscribe((res: any) => {
        const result: ApiResponse = res;
        if (result.status === 200) {
          this.PackageDetailedInfo = result.data;
          if (this.PackageDetailedInfo?.length > 0) {

            this.route.queryParams.subscribe((param) => {
              if (param.actionType === 'rfq' && param.productsAvailability === 'true') {
                this.loading = true;
                this.isEdit = true;
                const REQUESTDATA = {
                  serviceRequestNumber: Number(param.requestId),
                };
                this.getProductsData(REQUESTDATA);
              } else {
                if (param.actionType === 'rfq' && param.productsAvailability === 'false') {
                  this.requestLoading = true;
                  this.PackageDetailedInfo?.forEach((mainelement) => {
                    mainelement?.hotels?.forEach((hotelelement, index) => {
                      //pax need newadded
                      if (hotelelement?.paxInfo === null) {
                        hotelelement.paxInfo = mainelement?.hotels[0]?.paxInfo;
                      }
                    });
                  });
                  this.isEdit = false;
                  //this.onCreateServiceRequest();
                }
                this.showCheckBox = false;
                this.loading = false;
                this.submitButton = true;

              }
            });

          }

          this.cdr.markForCheck();
        } else {
          this.PackageDetailedInfo = [];
          this.toastr.error(result.message, 'Error');
          this.cdr.markForCheck();
        }
      });
  }

  getProductsData(requestData) {
    this.dashboardRequestService.getAllServiceRequestSearch(requestData, srsearchList_url.srsearchList).pipe(takeUntil(this.ngDestroy$)).subscribe(
      (res: any) => {
        if (res?.length > 0) {
          this.loading = false;
          let flightRequestLine = [];
          let hotelSrLine = [];
          let anxRequestLine = [];
          let attractionsRequestLines = [];
          let anxAddonsName = [];
          let flightName = [];
          let hotelName = [];
          let attractionHeaderID=[];

          for (let index = 0; index < res?.length; index++) {
            const element = res[index];
            if (element.product === 'Flight') {
              flightRequestLine.push(element.serviceRequestLine);
              flightName = element?.originDestinationLocation?.split(',');
              /* console.log('res',element.originDestinationLocation);
              console.log('res',element.serviceRequestLine);
              console.log('-------'); */
            } else if (element.product === 'Hotel') {
              hotelSrLine.push(element.serviceRequestLine);
              hotelName.push(element.originDestinationLocation);
              /*  console.log('res',element.originDestinationLocation);
              console.log('res',element.serviceRequestLine);
              console.log('-------'); */
            } else if (element.product === 'Ancillary') {
              /* console.log('res',element.originDestinationLocation);
              console.log('res',element.serviceRequestLine);
              console.log('-------'); */
              anxRequestLine.push(element.serviceRequestLine);
              anxAddonsName.push(element.originDestinationLocation);
            } else if (element.product === 'Attractions'|| element.product === 'Attraction') {
              /* console.log('res',element.originDestinationLocation);
              console.log('res',element.serviceRequestLine);
              console.log('-------'); */
              attractionHeaderID?.push(element.serviceRequestLine);
              //attractionsRequestLines = element.classDays?.toString().split(',');
              attractionsRequestLines.push(element.serviceRequestLine) ;
            }
          }
          attractionHeaderID?.sort((a, b) => a - b);
          this.showCheckBox = true;
          this.submitButton = false;
          let hotelRequestLine: number[] = [];
          let attractionsLinesIDs: any[] = [];
          let anxRequestLineId: any[] = [];
          hotelRequestLine = hotelSrLine?.sort((a, b) => a - b);
          anxRequestLineId = anxRequestLine?.sort((a, b) => a - b);
          attractionsLinesIDs = attractionsRequestLines?.sort((a, b) => a - b);
          this.attractionsRequestLineid = attractionHeaderID;

          //let attractionspax:any=[];
          this.PackageDetailedInfo?.forEach((mainelement) => {
            mainelement?.flight?.forEach((flightelement, index) => {
              flightelement.flightrequestlineID = flightRequestLine[0];
              flightelement.routeName = flightName[index];
              flightelement.isChecked = false;
              flightelement?.paxInfo?.forEach((flightpaxelement, index) => {
                flightpaxelement.flightrequestLineId = flightRequestLine[0];
                //attractionspax=flightpaxelement.paxInfo;
              });
              //pax need newadded
              if (flightelement?.paxInfo === null) {
                flightelement.paxInfo = mainelement?.flight[0]?.paxInfo;
                //flightelement.paxInfo= mainelement?.flight[0]?.paxInfo
              }
            });
            mainelement?.hotels?.forEach((hotelelement, index) => {
              hotelelement.hotelrequestlineID = hotelRequestLine[index];
              hotelelement.hotelName = hotelName[index];
              hotelelement.isChecked = false;
              //pax need newadded
              if (hotelelement?.paxInfo === null) {
                hotelelement.paxInfo = mainelement?.hotels[0]?.paxInfo;
                //flightelement.paxInfo= mainelement?.flight[0]?.paxInfo
              }
            });
            mainelement?.attractions?.forEach((attractionselement, index) => {
              attractionselement.attractionrequestlineID = attractionHeaderID[index];
              attractionselement.isChecked = false;
              attractionselement.attractionLineId = attractionsRequestLines[index];
              //attractionselement.paxInfo=attractionspax;
            });
            mainelement?.ancillaries?.forEach((ancillarieselement, index) => {
              ancillarieselement.isChecked = false;
              ancillarieselement.anxAddonsName = anxAddonsName[index];
              ancillarieselement.anxrequestlineID = anxRequestLineId[index];
            });
          });
          this.itineraryDataConvert();
          this.cdr.markForCheck();
        } else {
          this.showCheckBox = false;
          this.loading = false;
          this.submitButton = true;
          this.itineraryDataConvert();
          this.cdr.markForCheck();
        }
      },
      (error) => {
        this.toastr.error(error, 'Error');
        this.loading = false;
      }
    );
  }

  itineraryDataConvert() {
    if (this.PackageDetailedInfo?.length > 0) {
      let itineraries = [];
      this.PackageDetailedInfo?.forEach((itinerary) => {
        itinerary?.flight?.forEach((flight) => {
          const flightData = {
            key: 'flight',
            sortDate: new Date(flight?.segmentDepartDate),
            ...flight,
          };
          itineraries.push(flightData);
        });
        itinerary?.hotels?.forEach((hotel) => {
          const hotelData = {
            key: 'hotel',
            sortDate: new Date(hotel?.checkInDate),
            ...hotel,
          };
          itineraries.push(hotelData);
        });
        itinerary?.attractions?.forEach((attraction) => {
          const attractionData = {
            key: 'attractions',
            sortDate: new Date(attraction?.daysList[0]),
            paxInfo: attraction?.paxCount !== 0 ? itinerary?.paxInfo : [],
            ...attraction,
          };

          itineraries.push(attractionData);
        });
        itinerary?.ancillaries?.forEach((ancillary) => {
          const ancillaryData = {
            key: 'anx',
            sortDate: ancillary?.daysList === null ? new Date('') : new Date(ancillary?.daysList[0]),
            paxInfo: ancillary?.paxCount !== 0 ? itinerary?.paxInfo : [],
            ...ancillary,
          };
          itineraries.push(ancillaryData);
        });
      });
      this.itineraryInfo = itineraries?.sort((a, b) => {
        return a.sortDate?.getTime() - b.sortDate?.getTime();
      });
    }
  }
  modifyData() {
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param.actionType !== 'rfq') {
        if (
          (param && param.rfq) ||
          param?.flightRequestLineId ||
          param?.hotelRequestLineId ||
          param?.attractionRequestLineId ||
          param?.attractionsLinesId ||
          param?.hotelRequestLineIdKey ||
          param?.anxLineId
        ) {
          this.showCheckBox = true;
          this.submitButton = false;
          let hotelRequestLine: number[] = [];
          let attractionsLinesIDs: any[] = [];
          let anxRequestLineId: any[] = [];

          if (typeof param?.hotelRequestLineId === 'object') {
            hotelRequestLine = param?.hotelRequestLineId?.sort((a, b) => a - b);
          }
          if (typeof param?.hotelRequestLineId === 'string') {
            hotelRequestLine.push(Number(param?.hotelRequestLineId));
          }
          if (typeof param?.attractionsLinesId === 'object') {
            attractionsLinesIDs = param?.attractionsLinesId?.sort((a, b) => a - b);
          }
          if (typeof param?.attractionsLinesId === 'string') {
            attractionsLinesIDs.push(param?.attractionsLinesId);
          }
          if (typeof param?.anxLineId === 'object') {
            anxRequestLineId = param?.anxLineId?.sort((a, b) => a - b);
            //anxRequestLineId = [];
          }
          if (typeof param?.anxLineId === 'string') {
            anxRequestLineId.push(param?.anxLineId);
          }
          this.attractionsRequestLineid = Number(param.attractionRequestLineId);
          if (this.PackageDetailedInfo?.length > 0) {
            //let attractionspax:any=[];

            this.PackageDetailedInfo?.forEach((mainelement) => {
              mainelement?.flight?.forEach((flightelement, index) => {
                flightelement.flightrequestlineID = Number(param.flightRequestLineId);

                flightelement.isChecked = false;
                flightelement?.paxInfo?.forEach((flightpaxelement, index) => {
                  flightpaxelement.flightrequestLineId = Number(param.flightRequestLineId);
                  //attractionspax=flightpaxelement.paxInfo;
                });
                //pax need newadded
                if (flightelement?.paxInfo === null) {
                  flightelement.paxInfo = mainelement?.flight[0]?.paxInfo;
                  //flightelement.paxInfo= mainelement?.flight[0]?.paxInfo
                }
              });
              mainelement?.hotels?.forEach((hotelelement, index) => {
                hotelelement.hotelrequestlineID = hotelRequestLine[index];

                hotelelement.isChecked = false;
                //pax need newadded
                if (hotelelement?.paxInfo === null) {
                  hotelelement.paxInfo = mainelement?.hotels[0]?.paxInfo;
                  //flightelement.paxInfo= mainelement?.flight[0]?.paxInfo
                }
              });
              mainelement?.attractions?.forEach((attractionselement, index) => {
                attractionselement.attractionrequestlineID =  Number(param.attractionRequestLineId);
                attractionselement.isChecked = false;
                attractionselement.attractionLineId = attractionsLinesIDs[index];
                //attractionselement.paxInfo=attractionspax;
              });
              mainelement?.ancillaries?.forEach((ancillarieselement, index) => {
                ancillarieselement.isChecked = false;

                ancillarieselement.anxrequestlineID = anxRequestLineId[index];
              });
            });

          }
        } else {
          this.showCheckBox = false;
          this.submitButton = true;
        }
      }
    });
    this.itineraryDataConvert();
  }

  getProductType() {
    this.masterDataService
      .getGenMasterDataByTableName('master_products')
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((data: any) => {
        if (data) {
          this.productList = data;
          /* const productName = 'Hotel';
        this.productList = data?.find((con) => con.name === productName); */
          this.cdr.markForCheck();
        } else {
          this.toastr.error(
            'Oops! Something went wrong while fetching the Product type data please try again ',
            'Error'
          );
        }
      });
  }

  getMasterClass() {
    this.masterDataService
      .getMasterDataByTableName('master_class')
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((data) => {
        if (data) {
          this.masterClassList = data;
          this.cdr.markForCheck();
        } else {
          this.toastr.error('Oops! Something went wrong while fetching the Class Data', 'Error');
        }
      });
  }

  getRequestContactDetails() {
    this.srSummaryData.getData().pipe(takeUntil(this.ngDestroy$)).subscribe((res) => {
      this.srcontactDeatils = res;
        this.cdr.markForCheck();
      });
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

  anxRequestDataCoversion(main_element: any) {
    let attractionsPax = [];
    for (let attractionindex = 0; attractionindex < main_element?.ancillaries?.length; attractionindex++) {
      const attractionElement = main_element?.ancillaries[attractionindex];
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
      if (main_element?.paxInfo.length > 0) {
        anxPax = main_element?.paxInfo?.filter((v) => {
          for (let index = 0; index < attractionsPax?.length; index++) {
            if (v.assign === attractionsPax[index]?.assign && v.paxCode === attractionsPax[index]?.paxCode) {
              return v;
            }
          }
        });
        this.anxPaxRequestData = anxPax;
        let anxRequestObject = {};
        const dynamicAnx = localStorage.getItem(`carRentalData`);
        let modifiedDynamicAnx:any;
        if(dynamicAnx){
           modifiedDynamicAnx=  dynamicAnx== undefined?null:JSON.parse(dynamicAnx);
        }

        if (attractionElement?.paxCount > 0) {
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
              anxLineJson: modifiedDynamicAnx=== null|| modifiedDynamicAnx=== undefined?{}:modifiedDynamicAnx,
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
              anxLineJson: modifiedDynamicAnx=== null||modifiedDynamicAnx=== undefined?{}:modifiedDynamicAnx,
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
        }
        this.anxRequestData.push(anxRequestObject);
      } else {
        let anxRequestObject = {};
        const dynamicAnx = localStorage.getItem(`carRentalData`);
        let modifiedDynamicAnx:any;
      if(dynamicAnx){
        modifiedDynamicAnx=dynamicAnx== undefined?null:JSON.parse(dynamicAnx)
      }
        if (attractionElement?.paxCount > 0) {
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
              anxLineJson: modifiedDynamicAnx=== null || modifiedDynamicAnx=== undefined ?{}:modifiedDynamicAnx,
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
              anxLineJson: modifiedDynamicAnx=== null|| modifiedDynamicAnx=== undefined?{}:modifiedDynamicAnx,
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
        }
        this.anxRequestData.push(anxRequestObject);
      }
      //}
    }
  }




  anxRequestRfqDataCoversion(main_element: any) {
    let attractionsPax = [];

    const attractionElement = main_element;
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
      //console.log('attractionsPax',attractionsPax);
    }
    //if(main_element?.paxInfo?.length>0){
    if (main_element?.paxInfo?.length > 0) {
      let anxPax = [];

      anxPax = main_element?.paxInfo?.filter((v) => {
        for (let index = 0; index < attractionsPax?.length; index++) {
          if (v.assign === attractionsPax[index]?.assign && v.paxCode === attractionsPax[index]?.paxCode) {
            return v;
          }
        }
      });
      this.anPaxRequestRfq = anxPax;

      //}
      let anxRequestObject = {};
      const dynamicAnx = localStorage.getItem(`carRentalData`);
      let modifiedDynamicAnx:any;
      if(dynamicAnx){
         modifiedDynamicAnx=dynamicAnx== undefined?null:JSON.parse(dynamicAnx);
      }

      if (attractionElement?.paxCount > 0) {
        this.anxPaxGrouping(anxPax);

        anxRequestObject = {
          anx: {
            anxLineId:
              attractionElement?.anxrequestlineID === undefined ? 0 : Number(attractionElement?.anxrequestlineID),
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
            anxLineJson: modifiedDynamicAnx=== null|| modifiedDynamicAnx=== undefined?{}:modifiedDynamicAnx,
            anxLineLpoAmount: 0,
            anxLineLpoDate: '',
            anxLineLpoNumber: '',
            anxLineRequestId: Number(this.requestId), // request id
            lineUuid: 0,
            anxLineStatus: 0,
            anxLineType: attractionElement.addOnName,
            anxLineTypeId: attractionElement.addOnId, //serviceTypeId
            anxLineCreatedDevice: this.deviceInfo?.userAgent,
            anxLineCreatedIp: null,
            anxLineCreatedBy: this.authService.getUser(),
            anxLineCreatedDate: this.todaydateAndTimeStamp,
          },
          paxInfo: this.anPaxRequestRfq,
        };
      } else {
        this.anxAdt = 0;
        this.anxChd = 0;
        this.anxInf = 0;
        anxRequestObject = {
          anx: {
            anxLineId:
              attractionElement?.anxrequestlineID === undefined ? 0 : Number(attractionElement?.anxrequestlineID),
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
            anxLineJson: modifiedDynamicAnx=== null || modifiedDynamicAnx=== undefined ?{}:modifiedDynamicAnx,
            anxLineLpoAmount: 0,
            anxLineLpoDate: '',
            anxLineLpoNumber: '',
            anxLineRequestId: Number(this.requestId), // request id
            lineUuid: 0,
            anxLineStatus: 0,
            anxLineType: attractionElement.addOnName,
            anxLineTypeId: attractionElement.addOnId, //serviceTypeId
            anxLineCreatedDevice: this.deviceInfo?.userAgent,
            anxLineCreatedIp: null,
            anxLineCreatedBy: this.authService.getUser(),
            anxLineCreatedDate: this.todaydateAndTimeStamp,
          },
          paxInfo: [],
        };
      }
      this.anxRequestRfq.push(anxRequestObject);
    } else {
      let anxRequestObject = {};
      const dynamicAnx = localStorage.getItem(`carRentalData`);
      let modifiedDynamicAnx:any;
      if(dynamicAnx){
        modifiedDynamicAnx=dynamicAnx== undefined?null:JSON.parse(dynamicAnx);
      }

      if (attractionElement?.paxCount > 0) {
        this.anxPaxGrouping(attractionsPax);

        anxRequestObject = {
          anx: {
            anxLineId:
              attractionElement?.anxrequestlineID === undefined ? 0 : Number(attractionElement?.anxrequestlineID),
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
            anxLineJson: modifiedDynamicAnx=== null || modifiedDynamicAnx=== undefined ?{}:modifiedDynamicAnx,
            anxLineLpoAmount: 0,
            anxLineLpoDate: '',
            anxLineLpoNumber: '',
            anxLineRequestId: Number(this.requestId), // request id
            lineUuid: 0,
            anxLineStatus: 0,
            anxLineType: attractionElement.addOnName,
            anxLineTypeId: attractionElement.addOnId, //serviceTypeId
            anxLineCreatedDevice: this.deviceInfo?.userAgent,
            anxLineCreatedIp: null,
            anxLineCreatedBy: this.authService.getUser(),
            anxLineCreatedDate: this.todaydateAndTimeStamp,
          },
          paxInfo: [],
        };
      } else {
        this.anxAdt = 0;
        this.anxChd = 0;
        this.anxInf = 0;
        anxRequestObject = {
          anx: {
            anxLineId:
              attractionElement?.anxrequestlineID === undefined ? 0 : Number(attractionElement?.anxrequestlineID),
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
            anxLineJson: modifiedDynamicAnx=== null || modifiedDynamicAnx=== undefined ?{}:modifiedDynamicAnx,
            anxLineLpoAmount: 0,
            anxLineLpoDate: '',
            anxLineLpoNumber: '',
            anxLineRequestId: Number(this.requestId), // request id
            lineUuid: 0,
            anxLineStatus: 0,
            anxLineType: attractionElement.addOnName,
            anxLineTypeId: attractionElement.addOnId, //serviceTypeId
            anxLineCreatedDevice: this.deviceInfo?.userAgent,
            anxLineCreatedIp: null,
            anxLineCreatedBy: this.authService.getUser(),
            anxLineCreatedDate: this.todaydateAndTimeStamp,
          },
          paxInfo: [],
        };
      }
      this.anxRequestRfq.push(anxRequestObject);
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
  async onCreateServiceRequest() {
    if (this.PackageDetailedInfo?.length > 0) {
      let segment_array: any[] = [];
      let flight_pax_info: any[] = [];
      let flight_pax_Data_info: any[] = [];
      let addonsRoutesData: any[] = [];
      let flightAddons: any[] = [];
      let adt: any;
      let chd: any;
      let inf: any;
      for (let index = 0; index < this.PackageDetailedInfo?.length; index++) {
        const main_element = this.PackageDetailedInfo[index];
        if (main_element?.flight?.length > 0) {
          for (let flight_index = 0; flight_index < main_element?.flight?.length; flight_index++) {
            const flight_element = main_element.flight[flight_index];
            const segment_data = {
              requestID: Number(this.requestId),
              //requestlineID:'',
              fromCode: flight_element?.segmentBoardPoint,
              fromCountryName: flight_element?.segmentBoardPoint,
              fromAirportOrCityName: flight_element?.segmentBoardCityOrAirport,
              toCode: flight_element?.segmentOffPoint,
              toCountryName: flight_element?.segmentOffPoint,
              toAirportOrCityName: flight_element?.segmentArrivalCityOrAirport,
              depatureDate: flight_element?.segmentDepartDate,
              returnDate: null,
              className: flight_element?.segmentClassDesignator,
              rbd: flight_element?.segmentRbdCode,
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
              airlineCode:
                flight_element?.segmentAirlineMarketing === null ? null : flight_element?.segmentAirlineMarketing,
            };

            if (flight_element.paxInfo?.length > 0) {
              for (let sub_index = 0; sub_index < flight_element.paxInfo?.length; sub_index++) {
                const flight_pax_sub_element = flight_element.paxInfo[0];
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
                if (flight_element?.infCount > 0) {
                  for (let lineINFIndex = 1; lineINFIndex <= flight_element?.infCount; lineINFIndex++) {
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
                if (flight_element?.adtCount > 0) {
                  for (let lineAdultIndex = 1; lineAdultIndex <= flight_element?.adtCount; lineAdultIndex++) {
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
                if (flight_element?.chdCount > 0) {
                  for (let lineChildIndex = 1; lineChildIndex <= flight_element?.chdCount; lineChildIndex++) {
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

                let passengerData = [...flight_element.paxInfo];
                passengerData = JSON.parse(JSON.stringify(passengerData));
                let adultIndex = 1;
                let childIndex = 1;
                let infIndex = 1;
                if (passengerData?.length > 0) {
                  for (let passengerIndex = 0; passengerIndex < passengerData?.length; passengerIndex++) {
                    if (passengerData[passengerIndex]?.paxCode === 'Adult') {
                      passengerData[passengerIndex].paxTypeRefName =
                        passengerData[passengerIndex].paxCode + '-' + adultIndex;
                      adultIndex = adultIndex + 1;
                    }
                    if (passengerData[passengerIndex]?.paxCode === 'Child') {
                      passengerData[passengerIndex].paxTypeRefName =
                        passengerData[passengerIndex].paxCode + '-' + childIndex;
                      childIndex = childIndex + 1;
                    }
                    if (passengerData[passengerIndex]?.paxCode === 'Infant') {
                      passengerData[passengerIndex].paxTypeRefName =
                        passengerData[passengerIndex]?.paxCode + '-' + infIndex;
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
                            passengerData[passengerIndex].paxTypeRefName +
                            '-' +
                            passengerData[passengerIndex]?.firstName;
                          linePersonCount[index].paxRefence = passengerData[passengerIndex]?.paxId;
                        }
                      }
                    }
                  }
                }
                this.addonsPassengers = linePersonCount;
              }
            }

            if (flight_element.addOns?.length > 0) {
              for (let addonsindex = 0; addonsindex < flight_element.addOns?.length; addonsindex++) {
                const addonselement = flight_element.addOns[addonsindex];
                const addonsRoutes = {
                  routeNo: flight_index + 1,
                  selectedAllGroup: 'Select All',
                  route: flight_element?.segmentBoardPoint + ' - ' + flight_element?.segmentOffPoint,
                  bindLableRoute: flight_element?.segmentBoardPoint + ' - ' + flight_element?.segmentOffPoint,
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
                flightAddons.push(addonsObject);
              }
            }
            flight_pax_Data_info = main_element.flight[0]?.paxInfo === null ? [] : flight_element.paxInfo;
            segment_array.push(segment_data);
            adt = flight_element.adtCount;
            chd = flight_element.chdCount;
            inf = flight_element.infCount;
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
              addons: flightAddons,
            },
            serviceRequestSegment: segment_array,
            //segment_pax:flight_pax_info
            //segment_pax: flight_pax_Data_info,
            segment_pax: main_element?.flight[0]?.paxInfo === null ? [] : main_element?.flight[0]?.paxInfo,
          };
          this.flight_data.push(flight_details_data);
        }
        if (main_element?.hotels?.length > 0) {
          for (let hotel_index = 0; hotel_index < main_element?.hotels.length; hotel_index++) {
            const hotel_element = main_element?.hotels[hotel_index];
            const location_info =
              hotel_element.hotelCityName +
              ' ' +
              hotel_element.hotelCountryName +
              '(' +
              hotel_element.hotelCountryCode +
              ')';
            let hotel_pax_info: any[] = [];

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
                totalAdultsCount+= roomCountElement.roomAdultCount;
                totalCHDCount+= roomCountElement.roomChildCount;
                totalINFCount+= roomCountElement.roomInfantCount;
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
            }else{
               totalAdultsCount = hotel_element.adtCount;
               totalCHDCount = hotel_element.chdCount + hotel_element.infCount;
               //totalINFCount = hotel_element.infCount;
               totalINFCount = 0;
               let noRoomAdtCount=0;
               let noRoomChdCount=0;
               let noRoomInfCount=0;
               if(hotel_element.paxInfo?.length>0){
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
                  noRoomInfCount= 0;
                }
               }else{
                noRoomAdtCount = hotel_element.adtCount;
                noRoomChdCount = hotel_element.chdCount;
               }

               const roomsInfoData = {
                //id:'',
                roomSrId: Number(this.requestId),
                //roomNumber: hotelelement?.roomNumber === ""?0:Number(hotelelement?.roomNumber),
                roomNumber:  1,
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
                room_Addons_array.push(hotelAddonsobject)
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
                lineRoomCount: hotel_element.roomsCount === null|| hotel_element.roomsCount === undefined || hotel_element.roomsCount === "" ?1: hotel_element.roomsCount ,
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
                lineSearchType: "Normal",
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
              srRoomAddons:room_Addons_array
            };
            this.hotel_data.push(hotel_info_data);

          }
        }
        if (main_element.attractions?.length > 0) {
          let attractions_lines: any[] = [];
          for (let attractions_index = 0; attractions_index < main_element.attractions.length; attractions_index++) {
            const attractions_element = main_element.attractions[attractions_index];
            let attractions_pax: any[] = [];
            if (attractions_element.paxDetails?.length > 0) {
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
                if(main_element?.paxInfo.length>0){

                  anxPax = main_element?.paxInfo?.filter((v) => {
                    for (let index = 0; index < attractionsPax?.length; index++) {
                      if (v.assign === attractionsPax[index]?.assign && v.paxCode === attractionsPax[index]?.paxCode) {
                        return v;
                      }
                    }
                  });


                }

             if(anxPax?.length >0){
              for (let index = 0; index < anxPax?.length; index++) {
                const sub_element = anxPax[index];
                const attractions_pax_info = {
                  attractionLinePassengerDob: sub_element.dob === null ? null:sub_element.dob,
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
              attractionLineDate: attractions_element.daysList[0],
              attractionLineDay: 0,
              attractionLineLocation: attractions_element.location === null? attractions_element.city :attractions_element.location,
              attractionLineName: attractions_element.attractionName,
              attractionLinePaxCount: attractions_element.paxCount === null ? 0 : attractions_element.paxCount,
              //passengers:attractions_element.paxDetails
              passengers: attractions_pax,
            };

            attractions_lines.push(attractionsLines);
          }
          if( attractions_lines?.length>0){
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
              this.attractions_data.push(attraction_info_data);
            }
          }

          /* const attraction_info_data = {
            attractionAttribute1: 'string',
            attractionAttribute2: 'string',
            attractionAttribute3: 'string',
            attractionCreatedBy: this.authService.getUser(),
            attractionCreatedDevice: this.deviceInfo?.userAgent,
            attractionCreatedIp: 'string',
            attractionDescription: 'string',
            attractionName: `Package-Attractions-${Number(this.requestId)}`,
            attractionRequestId: Number(this.requestId),
            lines: attractions_lines,
          };
          this.attractions_data.push(attraction_info_data); */
        }

        if (main_element?.ancillaries?.length > 0) {
          this.anxRequestDataCoversion(main_element);
        }
      }
    }
    /* console.log("flight",this.flight_data);
    console.log("hotel",this.hotel_data);
    console.log("hotelAddons",this.hotelAddons);
    console.log("anx",this.anxRequestData);
    console.log("attractions",this.attractions_data);
    return; */
    if (this.flight_data?.length > 0) {
      // this.onCreateFlightServiceRequest(this.flight_data);
      const flightData=this.flight_data;
      let flightRequestSubApis=[];
      let flightRequestPax=[];
      let flightRequestSrSummary=[];
      let flightRequestResourcesAssignment=[];
      const saveFlightData = {
        serviceRequestLine: flightData[0]?.serviceRequestLine,
        serviceRequestSegment: flightData[0]?.serviceRequestSegment,
      };
        const flightRequestResponse = await this.dashboardRequestService.createServiceRequestLineSegment(saveFlightData).toPromise();
        this.appendQueryParamsApisResponse.flightRequestLineId = flightRequestResponse?.serviceRequestLine?.requestLineId;
        if(flightRequestResponse){
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
          }else{
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
          }else{
            console.log("flight Sr Summary no data");
          }
          //flight resources
          if (flightHeaderAndSegements) {
            const flightResourceData = this.flightResourceDataConversion(flightHeaderAndSegements, flightRequestResponse);
            flightRequestResourcesAssignment.push(flightResourceData);
            //console.log('flightResourceData',flightResourceData);
            // const flightServiceRequestSrSummary = await this.dashboardRequestService.resourcesAssignment(flightResourceData, sr_assignment.flightassignment).toPromise();
            //console.log("flight sub", subAllRequestsApis.length);
          }else{
            console.log("flight Service Request Resources no data");
          }

          if(flightRequestPax?.length>0){
            for (let index = 0; index < flightRequestPax.length; index++) {
              const element = flightRequestPax[index];
              flightRequestSubApis.push(this.dashboardRequestService.createServiceRequestPaxRelation(element));
            }
          }
          if(flightRequestSrSummary?.length>0){
            for (let index = 0; index < flightRequestSrSummary.length; index++) {
              const element = flightRequestSrSummary[index];
              flightRequestSubApis.push(this.dashboardRequestService.saveSrSummary(element, SrSummaryData.SAVESRSUMMARYDATA));
            }
          }

          if(flightRequestResourcesAssignment?.length>0){
             for (let index = 0; index < flightRequestResourcesAssignment.length; index++) {
              const element = flightRequestResourcesAssignment[index];
              flightRequestSubApis.push(this.dashboardRequestService.resourcesAssignment(element, sr_assignment.flightassignment));
             }
          }


          if (flightRequestSubApis?.length > 0) {
            forkJoin(flightRequestSubApis).pipe(takeUntil(this.ngDestroy$)).subscribe((results) => {
              console.log('flight  sub  apis saved');
            });
          }
        }
    }

    if (this.hotel_data?.length > 0) {
      //this.onCreateHotelServiceRequest(this.hotel_data);

      const hotelRequestData=this.hotel_data;
    let saveAddonsArray = [];
    let hotel_SrSummary: any[] = [];
    let hotel_ResourcesAssignmnet_Save: any[] = [];
    let hotelRequestSubApis=[];
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
          lineHotelName:hotel_save_element.srLine.lineHotelName,
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
          lineMarkupAmount:hotel_save_element.srLine.lineMarkupAmount,
          lineMarkupPercentage: hotel_save_element.srLine.lineMarkupPercentage,
          lineAdultCount: hotel_save_element.srLine.lineAdultCount,
          lineChildCount: hotel_save_element.srLine.lineChildCount,
          lineInfantCount: hotel_save_element.srLine.lineInfantCount,
          lineTotalDays: hotel_save_element.srLine.lineTotalDays,
          lineSearchType: hotel_save_element.srLine.lineSearchType,
          lineAddonsRequired: hotel_save_element.srLine.lineAddonsRequired,
          lineApis:  hotel_save_element.srLine.lineApis,
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
      const hotelRequestResponse = await this.dashboardRequestService.createHotelServiceRequest(hotel_info_data, request_hotel_url.createHotel).toPromise();

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
          const hotelAddonsRooms= hotelRequestResponse?.srRooms;
          hotelRoomQueryParams = [];
          for (let index = 0; index < hotelAddonsRooms?.length; index++) {
            const element = hotelAddonsRooms[index];
            hotelRoomQueryParams.push(element?.id);
          }
        }
        for (let hotelAddonsIndex = 0; hotelAddonsIndex < hotel_save_element?.srRoomAddons?.length; hotelAddonsIndex++) {
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
    }

    if (saveAddonsArray?.length > 0) {
      for (let index = 0; index < saveAddonsArray?.length; index++) {
        const element = saveAddonsArray[index];
        let saveHotelAddonsArray = [];
        saveHotelAddonsArray.push(element);
        hotelRequestSubApis.push(this.dashboardRequestService.createAddons(saveHotelAddonsArray, addons_url.createAddons));
        //const onSaveHotelAddons= await  this.dashboardRequestService.createAddons(saveHotelAddonsArray, addons_url.createAddons).toPromise();
      }
    }

    if (hotel_ResourcesAssignmnet_Save?.length > 0) {
      for (let resourxesindex = 0; resourxesindex < hotel_ResourcesAssignmnet_Save.length; resourxesindex++) {
          const resourceselement = hotel_ResourcesAssignmnet_Save[resourxesindex];
          hotelRequestSubApis.push(this.dashboardRequestService.resourcesAssignment(resourceselement, sr_assignment.flightassignment));
      }
    }

    if (hotel_SrSummary?.length > 0) {
      for (let srindex = 0; srindex < hotel_SrSummary.length; srindex++) {
          const srSummaryelement = hotel_SrSummary[srindex];
          hotelRequestSubApis.push( this.dashboardRequestService.saveSrSummary(srSummaryelement, SrSummaryData.SAVESRSUMMARYDATA));
      }
    }


    if (hotelRequestSubApis?.length > 0) {
      forkJoin(hotelRequestSubApis).pipe(takeUntil(this.ngDestroy$)).subscribe((results) => {
        console.log('hotel  sub  apis saved');
      });
    }
    this.appendQueryParamsApisResponse.hotelRequestLineId = hotelQueryParams?.sort((a, b) => a - b);
    }
    if (this.attractions_data?.length > 0) {
      //this.onCreateAttractionsServiceRequest(this.attractions_data);
      //const attractionRequest=this.attractions_data;
      //let attractionsLinesQueryParams=[];
     //const onSaveAttractions = await this.dashboardRequestService.createPackageItineraryAttractions(attractionRequest[0],Holiday_Package.attractionsServiceRequest).toPromise();

    /* if (onSaveAttractions?.attractionId) {
      this.appendQueryParamsApisResponse.attractionRequestLineId = onSaveAttractions?.attractionId;
      this.saveAttractionsSrSummayData(onSaveAttractions?.attractionId,0);
    } */

    /* if (onSaveAttractions?.lines?.length > 0) {
      for (let index = 0; index < onSaveAttractions?.lines?.length; index++) {
        const attractionsLineselement = onSaveAttractions?.lines[index];
        attractionsLinesQueryParams.push(attractionsLineselement?.attractionLineId);
        // attractionsLineselement.attractionLinePaxCount
        this.saveAttractionsSrSummayData(attractionsLineselement?.attractionLineId,attractionsLineselement.attractionLinePaxCount);
      }
    } */

    //this.appendQueryParamsApisResponse.attractionsLinesId = attractionsLinesQueryParams?.sort((a, b) => a - b);

     for (let index = 0; index < this.attractions_data.length; index++) {
      const element = this.attractions_data[index];
      const onSaveAttractions = await this.dashboardRequestService.createPackageItineraryAttractions(element,Holiday_Package.attractionsServiceRequest).toPromise();
      this.saveAttractionsSrSummayData(onSaveAttractions?.attractionId,0);
    }

    }




    if (this.anxRequestData?.length > 0) {
      // this.onCreateAnxServiceRequest(this.anxRequestData);
      const anxRequest=this.anxRequestData;
      let anxRequestPax=[];
      let anxRequestSubApis=[];
      let anxQueryParams=[];
      for (let anxindex = 0; anxindex < anxRequest?.length; anxindex++) {
        const anxelement = anxRequest[anxindex];
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
      this.appendQueryParamsApisResponse.anxLineId = anxQueryParams?.sort((a, b) => a - b);

    }
    this.appendQueryParamsApisResponse.rfq = 'all';
    this.requestLoading=false;
    this.toastr.success('The service request has been sent successfuly !', 'Success');
    this.appendingQueryParamstoCurrentRouter(this.appendQueryParamsApisResponse);

    return;
    let flightDataLength = this.flight_data?.length;
    let hotelDataLength = this.hotel_data?.length;
    let attractionsDataLength = this.attractions_data?.length;
    let anxDataLength = this.anxRequestData?.length;
    let allRequestApis: any[] = [];
    if (this.flight_data?.length > 0) {
      const saveFlightData = {
        serviceRequestLine: this.flight_data[0]?.serviceRequestLine,
        serviceRequestSegment: this.flight_data[0]?.serviceRequestSegment,
      };
      allRequestApis.push(this.dashboardRequestService.createServiceRequestLineSegment(saveFlightData));
    }
    let hotel_SrSummary: any[] = [];
    let hotel_ResourcesAssignmnet_Save: any[] = [];
    if (this.hotel_data?.length > 0) {
      for (let hotel_index = 0; hotel_index < this.hotel_data?.length; hotel_index++) {
        const hotel_save_element = this.hotel_data[hotel_index];
        allRequestApis.push(
          this.dashboardRequestService.createHotelServiceRequest(hotel_save_element, request_hotel_url.createHotel)
        );
        hotel_SrSummary.push(hotel_save_element);
        hotel_ResourcesAssignmnet_Save.push(hotel_save_element);
      }
    }

    if (this.attractions_data?.length > 0) {
      allRequestApis.push(
        this.dashboardRequestService.createPackageItineraryAttractions(
          this.attractions_data[0],
          Holiday_Package.attractionsServiceRequest
        )
      );
    }
    if (this.anxRequestData?.length > 0) {
      for (let anxindex = 0; anxindex < this.anxRequestData?.length; anxindex++) {
        const anxelement = this.anxRequestData[anxindex];
        //console.log(anxelement.anx);
        //console.log(anxelement.paxInfo);
        allRequestApis.push(this.serviceTypeService.create(ANX_API.CREATE, anxelement.anx));
        //this.anxPaxDataConversion(anxelement.paxInfo)
      }
    }

    if (allRequestApis?.length === 0) return;
    forkJoin(allRequestApis).subscribe((response) => {
      const result = response;
      if (result?.length > 0) {
        hotelDataLength = hotelDataLength + flightDataLength;
        attractionsDataLength = attractionsDataLength + hotelDataLength;
        anxDataLength = attractionsDataLength + anxDataLength;
        let intialHotelIndex = 0;
        let intialAnxIndex = 0;
        let subAllRequestsApis: any[] = [];
        let appendQueryParams: any = {};
        let hotelQueryParams: any[] = [];
        let hotelRoomQueryParams: any[] = [];
        let anxQueryParams: any[] = [];
        let attractionsLinesQueryParams = [];
        appendQueryParams.rfq = 'all';
        result?.forEach((data: any, index) => {
          if (flightDataLength > index) {
            appendQueryParams.flightRequestLineId = data?.serviceRequestLine?.requestLineId;
            if (this.flight_data[0]?.segment_pax?.length > 0) {
              const pax = this.flightPaxDataConversion(this.flight_data[0]?.segment_pax);
              const paxPayload = {
                paxData: pax,
                requestId: Number(this.requestId),
                requestLineId: data?.serviceRequestLine?.requestLineId,
                createdBy: this.authService.getUser(),
                updatedBy: this.authService.getUser(),
              };
              subAllRequestsApis.push(this.dashboardRequestService.createServiceRequestPaxRelation(paxPayload));
            }
            const flightHeaderAndSegements = {
              serviceRequestLine: this.flight_data[0]?.serviceRequestLine,
              serviceRequestSegment: this.flight_data[0]?.serviceRequestSegment,
            };
            // flight sr summary
            if (flightHeaderAndSegements) {
              const flightSrSummary = this.flightSrSummaryDataConversion(flightHeaderAndSegements, data);
              //console.log('flightResourcesAssignment',flightSrSummary);

              subAllRequestsApis.push(
                this.dashboardRequestService.saveSrSummary(flightSrSummary, SrSummaryData.SAVESRSUMMARYDATA)
              );
              //console.log("flight sub", subAllRequestsApis.length);
            }
            //flight resources
            if (flightHeaderAndSegements) {
              const flightResourceData = this.flightResourceDataConversion(flightHeaderAndSegements, data);
              //console.log('flightResourceData',flightResourceData);
              subAllRequestsApis.push(
                this.dashboardRequestService.resourcesAssignment(flightResourceData, sr_assignment.flightassignment)
              );
              //console.log("flight sub", subAllRequestsApis.length);
            }
          }
          if (hotelDataLength > index && flightDataLength <= index) {
            hotelQueryParams.push(data?.srLine?.id);
            // console.log('srRooms',data?.srRooms);
            if (data?.srRooms?.length > 0) {
              hotelRoomQueryParams = [];
              for (let index = 0; index < data?.srRooms?.length; index++) {
                const element = data?.srRooms[index];
                hotelRoomQueryParams.push(element?.id);
              }
            }
            // console.log("hotelRoomQueryParams",hotelRoomQueryParams);
            if (hotelDataLength > index) {
              if (hotel_ResourcesAssignmnet_Save?.length > 0) {
                for (let resourxesindex = 0; resourxesindex < hotel_ResourcesAssignmnet_Save.length; resourxesindex++) {
                  if (intialHotelIndex === resourxesindex) {
                    const resourceselement = hotel_ResourcesAssignmnet_Save[resourxesindex];
                    const hotelResouces = this.hotelResourcesAssignmentHotel(resourceselement, data);
                    subAllRequestsApis.push(
                      this.dashboardRequestService.resourcesAssignment(hotelResouces, sr_assignment.flightassignment)
                    );
                  }
                }
              }
              if (hotel_SrSummary?.length > 0) {
                for (let srindex = 0; srindex < hotel_SrSummary.length; srindex++) {
                  if (intialHotelIndex === srindex) {
                    const srSummaryelement = hotel_SrSummary[srindex];
                    const hotelSrSummary = this.hotelSrSummayHotelData(srSummaryelement, data);
                    subAllRequestsApis.push(
                      this.dashboardRequestService.saveSrSummary(hotelSrSummary, SrSummaryData.SAVESRSUMMARYDATA)
                    );
                  }
                }
              }
              if (this.hotelAddons?.length > 0) {
                for (let hotelAddonsIndex = 0; hotelAddonsIndex < this.hotelAddons?.length; hotelAddonsIndex++) {
                  const hotelAddonsElement = this.hotelAddons[hotelAddonsIndex];
                  if (intialHotelIndex === hotelAddonsIndex) {
                    const hotelAddonsobject = {
                      addonSrId: Number(this.requestId),
                      addonLineId: data?.srLine?.id,
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
                    let saveAddonsArray = [];
                    saveAddonsArray.push(hotelAddonsobject);
                    subAllRequestsApis.push(
                      this.dashboardRequestService.createAddons(saveAddonsArray, addons_url.createAddons)
                    );
                  }
                }
              }
            }

            intialHotelIndex = intialHotelIndex + 1;
            if (hotelDataLength - 1 === index) {
              appendQueryParams.hotelRequestLineId = hotelQueryParams?.sort((a, b) => a - b);
            }
          }
          if (attractionsDataLength > 0 && hotelDataLength <= index) {
            if (data?.attractionId) {
              appendQueryParams.attractionRequestLineId = data?.attractionId;
            }

            if (data?.lines?.length > 0) {
              for (let index = 0; index < data?.lines?.length; index++) {
                const attractionsLineselement = data?.lines[index];
                attractionsLinesQueryParams.push(attractionsLineselement?.attractionLineId);
              }
            }
            if (attractionsDataLength > index) {
              //attractionLineId
            }
            appendQueryParams.attractionsLinesId = attractionsLinesQueryParams?.sort((a, b) => a - b);
          }

          if (anxDataLength > index && attractionsDataLength <= index) {
            const anxLineId = data?.anxLineId;
            anxQueryParams.push(data?.anxLineId);
            /* console.log("anx id's",data?.anxLineId);
            console.log("anxQueryParams",anxQueryParams); */
            if (this.anxRequestData?.length > 0) {
              for (let anxindex = 0; anxindex < this.anxRequestData?.length; anxindex++) {
                const anxelement = this.anxRequestData[anxindex];
                if (intialAnxIndex === anxindex) {
                  //console.log(anxelement.anx);
                  //console.log(anxelement.paxInfo);
                  const pax = this.anxPaxDataConversion(anxelement?.paxInfo);
                  if (pax?.length > 0) {
                    const paxPayload = {
                      paxData: pax,
                      requestId: Number(this.requestId),
                      requestLineId: anxLineId,
                      createdBy: this.authService.getUser(),
                      updatedBy: this.authService.getUser(),
                    };
                    subAllRequestsApis.push(
                      this.serviceTypeService.create(ANX_PAX_API.CREATEMODIFYREQUESTLINEPAX, paxPayload)
                    );
                  }
                }
              }
            }
            intialAnxIndex = intialAnxIndex + 1;
            if (anxDataLength - 1 === index) {
              //console.log('anxQueryParams',anxQueryParams);
              appendQueryParams.anxLineId = anxQueryParams?.sort((a, b) => a - b);
            }
          }
        });

        if (subAllRequestsApis?.length > 0) {
          forkJoin(subAllRequestsApis).subscribe((subResponse) => {
            console.log('finished');
            this.toastr.success('The service request has been sent successfuly !', 'Success');
            this.appendingQueryParamstoCurrentRouter(appendQueryParams);
          });
        } else {
          console.log('finished');
          this.appendingQueryParamstoCurrentRouter(appendQueryParams);
          this.toastr.success('The service request has been sent successfuly !', 'Success');
        }
      }
      this.requestLoading = false;
    });
  }
  appendingQueryParamstoCurrentRouter(newParams) {
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((params) => {
      let queryParams = params;
      //Object.assign(newParams, queryParams);
      const products = {
        actionType: 'rfq',
        from: 'package',
        productsAvailability: 'true',
      };

     /*  const data = {
        ...queryParams,
        ...newParams,
        ...products
      }; */
      const data = {
        ...queryParams,
        ...products,
      };
      this.requestLoading=false;
      /* this.router.navigate(['/dashboard/booking/package-itinerary'], {
        queryParams: data,
      }); */
      this.router.navigate(['/dashboard/request/package-holidays-listview'], {
        queryParams: data,
      });
      this.showCheckBox = true;
      this.submitButton = false;
    });
  }
  saveAnxSrSummayData(anxLineId:number,anxValues:any) {
    if (this.srcontactDeatils&&anxLineId) {
      const productName = 'Ancillary';
      const anxProductNumber=  this.productList?.find((con) => con.name === productName);
      const total: number =
        Number(anxValues.anxLineAdtCount) +
        Number(anxValues.anxLineChdCount) +
        Number(anxValues.anxLineInfCount) ;
      const SUMMARYDATA = {
        contactEmail: this.srcontactDeatils?.contact?.primaryEmail,
        contactId: this.srcontactDeatils?.contact?.id,
        contactName: this.srcontactDeatils?.contact?.firstName + ' ' + this.srcontactDeatils?.contact?.lastName,
        contactPhone: this.srcontactDeatils?.contact?.primaryPhoneNumber,
        deviceInfo: this.deviceInfo?.userAgent,
        loggedInUserId: this.authService.getUser(),
        passengerCount: Number(total),
        productId: anxProductNumber?.id === undefined ?3 :anxProductNumber?.id ,
        serviceRequestId: this.srcontactDeatils?.requestId,
        serviceRequestLineId: anxLineId,
        travelDateOrCheckInDate: null,

      };
      this.dashboardRequestService.saveSrSummary(SUMMARYDATA, SrSummaryData.SAVESRSUMMARYDATA).subscribe((res:any) => {
        const result: ApiResponse = res;
        if (result.status === 200) {
          console.log('anx sr summary saved ');

        } else if (result.message === ' ') {
          this.toastr.error('Oops! Something went wrong  while send the anx sr summary data please try again', 'Error', {
            progressBar: true,
          });
        } else {
          this.toastr.error(result.message, 'Error', { progressBar: true });
        }
      });
    }
  }
  saveAttractionsSrSummayData(attractionLineId:number,attractionsPaxCount:number) {

    if (this.srcontactDeatils&&attractionLineId) {
      const productName = 'Attraction';
      const anxProductNumber=  this.productList?.find((con) => con.name === productName);

      const SUMMARYDATA = {
        contactEmail: this.srcontactDeatils?.contact?.primaryEmail,
        contactId: this.srcontactDeatils?.contact?.id,
        contactName: this.srcontactDeatils?.contact?.firstName + ' ' + this.srcontactDeatils?.contact?.lastName,
        contactPhone: this.srcontactDeatils?.contact?.primaryPhoneNumber,
        deviceInfo: this.deviceInfo?.userAgent,
        loggedInUserId: this.authService.getUser(),
        passengerCount: attractionsPaxCount,
        productId: anxProductNumber?.id === undefined ?4:anxProductNumber?.id ,
        serviceRequestId: this.srcontactDeatils?.requestId,
        serviceRequestLineId: attractionLineId,
        travelDateOrCheckInDate: null,
      };

      this.dashboardRequestService.saveSrSummary(SUMMARYDATA, SrSummaryData.SAVESRSUMMARYDATA).subscribe((res:any) => {
        const result: ApiResponse = res;
        if (result.status === 200) {
          console.log('attractions  sr summary saved ');

        } else if (result.message === ' ') {
          this.toastr.error('Oops! Something went wrong  while send the attractions sr summary data please try again', 'Error', {
            progressBar: true,
          });
        } else {
          this.toastr.error(result.message, 'Error', { progressBar: true });
        }
      });
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
    const total: number =
      Number(flightHeaderAndSegements?.serviceRequestLine?.noofADT) +
      Number(flightHeaderAndSegements?.serviceRequestLine?.noofCHD) +
      Number(flightHeaderAndSegements?.serviceRequestLine?.noofINF);

      const customerDetailsBySrId = this.authService.getCustomerType();
    const flightResourceData = {
      productId: flightdata?.id === undefined ? 1:flightdata?.id,
      bookingTypeId: 1,
      cabinClassId: cabinClassId?.id === undefined ?3:cabinClassId?.id ,
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

  flightSrSummaryDataConversion(flightHeaderAndSegements: any, data: any) {

    if (flightHeaderAndSegements && data && this.srcontactDeatils) {
      const total: number =
        Number(flightHeaderAndSegements?.serviceRequestLine?.noofADT) +
        Number(flightHeaderAndSegements?.serviceRequestLine?.noofCHD) +
        Number(flightHeaderAndSegements?.serviceRequestLine?.noofINF);
      const productName = 'Flight';
      const flightdata = this.productList?.find((con) => con.name === productName);
      const SUMMARYDATA = {
        contactEmail: this.srcontactDeatils?.contact?.primaryEmail,
        contactId: this.srcontactDeatils?.contact?.id,
        contactName: this.srcontactDeatils?.contact?.firstName + ' ' + this.srcontactDeatils?.contact?.lastName,
        contactPhone: this.srcontactDeatils?.contact?.primaryPhoneNumber,
        deviceInfo: this.deviceInfo?.userAgent,
        loggedInUserId: this.authService.getUser(),
        passengerCount: Number(total),
        productId: flightdata?.id === undefined ? 1: flightdata?.id ,
        serviceRequestId: Number(this.requestId),
        serviceRequestLineId: data?.serviceRequestLine?.requestLineId,
        travelDateOrCheckInDate: flightHeaderAndSegements?.serviceRequestSegment[0]?.depatureDate,
      };

      return SUMMARYDATA;
    }
  }

  hotelResourcesAssignmentHotel(formData: any, data: any) {
    const HOTELFORMDATA = formData?.srLine;
    const productName = 'Hotel';
    const hoteldata = this.productList?.find((con) => con.name === productName);
    const customerDetailsBySrId = this.authService.getCustomerType();
    if (HOTELFORMDATA) {
      const sendData = {
        productId: hoteldata?.id === undefined ? 2:hoteldata?.id  ,
        bookingTypeId: 1,
        cabinClassId: 0,
        paxCount: 0,
        typeOfJourneyId: 0,
        hotelNoOfDays: Number(HOTELFORMDATA?.lineTotalDays),
        hotelDestination: HOTELFORMDATA?.lineLocation,
        hotelRoomsCount: Number(HOTELFORMDATA?.lineRoomCount),
        hotelNightsCount: Number(HOTELFORMDATA?.lineNoOfNights),
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
    if (this.srcontactDeatils && formData && data) {
      const productName = 'Hotel';
      const hoteldata = this.productList?.find((con) => con.name === productName);
      const total: number = Number(formData.srRooms?.roomAdultCount) + Number(formData.srRooms?.roomChildCount);
      const SUMMARYDATA = {
        contactEmail: this.srcontactDeatils?.contact?.primaryEmail,
        contactId: this.srcontactDeatils?.contact?.id,
        contactName: this.srcontactDeatils?.contact?.firstName + ' ' + this.srcontactDeatils?.contact?.lastName,
        contactPhone: this.srcontactDeatils?.contact?.primaryPhoneNumber,
        deviceInfo: this.deviceInfo?.userAgent,
        loggedInUserId: this.authService.getUser(),
        passengerCount: Number(total),
        productId: hoteldata?.id,
        serviceRequestId: this.srcontactDeatils?.requestId,
        serviceRequestLineId: data?.srLine?.id,
        travelDateOrCheckInDate: formData?.srLine.lineCheckInDate,
      };

      return SUMMARYDATA;
    }
  }



  getSupplierDetailes() {
    this.dashboardRequestService
      .getAllSupplierData(SUPPLIPER_URL.getAllSupplier)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((supplierData: any) => {
        const result: ApiResponse = supplierData;
        if (result.status === 200) {
          //this.supplierDeatils = result.data;
          if (result?.data?.length > 0) {
            let data: any = result.data;
            data?.forEach((element) => {
              element.isSelected = false;
            });
            this.supplierDeatils = result.data;
          }

          this.cdr.markForCheck();
        } else {
          this.toastr.error('Oops! Something went wrong while fetching the supplier data please try again.', 'Error');
          this.cdr.markForCheck();
        }
      });
  }

  isAllSelected() {
    this.isMasterSelected = this.supplierDeatils.every((item: any) => {
      return item.isSelected == true;
    });
    this.getCheckedItemList();
  }
  getCheckedItemList() {
    this.checkedSupplierList = [];
    this.flightRfq = [];
    this.hotelRfq = [];
    this.attractionsRfq = [];
    this.anxRequestRfq = [];
    this.contactDeatils = [];
    for (let i = 0; i < this.supplierDeatils?.length; i++) {
      if (this.supplierDeatils[i]?.isSelected) {
        const element = this.supplierDeatils[i];
        const RfqSupplierRelation = {
          requestId: Number(this.requestId),
          requestLineId: null,
          status: 1,
          supplierId: element?.customerId,
          createdBy: this.authService.getUser(),
          updatedBy: this.authService.getUser(),
          email: element.primaryEmail,
        };
        this.checkedSupplierList.push(RfqSupplierRelation);
        if (element?.primaryConatct && element?.primaryPhoneNumber) {
          const contact = {
            contact_number: Number(element.primaryPhoneNumber),
            contact_name: element.primaryConatct,
            sender_id: this.authService.getUser(),
            message: `Hi ${element.primaryConatct},
We sent RFQ please review and provide your options.

Click below to provide options for RFQ SR # ${Number(this.requestId)}

http://travcbt.dev.com/pages/login`,
            module: this.messageModuleName,
            module_id: this.messageModuleID,
            reference: Number(this.requestId),
            sub_reference: 0,
            supplier_id: element?.customerId,
          };
          this.contactDeatils.push(contact);
        }
      }
    }

    //console.log('supplier details', this.checkedSupplierList);
    //console.log(this.contactDeatils);
  }

  onChangeProductDetails(isChecked: boolean, actionType: string) {
    if (actionType === 'all') {
      this.isAllMasterSelected = isChecked;
      this.itineraryInfo.forEach((element) => {
        element.isChecked = this.isAllMasterSelected;
      });
    } else {
      this.isAllMasterSelected = this.itineraryInfo?.every((item: any) => {
        return item.isChecked == true;
      });
    }
  }

  onCreateRfqForSelectedProducts() {
    if (this.itineraryInfo?.length > 0) {
      let rfq_segment_array: any[] = [];
      let addonsRoutesData: any[] = [];
      let flightAddons: any[] = [];
      let attractions: any[] = [];

      for (let mainindex = 0; mainindex < this.itineraryInfo?.length; mainindex++) {
        const mainelement = this.itineraryInfo[mainindex];
        if (mainelement?.key === 'flight') {
          const flightelement = mainelement;
          if (flightelement.isChecked) {
            if (flightelement?.addOns?.length > 0) {
              for (let addonsindex = 0; addonsindex < flightelement.addOns?.length; addonsindex++) {
                const addonselement = flightelement.addOns[addonsindex];
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
                const addonsRoutes = {
                  routeNo: mainindex + 1,
                  selectedAllGroup: 'Select All',
                  route: flightelement?.segmentBoardPoint + '-' + flightelement?.segmentOffPoint,
                };
                addonsRoutesData.push(addonsRoutes);
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
                flightAddons.push(addonsObject);
              }
            }
            const rfq_segment_data = {
              requestID: Number(this.requestId),
              requestlineID: Number(flightelement?.flightrequestlineID),
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
              airlineCode: null,
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
              createdBy: this.authService.getUser(),
              createdDate: this.todaydateAndTimeStamp,
            };
            rfq_segment_array.push(rfq_segment_data);
            let flightSuppliers: any[] = [];
            if (this.checkedSupplierList?.length > 0) {
              for (let supplierindex = 0; supplierindex < this.checkedSupplierList?.length; supplierindex++) {
                const supplierElement = this.checkedSupplierList[supplierindex];
                const flightSupplier = {
                  requestId: Number(this.requestId),
                  requestLineId: Number(flightelement?.flightrequestlineID),
                  status: 1,
                  supplierId: supplierElement.supplierId,
                  createdBy: this.authService.getUser(),
                  updatedBy: this.authService.getUser(),
                  email: supplierElement?.email,
                };
                flightSuppliers.push(flightSupplier);
              }
            } /* else {
                flightSuppliers = [];
              } */

            const flightRfqData = {
              rfqLine: {
                requestId: Number(this.requestId),
                requestLineId: Number(flightelement?.flightrequestlineID),
                tripTypeId: 11,
                typeOfFlight: '11',
                noofADT: flightelement.adtCount,
                noofCHD: flightelement.chdCount,
                noofINF: flightelement.infCount,
                connectingDetails: null,
                flexStops: [],
                passengerTypeId: null,
                createdBy: this.authService.getUser(),
                createdDate: this.todaydateAndTimeStamp,
                expandableParametersCode: [],
                dealCode: [],
                addons: flightAddons,
              },
              rfqSegments: rfq_segment_array,
              rfqSupplierRelation: flightSuppliers,
            };
            this.flightRfq.push(flightRfqData);
          } /* else {
              this.flightRfq = [];
            } */
        }
        if (mainelement?.key === 'hotel') {
          const hotelelement = mainelement;
          if (hotelelement.isChecked) {
            let hotelSuppliers: any[] = [];
            if (this.checkedSupplierList?.length > 0) {
              for (let supplierindex = 0; supplierindex < this.checkedSupplierList?.length; supplierindex++) {
                const supplierElement = this.checkedSupplierList[supplierindex];
                const hotelSuppliersData = {
                  requestId: Number(this.requestId),
                  requestLineId: Number(hotelelement.hotelrequestlineID),
                  status: 1,
                  supplierId: supplierElement.supplierId,
                  createdBy: this.authService.getUser(),
                  updatedBy: this.authService.getUser(),
                  email: supplierElement?.email,
                };
                hotelSuppliers.push(hotelSuppliersData);
              }
            } /* else{
                hotelSuppliers=[];
              } */

            let hotel_pax_info: any[] = [];

            if (hotelelement.paxInfo?.length > 0) {
              for (let sub_index = 0; sub_index < hotelelement?.paxInfo?.length; sub_index++) {
                const hotel_pax_sub_element = hotelelement?.paxInfo[sub_index];
                const pax_info = {
                  passengerSrId: Number(this.requestId),
                  passengerLineId: Number(hotelelement.hotelrequestlineID),
                  //passengerRoomId: 0,
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
            let roomsArray: any[] = [];
            let totalAdultsCount = 0;
            let totalCHDCount = 0;
            let totalINFCount = 0;

            if (hotelelement?.roomsInfo?.length > 0) {
              for (let index = 0; index < hotelelement?.roomsInfo.length; index++) {
                const roomCountElement = hotelelement?.roomsInfo[index];
                totalAdultsCount+= roomCountElement.roomAdultCount;
                totalCHDCount+= roomCountElement.roomChildCount;
                totalINFCount+= roomCountElement.roomInfantCount;
                const roomsInfoData = {
                  //id:'',
                  roomSrId: Number(this.requestId),
                  roomLineId: Number(hotelelement.hotelrequestlineID),
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
                roomsArray.push(roomsInfoData);
              }
            }else{
              totalAdultsCount = hotelelement.adtCount;
              totalCHDCount = hotelelement.chdCount + hotelelement.infCount;
              //totalINFCount = hotel_element.infCount;
              totalINFCount = 0;
               let noRoomAdtCount=0;
               let noRoomChdCount=0;
               let noRoomInfCount=0;
               if(hotelelement.paxInfo?.length>0){
                const groupByCategory = hotelelement.paxInfo?.reduce((group, product) => {
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
                  noRoomInfCount= 0;
                }
               }else{
                noRoomAdtCount = hotelelement.adtCount;
                noRoomChdCount = hotelelement.chdCount;
               }
               const roomsInfoData = {
                //id:'',
                roomSrId: Number(this.requestId),
                roomLineId: Number(hotelelement.hotelrequestlineID),
                //roomNumber: hotelelement?.roomNumber === ""?0:Number(hotelelement?.roomNumber),
                roomNumber:  1,
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
              roomsArray.push(roomsInfoData);
            }

            const location_info =
              hotelelement.hotelCityName +
              ' ' +
              hotelelement.hotelCountryName +
              '(' +
              hotelelement.hotelCountryCode +
              ')';
            const rfqHotelData = {
              srLine: {
                lineLatitude: null,
                lineLongitude: null,
                lineRadius: null,
                lineSrId: Number(this.requestId),
                lineSrLineId: Number(hotelelement.hotelrequestlineID),
                lineCountry: hotelelement.hotelCountryName,
                lineCity: hotelelement.hotelCityName,
                lineLocation: location_info,
                lineHotelName: hotelelement.hotelName,
                linePropertyType: null,
                lineMealType: null,
                lineCheckInDate: hotelelement.checkInDate,
                lineCheckOutDate: hotelelement.checkOutDate,
                lineNoOfNights: hotelelement.noOfDays,
                lineRoomCount: hotelelement.roomsCount === null|| hotelelement.roomsCount === undefined || hotelelement.roomsCount === " " ? 1 :  hotelelement.roomsCount,
                lineCountryResidency: null,
                lineNationality: null,
                lineRatings: Number(hotelelement.hotelRating),
                lineMarkUpType: null,
                lineMarkupAmount: null,
                lineMarkupPercentage: null,
                /* lineAdultCount: hotelelement.adtCount,
                lineChildCount: hotelelement.chdCount,
                lineInfantCount: hotelelement.infCount, */
                lineAdultCount: totalAdultsCount,
                lineChildCount: totalCHDCount,
                lineInfantCount: totalINFCount,
                lineTotalDays: hotelelement.noOfDays,
                lineSearchType: "Normal",
                lineAddonsRequired: 0,
                lineApis: null,
                lineCreatedBy: this.authService.getUser(),
                lineCreatedDate: this.todaydateAndTimeStamp,
                lineCreatedDevice: this.deviceInfo?.userAgent,
                lineCreatedIp: null,
                lpoDate: null,
                lpoAmount: 0.0,
                lpoNumber: null,
              },
              srRooms: roomsArray,
              supplierRelation: hotelSuppliers,
            };
            this.hotelRfq.push(rfqHotelData);

            if (hotelelement?.addOns?.length > 0) {
              for (let hotelAddonsindex = 0; hotelAddonsindex < hotelelement?.addOns?.length; hotelAddonsindex++) {
                const hotelAddonselement = hotelelement?.addOns[hotelAddonsindex];
                let roomsPax = [];
                if (hotelelement?.roomsInfo?.length > 0) {
                  for (let index = 0; index < hotelelement?.roomsInfo.length; index++) {
                    const element = hotelelement?.roomsInfo[index];
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
                            roomsPax?.push(null);
                            console.log('No such paxType exists!');
                            break;
                        }
                      }
                    }
                  }
                }
                let roomNights = [];
                if (hotelelement.noOfDays > 0) {
                  for (let roomNightsIndex = 1; roomNightsIndex <= hotelelement.noOfDays; roomNightsIndex++) {
                    roomNights.push(roomNightsIndex);
                  }
                }

                const hotelAddonsobject = {
                  addonSrId: Number(this.requestId),
                  roomsCount: hotelelement?.roomsCount,
                  addonLineId: 0,
                  addonRoomId: 0,
                  addonTitle: hotelAddonselement?.addOnName,
                  addonPassengerId: 0,
                  // addonPassengers: roomsPax?.length===0?null: roomsPax?.toString(),
                  addonPassengers: null,
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
              }
            }
          } /* else {
              this.hotelRfq = [];
            } */
        }

        if (mainelement.key === 'attractions') {
          const attractions_element = mainelement;
          let attractions_lines: any[] = [];
          if (attractions_element.isChecked) {

            let attractions_pax: any[] = [];
            if (attractions_element.paxDetails?.length > 0) {
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
                if(mainelement?.paxInfo.length>0){
                  anxPax = mainelement?.paxInfo?.filter((v) => {
                    for (let index = 0; index < attractionsPax?.length; index++) {
                      if (v.assign === attractionsPax[index]?.assign && v.paxCode === attractionsPax[index]?.paxCode) {
                        return v;
                      }
                    }
                  });


                }

             if(anxPax?.length >0){
              for (let index = 0; index < anxPax?.length; index++) {
                const sub_element = anxPax[index];
                const attractions_pax_info = {
                  attractionLinePassengerDob: sub_element.dob === null ? null:sub_element.dob,
                  attractionLinePassengerEmail: sub_element.email,
                  attractionLinePassengerFristName: sub_element.firstName,
                  attractionLinePassengerGender: null,
                  attractionLinePassengerLastName: sub_element.lastName,
                  attractionLinePassengerMiddleName: null,
                  attractionLinePassengerPhone: sub_element.phone,
                  attractionLinePassengerTitle: sub_element.prefix,
                  attractionLinePassengerType: sub_element.paxCode,
                  attractionLinePaxId: sub_element.paxId,
                  attractionLinePassengerCreatedBy: this.authService.getUser(),
                  attractionLinePassengerCreatedDate: this.todaydateAndTimeStamp,
                  attractionLinePassengerCreatedDevice: this.deviceInfo?.userAgent,
                  attractionLinePassengerCreatedIp: "string",
                };
                attractions_pax.push(attractions_pax_info);
              }
             }

            }

            const attractionsLines = {
              attractionHeaderId: attractions_element?.attractionrequestlineID,
              attractionLineId: Number(attractions_element?.attractionLineId),
              attractionId: attractions_element.attractionID,
              attractionLineCity: attractions_element.city,
              attractionLineCountry: attractions_element.country,
              attractionLineDate: attractions_element?.daysList[0],
              attractionLineDay: 0,
              attractionLineStatus: 0,
              attractionRequestId: Number(this.requestId),
              attractionLineLocation: attractions_element.location === null?attractions_element.city: attractions_element.location,
              attractionLineName: attractions_element.attractionName,
              attractionLinePaxCount: attractions_element.paxCount === null ? 0 : attractions_element.paxCount,
              //passengers:attractions_element.paxDetails
              //passengers: [],
              passengers: attractions_pax,
              attractionLineCreatedBy: this.authService.getUser(),
              attractionLineCreatedDate: this.todaydateAndTimeStamp,
              attractionLineCreatedDevice: this.deviceInfo?.userAgent,
              attractionLineCreatedIp: null,
            };
            attractions_lines.push(attractionsLines);


            if(attractions_lines.length>0){
              for (let index = 0; index < attractions_lines.length; index++) {
                const element = attractions_lines[index];
                const attraction_info_data = {
                  attractionAttribute1: 'string',
                  attractionAttribute2: 'string',
                  attractionAttribute3: 'string',
                  attractionCreatedBy: this.authService.getUser(),
                  attractionCreatedDevice: this.deviceInfo?.userAgent,
                  attractionCreatedDate: this.todaydateAndTimeStamp,
                  attractionCreatedIp: 'string',
                  attractionDescription: 'string',
                  attractionStatus: 0,
                  attractionName:element?.attractionLineName,
                  attractionRequestId: Number(this.requestId),
                  attractionRequestLineId: attractions_element?.attractionrequestlineID,
                  lines: [element],
                };
                this.attractionsRfq.push(attraction_info_data);
              }
            }
            //if (attractions_index === 0) {
           /*  const attraction_info_data = {
              attractionAttribute1: 'string',
              attractionAttribute2: 'string',
              attractionAttribute3: 'string',
              attractionCreatedBy: this.authService.getUser(),
              attractionCreatedDevice: this.deviceInfo?.userAgent,
              attractionCreatedDate: this.todaydateAndTimeStamp,
              attractionCreatedIp: 'string',
              attractionDescription: 'string',
              attractionStatus: 0,
              attractionName: `Package-Attractions-${Number(this.requestId)}`,
              attractionRequestId: Number(this.requestId),
              attractionRequestLineId: attractions_element?.attractionrequestlineID,
              lines: attractions_lines,
            };
            this.attractionsRfq.push(attraction_info_data); */
          } /* else {
              console.log('else');
              this.attractionsRfq = [];
            } */
        }
        if (mainelement?.key === 'anx') {
          const anxelement = mainelement;
          if (anxelement.isChecked) {
            this.anxRequestRfqDataCoversion(mainelement);
          }
        }
      }
    }

    if (this.checkedSupplierList?.length > 0) {
      for (let supplierindex = 0; supplierindex < this.checkedSupplierList?.length; supplierindex++) {
        const supplierElement = this.checkedSupplierList[supplierindex];
        const attractionSuppliersData = {
          requestId: Number(this.requestId),
          requestLineId: this.attractionsRequestLineid,
          status: 1,
          supplierId: supplierElement.supplierId,
          createdBy: this.authService.getUser(),
          createdDate: this.todaydateAndTimeStamp,
          updatedBy: this.authService.getUser(),
          email: supplierElement?.email,
        };
        this.attractionsSupplier.push(attractionSuppliersData);
      }
    } else {
      this.attractionsSupplier = [];
    }

    if (
      this.flightRfq?.length === 0 &&
      this.hotelRfq?.length === 0 &&
      this.attractionsRfq?.length === 0 &&
      this.anxRequestRfq?.length === 0
    ) {
      this.flightRfq = [];
      this.hotelRfq = [];
      this.attractionsRfq = [];
      this.anxRequestRfq = [];
      this.hotelAddons = [];
      return this.toastr.error('please select at least one product ', 'Error');
    }
    if (this.checkedSupplierList?.length === 0 || this.checkedSupplierList === undefined) {
      //this.flightRfq=[];
      //this.hotelRfq=[];
      //this.attractionsRfq=[];
      //this.anxRequestRfq=[];
      return this.toastr.error('please select at least one  supplier ', 'Error');
    }
   /*  console.log('flightRfq', this.flightRfq);
    console.log('hotelRfq', this.hotelRfq);
    console.log('hotelRfq addons', this.hotelAddons);
    console.log('attraction rfq', this.attractionsRfq);
    console.log('anx rfq',  this.anxRequestRfq);
    console.log('attraction rfq supplier', this.attractionsSupplier);
    console.log('checkedSupplierList', this.checkedSupplierList);
    return; */
    this.generateSequenceNo(
      Number(this.requestId),
      this.flightRfq,
      this.hotelRfq,
      this.attractionsRfq,
      this.attractionsSupplier,
      this.anxRequestRfq,
    );
    //this.onSubmitRfq(this.flightRfq, this.hotelRfq,this.attractionsRfq,this.attractionsSupplier);
  }

  async generateSequenceNo(
    srId: number,
    flight: any[],
    hotel: any[],
    attractions: any[],
    attractionsSupplier: any[],
    anx: any[]
  ) {

    this.showSpinner();
    this.requestCreationLoading=true;
    try{
     const sequenceNumberResponse= await  this.dashboardAsyncApiServices.generateSequenceNo(srId, RFQSequenceNo.generateSequenceNo);
     if (sequenceNumberResponse?.rfqId) {
      await this.onSubmitRfq(flight, hotel, attractions, attractionsSupplier, sequenceNumberResponse?.rfqId, anx);
    }
    }catch(error){
      this.toastr.error('Oops! Something went wrong  while generate sequence number please try again', 'Error');
    }
  }


  public showSpinner(): void {
    this.spinnerService.show();
    /* setTimeout(() => {
      this.spinnerService.hide();
    }, 5000); // 5 seconds */
  }
  async onSubmitRfq(
    flight: any[],
    hotel: any[],
    attractions: any[],
    attractionSuppliers: any[],
    sequenceRfqNo: number,
    anx: any[]
  ) {


    let anxDataLength = anx?.length;
    let intialAnxIndex = 0;
    let saveAddonsArray = [];
    let subAllRequestsApis = [];
    let saveHotelAddonsArray = [];
    if (flight?.length > 0) {
      const saveFlightRFQ = {
        rfqLine: flight[0]?.rfqLine,
        rfqSegments: flight[0]?.rfqSegments,
        rfqSupplierRelation: flight[0]?.rfqSupplierRelation,
      };
      try{
        await this.dashboardAsyncApiServices.createRFQFlight(saveFlightRFQ, sequenceRfqNo);
        this.toastr.success(`Flight RFQ sent  successfuly !`, 'Success');
      }catch(error){
        this.toastr.error('Oops! Something went wrong  while send the flight rfq data please try again', 'Error');
      }
    }

    if (hotel?.length > 0) {
      for (let hotel_index = 0; hotel_index < hotel?.length; hotel_index++) {
        const hotelRfqElement = hotel[hotel_index];
        try{
        const hotelRFQResponse:any=await this.dashboardAsyncApiServices.createRFQHotel(hotelRfqElement, HOTEL_RFQ_LIST.createRfqRequest, sequenceRfqNo);
        if (hotelRFQResponse) {
          if (this.hotelAddons?.length > 0) {
            for (let hotelAddonsIndex = 0; hotelAddonsIndex < this.hotelAddons?.length; hotelAddonsIndex++) {
              const hotelAddonsElement = this.hotelAddons[hotelAddonsIndex];
              const hotelAddonsobject = {
                addonSrId: Number(this.requestId),
                addonLineId: hotelRFQResponse?.srLine?.lineSrLineId,
                addonRoomId: hotelRFQResponse?.srRooms[0]?.id,
                addonFor:  hotelRFQResponse?.srRooms?.length>0  ? 'R' : 'P',
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
          saveAddonsArray = saveAddonsArray?.filter((obj, index) => {
            return index === saveAddonsArray?.findIndex((o) => obj.addonTitle === o.addonTitle);
          });

        }
        this.toastr.success(`Hotel RFQ sent  successfuly !`, 'Success');
        }catch(error){
          this.toastr.error('Oops! Something went wrong  while send the hotel rfq data please try again', 'Error');
        }
      }

      if (saveAddonsArray?.length > 0) {
        for (let index = 0; index < saveAddonsArray?.length; index++) {
          const element = saveAddonsArray[index];
          saveHotelAddonsArray=[];
          saveHotelAddonsArray.push(element);
          subAllRequestsApis.push(
            this.dashboardRequestService.createAddons(saveHotelAddonsArray, HOTEL_RFQ_LIST.createHotelAddons)
          );
        }
      }
      if (subAllRequestsApis?.length > 0) {
        forkJoin(subAllRequestsApis).pipe(takeUntil(this.ngDestroy$)).subscribe((results) => {
          console.log('hotel rfq addons saved');
        });
      }
    }
    if (attractions?.length > 0 && attractionSuppliers?.length > 0) {
      let rfqSuppliers: any = [];
      for (let index = 0; index < attractions.length; index++) {
        const element = attractions[index];
        try{
          const attractionRfqResponse= await this.dashboardAsyncApiServices.saveRfqAttractions(element, RFQAttractions.rfqAttractionsRequest, sequenceRfqNo);

          if (attractionRfqResponse?.rfqAttractionId &&attractionSuppliers?.length>0) {
            for (let index = 0; index < attractionSuppliers?.length; index++) {
              const element = attractionSuppliers[index];
              const attractionSuppliersInfo = {
                requestId: Number(this.requestId),
                requestLineId: attractionRfqResponse?.attractionRequestLineId,
                status: 1,
                rfqId: attractionRfqResponse?.rfqAttractionId,
                supplierId: element?.supplierId,
                createdBy: this.authService.getUser(),
                createdDate: this.todaydateAndTimeStamp,
                updatedBy: this.authService.getUser(),
                email: element?.email,
              };
              rfqSuppliers.push(attractionSuppliersInfo);
            }
            this.toastr.success(`Attractions RFQ sent  successfuly !`, 'Success');
          }

        }catch(error){
          this.toastr.error('Oops! Something went wrong  while send the attrcations rfq data please try again', 'Error');
        }
      }

      if (rfqSuppliers?.length > 0) {
        /* rfqSuppliers = rfqSuppliers?.filter((obj, index) => {
          return index === rfqSuppliers?.findIndex((o) => obj.supplierId === o.supplierId);
        }); */
        this.onSaveAttractionsRfqSupplier(rfqSuppliers);
      }
    }


    if (anx && anx?.length > 0) {
      let anxRfqApis: any[] = [];
      let anxRfqPaxApis: any[] = [];
      let anxRfqSupplierApis: any[] = [];
      let anxRfqSuppliers: any = [];
      for (let anxindex = 0; anxindex < anx?.length; anxindex++) {
        const anxelement = anx[anxindex];

        try{
         const anxRfqResponses =await this.dashboardAsyncApiServices.saveRfqAncillary(anxelement.anx, RFQ_Ancillary.create, sequenceRfqNo);

          const pax = this.anxPaxDataConversion(anxelement?.paxInfo);
          if (pax?.length > 0) {
            const paxPayload = {
              paxData: pax,
              requestId: Number(this.requestId),
              requestLineId: anxRfqResponses?.anxLineId,
              createdBy: this.authService.getUser(),
              updatedBy: this.authService.getUser(),
            };
           await this.dashboardAsyncApiServices.savePaxRfqAncillary( paxPayload,
            sequenceRfqNo,
            RFQ_Ancillary.createModifyRequestLinePax);
          }

          if (attractionSuppliers?.length > 0) {

            for (let supplierindex = 0; supplierindex < attractionSuppliers?.length; supplierindex++) {
              const supplierElement = attractionSuppliers[supplierindex];
              const anxSuppliersInfo = {
                requestId: Number(this.requestId),
                requestLineId: anxRfqResponses?.anxLineId,
                status: 1,
                rfqId: anxRfqResponses?.anxRfqId,
                supplierId: supplierElement?.supplierId,
                createdBy: this.authService.getUser(),
                createdDate: this.todaydateAndTimeStamp,
                updatedBy: this.authService.getUser(),
                email: supplierElement?.email,
              };

              anxRfqSuppliers.push(anxSuppliersInfo);


            }
          }
        }catch(error){
          this.toastr.error('Oops! Something went wrong  while send the ancillary rfq data please try again', 'Error');
        }
      }

      if (anxRfqSuppliers?.length > 0) {
        /* anxRfqSuppliers = anxRfqSuppliers?.filter((obj, index) => {
          return index === anxRfqSuppliers?.findIndex((o) => obj.requestLineId === o.requestLineId);
        }); */


        anxRfqSupplierApis.push(
          this.rfqServices.ancillaryRfqSupplierRealtion(
            anxRfqSuppliers,
            RFQ_Ancillary.ancillary_supplier_relation
          )
        );
      }

      if (anxRfqSupplierApis?.length > 0) {
        forkJoin(anxRfqSupplierApis).pipe(takeUntil(this.ngDestroy$)).subscribe((results) => {
          console.log('anx supplier  rfq data saved');
        });
      }

    }

    if (this.checkedSupplierList?.length > 0) {
      for (let index = 0; index < this.checkedSupplierList?.length; index++) {
        const element = this.checkedSupplierList[index];
        const contactElement = this.contactDeatils[index];
        if (element?.email && element?.requestId) {
          try {
            const emailResponse=await this.rfqServices.sendRFQEmails(
              this.checkedSupplierList[index].email,
              this.authService.getUserName(),
              this.checkedSupplierList[index].requestId
            );
            if(emailResponse){
              this.toastr.success('mail sent successfully..', 'Success');
            }

          } catch (error) {
            console.log(error);
            this.toastr.error('mail send failed', 'Error');
          }
          try {

            const messageResponse=await this.rfqServices.sendWaMessages(contactElement, whatsAppUrl.sendWaMessageRFQ);
            if(messageResponse){
              this.toastr.success('Message sent successfully..', 'Success');
            }
          } catch (error) {
            console.log(error);
            this.toastr.error('message send failed', 'Error');
          }
        }

      }

    }
    this.requestCreationLoading=false;
    this.reloadComponent();
  }

  onSaveAttractionsRfq(attractions: any, suppliers: any[], sequenceRfqNo: number,attractionsIndex:number) {
    this.rfqServices.saveRfqAttractions(attractions, RFQAttractions.rfqAttractionsRequest, sequenceRfqNo).pipe(takeUntil(this.ngDestroy$)).subscribe(
      (data: any) => {
        if (data?.rfqAttractionId) {
          let rfqSuppliers: any = [];
          for (let index = 0; index < suppliers?.length; index++) {
            const element = suppliers[index];
            const attractionSuppliersInfo = {
              requestId: Number(this.requestId),
              requestLineId: this.attractionsRequestLineid[attractionsIndex],
              status: 1,
              rfqId: data?.rfqAttractionId,
              supplierId: element?.supplierId,
              createdBy: this.authService.getUser(),
              createdDate: this.todaydateAndTimeStamp,
              updatedBy: this.authService.getUser(),
              email: element?.email,
            };
            rfqSuppliers.push(attractionSuppliersInfo);
          }
          if (rfqSuppliers?.length > 0) {
            this.onSaveAttractionsRfqSupplier(rfqSuppliers);
          }
          console.log('rfq attractions data saved');
          //this.onSaveAttractionsRfqSupplier(suppliers);
          this.toastr.success(`Attractions RFQ sent  successfuly !`, 'Success');
        }
      },
      (error) => {
        if (error === '') {
          this.toastr.error(
            'Oops! Something went wrong  while send the attractions rfq data please try again',
            'Error'
          );
        } else {
          this.toastr.error(error, 'Error');
        }
      }
    );
  }
  onSaveAttractionsRfqSupplier(supplier) {
    this.rfqServices.rfqAttractionsSupplier(supplier, RFQAttractions.rfqAttractionsSupplier).pipe(takeUntil(this.ngDestroy$)).subscribe(
      (data: any) => {
        if (data) {
          console.log('rfq attractions suplier  data saved');
        }
      },
      (error) => {
        if (error === '') {
          this.toastr.error(
            'Oops! Something went wrong  while send the attractions rfq  supplier data please try again',
            'Error'
          );
        } else {
          this.toastr.error(error, 'Error');
        }
      }
    );
  }


  showProductDetailsInfo(index) {
    this.hideme[index] = !this.hideme[index];
  }

  backToRedirectSource() {
    const requestId = this.route.snapshot.queryParams.requestId;
    const contactId = this.route.snapshot.queryParams.contactId;
    const holidaysLineId = this.route.snapshot.queryParams.holidaysLineId;
    if (requestId && contactId && holidaysLineId) {
      this.router.navigate([`/dashboard/booking/holidays`], {
        queryParams: { requestId: requestId, contactId: contactId, holidaysLineId: holidaysLineId },
      });
    }
  }
  reloadComponent() {
    const requestId = this.route.snapshot.queryParams.requestId;
    const contactId = this.route.snapshot.queryParams.contactId;
    const holidaysLineId = this.route.snapshot.queryParams.holidaysLineId;
    const from = this.route.snapshot.queryParams.from;
    const rfq = this.route.snapshot.queryParams.rfq;
    const flightRequestLineId = this.route.snapshot.queryParams.flightRequestLineId;
    const hotelRequestLineId = this.route.snapshot.queryParams.hotelRequestLineId;
    const attractionRequestLineId = this.route.snapshot.queryParams.attractionRequestLineId;
    const attractionsLinesId = this.route.snapshot.queryParams.attractionsLinesId;
    const anxLineId = this.route.snapshot.queryParams.anxLineId;
    if (requestId && contactId && holidaysLineId && from) this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
      this.router.navigate([`/dashboard/booking/package-itinerary`], {
      queryParams: {
        requestId: requestId,
        contactId: contactId,
        holidaysLineId: holidaysLineId,
        from: from,
        rfq: rfq,
        flightRequestLineId: flightRequestLineId,
        hotelRequestLineId: hotelRequestLineId,
        attractionRequestLineId: attractionRequestLineId,
        attractionsLinesId: attractionsLinesId,
        anxLineId: anxLineId,
        actionType:'rfq',
        productsAvailability: true
      },
    });
    /* this.router.navigate([`/dashboard/booking/package-itinerary`], {
      queryParams: {
        requestId: requestId,
        contactId: contactId,
        from: 'package',
        holidaysLineId: holidaysLineId,
        actionType: 'rfq',
        productsAvailability: true,
      },
    }); */
  }


  //get-service-request due to contact id purposes
  getServiceData(requestId) {
    this.dashboardRequestService.getSrRequest(requestId).pipe(takeUntil(this.ngDestroy$)).subscribe(
      (resHeaderdata: any) => {
        if (resHeaderdata) {
          this.srcontactDeatils = resHeaderdata;
          this.cdr.markForCheck();
        } else {
          this.toastr.error(
            'Oops! Something went wrong while fetching the request data please try again  ',
            'Error'
          );
        }
      },
      (error) => {
        this.toastr.error('Oops! Something went wrong while fetching the SR Data  ', 'Error');
      }
    );
  }

  trackByFn(index, item) {
    return index;
  }
  getQueryParams(){
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param && param.requestId) {
        this.requestId = Number(param.requestId);
        this.getServiceData( this.requestId );
        this.getPackageDetailedInfo(this.requestId);
        //this.fetchCustomerDetailsBySrId(this.requestId);
      }
    });

  }
  ngOnInit(): void {
    this.keys = this.authService.getPageKeys();
    this.epicFunction();
    this.getProductType();
    this.getMasterClass();
    this.getRequestContactDetails();
    this.getQueryParams();
    //back button disabled
   /*  history.pushState(null, '');
    fromEvent(window, 'popstate')
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((_) => {
        this.toastr.info(`Please use the back button`,"INFO");
        history.pushState(null, '');
      }); */

  }
  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
    if (this.layoutSub) {
      this.layoutSub.unsubscribe();
    }
  }
}
