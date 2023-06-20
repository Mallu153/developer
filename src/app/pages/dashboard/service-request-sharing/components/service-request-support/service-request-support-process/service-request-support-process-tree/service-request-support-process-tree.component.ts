import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-service-request-support-process-tree',
  templateUrl: './service-request-support-process-tree.component.html',
  styleUrls: ['./service-request-support-process-tree.component.scss'],
})
export class ServiceRequestSupportProcessTreeComponent implements OnInit {
  @Input('data') items: Array<Object>;
  @Input('key') key: string;
  constructor() {}

  ngOnInit(): void {}
}
