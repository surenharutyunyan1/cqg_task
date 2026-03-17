export interface Package {
  id: string;
  weeklyDownloads: number;
  dependencyCount: number;
}

export interface PackageWithDependencies extends Package {
  dependencies: string[];
}
