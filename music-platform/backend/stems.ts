export interface StemAsset {
  path: string;
  filename: string;
}

export interface ZipStorage {
  createPrivateZip(input: {
    outputPath: string;
    files: StemAsset[];
  }): Promise<void>;
}

/**
 * Stems are delivered as one private ZIP asset.
 * The ZIP itself receives a normal seven-day download grant.
 */
export async function buildStemsZip(
  orderId: string,
  stems: StemAsset[],
  storage: ZipStorage
): Promise<string> {
  if (stems.length === 0) {
    throw new Error('At least one stem is required');
  }

  const outputPath = `orders/${orderId}/deliverables/stems.zip`;
  await storage.createPrivateZip({ outputPath, files: stems });
  return outputPath;
}
