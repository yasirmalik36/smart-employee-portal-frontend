import { Injectable, ErrorHandler } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../account/auth.service';
import { LocalStorageClear } from '../export functions/customfunctions';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next
      .handle(req)
      .pipe(timeout(600000),catchError((error: HttpErrorResponse) => this.handleError(error))

    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (
      
      error.status === 0 ||
      error?.error?.text?.includes('is logged in from different system')
    ) {
      LocalStorageClear();
      return throwError(
        () => new Error('Session invalid or logged in from another system')
      );
    }

    if (error.status === 401) {
      this.authService.logout();
      //unauthorize
      return throwError(
        () => new Error('Your session has expired. You are logged out')
      );
    }

    if (error.status === 404 || error.status === 500 || error.status === 504) {
      return throwError(() => new Error(error.statusText));
    }

    if (error.status === 3) {
      return throwError(() => new Error('Invalid request.'));
    }

    // Handle other HTTP error responses
    const applicationError = error.headers.get('Application-Error');
    if (applicationError) {
      return throwError(() => new Error(applicationError));
    }

     const serverError = error?.error?.text || this.extractServerErrors(error);
     return throwError(() => new Error(serverError));
  }

  private extractServerErrors(error: HttpErrorResponse): string {
    if (error.error?.errors && typeof error.error.errors === 'object') {
      return Object.values(error.error.errors).join('\n');
    }
    return '';
  }
}

export const ErrorInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: ErrorInterceptor,
  multi: true,
};

