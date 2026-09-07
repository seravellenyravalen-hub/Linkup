export type LinkUpRelease = {
  version: string;
  channel: 'stable' | 'beta';
  publishedAt: string;
  web: { version: string; update: 'service-worker' };
  android: { version: string; update: 'user-confirmed' | 'store-managed' };
  notes: string[];
};

export async function loadRelease(): Promise<LinkUpRelease> {
  const response = await fetch('/release.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('Release metadata unavailable');
  return response.json() as Promise<LinkUpRelease>;
}
