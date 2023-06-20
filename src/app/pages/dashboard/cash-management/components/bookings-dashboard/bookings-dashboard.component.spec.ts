import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingsDashboardComponent } from './bookings-dashboard.component';

describe('BookingsDashboardComponent', () => {
  let component: BookingsDashboardComponent;
  let fixture: ComponentFixture<BookingsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookingsDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookingsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
