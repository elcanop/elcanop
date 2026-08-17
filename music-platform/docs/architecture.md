# Arquitectura funcional

## 1. Experiencia del cliente

### `/`
Landing, productos, ejemplos, precio, preguntas frecuentes y acceso al pedido.

### `/crear`
Constructor multi-step:

1. Datos del cliente.
2. Género, ocasión, emoción e historia.
3. Frases y nombres obligatorios.
4. Referencias opcionales: ritmo y/o voz.
5. Producto y complementos.
6. Resumen.
7. Creación de orden.
8. Pago.

No se debe persistir información sensible en `localStorage`; únicamente un borrador no sensible y con expiración puede conservarse en cliente.

### `/pedido`
Entrada mediante número de pedido y segundo factor de verificación, por ejemplo código OTP enviado al correo del pedido.

### `/pedido/:orderNumber`
Muestra estado, información comercial, previsualización cuando esté habilitada, corrección disponible, historial permitido al cliente y archivos descargables.

## 2. Flujo de negocio

```text
DRAFT
  ↓
AWAITING_PAYMENT
  ↓
PAID
  ↓
QUEUED
  ↓
IN_PRODUCTION
  ↓
QUALITY_REVIEW
  ↓
READY_FOR_CLIENT_REVIEW
  ├── sin corrección → READY_FINAL
  └── corrección → CORRECTION_REQUESTED → IN_REVISION → READY_FINAL
                                      ↑
                                      └── solo una vez
  ↓
DELIVERED
  ↓
ACCESS_EXPIRED
```

## 3. Pedido

El pedido tiene un UUID interno no expuesto como mecanismo de acceso y un número comercial como `MP-2026-000184`.

El número comercial sirve para localizar el pedido, pero nunca debe ser suficiente para descargar archivos.

## 4. Corrección incluida

Cada pedido empieza con `corrections_allowed = 1` y `corrections_used = 0`.

Solo se acepta una solicitud incluida. Una corrección debe registrar descripción, momento aproximado, categoría, fecha, usuario y estado. Una segunda solicitud debe rechazarse automáticamente o convertirse en una solicitud comercial independiente fuera de este flujo.

## 5. Archivos

- Referencias del cliente: bucket privado.
- Previews: bucket privado.
- Masters: bucket privado.
- PDF de letra y carátula: bucket privado.
- El cliente recibe URLs firmadas generadas por backend.
- Las URLs tienen expiración corta y no se almacenan permanentemente.

## 6. Producción

La plataforma gestiona el workflow y los archivos; el motor de composición/generación puede sustituirse sin cambiar el modelo de pedido. El productor interno trabaja sobre los recursos del pedido y registra las transiciones.

## 7. Pagos

La orden pasa a producción únicamente tras una confirmación de pago válida del backend. Los eventos de pago deben ser idempotentes. La implementación concreta de Wompi, PayU, Mercado Pago u otro proveedor se decidirá después mediante un adaptador común.
