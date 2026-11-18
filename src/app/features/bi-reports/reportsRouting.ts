import { Route } from '@angular/router';

export const reportRoutes: Route[] = [
  {
    path: 'reports',
    loadComponent: () => import('./components/reports/reports.component').then(m => m.ReportsComponent)
  }
];
