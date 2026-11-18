import { Injectable } from '@angular/core';
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
import { LocalStorageClear } from '../export functions/customfunctions';
import { ToastrService } from 'ngx-toastr'; // Assuming you're using Toastr for notifications
import { AuthService } from '../../account/services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private toastr: ToastrService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next
      .handle(req)
      .pipe(
        timeout(600000),
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 0 || error?.error?.text?.includes('is logged in from different system')) {
      LocalStorageClear();
      this.toastr.error('Session invalid or logged in from another system');
      return throwError(() => new Error('Session invalid or logged in from another system'));
    }

    if (error.status === 401) {
      this.authService.logout();  // Log the user out if 401 Unauthorized
      this.toastr.error('Your session has expired. You are logged out.');  // Notify the user
      return throwError(() => new Error('Your session has expired. You are logged out.'));
    }

    if (error.status === 404 || error.status === 500 || error.status === 504) {
      this.toastr.error('Server error. Please try again later.');
      return throwError(() => new Error(error.statusText));
    }

    if (error.status === 3) {
      this.toastr.error('Invalid request.');
      return throwError(() => new Error('Invalid request.'));
    }

    // Handle other HTTP error responses
    const applicationError = error.headers.get('Application-Error');
    if (applicationError) {
      this.toastr.error(applicationError);
      return throwError(() => new Error(applicationError));
    }

    const serverError = error?.error?.text || this.extractServerErrors(error);
    this.toastr.error(serverError);
    return throwError(() => new Error(serverError));
  }

  private extractServerErrors(error: HttpErrorResponse): string {
    if (error.error?.errors && typeof error.error.errors === 'object') {
      return Object.values(error.error.errors).join('\n');
    }
    return 'Unknown server error.';
  }
}

export const ErrorInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: ErrorInterceptor,
  multi: true,
};
