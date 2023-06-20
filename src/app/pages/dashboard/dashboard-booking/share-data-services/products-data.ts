import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Products } from '../../dashboard-request/model/products-data';


@Injectable({
  providedIn: 'root'
})
export class ProductsDataService {
  private _ProductsDataCommunication = new Subject<Products[]>();
  constructor() { }

  sendData(data:Products[]) {
    this._ProductsDataCommunication.next(data);
  }
  getData(): Observable<Products[]> {
    return this._ProductsDataCommunication.asObservable();
  }


  /* private _DataCommunication = new Subject<Passengers[]>();
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
  } */

}
