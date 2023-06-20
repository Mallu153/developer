import {
  Component,
  Output,
  EventEmitter,
  OnDestroy,
  OnInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  ViewChildren,
  QueryList,
  HostListener,
  Input,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LayoutService } from '../../services/layout.service';
import { Subscription } from 'rxjs';
import { ConfigService } from '../../services/config.service';
import { FormControl } from '@angular/forms';
import { LISTITEMS } from '../../data/template-search';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/shared/auth/auth.service';
import { environment } from 'environments/environment';
import { ChatService, WhatsAppCount } from 'app/shared/services/chat/chat.service';
import { AgentNotification } from 'app/shared/models/agent-notification';
import { ToastrService } from 'ngx-toastr';
import { LoginResponse } from 'app/shared/models/login-response';
import { formatDate } from '@angular/common';
import { DashboardRequestService } from 'app/pages/dashboard/dashboard-request/services/dashboard-request.service';
import { PERMISSION_KEYS } from 'app/shared/data/app-premission-key';
import { MasterDataService } from 'app/shared/services/master-data.service';
import { LIABILITY } from 'app/shared/constant-url/deals-api-url';
import { ApiResponse } from 'app/shared/models/api-response';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {
  currentLang = 'en';
  selectedLanguageText = 'English';
  selectedLanguageFlag = './assets/img/flags/us.png';
  toggleClass = 'ft-maximize';
  placement = 'bottom-right';
  logoUrl = 'assets/img/logo.png';
  menuPosition = 'Side';
  isSmallScreen = false;
  protected innerWidth: any;
  searchOpenClass = '';
  transparentBGClass = '';
  hideSidebar: boolean = true;
  public isCollapsed = true;
  layoutSub: Subscription;
  configSub: Subscription;

  @ViewChild('search') searchElement: ElementRef;
  @ViewChildren('searchResults') searchResults: QueryList<any>;

  @Output()
  toggleHideSidebar = new EventEmitter<Object>();

  @Output()
  seachTextEmpty = new EventEmitter<boolean>();

  listItems = [];
  control = new FormControl();

  public config: any = {};
  userName: string;
  //requestId
  requestId: number;
  receiveAgentNotificationSub: Subscription;
  agentNotifications: AgentNotification[] = [];
  notificationCount: number = 0;
  customerName:string;
  private whatsupSocket: any;
  private whatsupSocketUrl: string = `${environment.SOCKET_ENDPOINT}`;
  countData: any = {
    wip: 0,
    open: 0,
  };
  // today date
  todayDate = new Date();
  todayDate1: string;

  userDetails: LoginResponse;

  @Input() navBarAcess: any;
  navBarCreateRequest=PERMISSION_KEYS.NAV_BAR.NAV_BAR_CREATE_REQUEST;
  navBarWhatsAppImage=PERMISSION_KEYS.NAV_BAR.NAV_BAR_WHATSAPP;

  liability:number=0;
  creditLimit:number=0;
  agentType=LIABILITY?.USER_APP_ADMIN_TYPE;
  cbtType=LIABILITY?.USER_APP_CBT_TYPE;
  constructor(
    public translate: TranslateService,
    private layoutService: LayoutService,
    public router: Router,
    private route: ActivatedRoute,
    private configService: ConfigService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private chatService: ChatService,
    public el: ElementRef,
    private toastr: ToastrService,
    private dashboardRequestService: DashboardRequestService,
    private masterDataApiService:MasterDataService
  ) {
    const browserLang: string = translate.getBrowserLang();
    translate.use(browserLang.match(/en|es|pt|de/) ? browserLang : 'en');
    this.config = this.configService.templateConf;
    this.innerWidth = window.innerWidth;

    this.layoutSub = layoutService.toggleSidebar$.subscribe((isShow) => {
      this.hideSidebar = !isShow;
    });

    this.todayDate1 = formatDate(this.todayDate, 'yyyy-MM-ddThh:mm:ss', 'en-US', '+0530');
  }

  ngOnInit() {
    this.userName = this.authService.getUserName();
    this.userDetails = this.authService.getUserDetails();
    this.customerName=this.userDetails.bizName;
    this.listItems = LISTITEMS;
    if (this.innerWidth < 1200) {
      this.isSmallScreen = true;
    } else {
      this.isSmallScreen = false;
    }
    this.getQueryParams();
    this.connectToChat();
    this.getLiabilityCount()
  }

  getLiabilityCount(){
    if(this.userDetails&&this.userDetails?.userId){
      if(this.userDetails?.roleKey=== this.agentType ){
        this.getLiabilityCounts('agent',Number(this.userDetails?.userId));
      }
      if(this.userDetails?.roleKey ===  this.cbtType ){
        this.getLiabilityCounts('customer',Number(this.userDetails?.bizId));
      }

    }
  }
  getQueryParams() {
    // request id get the paramas
    this.receiveAgentNotificationSub = this.route.queryParams.subscribe((param) => {
      if (param && param.requestId) {
        this.requestId = param.requestId;
      }
    });
  }
  connectToChat() {
    let connected = this.chatService.isConnected();
    let whatsAppConnected = this.chatService.isWhatsAppConnected();
    if (connected == true) {
      this.initReceivers();
    } else {
      this.chatService.connect(this.authService.getUser(), () => {
        this.initReceivers();
      });
    }
    if (whatsAppConnected === true) {
      this.initialWhatsAppCount();
    } else {
      whatsAppConnected = this.chatService.isWhatsAppConnected();
      if (whatsAppConnected === true) {
        this.initialWhatsAppCount();
      }
    }
    /* if(whatsAppConnected === true){
      this.whatsupSocket.emit('my message', 'Hello there from Angular.');
      this.whatsupSocket.on('appMessageCreate', (data: WhatsAppCount) => {
        if(data?.contact?.name&&data?.message?.body){
          this.toastr.info('Message received from ' + data?.contact?.name + ':' + data?.message?.body);
        }
       this.countData = {
          wip: data?.ticketCountOpen,
          open: data?.ticketCountPending,
        };
      });

    }else{
      this.whatsupSocket = io(this.whatsupSocketUrl);
      this.whatsupSocket.emit('my message', 'Hello there from Angular.');
      this.whatsupSocket.on('appMessageCreate', (data: WhatsAppCount) => {
        if(data?.contact?.name&&data?.message?.body){
          this.toastr.info('Message received from ' + data?.contact?.name + ':' + data?.message?.body);
        }
        this.countData = {
          wip: data?.ticketCountOpen,
          open: data?.ticketCountPending,
        };
        this.cdr.markForCheck();
      });

    } */
  }

  private initialWhatsAppCount() {
    this.receiveAgentNotificationSub = this.chatService.whatsAppCount().subscribe((res: any) => {
      //console.log(res);
      //(res?.ticket?.userId === this.authService.getWaUser() || !res?.ticket?.userId)
      if (res?.ticket?.userId === this.authService.getWaUser()) {
        this.countData = {
          wip: res?.ticketCountOpen,
          open: res?.ticketCountPending,
        };
        if (res?.contact?.name && res?.message?.body) {
          this.toastr.success('Message received from ' + res?.contact?.name + ':' + res?.message?.body);
          // this.notifySound();
        }
      } else {
        this.countData = {
          wip: 0,
          open: 0,
        };
      }

      this.cdr.markForCheck();
    });
  }
  private initReceivers(): void {
    this.receiveAgentNotificationSub = this.chatService.receiveAgentNotification().subscribe((notificationRes) => {
      const newNotification = notificationRes?.newCustomer;
      newNotification.createdAt = new Date();
      // this.agentNotifications = notificationRes.customerQueue;
      this.agentNotifications.push(newNotification);
      this.notificationCount = this.agentNotifications.filter((n) => !n.read)?.length;
      this.notifySound();
      this.cdr.markForCheck();
    });
  }

  notifySound(): void {
    let sound: any = this.el.nativeElement.querySelector('#notifSound');
    sound.play();
  }

  public readNotification(index: number): void {
    this.agentNotifications[index].read = true;
    this.notificationCount = this.agentNotifications.filter((n) => !n.read)?.length;
    this.cdr.markForCheck();
  }

  public readAllNotification(): void {
    this.agentNotifications?.forEach((n) => {
      n.read = true;
    });
    this.notificationCount = this.agentNotifications.filter((n) => !n.read)?.length;
    this.cdr.markForCheck();
  }

  ngAfterViewInit() {
    this.configSub = this.configService.templateConf$.subscribe((templateConf) => {
      if (templateConf) {
        this.config = templateConf;
      }
      this.loadLayout();
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    if (this.layoutSub) {
      this.layoutSub.unsubscribe();
    }
    if (this.configSub) {
      this.configSub.unsubscribe();
    }
    if (this.receiveAgentNotificationSub) {
      this.receiveAgentNotificationSub.unsubscribe();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = event.target.innerWidth;
    if (this.innerWidth < 1200) {
      this.isSmallScreen = true;
    } else {
      this.isSmallScreen = false;
    }
  }

  loadLayout() {
    if (this.config.layout.menuPosition && this.config.layout.menuPosition.toString().trim() != '') {
      this.menuPosition = this.config.layout.menuPosition;
    }

    if (this.config.layout.variant === 'Light') {
      this.logoUrl = 'assets/img/logo-dark.png';
    } else {
      this.logoUrl = 'assets/img/logo.png';
    }

    if (this.config.layout.variant === 'Transparent') {
      this.transparentBGClass = this.config.layout.sidebar.backgroundColor;
    } else {
      this.transparentBGClass = '';
    }
  }

  onSearchKey(event: any) {
    if (this.searchResults && this.searchResults.length > 0) {
      this.searchResults.first.host.nativeElement.classList.add('first-active-item');
    }

    if (event.target.value === '') {
      this.seachTextEmpty.emit(true);
    } else {
      this.seachTextEmpty.emit(false);
    }
  }

  removeActiveClass() {
    if (this.searchResults && this.searchResults.length > 0) {
      this.searchResults.first.host.nativeElement.classList.remove('first-active-item');
    }
  }

  onEscEvent() {
    this.control.setValue('');
    this.searchOpenClass = '';
    this.seachTextEmpty.emit(true);
  }

  onEnter() {
    if (this.searchResults && this.searchResults.length > 0) {
      let url = this.searchResults.first.url;
      if (url && url != '') {
        this.control.setValue('');
        this.searchOpenClass = '';
        this.router.navigate([url]);
        this.seachTextEmpty.emit(true);
      }
    }
  }

  redirectTo(value) {
    this.router.navigate([value]);
    this.seachTextEmpty.emit(true);
  }

  ChangeLanguage(language: string) {
    this.translate.use(language);

    if (language === 'en') {
      this.selectedLanguageText = 'English';
      this.selectedLanguageFlag = './assets/img/flags/us.png';
    } else if (language === 'es') {
      this.selectedLanguageText = 'Spanish';
      this.selectedLanguageFlag = './assets/img/flags/es.png';
    } else if (language === 'pt') {
      this.selectedLanguageText = 'Portuguese';
      this.selectedLanguageFlag = './assets/img/flags/pt.png';
    } else if (language === 'de') {
      this.selectedLanguageText = 'German';
      this.selectedLanguageFlag = './assets/img/flags/de.png';
    }
  }

  ToggleClass() {
    if (this.toggleClass === 'ft-maximize') {
      this.toggleClass = 'ft-minimize';
    } else {
      this.toggleClass = 'ft-maximize';
    }
  }

  toggleSearchOpenClass(display) {
    this.control.setValue('');
    if (display) {
      this.searchOpenClass = 'open';
      setTimeout(() => {
        this.searchElement.nativeElement.focus();
      }, 0);
    } else {
      this.searchOpenClass = '';
    }
    this.seachTextEmpty.emit(true);
  }

  toggleNotificationSidebar() {
    this.layoutService.toggleNotificationSidebar(true);
  }

  toggleSidebar() {
    this.layoutService.toggleSidebarSmallScreen(this.hideSidebar);
  }
  logout() {
    this.authService.logout();
  }
  gotoCustomer() {
    const offlineUrl = `http://192.178.10.132:4300/dashboard/home`;
    window.open(offlineUrl, '_new');
  }

  openChat() {
    const chatUrl = `${environment.TTCHAT}chat/lobbyRoom?username=${
      this.userName
    }&login-submit=Join&userId=${this.authService.getUser()}&usertype=0`;
    window.open(chatUrl, '_blank');
  }

  openWaTicketsApp(tabOpen: string) {
    if (this.authService.getWaUser() !== 0) {
      const waTicketUrl = `${environment.WATICKETURL}tickets?tab=${tabOpen}`;
      window.open(waTicketUrl, '_blank');
    } else {
      this.toastr.info('No whatsapp user found !');
    }
  }
  /**
   *
   *
   * create request for cbt
   *
   */
  onCreateRequestForCbt() {
    if (this.userDetails) {
      const srRequestHeaderData = {
        createdBy: this.authService.getUser(),
        createdDate: this.todayDate1,
        customerId: this.userDetails?.bizId,
        contactId: this.userDetails?.contactId,
        requestStatus: 1,
        priorityId: 1,
        severityId: 1,
        packageRequest: 0,
      };
      this.receiveAgentNotificationSub=this.dashboardRequestService.createServiceRequestLine(srRequestHeaderData).subscribe(
        (requestResponse: any) => {
          if (requestResponse.requestId) {
            this.router.navigate([`/dashboard/booking/flight`], {
              queryParams: { requestId: requestResponse.requestId, contactId: this.userDetails?.contactId },
            });
          }
        },
        (error) => {
          this.toastr.error('Oops! Something went wrong please try again', 'Error');
        }
      );
    }
  }



  getLiabilityCounts(userType: string,userId:number) {
    this.receiveAgentNotificationSub=this.masterDataApiService
      .getliabilityInfoByType(LIABILITY.CREDIT_LIMIT_INFO, userType,userId)
      .subscribe((response: ApiResponse) => {
        const result: ApiResponse = response;
        if (result.status === 200 && result.data && result.data?.length == 1) {
          if(this.userDetails?.roleKey=== this.agentType ){
            this.liability = result.data[0]?.total_liability;
          }
          if(this.userDetails?.roleKey === this.cbtType ){
            this.creditLimit = result.data[0]?.total_credit_limit;
          }


          this.cdr.markForCheck();
        } /* else {
          this.toastr.error('No Liability Tickets Found',"Error",{progressBar:true});
          this.cdr.markForCheck();
        } */
      });
  }

}
