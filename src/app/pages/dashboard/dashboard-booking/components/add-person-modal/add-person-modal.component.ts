import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-person-modal',
  templateUrl: './add-person-modal.component.html',
  styleUrls: ['./add-person-modal.component.scss'],
})
export class AddPersonModalComponent {
  @Input() roomIndex: number;
  constructor(public activeModal: NgbActiveModal) { }
  ngOnInit() {
  }
}
