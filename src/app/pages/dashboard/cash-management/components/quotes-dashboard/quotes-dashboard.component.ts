import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-quotes-dashboard',
  templateUrl: './quotes-dashboard.component.html',
  styleUrls: ['./quotes-dashboard.component.scss'],
})
export class QuotesDashboardComponent implements OnInit, OnDestroy {
  private ngUnSubscribe: Subject<void>;
  constructor() {}

  ngOnInit(): void {
    this.ngUnSubscribe = new Subject<void>();
  }

  ngOnDestroy(): void {
    this.ngUnSubscribe.next();
    this.ngUnSubscribe.complete();
  }
}
