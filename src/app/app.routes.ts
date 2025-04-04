// Your main routing file (e.g., app-routing.module.ts or your provided file)

import { Routes } from '@angular/router';
import { LoginComponent } from './account/components/login/login.component';
import { LayoutComponent } from './layout/layout.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { AuthGuard } from './common/guards/auth.guard';
import { ChangePasswordComponent } from './account/components/change-password/change-password.component';
import { settingsRoutes } from './features/settings-confrigurations/SettingsRouting'; // Import the settings routes
import { dashboardRoutes } from './features/dashboard/dashboardRouting';
import { attendanceRoutes } from './features/attendance/attendanceRouting';
import { leavesRoutes } from './features/leaves/leavesRouting';
import { employeeRoutes } from './features/employee/employeeRouting';
import { reportRoutes } from './features/bi-reports/reportsRouting';
import { docRoutes } from './features/document/docRouting';

export const routes: Routes = [
  { path: 'account/login', component: LoginComponent },
  { path: 'account/change-password', component: ChangePasswordComponent },
  { path: '', redirectTo: '/account/login', pathMatch: 'full' },
  {
    path: 'home',
    canActivate: [AuthGuard],
    component: LayoutComponent,
    children: [
      ...dashboardRoutes,
      ...attendanceRoutes,
      ...leavesRoutes,
      ...employeeRoutes,
      ...reportRoutes,
      ...settingsRoutes,
      ...docRoutes
    ]
  },
  { path: '**', component: NotFoundComponent }
];