import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { environment } from 'environments/environment';
import { RfqApiResponse } from '../rfq-models/rfq-api-response';
import { RFQ } from '../rfq-models/rfq-api-models';
import { catchError, map } from 'rxjs/operators';
import { RFQAddons, RFQHotel, RFQHotelPassengers } from '../rfq-models/rfq-hotel';
import { PaxImage, RfqEmail, RfqEmailResponse } from '../rfq-models/rfq-email';
import { Attractions, Supplier } from '../../dashboard-request/model/package-itonerary-attractions';
import { AddToQuotes } from '../rfq-models/save-quote';
import { SendMessage, WaApiResponse } from '../rfq-models/sendMessage';


@Injectable({
  providedIn: 'root',
})
export class RfqService {
  searchPax_Proxy_Url = environment.searchPax_Proxy_Url;
  serviceRequest_url = environment.serviceRequest_url;
  USERMANAGEMENT = environment.USERMANAGEMENT;
  BPF = environment.BPF;
  flightBooking = environment.flightBooking;
  RFQ = environment.RFQ;
  PaxData = environment.searchPax_Proxy_Url;
  loginAfterHit=environment.loginAfterHit;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  constructor(private http: HttpClient) {}
  /* image
 upload services
 */
 imageUpload(file, id, create): Observable<PaxImage> {
  // Create form data
  const formData = new FormData();
  // Store form name as "file" with file data
  formData.append('file', file, file.name);
  formData.append('entityId', id);
  //formData.append("entityType", "Pax");
  return this.http
    .post<PaxImage>(`${this.searchPax_Proxy_Url}${create}`, formData)
    .pipe(catchError(this.errorHandler));
}
  /**
   * A method to fetch All supplier Data
   *.
   */
  getAllSupplierData(read): Observable<RfqApiResponse> {
    return this.http.get<RfqApiResponse>(this.searchPax_Proxy_Url + read, this.httpOptions).pipe(catchError(this.errorHandler));
  }

  /**
   * RFQ Flight
   * A method to Post
   * @rfqLine
   * @rfqSegments
   *.
   */
  /**
   * @RFQ
   * Create
   * Get
   * find
   * Update
   * @param payload request line payload
   * @returns { Observable<any>}
   */
  createRFQFlight(payload: RFQ,rfqId:number): Observable<any> {
    if(rfqId !== 0){
      return this.http.post<any>(`${this.serviceRequest_url}/create-rfq-request?rfqId=${rfqId}`, payload, this.httpOptions).pipe(catchError(this.errorHandler));
    }else{
      return this.http.post<any>(`${this.serviceRequest_url}/create-rfq-request`, payload, this.httpOptions).pipe(catchError(this.errorHandler));
    }

  }
  getSupplierInformation(read): Observable<any> {
    return this.http.get<any>(this.serviceRequest_url + read, this.httpOptions).pipe(catchError(this.errorHandler));
  }
  findRFQById(rfq:number,srid:number ,srLineId:number,find:string): Observable<any> {
    return this.http.get<any>(this.serviceRequest_url + find + rfq+'/'+srid+'/'+srLineId, this.httpOptions).pipe(catchError(this.errorHandler));
  }
  updateRFQFlight(payload: RFQ, update): Observable<any> {
    return this.http.put<any>(this.serviceRequest_url + update, JSON.stringify(payload), this.httpOptions).pipe(catchError(this.errorHandler));
  }
  /**
   * @fetching the Customer Deatils
   *
   * @returns { Observable<any>}
   */
  getCustomerDeatilsByReqId(id, find): Observable<any> {
    return this.http.get<any>(this.serviceRequest_url + find + id, this.httpOptions).pipe(catchError(this.errorHandler));
  }
  /**
   * A method to fetch All User Data
   *.
   */
  getAllUsersData(read): Observable<any> {
    return this.http.get<any>(this.USERMANAGEMENT + read, this.httpOptions).pipe(catchError(this.errorHandler));
  }
  getUsersByName(find: string, name:string = null): Observable<any> {
    return this.http
      .get<any>(this.USERMANAGEMENT + find + name)
      .pipe(
        catchError(this.errorHandler),
        map(resp => {
        if (resp.Error) {
          throwError(resp.Error);
        } else {
          return resp;
        }
      })
      );
  }
  /**
   * A method to Post
   * @RfqRelationRelationSearch
   *.
   */
  RFQFlightSearch(payload: any, create): Observable<any> {
    return this.http
      .post<any>(this.serviceRequest_url + create, payload, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  /**
   * A method to Get
   * @BPFTransitions
   *.
   */
  getBPFTransitions(read): Observable<RfqApiResponse> {
    return this.http.get<RfqApiResponse>(this.BPF + read, this.httpOptions).pipe(catchError(this.errorHandler));
  }

  /**
   * A method to PUT
   * @BPFTransitions
   *.
   */
  updateRFQTransitions(rfqId: number, transitionId: number, update): Observable<any> {
    return this.http.put<any>(
      this.serviceRequest_url + update + rfqId + '/transition/' + transitionId,
      this.httpOptions
    ).pipe(catchError(this.errorHandler));
  }

  /**
   * A method to get
   * @Pricedata
   *.
   */
  getbookingInfo(srId,srLineId, read): Observable<RfqApiResponse> {
    const httpOptions = {
      headers: {
        'Content-Type': 'application/json',
    },
      params: { srId: srId, srLine: srLineId }
    };
    return this.http.get<RfqApiResponse>(this.flightBooking + read ,httpOptions).pipe(catchError(this.errorHandler));
  }
  getbookingInfoRfqId(rfqid, read): Observable<RfqApiResponse> {
    return this.http.get<RfqApiResponse>(this.flightBooking + read + rfqid, this.httpOptions).pipe(catchError(this.errorHandler));
  }
  getbookingInfoAllParamas(searchObj: any, read: string): Observable<any> {
    const httpOptions = {
      headers: {
        'Content-Type': 'application/json',
    },
      params: searchObj
    };
    return this.http.get(this.flightBooking + read, httpOptions).pipe(catchError(this.errorHandler));
  }
  /**
   * @RFQList
   * Open
   * Submitted
   * @param searchObj
   * @returns { Observable<any>}
   */
  getRFQList(searchObj: any, read: string): Observable<RfqApiResponse> {
    return this.http.get<RfqApiResponse>(this.RFQ + read, { params: searchObj }).pipe(catchError(this.errorHandler));
  }
  /**
   * A method to get the airline by name
   * @param customerName
   * @returns { Observable<any> }
   */

  getCustomerData( customerName: string): Observable<any> {
    return this.http.get(`${this.searchPax_Proxy_Url}customer/businessName?businessName=${customerName}` , this.httpOptions).pipe(map((res: RfqApiResponse) => res.data.slice(0, 10))).pipe(catchError(this.errorHandler));
  }
  /**
   * A method to fetch get-service-request
   *@param customerId .
   */
  getContactData(customerId: number, read): Observable<any> {
    return this.http.get(this.serviceRequest_url + read + customerId, this.httpOptions).pipe(catchError(this.errorHandler));
  }
  /**
   * A method to get Supplier by name
   * @param name {string}
   * @returns { Observable<any> }
   */
  getSupplierByName(find: string, name: string): Observable<any> {
    return this.http.get(this.PaxData + find + name).pipe(map((res: RfqApiResponse) => res.data.slice(0, 10))).pipe(catchError(this.errorHandler));
  }

  /**
   * A method to get Supplier by id by contacts
   * @param supplierid {number}
   * @returns { Observable<any> }
   */
  getSupplierContacts(supplierId, find): Observable<RfqApiResponse> {
    return this.http.get<RfqApiResponse>(this.PaxData + find + supplierId, this.httpOptions).pipe(catchError(this.errorHandler));
  }


/**
 *
 * RFQ Hotel Services Here
 * */
 createRFQHotel(data: RFQHotel, create:string,rfqId:number): Observable<any> {
  if(rfqId!== 0){
    return this.http.post<any>(this.serviceRequest_url + create+`?rfqId=${rfqId}`, JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
  }else{
    return this.http.post<any>(this.serviceRequest_url + create, JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
  }

}
findRFQHotelLinesData(rfqId:number, read:string ,srId:number,srLineNumber:number): Observable<RfqApiResponse> {
  return this.http.get<RfqApiResponse>(this.serviceRequest_url + read+`rfq/${rfqId}/sr/${srId}/srline/${srLineNumber}`, this.httpOptions).pipe(catchError(this.errorHandler));
}
updateRFQHotel(data: RFQHotel, create): Observable<any> {
  return this.http.put<any>(this.serviceRequest_url + create, JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
}
createRFQHotelPassengers(data: RFQHotelPassengers[], create): Observable<RfqApiResponse> {
  return this.http.post<RfqApiResponse>(this.serviceRequest_url + create, JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
}
createRFQAddons(data: RFQAddons[], create): Observable<any> {
  return this.http.post<any>(this.serviceRequest_url + create, JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
}
updateRFQAddons(data: RFQAddons[], update): Observable<any> {
  return this.http.put<any>(this.serviceRequest_url + update, JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
}




/*******
   * RFQ Ancillary
   * ***
   */
 saveRfqAncillary(data:any,create:string,rfqId:number):Observable<RfqApiResponse>{
  if(rfqId!== 0){
    return this.http.post<RfqApiResponse>(this.serviceRequest_url+create+`?rfqId=${rfqId}`, JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));

  }else{
    return this.http.post<RfqApiResponse>(this.serviceRequest_url+create, JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
  }

 }
 savePaxRfqAncillary(data:any,rfqId:number,create:string):Observable<RfqApiResponse>{
  return this.http.post<RfqApiResponse>(this.serviceRequest_url+create+rfqId, JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
 }
 findRfqAncillaryByid(rfqId:number,requestId:number,srLine:number,find:string):Observable<RfqApiResponse>{
  return this.http.get<RfqApiResponse>(this.serviceRequest_url+find+`rfq/${rfqId}/sr/${requestId}/srline/${srLine}`, this.httpOptions).pipe(catchError(this.errorHandler));
 }
 updateRfqAncillaryByid(data:any,ancillaryId:number,update:string):Observable<RfqApiResponse>{
  return this.http.put<RfqApiResponse>(this.serviceRequest_url+update+ancillaryId, JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
 }
 ancillaryRfqSupplierRealtion(data:any,create:string):Observable<RfqApiResponse>{
  return this.http.post<RfqApiResponse>(this.serviceRequest_url+create, JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
 }


/*******
   * RFQ Attractions
   * ***
   */

 saveRfqAttractions(data:Attractions,create:string,rfqId:number):Observable<any>{
  if(rfqId !== 0){
    return this.http.post<any>(this.serviceRequest_url+create+`?rfqId=${rfqId}`, JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
  }else{
    return this.http.post<any>(this.serviceRequest_url+create, JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
  }

 }
 rfqAttractionsSupplier(data:any,create:string):Observable<any>{
  return this.http.post<any>(this.serviceRequest_url+create, JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
 }
 findRfqAttractionByid(rfqId:number,requestId:number,srLine:number,find:string):Observable<RfqApiResponse>{
  return this.http.get<RfqApiResponse>(this.serviceRequest_url+find+`rfq/${rfqId}/sr/${requestId}/srline/${srLine}`, this.httpOptions).pipe(catchError(this.errorHandler));
 }
 updateRfqAttractions(data:any,update:string):Observable<any>{
    return this.http.put<any>(this.serviceRequest_url+update, JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
 }
 /*******
   * All Product RFQ List
   * ***
 */
 getAllProductRFQList(data: any, create: string,product:number): Observable<RfqApiResponse> {
  return this.http.post<RfqApiResponse>(this.serviceRequest_url + create+`?productId=${product}`, JSON.stringify(data),this.httpOptions).pipe(catchError(this.errorHandler));
  /* if(product !== 0){
    return this.http.post<RfqApiResponse>(this.serviceRequest_url + create+`?productId=${product}`, JSON.stringify(data),this.httpOptions).pipe(catchError(this.errorHandler));
  }else{
    return this.http.post<RfqApiResponse>(this.serviceRequest_url + create, JSON.stringify(data),this.httpOptions).pipe(catchError(this.errorHandler));
  } */

}
/*******
   * generateSequenceNo RFQ
   * ***
*/
 generateSequenceNo(srid:number ,find:string): Observable<any> {
  return this.http.get<any>(this.serviceRequest_url + find +srid, this.httpOptions).pipe(catchError(this.errorHandler));
}




/*******
   * save-quote-info
   * ***
*/

saveQuotes(data: AddToQuotes, create: string): Observable<RfqApiResponse> {
  return this.http.post<RfqApiResponse>(this.RFQ + create, JSON.stringify(data),this.httpOptions).pipe(catchError(this.errorHandler));
}



sendRfqEmail(data:RfqEmail, create): Observable<RfqApiResponse> {
  return this.http.post<RfqApiResponse>(`${environment.RFQ}${create}`, JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
}
sendRFQEmail(email: string, name:string,sr:number): Observable<RfqApiResponse> {
  return this.http.post<RfqApiResponse>(`${this.RFQ}send-rfq-user-mail?email=${email}&rfqSubmittedName=${name}&sr=${sr} ` ,JSON.stringify({}), this.httpOptions).pipe(catchError(this.errorHandler));
}

sendWaMessage(data: SendMessage, create: string): Observable<WaApiResponse> {
  return this.http.post<WaApiResponse>(this.loginAfterHit + create, JSON.stringify(data),this.httpOptions).pipe(catchError(this.errorHandler));
}
async sendRFQEmails(email: string, name:string,sr:number): Promise<RfqApiResponse> {
  try {
    const response = await this.http.post<RfqApiResponse>(`${this.RFQ}send-rfq-user-mail?email=${email}&rfqSubmittedName=${name}&sr=${sr} ` ,JSON.stringify({})).toPromise();
    return response;
  } catch (error) {
    this.errorHandler(error);
    throw new Error('Failed to post data');
  }
}


async sendWaMessages(data: SendMessage, create: string): Promise<WaApiResponse> {
  try {
    const response = await this.http.post<WaApiResponse>(this.loginAfterHit + create, JSON.stringify(data)).toPromise();
    return response;
  } catch (error) {
    this.errorHandler(error);
    throw new Error('Failed to post data');
  }
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
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;

      errorRes = `${error.error.message} `;
    }
    return throwError(errorRes);
  }
}
