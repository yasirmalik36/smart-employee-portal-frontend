import { Routes } from '@angular/router';
import { LoginComponent } from './account/login/login.component';
import { RegisterComponent } from './account/register/register.component';
import { ProfileComponent } from './account/profile/profile.component';
import { LayoutComponent } from './layout/layout.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { AuthGuard } from './common/guards/auth.guard';
import { ChangePasswordComponent } from './account/change-password/change-password.component';

export const routes: Routes = [
  { path: 'account/login', component: LoginComponent },
  { path: 'account/register', component: RegisterComponent },
  { path: 'account/profile', component: ProfileComponent },
  { path: 'account/change-password', component: ChangePasswordComponent },
  
  { path: '', redirectTo: '/account/login', pathMatch: 'full' },
  { path: 'attendance/face-recognition', loadComponent: () => import('./features/attendance/components/face-recognition/face-recognition.component').then(m => m.FaceRecognitionComponent),  },
  {
    path: 'home',
    canActivate: [AuthGuard],
    component: LayoutComponent,
    children: [
      // Dashboard Module
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },

      // Attendance Module
      {
        path: 'attendance',
        loadComponent: () => import('./features/attendance/components/attendance/attendance.component').then(m => m.AttendanceComponent),
      },

      // Leave Management Module
      {
        path: 'leave-management',
        loadComponent: () => import('./features/leave-management/leave-management.component').then(m => m.LeaveManagementComponent),
      },

      // Compensation and Benefits Module
      {
        path: 'compensation-benefits',
        loadComponent: () => import('./features/compensation-benefits/compensation-benefits.component').then(m => m.CompensationBenefitsComponent),
      },

      // employee Management Module
      {
        path: 'employee-management',
        loadComponent: () => import('./features/employee/component/employee-management/employee-management.component').then(m=>m.EmployeeManagementComponent),
      },

      // Task Management Module
      {
        path: 'task-management',
        loadComponent: () => import('./features/task-management/task-management.component').then(m => m.TaskManagementComponent),
      },

      // Reports Module
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent),
      },

      // AI-Driven Analytics Module
      {
        path: 'ai-analytics',
        loadComponent: () => import('./features/ai-analytics/ai-analytics.component').then(m => m.AiAnalyticsComponent),
      },

      // Notifications Module
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent),
      },

      // Settings and Configuration Module
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
      },

      // Document Repository Module
      {
        path: 'document-repository',
        loadComponent: () => import('./features/document-repository/document-repository.component').then(m => m.DocumentRepositoryComponent),
      }
    ]
  },
  { path: '**', component: NotFoundComponent }
];
