import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsCalendarComponent } from './requests-calendar.component';

describe('RequestsCalendarComponent', () => {
  let component: RequestsCalendarComponent;
  let fixture: ComponentFixture<RequestsCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestsCalendarComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestsCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
