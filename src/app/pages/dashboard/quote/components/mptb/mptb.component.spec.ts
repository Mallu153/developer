import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MptbComponent } from './mptb.component';

describe('MptbComponent', () => {
  let component: MptbComponent;
  let fixture: ComponentFixture<MptbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MptbComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MptbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
