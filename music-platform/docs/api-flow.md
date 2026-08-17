# API / workflow contract

## Public customer flow

### POST `/api/orders`
Creates a draft order from validated customer and song configuration.

Server computes the price from product/add-ons; client-submitted totals are ignored.

Returns only the order number and payment initiation state.

### POST `/api/orders/:orderNumber/payment`
Creates a checkout session through the configured `PaymentGateway` adapter.

### POST `/api/webhooks/payment/:provider`
Receives the provider event. Verify signature, enforce idempotency, validate order/reference/amount/currency, then update payment status.

### POST `/api/order-access/request`
Receives order number and customer email. If valid, sends a one-time access code. Response must not reveal whether the order exists.

### POST `/api/order-access/verify`
Verifies OTP and creates a short-lived customer portal session.

### GET `/api/orders/:orderNumber`
Requires the customer portal session. Returns only client-safe fields.

### POST `/api/orders/:orderNumber/correction`
Requires portal session. Validates that the order is `READY_FOR_CLIENT_REVIEW` and that `corrections_used < corrections_allowed`. Atomically increments the counter and creates the correction record.

### POST `/api/orders/:orderNumber/download/:asset`
Requires portal session. Checks order ownership/access, asset ownership, expiration, revocation and remaining download quota. Atomically records the download and returns a short-lived signed URL.

## Internal workflow

### POST `/api/internal/orders/:orderNumber/transition`
Admin/worker-only endpoint. Validates the state machine before changing status and writes an audit event.

### POST `/api/internal/orders/:orderNumber/assets`
Producer/admin-only. Registers an asset path in private storage. Never accepts a public URL as the authoritative asset location.

## Atomicity requirements

Correction consumption and download quota must be performed transactionally. Payment event insertion and payment-state transition must be idempotent. Concurrent requests must not allow two correction requests or two quota-consuming operations when only one remains.
