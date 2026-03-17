import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { PackageCardComponent } from '../package-card/package-card.component';
import { PackageWithDependencies } from '../../models/package.model';

@Component({
  selector: 'app-package-list',
  standalone: true,
  imports: [PackageCardComponent],
  templateUrl: './package-list.component.html',
  styleUrls: ['./package-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PackageListComponent {
  readonly packages = input.required<PackageWithDependencies[]>();
  readonly hoveredPackageId = input<string | null>(null);
  readonly dependentPackageIds = input<Set<string>>(new Set());
  
  readonly packageHover = output<string>();
  readonly packageLeave = output<void>();

  onPackageHover(packageId: string): void {
    this.packageHover.emit(packageId);
  }

  onPackageLeave(): void {
    this.packageLeave.emit();
  }

  isPackageHighlighted(packageId: string): boolean {
    return this.hoveredPackageId() === packageId;
  }

  isPackageDependencyHighlighted(packageId: string): boolean {
    return this.dependentPackageIds().has(packageId);
  }
}
