# Buzón de Contacto — Melofilia

## Objetivo

Melofilia tendrá un canal de contacto para consultas que no correspondan directamente al flujo de creación o al portal de pedido.

## Experiencia pública

Incluir un bloque `¿Tienes una consulta?` con un formulario breve:

- Nombre.
- Correo electrónico.
- Número de pedido (opcional).
- Motivo/categoría.
- Mensaje.
- Consentimiento de tratamiento de datos cuando sea requerido.

El formulario debe funcionar perfectamente en móvil y mostrar confirmación sin recargar toda la página.

El correo público también aparecerá de forma discreta en el footer:

`elcanop.dropit@gmail.com`

Debe ser pequeño, legible y accesible como enlace `mailto:`; no debe competir visualmente con el CTA principal.

## Buzón administrativo

Las consultas del formulario se almacenan en una bandeja privada dentro de `Melofilia Admin`.

Estados:

`NEW` → `IN_PROGRESS` → `WAITING_CUSTOMER` → `RESOLVED` → `CLOSED`

El administrador puede:

- Ver bandeja y no leídos.
- Filtrar por estado, categoría y pedido.
- Abrir una conversación.
- Añadir notas internas.
- Cambiar estado.
- Marcar prioridad.
- Consultar historial.
- Vincular la consulta a un pedido.

## Seguridad

- El cliente no puede consultar arbitrariamente otros mensajes.
- No se debe usar el número de pedido como credencial.
- Rate limiting y anti-spam.
- Validación server-side.
- Sanitización del contenido.
- Protección contra abuso del formulario.
- Auditoría de acciones administrativas.
- No almacenar secretos en el contenido del mensaje.

## Privacidad

El buzón debe aplicar minimización de datos y una política de retención definida. El correo electrónico y cualquier información personal deben permanecer fuera de URLs públicas y logs innecesarios.

## Respuestas

La primera implementación puede ser un buzón interno. La arquitectura debe permitir posteriormente integrar un proveedor de correo o sistema de soporte sin cambiar el modelo de conversación.
