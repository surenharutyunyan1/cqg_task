import { InjectionToken } from '@angular/core';

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export const API_CONFIG = new InjectionToken<ApiConfig>('api.config');
