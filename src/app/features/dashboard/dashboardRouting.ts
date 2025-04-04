import { Route } from '@angular/router';

export const dashboardRoutes: Route[] = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent)
  }
];
