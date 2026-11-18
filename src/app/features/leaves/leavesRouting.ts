import { Route } from '@angular/router';

export const leavesRoutes: Route[] = [
  {
    path: 'leave-management',
    loadComponent: () => import('./components/leave-management/leave-management.component').then(m => m.LeaveManagementComponent)
  }
];
