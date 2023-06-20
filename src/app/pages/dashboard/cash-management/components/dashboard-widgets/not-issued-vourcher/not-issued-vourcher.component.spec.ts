import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotIssuedVourcherComponent } from './not-issued-vourcher.component';

describe('NotIssuedVourcherComponent', () => {
  let component: NotIssuedVourcherComponent;
  let fixture: ComponentFixture<NotIssuedVourcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotIssuedVourcherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotIssuedVourcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
