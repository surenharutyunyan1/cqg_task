import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, timer, merge } from 'rxjs';
import { catchError, retry, shareReplay, map, mergeMap, toArray, tap } from 'rxjs/operators';
import { Package, PackageWithDependencies } from '../models/package.model';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class PackageService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  private readonly packagesCache$ = new Map<string, Observable<Package[]>>();
  private readonly dependenciesCache$ = new Map<string, Observable<string[]>>();

  getPackages(): Observable<Package[]> {
    const cacheKey = 'all_packages';

    if (!this.packagesCache$.has(cacheKey)) {
      const request$ = this.http.get<Package[]>(`${this.config.baseUrl}/packages`).pipe(
        retry({
          count: this.config.retryAttempts,
          delay: (error: HttpErrorResponse, retryCount: number) => {
            if (error.status >= 500 || error.status === 0) {
              return timer(this.config.retryDelay * retryCount);
            }
            return throwError(() => error);
          }
        }),
        catchError(this.handleError<Package[]>('getPackages', [])),
        shareReplay({ bufferSize: 1, refCount: true })
      );

      this.packagesCache$.set(cacheKey, request$);
    }

    return this.packagesCache$.get(cacheKey)!;
  }

  getPackageDependencies(packageId: string): Observable<string[]> {
    if (!this.dependenciesCache$.has(packageId)) {
      const encodedId = encodeURIComponent(packageId);
      const request$ = this.http.get<string[]>(
        `${this.config.baseUrl}/packages/${encodedId}/dependencies`
      ).pipe(
        retry({
          count: 2,
          delay: 500
        }),
        catchError(this.handleError<string[]>(`getPackageDependencies for ${packageId}`, [])),
        shareReplay({ bufferSize: 1, refCount: true })
      );

      this.dependenciesCache$.set(packageId, request$);
    }

    return this.dependenciesCache$.get(packageId)!;
  }

  getPackagesWithDependencies(): Observable<PackageWithDependencies[]> {
    return this.getPackages().pipe(
      map(packages => packages.map(pkg => ({
        ...pkg,
        dependencies: []
      } as PackageWithDependencies))),
      catchError(this.handleError<PackageWithDependencies[]>('getPackagesWithDependencies', []))
    );
  }

  clearCache(): void {
    this.packagesCache$.clear();
    this.dependenciesCache$.clear();
  }

  private handleError<T>(operation: string, defaultValue: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed:`, error.message);

      if (error.error instanceof ErrorEvent) {
        console.error('Client-side error:', error.error.message);
      } else {
        console.error(
          `Server returned code ${error.status}, ` +
          `body was: ${JSON.stringify(error.error)}`
        );
      }

      return of(defaultValue);
    };
  }
}
