
import { Injectable } from '@angular/core';
import { RequestContactInfo } from 'app/shared/models/request-contact-info';
import { BehaviorSubject, Observable, Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SrSummaryDataService {
  private _SummaryDataCommunication = new Subject<any[]>();

  constructor() {

   }

  sendData(data) {
    this._SummaryDataCommunication.next(data);
  }
  getData(): Observable<any> {

    return this._SummaryDataCommunication.asObservable();
  }



}
