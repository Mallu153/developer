import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Pax } from '../model/pax-model';


@Injectable()
export class SearchResponsesService {
    serviceData: Pax;
    constructor() { }

    get data(): Pax {
        return this.serviceData;
    }
    set data(value: Pax) {
        this.serviceData = value;
    }
}
