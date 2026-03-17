import { Component, input, output, computed, ChangeDetectionStrategy } from '@angular/core';
import { PackageWithDependencies } from '../../models/package.model';
import { formatNumber, parsePackageName } from '../../utils/format.utils';

@Component({
  selector: 'app-package-card',
  standalone: true,
  imports: [],
  templateUrl: './package-card.component.html',
  styleUrls: ['./package-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PackageCardComponent {
  readonly package = input.required<PackageWithDependencies>();
  readonly isHighlighted = input<boolean>(false);
  readonly isDependencyHighlighted = input<boolean>(false);
  
  readonly hover = output<string>();
  readonly leave = output<void>();

  readonly parsedName = computed(() => parsePackageName(this.package().id));
  readonly formattedDownloads = computed(() => formatNumber(this.package().weeklyDownloads));
  readonly dependencyText = computed(() => {
    const count = this.package().dependencyCount;
    return count === 1 ? '1 dependency' : `${count} dependencies`;
  });

  onMouseEnter(): void {
    this.hover.emit(this.package().id);
  }

  onMouseLeave(): void {
    this.leave.emit();
  }
}
