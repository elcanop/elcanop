# Buzón de Contacto — Melofilia

## Objetivo

Melofilia tendrá un canal abierto de contacto para cualquier persona, no solamente para clientes que ya hayan realizado un pedido.

El buzón sirve para:

- Consultas generales sobre los servicios.
- Personas interesadas antes de comprar.
- Preguntas sobre productos y modalidades.
- Solicitudes de información.
- Ideas y sugerencias para Melofilia.
- Reviews y opiniones.
- Felicitaciones.
- Reportes de problemas.
- Consultas relacionadas con un pedido existente.
- Otras comunicaciones comerciales o de soporte.

El número de pedido será **opcional** y solamente se solicitará cuando la consulta esté relacionada con una compra.

## Experiencia pública

Incluir un bloque claramente visible pero integrado al lenguaje visual de Melofilia:

**¿Tienes algo que contarnos?**

Puede ser una pregunta, una idea, una opinión, una propuesta o simplemente quieres hablar con nosotros.

Formulario:

- Nombre.
- Correo electrónico.
- Tipo de consulta.
- Número de pedido (opcional).
- Mensaje.
- Consentimiento de tratamiento de datos cuando sea requerido.

### Categorías sugeridas

- `SERVICIOS` — quiero saber qué ofrecen.
- `COTIZACIÓN` — quiero conocer precios o una solución específica.
- `PEDIDO` — consulta relacionada con una compra.
- `SUGERENCIA` — idea para mejorar Melofilia.
- `REVIEW` — opinión o experiencia.
- `PROBLEMA` — inconveniente técnico o de servicio.
- `COLABORACIÓN` — propuesta de colaboración.
- `OTRO` — cualquier asunto que no encaje en las anteriores.

El formulario debe funcionar perfectamente en móvil y mostrar confirmación sin recargar toda la página.

El correo público también aparecerá de forma discreta en el footer:

`elcanop.dropit@gmail.com`

Debe ser pequeño, legible y accesible como enlace `mailto:`; no debe competir visualmente con el CTA principal.

## Buzón administrativo

Todas las comunicaciones se almacenan en una bandeja privada dentro de `Melofilia Admin`, independientemente de que la persona tenga o no un pedido.

Estados:

`NEW` → `IN_PROGRESS` → `WAITING_CUSTOMER` → `RESOLVED` → `CLOSED`

El administrador puede:

- Ver consultas nuevas y no leídas.
- Filtrar por estado, categoría y prioridad.
- Buscar por nombre o correo.
- Abrir la conversación completa.
- Añadir notas internas.
- Cambiar estado.
- Marcar prioridad.
- Consultar historial.
- Vincular opcionalmente la consulta a un pedido existente.
- Desvincularla de un pedido si fue asociada incorrectamente.

## Reviews

Las comunicaciones marcadas como `REVIEW` deben poder identificarse fácilmente en Admin y, si posteriormente se desea publicar testimonios, debe existir un proceso separado de autorización. Una review enviada al buzón **no se publica automáticamente**.

## Seguridad

- El cliente no puede consultar arbitrariamente otros mensajes.
- El número de pedido no funciona como credencial.
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
