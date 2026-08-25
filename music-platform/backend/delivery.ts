export const CUSTOMER_DOWNLOAD_WINDOW_DAYS = 7;

export function calculateDownloadExpiry(deliveredAt: Date): Date {
  const expiresAt = new Date(deliveredAt.getTime());
  expiresAt.setUTCDate(expiresAt.getUTCDate() + CUSTOMER_DOWNLOAD_WINDOW_DAYS);
  return expiresAt;
}

export function isCustomerDownloadWindowOpen(
  deliveredAt: Date | null,
  now = new Date()
): boolean {
  if (!deliveredAt) return false;
  return now.getTime() < calculateDownloadExpiry(deliveredAt).getTime();
}

export interface DeliveryAsset {
  path: string;
  kind: 'MP3' | 'WAV' | 'LYRICS_PDF' | 'COVER' | 'STEMS_ZIP';
}

export function validateDeliveryAsset(asset: DeliveryAsset): void {
  if (asset.kind === 'STEMS_ZIP' && !asset.path.endsWith('.zip')) {
    throw new Error('STEMS_ZIP must point to a ZIP asset');
  }
}
