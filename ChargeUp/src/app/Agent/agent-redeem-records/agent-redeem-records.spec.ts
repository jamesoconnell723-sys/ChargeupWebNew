import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentRedeemRecords } from './agent-redeem-records';

describe('AgentRedeemRecords', () => {
  let component: AgentRedeemRecords;
  let fixture: ComponentFixture<AgentRedeemRecords>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgentRedeemRecords]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentRedeemRecords);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
