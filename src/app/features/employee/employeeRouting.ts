import { Route } from '@angular/router';

export const employeeRoutes: Route[] = [
  {
    path: 'employee-management',
    loadComponent: () => import('./component/employee-management/employee-management.component').then(m => m.EmployeeManagementComponent),

   },
   {
    path: 'employee-profile',
    loadComponent: () => import('./component/employee-profile/employee-profile.component').then(m => m.EmployeeProfileComponent)
    }

];
