import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Userlisting } from './userlisting';

describe('Userlisting', () => {
  let component: Userlisting;
  let fixture: ComponentFixture<Userlisting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Userlisting]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Userlisting);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
