const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomPart(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => ALPHABET[b % ALPHABET.length]).join('');
}

/**
 * Commercial identifier. Uniqueness MUST still be enforced by the database.
 * Never use the order number itself as an authentication secret.
 */
export function generateOrderNumber(date = new Date()): string {
  const year = date.getUTCFullYear();
  return `MP-${year}-${randomPart(8)}`;
}
