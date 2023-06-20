import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse } from '../models/api-response';
import { environment } from 'environments/environment';
import { BookingReportsApiResponse } from 'app/pages/dashboard/sr-reports/models/invoice-api-response';
import { MicroAccountView } from '../models/micro-account-view';
import { RoomName, RoomResponse } from '../models/package-rooms';
import { OpenTicket, TicketApiResponse } from '../models/wa-ticket-open';
/**
 * Service to handle all master data to populte form data
 */
@Injectable({
  providedIn: 'root',
})
export class MasterDataService {
  //developement url
  serverUrl = environment.USERMANAGEMENT;
  systemmasterData = environment.companyMasterData_Proxy_Url;
  jdbcapi = environment.masterData_Proxy_Url;
  searchPax_Proxy_Url = environment.searchPax_Proxy_Url;
  loginAfterHit = environment.loginAfterHit;
  EMPLOYEE=environment.EMPLOYEE;
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  constructor(private http: HttpClient) {}

  /**
   * A method to get airport by name
   * @param name {string}
   * @returns { Observable<any> }
   */
  getAirportByName(name: string): Observable<any> {
    return this.http.get(`${this.systemmasterData}gds/airport/name/${name}`).pipe(map((res: ApiResponse) => res.data.slice(0, 10)));
  }

  /**
   *  A method to fetch master data by table name
   * @param tableName { string }
   * @returns { Observable<any> }
   */
  getMasterDataByTableName(tableName: string): Observable<any> {
    return this.http.get(`${this.jdbcapi}gds/${tableName}/all/`).pipe(map((res: ApiResponse) => res.data));
  }

  /**
   * A method to get the airline by name
   * @param airlineName
   * @returns { Observable<any> }
   */
  getAirlineMasterData(airlineName: string): Observable<any> {
    return this.http
      .get(`${this.systemmasterData}gds/airline-master/name/${airlineName}`)
      .pipe(map((res: ApiResponse) => res.data));
  }
  getAirLineData(airlineName: string): Observable<any> {
    return this.http.get<any>(`${this.systemmasterData}gds/airline-master/name/${airlineName}`, this.httpOptions).pipe(catchError(this.errorHandler));
  }
  /**
   * A method to get the city by name
   * @param cityName
   * @returns { Observable<any> }
   */
  getCityMasterData(cityName: string): Observable<any> {
    return this.http
      .get(`${this.systemmasterData}gds/master_cities/name/${cityName}`)
      .pipe(map((res: ApiResponse) => res.data));
  }
  /**
   * A method to get the meals by name
   * @param mealName
   * @returns { Observable<any> }
   */
  getMealsMasterData(mealName: string): Observable<any> {
    return this.http
      .get(`${this.systemmasterData}htl/meals/name/${mealName}`)
      .pipe(map((res: ApiResponse) => res.data));
  }

  /**
   * A method to get the property by name
   * @param propertyName
   * @returns { Observable<any> }
   */
  getPropertyMasterData(propertyName: string): Observable<any> {
    return this.http
      .get(`${this.jdbcapi}htl/master_property_type/name/${propertyName}`)
      .pipe(map((res: ApiResponse) => res.data));
  }
  /**
   * A method to get the hotel by name
   * @param hotelName
   * @returns { Observable<any> }
   */
  getHotelNamesMasterData(hotelName: string): Observable<any> {
    return this.http
      .get(`${this.systemmasterData}htl/hotel-names/name/${hotelName}`)
      .pipe(map((res: ApiResponse) => res.data));
  }

  /**
   * A method to get the flight addons name
   * @param flight addons name
   * @returns { Observable<any> }
   */
  flightAddonsData(addonsName: string): Observable<any> {
    return this.http
      .get(`${this.systemmasterData}search?searchItem=${addonsName}`)
      .pipe(map((res: ApiResponse) => res.data));
  }

  /**
   * A method to get agent by name
   * @param name {string}
   * @returns { Observable<any> }
   */
  getAgentByName(find: string, name: string): Observable<any> {
    return this.http.get(this.serverUrl + find + name).pipe(map((res: any) => res));
  }

  /**
   * A method to get Bank Account  by
   * @param BankName {string}
   * @param BranchName {string}
   * @param AccountNumber {string}
   * @returns { Observable<any> }
   */
  getBankAccountDeatils(find: string, name: string): Observable<any> {
    return this.http.get(this.EMPLOYEE + find + name).pipe(map((res: ApiResponse) => res.data));
  }

  /**
   *  A method to fetch General master data by table name
   * @param tableName { string }
   * @returns { Observable<any> }
   */
  getGenMasterDataByTableName(tableName: string): Observable<any> {
    return this.http.get(`${this.jdbcapi}gen/${tableName}/all`).pipe(map((res: ApiResponse) => res.data));
  }
  /**
   *  A method to fetch JDBC Hotel master data by table name
   * @param tableName { string }
   * @param name { string }
   * @returns { Observable<any> }
   */
  getHotelAddons(name: string = null): Observable<any> {
    return this.http.get<any>(`${this.jdbcapi}htl/master_hotel_addons/name/${name}`).pipe(
      map((resp) => {
        if (resp.Error) {
          throwError(resp?.Error);
        } else {
          //return resp?.data;
          return resp?.data;
        }
      })
    );
  }
  //Micro account view
  getMicroAccountDetails(data: MicroAccountView, create: string): Observable<BookingReportsApiResponse> {
    return this.http
      .post<BookingReportsApiResponse>(this.loginAfterHit + create, JSON.stringify(data),this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  /**
   *  A method to post  rm name master data
   * @param tableName { string }
   * @param name { string }
   * @returns { Observable<any> }
   */

  getRoomNameDeatils(find: string, enterString:string = null): Observable<RoomResponse> {
    const data={
      query :enterString
    };
    return this.http
      .post<RoomResponse>(this.loginAfterHit + find ,JSON.stringify(data))
      .pipe(map(resp => {
        if (resp.message) {
          throwError(resp?.message);
        } else {
          return resp?.data;
        }
      })
      );
  }

  packageAddonsData(addonsName: string, addonRequestType: string): Observable<any> {
    return this.http.get(`${this.systemmasterData}addon-search?addonRequestType=${addonRequestType}&searchItem=${addonsName}`).pipe(map((res: ApiResponse) => res.data));
  }


/*******
   * wa ticket open service
   * it returns <TicketApiResponse>
   * ***
   */
createOpenTicket(data: OpenTicket, create: string): Observable<TicketApiResponse> {
  return this.http.post<TicketApiResponse>(this.loginAfterHit + create, JSON.stringify(data), this.httpOptions).pipe(catchError(this.errorHandler));
}

/*******
   * buiness unit ,costcenter , location
   * cutsomertype
   * it returns <ApiResponse>
   * ***
   */
readSystemMaster( read: string): Observable<ApiResponse> {
  return this.http.get<ApiResponse>(this.systemmasterData + read, this.httpOptions).pipe(catchError(this.errorHandler));
}
readJdbcMaster( read: string): Observable<ApiResponse> {
  return this.http.get<ApiResponse>(this.jdbcapi + read, this.httpOptions).pipe(catchError(this.errorHandler));
}



/**
 *
 *
 * @param {string} read
 * @return {*}  {Observable<ApiResponse>}
 * @memberof MasterDataService
 */
getliabilityInfoByType(read: string,userType:string,userId:number): Observable<ApiResponse> {
  return this.http.get<ApiResponse>(read+userType+'/'+userId, this.httpOptions).pipe(catchError(this.errorHandler));
}
  /*******
   * error handel for all services
   * ***
   */
  errorHandler(error) {
    let errorMessage = '';
    let errorRes = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error?.error?.message;
      errorRes = error?.error?.message;
    } else {
      errorMessage = `Error Code: ${error?.status}\nMessage: ${error?.message}`;
      errorRes = `${error?.error?.message} `;
    }
    return throwError(errorRes);
  }
}
