import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-btns',
  templateUrl: './dashboard-btns.component.html',
  styleUrls: ['./dashboard-btns.component.scss'],
})
export class DashboardBtnsComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {}

  navigatedToFinance() {
    //this.router.navigate(['/dashboard/cash-management/cash-dashboard']);
    const CASH_DASHBOARD__URL = this.router.createUrlTree(['/dashboard/cash-management/cash-dashboard']).toString();
    window.open(CASH_DASHBOARD__URL, '_blank');
  }
  navigatedToAgent() {
    //this.router.navigate(['/dashboard/agent/dashboard']);
    const BOOKINGS_DASHBOARD__URL = this.router
      .createUrlTree(['/dashboard/cash-management/bookings-dashboard'])
      .toString();
    window.open(BOOKINGS_DASHBOARD__URL, '_blank');
  }
  navigatedToQuote() {
    //this.router.navigate(['/dashboard/agent/dashboard']);
    const BOOKINGS_DASHBOARD__URL = this.router
      .createUrlTree(['/dashboard/cash-management/quotes-dashboard'])
      .toString();
    window.open(BOOKINGS_DASHBOARD__URL, '_blank');
  }
}
