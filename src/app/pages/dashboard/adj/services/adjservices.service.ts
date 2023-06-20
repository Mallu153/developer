import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { PNRResponse } from '../../adj/models/models';
import { environment } from 'environments/environment';
import { error } from 'protractor';
import { HttpParams } from '@angular/common/http';
import { ApiResponse } from '../../adj/models/adj-api-responce';

/* const httpTokenOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJQWGZxdjBpd1l5Z0hVZkpjZ0tpY0lCSkFGbmhvLVFFY0ZoWUhDMHBNbGlvIn0.eyJleHAiOjE2NTE4NDU1NjYsImlhdCI6MTY1MTg0MTk2NiwianRpIjoiZWM4NDAyOTAtNmMwYi00MzQxLWFlZmYtMGM1Zjc5NzA0OTU0IiwiaXNzIjoiaHR0cDovLzE5Mi4xNzguMTAuMTMyOjgwODAvYXV0aC9yZWFsbXMvVHJhdnRyb25pY3MiLCJhdWQiOlsicmVhbG0tbWFuYWdlbWVudCIsImFjY291bnQiXSwic3ViIjoiZmNjZjJjM2UtZjZkNy00YzhlLWEyZDUtMWI0NmQ2NmYwMTljIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoidHJhdnRyb25pY3MtYXBwIiwic2Vzc2lvbl9zdGF0ZSI6IjRhNTlhYzA1LWYwNTktNGE3Ny05NmU1LTZmOWRhNTQzZjk1NyIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJkZWZhdWx0LXJvbGVzLXRyYXZ0cm9uaWNzIiwiQWRtaW5Sb2xlIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJyZWFsbS1tYW5hZ2VtZW50Ijp7InJvbGVzIjpbInZpZXctaWRlbnRpdHktcHJvdmlkZXJzIiwidmlldy1yZWFsbSIsIm1hbmFnZS1pZGVudGl0eS1wcm92aWRlcnMiLCJpbXBlcnNvbmF0aW9uIiwicmVhbG0tYWRtaW4iLCJjcmVhdGUtY2xpZW50IiwibWFuYWdlLXVzZXJzIiwicXVlcnktcmVhbG1zIiwidmlldy1hdXRob3JpemF0aW9uIiwicXVlcnktY2xpZW50cyIsInF1ZXJ5LXVzZXJzIiwibWFuYWdlLWV2ZW50cyIsIm1hbmFnZS1yZWFsbSIsInZpZXctZXZlbnRzIiwidmlldy11c2VycyIsInZpZXctY2xpZW50cyIsIm1hbmFnZS1hdXRob3JpemF0aW9uIiwibWFuYWdlLWNsaWVudHMiLCJxdWVyeS1ncm91cHMiXX0sImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoicHJvZmlsZSBlbWFpbCIsInNpZCI6IjRhNTlhYzA1LWYwNTktNGE3Ny05NmU1LTZmOWRhNTQzZjk1NyIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW4ifQ.DbLYMolpNyYCnTewDb9x_Rblo3WIxdy3RjJWfTCQksWmy98P3uAFwphEWNyn0bK7lOH9UXDaVE1wCkDM7OHTp0oxxkoh48OfswQ9N5nGyTZjUHC8S0lgnNn1vqjaegf2awvMvYX0l6xYRqp9jqe8OeNcf3SPTbkkKLFJ7JEXxiyHDg3e5vacwgjJcVovm6n0VOhLs5EVS1XVgwgdSCF4uzBCln_g7aqm7sPm5WwsrocZsrBrk4c4WMExUwPAE8lLN8Jpj4UnHyEa9SR2k-VvcK7LC8C52QoSnFY1iiGu8RkTITY5uAzOdodDEGRfgXyktGBmjW4rOIk0f_UnEwSWJA'
  })
}; */
@Injectable({
  providedIn: 'root',
})
export class AdjservicesService {
  serviceRequest_urls = environment.serviceRequest_url;
  url = environment.loginAfterHit;
  flightBooking = environment.flightBooking;
  searchPax_Proxy_Url = environment.searchPax_Proxy_Url;
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  httpClient: any;

  constructor(private http: HttpClient) {}

  getPnrDetails(data: any, url: string): Observable<PNRResponse> {
    return this.http.post<any>(this.url + url, data, this.httpOptions).pipe(
      //retry(2),
      catchError(this.errorHandle)
    );
  }
  SearchPax(searchObj: any, read: any): Observable<ApiResponse> {
    return this.http
      .get<ApiResponse>(this.searchPax_Proxy_Url + read, { params: searchObj })
      .pipe(catchError(this.errorHandle));
  }
  createServiceRequestLine(payload: any): Observable<any> {
    return this.http
      .post(`${this.serviceRequest_urls}/create-service-request`, payload, this.httpOptions)
      .pipe(catchError(this.errorHandle));
  }
  createAdj(payload: any, url: string): Observable<any> {
    return this.http.post(this.flightBooking + url, payload, this.httpOptions).pipe(catchError(this.errorHandle));
  }

  //error handling method


  errorHandle(error) {
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
