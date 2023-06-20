import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-passenger-form',
  templateUrl: './add-passenger-form.component.html',
  styleUrls: ['./add-passenger-form.component.scss']
})
export class AddPassengerFormComponent implements OnInit {
  @Input() flightIndex: number;
  @Input() attractionsType: string;
  @Input() attractionsPaxCount: any;
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

}
