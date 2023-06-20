import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root',
})
export class ServiceTypeService {
  private _serviceRequestDataCommunication = new Subject<any>();

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  constructor(private http: HttpClient) {}
  getRequestDataCommunication(): Observable<any> {
    return this._serviceRequestDataCommunication.asObservable();
  }
  sendRequestDataCommunication(data: any) {
    this._serviceRequestDataCommunication.next(data);
  }

  //create services
  create(url: string, data: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(url, JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
  }
  //update services
  update(url: string, data: any): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(url, JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
  }
  read(read: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(read, this.httpOptions).pipe(catchError(this.errorHandler));
  }
  getPricingForServiceRequest(url: string, data: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(url, data, this.httpOptions).pipe(catchError(this.errorHandler));
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
