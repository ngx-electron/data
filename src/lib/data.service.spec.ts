import { TestBed } from '@angular/core/testing';

import { NgxElectronDataService } from './ngx-electron-data.service';

describe('NgxElectronDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgxElectronDataService = TestBed.get(NgxElectronDataService);
    expect(service).toBeTruthy();
  });
});
