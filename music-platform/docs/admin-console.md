# Consola Administrativa Segura

La plataforma tendrá un área administrativa privada separada de la experiencia pública del cliente.

## Acceso

Ruta conceptual: `/admin`.

El administrador no entra con el número de pedido. El acceso administrativo requiere una identidad autenticada independiente.

Controles obligatorios:

- MFA resistente a phishing cuando el proveedor de identidad lo soporte (passkey/WebAuthn como opción preferida).
- Contraseña fuerte como factor alternativo.
- Sesiones cortas y renovación controlada.
- Revocación de sesiones y dispositivos.
- Rate limiting y protección contra credential stuffing.
- Bloqueo temporal ante comportamiento anómalo.
- No exponer credenciales, service-role keys ni secretos al navegador.
- Cookies de sesión `HttpOnly`, `Secure`, `SameSite` cuando aplique.
- Reautenticación para operaciones de alto impacto.

## Modelo de privilegios

Inicialmente existirán dos roles:

### OWNER

Cuenta principal del propietario del negocio. Tiene acceso completo a las operaciones administrativas.

### PRODUCER

Rol operativo futuro para producción. No debe tener permisos para administrar credenciales, pagos, configuración crítica ni eliminar pedidos.

Aunque inicialmente exista un solo administrador, el sistema debe implementar autorización por rol desde el principio.

## Panel principal

El dashboard administrativo debe ser operativo, no un dashboard de métricas decorativo.

### Bandeja de producción

- Pedidos nuevos.
- Pendientes de pago.
- En cola.
- En producción.
- En revisión interna.
- Esperando corrección del cliente.
- Corrección recibida.
- Listos para entrega.
- Entregados.
- Acceso expirado.

### Vista de pedido

Permite consultar y gestionar:

- Datos del cliente.
- Brief completo.
- Letra.
- Parámetros de producción.
- Referencias de audio.
- Versiones generadas.
- Preview.
- Master MP3/WAV.
- Stems.
- ZIP de stems.
- PDF y carátula.
- Historial de estados.
- Historial de correcciones.
- Estado del pago.
- Descargas.
- Fecha de expiración.
- Auditoría.

## Producción musical

El administrador tendrá un **Production Brief** interno que no se muestra al cliente.

Debe poder copiar rápidamente:

- Letra.
- Style prompt.
- Exclusiones.
- Parámetros avanzados.
- BPM.
- Tonalidad cuando esté definida.
- Instrumentación.
- Referencias.
- Notas de producción.

El sistema no debe mencionar ni exponer al cliente el proveedor/motor usado para producir las canciones.

La integración del motor de producción queda desacoplada para poder cambiar de proveedor en el futuro.

## Versionado

Cada producción debe conservar versiones:

`V01`, `V02`, `V03`...

Solo una versión puede marcarse como preview activa y otra como final.

El administrador debe poder comparar metadatos y reproducir versiones sin exponer las versiones internas al cliente salvo que se autorice explícitamente.

## Correcciones

El administrador puede:

- Ver la única corrección incluida.
- Escuchar la versión asociada.
- Ver descripción y timestamp.
- Marcarla en revisión.
- Registrar notas internas.
- Subir nueva versión.
- Marcarla completada.

Nunca se debe permitir consumir silenciosamente una segunda corrección incluida.

## Entrega

El administrador puede:

- Marcar pedido como listo.
- Generar assets finales.
- Crear/revocar grants de descarga.
- Ver fecha de expiración.
- Extender excepcionalmente el acceso con motivo obligatorio.
- Registrar la acción en auditoría.

Una extensión manual no debe sobrescribir el historial: debe crear un evento auditable con actor, fecha, motivo y nueva fecha.

## Pagos

El administrador puede consultar:

- Estado del pago.
- Proveedor.
- Referencia externa.
- Eventos webhook.
- Reembolsos cuando la integración lo permita.

Las operaciones financieras sensibles requieren reautenticación y registro de auditoría.

## Auditoría

Registrar como mínimo:

- Login/logout.
- Fallos de autenticación relevantes.
- Cambios de estado.
- Acceso a archivos privados.
- Creación/revocación de grants.
- Extensiones de descarga.
- Solicitudes de corrección.
- Cambios de producción.
- Cambios de configuración.
- Acciones de pago/refund.

La bitácora debe ser append-only desde la aplicación operativa; los administradores no deben poder borrar eventos históricos desde la UI.

## Separación de secretos

El navegador nunca recibe:

- Supabase service role key.
- R2 access key/secret.
- Credenciales de pasarela.
- Secretos de webhook.
- Tokens del proveedor de producción.

Todo secreto vive en variables de entorno/secret manager del backend.

## Recuperación

La cuenta OWNER debe tener mecanismos de recuperación fuertes y documentados. No se debe crear un backdoor administrativo en la aplicación.

## Diseño del panel

Debe conservar el lenguaje visual de la plataforma: música, waveform, reproductores, timeline y estados. Sin embargo, la consola debe priorizar densidad operativa y velocidad de trabajo sobre decoración.

Debe ser completamente usable en móvil, pero las tareas de producción intensiva estarán optimizadas también para pantallas grandes.
