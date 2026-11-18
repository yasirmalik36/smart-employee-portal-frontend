import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from '../../account/services/auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private authService = inject(AuthService); 

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();  

    if (token) {
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      // Pass the cloned request to the next handler
      return next.handle(clonedRequest);
    }

    // If there's no token, proceed with the original request
    return next.handle(req);
  }
}
