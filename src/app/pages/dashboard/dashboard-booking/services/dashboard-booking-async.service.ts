import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { throwError } from 'rxjs';
import { Activities } from '../../dashboard-request/model/activities';
import { ApiResponse } from '../../dashboard-request/model/api-response';
import { SrSummary } from '../../dashboard-request/model/srsummaryData';
import { PolicyQualifyProcessStage1 } from 'app/shared/models/policy-qualify-process-stage1';
import { ResourcesAssignment } from '../../dashboard-request/model/resources-assignment';
import { Hotel } from '../../dashboard-request/model/hotel.model';
import { RFQ } from '../../rfq/rfq-models/rfq-api-models';
import { RFQHotel } from '../../rfq/rfq-models/rfq-hotel';
import { Attractions } from '../../dashboard-request/model/package-itonerary-attractions';
import { RfqApiResponse } from '../../rfq/rfq-models/rfq-api-response';

@Injectable({
  providedIn: 'root',
})
export class DashboardBookingAsyncService {
  serviceRequestURl = environment.serviceRequest_url;
  searchPax_Proxy_Url = environment.searchPax_Proxy_Url;
  flightApiRequestURl = environment.flightBooking;
  RFQ = environment.RFQ;
  dealsURL = environment.DEALS;
  resourcesAssignmentUrl = environment.ResourcesAssignment;
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  priceHttpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  };

  constructor(private http: HttpClient) {}


  async createPackageItineraryAttractions(payload: Activities, create: string): Promise<any> {
    try {
      const response = await this.http.post<any>(this.serviceRequestURl + create, payload).toPromise();
      return response;
    } catch (error) {
      this.errorHandler(error);
      throw new Error('Failed to post data');
    }
  }





  async resourcesAssignment(data: ResourcesAssignment, create: string): Promise<ApiResponse> {
    try {
      const response = await this.http
        .post<ApiResponse>(this.resourcesAssignmentUrl + create, data)
        .toPromise();
      return response;
    } catch (error) {
      this.errorHandler(error);
      throw new Error('Failed to post data');
    }
  }

  async saveSrSummary(data: SrSummary, create: string): Promise<ApiResponse> {
    try {
      const response = await this.http
        .post<ApiResponse>(this.serviceRequestURl + create, data)
        .toPromise();
      return response;
    } catch (error) {
      this.errorHandler(error);
      throw new Error('Failed to post data');
    }
  }


  async policyTemplateProcessStage1(create: string, data: PolicyQualifyProcessStage1): Promise<ApiResponse> {
    try {
      const response = await this.http.post<ApiResponse>(this.dealsURL + create, data).toPromise();
      return response;
    } catch (error) {
      this.errorHandler(error);
      throw new Error('Failed to post data');
    }
  }


  async createServiceRequestLineSegment(payload: any): Promise<any> {
    try {
      const response = await this.http.post<any>(`${this.serviceRequestURl}/create-service-line-segment`, payload).toPromise();
      return response;
    } catch (error) {
      this.errorHandler(error);
      throw new Error('Failed to post data');
    }
  }

  async updateServiceRequestLine(payload: any): Promise<any> {
    try {
      const response = await this.http.put<any>(`${this.serviceRequestURl}/update-service-line-segment`, payload).toPromise();
      return response;
    } catch (error) {
      this.errorHandler(error);
      throw new Error('Failed to post data');
    }
  }


  async createServiceRequestPaxRelation(payload: any): Promise<any> {
    try {
      const response = await this.http.post<any>(`${this.serviceRequestURl}/request-line-pa`, payload).toPromise();
      return response;
    } catch (error) {
      this.errorHandler(error);
      throw new Error('Failed to post data');
    }
  }

  async createHotelServiceRequest(create: string, data: Hotel): Promise<any> {
    try {
      const response = await this.http.post<any>(this.serviceRequestURl + create, data).toPromise();
      return response;
    } catch (error) {
      this.errorHandler(error);
      throw new Error('Failed to post data');
    }
  }
  /* generateSequenceNo(srid:number ,find:string): Observable<any> {
    return this.http.get<any>(this.serviceRequest_url + find +srid, this.httpOptions).pipe(catchError(this.errorHandler));
  } */

  async generateSequenceNo(srid:number ,find:string): Promise<any> {
    try {
      const response = await this.http.get<any>(this.serviceRequestURl + find +srid).toPromise();
      return response;
    } catch (error) {
      this.errorHandler(error);
      throw new Error('Failed to fetch  data');
    }
  }

  async createRFQFlight(payload: RFQ,rfqId:number): Promise<any> {
    try {

      if(rfqId !== 0){
        const response = await this.http.post<any>(`${this.serviceRequestURl}/create-rfq-request?rfqId=${rfqId}`, payload).toPromise();
        return response;
      }else{
        const response = await this.http.post<any>(`${this.serviceRequestURl}/create-rfq-request`, payload).toPromise();
        return response;
      }

    } catch (error) {
      this.errorHandler(error);
      throw new Error('Failed to post data');
    }
  }

  async createRFQHotel(payload: RFQHotel, create:string,rfqId:number): Promise<any> {
    try {

      if(rfqId !== 0){
        const response = await this.http.post<any>(this.serviceRequestURl + create+`?rfqId=${rfqId}`,payload).toPromise();
        return response;
      }else{
        const response = await this.http.post<any>(this.serviceRequestURl + create, payload).toPromise();
        return response;
      }

    } catch (error) {
      this.errorHandler(error);
      throw new Error('Failed to post data');
    }
  }



  async saveRfqAttractions(payload: Attractions, create:string,rfqId:number): Promise<any> {
    try {

      if(rfqId !== 0){
        const response = await this.http.post<any>(this.serviceRequestURl + create+`?rfqId=${rfqId}`,payload).toPromise();
        return response;
      }else{
        const response = await this.http.post<any>(this.serviceRequestURl + create, payload).toPromise();
        return response;
      }

    } catch (error) {
      this.errorHandler(error);
      throw new Error('Failed to post data');
    }
  }

  async saveRfqAncillary(payload: any, create:string,rfqId:number): Promise<any> {
    try {

      if(rfqId !== 0){
        const response = await this.http.post<any>(this.serviceRequestURl + create+`?rfqId=${rfqId}`,payload).toPromise();
        return response;
      }else{
        const response = await this.http.post<any>(this.serviceRequestURl + create, payload).toPromise();
        return response;
      }

    } catch (error) {
      this.errorHandler(error);
      throw new Error('Failed to post data');
    }
  }

  async savePaxRfqAncillary(data:any,rfqId:number,create:string): Promise<any> {
    try {
      const response = await this.http.post<any>(this.serviceRequestURl + create+rfqId,data).toPromise();
      return response;

    } catch (error) {
      this.errorHandler(error);
      throw new Error('Failed to post data');
    }
  }


  async fetchSrRequest(requestId: number): Promise<any> {
    try {
      const response = await this.http.get<any>(`${this.serviceRequestURl}/get-service-request?requestId=${requestId}`).toPromise();

      return response;
    } catch (error) {
      this.errorHandler(error);
      throw new Error('Failed to fetch  sr  data');
    }
  }

  async fetchAllProductsList(data: any, create: any): Promise<any> {
    try {
      const response = await this.http.post<any>(this.serviceRequestURl + create,data).toPromise();

      return response;
    } catch (error) {
      this.errorHandler(error);
      throw new Error('Failed to fetch  products  data');
    }
  }

  async getServiceRequestDataForPriceLine(find:string): Promise<any> {
    try {
      const response = await this.http.get<any>(this.serviceRequestURl + find ).toPromise();
      return response;
    } catch (error) {
      this.errorHandler(error);
      throw new Error('Failed to fetch  data');
    }
  }

  async saveServiceRequestDataForPriceLine(create:string,data:any): Promise<any> {
    try {
      const response = await this.http.post<any>(this.flightApiRequestURl + create,data).toPromise();
      return response;

    } catch (error) {
      this.errorHandler(error);
      throw new Error('Failed to post data');
    }
  }

  async saveQuoteDataForPriceLine(create:string,data:any): Promise<any> {
    try {
      const response = await this.http.post<any>(this.RFQ + create,data).toPromise();
      return response;

    } catch (error) {
      this.errorHandler(error);
      throw new Error('Failed to post data');
    }
  }

  async getSupplierDataForPriceLine(read:string): Promise<any> {
    try {
      const response = await this.http.get<any>(this.searchPax_Proxy_Url + read ).toPromise();
      return response;
    } catch (error) {
      this.errorHandler(error);
      throw new Error('Failed to fetch  data');
    }
  }

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
