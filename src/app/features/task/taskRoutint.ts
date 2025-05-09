import { Route } from '@angular/router';

export const TaskRoutes: Route[] = [
  {
    path: 'task-management',
    loadComponent: () => import('./components/task-managment/task-managment.component').then(m => m.TaskManagmentComponent),
  }
];
