import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NGX_ECHARTS_CONFIG } from 'ngx-echarts'; // Import the configuration token

export const appConfig: ApplicationConfig = {
providers: [
provideRouter(routes),
provideAnimationsAsync(),
{
provide: NGX_ECHARTS_CONFIG,
useFactory: () => ({
echarts: () => import('echarts')  // Lazy load echarts
})
}
]
};