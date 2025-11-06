import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterNavbar } from './master-navbar';

describe('MasterNavbar', () => {
  let component: MasterNavbar;
  let fixture: ComponentFixture<MasterNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MasterNavbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasterNavbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
