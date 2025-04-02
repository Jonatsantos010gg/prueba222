import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./modules/dashboard/dashboard.routes').then(
        (m) => m.dashboardRoutes
      ),
  },
  //   { path: 'asistencia', loadChildren: () => import('./modules/asistencia/asistencia.routes').then(m => m.routes) }
];
