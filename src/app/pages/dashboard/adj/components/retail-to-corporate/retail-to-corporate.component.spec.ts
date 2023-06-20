import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailToCorporateComponent } from './retail-to-corporate.component';

describe('RetailToCorporateComponent', () => {
  let component: RetailToCorporateComponent;
  let fixture: ComponentFixture<RetailToCorporateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RetailToCorporateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RetailToCorporateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
