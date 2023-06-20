import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorporateToRetailComponent } from './corporate-to-retail.component';

describe('CorporateToRetailComponent', () => {
  let component: CorporateToRetailComponent;
  let fixture: ComponentFixture<CorporateToRetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorporateToRetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CorporateToRetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
