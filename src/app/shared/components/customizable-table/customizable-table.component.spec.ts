import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomizableTableComponent } from './customizable-table.component';

describe('CustomizableTableComponent', () => {
  let component: CustomizableTableComponent;
  let fixture: ComponentFixture<CustomizableTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomizableTableComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomizableTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
