import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerLayout } from './player-layout';

describe('PlayerLayout', () => {
  let component: PlayerLayout;
  let fixture: ComponentFixture<PlayerLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlayerLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
