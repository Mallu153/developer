import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { QuotesApiResponse } from '../models/quotes-api-response';
export interface mptbResponse {
  message?: string;
  errors?: any[];
  status: boolean;
  amadeus_flight_offer_data: any[];
  amadeus_flight_offer_dictionaries: any[];
  price_group_data: any[];
  supplier_group_data: any[];
  baggage_group_data: any[];
  airports_master: any;
  distinct_price: string[];
}

export interface FlightSearch {
  adt: number;
  chd: number;
  inf: number;
  depature_code: string;
  arrival_code: string;
  depature_date: string;
  return_date: string;
  request_no: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuotesService {
  RFQ= environment.RFQ;
  serviceRequest_url = environment.serviceRequest_url;
  PaxData = environment.searchPax_Proxy_Url;
  mptb = environment.loginAfterHit;
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  constructor(private http: HttpClient) { }

  getquotes(searchObj: any, read: string): Observable<QuotesApiResponse> {
    return this.http.get<QuotesApiResponse>(this.RFQ + read, {params: searchObj}).pipe(catchError(this.errorHandler));
  }

  /**
   * A method to get the airline by name
   * @param customerName
   * @returns { Observable<any> }
   */
/*   getCustomerData(customerName: string): Observable<any> {
    return this.http.get(`${this.serviceRequest_url}/search/customer?searchString=${customerName}`, this.httpOptions);
  } */
  getCustomerData( customerName: string): Observable<any> {
    return this.http.get(`${this.PaxData}customer/businessName?businessName=${customerName}` , this.httpOptions).pipe(map((res: QuotesApiResponse) => res.data)).pipe(catchError(this.errorHandler));
  }
  /**
   * A method to fetch get-service-request
   *@param customerId .
   */
  getContactData(customerId: number, read): Observable<any> {
    return this.http.get(this.serviceRequest_url + read + customerId, this.httpOptions).pipe(catchError(this.errorHandler));
  }


  /*******
   * http://travpx.dev.com/tt-micro-services_v1/flight_api/flight_offers/search
   *
   *@returns { Observable<mptbResponse> }
   ***/
   mptbFlightSearch(data: FlightSearch, create: string): Observable<mptbResponse> {
    return this.http
      .post<mptbResponse>(this.mptb + create, JSON.stringify(data), this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  getQuoteInfo(id, read): Observable<mptbResponse> {
    return this.http.get<mptbResponse>(this.RFQ + read + id, this.httpOptions);
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
