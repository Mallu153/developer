import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleProductFormsComponent } from './multiple-product-forms.component';

describe('MultipleProductFormsComponent', () => {
  let component: MultipleProductFormsComponent;
  let fixture: ComponentFixture<MultipleProductFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultipleProductFormsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleProductFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
