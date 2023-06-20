import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestDependsRfqPopupComponent } from './request-depends-rfq-popup.component';

describe('RequestDependsRfqPopupComponent', () => {
  let component: RequestDependsRfqPopupComponent;
  let fixture: ComponentFixture<RequestDependsRfqPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequestDependsRfqPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestDependsRfqPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
