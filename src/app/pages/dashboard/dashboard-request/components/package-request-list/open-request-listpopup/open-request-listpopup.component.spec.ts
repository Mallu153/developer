import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenRequestListpopupComponent } from './open-request-listpopup.component';

describe('OpenRequestListpopupComponent', () => {
  let component: OpenRequestListpopupComponent;
  let fixture: ComponentFixture<OpenRequestListpopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenRequestListpopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenRequestListpopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
