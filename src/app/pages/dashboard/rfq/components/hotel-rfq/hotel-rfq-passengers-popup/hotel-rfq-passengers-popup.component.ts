import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-hotel-rfq-passengers-popup',
  templateUrl: './hotel-rfq-passengers-popup.component.html',
  styleUrls: ['./hotel-rfq-passengers-popup.component.scss']
})
export class HotelRfqPassengersPopupComponent implements OnInit {

  @Input() roomIndex: number;
  constructor(public activeModal: NgbActiveModal) { }
  ngOnInit() {
  }

}
