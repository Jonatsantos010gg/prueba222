import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarcarAsistenciaComponent } from './marcar-asistencia.component';

describe('MarcarAsistenciaComponent', () => {
  let component: MarcarAsistenciaComponent;
  let fixture: ComponentFixture<MarcarAsistenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarcarAsistenciaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarcarAsistenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
