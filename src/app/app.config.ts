import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { API_CONFIG } from './config/api.config';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: API_CONFIG,
      useValue: {
        baseUrl: environment.apiUrl,
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000
      }
    }
  ]
};
