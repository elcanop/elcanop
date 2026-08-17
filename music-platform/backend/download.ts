export interface DownloadGrant {
  id: string;
  orderId: string;
  assetPath: string;
  expiresAt: Date;
  maxDownloads: number;
  downloadsUsed: number;
  revokedAt: Date | null;
}

export function canDownload(grant: DownloadGrant, now = new Date()): boolean {
  return !grant.revokedAt &&
    grant.expiresAt.getTime() > now.getTime() &&
    grant.downloadsUsed < grant.maxDownloads;
}

export function assertDownloadAllowed(grant: DownloadGrant, now = new Date()): void {
  if (!canDownload(grant, now)) {
    throw new Error('Download grant is expired, revoked or exhausted');
  }
}

export interface PrivateStorage {
  createSignedUrl(path: string, expiresInSeconds: number): Promise<string>;
}

/**
 * Generate a short-lived URL only after server-side authorization.
 * Never expose the underlying storage path to the client.
 */
export async function issueSignedDownloadUrl(
  grant: DownloadGrant,
  storage: PrivateStorage,
  expiresInSeconds = 300,
  now = new Date()
): Promise<string> {
  assertDownloadAllowed(grant, now);
  const remainingSeconds = Math.max(1, Math.floor((grant.expiresAt.getTime() - now.getTime()) / 1000));
  return storage.createSignedUrl(grant.assetPath, Math.min(expiresInSeconds, remainingSeconds));
}
