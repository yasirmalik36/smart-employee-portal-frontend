import { Route } from '@angular/router';

export const attendanceRoutes: Route[] = [
  {
    path: 'attendance',
    loadComponent: () => import('./components/attendance/attendance.component').then(m => m.AttendanceComponent)
  }
];
