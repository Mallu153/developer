import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { SearchPaxData } from '../model/search-pax';


@Injectable()
export class SearchPaxDataService {
  serviceData: SearchPaxData;
  constructor() { }

  get data(): SearchPaxData {
    return this.serviceData;
  }
  set data(value: SearchPaxData) {
    this.serviceData = value;
  }
}
