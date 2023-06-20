import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RolePermissionsService {
  USERMANAGEMENT = environment.USERMANAGEMENT;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  constructor(private http: HttpClient) {}

  /*
  swagger-url:http://192.178.10.171:9020/usermanagement/swagger-ui.html#
  controller:role-permissions-controller(/rolePermissions/get-page-permissions)
  returns array of strings
  */


  async getPagePermissions(pageNumber: string, roleNumber: string): Promise<any> {
    try {
      const response = await this.http.get<any>( `${this.USERMANAGEMENT}rolePermissions/get-page-permissions?pageKey=${pageNumber}&roleKey=${roleNumber}`,).toPromise();
      return response;

    } catch (error) {
      this.errorHandler(error);
      throw new Error('Failed to fetch  data');
    }
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
