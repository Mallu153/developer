import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShareRequestIdService {
  initialReqId = '0';
  initialContactId = '0';
  shareRequestId: BehaviorSubject<any>;
  shareContactId: BehaviorSubject<any>;

  constructor() {
    this.shareRequestId = new BehaviorSubject(this.initialReqId);
    this.shareContactId = new BehaviorSubject(this.initialContactId);
  }
  nextCount(requestId: any) {
    this.shareRequestId.next(requestId);
  }
  nextCountContactId(contactId: any) {

    this.shareContactId.next(contactId);
  }
}
