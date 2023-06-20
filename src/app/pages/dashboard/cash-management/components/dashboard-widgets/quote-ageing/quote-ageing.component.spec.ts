import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteAgeingComponent } from './quote-ageing.component';

describe('QuoteAgeingComponent', () => {
  let component: QuoteAgeingComponent;
  let fixture: ComponentFixture<QuoteAgeingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuoteAgeingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuoteAgeingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
