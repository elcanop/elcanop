export type PaymentStatus = 'PENDING' | 'APPROVED' | 'FAILED' | 'REFUNDED';

export interface CreatePaymentInput {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customerEmail: string;
  description: string;
}

export interface PaymentSession {
  provider: string;
  providerReference: string;
  checkoutUrl: string;
  status: PaymentStatus;
}

export interface PaymentWebhookEvent {
  provider: string;
  providerEventId: string;
  providerReference: string;
  type: string;
  status: PaymentStatus;
  orderNumber: string;
  signature: string;
  rawBody: string;
}

/**
 * Adapter contract. The concrete gateway is intentionally not selected yet.
 */
export interface PaymentGateway {
  createPayment(input: CreatePaymentInput): Promise<PaymentSession>;
  verifyWebhook(event: PaymentWebhookEvent): Promise<boolean>;
  mapWebhookStatus(event: PaymentWebhookEvent): PaymentStatus;
}

/**
 * Webhook processing must be idempotent using (provider, providerEventId)
 * before changing the order payment status.
 */
export async function handlePaymentWebhook(
  gateway: PaymentGateway,
  event: PaymentWebhookEvent,
  eventAlreadyProcessed: (provider: string, eventId: string) => Promise<boolean>,
  recordEvent: (event: PaymentWebhookEvent) => Promise<void>,
  applyStatus: (orderNumber: string, status: PaymentStatus) => Promise<void>
): Promise<void> {
  if (await eventAlreadyProcessed(event.provider, event.providerEventId)) return;

  const valid = await gateway.verifyWebhook(event);
  if (!valid) throw new Error('Invalid payment webhook signature');

  await recordEvent(event);
  await applyStatus(event.orderNumber, gateway.mapWebhookStatus(event));
}
