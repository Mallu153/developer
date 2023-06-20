import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageRequestListComponent } from './package-request-list.component';

describe('PackageRequestListComponent', () => {
  let component: PackageRequestListComponent;
  let fixture: ComponentFixture<PackageRequestListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PackageRequestListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PackageRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
