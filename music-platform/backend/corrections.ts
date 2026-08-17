export interface CorrectionRequest {
  category?: string;
  description: string;
  timestampHint?: string;
  referencePath?: string;
}

export interface CorrectionPolicy {
  allowed: number;
  used: number;
}

export function validateCorrection(
  policy: CorrectionPolicy,
  request: CorrectionRequest,
  currentStatus: string
): void {
  if (currentStatus !== 'READY_FOR_CLIENT_REVIEW') {
    throw new Error('The order is not open for client corrections');
  }
  if (policy.used >= policy.allowed) {
    throw new Error('The included correction has already been used');
  }
  if (!request.description.trim()) {
    throw new Error('Correction description is required');
  }
  if (request.description.length > 5000) {
    throw new Error('Correction description is too long');
  }
}

export function nextCorrectionCount(policy: CorrectionPolicy): CorrectionPolicy {
  if (policy.used >= policy.allowed) throw new Error('No correction available');
  return { ...policy, used: policy.used + 1 };
}
