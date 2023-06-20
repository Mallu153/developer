import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CheckListData,
  CHECK_LIST_APIRESPONSE,
  CreateCheckList,
  CreateCheckListResponse,
  FlightApiResponse,
  HotelDetailsResponse,
  HOTEL_AMENDMENTS_RESPONSE,
  HotelBooking,
  PNR,
  PNRAPIRESPONSE,
  ReissueRequest,
  HotelDeatils
} from './amendments.model';

@Injectable({
  providedIn: 'root',
})
export class AmendmentsService {
  flightBooking = environment.flightBooking;
  serviceRequest_url=environment.serviceRequest_url;
  systemMatser=environment.companyMasterData_Proxy_Url;
  loginAfterHit=environment.loginAfterHit;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  /**
   *  Get flight booking information
   * @param bookingId .
   * @returns { Observable<FlightApiResponse> }
   */
  getFlightBookingInformation(read: string, bookingId: number): Observable<FlightApiResponse> {
    return this.http.get<FlightApiResponse>(this.flightBooking + read + bookingId, this.httpOptions).pipe(catchError(this.errorHandler));
  }

   /**
   * A method to send a post request to save the service request line
   * @param payload request line payload
   * @returns { Observable<any>}
   */
    createReissueRequest(payload: ReissueRequest,create:string): Observable<any> {
      return this.http.post<any>(this.serviceRequest_url+create,  JSON.stringify(payload), this.httpOptions).pipe(catchError(this.errorHandler));
    }
 /**
   * A method to send a post request to get flight pnr data
   * payload for json
   * @returns { Observable<any>}
   */
  getPnrData(data: PNR,create:string): Observable<PNRAPIRESPONSE> {
    return this.http.post<PNRAPIRESPONSE>(this.loginAfterHit+create,  JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
  }
    /**
   * A method to get all meals data
   * @returns { Observable<FlightApiResponse>}
   */
     getAllMeals(read: string): Observable<FlightApiResponse> {
      return this.http.get<FlightApiResponse>(this.systemMatser + read , this.httpOptions).pipe(catchError(this.errorHandler));
    }

    /**
   * A method to send a post request to get check list data
   * payload for json
   * @returns { Observable<any>}
   */
  getAmendmentsForChecklist(data: CheckListData,create:string): Observable<CHECK_LIST_APIRESPONSE> {
    return this.http.post<CHECK_LIST_APIRESPONSE>(this.loginAfterHit+create,  JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
  }

   /**
   * A method to send a post request to save  check list data
   * payload for json
   * @returns { Observable<any>}
   */
   createCheckList(data: CreateCheckList,create:string): Observable<CreateCheckListResponse> {
      return this.http.post<CreateCheckListResponse>(this.loginAfterHit+create,  JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
    }

    /**
   * A method to send a post request to get hotel booking data for amendments
   * payload for json
   * @returns { Observable<any>}
   */
  getHotelBookingData(data: HotelBooking,create:string): Observable<HOTEL_AMENDMENTS_RESPONSE> {
    return this.http.post<HOTEL_AMENDMENTS_RESPONSE>(this.loginAfterHit+create,  JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
  }
   /**
   * A method to send a post request to get hotel details
   * payload for json
   * @returns { Observable<any>}
   */
    getHotelDeatils(enterTerm:string,destinationCode:string,create:string): Observable<any> {


      const data={
      query : enterTerm,
      destination_code : destinationCode
      };
      return this.http.post<any>(this.loginAfterHit+create,  JSON.stringify(data), this.httpOptions).pipe(map((res: any) => res?.data?.slice(0, 10)));
    }

     /**
   * A method to send a post request to get hotel Room Details
   * payload for json
   * @returns { Observable<any>}
   */
      getHotelRoom(data:HotelDeatils,create:string): Observable<HotelDetailsResponse> {
        return this.http.post<HotelDetailsResponse>(this.loginAfterHit+create,  JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
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

      if (error.error.errors?.length > 0) {
        //console.log(error.error);
        errorRes = `${error.error.errors[0]?.title}  `;
      }
      //console.log(error.error.errors);
    }
    return throwError(errorRes);
  }
}
