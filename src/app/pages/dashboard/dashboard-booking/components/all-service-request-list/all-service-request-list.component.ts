import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardRequestService } from 'app/pages/dashboard/dashboard-request/services/dashboard-request.service';
import { environment } from 'environments/environment';
import { ToastrService } from 'ngx-toastr';
import * as apiUrls from '../../../dashboard-request/url-constants/url-constants';
import { AuthService } from 'app/shared/auth/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductsDataService } from '../../share-data-services/products-data';
import { Products } from 'app/pages/dashboard/dashboard-request/model/products-data';
@Component({
  selector: 'app-all-service-request-list',
  templateUrl: './all-service-request-list.component.html',
  styleUrls: ['./all-service-request-list.component.scss'],
})
export class AllServiceRequestListComponent implements OnInit , OnDestroy{
  ngDestroy$ = new Subject();
  //search setup
  searchText: any;
  //pagination
  page = 1;
  pageSize = 10;
  collectionSize: number;
  @Input() allServiceRequestshowsList: Products[];
  @Input() checkProducts: boolean;
  /**
   *
   *
   * @keys AllServiceRequestListComponent
   */
  keys = [];
  @Input() editRequestDetailskey: string;
  @Input() searchkey: string;
  @Input() chatkey: string;
  @Input() phoneCallkey: string;
  @Input() emailkey: string;
  @Input() PersonNamekey: string;
  //allServiceRequestsData:any[]=[];
  paramasRequestId: number;
  paramasContactId: number;
  paramasSrLineId: number;
  paramasHotelLineId: number;
  productsAvailability :boolean=false;

  isHidden :boolean= false;
  expectPackageIsHidden:boolean= false;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toastrService: ToastrService,
    private authService:AuthService,

  ) {}

  ngOnInit(): void {
    this.keys = this.authService.getPageKeys();
    if(this.checkProducts){
     this.productsAvailability =this.checkProducts;
    }

    //console.log(this.allServiceRequestshowsList);
    /*Flight Paramas checking */
    if (this.router.url.includes('/dashboard/booking/holidays')) {
      this.expectPackageIsHidden=true;
    }
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param && param.contactId && param.requestId && param.srLineId) {
        this.paramasRequestId = param.requestId;
        this.paramasContactId = param.contactId;
        this.paramasSrLineId = Number(param.srLineId);
      }
      if (param.hotelLineId) {
        this.paramasSrLineId = Number(param.hotelLineId);
      }
      if(param.holidaysLineId){
        this.paramasSrLineId = Number(param.holidaysLineId);
      }
      if(param.anxLineId){
        this.paramasSrLineId = Number(param.anxLineId);
      }
      if(param.activitiesLineId){
        this.paramasSrLineId = Number(param.activitiesLineId);
      }

    });

  }
  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
  getLinesBySrRequest(requestHeaderId) {
    /* if (this.paramasSrLineId === requestHeaderId?.serviceRequestLine) {
      return this.toastrService.warning(`This  request already exists ${this.paramasSrLineId}`, 'Warning', {
        progressBar: true,
      });
    }
    if (this.paramasSrLineId=== requestHeaderId?.serviceRequestLine) {
      return this.toastrService.warning(`This  request already exists ${this.paramasHotelLineId}`, 'Warning', {
        progressBar: true,
      });
    } */
    if (requestHeaderId.product === 'Flight') {
      this.router.navigate(['/dashboard/booking/flight'], {
        queryParams: {
          requestId: requestHeaderId?.serviceRequestNumber,
          contactId: requestHeaderId?.contactId,
          srLineId: requestHeaderId?.serviceRequestLine,
        },
      });
    } else if (requestHeaderId.product === 'Hotel') {
      this.router.navigate(['/dashboard/booking/hotel'], {
        queryParams: {
          requestId: requestHeaderId?.serviceRequestNumber,
          contactId: requestHeaderId?.contactId,
          hotelLineId: requestHeaderId?.serviceRequestLine,
        },
      });
    } else if (requestHeaderId.product === 'Ancillary') {
      this.router.navigate(['/dashboard/booking/ancillary'], {
        queryParams: {
          requestId: requestHeaderId.serviceRequestNumber,
          contactId: requestHeaderId.contactId,
          serviceTypeId: btoa(escape(requestHeaderId.typeId)),
          anxLineId: requestHeaderId.serviceRequestLine,
        },
      });
    } else if (requestHeaderId.product ===  'Package') {
      this.router.navigate(['/dashboard/booking/holidays'], {
        queryParams: {
          requestId: requestHeaderId.serviceRequestNumber,
          contactId: requestHeaderId.contactId,
          holidaysLineId:requestHeaderId?.serviceRequestLine
        },
      });
    }else if (requestHeaderId.product ===  'Attractions') {
      this.router.navigate(['/dashboard/booking/activities'], {
        queryParams: {
          requestId: requestHeaderId.serviceRequestNumber,
          contactId: requestHeaderId.contactId,
          activitiesLineId:requestHeaderId?.serviceRequestLine
        },
      });
    }else {
      this.toastrService.info('no redirect url found', 'Info');
    }
  }

  openChat(selectedSrId:any){
    const chatUrl = `${environment.TTCHAT}chat/history?user-id=${this.authService.getLoginttuserId()}&sr=${selectedSrId?.serviceRequestNumber}&srline=${selectedSrId?.serviceRequestLine}`;
    window.open(chatUrl, '_blank');
  }


  offline(requestno:number,requestLineNo:number,productName:string) {
    let requestId = requestno;
    let reqLineId = requestLineNo;
    let product = productName.toLowerCase();
    if(product==='attractions'){
      product=productName.toLowerCase().replace("s", "");
    }else{
      product= productName.toLowerCase();
    }

    if(requestId&&reqLineId&&product){
      const offlineUrl = `${environment.RFQREDIRECTOFFLINE}redirect?sr_no=${requestId}&sr_line_no=${reqLineId}&product=${product}&channel=offline`;
      console.log(offlineUrl);

      window.open(offlineUrl, '_blank');
    }

  }
  Online(requestno:number,requestLineNo:number,productName:string) {
    let requestId = requestno;
    let reqLineId = requestLineNo;
    let product = productName.toLowerCase();


    if(requestId&&reqLineId&&product){
      const onlineUrl = `${environment.RFQREDIRECTOFFLINE}redirect?sr_no=${requestId}&sr_line_no=${reqLineId}&product=${product}&channel=online`;
      window.open(onlineUrl, '_blank');
    }
  }
  mptb(requestno:number,requestLineNo:number,productName:string) {
    let requestId = requestno;
    let reqLineId = requestLineNo;
    let product = productName.toLowerCase( ) ;
    if(requestId&&reqLineId&&product){
      //const onlineUrl = `${environment.RFQREDIRECTOFFLINE}redirect?sr_no=${requestId}&sr_line_no=${reqLineId}&product=${product}&channel=mptb`;
      const onlineUrl = `${environment.RFQREDIRECTOFFLINE}redirect?sr_no=${requestId}&sr_line_no=${reqLineId}&product=flight&channel=flight_offers`;
      window.open(onlineUrl, '_blank');
    }
  }


  redirectToItinerary(requestno:number,holidaysLineno:number,contactno:number) {
    const contactId = contactno;
    const requestId = requestno;
    const requestLineId = holidaysLineno;

    if (requestId && requestLineId && contactId) {
      this.router.navigate(['/dashboard/booking/package-itinerary'], {
        queryParams: {
          requestId: requestId,
          contactId: contactId,
          holidaysLineId: requestLineId,
          from: 'package',
          actionType:'rfq',
          productsAvailability: this.productsAvailability
        },
      });
    }
  }



  trackByFn(index, item) {
    return index;
  }



  toggleVisibility(): void {
    this.isHidden = !this.isHidden;
   if(this.isHidden){
    const element = document.querySelectorAll('.product-hide');
    if(element?.length>0){
      element.forEach(
        item => {
          item.classList.remove('product-hide');
          item.classList.add('product-show');
          item.classList.add('ml-2');
        }
      );
    }
   }else{
    const element = document.querySelectorAll('.product-show');
    const elementPackage = document.querySelectorAll('.package ');
    if(element?.length>0){
      element.forEach(
        item => {
          item.classList.remove('product-show');
          item.classList.add('product-hide');
        }
      );
    }
    if(elementPackage?.length>0){
      elementPackage.forEach(
        item => {
          item.classList.remove('product-hide');
          item.classList.add('product-show');
        }
      );
    }
   }

  }


}
