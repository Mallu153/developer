import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { CashManagementApiResponse } from '../models/cash-management-response';
import * as CASHMANAGEMENTModel from '../models/cash-management-models';
import { QuoteAging } from '../models/aging';
@Injectable({
  providedIn: 'root',
})
export class CashManagementService {
  storeManagement = environment.storeManagement;
  systemMaster = environment.companyMasterData_Proxy_Url;
  RFQ = environment.RFQ;
  USERMANAGEMENT = environment.USERMANAGEMENT;
  private readonly reports = environment.reports;
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  constructor(private httpClient: HttpClient) {}

  /*
  @param loginId
  @id=agentid
  */
  getAgentCashInfo(id, find): Observable<CashManagementApiResponse> {
    return this.httpClient
      .get<CashManagementApiResponse>(this.storeManagement + find + id, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  /*
    saveStoreTransactions service call
  */

  saveStoreTransactions(id, data: CASHMANAGEMENTModel.StoreManagement, create): Observable<CashManagementApiResponse> {
    return this.httpClient
      .post<CashManagementApiResponse>(this.storeManagement + create + id, JSON.stringify(data), this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }

  /*
  *@param agentId
  getCashTransactionsApprovalsData
*/
  getCashTransactionsApprovalsListInfo(id, find): Observable<CashManagementApiResponse> {
    return this.httpClient
      .get<CashManagementApiResponse>(this.storeManagement + find + id, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  /*
    saveStoreTransactions service call
  */

  updateStatusOfCashTransactionLine(
    id,
    data: CASHMANAGEMENTModel.ActionOnCashTransactionLine,
    create
  ): Observable<CashManagementApiResponse> {
    return this.httpClient
      .post<CashManagementApiResponse>(this.storeManagement + create + id, JSON.stringify(data), this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }

  /*
   getAgentAllCashTransactions
  */

  getAgentCashData(id, find): Observable<CashManagementApiResponse> {
    return this.httpClient
      .get<CashManagementApiResponse>(this.storeManagement + find + id, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }

  /**
   * service to get current month booking
   *
   * @param {string} month
   * @param {string} year
   * @param {string} userId
   * @return {*}  {Observable<CashManagementApiResponse>}
   * @memberof CashManagementService
   */
  getCurrentMonthBookings(month: number, year: number, userId: number): Observable<CashManagementApiResponse> {
    return this.httpClient
      .get<CashManagementApiResponse>(
        `${this.reports}get-booking-count-product/${month}/${year}/${userId}`,
        this.httpOptions
      )
      .pipe(catchError(this.errorHandler));
  }
  //apiSearchData
  getMailCount(read: string): Observable<CashManagementApiResponse> {
    return this.httpClient
      .get<CashManagementApiResponse>(this.systemMaster + read, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }

  getQuoteAgeingReport(data: QuoteAging, create: string): Observable<CashManagementApiResponse> {
    return this.httpClient
      .post<CashManagementApiResponse>(this.reports + create, JSON.stringify(data), this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  readAgent(read): Observable<any> {
    return this.httpClient.get<any>(this.USERMANAGEMENT + read, this.httpOptions).pipe(catchError(this.errorHandler));
  }
  getCountByAgent(id: number, read: string): Observable<any> {
    return this.httpClient.get<any>(this.RFQ + read + id).pipe(catchError(this.errorHandler));
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
