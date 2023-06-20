import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyrequestsbtnComponent } from './myrequestsbtn.component';

describe('MyrequestsbtnComponent', () => {
  let component: MyrequestsbtnComponent;
  let fixture: ComponentFixture<MyrequestsbtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyrequestsbtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyrequestsbtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
