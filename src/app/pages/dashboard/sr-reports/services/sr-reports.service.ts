import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { environment } from 'environments/environment';
import { catchError, map } from 'rxjs/operators';
import { BookingReportsApiResponse } from '../models/invoice-api-response';
import { SystemMasterApiResponse } from '../models/system-api-response';
import { BookingReport } from '../models/booking-search-request';
import { ApiResponse } from '../../dashboard-request/model/api-response';
import { bookingReportBySupplier } from '../models/booking-search-by-supplier-request';

@Injectable({
  providedIn: 'root'
})
export class SrReportsService {
  serviceRequest_url = environment.serviceRequest_url;
  loginAfterHit = environment.loginAfterHit;
  serviceRequest=environment.serviceRequest_url;
  USERMANAGEMENT=environment.USERMANAGEMENT;
  systemMaster=environment.companyMasterData_Proxy_Url;
  JDBCAPI=environment.masterData_Proxy_Url;
  paxData=environment.searchPax_Proxy_Url;
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  constructor(private http: HttpClient) { }


  /**
   * A method to fetch All Booking Reports Data
   *.
   */
   getBookingReport(data: BookingReport, create: string): Observable<BookingReportsApiResponse> {
    return this.http.post<BookingReportsApiResponse>(this.loginAfterHit + create, JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
  }

  getBookingReportBySupplier(data: bookingReportBySupplier, create: string): Observable<BookingReportsApiResponse> {
    return this.http.post<BookingReportsApiResponse>(this.loginAfterHit + create, JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
  }
  /**
   * A method to Warehouse Booking Report Controller autosuggestion list
   * @param name {string}
   * @returns { Observable<any> }
   */
 /*  getAutosuggestion(find: string, name: string): Observable<any> {
    return this.http.get(this.serviceRequest + find + name).pipe(map((res: any) => res));
  } */
  getAutosuggestion(find: string, name:string = null): Observable<any> {
    return this.http
      .get<any>(this.serviceRequest + find + name)
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
   * A method to fetch All getSubReferenceType Data
   *.
   */
   getSubReferenceType(read:string): Observable<any> {
    return this.http.get<any>(this.serviceRequest + read, this.httpOptions).pipe(catchError(this.errorHandler));
  }

   /**
   * A method to fetch All User Data
   *.
   */
   getAllUsersData(read): Observable<any> {
    return this.http.get<any>(this.USERMANAGEMENT + read, this.httpOptions).pipe(catchError(this.errorHandler));
  }
  /**
   * A method to fetch All SystemMasterData
   *.
   */
   getsystemMasterData(read): Observable<SystemMasterApiResponse> {
    return this.http.get<SystemMasterApiResponse>(this.systemMaster + read, this.httpOptions).pipe(catchError(this.errorHandler));
  }

  /**
      * A method to get office ID by officeid
      * @param officeid {string}
      * @returns { Observable<any> }
      */
   /* getOfficeID(name, find): Observable<SystemMsterApiResponse> {
    return this.http.get<SystemMsterApiResponse>(this.systemMaster + find + name, this.httpOptions).pipe(catchError(this.errorHandler));
  } */

  getOfficeID(find: string, name:string = null): Observable<any> {
    return this.http
      .get<any>(this.systemMaster + find + name)
      .pipe(
        catchError(this.errorHandler),
        map(resp => {
        if (resp.Error) {
          throwError(resp?.Error);
        } else {
          return resp?.data;
        }
      })
      );
  }

  /**
      * A method to get JDBC Master by officeid
      * @param name {string}
      * product,passengertype
      * @returns { Observable<any> }
      */

  getJDBCData(find: string, name:string = null): Observable<any> {
    return this.http
      .get<any>(this.JDBCAPI + find + name)
      .pipe(
        catchError(this.errorHandler),
        map(resp => {
        if (resp.Error) {
          throwError(resp?.Error);
        } else {
          return resp?.data;
        }
      })
      );
  }

  /**
      * A method to get Customer and supplier by businessName
      * @param name {string}
      * customer,supplier
      * @returns { Observable<any> }
      */

   getCustmerDeatils(find: string, name:string = null): Observable<any> {
    return this.http
      .get<any>(this.paxData + find + name)
      .pipe(
        catchError(this.errorHandler),
        map(resp => {
        if (resp?.Error) {
          throwError(resp?.Error);
        } else {
          return resp?.data;
        }
      })
      );
  }

  findByIdCustomer(customerId:number,find:string): Observable<any> {
    return this.http.get<any>(this.paxData + find + customerId, this.httpOptions).pipe(catchError(this.errorHandler));
  }
  /**
      * A method to get contact
      * @param customerId {number}
      * @returns { Observable<any> }
      */
  getContact(customerid, read): Observable<SystemMasterApiResponse> {
    return this.http.get<SystemMasterApiResponse>(this.paxData + read + customerid, this.httpOptions).pipe(catchError(this.errorHandler));
  }


   /**
    *@SrSummary List
   * A method to get the customer by name
   * @param customerName
   * @returns { Observable<any> }
   */
    getCustomerByName(customerName: string): Observable<any> {
      return this.http.get(`${this.paxData}customer/businessName?businessName=${customerName}`, this.httpOptions).pipe(catchError(this.errorHandler),map((res: ApiResponse) => res.data));
    }

  getSrSummaryList(customerId:number,searchObj: any, read:string): Observable<SystemMasterApiResponse> {
    const httpOptions = {
      headers: {
        'Content-Type': 'application/json',

    },
    params: searchObj
    };
    return this.http.get<SystemMasterApiResponse>(this.serviceRequest + read+customerId , httpOptions).pipe(catchError(this.errorHandler));
  }


  getSrSummaryDeatilsBySrLine(service_request:number,service_request_line:number,product:number): Observable<any> {
    return this.http.get<any>(`${this.loginAfterHit}common/sr_summary_details_by_sr_srline?service_request=${service_request}&service_request_line=${service_request_line}&product=${product}&data_request=all`, this.httpOptions).pipe(catchError(this.errorHandler));
  }


  /**
   * A method to send a post request for the corporate form
   * @param payload request line payload
   * @returns { Observable<any>}
   */
   createServiceRequestLine(payload: any): Observable<any> {
    return this.http.post(`${this.serviceRequest_url}/create-service-request`, payload, this.httpOptions).pipe(catchError(this.errorHandler));
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
      errorRes = `${error.error.message}  `;
      //errorRes = `${error.error.errors}  `;
      //console.log(error.error);
      //console.log(error.error.errors);
    }
    return throwError(errorRes);
  }
}
