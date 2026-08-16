import { TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard';

describe('Dashboard', () => {
  let service: DashboardComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardComponent);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
