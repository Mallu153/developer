import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageSegmentDetailsComponent } from './package-segment-details.component';

describe('PackageSegmentDetailsComponent', () => {
  let component: PackageSegmentDetailsComponent;
  let fixture: ComponentFixture<PackageSegmentDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PackageSegmentDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PackageSegmentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
