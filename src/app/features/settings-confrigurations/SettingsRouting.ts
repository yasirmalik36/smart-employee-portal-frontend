import { Route } from '@angular/router';

export const settingsRoutes: Route[] = [
  {
    path: 'settings',
    loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent),
    children: [
      {
        path: 'face-config',
        loadComponent: () => import('./components/face-recognition-config/face-recognition-config.component').then(m => m.FaceRecognitionConfigComponent)
      }
    ]
  }
];
