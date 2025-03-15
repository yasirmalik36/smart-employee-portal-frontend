import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NGX_ECHARTS_CONFIG } from 'ngx-echarts'; // Import the configuration token
import { provideToastr, ToastrModule } from 'ngx-toastr';
import { DateAdapter } from '@angular/material/core';
import { NativeDateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS } from '@angular/material/core';
import { LoaderInterceptor } from './common/interceptors/loader.interceptor';
import { ErrorInterceptor } from './common/interceptors/error-interceptor';
import { TokenInterceptor } from './common/interceptors/token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(), // required animations providers

    // Toastr configuration
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      closeButton: true,
      progressBar: true
    }),

    // Router and HTTP Client
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),

    // HTTP Interceptors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },

    // Base URL configuration
    {
      provide: 'BASE_URL',
      useValue: getBaseUrl() + 'api/',
    },

    // Date Adapter and Formats
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },

    // ECharts configuration (lazy loading)
    {
      provide: NGX_ECHARTS_CONFIG,
      useFactory: () => ({
        echarts: () => import('echarts'),  // Lazy load echarts
      })
    }, provideAnimationsAsync(), provideAnimationsAsync(), provideAnimationsAsync()
  ]
};

export function getBaseUrl() {
  return document.getElementsByTagName('base')[0].href;
}
