import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductPriceHotelFormComponent } from './product-price-hotel-form.component';

describe('ProductPriceHotelFormComponent', () => {
  let component: ProductPriceHotelFormComponent;
  let fixture: ComponentFixture<ProductPriceHotelFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductPriceHotelFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductPriceHotelFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
