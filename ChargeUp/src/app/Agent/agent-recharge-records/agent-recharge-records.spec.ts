import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentRechargeRecords } from './agent-recharge-records';

describe('AgentRechargeRecords', () => {
  let component: AgentRechargeRecords;
  let fixture: ComponentFixture<AgentRechargeRecords>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgentRechargeRecords]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentRechargeRecords);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
