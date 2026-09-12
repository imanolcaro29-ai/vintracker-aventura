# Verificación — Aventura 2.0

Fecha: 12 de septiembre de 2026.

## Resultado ejecutado

22 pruebas aprobadas, 0 fallidas, 0 omitidas. Se usa el código real de `app.js`, `learning.js`, `index.html` y `sw.js` dentro de simuladores locales de DOM y service worker. El resultado reproducible queda en `tests/resultado.txt`.

| Grupo | Escenarios verificados |
| --- | --- |
| Inicio y recursos | Mapa con cuatro entradas, ayuda, seis recursos disponibles, archivos e iconos presentes. |
| Casa | Herramienta incorrecta, aplicación correcta, evento de arrastrar y soltar, repetición sin duplicados, comparación antes/después y recuperación de una misión parcial. |
| Exploración | Movimiento de la luz al recibir foco, interruptor de iluminación, registro de tres zonas y ausencia de duplicados. |
| Laboratorio | Reproducción, pausa, reinicio, desplazamiento por etapas, cancelación del temporizador al salir, ampliación de imagen y recuperación de etapas exploradas. |
| Práctica de reporte | Foto ficticia, encuadre, ubicación ficticia, guardado pendiente, conexión interrumpida, envío simulado, recarga y salida durante el envío. No se invocan cámara, GPS ni envío de red. |
| Expedición | Recorrido completo por las cuatro misiones, sellos, transición a bitácora y recuperación tras recargar. |
| Persistencia | Datos dañados, entradas desconocidas, deduplicación, fallo de almacenamiento, reinicio confirmado, conservación de preferencias y del progreso v1. |
| Semántica | Identificadores únicos, botones con nombre, imágenes con atributo alternativo, entradas etiquetadas y dimensiones explícitas de iconos. |
| Audio y movimiento | Preferencias de sonido y movimiento guardadas; sin reproducción automática al abrir. Mensaje alternativo cuando la lectura de voz no existe. |
| Descarga offline | El estado espera la activación y muestra el fallo si la instalación no se completa. |
| Caché | Inclusión de los 14 recursos requeridos, instalación fallida sin activación, limpieza exclusiva de cachés Aventura, respuestas offline y navegación, solicitudes externas y POST sin interceptar. |

El test de arrastrar dispara los eventos del DOM; no reproduce el gesto físico de una pantalla táctil. Los diálogos, el reloj, la caché y el dispositivo de audio se simulan. El test semántico no equivale a una auditoría de accesibilidad completa.

## Comprobaciones pendientes en dispositivos reales

No se pudo abrir la nueva interfaz con el navegador de revisión: se bloqueó el acceso a los archivos locales. Por eso no se presentan capturas de pantalla como prueba ni se afirma una validación visual de Chrome, Safari o de un teléfono.

Después del despliegue:

1. En un teléfono y una computadora, abrí cada misión y revisá que texto y controles se vean sin superposición ni desplazamiento horizontal. Probá también texto ampliado.
2. Completá una mejora de la casa, cerrá y reabrí. Debe conservarla. Tocá herramienta y destino; en computadora probá además arrastrar.
3. Recorré los controles con Tab, Enter y las flechas de los deslizadores. Abrí y cerrá los diálogos y verificá que el foco permanezca visible.
4. Mové la linterna con el dedo y probá el botón de luz completa.
5. Reproducí y pausá el laboratorio; ampliá la imagen del insecto y elegí sus tres etapas.
6. Guardá un registro de práctica sin activar su conexión. Salí, volvé y conectalo. Debe indicar que es una simulación.
7. Esperá el mensaje «Lista para explorar sin conexión». Activá modo avión, cerrá y reabrí la app. Verificá las cuatro misiones y la bitácora. Esta es la prueba real de la PWA.
8. Probá la instalación y la lectura de voz en el dispositivo de destino. La voz depende del sistema; el texto debe permanecer disponible.

No se midieron mejoras de aprendizaje con estudiantes ni se realizó una evaluación clínica. La entrega implementa la nueva experiencia y verifica su lógica; la evaluación educativa en aula es una etapa distinta.
