import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoaderService } from '../services/Loader.service ';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  constructor(public loaderService: LoaderService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const shouldShowLoader =
      request.body?.isShowLoader === undefined
        ? true
        : !request.body.isShowLoader;
    if (shouldShowLoader) {
      this.loaderService.isLoadingSubject.next(true);
    }

    return next.handle(request).pipe(
      finalize(() => {
        if (shouldShowLoader) {
          this.loaderService.isLoadingSubject.next(false);
        }
      })
    );
  }
}
