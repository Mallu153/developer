import { Component, OnInit, Input  } from '@angular/core';
import { FormGroup } from '@angular/forms';
@Component({
  selector: 'app-product-price-hotel-form',
  templateUrl: './product-price-hotel-form.component.html',
  styleUrls: ['./product-price-hotel-form.component.scss']
})
export class ProductPriceHotelFormComponent implements OnInit {
  @Input() hotelForm: FormGroup;
  constructor() { }

  ngOnInit(): void {
  }

}
