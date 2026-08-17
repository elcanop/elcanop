# Consola interna de producción

## Objetivo

La plataforma separa la experiencia comercial del cliente de la herramienta interna utilizada para producir las canciones. El proveedor/motor de producción es un detalle interno y no forma parte de la interfaz pública.

La interfaz pública debe hablar de `producción`, `revisión`, `versión`, `calidad` y `entrega`. No debe mostrar nombres, enlaces, cuentas, prompts internos ni credenciales del proveedor.

Esto no implica atribuir falsamente un proceso humano o una tecnología concreta al cliente. La comunicación comercial debe mantenerse veraz y no debe afirmar características que el servicio no ofrece.

## Consola `/admin/production`

La consola debe permitir tomar un pedido y convertirlo rápidamente en un `Production Brief` listo para ejecutar.

### Datos de entrada

- Número de pedido.
- Producto: Express / Semi-Pro.
- Género principal.
- Subgénero.
- Ocasión.
- Estado emocional.
- Intensidad.
- Tempo/BPM aproximado cuando se pueda inferir.
- Instrumentación deseada.
- Instrumentación a evitar.
- Tipo de voz/género vocal.
- Idioma.
- Estructura: intro, verso, pre-coro, coro, puente, outro, etc.
- Historia del cliente.
- Nombres y palabras obligatorias.
- Letra aprobada.
- Referencia rítmica, si existe.
- Referencia vocal, si existe.
- Notas del productor.
- Objetivo de duración.

### Campos de producción

La consola debe tener un panel de parámetros completo y compacto para preparar manualmente el trabajo en la herramienta de producción.

Cuando las capacidades actuales de la herramienta lo permitan, el brief puede contemplar controles equivalentes a Custom Mode, Styles, Advanced options, Instrumental, audio upload/influence, Style Influence y Weirdness. No se debe asumir que una integración automática existe si el proveedor no ofrece una API o mecanismo oficialmente permitido.

## Suno como herramienta interna

La producción actual se realizará utilizando Suno de forma interna. La plataforma propia no debe depender de scraping, automatización de navegador no autorizada ni acceso a interfaces privadas de Suno.

La primera versión debe generar un `Production Brief` y acciones de copia rápida para que el productor pueda trasladar los parámetros al flujo de creación de Suno de forma eficiente.

### Exportación del brief

El sistema debe generar:

1. `Title`
2. `Lyrics`
3. `Style / style description`
4. `Negative / exclusions`
5. `Vocal direction`
6. `Instrumentation`
7. `Mood`
8. `Tempo / BPM target`
9. `Structure`
10. `Audio reference notes`
11. `Production notes`
12. `QC checklist`

Cada bloque debe tener botón `Copiar` individual y `Copiar todo`.

## Optimización para producción rápida

La consola debe evitar que el productor navegue por diez pantallas. En una sola vista debe poder:

- Leer el pedido.
- Escuchar las referencias.
- Ver la letra.
- Ajustar parámetros.
- Generar el brief.
- Copiar los campos.
- Registrar versión.
- Subir el resultado generado.
- Marcar calidad.

## Versionado

Cada intento de producción debe registrar:

- `version_number`.
- Fecha/hora.
- Productor.
- Parámetros usados.
- Letra utilizada.
- Archivos resultantes.
- Notas de calidad.
- Resultado: `REJECTED`, `INTERNAL_REVIEW`, `CLIENT_REVIEW`, `FINAL`.

Nunca sobrescribir silenciosamente una versión anterior.

## Control de calidad

Antes de mostrar una versión al cliente:

- Validar nombres y palabras obligatorias.
- Revisar pronunciación.
- Revisar cortes y artefactos.
- Revisar volumen y clipping.
- Confirmar que la versión corresponde al pedido.
- Confirmar que no contiene material de otro cliente.
- Registrar la versión como candidata a revisión del cliente.

## Privacidad

Los prompts internos, notas del productor, parámetros de generación, referencias privadas y metadatos del proveedor son información interna. El portal del cliente solamente expone la información necesaria para revisar y recibir su producto.

## Dependencia de Suno

La arquitectura debe tratar el motor de producción como un proveedor reemplazable. Si posteriormente existe una API oficial adecuada o se cambia de proveedor, se puede añadir un adaptador sin modificar el modelo de pedidos ni la experiencia del cliente.
