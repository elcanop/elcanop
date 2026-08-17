# Plataforma de Música Personalizada

Flujo base del producto replanteado.

## Alcance

- Solo dos productos: Express y Semi-Pro.
- No incluye Estudio Profesional/VIP ni Corporativo/Marcas.
- Las referencias de audio del cliente son opcionales.
- Cada compra genera un número de pedido único.
- El cliente consulta el pedido mediante número de pedido + verificación adicional.
- Incluye una sola ronda de correcciones.
- Las entregas usan almacenamiento privado y URLs firmadas temporales.
- La pasarela de pagos queda desacoplada y se definirá posteriormente.

## Flujo

1. Cliente configura la canción.
2. Opcionalmente aporta referencia rítmica, vocal o ambas.
3. Selecciona producto y complementos.
4. Revisa resumen y crea orden pendiente.
5. Se procesa el pago mediante un adaptador de pasarela.
6. Webhook validado confirma el pago e inicia producción.
7. Producción pasa por control de calidad.
8. Cliente recibe una previsualización.
9. Puede usar una única ronda de corrección.
10. Se genera la versión final.
11. Cliente accede al portal del pedido.
12. La descarga se autoriza mediante token temporal y queda auditada.
13. El acceso expira según la política de entrega.

## Estados principales

`DRAFT` → `AWAITING_PAYMENT` → `PAID` → `QUEUED` → `IN_PRODUCTION` → `QUALITY_REVIEW` → `READY_FOR_CLIENT_REVIEW` → `CORRECTION_REQUESTED` → `IN_REVISION` → `READY_FINAL` → `DELIVERED` → `ACCESS_EXPIRED`

Estados de excepción: `PAYMENT_FAILED`, `CANCELLED`, `REFUNDED`, `PRODUCTION_BLOCKED`.

## Seguridad

Los archivos nunca son públicos. El servidor autoriza el pedido y genera URLs firmadas de corta duración. El número de pedido no funciona como contraseña. Los webhooks de pago deben validar firma e idempotencia. Todas las acciones sensibles deben quedar auditadas.

## Estructura

- `docs/architecture.md`: arquitectura y flujo de negocio.
- `docs/security.md`: modelo de amenazas y controles.
- `docs/payment-provider.md`: contrato agnóstico de pasarela.
- `database/schema.sql`: modelo PostgreSQL/Supabase.
- `backend/domain.ts`: estados y reglas de negocio.
- `backend/payment.ts`: contrato de pasarela.
- `backend/download.ts`: política de descarga segura.
- `backend/corrections.ts`: regla de una corrección incluida.
- `backend/order-number.ts`: generación del número comercial de pedido.
