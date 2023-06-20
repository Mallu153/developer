import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageHolidayListviewComponent } from './package-holiday-listview.component';

describe('PackageHolidayListviewComponent', () => {
  let component: PackageHolidayListviewComponent;
  let fixture: ComponentFixture<PackageHolidayListviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PackageHolidayListviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PackageHolidayListviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
