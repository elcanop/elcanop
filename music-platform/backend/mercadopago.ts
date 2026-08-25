import { PaymentGateway, CreatePaymentInput, PaymentSession, PaymentWebhookEvent, PaymentStatus } from './payment';

export interface MercadoPagoConfig {
  accessToken: string;
  publicKey?: string;
  sandbox?: boolean;
  appUrl?: string;
  webhookSecret?: string;
}

export class MercadoPagoGateway implements PaymentGateway {
  private accessToken: string;
  private sandbox: boolean;
  private appUrl: string;
  private webhookSecret?: string;

  constructor(config: MercadoPagoConfig) {
    this.accessToken = config.accessToken;
    this.sandbox = config.sandbox ?? true;
    this.appUrl = config.appUrl || 'http://localhost:5173';
    this.webhookSecret = config.webhookSecret;
  }

  /**
   * Crea una preferencia de pago en Mercado Pago Checkout Pro
   */
  async createPayment(input: CreatePaymentInput): Promise<PaymentSession> {
    const preferencePayload = {
      items: [
        {
          id: input.orderId,
          title: input.description || `Melofilia - Pedido ${input.orderNumber}`,
          description: `Producción musical personalizada para el pedido ${input.orderNumber}`,
          quantity: 1,
          currency_id: input.currency || 'COP',
          unit_price: Number(input.amount)
        }
      ],
      payer: {
        email: input.customerEmail
      },
      external_reference: input.orderNumber,
      back_urls: {
        success: `${this.appUrl}/pedido/${input.orderNumber}?payment_status=success`,
        failure: `${this.appUrl}/pedido/${input.orderNumber}?payment_status=failure`,
        pending: `${this.appUrl}/pedido/${input.orderNumber}?payment_status=pending`
      },
      auto_return: 'approved',
      notification_url: `${this.appUrl.replace('localhost', '127.0.0.1')}/api/webhooks/mercadopago`,
      statement_descriptor: 'MELOFILIA MUSICA',
      metadata: {
        order_id: input.orderId,
        order_number: input.orderNumber,
        customer_email: input.customerEmail
      }
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferencePayload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Mercado Pago error (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    
    // Si estamos en sandbox, utilizamos sandbox_init_point
    const checkoutUrl = (this.sandbox && data.sandbox_init_point) 
      ? data.sandbox_init_point 
      : data.init_point;

    return {
      provider: 'MERCADO_PAGO',
      providerReference: data.id,
      checkoutUrl: checkoutUrl || data.init_point,
      status: 'PENDING'
    };
  }

  /**
   * Consulta el estado de un pago directamente en la API de Mercado Pago
   */
  async getPayment(paymentId: string | number): Promise<any> {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error consultando pago ${paymentId} en Mercado Pago: ${errorText}`);
    }

    return response.json();
  }

  /**
   * Verifica la autenticidad del webhook de Mercado Pago
   */
  async verifyWebhook(event: PaymentWebhookEvent): Promise<boolean> {
    if (event.provider !== 'MERCADO_PAGO') return false;

    // Si viene con un ID de pago, verificamos que exista en Mercado Pago
    if (event.providerEventId) {
      try {
        // En Mercado Pago los webhooks envían el payment ID en data.id o resource
        const paymentData = await this.getPayment(event.providerEventId);
        return paymentData && paymentData.id !== undefined;
      } catch (err) {
        console.warn('Webhook verification fallback:', err);
        return false;
      }
    }

    return true;
  }

  /**
   * Mapea los estados de Mercado Pago a los estados estándar de la plataforma
   */
  mapWebhookStatus(event: PaymentWebhookEvent): PaymentStatus {
    switch (event.status) {
      case 'APPROVED':
        return 'APPROVED';
      case 'FAILED':
        return 'FAILED';
      case 'REFUNDED':
        return 'REFUNDED';
      default:
        return 'PENDING';
    }
  }

  /**
   * Mapea el estado directo de un Payment object de Mercado Pago
   */
  mapMpStatus(mpStatus: string): PaymentStatus {
    switch (mpStatus) {
      case 'approved':
        return 'APPROVED';
      case 'rejected':
      case 'cancelled':
        return 'FAILED';
      case 'refunded':
      case 'charged_back':
        return 'REFUNDED';
      case 'in_process':
      case 'pending':
      case 'authorized':
      default:
        return 'PENDING';
    }
  }
}
