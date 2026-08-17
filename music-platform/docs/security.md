# Seguridad

## Principios

1. Deny by default.
2. El cliente nunca decide estados, precios, permisos ni rutas de archivos.
3. El número de pedido no es un secreto.
4. Todos los archivos son privados.
5. Toda operación de descarga se autoriza en backend.
6. Los webhooks se verifican antes de afectar el pedido.
7. Eventos externos son idempotentes.
8. Las acciones sensibles quedan auditadas.

## Acceso al pedido

El flujo recomendado es:

`order_number` → validación de existencia sin filtrar datos sensibles → OTP al correo registrado → sesión de acceso de corta duración → consulta autorizada.

No se deben revelar nombres, correos completos, teléfonos, importes o archivos cuando el número de pedido sea incorrecto.

Aplicar rate limiting, bloqueo progresivo y protección contra enumeración.

## Archivos del cliente

Los audios subidos por el cliente deben:

- tener límite de tamaño y duración;
- validar MIME y firma real del archivo;
- rechazar formatos no permitidos;
- almacenarse fuera del árbol público;
- utilizar nombres internos aleatorios;
- pasar por controles antimalware cuando el entorno lo permita.

## Descargas

No se deben entregar enlaces permanentes. El backend crea un grant asociado al pedido y al asset. El grant tiene expiración, límite de descargas y revocación. La URL firmada de Storage debe durar pocos minutos, aunque el período comercial de acceso pueda ser mayor.

## Pagos

- Verificar firma criptográfica del webhook.
- Registrar `provider_event_id` con restricción única.
- Procesar cada evento una sola vez.
- Nunca confiar en el monto enviado por el navegador.
- Comparar monto, moneda, referencia y pedido en servidor.
- Solo un evento confirmado puede mover `AWAITING_PAYMENT` a `PAID`.

## Sesiones y API

- Cookies `HttpOnly`, `Secure`, `SameSite` cuando se use cookie auth.
- CSRF protection cuando corresponda.
- CORS con allowlist explícita.
- Rate limiting en OTP, login, consulta de pedido, correcciones y descargas.
- Validación server-side de JSON y multipart.
- Mensajes de error que no revelen información interna.
- Secretos únicamente mediante variables de entorno/secret manager.

## Auditoría

Registrar como mínimo: creación de pedido, cambio de estado, pago, webhook, acceso al portal, solicitud de corrección, generación de grant, descarga, revocación y expiración. Los logs no deben guardar secretos ni tokens en claro.
