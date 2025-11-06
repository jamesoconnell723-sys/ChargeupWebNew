import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Passowrd } from './passowrd';

describe('Passowrd', () => {
  let component: Passowrd;
  let fixture: ComponentFixture<Passowrd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Passowrd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Passowrd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
