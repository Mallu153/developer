import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '../model/api-response';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import * as PaxModels from '../model/pax-model';
import * as CustomerModels from '../model/customer-contact-model';
import { environment } from 'environments/environment';
import { Hotel, HotelPassengers } from '../model/hotel.model';
import { Addons } from '../model/addons';
import { RFQ } from '../model/RFQ.model';
import { ResourcesAssignment } from '../model/resources-assignment';
import { catchError, map } from 'rxjs/operators';
import { FlexRequest, FlexResponse } from 'app/shared/models/flex-response';
import { SrSummary } from '../model/srsummaryData';
import { FlexPrice } from 'app/shared/models/flex-price';
import { PriceAccessDeatils } from 'app/shared/models/price-auth-response';
import { PriceAuth } from 'app/shared/models/price-token-mode';
import { PriceTokenConfig } from 'app/shared/config/price-token-credentials';
import { RfqEmail, RfqEmailResponse } from '../../rfq/rfq-models/rfq-email';
import { BookingReport } from '../../sr-reports/models/booking-search-request';
import { BookingReportsApiResponse } from '../../sr-reports/models/invoice-api-response';
import { PackageSearch } from '../model/package-search';
import { CommunicationModuleLink } from '../model/create-communication-module-link';
import { Activities } from '../model/activities';
import { ServiceRequestCommunicationResponse } from '../model/service-request-communication-time-line-api-res';
import { PolicyQualifyProcessStage1 } from 'app/shared/models/policy-qualify-process-stage1';

@Injectable({
  providedIn: 'root',
})
export class DashboardRequestService {
  //server-developement url
  serviceRequest_url = environment.serviceRequest_url;
  searchPax_Proxy_Url = environment.searchPax_Proxy_Url;
  masterData_Proxy_Url = environment.masterData_Proxy_Url;
  companyMasterData_Proxy_Url = environment.companyMasterData_Proxy_Url;
  businessList_Proxy_Url = environment.businessList_Proxy_Url;
  RFQ = environment.RFQ;
  ResourcesAssignment = environment.ResourcesAssignment;
  BPF = environment.BPF;
  ttMicroServiceApi = environment.loginAfterHit;
  flexPriceURL=environment.FLEX_PRICE;
  flexPriceToken=environment.Flex_Auth;
  deals=environment.DEALS;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  priceHttpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  };

  constructor(
    private http: HttpClient
    ) {}

  /* image
 upload services
 */
  imageUpload(file, id, create): Observable<PaxModels.PaxImage> {
    // Create form data
    const formData = new FormData();
    // Store form name as "file" with file data
    formData.append('file', file, file.name);
    formData.append('entityId', id);
    //formData.append("entityType", "Pax");
    return this.http
      .post<PaxModels.PaxImage>(`${this.searchPax_Proxy_Url}/${create}`, formData)
      .pipe(catchError(this.errorHandler));
  }

  /**
   *  Get profiles in retail form
   * @param searchId .
   * @returns { Observable<any> }
   */
  getPaxProfile(searchId: string): Observable<any> {
    return this.http
      .get(`${this.serviceRequest_url}/get-pax-profile?searchId=${searchId}`, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }

  /**
   * Create a new profile if doesn't exist
   * @param payload
   * @returns
   */
  createPaxProfile(payload: any): Observable<any> {
    return this.http
      .post(`${this.serviceRequest_url}/create-pax-profile`, payload, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }

  /**
   * A method to send a post request to save the service request line
   * @param payload request line payload
   * @returns { Observable<any>}
   */
  createServiceRequestLineSegment(payload: any): Observable<any> {
    return this.http
      .post<any>(`${this.serviceRequest_url}/create-service-line-segment`, payload, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }

  /**
   * A method to send a post request for the corporate form
   * @param payload request line payload
   * @returns { Observable<any>}
   */
  createServiceRequestLine(payload: any): Observable<any> {
    //PackageRequest = 1
    return this.http.post(`${this.serviceRequest_url}/create-service-request`, payload, this.httpOptions).pipe(catchError(this.errorHandler));

  }
  /**
   * A method to fetch AllServiceRequests
   *
   */
  getAllServiceRequests(): Observable<any> {
    return this.http
      .get(`${this.serviceRequest_url}/get-all-service-requests`, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  /**
   * A method to fetch get-lines-by-sr-request
   *@param requestId .
   */
  getLinesBySrRequest(requestId: number): Observable<any> {
    return this.http
      .get(`${this.serviceRequest_url}/get-lines-by-sr-request?requestId=${requestId}`, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  /**
   * A method to fetch get-service-request
   *@param requestId .
   */
  getSrRequest(requestId: number): Observable<any> {
    return this.http
      .get(`${this.serviceRequest_url}/get-service-request?requestId=${requestId}`, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  /**
   *  Get SrRequestAndLineData
   * @param requestLineId .
   * @returns { Observable<any> }
   */
  getSrRequestAndLineData(requestLineId: number, srId: number): Observable<any> {
    return this.http
      .get(
        `${this.serviceRequest_url}/get-service-request-line?requestLineId=${requestLineId}&sr=${srId}`,
        this.httpOptions
      )
      .pipe(catchError(this.errorHandler));
  }

  /**
   *  Get SrRequestAndLineData
   * @param requestId .
   * @param customerId .
   * @param contactId .
   * @param createddate .
   * @param fromcreateddate .
   * @param tocreateddate .
   * @returns { Observable<any> }
   */
  getSrRequestSearchData(searchObj: any, read: any): Observable<any> {
    return this.http.post(this.serviceRequest_url + read, { params: searchObj }).pipe(catchError(this.errorHandler));
  }
  getAllServiceRequestSearch(data: any, create: any): Observable<any> {
    return this.http.post<any>(this.serviceRequest_url + create, JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
  }
  /**
   * A method to get the airline by name
   * @param customerName
   * @returns { Observable<any> }
   */
  getCustomerData(customerName: string): Observable<any> {
    return this.http
      .get(`${this.serviceRequest_url}/search/customer?searchString=${customerName}`, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  /**
   * A method to fetch get-service-request
   *@param customerId .
   */
  getContactData(customerId: number, read): Observable<any> {
    return this.http
      .get(this.serviceRequest_url + read + customerId, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  /************
   * A method to send a put request for the flight form
   * @param payload request line payload
   * @returns { Observable<any>}
   * /servicerequest/update-service-line-segment
   */
  updateServiceRequestLine(payload: any): Observable<any> {
    return this.http
      .put(`${this.serviceRequest_url}/update-service-line-segment`, payload, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  /**
   * Creates service request after reciving the requestLineId and requestId from the
   * rquest line post request
   * @param payload object with the request pax relation data
   * @returns { Observable<any> }
   */
  createServiceRequestPaxRelation(payload: any): Observable<any> {
    return this.http
      .post(`${this.serviceRequest_url}/request-line-pax`, payload, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  updateServiceRequestPaxRelation(payload: any): Observable<any> {
    return this.http
      .put(`${this.serviceRequest_url}/modify-request-line-pax`, payload, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  /*
   **search pax
   * @params
   * firstName,
   * lastName,
   * email,
   * mobileNumber,
   */
  SearchPax(searchObj: any, read: any): Observable<ApiResponse> {
    const httpOptions = {
      headers: {
        'Content-Type': 'application/json',
    },
      params: searchObj
    };
    return this.http
      .get<ApiResponse>(this.searchPax_Proxy_Url + read, httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  /**
   * create New pax service calls
   *
   */
  createNewPax(data: PaxModels.PaxSendPayLoad, create: any): Observable<ApiResponse> {
    return this.http
      .post<ApiResponse>(this.searchPax_Proxy_Url + create, JSON.stringify(data), this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  /**
   * Find By contact id
   * @param id {id is number}
   */
  findContactById(id: number, find: any): Observable<ApiResponse> {
    return this.http
      .get<ApiResponse>(this.searchPax_Proxy_Url + find + id, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }

  /*
   *@Company Lov
   *
   */
  readMasterLov(read: any): Observable<ApiResponse> {
    return this.http
      .get<ApiResponse>(this.masterData_Proxy_Url + read, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  readCompanyMasterLov(read: any): Observable<ApiResponse> {
    return this.http
      .get<ApiResponse>(this.companyMasterData_Proxy_Url + read, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  /**Business Lov
   *
   */
  readBusinessList(read: any): Observable<ApiResponse> {
    return this.http
      .get<ApiResponse>(this.businessList_Proxy_Url + read, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  /*
   *Customer Contact services
   */
  createContact(data: CustomerModels.Contact, create): Observable<ApiResponse> {
    return this.http
      .post<ApiResponse>(this.searchPax_Proxy_Url + create, JSON.stringify(data), this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }

  /*create hotel request service
   */
  createHotelServiceRequest(data: Hotel, create): Observable<any> {
    return this.http
      .post<any>(this.serviceRequest_url + create, JSON.stringify(data), this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  findHotelLinesData(hotelLineId: any, srid: any, read): Observable<any> {
    return this.http.get<any>(this.serviceRequest_url + read, {params: { id: hotelLineId, sr: srid }}).pipe(catchError(this.errorHandler));
  }
  updateHotelServiceRequest(data: Hotel, update): Observable<any> {
    return this.http
      .put<any>(this.serviceRequest_url + update, JSON.stringify(data), this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }

  /*create Passenger service
   */
  createHotelPassengers(data: HotelPassengers[], create): Observable<ApiResponse> {
    return this.http
      .post<ApiResponse>(this.serviceRequest_url + create, JSON.stringify(data), this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  /****Addons Services Call */
  createAddons(data: Addons[], create): Observable<any> {
    return this.http
      .post<any>(this.serviceRequest_url + create, JSON.stringify(data), this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  updateAddons(data: Addons[], update): Observable<any> {
    return this.http
      .put<any>(this.serviceRequest_url + update, JSON.stringify(data), this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  /* RFQ Service Call  */
  createRFQ(data: RFQ, create): Observable<ApiResponse> {
    return this.http
      .post<ApiResponse>(this.RFQ + create, JSON.stringify(data), this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }

  /**
   * CustomerDetailsBySrId
   * @param id {id is number}
   */
  getCustomerDetailsBySrId(id: number, find: any): Observable<any> {
    return this.http
      .get<any>(this.serviceRequest_url + find + id, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }

  /**
   * Flight Assignment
   *
   */
  resourcesAssignment(data: ResourcesAssignment, create): Observable<ApiResponse> {
    return this.http
      .post<ApiResponse>(this.ResourcesAssignment + create, JSON.stringify(data), this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
/**
   * SR SummaryData
   *@flight
   @Hotel
*/
 saveSrSummary(data: SrSummary, create): Observable<ApiResponse> {
  return this.http.post<ApiResponse>(this.serviceRequest_url + create, JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
}

  /**
   * get Transitions
   *
   */
  getTransitions(read): Observable<ApiResponse> {
    return this.http
      .get<ApiResponse>(this.serviceRequest_url + read, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  /**
   * insert flex routes
   * @param data flex data
   * @returns
   */
  flexInsert(data: FlexRequest): Observable<FlexResponse> {
    return this.http
      .post<FlexResponse>(this.ttMicroServiceApi + 'common/flex/insert', data)
      .pipe(catchError(this.errorHandler));
  }

  /**
   * flex routes price
   * @param data flex data
   * @returns
   */

   priceToken(): Observable<PriceAccessDeatils> {
    let body = `grant_type=${PriceTokenConfig.grant_type}&client_id=${PriceTokenConfig.client_id}&client_secret=${PriceTokenConfig.client_secret}`;
    return this.http.post<PriceAccessDeatils>(`${this.flexPriceToken}security/oauth2/token`,body,this.priceHttpOptions);
  }
   getFlexPrice(flexDataObj: any,token:any): Observable<FlexPrice> {
   const httpOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
  },
    params: flexDataObj
  };
    return this.http.get(this.flexPriceURL , httpOptions).pipe(catchError(this.errorHandler));
  }


  /**
   * holiday Request
   * @create
   * @find
   * @update
   */

  createHolidayRequest(payload: any,create:string): Observable<any> {
    return this.http.post<any>(this.serviceRequest_url+create, payload, this.httpOptions) .pipe(catchError(this.errorHandler));
  }
  getPackageRequest(find:string,requestId: number): Observable<any> {
    return this.http.get(this.serviceRequest_url+find+requestId, this.httpOptions).pipe(catchError(this.errorHandler));
  }
  modifyHolidayRequest(payload: any,update:string): Observable<any> {
    return this.http.put<any>(this.serviceRequest_url+update, payload, this.httpOptions) .pipe(catchError(this.errorHandler));
  }
  getPackageActivity(attractions:any,read:string): Observable<any> {
    const httpOptions = {
      headers: {
        'Content-Type': 'application/json',

    },
      params: attractions
    };
    return this.http.get(this.serviceRequest_url+read , httpOptions).pipe(catchError(this.errorHandler));
  }

  getPackageDetailedInfo(find:string,requestId: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.serviceRequest_url+find+requestId, this.httpOptions).pipe(catchError(this.errorHandler));
  }

   /**
   * A method to fetch All supplier Data
   *.
   */
   getAllSupplierData(read): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.searchPax_Proxy_Url + read, this.httpOptions).pipe(catchError(this.errorHandler));
  }
   /**
   * A method to fetch All Booking Reports Data
   *.
   */
   getBookingReport(data: BookingReport, create: string): Observable<BookingReportsApiResponse> {
    return this.http.post<BookingReportsApiResponse>(this.ttMicroServiceApi + create, JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
  }

/**
      * A method to get Customer and supplier by businessName
      * @param name {string}
      * customer,supplier
      * @returns { Observable<any> }
      */

 getCustmerByName(find: string, name:string = null): Observable<any> {
  return this.http
    .get<any>(this.searchPax_Proxy_Url + find + name)
    .pipe(map(resp => {
      if (resp?.Error) {
        throwError(resp?.Error);
      } else {
        return resp?.data;
      }
    })
    );
}
   /**
   * A method to send a post request for the customer By Package List
   * @param payload PackageSearch
   * @returns { Observable<ApiResponse>}
   */
    customerByPackageList(payload: PackageSearch,create:string): Observable<ApiResponse> {
      return this.http.post<ApiResponse>(this.serviceRequest_url+create,JSON.stringify(payload) , this.httpOptions).pipe(catchError(this.errorHandler));
    }

 /*******
   * module link create Communication
   * ***
   */
 createCommunication(payload: CommunicationModuleLink,create:string): Observable<ApiResponse> {
  return this.http.post<ApiResponse>(this.companyMasterData_Proxy_Url+create,JSON.stringify(payload) , this.httpOptions).pipe(catchError(this.errorHandler));
}



/*******
   * flight Suggestions
   * ***
   *
   *
 */

  flightSuggestions(srNo:number,srLineNo:number,get:string): Observable<ApiResponse> {
  return this.http.get<ApiResponse>(this.serviceRequest_url+get+srNo+'/'+srLineNo , this.httpOptions).pipe(catchError(this.errorHandler));
 }

/***
   * activities services Request
   * post ,get, update
   * * @param payload Activities
   * @returns { Observable<any>}
 */
 createPackageItineraryAttractions(payload: Activities,create:string): Observable<any> {
  return this.http.post<any>(this.serviceRequest_url+create, payload, this.httpOptions).pipe(catchError(this.errorHandler));
}
getAttractionsData(activitiesNumber:number,get:string): Observable<any> {
  return this.http.get<any>(this.serviceRequest_url+get+activitiesNumber , this.httpOptions).pipe(catchError(this.errorHandler));
 }
 updatePackageItineraryAttractions(activitiesNumber:number,payload: Activities,update:string): Observable<any> {
  return this.http.put<any>(this.serviceRequest_url+update+activitiesNumber, payload, this.httpOptions).pipe(catchError(this.errorHandler));
}


/***
   * services Request communication time
   * get
   * * @param requestNumber is number
   * @returns { Observable<ServiceRequestCommunicationResponse>}
 */
getRequestTimeLineData(srNumber:number,get:string): Observable<ServiceRequestCommunicationResponse> {
  return this.http.get<ServiceRequestCommunicationResponse>(this.ttMicroServiceApi+get+srNumber , this.httpOptions).pipe(catchError(this.errorHandler));
 }



 /***
   * searchSrPackage
   * swagger url:http://192.178.10.171:9001/servicerequest/swagger-ui.html#/
   * get
   * * @param requestNumber is number
   * @returns { Observable<any>}
 */
getpackageHolidayListView(srNumber:number,get:string): Observable<any> {
  return this.http.get<any>(this.serviceRequest_url+get+srNumber , this.httpOptions).pipe(catchError(this.errorHandler));
 }


 /***
   * policyTemplateProcessStage1
   * swagger url:http://192.178.10.171:9011/deals/swagger-ui.html#/
   * post
   * @returns { Observable<any>}
 */
 policyTemplateProcessStage1(create:string,data:PolicyQualifyProcessStage1): Observable<ApiResponse> {
  return this.http.post<ApiResponse>(this.deals+create ,JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
 }


 /***
   * getPackageItenaryInfo
   * swagger url:http://192.178.10.171:9001/servicerequest/swagger-ui.html#/
   * get
   * @returns { Observable<any>}
 */
getPreviewPackage(srNumber:number,get:string): Observable<ApiResponse> {
  return this.http.get<ApiResponse>(this.serviceRequest_url+get+srNumber , this.httpOptions).pipe(catchError(this.errorHandler));
 }
  /*******
   * error handel for all services
   * ***
   */
  errorHandler(error) {
    let errorMessage = '';
    let errorRes = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
      errorRes = error.error.message;
      //errorRes = error.error.errors;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      errorRes = `${error?.error?.message}  `;
      //errorRes = `${error.error.errors}  `;

       if(error.error.errors?.length>0){
        //console.log(error.error);
        errorRes = `${error?.error?.errors[0]?.title}  `;
       }
      //console.log(error.error.errors);
    }

    return throwError(errorRes);
  }
}
