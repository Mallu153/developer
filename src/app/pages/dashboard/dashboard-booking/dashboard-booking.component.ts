import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Route, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { filter } from 'rxjs/operators';
import { DashboardRequestService } from '../dashboard-request/services/dashboard-request.service';
import { ApiResponse } from './../dashboard-request/model/api-response';
import * as apiUrls from './../dashboard-request/url-constants/url-constants';
import { ShareRequestIdService } from './share-data-services/share-requestId.service';
import { Title } from '@angular/platform-browser';
import { SrSummaryDataService } from './share-data-services/srsummarydata.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AncillarySelectComponent } from '../dashboard-request/components/search-result/ancillary-select/ancillary-select.component';
import { TeamDataDataService } from './share-data-services/team-data.service';
import { environment } from 'environments/environment';
import { AuthService } from 'app/shared/auth/auth.service';
import { Subscription } from 'rxjs';
import { ProductsDataService } from './share-data-services/products-data';
import { RequestContactInfo } from 'app/shared/models/request-contact-info';
import { MasterDataService } from 'app/shared/services/master-data.service';
import { TicketApiResponse } from 'app/shared/models/wa-ticket-open';
import { PERMISSION_KEYS } from 'app/shared/data/app-premission-key';
import { LIABILITY } from 'app/shared/constant-url/deals-api-url';
import { LoginResponse } from 'app/shared/models/login-response';
@Component({
  selector: 'app-dashboard-booking',
  templateUrl: './dashboard-booking.component.html',
  styleUrls: ['./dashboard-booking.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardBookingComponent implements OnInit, OnDestroy {
  activeId: number; // Basic Navs
  // contactId
  contactId: any;
  contactsData: any;
  contactdetailsForm: FormGroup;
  requestId: number;
  shareReqId: any;
  shareContactId: any;
  pageTitle: string;
  isEdit = false;
  SrRequestLineApiResponse: any;
  //flight list hide
  public isFlightListCollapsed = true;
  public serviceRequestData: any;
  public srLineId: string;
  allServiceRequestsData: any[] = [];

  teamList: any[];
  teamMembersList: any[];
  transitionsList: any[];
  defaultStatusName: string;
  defaultStatusData: any;
  teamName: string;

  private eventsSubscription: Subscription;
  hide_product_details: boolean = true;
  productsAvailability: boolean = false;
  /**
   *
   *
   * request trip  form elements premissions
   */
  keys = [];
  requestDetailsTrip: string;
  calendarTrip: string;
  callTrip: string;
  mailTrip: string;
  chatTrip: string;
  videoCallTrip: string;
  whatsAppTrip: string;
  timeLineTrip: string;
  travelItineraryTrip: string;
  requestDependsList: string;

  requestDependsListeditView: string;
  requestDependsListSearch: string;
  requestDependsListChat: string;
  requestDependsListPhoneCall: string;
  requestDependsListEMail: string;
  requestDependsListPersonName: string;

  liability: number;
  userDetails: LoginResponse;
  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private route: ActivatedRoute,
    private dashboardRequestService: DashboardRequestService,
    private toastrService: ToastrService,
    private cdr: ChangeDetectorRef,
    private shareRequestId: ShareRequestIdService,
    private titleService: Title,
    private srSummaryData: SrSummaryDataService,
    private teamDataService: TeamDataDataService,
    private modalService: NgbModal,
    private authService: AuthService,
    private productsDataService: ProductsDataService,
    private masterDataServices: MasterDataService
  ) {
    this.getActiveRouter();
  }

  ngOnInit(): void {

    this.userDetails = this.authService.getUserDetails();


  }
  ngOnDestroy() {
    if (this.eventsSubscription) {
      this.eventsSubscription.unsubscribe();
    }
  }
  /**
   * Get active children url path and update the active id in the tabs
   */
  getActiveRouter(): void {

    this.getQueryParams();
    this.teamAndMemberData();
    this.router.events.pipe(filter((evt) => evt instanceof NavigationEnd)).subscribe(() => {
      if (this.activeRoute.firstChild && this.activeRoute.firstChild.routeConfig) {
        const activeRouter: Route = this.activeRoute.firstChild.routeConfig;
        if (activeRouter && activeRouter.path === 'flight') {
          this.activeId = 1;
          this.pageTitle = 'Flight Request ';
          this.requestDetailsTrip = PERMISSION_KEYS.BOOKING.FLIGHT.REQUEST_DETAILES.FLIGHT_REQUEST_TRIP;
          this.calendarTrip = PERMISSION_KEYS.BOOKING.FLIGHT.REQUEST_DETAILES.CALENDAR;
          this.callTrip = PERMISSION_KEYS.BOOKING.FLIGHT.REQUEST_DETAILES.CALL;
          this.mailTrip = PERMISSION_KEYS.BOOKING.FLIGHT.REQUEST_DETAILES.MAIL;
          this.chatTrip = PERMISSION_KEYS.BOOKING.FLIGHT.REQUEST_DETAILES.CHAT;
          this.videoCallTrip = PERMISSION_KEYS.BOOKING.FLIGHT.REQUEST_DETAILES.VIDEOCALL;
          this.whatsAppTrip = PERMISSION_KEYS.BOOKING.FLIGHT.REQUEST_DETAILES.WHATSAPP;
          this.timeLineTrip = PERMISSION_KEYS.BOOKING.FLIGHT.REQUEST_DETAILES.TIMELINE;
          this.travelItineraryTrip = PERMISSION_KEYS.BOOKING.FLIGHT.REQUEST_DETAILES.TRAVEL_ITINERARY;
          this.requestDependsList = PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_REQUEST_DEPEDNED_LIST;

          this.requestDependsListeditView = PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_REQUEST_DEPEDNED_LIST_EDIT_VIEW;
          this.requestDependsListSearch = PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_REQUEST_DEPEDNED_LIST_SEARCH;
          this.requestDependsListChat = PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_REQUEST_DEPEDNED_LIST_CHAT;
          this.requestDependsListPhoneCall = PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_REQUEST_DEPEDNED_LIST_PHONE_CALL;
          this.requestDependsListEMail = PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_REQUEST_DEPEDNED_LIST_MAIL;
          this.requestDependsListPersonName = PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_REQUEST_DEPEDNED_LIST_PERSON_NAME;
          this.keys = this.authService.getPageKeys();
          this.cdr.markForCheck();
        } else if (activeRouter && activeRouter.path === 'hotel') {
          this.activeId = 2;
          this.pageTitle = 'Hotel Request ';
          this.requestDetailsTrip = PERMISSION_KEYS.BOOKING.HOTEL.REQUEST_DETAILES.HOTEL_REQUEST_TRIP;
          this.calendarTrip = PERMISSION_KEYS.BOOKING.HOTEL.REQUEST_DETAILES.CALENDAR;
          this.callTrip = PERMISSION_KEYS.BOOKING.HOTEL.REQUEST_DETAILES.CALL;
          this.mailTrip = PERMISSION_KEYS.BOOKING.HOTEL.REQUEST_DETAILES.MAIL;
          this.chatTrip = PERMISSION_KEYS.BOOKING.HOTEL.REQUEST_DETAILES.CHAT;
          this.videoCallTrip = PERMISSION_KEYS.BOOKING.HOTEL.REQUEST_DETAILES.VIDEOCALL;
          this.whatsAppTrip = PERMISSION_KEYS.BOOKING.HOTEL.REQUEST_DETAILES.WHATSAPP;
          this.timeLineTrip = PERMISSION_KEYS.BOOKING.HOTEL.REQUEST_DETAILES.TIMELINE;
          this.travelItineraryTrip = PERMISSION_KEYS.BOOKING.HOTEL.REQUEST_DETAILES.TRAVEL_ITINERARY;
          this.requestDependsList = PERMISSION_KEYS.BOOKING.HOTEL.HOTEL_REQUEST_DEPEDNED_LIST;

          this.requestDependsListeditView = PERMISSION_KEYS.BOOKING.HOTEL.HOTEL_REQUEST_DEPEDNED_LIST_EDIT_VIEW;
          this.requestDependsListSearch = PERMISSION_KEYS.BOOKING.HOTEL.HOTEL_REQUEST_DEPEDNED_LIST_SEARCH;
          this.requestDependsListChat = PERMISSION_KEYS.BOOKING.HOTEL.HOTEL_REQUEST_DEPEDNED_LIST_CHAT;
          this.requestDependsListPhoneCall = PERMISSION_KEYS.BOOKING.HOTEL.HOTEL_REQUEST_DEPEDNED_LIST_PHONE_CALL;
          this.requestDependsListEMail = PERMISSION_KEYS.BOOKING.HOTEL.HOTEL_REQUEST_DEPEDNED_LIST_MAIL;
          this.requestDependsListPersonName = PERMISSION_KEYS.BOOKING.HOTEL.HOTEL_REQUEST_DEPEDNED_LIST_PERSON_NAME;
          this.keys = this.authService.getPageKeys();
          this.cdr.markForCheck();
        } else if (activeRouter && activeRouter.path === 'ancillary') {
          this.activeId = 3;
          this.pageTitle = 'Ancillary Request ';
          this.requestDetailsTrip = PERMISSION_KEYS.BOOKING.ANCILLARY.REQUEST_DETAILES.ANCILLARY_REQUEST_TRIP;
          this.calendarTrip = PERMISSION_KEYS.BOOKING.ANCILLARY.REQUEST_DETAILES.CALENDAR;
          this.callTrip = PERMISSION_KEYS.BOOKING.ANCILLARY.REQUEST_DETAILES.CALL;
          this.mailTrip = PERMISSION_KEYS.BOOKING.ANCILLARY.REQUEST_DETAILES.MAIL;
          this.chatTrip = PERMISSION_KEYS.BOOKING.ANCILLARY.REQUEST_DETAILES.CHAT;
          this.videoCallTrip = PERMISSION_KEYS.BOOKING.ANCILLARY.REQUEST_DETAILES.VIDEOCALL;
          this.whatsAppTrip = PERMISSION_KEYS.BOOKING.ANCILLARY.REQUEST_DETAILES.WHATSAPP;
          this.timeLineTrip = PERMISSION_KEYS.BOOKING.ANCILLARY.REQUEST_DETAILES.TIMELINE;
          this.travelItineraryTrip = PERMISSION_KEYS.BOOKING.ANCILLARY.REQUEST_DETAILES.TRAVEL_ITINERARY;
          this.requestDependsList = PERMISSION_KEYS.BOOKING.ANCILLARY.ANCILLARY_REQUEST_DEPEDNED_LIST;

          this.requestDependsListeditView = PERMISSION_KEYS.BOOKING.ANCILLARY.ANCILLARY_REQUEST_DEPEDNED_LIST_EDIT_VIEW;
          this.requestDependsListSearch = PERMISSION_KEYS.BOOKING.ANCILLARY.ANCILLARY_REQUEST_DEPEDNED_LIST_SEARCH;
          this.requestDependsListChat = PERMISSION_KEYS.BOOKING.ANCILLARY.ANCILLARY_REQUEST_DEPEDNED_LIST_CHAT;
          this.requestDependsListPhoneCall =
            PERMISSION_KEYS.BOOKING.ANCILLARY.ANCILLARY_REQUEST_DEPEDNED_LIST_PHONE_CALL;
          this.requestDependsListEMail = PERMISSION_KEYS.BOOKING.ANCILLARY.ANCILLARY_REQUEST_DEPEDNED_LIST_MAIL;
          this.requestDependsListPersonName =
            PERMISSION_KEYS.BOOKING.ANCILLARY.ANCILLARY_REQUEST_DEPEDNED_LIST_PERSON_NAME;
            this.keys = this.authService.getPageKeys();
            this.cdr.markForCheck();
        } else if (activeRouter && activeRouter.path === 'holidays') {


          this.activeId = 4;
          this.pageTitle = 'Holiday Packages Request ';
          this.requestDetailsTrip =
            PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.REQUEST_DETAILES.HOLIDAY_PACKAGE_REQUEST_TRIP;
          this.calendarTrip = PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.REQUEST_DETAILES.CALENDAR;
          this.callTrip = PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.REQUEST_DETAILES.CALL;
          this.mailTrip = PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.REQUEST_DETAILES.MAIL;
          this.chatTrip = PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.REQUEST_DETAILES.CHAT;
          this.videoCallTrip = PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.REQUEST_DETAILES.VIDEOCALL;
          this.whatsAppTrip = PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.REQUEST_DETAILES.WHATSAPP;
          this.timeLineTrip = PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.REQUEST_DETAILES.TIMELINE;
          this.travelItineraryTrip = PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.REQUEST_DETAILES.TRAVEL_ITINERARY;
          this.requestDependsList = PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_REQUEST_DEPEDNED_LIST;

          this.requestDependsListeditView =
            PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_REQUEST_DEPEDNED_LIST_EDIT_VIEW;
          this.requestDependsListSearch =
            PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_REQUEST_DEPEDNED_LIST_SEARCH;
          this.requestDependsListChat =
            PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_REQUEST_DEPEDNED_LIST_CHAT;
          this.requestDependsListPhoneCall =
            PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_REQUEST_DEPEDNED_LIST_PHONE_CALL;
          this.requestDependsListEMail =
            PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_REQUEST_DEPEDNED_LIST_MAIL;
          this.requestDependsListPersonName =
            PERMISSION_KEYS.BOOKING.HOLIDAY_PACKAGE.HOLIDAY_PACKAGE_REQUEST_DEPEDNED_LIST_PERSON_NAME;
            this.keys = this.authService.getPageKeys();
            this.cdr.markForCheck();
        } else if (activeRouter && activeRouter.path === 'activities') {
          this.activeId = 5;
          this.pageTitle = 'Activities Request ';

          this.requestDetailsTrip = PERMISSION_KEYS.BOOKING.ACTIVITIES.REQUEST_DETAILES.ACTIVITIES_REQUEST_TRIP;
          this.calendarTrip = PERMISSION_KEYS.BOOKING.ACTIVITIES.REQUEST_DETAILES.CALENDAR;
          this.callTrip = PERMISSION_KEYS.BOOKING.ACTIVITIES.REQUEST_DETAILES.CALL;
          this.mailTrip = PERMISSION_KEYS.BOOKING.ACTIVITIES.REQUEST_DETAILES.MAIL;
          this.chatTrip = PERMISSION_KEYS.BOOKING.ACTIVITIES.REQUEST_DETAILES.CHAT;
          this.videoCallTrip = PERMISSION_KEYS.BOOKING.ACTIVITIES.REQUEST_DETAILES.VIDEOCALL;
          this.whatsAppTrip = PERMISSION_KEYS.BOOKING.ACTIVITIES.REQUEST_DETAILES.WHATSAPP;
          this.timeLineTrip = PERMISSION_KEYS.BOOKING.ACTIVITIES.REQUEST_DETAILES.TIMELINE;
          this.travelItineraryTrip = PERMISSION_KEYS.BOOKING.ACTIVITIES.REQUEST_DETAILES.TRAVEL_ITINERARY;
          this.requestDependsList = PERMISSION_KEYS.BOOKING.ACTIVITIES.ACTIVITIES_REQUEST_DEPEDNED_LIST;

          this.requestDependsListeditView =
            PERMISSION_KEYS.BOOKING.ACTIVITIES.ACTIVITIES_REQUEST_DEPEDNED_LIST_EDIT_VIEW;
          this.requestDependsListSearch = PERMISSION_KEYS.BOOKING.ACTIVITIES.ACTIVITIES_REQUEST_DEPEDNED_LIST_SEARCH;
          this.requestDependsListChat = PERMISSION_KEYS.BOOKING.ACTIVITIES.ACTIVITIES_REQUEST_DEPEDNED_LIST_CHAT;
          this.requestDependsListPhoneCall =
            PERMISSION_KEYS.BOOKING.ACTIVITIES.ACTIVITIES_REQUEST_DEPEDNED_LIST_PHONE_CALL;
          this.requestDependsListEMail = PERMISSION_KEYS.BOOKING.ACTIVITIES.ACTIVITIES_REQUEST_DEPEDNED_LIST_MAIL;
          this.requestDependsListPersonName =
            PERMISSION_KEYS.BOOKING.ACTIVITIES.ACTIVITIES_REQUEST_DEPEDNED_LIST_PERSON_NAME;
            this.keys = this.authService.getPageKeys();
            this.cdr.markForCheck();
        } else if (activeRouter && activeRouter.path === 'service-request-communication-time-line') {
          this.requestDetailsTrip = PERMISSION_KEYS.BOOKING.TIME_LINE.REQUEST_DETAILES.TIME_LINE_REQUEST_TRIP;
          this.calendarTrip = PERMISSION_KEYS.BOOKING.TIME_LINE.REQUEST_DETAILES.CALENDAR;
          this.callTrip = PERMISSION_KEYS.BOOKING.TIME_LINE.REQUEST_DETAILES.CALL;
          this.mailTrip = PERMISSION_KEYS.BOOKING.TIME_LINE.REQUEST_DETAILES.MAIL;
          this.chatTrip = PERMISSION_KEYS.BOOKING.TIME_LINE.REQUEST_DETAILES.CHAT;
          this.videoCallTrip = PERMISSION_KEYS.BOOKING.TIME_LINE.REQUEST_DETAILES.VIDEOCALL;
          this.whatsAppTrip = PERMISSION_KEYS.BOOKING.TIME_LINE.REQUEST_DETAILES.WHATSAPP;
          this.timeLineTrip = PERMISSION_KEYS.BOOKING.TIME_LINE.REQUEST_DETAILES.TIMELINE;
          this.travelItineraryTrip = PERMISSION_KEYS.BOOKING.TIME_LINE.REQUEST_DETAILES.TRAVEL_ITINERARY;
          this.keys = this.authService.getPageKeys();
          this.cdr.markForCheck();
        } else if (activeRouter && activeRouter.path === 'package-itinerary') {
          this.requestDetailsTrip =
            PERMISSION_KEYS.BOOKING.PACKAGE_ITINERARY.REQUEST_DETAILES.PACKAGE_ITINERARY_REQUEST_TRIP;
          this.calendarTrip = PERMISSION_KEYS.BOOKING.PACKAGE_ITINERARY.REQUEST_DETAILES.CALENDAR;
          this.callTrip = PERMISSION_KEYS.BOOKING.PACKAGE_ITINERARY.REQUEST_DETAILES.CALL;
          this.mailTrip = PERMISSION_KEYS.BOOKING.PACKAGE_ITINERARY.REQUEST_DETAILES.MAIL;
          this.chatTrip = PERMISSION_KEYS.BOOKING.PACKAGE_ITINERARY.REQUEST_DETAILES.CHAT;
          this.videoCallTrip = PERMISSION_KEYS.BOOKING.PACKAGE_ITINERARY.REQUEST_DETAILES.VIDEOCALL;
          this.whatsAppTrip = PERMISSION_KEYS.BOOKING.PACKAGE_ITINERARY.REQUEST_DETAILES.WHATSAPP;
          this.timeLineTrip = PERMISSION_KEYS.BOOKING.PACKAGE_ITINERARY.REQUEST_DETAILES.TIMELINE;
          this.travelItineraryTrip = PERMISSION_KEYS.BOOKING.PACKAGE_ITINERARY.REQUEST_DETAILES.TRAVEL_ITINERARY;
          this.keys = this.authService.getPageKeys();
          this.cdr.markForCheck();
        } else if (activeRouter && activeRouter.path === 'package-holidays-listview' || activeRouter.path === 'preview-package') {
          this.requestDetailsTrip =PERMISSION_KEYS.REQUEST.PACKAGE_REQUEST_LIST_REQUEST_DETAILES.PACKAGE_REQUEST_LIST_TRIP;
          this.calendarTrip = PERMISSION_KEYS.REQUEST.PACKAGE_REQUEST_LIST_REQUEST_DETAILES.CALENDAR;
          this.callTrip = PERMISSION_KEYS.REQUEST.PACKAGE_REQUEST_LIST_REQUEST_DETAILES.CALL;
          this.mailTrip = PERMISSION_KEYS.REQUEST.PACKAGE_REQUEST_LIST_REQUEST_DETAILES.MAIL;
          this.chatTrip = PERMISSION_KEYS.REQUEST.PACKAGE_REQUEST_LIST_REQUEST_DETAILES.CHAT;
          this.videoCallTrip = PERMISSION_KEYS.REQUEST.PACKAGE_REQUEST_LIST_REQUEST_DETAILES.VIDEOCALL;
          this.whatsAppTrip = PERMISSION_KEYS.REQUEST.PACKAGE_REQUEST_LIST_REQUEST_DETAILES.WHATSAPP;
          this.timeLineTrip = PERMISSION_KEYS.REQUEST.PACKAGE_REQUEST_LIST_REQUEST_DETAILES.TIMELINE;
          this.travelItineraryTrip = PERMISSION_KEYS.REQUEST.PACKAGE_REQUEST_LIST_REQUEST_DETAILES.TRAVEL_ITINERARY;
          this.keys = this.authService.getPageKeys();
          this.cdr.markForCheck();
        } else {
          this.activeId = 1;
          this.pageTitle = 'Flight Request ';
          this.requestDetailsTrip = PERMISSION_KEYS.BOOKING.FLIGHT.REQUEST_DETAILES.FLIGHT_REQUEST_TRIP;
          this.calendarTrip = PERMISSION_KEYS.BOOKING.FLIGHT.REQUEST_DETAILES.CALENDAR;
          this.callTrip = PERMISSION_KEYS.BOOKING.FLIGHT.REQUEST_DETAILES.CALL;
          this.mailTrip = PERMISSION_KEYS.BOOKING.FLIGHT.REQUEST_DETAILES.MAIL;
          this.chatTrip = PERMISSION_KEYS.BOOKING.FLIGHT.REQUEST_DETAILES.CHAT;
          this.videoCallTrip = PERMISSION_KEYS.BOOKING.FLIGHT.REQUEST_DETAILES.VIDEOCALL;
          this.whatsAppTrip = PERMISSION_KEYS.BOOKING.FLIGHT.REQUEST_DETAILES.WHATSAPP;
          this.timeLineTrip = PERMISSION_KEYS.BOOKING.FLIGHT.REQUEST_DETAILES.TIMELINE;
          this.travelItineraryTrip = PERMISSION_KEYS.BOOKING.FLIGHT.REQUEST_DETAILES.TRAVEL_ITINERARY;
          this.requestDependsList = PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_REQUEST_DEPEDNED_LIST;
          this.requestDependsListeditView = PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_REQUEST_DEPEDNED_LIST_EDIT_VIEW;
          this.requestDependsListSearch = PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_REQUEST_DEPEDNED_LIST_SEARCH;
          this.requestDependsListChat = PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_REQUEST_DEPEDNED_LIST_CHAT;
          this.requestDependsListPhoneCall = PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_REQUEST_DEPEDNED_LIST_PHONE_CALL;
          this.requestDependsListEMail = PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_REQUEST_DEPEDNED_LIST_MAIL;
          this.requestDependsListPersonName = PERMISSION_KEYS.BOOKING.FLIGHT.FLIGHT_REQUEST_DEPEDNED_LIST_PERSON_NAME;
          this.keys = this.authService.getPageKeys();
          this.cdr.markForCheck();
        }
      }
    });


  }

  onActiveIdChangeChange(activeId: number): void {
    switch (activeId) {
      case 1:
        //this.router.navigateByUrl('/dashboard/booking/flight');
        this.router.navigate(['/dashboard/booking/flight'], {
          queryParams: { requestId: this.shareReqId, contactId: this.shareContactId },
        });
        break;
      case 2:
        /* const url = this.router.serializeUrl(
          this.router.createUrlTree([`/dashboard/booking/hotel`])
        );
        window.open(url, '_blank'); */
        //this.router.navigateByUrl('/dashboard/booking/hotel');
        this.router.navigate(['/dashboard/booking/hotel'], {
          queryParams: { requestId: this.shareReqId, contactId: this.shareContactId },
        });
        break;
      case 3:
        //this.router.navigateByUrl('/dashboard/booking/ancillary');
        /*  this.router.navigate(['/dashboard/booking/ancillary'], {
          queryParams: { requestId: this.shareReqId, contactId: this.shareContactId },
        }); */
        const modalRef = this.modalService.open(AncillarySelectComponent, {
          size: 'xl',
          backdrop: 'static',
          animation: true,
        });
        modalRef.componentInstance.name = 'Add Person';
        modalRef.result.then(
          (result) => {
            if (result) {
              this.router.navigate(['/dashboard/booking/ancillary'], {
                queryParams: {
                  requestId: this.shareReqId,
                  contactId: this.shareContactId,
                  serviceTypeId: btoa(escape(result)),
                },
              });
              //  this.onSubmit('ancillary', result);
            } else {
              this.toastrService.error('Please select Ancillary');
            }
          },
          (err) => {}
        );
        break;
      case 4:
        //this.router.navigateByUrl('/dashboard/booking/ancillary');
        this.router.navigate(['/dashboard/booking/holidays'], {
          queryParams: { requestId: this.shareReqId, contactId: this.shareContactId },
        });
        break;
      case 5:
        this.router.navigate(['/dashboard/booking/activities'], {
          queryParams: { requestId: this.shareReqId, contactId: this.shareContactId },
        });
        break;
      default:
        //this.router.navigateByUrl('/dashboard/booking/flight');
        this.router.navigate(['/dashboard/booking/flight'], {
          queryParams: { requestId: this.shareReqId, contactId: this.shareContactId },
        });
        break;
    }
  }




  fetchSrData(){
    this.serviceRequestData = this.route?.snapshot?.data?.resolvedData;
    this.authService.setRequestDetails(this.serviceRequestData);
    this.srSummaryData.sendData(this.serviceRequestData);
  }

  getQueryParams() {

    this.eventsSubscription = this.route.queryParams.subscribe((param) => {
      if (param && param.from) {
        if (param.from === 'package') {
          this.hide_product_details = false;
        } else {
          this.hide_product_details = true;
        }
      }
      if (param && param.contactId && param.requestId) {
        this.contactId = param.contactId;
        this.requestId = param.requestId;
        if (this.requestId) {
          this.fetchCustomerDetailsBySrId(Number(this.requestId));
          this.getServiceData(this.requestId);
          this.shareRequestId.nextCount(this.requestId);
          const REQUESTDATA = {
            serviceRequestNumber: this.requestId,
          };
          this.dynamicParamsList(REQUESTDATA);

        }
        if (this.contactId) {
          this.shareRequestId.nextCountContactId(this.contactId);
        }
      }
      //flight
      if (param && param.srLineId) {
        this.srLineId = param.srLineId;
      }

      //hotel
      if (param && param.hotelLineId) {
        this.srLineId = param.hotelLineId;
      }
      //ancillary
      if (param && param.anxLineId) {
        this.srLineId = param.anxLineId;
      }
      //package
      if (param && param.holidaysLineId) {
        this.srLineId = param.holidaysLineId;
      }
      //attractions
      if (param && param.activitiesLineId) {
        this.srLineId = param.activitiesLineId;
      }

    });

    //request id share the hotel and  ancillary
    this.eventsSubscription = this.shareRequestId.shareRequestId.subscribe((reqId) => {
      this.shareReqId = reqId;
    });
    this.eventsSubscription = this.shareRequestId.shareContactId.subscribe((contactId) => {
      this.shareContactId = contactId;
    });
  }


  getLiabilityCount(customerNumber: number) {
    if (this.userDetails && this.userDetails?.userId) {
      this.getLiabilityCounts('customer', customerNumber);
    }
  }


  //get-service-request due to contact id purposes
  getServiceData(requestId) {
    this.eventsSubscription = this.dashboardRequestService.getSrRequest(requestId).subscribe(
      (resHeaderdata: any) => {
        if (resHeaderdata) {
          this.serviceRequestData = resHeaderdata;

          this.authService.setRequestDetails(resHeaderdata);
          this.srSummaryData.sendData(resHeaderdata);
          this.cdr.markForCheck();
        } else {
          this.toastrService.error(
            'Oops! Something went wrong while fetching the request data please try again  ',
            'Error'
          );
          this.cdr.markForCheck();
        }
      },
      (error) => {
        this.toastrService.error('Oops! Something went wrong while fetching the SR Data  ', 'Error');
        this.cdr.markForCheck();
      }
    );
  }

  dynamicParamsList(requestData) {
    this.eventsSubscription = this.dashboardRequestService
      .getAllServiceRequestSearch(requestData, apiUrls.srsearchList_url.srsearchList)
      .subscribe(
        (data: any) => {
          if (data?.length === 0) {
            //this.toastrService.info(`no data found given search criteria`, 'info');
            this.allServiceRequestsData = [];
            this.productsDataService.sendData(this.allServiceRequestsData);
            this.cdr.markForCheck();
          } else {
            this.allServiceRequestsData = data;
            if (this.allServiceRequestsData?.length === 1) {
              if (this.allServiceRequestsData[0]?.product === 'Package') {
                this.productsAvailability = false;
              }
            } else {
              this.productsAvailability = true;
            }
            this.productsDataService.sendData(this.allServiceRequestsData);
            this.cdr.markForCheck();
          }
        },
        (error) => {
          this.toastrService.error(error, 'Error');
          this.cdr.markForCheck();
        }
      );
  }

  teamAndMemberData() {
    this.eventsSubscription = this.teamDataService.getData().subscribe((res: any) => {
      //console.log(res);
      if (res.team?.length > 0) {
        this.teamList = res?.team;
        this.teamName = this.teamList[0]?.teamName;
        this.defaultStatusData = res?.defaultStatus;
        this.defaultStatusName = res?.defaultStatus?.statusName;
        this.cdr.markForCheck();
      } else {
        this.teamList = [];
        this.defaultStatusName = null;
        this.cdr.markForCheck();
      }
      if (res.members?.length > 0) {
        this.teamMembersList = res?.members;
        this.cdr.markForCheck();
      } else {
        this.teamMembersList = [];
        this.cdr.markForCheck();
      }
      if (res.transitions?.length > 0) {
        this.transitionsList = res.transitions;
        this.cdr.markForCheck();
      } else {
        this.transitionsList = [];
        this.cdr.markForCheck();
      }

    });
  }
  openGetSrMailBox() {
    const onlineUrl = `${
      environment.TT_MAIL_BOX
    }login/index_direct?id=${this.authService.getLoginttuserId()}&continue=${
      environment.TT_MAIL_BOX
    }mailbox/mailbox/get_sr_mailbox_tt/${this.requestId}`;
    window.open(onlineUrl, '_blank');
  }

  openChat() {
    const chatUrl = `${environment.TTCHAT}chat/history?user-id=${this.authService.getLoginttuserId()}&&sr=${
      this.requestId
    }`;
    window.open(chatUrl, '_blank');
  }

  openWhatsApp(contactInfo: RequestContactInfo) {
    // console.log(contactInfo);

    /* if(this.shareReqId){
      const enterText=`Hello, I have query related to - *Service Request  # ${this.shareReqId}*  - thank you`;
      const whatsappUrl = `${environment.WHATSAPP}send/?phone=918520995571&text=${encodeURIComponent(enterText)}&type=phone_number&app_absent=0`;
      window.open(whatsappUrl, '_blank');
    }else{
      this.toastrService.error("No Sr Number found ", 'Error');
    } */
    const contact = contactInfo?.contact;
    if (contact) {
      const ticketOpen = {
        contact_number: Number(contact.primaryCCP + '' + contact.primaryPhoneNumber),
        contact_name: contact.firstName + ' ' + contact.lastName,
        request_for: 'open_ticket',
      };

      this.masterDataServices.createOpenTicket(ticketOpen, apiUrls.OpenTicket.createTicket).subscribe(
        (res: TicketApiResponse) => {
          if (res?.ticket) {
            const whatsappUrl = `${environment.WATICKETURL}tickets/${res.ticket}`;
            window.open(whatsappUrl, '_blank');
          }
        },
        (error) => this.toastrService.error(error, 'Error')
      );
    } else {
      this.toastrService.info('no contact information found', 'INFO');
    }
  }

  itinerary(requestNo: number) {
    const whatsappUrl = `${environment.RFQREDIRECTOFFLINE}redirect/itinerary?sr=${requestNo}&from=service_request`;
    window.open(whatsappUrl, '_blank');
  }

  timeLine() {
    // from: 'package',
    if (this.requestId) {
      this.router.navigate(['/dashboard/booking/service-request-communication-time-line'], {
        queryParams: {
          requestId: this.requestId,
          contactId: this.contactId,
          from: 'package',
        },
      });
    }
  }

  getLiabilityCounts(userType: string, userId: number) {
    this.eventsSubscription = this.masterDataServices
      .getliabilityInfoByType(LIABILITY.CREDIT_LIMIT_INFO, userType, userId)
      .subscribe((response: ApiResponse) => {
        const result: ApiResponse = response;
        if (result.status === 200 && result.data && result.data?.length == 1) {
          this.liability = result.data[0]?.total_liability;
          this.cdr.markForCheck();
        } /* else {
          this.toastr.error('No Liability Tickets Found',"Error",{progressBar:true});
          this.cdr.markForCheck();
        } */
      });
  }


  fetchCustomerDetailsBySrId(requestId:number) {
    this.eventsSubscription =  this.dashboardRequestService
      .getCustomerDetailsBySrId(requestId, apiUrls.master_data_url.fetchCustomerDetailsBySrId)
      .subscribe((res: any) => {
        if (res) {
          this.authService.setCustomerType(res);
          const customerDeatilsResult = this.authService.getCustomerType();
          if (customerDeatilsResult?.customerType === 1) {
            this.getLiabilityCount(customerDeatilsResult?.customerId);
          }
          this.cdr.markForCheck();
        } else {
          this.toastrService.error(
            'Oops! Something went wrong while fetching the customer Details please try again  ',
            'Error'
          );
          this.cdr.markForCheck();
        }
      });
  }
}
