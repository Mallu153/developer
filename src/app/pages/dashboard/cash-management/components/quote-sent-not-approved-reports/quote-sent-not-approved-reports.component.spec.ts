import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteSentNotApprovedReportsComponent } from './quote-sent-not-approved-reports.component';

describe('QuoteSentNotApprovedReportsComponent', () => {
  let component: QuoteSentNotApprovedReportsComponent;
  let fixture: ComponentFixture<QuoteSentNotApprovedReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuoteSentNotApprovedReportsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuoteSentNotApprovedReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
