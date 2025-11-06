import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentUserManagement } from './agent-user-management';

describe('AgentUserManagement', () => {
  let component: AgentUserManagement;
  let fixture: ComponentFixture<AgentUserManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgentUserManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentUserManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
