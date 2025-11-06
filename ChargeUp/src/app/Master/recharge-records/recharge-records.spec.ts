import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RechargeRecords } from './recharge-records';

describe('RechargeRecords', () => {
  let component: RechargeRecords;
  let fixture: ComponentFixture<RechargeRecords>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RechargeRecords]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RechargeRecords);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
