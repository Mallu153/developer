import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-addons-model',
  templateUrl: './addons-model.component.html',
  styleUrls: ['./addons-model.component.scss']
})
export class AddonsModelComponent implements OnInit {
  @Input() public user;
  @Input() public patchAddonsData;
  constructor(public activeModal: NgbActiveModal) {


  }

  ngOnInit(): void {
  }

}
