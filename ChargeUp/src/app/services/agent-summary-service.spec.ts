import { TestBed } from '@angular/core/testing';

import { AgentSummaryService } from './agent-summary-service';

describe('AgentSummaryService', () => {
  let service: AgentSummaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgentSummaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
