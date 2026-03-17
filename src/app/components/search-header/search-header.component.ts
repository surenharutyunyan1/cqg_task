import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-search-header',
  standalone: true,
  imports: [],
  templateUrl: './search-header.component.html',
  styleUrls: ['./search-header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchHeaderComponent {
  readonly searchTerm = input.required<string>();
  readonly isLoading = input<boolean>(false);
  
  readonly searchChange = output<string>();
  readonly reloadClick = output<void>();

  onSearchInput(value: string): void {
    this.searchChange.emit(value);
  }

  onReload(): void {
    this.reloadClick.emit();
  }
}
