import { TestBed } from '@angular/core/testing';

import { AdjservicesService } from './adjservices.service';

describe('AdjservicesService', () => {
  let service: AdjservicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdjservicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
