# VinTracker Aventura 2.0.1 — Expedición Chaco

Una aventura educativa para aprender sobre Chagas explorando, transformando escenas y observando consecuencias. La nueva experiencia tiene cuatro misiones abiertas desde el inicio.

| Lugar | Qué hace quien juega | Qué aprende |
| --- | --- | --- |
| La casa | Aplica herramientas, revisa cuatro zonas y compara la casa antes y después. | Mejoras que ayudan a reducir posibles refugios y el papel del acompañamiento adulto. |
| La exploración | Mueve una linterna virtual, observa tres zonas y descubre pistas. | Observar con cuidado y pedir ayuda; una pista no confirma un insecto. |
| El laboratorio | Controla animaciones, recorre tres historias y amplía una imagen oficial del ciclo de vida. | Diferencias entre vector y parásito, transmisión, cuidados y convivencia sin discriminación. |
| El puesto de salud | Practica un aviso, una foto ilustrada, ubicación ficticia, guardado y conexión simulada. | Cómo organizar un registro y distinguir guardado local de recepción por un servidor. |

La bitácora reúne los sellos y seis recursos de consulta. Está disponible desde el principio. Las misiones no contienen preguntas de opción múltiple ni penalizaciones por equivocarse.

## Corrección de imágenes — versión 2.0.1

Las imágenes del mapa, la casa y el laboratorio están incorporadas dentro de `index.html`. Así se muestran aunque la carpeta `assets` no esté en el despliegue. La caché nueva descarga 10 recursos y no necesita solicitar esas imágenes por separado. Se mantiene el progreso de Aventura 2.0.

## Publicar en el proyecto existente

1. Descomprimí el ZIP.
2. Abrí el repositorio de GitHub conectado a **vintracker-aventura.vercel.app**.
3. Subí el **contenido descomprimido** a la raíz del proyecto, reemplazando los archivos existentes. `index.html` debe quedar en la raíz, junto a `app.js`, `learning.js`, `styles.css`, `sw.js`, `manifest.json` y `vercel.json`. Conservá los cuatro iconos de la raíz. Las imágenes de las escenas ahora están incorporadas en `index.html`; la carpeta `assets` conserva los originales para edición.
4. Guardá los cambios en la rama que Vercel usa para producción. Con la integración de Git activa, esto genera el despliegue.
5. Esperá que termine y abrí la dirección de Aventura. Si aparece la pantalla anterior, cerrá todas las pestañas de Aventura y la app instalada, reabrí y recargá para recibir la actualización.

Este paquete actualiza Aventura, la aplicación educativa independiente. El simulador incluido no está conectado al servidor de reportes de la aplicación principal.

Es un sitio estático: no necesita claves, base de datos ni compilación. Si fuera necesario revisar la configuración de Vercel, usá **Framework Preset: Other**, directorio raíz del proyecto, sin comando de compilación y salida estática desde la raíz. `tests/package.json` pertenece únicamente a las pruebas, no al sitio.

Referencias de publicación: [integración de Git de Vercel](https://vercel.com/docs/git) y [configuración de compilación](https://vercel.com/docs/builds/configure-a-build).

## Probar antes de publicar

La vista previa HTML entregada por separado contiene las escenas y sus imágenes en un único archivo. Descargala y abrila en un navegador. Usa un progreso de prueba separado y no instala una PWA.

Para ejecutar el proyecto completo en una computadora con Python:

```bash
python3 -m http.server 4173
```

Abrí `http://localhost:4173`. La descarga offline requiere HTTPS o localhost. Abrir `index.html` directamente desde el explorador de archivos no permite comprobar el service worker.

## Progreso, accesibilidad y conexión

- Guarda en este navegador las acciones completadas, los sellos, las etapas del ciclo exploradas y las preferencias. No sincroniza entre dispositivos.
- Mantiene los datos de la versión anterior. La expedición nueva tiene su propio progreso.
- Permite tocar una herramienta y su destino; arrastrar es opcional. Los controles usan botones y entradas nativas para teclado.
- Incluye luz completa como alternativa a la linterna, texto ampliado, movimiento reducido y reconocimiento de la preferencia de movimiento del sistema.
- Los sonidos se activan por elección. La lectura en voz alta depende de las voces del dispositivo y puede necesitar conexión según el sistema.
- Después de una descarga completa, el sitio guarda las imágenes, las misiones y la bitácora para uso sin conexión. Los enlaces oficiales externos necesitan Internet. El navegador puede retirar la caché si se borran datos o falta espacio.
- El reporte es una simulación explícita: no usa cámara, GPS ni datos personales y no envía reportes reales.

## Verificación de esta entrega

**24 simulacros automáticos aprobados, 0 fallidos.** Cubren interacciones del DOM, progreso, recorridos completos, interrupciones y lógica de caché. Ver `PRUEBAS.md` para el alcance y los pasos pendientes.

La comprobación visual en un navegador real y el modo avión en teléfonos no pudieron ejecutarse aquí: la política del navegador bloqueó el acceso a los archivos locales. Las simulaciones no certifican compatibilidad con todos los dispositivos.

Para repetir las pruebas con Node.js compatible con jsdom 26:

```bash
npm --prefix tests ci
npm --prefix tests test
```

La aplicación no necesita estas dependencias para funcionar.

## Contenido y recursos

Fuentes: [vinchuca y ciclo de vida](https://www.argentina.gob.ar/salud/chagas/chagas-y-la-vinchuca), [prevención](https://www.argentina.gob.ar/salud/chagas/el-chagas-se-puede-prevenir), [embarazo](https://www.argentina.gob.ar/salud/chagas/chagas-y-embarazo), [qué es el Chagas](https://www.argentina.gob.ar/salud/chagas/que-es-el-chagas) del Ministerio de Salud de la Nación, y [ficha de la OMS](https://www.who.int/es/news-room/fact-sheets/detail/chagas-disease-(american-trypanosomiasis)).

`assets/ciclo-vinchuca-oficial.jpg` conserva sin modificaciones el [recurso del Ministerio de Salud](https://www.argentina.gob.ar/sites/default/files/ciclo_vida_vinchuca.jpg). Las tres ilustraciones WebP de comunidad y vivienda fueron creadas con IA para esta propuesta: son escenarios recreados, no un mapa geográfico ni material de identificación de insectos. La comparación de la casa muestra cambios en la pared y la leña; el techo y la distancia del gallinero se exploran mediante explicaciones.

La prevención también necesita acompañamiento comunitario y del Estado. Las tareas reales de reparación corresponden a adultos y el control con insecticidas a personal capacitado. El juego no identifica insectos ni diagnostica personas.
