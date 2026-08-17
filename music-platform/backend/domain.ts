export type ProductTier = 'EXPRESS' | 'SEMI_PRO';

export type OrderStatus =
  | 'DRAFT' | 'AWAITING_PAYMENT' | 'PAID' | 'QUEUED' | 'IN_PRODUCTION'
  | 'QUALITY_REVIEW' | 'READY_FOR_CLIENT_REVIEW' | 'CORRECTION_REQUESTED'
  | 'IN_REVISION' | 'READY_FINAL' | 'DELIVERED' | 'ACCESS_EXPIRED'
  | 'PAYMENT_FAILED' | 'CANCELLED' | 'REFUNDED' | 'PRODUCTION_BLOCKED';

export const CLIENT_VISIBLE_STATUSES: OrderStatus[] = [
  'AWAITING_PAYMENT', 'PAID', 'QUEUED', 'IN_PRODUCTION',
  'QUALITY_REVIEW', 'READY_FOR_CLIENT_REVIEW', 'CORRECTION_REQUESTED',
  'IN_REVISION', 'READY_FINAL', 'DELIVERED', 'ACCESS_EXPIRED',
  'PAYMENT_FAILED', 'CANCELLED', 'REFUNDED'
];

const transitions: Record<OrderStatus, OrderStatus[]> = {
  DRAFT: ['AWAITING_PAYMENT', 'CANCELLED'],
  AWAITING_PAYMENT: ['PAID', 'PAYMENT_FAILED', 'CANCELLED'],
  PAID: ['QUEUED', 'REFUNDED'],
  QUEUED: ['IN_PRODUCTION', 'PRODUCTION_BLOCKED'],
  IN_PRODUCTION: ['QUALITY_REVIEW', 'PRODUCTION_BLOCKED'],
  QUALITY_REVIEW: ['READY_FOR_CLIENT_REVIEW', 'IN_PRODUCTION'],
  READY_FOR_CLIENT_REVIEW: ['CORRECTION_REQUESTED', 'READY_FINAL'],
  CORRECTION_REQUESTED: ['IN_REVISION'],
  IN_REVISION: ['QUALITY_REVIEW', 'PRODUCTION_BLOCKED'],
  READY_FINAL: ['DELIVERED'],
  DELIVERED: ['ACCESS_EXPIRED'],
  ACCESS_EXPIRED: [],
  PAYMENT_FAILED: ['AWAITING_PAYMENT', 'CANCELLED'],
  CANCELLED: [],
  REFUNDED: [],
  PRODUCTION_BLOCKED: ['IN_PRODUCTION', 'CANCELLED']
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return transitions[from].includes(to);
}

export function assertTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid order transition: ${from} -> ${to}`);
  }
}

export interface OrderForCorrection {
  correctionsAllowed: number;
  correctionsUsed: number;
  status: OrderStatus;
}

export function canRequestCorrection(order: OrderForCorrection): boolean {
  return order.status === 'READY_FOR_CLIENT_REVIEW' &&
    order.correctionsUsed < order.correctionsAllowed;
}

export function consumeCorrection(order: OrderForCorrection): OrderForCorrection {
  if (!canRequestCorrection(order)) {
    throw new Error('No correction round is available for this order');
  }
  return {
    ...order,
    correctionsUsed: order.correctionsUsed + 1,
    status: 'CORRECTION_REQUESTED'
  };
}
