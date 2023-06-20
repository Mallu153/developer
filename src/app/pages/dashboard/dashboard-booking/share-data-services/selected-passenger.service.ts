import { Passengers } from '../../dashboard-request/model/selectedPassengers';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Addons } from '../../dashboard-request/model/addons';
export class pData {
  passengers: Passengers[];
  roomIndex: number;
}

@Injectable({
  providedIn: 'root'
})
export class SelectedPassengersService {
  private _DataCommunication = new Subject<Passengers[]>();
  private _hotelDataCommunication = new Subject<pData>();
  private _addonsDataCommunication = new Subject<any[]>();
  constructor() { }
  getData(): Observable<Passengers[]> {
    return this._DataCommunication.asObservable();
  }
  getHotelData(): Observable<pData> {
    return this._hotelDataCommunication.asObservable();
  }
  getAddonsData(): Observable<any> {
    return this._addonsDataCommunication.asObservable();
  }
  sendData(data) {
    this._DataCommunication.next(data);
  }
  sendHotelData(data: pData) {
    this._hotelDataCommunication.next(data);
  }
  sendAddonsData(data: any[]) {
    this._addonsDataCommunication.next(data);
  }
}
