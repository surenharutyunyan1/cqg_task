export function formatNumber(num: number): string {
  if (num >= 1000) {
    return Math.floor(num / 1000) + 'K';
  }
  return num.toString();
}

export function parsePackageName(packageId: string): { scope: string; name: string } {
  const parts = packageId.split('/');
  if (parts.length === 2) {
    return { scope: parts[0], name: parts[1] };
  }
  return { scope: '', name: packageId };
}
