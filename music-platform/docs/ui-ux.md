# UI/UX — Plataforma de Música Personalizada

## Principio de diseño

La experiencia no debe parecer una plantilla genérica generada por IA. La interfaz debe sentirse como un producto musical digital propio: editorial, emocional, táctil y visualmente dinámica.

## Objetivos

- Mobile-first real, desde 320px hasta escritorio amplio.
- Interacciones visibles y útiles, no decoración gratuita.
- Audio como elemento central de la experiencia.
- Animaciones cortas y suaves, respetando `prefers-reduced-motion`.
- Jerarquía visual fuerte con espacios amplios y tipografía expresiva.
- Evitar el patrón repetitivo de hero + tres cards + gradientes + dashboard genérico.
- Usar visualizaciones de audio: waveform, espectro, pulsos y progreso.
- Formularios tipo conversación/stepper en lugar de formularios administrativos largos.

## Landing `/`

### Hero

- Mensaje centrado en la transformación: una historia del cliente convertida en canción.
- Demo interactiva con reproductor y waveform.
- Selector rápido de género que cambia el demo y microcopy.
- CTA principal `Crear mi canción`.
- CTA secundario `Ver cómo funciona`.

### Secciones

1. Demo antes/después por género.
2. Constructor visual de precio.
3. Proceso en una línea temporal animada.
4. Ejemplos de historias convertidas en canciones.
5. Comparador Express vs Semi-Pro.
6. Seguridad y entrega digital explicadas visualmente.
7. FAQ.

## Constructor `/crear`

El constructor se comporta como una experiencia guiada.

### Paso 1 — La ocasión

- Tarjetas táctiles para cumpleaños, aniversario, homenaje, amistad, propuesta, recuerdo y otra.
- Campo libre para ocasión personalizada.

### Paso 2 — La historia

- Textarea amplio y cómodo para móvil.
- Contador de caracteres.
- Sugerencias contextuales sin rellenar automáticamente contenido del cliente.

### Paso 3 — Identidad musical

- Género.
- Estado emocional.
- Intensidad.
- Opcionalmente referencias de audio.

### Paso 4 — Referencias opcionales

Dos módulos independientes:

- Ritmo: grabar/subir.
- Voz: grabar/subir.

El usuario puede continuar sin ninguna referencia.

### Paso 5 — Producto

Selector visual Express / Semi-Pro con precio actualizado en vivo.

### Paso 6 — Resumen y pago

Resumen compacto, desglose de precio y confirmación antes de salir hacia la pasarela.

## Portal `/pedido/:orderNumber`

Debe sentirse como una sala privada de escucha, no como una ficha administrativa.

- Número de pedido destacado.
- Estado como timeline visual.
- Reproductor grande.
- Waveform interactiva.
- Indicador de versión.
- Panel de corrección cuando corresponda.
- Contador claro: `1 corrección incluida` o `Corrección utilizada`.
- Ventana de descarga: fecha y tiempo restante.
- Botones de descarga que solicitan autorización al backend.

## Visualizaciones

### Waveform

Debe responder al audio real cuando exista. Para previews sin waveform precalculada, se puede renderizar una representación temporal del audio desde el cliente sin transmitir archivos privados a terceros.

### Progreso del pedido

No usar un spinner permanente. Mostrar etapas con estado actual, fecha y una explicación breve.

### Precio

El total debe actualizarse con microanimación cuando el cliente cambia producto o complementos.

## Responsive

- 320–479px: una columna, controles grandes y CTA fijo dentro del flujo, sin barras horizontales.
- 480–767px: una columna con bloques compactos.
- 768–1199px: dos columnas cuando el contenido lo permita.
- 1200px+: composición editorial con máximo aprovechamiento del espacio.

## Accesibilidad

- Contraste WCAG AA como mínimo.
- Foco visible.
- Labels asociados a todos los controles.
- `aria-live` para cambios de precio y estados.
- Controles de audio accesibles.
- Soporte `prefers-reduced-motion`.
- No depender únicamente del color para indicar estados.

## Regla visual

La interfaz debe priorizar contenido, audio e interacción. Las sombras, gradientes y efectos de brillo son secundarios y no deben convertirse en el lenguaje principal del producto.
