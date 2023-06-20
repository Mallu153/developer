import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-request',
  templateUrl: './dashboard-request.component.html',
  styleUrls: ['./dashboard-request.component.scss'],
})
export class DashboardRequestComponent implements OnInit {
  defaultRequestFormType = 'corporate';

  constructor(private router: Router) { }

  ngOnInit(): void {
    //this.navigateToActiveForm(this.defaultRequestFormType);
  }

  /**
   * A method to navigate to the active form on initializing the component
   * By defaul the corporate is active
   */
  navigateToActiveForm(requestFormType: string) {
    if (requestFormType === 'corporate') {
      this.router.navigateByUrl('/dashboard/request/corporate');
    } else if (requestFormType === 'retail') {
      this.router.navigateByUrl('/dashboard/request/retail');
    }
  }
}
