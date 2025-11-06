import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedeemRecords } from './redeem-records';

describe('RedeemRecords', () => {
  let component: RedeemRecords;
  let fixture: ComponentFixture<RedeemRecords>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RedeemRecords]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RedeemRecords);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
