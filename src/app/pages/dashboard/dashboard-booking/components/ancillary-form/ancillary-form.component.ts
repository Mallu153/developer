import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-ancillary-form',
  templateUrl: './ancillary-form.component.html',
  styleUrls: ['./ancillary-form.component.scss'],
})
export class AncillaryFormComponent implements OnInit {
  constructor(
    private titleService: Title
  ) {
    this.titleService.setTitle('Request Ancillary');
  }

  ngOnInit(): void { }
}
