import { Component, signal, computed, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, switchMap, takeUntil, tap } from 'rxjs/operators';
import { PackageService } from './services/package.service';
import { SearchHeaderComponent } from './components/search-header/search-header.component';
import { PackageListComponent } from './components/package-list/package-list.component';
import { PackageWithDependencies } from './models/package.model';

@Component({
  selector: 'app-root',
  imports: [SearchHeaderComponent, PackageListComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnInit, OnDestroy {
  private readonly packageService = inject(PackageService);
  private readonly destroy$ = new Subject<void>();
  private readonly loadTrigger$ = new Subject<void>();

  readonly packages = signal<PackageWithDependencies[]>([]);
  readonly searchTerm = signal<string>('');
  readonly hoveredPackageId = signal<string | null>(null);
  readonly isLoading = signal<boolean>(false);
  
  private readonly dependenciesMap = new Map<string, string[]>();

  readonly filteredPackages = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const packages = this.packages();
    
    if (!term) {
      return packages;
    }
    
    return packages.filter(pkg => 
      pkg.id.toLowerCase().includes(term)
    );
  });

  readonly dependentPackageIds = computed(() => {
    const hoveredId = this.hoveredPackageId();
    if (!hoveredId) {
      return new Set<string>();
    }
    
    const dependentIds = new Set<string>();
    
    for (const [pkgId, deps] of this.dependenciesMap.entries()) {
      if (deps.includes(hoveredId)) {
        dependentIds.add(pkgId);
      }
    }
    
    return dependentIds;
  });

  ngOnInit(): void {
    this.loadTrigger$
      .pipe(
        debounceTime(300),
        tap(() => this.isLoading.set(true)),
        switchMap(() => this.packageService.getPackagesWithDependencies()),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (packages) => {
          this.packages.set(packages);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load packages:', error);
          this.isLoading.set(false);
        }
      });

    this.loadTrigger$.next();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  onPackageHover(packageId: string): void {
    this.hoveredPackageId.set(packageId);
    this.loadDependenciesForPackages();
  }

  private loadDependenciesForPackages(): void {
    const packages = this.packages();
    
    packages.forEach(pkg => {
      if (!this.dependenciesMap.has(pkg.id)) {
        this.packageService.getPackageDependencies(pkg.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe(dependencies => {
            this.dependenciesMap.set(pkg.id, dependencies);
          });
      }
    });
  }

  onPackageLeave(): void {
    this.hoveredPackageId.set(null);
  }


  onReload(): void {
    this.searchTerm.set('');
    this.hoveredPackageId.set(null);
    this.packageService.clearCache();
    this.loadTrigger$.next();
  }
}
