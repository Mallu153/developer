import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductPriceFlightFormComponent } from './product-price-flight-form.component';

describe('ProductPriceFlightFormComponent', () => {
  let component: ProductPriceFlightFormComponent;
  let fixture: ComponentFixture<ProductPriceFlightFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductPriceFlightFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductPriceFlightFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
