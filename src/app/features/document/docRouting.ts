import { Route } from '@angular/router';

export const docRoutes: Route[] = [
  {
    path: 'document-repository',
    loadComponent: () => import('./component/document-repository/document-repository.component').then(m => m.DocumentRepositoryComponent)
  }
];
