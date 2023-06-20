import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
export class CbtApiResponse {
  data: any[];
  errors: any[];
  message: string;
  status: number;
}
@Injectable({
  providedIn: 'root',
})
export class CbtService {


  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  constructor(private http: HttpClient) {}
  /**
   *
   *
   * @param {string} url
   * @param {string} read
   * @param {*} params
   * @return {*}  {Observable<any>}
   * @memberof CbtService
   */
  getActiveQuotesWithPagination(read: string, params: any): Observable<any> {
    const httpOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
      params: params,
    };
    return this.http.get<any>( read, httpOptions).pipe(catchError(this.errorHandler));
  }

  /**
   *
   *
   * @param {string} read
   * @return {*}  {Observable<CbtApiResponse>}
   * @memberof CbtService
   */
  getCbtWidgetsCount(read: string): Observable<CbtApiResponse> {
    return this.http.get<CbtApiResponse>( read, this.httpOptions).pipe(catchError(this.errorHandler));
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
