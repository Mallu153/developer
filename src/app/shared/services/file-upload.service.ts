import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  propertyManagementApi = environment.searchPax_Proxy_Url;
  constructor(private http: HttpClient) {}
  uploadFileBasedOnType(file: File, id: string, type: string): Observable<any> {
    // Create form data
    const formData = new FormData();
    // Store form name as "file" with file data
    formData.append('file', file, file.name);
    formData.append('entityId', id);
    formData.append('entityType', type);
    return this.http.post<any>(`${this.propertyManagementApi}/upload-file-type`, formData).pipe(
      // retry(2),
      catchError(this.errorHandler)
    );
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
