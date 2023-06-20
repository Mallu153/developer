import { environment } from 'environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AddPrice } from '../models/add-price';

export interface PackagesAddPrice {
  message: string;
  status: number;
  data: any[];
  errors: any[];
}

@Injectable({
  providedIn: 'root',
})
export class AddpricePackageService {
  itineraryAddPrice = environment.packageAddPrice;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  constructor(private http: HttpClient) {}

  /*******
   * swaggerUrl:http://192.178.10.171:9066/packages/swagger-ui.html#/
   * packages-controller controller  get request
   * getItineraryList is passing User Enter string get the api response
   *@returns { Observable<any> }
   ***/
  getItineraryList(find: string, name: string = null): Observable<any> {
    return this.http.get<any>(this.itineraryAddPrice + find + name).pipe(
      catchError(this.errorHandler),
      map((resp) => {
        if (resp?.Error) {
          throwError(resp?.Error);

        } else {
          return resp?.data;
        }
      })
    );
  }

  /*******
   * swaggerUrl:http://192.178.10.171:9066/packages/swagger-ui.html#/
   * packages-controller controller  get request
   * getItineraryInfo is passing user select itinerary id get the api response
   *@returns { Observable<PackagesAddPrice> }
   ***/
   getItineraryInfo(id: number, find: string): Observable<PackagesAddPrice> {
    return this.http.get<PackagesAddPrice>(this.itineraryAddPrice + find + id, this.httpOptions).pipe(catchError(this.errorHandler));
  }


  /*******
   * swaggerUrl:http://192.178.10.171:9066/packages/swagger-ui.html#/
   * packages-controller controller  get request
   * getPackagesItemsList get all item list the api response
   *@returns { Observable<PackagesAddPrice> }
   ***/
   getItemListInfo(read: string): Observable<PackagesAddPrice> {
    return this.http.get<PackagesAddPrice>(this.itineraryAddPrice + read , this.httpOptions).pipe(catchError(this.errorHandler));
  }

  /*******
   * swaggerUrl:http://192.178.10.171:9066/packages/swagger-ui.html#/
   * createPackagePricing controller  post request
   * getPackagePricingList controller get request
   * getPackagePriceInfo controller get request
   * updatePackagePricing controller put request
   * getPackagesItemsList get all item list the api response
   *@returns { Observable<PackagesAddPrice> }
   ***/
   createPackagePricing(data:AddPrice,create: string): Observable<PackagesAddPrice> {
    return this.http.post<PackagesAddPrice>(this.itineraryAddPrice + create ,JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
  }
  getPackagePricingList(read: string): Observable<PackagesAddPrice> {
    return this.http.get<PackagesAddPrice>(this.itineraryAddPrice + read , this.httpOptions).pipe(catchError(this.errorHandler));
  }
  getPackagePriceInfo(id:number,read: string): Observable<PackagesAddPrice> {
    return this.http.get<PackagesAddPrice>(this.itineraryAddPrice + read+id , this.httpOptions).pipe(catchError(this.errorHandler));
  }
  updatePackagePricing(headerNumber:number,data:AddPrice,update: string): Observable<PackagesAddPrice> {
    return this.http.put<PackagesAddPrice>(this.itineraryAddPrice + update+headerNumber ,JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
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

      if (error.error.errors?.length > 0) {
        //console.log(error.error);
        errorRes = `${error?.error?.errors[0]?.title}  `;
      }
      //console.log(error.error.errors);
    }
    return throwError(errorRes);
  }
}
