import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class TeamDataDataService {
  private _TeamDataCommunication = new Subject<any[]>();
  constructor() { }

  sendData(data) {
    this._TeamDataCommunication.next(data);
  }
  getData(): Observable<any[]> {
    return this._TeamDataCommunication.asObservable();
  }

}
