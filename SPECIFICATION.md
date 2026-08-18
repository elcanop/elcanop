# MELOFILIA

## Plataforma de canciones personalizadas

Melofilia es una plataforma digital para crear, producir y entregar canciones personalizadas a partir de historias, emociones, referencias y preferencias musicales proporcionadas por el cliente.

La experiencia debe sentirse como un producto musical moderno, emocional, interactivo y premium; no como una plantilla SaaS genérica generada por IA.

---

# 1. CONCEPTO DEL PRODUCTO

Melofilia convierte una historia personal en una canción.

El cliente puede describir:

- Una persona.
- Una historia.
- Una ocasión.
- Un recuerdo.
- Una relación.
- Un sentimiento.
- Una celebración.
- Una experiencia.

La plataforma transforma esa información en un pedido de producción musical.

---

# 2. PRODUCTOS

La plataforma tendrá inicialmente únicamente dos modalidades.

## Express

Producto de entrada.

Incluye:

- Canción personalizada.
- Letra personalizada.
- Producción musical.
- Master final.
- MP3.
- Letra en PDF.

## Semi-Pro

Producto de mayor elaboración.

Incluye:

- Letra personalizada con mayor desarrollo.
- Producción musical más elaborada.
- MP3.
- WAV.
- Carátula digital.
- Posibilidad de entrega de stems cuando corresponda.

---

# 3. PRODUCTOS ELIMINADOS

No existirán:

- Estudio Profesional VIP.
- Servicio Corporativo.
- Marcas.
- Jingles comerciales.
- Producción para campañas corporativas.

---

# 4. GRABACIONES DEL CLIENTE

La grabación del cliente es completamente opcional.

El cliente puede realizar el pedido sin grabar absolutamente nada.

Puede aportar opcionalmente:

### Referencia rítmica

Una grabación para explicar:

- Ritmo.
- Melodía.
- Cadencia.
- Idea musical.

### Referencia vocal

Una grabación para explicar:

- Voz.
- Melodía.
- Forma de cantar.
- Pronunciación.
- Intención.

Puede proporcionar:

- Ninguna.
- Solo ritmo.
- Solo voz.
- Ritmo + voz.

La ausencia de grabaciones nunca debe impedir realizar el pedido.

---

# 5. EXPERIENCIA DE LA PÁGINA

La plataforma debe ser:

- Mobile-first.
- Responsive.
- Rápida.
- Interactiva.
- Visualmente diferenciada.
- Optimizada para teléfonos.
- Optimizada para tablets.
- Optimizada para escritorio.

No debe parecer una plantilla tradicional.

---

# 6. DIRECCIÓN VISUAL

Melofilia debe sentirse:

- Musical.
- Emocional.
- Contemporánea.
- Editorial.
- Elegante.
- Dinámica.
- Táctil.
- Personal.

Evitar:

- Dashboard genérico.
- Tres tarjetas repetitivas.
- Gradientes genéricos.
- Glassmorphism excesivo.
- Hero genérico de IA.
- Stock photos como elemento principal.
- Animaciones sin función.

---

# 7. INTERACCIONES

La página debe utilizar interacciones reales.

## Visualizaciones

- Waveforms.
- Visualizaciones de audio.
- Barras de frecuencia.
- Pulsos.
- Progreso de reproducción.
- Visualizaciones vinculadas al audio.
- Animaciones de estados.
- Transiciones entre etapas.

Las visualizaciones no deben ser decorativas únicamente.

Deben reaccionar a:

- Audio.
- Selecciones del usuario.
- Precio.
- Estado del pedido.
- Producción.
- Disponibilidad de archivos.

---

# 8. LANDING PAGE

## Hero

Debe comunicar inmediatamente:

> Tu historia puede convertirse en una canción.

Debe incluir:

- Reproductor.
- Waveform.
- Demo.
- CTA principal.
- CTA secundario.

### CTA principal

`CREAR MI CANCIÓN`

### CTA secundario

`CÓMO FUNCIONA`

---

# 9. SELECTOR MUSICAL INTERACTIVO

La página puede permitir explorar diferentes estilos.

Ejemplos:

- Pop.
- Reggaetón.
- Salsa.
- Vallenato.
- Bachata.
- Balada.
- Urbano.
- Rock.
- Otros.

El cambio de género debe modificar visualmente la experiencia.

---

# 10. CONSTRUCTOR DE CANCIÓN

Ruta:

`/crear`

La creación será una experiencia guiada.

No debe utilizar un formulario administrativo largo.

---

## PASO 1 — OCASIÓN

Ejemplos:

- Cumpleaños.
- Aniversario.
- Amor.
- Homenaje.
- Amistad.
- Propuesta.
- Recuerdo.
- Celebración.
- Otra.

---

## PASO 2 — HISTORIA

Campo amplio para que el cliente escriba su historia.

Debe permitir:

- Texto largo.
- Contador de caracteres.
- Sugerencias contextuales.
- Guardado temporal.

---

## PASO 3 — IDENTIDAD MUSICAL

Seleccionar:

- Género.
- Subgénero.
- Estado emocional.
- Intensidad.
- Estilo.

---

## PASO 4 — REFERENCIAS

Opcionales:

- Grabar ritmo.
- Subir ritmo.
- Grabar voz.
- Subir voz.

Debe existir claramente:

`CONTINUAR SIN GRABACIÓN`

---

## PASO 5 — PRODUCTO

Seleccionar:

- Express.
- Semi-Pro.

El precio debe actualizarse inmediatamente.

---

## PASO 6 — RESUMEN

Mostrar:

- Producto.
- Características.
- Precio.
- Datos principales.
- Complementos.
- Información importante.

---

# 11. PAGO

La pasarela de pagos será definida posteriormente.

La arquitectura debe ser independiente del proveedor.

Debe existir una abstracción:

`PaymentService`

para permitir posteriormente integrar:

- Wompi.
- PayU.
- Mercado Pago.
- Stripe.
- PSE.
- Otro proveedor.

---

# 12. PEDIDO

Cada compra genera un número único.

Ejemplo:

`MP-2026-000184`

El número de pedido sirve para identificar el pedido.

No debe funcionar como contraseña.

---

# 13. ACCESO DEL CLIENTE

El cliente podrá consultar su pedido mediante:

- Número de pedido.
- Verificación adicional.

El número de pedido por sí solo no debe permitir acceder a archivos.

---

# 14. ESTADOS DEL PEDIDO

```text
DRAFT
↓
PAYMENT_PENDING
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
↓
CORRECTION_REQUESTED
↓
IN_REVISION
↓
READY_FINAL
↓
DELIVERED
↓
ACCESS_EXPIRED
```

---

# 15. PRODUCCIÓN

La producción se realizará externamente.

La herramienta utilizada internamente no forma parte de la experiencia pública de Melofilia.

El cliente no debe recibir información innecesaria sobre las herramientas internas utilizadas para producir la canción.

La arquitectura debe permitir cambiar el motor de producción posteriormente.

---

# 16. PRODUCTION BRIEF

El administrador tendrá una herramienta interna para preparar fácilmente cada producción.

Debe incluir:

* Género.
* Subgénero.
* BPM.
* Mood.
* Intensidad.
* Tipo de voz.
* Instrumentación.
* Instrumentos a evitar.
* Estructura.
* Idioma.
* Letra.
* Pronunciación.
* Referencia rítmica.
* Referencia vocal.
* Duración objetivo.
* Parámetros avanzados.
* Notas del productor.

Debe permitir:

```text
COPIAR LETRA
COPIAR STYLE
COPIAR EXCLUSIONES
COPIAR TODO
```

---

# 17. VERSIONES

Cada canción debe tener versiones.

Ejemplo:

```text
V01
V02
V03
FINAL
```

Debe existir control sobre:

* Preview.
* Versión activa.
* Versión final.
* Historial.

Las versiones internas no deben mostrarse automáticamente al cliente.

---

# 18. CORRECCIÓN DEL CLIENTE

Cada pedido incluye:

**UNA ÚNICA RONDA DE CORRECCIÓN.**

Variables:

```text
corrections_allowed = 1
corrections_used = 0
```

Al utilizarla:

```text
corrections_used = 1
```

No se debe permitir consumir silenciosamente una segunda corrección.

---

# 19. LÍMITES DE LA CORRECCIÓN

La corrección permite ajustes sobre la versión entregada.

Puede incluir:

* Letra.
* Nombres.
* Frases.
* Pronunciación.
* Partes específicas.
* Interpretación.
* Ajustes musicales razonables.

No debe permitir rehacer completamente el concepto como una nueva canción.

Cambios sustanciales pueden considerarse un nuevo servicio.

---

# 20. PORTAL DEL CLIENTE

Ruta conceptual:

`/pedido/:orderNumber`

Debe sentirse como una sala privada de escucha.

Debe mostrar:

* Número de pedido.
* Estado.
* Timeline.
* Reproductor.
* Waveform.
* Versión.
* Preview.
* Corrección disponible.
* Corrección utilizada.
* Descargas.
* Fecha de expiración.

---

# 21. DESCARGAS

El cliente tendrá **7 días para descargar sus archivos** desde que el pedido sea entregado.

Las descargas no utilizarán URLs públicas permanentes.

Flujo:

```text
CLIENTE
↓
PORTAL DEL PEDIDO
↓
AUTENTICACIÓN
↓
VALIDACIÓN
↓
URL FIRMADA TEMPORAL
↓
STORAGE PRIVADO
↓
DESCARGA
```

---

# 22. STEMS

Cuando existan stems, no se mostrarán como múltiples descargas individuales.

Se entregarán como:

`STEMS.ZIP`

Ejemplo:

```text
stems.zip

├── vocals.wav
├── instrumental.wav
├── drums.wav
├── bass.wav
├── keys.wav
└── other.wav
```

El ZIP será un archivo privado independiente.

---

# 23. STORAGE

Se utilizará almacenamiento de objetos privado.

Arquitectura propuesta:

```text
Supabase
+
Cloudflare R2
```

Supabase:

* Base de datos.
* Autenticación.
* Pedidos.
* Correcciones.
* Pagos.
* Auditoría.

Cloudflare R2:

* MP3.
* WAV.
* Stems.
* ZIP.
* PDFs.
* Carátulas.
* Grabaciones de referencia.

---

# 24. ARCHIVOS PRIVADOS

Los archivos no deben ser públicos.

No utilizar:

* Google Drive público.
* Dropbox público.
* URLs permanentes.
* Archivos expuestos desde frontend.

Utilizar:

* Storage privado.
* URLs firmadas.
* Expiración.
* Autorización.
* Auditoría.

---

# 25. DEPLOYMENT

La plataforma debe estar preparada para despliegue en infraestructura cloud.

Arquitectura inicial:

```text
GitHub
↓
Frontend / Hosting
↓
Backend
↓
Supabase
↓
Cloudflare R2
```

El hosting debe poder cambiarse sin reconstruir la aplicación.

---

# 26. CONSOLA ADMINISTRATIVA

Ruta:

`/admin`

Debe ser completamente independiente de la experiencia pública.

---

# 27. ADMINISTRADOR PRINCIPAL

Rol:

`OWNER`

Debe tener acceso completo.

Seguridad:

* MFA.
* Passkeys/WebAuthn cuando sea posible.
* Sesiones controladas.
* Revocación de sesiones.
* Rate limiting.
* Protección contra credential stuffing.
* Reautenticación para operaciones críticas.
* Cookies HttpOnly.
* Cookies Secure.
* Protección SameSite.
* Ninguna clave secreta en frontend.

---

# 28. ROLES FUTUROS

Inicialmente:

```text
OWNER
PRODUCER
```

OWNER:

* Acceso completo.

PRODUCER:

* Producción.
* Revisión.
* Gestión operativa.

No debe tener acceso automático a:

* Credenciales.
* Configuración crítica.
* Operaciones financieras sensibles.
* Eliminación de pedidos.

---

# 29. DASHBOARD ADMINISTRATIVO

Debe ser operativo.

Mostrar:

```text
PEDIDOS
NUEVOS
EN PRODUCCIÓN
EN REVISIÓN
CORRECCIONES
LISTOS
ENTREGADOS
EXPIRADOS
```

También:

* Ventas.
* Pedidos por día.
* Conversión.
* Productos vendidos.
* Producciones pendientes.
* Correcciones pendientes.
* Descargas.
* Consultas.
* Reviews.
* Sugerencias.

Las gráficas deben ser grandes, visuales e interactivas.

---

# 30. BUZÓN DE CONTACTO

Melofilia tendrá un buzón abierto para cualquier persona.

No está limitado a clientes existentes.

Sirve para:

* Consultas generales.
* Consultas sobre servicios.
* Cotizaciones.
* Preguntas antes de comprar.
* Pedidos existentes.
* Ideas.
* Sugerencias.
* Reviews.
* Opiniones.
* Problemas.
* Colaboraciones.
* Otras comunicaciones.

---

# 31. FORMULARIO DE CONTACTO

Campos:

* Nombre.
* Correo.
* Tipo de consulta.
* Número de pedido — opcional.
* Mensaje.
* Consentimiento de tratamiento de datos cuando corresponda.

---

# 32. CATEGORÍAS DEL BUZÓN

```text
SERVICIOS
COTIZACIÓN
PEDIDO
SUGERENCIA
REVIEW
PROBLEMA
COLABORACIÓN
OTRO
```

---

# 33. ESTADOS DEL BUZÓN

```text
NEW
↓
IN_PROGRESS
↓
WAITING_CUSTOMER
↓
RESOLVED
↓
CLOSED
```

---

# 34. ADMIN — BUZÓN

El administrador podrá:

* Ver mensajes nuevos.
* Ver no leídos.
* Buscar.
* Filtrar.
* Priorizar.
* Abrir conversaciones.
* Añadir notas internas.
* Cambiar estado.
* Vincular una consulta a un pedido.
* Desvincular una consulta.
* Revisar historial.

---

# 35. REVIEWS

Las reviews recibidas no se publican automáticamente.

Proceso:

```text
REVIEW RECIBIDA
↓
REVISIÓN ADMINISTRATIVA
↓
APROBACIÓN
↓
POSIBLE PUBLICACIÓN
```

---

# 36. CORREO DE CONTACTO

En el footer aparecerá discretamente:

`elcanop.dropit@gmail.com`

Debe ser:

* Pequeño.
* Legible.
* Accesible.
* Enlace `mailto:`.
* Sin competir con el CTA principal.

---

# 37. SEGURIDAD

Nunca exponer:

* Service role keys.
* R2 credentials.
* Payment credentials.
* Webhook secrets.
* Production provider tokens.

Todo secreto debe estar en:

* Variables de entorno.
* Secret manager.
* Backend.

---

# 38. AUDITORÍA

Registrar:

* Login.
* Logout.
* Fallos relevantes.
* Cambios de estado.
* Acceso a archivos.
* Creación de descargas.
* Revocación de descargas.
* Extensiones.
* Correcciones.
* Cambios de producción.
* Cambios de configuración.
* Operaciones de pago.
* Reembolsos.
* Acciones administrativas.

La auditoría debe ser append-only desde la aplicación.

---

# 39. MOBILE-FIRST

La plataforma debe funcionar especialmente bien en teléfonos.

## 320–479 px

* Una columna.
* Botones grandes.
* Formularios cómodos.
* Sin scroll horizontal.
* CTA accesible.

## 480–767 px

* Una columna.
* Bloques compactos.

## 768–1199 px

* Dos columnas cuando sea conveniente.

## 1200+ px

* Composición editorial.
* Mayor densidad visual.
* Experiencia completa de escritorio.

---

# 40. COMPONENTES PRINCIPALES

```text
AudioHero
GenreMixer
StoryComposer
ReferenceRecorder
PriceDial
OrderTimeline
PrivatePlayer
CorrectionStudio
DownloadVault
ContactInbox
AdminDashboard
ProductionBrief
VersionManager
QualityControl
```

---

# 41. PRINCIPIOS DE ANIMACIÓN

Microinteracciones:

`120–220 ms`

Transiciones:

`220–420 ms`

Las animaciones deben comunicar:

* Estado.
* Feedback.
* Jerarquía.
* Progreso.

Debe existir soporte para:

`prefers-reduced-motion`

---

# 42. EXPERIENCIA DE MARCA

Nombre oficial:

# Melofilia

La plataforma debe transmitir:

> Música hecha a partir de historias que importan.

La experiencia debe sentirse:

**emocional + musical + tecnológica + humana**

No:

**plantilla + dashboard + IA genérica**

---

# 43. FLUJO GENERAL

```text
CLIENTE
   ↓
MELOFILIA
   ↓
CREAR CANCIÓN
   ↓
HISTORIA
   ↓
ESTILO
   ↓
REFERENCIAS OPCIONALES
   ↓
PRODUCTO
   ↓
RESUMEN
   ↓
PAGO
   ↓
NÚMERO DE PEDIDO
   ↓
PRODUCCIÓN
   ↓
CONTROL DE CALIDAD
   ↓
PREVIEW
   ↓
CORRECCIÓN ÚNICA
   ↓
VERSIÓN FINAL
   ↓
ENTREGA
   ↓
7 DÍAS DE DESCARGA
   ↓
EXPIRACIÓN
```

---

# 44. FLUJO ADMINISTRATIVO

```text
PEDIDO
   ↓
PRODUCTION BRIEF
   ↓
PRODUCCIÓN
   ↓
VERSIÓN
   ↓
CONTROL DE CALIDAD
   ↓
PREVIEW
   ↓
CORRECCIÓN
   ↓
VERSIÓN FINAL
   ↓
MASTER
   ↓
STEMS.ZIP
   ↓
ENTREGA
```

---

# 45. OBJETIVO FINAL

Melofilia debe convertirse en una plataforma completa para:

1. Captar clientes.
2. Explicar servicios.
3. Recibir historias.
4. Cobrar.
5. Generar pedidos.
6. Gestionar producción.
7. Producir canciones.
8. Revisar versiones.
9. Gestionar correcciones.
10. Entregar archivos.
11. Controlar descargas.
12. Atender consultas.
13. Recibir reviews.
14. Recibir sugerencias.
15. Administrar todo desde un panel seguro.

El resultado final debe sentirse como un **producto digital musical profesional**, no como una plantilla de sitio web.
