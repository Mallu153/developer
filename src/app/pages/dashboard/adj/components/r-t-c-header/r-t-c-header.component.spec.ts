import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RTCHeaderComponent } from './r-t-c-header.component';

describe('RTCHeaderComponent', () => {
  let component: RTCHeaderComponent;
  let fixture: ComponentFixture<RTCHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RTCHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RTCHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
