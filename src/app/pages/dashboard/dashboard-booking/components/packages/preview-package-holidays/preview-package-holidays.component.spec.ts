import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewPackageHolidaysComponent } from './preview-package-holidays.component';

describe('PreviewPackageHolidaysComponent', () => {
  let component: PreviewPackageHolidaysComponent;
  let fixture: ComponentFixture<PreviewPackageHolidaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewPackageHolidaysComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewPackageHolidaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
