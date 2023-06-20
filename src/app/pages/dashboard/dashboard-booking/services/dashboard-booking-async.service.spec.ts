import { TestBed } from '@angular/core/testing';

import { DashboardBookingAsyncService } from './dashboard-booking-async.service';

describe('DashboardBookingAsyncService', () => {
  let service: DashboardBookingAsyncService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardBookingAsyncService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
