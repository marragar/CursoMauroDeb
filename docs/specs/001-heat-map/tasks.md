# Tareas 001 — Mapa de calor de estudio

Estado: completadas · Fecha: 2026-10-02
Spec: `spec.md` · Plan: `plan.md` · Constitución: `docs/constitution.md`

Cada tarea dura como máximo 20–30 min, deja la web funcionando y va en orden de
dependencia: no se empieza una hasta tener la anterior marcada. En las tareas de lógica se
escriben **primero los tests** (en rojo) y después el código hasta ponerlos en verde (P4).
«Tests en verde» significa que `node --test` pasa entero.

## Antes de empezar

- [x] **T0. Acotar el criterio de consola de RF-11** (riesgo 1 del plan).
  Cubre: RF-11.
  Hecho cuando: RF-11 y la sección 9 de `spec.md` dicen que, con datos corruptos, el mapa
  no provoca errores en la consola, y que los errores del resto de la página quedan fuera
  de alcance (sección 8).

## Fase 1 — Separar la lógica (sin cambios visibles)

- [x] **T1. Crear `logica.js` con las funciones de fecha y su primer test.**
  Primero `logica.test.js` (compatible con Node y con el navegador, plan 6.2) con tests de
  `fechaATexto`, `textoAFecha`, `diaAnterior` y `fechaBonita`. Después, mover esas cuatro
  funciones de `app.js` a `logica.js` sin cambiarlas, con exportación condicional para
  Node, y cargar `logica.js` antes que `app.js` en `index.html`.
  Cubre: base de RF-1 y RF-5 (fechas locales, RNF-10, RNF-11).
  Hecho cuando: `node --test` pasa, y `index.html` abierto con doble clic se ve y funciona
  igual que antes, sin errores en la consola.

- [x] **T2. Crear `tests.html`.**
  Con un mini `test` / `assert` propio (`strictEqual`, `deepStrictEqual`), que carga
  `logica.js` y `logica.test.js` y pinta cada caso en verde o rojo, con el total.
  Cubre: P4 (sin RF).
  Hecho cuando: con doble clic en `tests.html` se ven en verde los mismos tests que en
  `node --test`. Si se rompe uno a propósito, se ve en rojo.

- [x] **T3. `calcularRacha(sesiones, hoy)` en la lógica.**
  Tests primero: sin sesiones; racha que termina hoy; hoy sin sesión y ayer sí; hueco;
  varias sesiones el mismo día; fechas futuras; cambio de mes. Después, moverla a
  `logica.js` con el parámetro `hoy` y que `app.js` le pase `fechaATexto(new Date())`.
  Cubre: P3 y P4 (RNF-10).
  Hecho cuando: los tests están en verde y la racha de la web muestra lo mismo que antes
  con los mismos datos.

- [x] **T4. `calcularDiasDelMes(sesiones, hoy)` en la lógica.**
  Tests primero: sin sesiones; varias sesiones el mismo día; fechas futuras; sesiones de
  otro mes. Después, moverla con el parámetro `hoy`, igual que T3.
  Cubre: P3 y P4 (RNF-10).
  Hecho cuando: los tests están en verde y el contador del mes muestra lo mismo que antes.

- [x] **T5. Comprobar el cierre de la fase 1.**
  Cubre: plan, fase 1.
  Hecho cuando: `app.js` ya no define ninguna función de cálculo de fechas, racha ni mes;
  la web se comporta igual (con datos, sin datos y en móvil), sin errores en la consola;
  `node --test` y `tests.html` están en verde.

## Fase 2 — Lógica del mapa (tests primero)

- [x] **T6. `sumarDias` y `diaDeLaSemana`.**
  Tests: +1 a fin de mes y a fin de año; −1 el 1 de enero; 2028-02-28 + 1 = 2028-02-29;
  +1 los días del cambio de hora (2026-03-29 y 2026-10-25); lunes → 0, domingo → 6.
  Cubre: RF-1.
  Hecho cuando: los tests están en verde.

- [x] **T7. `calcularPeriodo(hoy)`.**
  Tests: 2026-10-01 → 2026-07-13 a 2026-10-04; 2026-10-05 → 2026-07-20 a 2026-10-11;
  2026-10-04 → 2026-07-13 a 2026-10-04; 2028-03-02 → 2027-12-13 a 2028-03-05.
  Cubre: RF-1.
  Hecho cuando: los tests están en verde.

- [x] **T8. `esFechaValida` y `esSesionValida`.**
  Tests: fechas y sesiones válidas; `"2026-02-30"`, `"2026-9-5"`, `null` y un número no
  son fechas válidas; minutos `0`, `-10`, `12.5` y `"30"` no son válidos; el objeto
  `{ id, fecha, tema, minutos }` no es válido.
  Cubre: RF-9.
  Hecho cuando: los tests están en verde.

- [x] **T9. `minutosPorDia(sesiones, inicio, fin)`.**
  Tests: 20 + 15 el mismo día = 35; con hoy = 2026-10-01, entra la sesión del 2026-07-13 y
  no las del 2026-07-12 ni del 2026-10-05; las sesiones no válidas se ignoran.
  Cubre: RF-2, RF-9.
  Hecho cuando: los tests están en verde.

- [x] **T10. `nivelDeMinutos(minutos)`.**
  Tests: 0, 1, 29, 30, 59, 60, 119, 120 y 900 → 0, 1, 1, 2, 2, 3, 3, 4, 4.
  Cubre: RF-3.
  Hecho cuando: los tests están en verde.

- [x] **T11. `tipoDeDia` y `textoDetalle`.**
  Tests: ayer → «pasado», hoy → «hoy», mañana → «futuro»; los cinco textos exactos de la
  tabla de RF-5.
  Cubre: RF-4, RF-5.
  Hecho cuando: los tests están en verde.

- [x] **T12. `construirMapa(sesiones, hoy)`.**
  Tests: 12 semanas × 7 días = 84 días consecutivos; primer y último día correctos; día
  futuro con sesión → nivel vacío; hoy con tipo «hoy»; sin sesiones → todos los días
  pasados y hoy en nivel 0; 5.000 sesiones en menos de 200 ms.
  Cubre: RF-1 a RF-5, RF-9, RF-10 (tipo «hoy»), RNF-8.
  Hecho cuando: los tests están en verde.

- [x] **T13. `moverSeleccion(fecha, tecla, inicio, fin)`.**
  Tests: las cuatro flechas; no sale del primer lunes ni del último domingo; arriba en
  lunes y abajo en domingo no se mueve.
  Cubre: RNF-6.
  Hecho cuando: los tests están en verde.

- [x] **T14. `interpretarDatosGuardados(texto)`.**
  Tests: `null`, `""`, `"{roto"`, `"{}"` y `"5"` → `[]`; una lista válida se devuelve igual.
  Cubre: RF-11.
  Hecho cuando: los tests están en verde y la función no lanza errores con ninguna de esas
  entradas.

- [x] **T15. Comprobar el cierre de la fase 2.**
  Cubre: RNF-11.
  Hecho cuando: todos los casos de la tabla 6.3 del plan existen y están en verde en
  `node --test` y en `tests.html`, y ninguna función de `logica.js` llama a `new Date()`
  sin argumentos, a `toISOString()` ni a `new Date("AAAA-MM-DD")`.

## Fase 3 — Interfaz

- [x] **T16. Estructura HTML del mapa.**
  Sección entre el resumen y el formulario con el título «Últimas 12 semanas», las 7
  iniciales, el contenedor vacío de la cuadrícula, la línea de detalle con
  `aria-live="polite"` y la leyenda (5 niveles con su rango, «futuro» y «hoy»).
  Cubre: RF-1 (posición y título), RF-6, RF-7, RNF-7, RNF-12.
  Hecho cuando: al abrir la página se ven el título, las iniciales, la línea de detalle y
  la leyenda en su sitio, con los textos en español, y el resto de la web sigue igual.

- [x] **T17. Dibujar las casillas (`mostrarMapa` y `leerSesionesParaMapa`).**
  En `app.js`: calcular hoy, leer los datos de forma segura, llamar a `construirMapa` y
  crear un `<button>` por día con su clase (nivel o «futuro»), «hoy» con
  `aria-current="date"`, nombre accesible = detalle, `tabindex` itinerante, y escribir el
  detalle de hoy. `mostrarTodo()` llama a `mostrarMapa()` la primera.
  Cubre: RF-1, RF-3, RF-4, RF-5 (detalle de hoy), RF-8, RF-10, RF-11, RNF-3.
  Hecho cuando: aparecen 84 botones y el primero y el último corresponden al periodo de
  hoy; al guardar una sesión el mapa se redibuja sin recargar; el mapa nunca llama a
  `localStorage.setItem` ni a `removeItem`.

- [x] **T18. Estilos de la cuadrícula y de las iniciales.**
  CSS Grid de 7 filas rellenada por columnas, iniciales a la izquierda, casillas
  cuadradas con 2–3 px de separación y scroll horizontal solo dentro del mapa.
  Cubre: RF-1, RF-7, RNF-1, RNF-2.
  Hecho cuando: a 375 px las casillas miden al menos 24 × 24 px (medido en DevTools) y no
  hay scroll horizontal de la página a 375 ni a 320 px.

- [x] **T19. Estilos de niveles, «futuro», «hoy», foco y leyenda.**
  Escala de la tinta azul; nivel 0 solo borde; futuro con borde discontinuo; contorno
  propio para hoy; contorno amarillo para el foco; leyenda con las mismas muestras.
  Cubre: RF-3, RF-4, RF-6, RF-10, RNF-3, RNF-4.
  Hecho cuando: cada nivel es visiblemente más oscuro que el anterior; el borde, los
  niveles 1–4 y el contorno de hoy tienen contraste ≥ 3:1 con el papel (medido); nivel 0,
  futuro y hoy se distinguen por el borde.

- [x] **T20. Detalle con clic, toque y ratón.**
  Delegación en el contenedor: clic o toque selecciona y muestra el detalle; pasar el
  ratón lo muestra sin seleccionar; al salir del mapa vuelve el del seleccionado o el de
  hoy; al redibujar se quita la selección.
  Cubre: RF-5.
  Hecho cuando: se cumplen los cuatro comportamientos de RF-5 probándolos en el navegador,
  y tras guardar una sesión el detalle vuelve a ser el de hoy.

- [x] **T21. Teclado.**
  Flechas con `moverSeleccion`, foco en la casilla nueva (que pasa a ser la seleccionada)
  y sin scroll de la página; Tab sale del mapa.
  Cubre: RF-5 (llegar con el teclado), RNF-6, RNF-7.
  Hecho cuando: solo con teclado, el mapa es una única parada de Tab, las flechas recorren
  el periodo sin salirse, el foco siempre se ve y el detalle cambia con cada flecha.

- [x] **T22. Alto contraste del sistema.**
  Bloque `@media (forced-colors: active)`.
  Cubre: RNF-5.
  Hecho cuando: emulando colores forzados en DevTools se distinguen «con estudio», «sin
  estudio», «futuro» y «hoy».

## Fase 4 — Verificación y documentación

- [x] **T23. Verificar con datos.**
  Cubre: RF-1 a RF-11, RNF-8, RNF-9.
  Hecho cuando: comprobado en el navegador con datos, sin datos, con datos corruptos
  (`"{roto"`, `"{}"`, valor vacío) y con 5.000 sesiones, sin errores del mapa en la
  consola; y el valor de `diario-estudio-sesiones` es idéntico, byte a byte, antes y
  después de usar el mapa.

- [x] **T24. Verificar móvil, zoom y accesibilidad.**
  Cubre: RNF-1, RNF-2, RNF-3, RNF-6, RNF-7, RNF-12.
  Hecho cuando: comprobado a 375 y 320 px, con texto al 200 %, solo con teclado y con el
  árbol de accesibilidad de DevTools (cada casilla tiene su detalle como nombre y la línea
  de detalle se anuncia), sin solapes ni scroll horizontal de la página.

- [x] **T25. Documentación.**
  Cubre: spec, sección 9 (último criterio).
  Hecho cuando: `spec.md` refleja el comportamiento final y tiene sus criterios de
  finalización marcados; `CLAUDE.md` incluye `logica.js`, `logica.test.js` y `tests.html`
  en *Stack y estructura* y explica cómo pasar los tests en *Verificación*; `MEMORY.md`
  está actualizado.
