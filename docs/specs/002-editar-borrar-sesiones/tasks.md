# Tareas 002 — Editar y borrar sesiones

Estado: T1–T9 completadas; T10 pendiente del repaso a mano · Fecha: 2026-10-02
Spec: `spec.md` · Plan: `plan.md` · Constitución: `docs/constitution.md`

Reglas para todas las tareas:
- Cada tarea dura como máximo 20–30 min, deja la web funcionando y va en orden de
  dependencia. No se empieza una hasta tener la anterior marcada.
- En las tareas de lógica se escriben **primero los tests** (en rojo) y después el código
  hasta ponerlos en verde (P6).
- «Tests en verde» significa que `node --test` pasa entero y que `tests.html` no tiene
  ningún fallo.

## Fase 1 — Lógica pura (solo `logica.js` y `logica.test.js`)

- [x] **T1. Leer lo guardado y validar una edición.** RF-4, RF-5, RF-16
  Funciones `leerListaGuardada` y `validarEdicion` (plan 2.1, 2.2 y D7), con los casos de
  la tabla del plan, sección 6.
  - Hecho cuando: los tests de las dos funciones se han visto en rojo y ahora pasan, y
    `node --test` está en verde.

- [x] **T2. Localizar, editar y borrar una sesión.** RF-4, RF-7, RF-9, RF-14, RF-15, RF-18
  Funciones `mismaSesion`, `localizarSesion`, `editarSesion` y `borrarSesion` (plan 2.3 y
  3.1). Hay que probar que ninguna modifica la lista que recibe.
  - Hecho cuando: hay tests para la posición desplazada, la sesión que ya no existe, las
    sesiones idénticas y los campos extra, y `node --test` está en verde.

- [x] **T3. Borrar todas y preparar el guardado.** RF-11, RF-12, RF-13, RF-14, RF-15, RF-16, RF-18
  Funciones `borrarSesionesValidas`, `contarSesionesValidas` y `prepararGuardado` (plan
  2.3, 2.4, 3.2 y D8).
  - Hecho cuando: hay tests de `ilegible`, de `noExiste`, de una sesión añadida desde otra
    pestaña que se conserva y de una lista mixta en `borrarTodas`, y `node --test` está en
    verde.

- [x] **T4. Orden de la lista, textos y foco.** RF-1, RF-7, RF-8, RF-9, RF-11, RNF-2
  Funciones `ordenarParaLista`, `textoConfirmarBorrado`, `textoConfirmarBorrarTodas`,
  `nombreAccion` y `posicionFocoTrasBorrar` (plan 2.5).
  - Hecho cuando: los textos coinciden carácter a carácter con la spec, también en
    singular y plural, y `node --test` está en verde.

## Fase 2 — Interfaz (`app.js`, `index.html` y `styles.css`)

- [x] **T5. Lista con acciones y guardado seguro.** RF-1, RF-7, RF-14, RF-17, RF-19, RNF-2
  - `mostrarLista` usa `ordenarParaLista`. Las sesiones válidas llevan los botones
    «Editar» y «Borrar», todavía sin función, con su `aria-label`.
  - Se añade `guardarOperacion` en `app.js` (plan 3.3).
  - En `index.html` se añade la zona de avisos (`role="status"`) y `tabindex="-1"` en el
    título «Sesiones».
  - Hecho cuando: en el navegador la lista se ve en el mismo orden que antes, cada sesión
    válida tiene sus dos botones con el nombre accesible correcto, no hay errores en la
    consola y `node --test` está en verde.

- [x] **T6. Borrar una sesión.** RF-8, RF-9, RF-10, RF-15, RF-16, RF-17, RF-19
  - Se añade el `<dialog>` a `index.html`, y el botón «Borrar» lo abre (plan 3.4 y 4.2).
  - Al abrirse, el foco empieza en «Cancelar», y tras cerrarse va adonde dice
    `posicionFocoTrasBorrar`.
  - Hecho cuando: a mano, borrar, cancelar y pulsar Escape se comportan como dice la spec.
    Con dos sesiones idénticas solo se borra una. Con dos pestañas abiertas aparece el
    aviso de RF-15. Con datos corruptos en la clave aparece el aviso de RF-16.

- [x] **T7. Editar una sesión.** RF-2, RF-4, RF-5, RF-6, RF-7
  - «Editar» convierte la fila en un `<form novalidate>` con fecha, tema y minutos, y los
    botones «Guardar» y «Cancelar» (plan 3.3 y 4.1).
  - Los errores salen en la fila con `role="alert"`. Enter guarda y Escape cancela.
  - Hecho cuando: a mano se cumplen todos los casos límite de edición de la spec (tema
    con espacios, minutos 0, 4.5 y vacíos, dos errores a la vez, cambio de fecha), y el
    foco va adonde dicen RF-2, RF-4 y RF-6.

- [x] **T8. Bloqueo durante la edición y «Borrar todas las sesiones».** RF-3, RF-11, RF-12, RF-13
  - Mientras hay una edición abierta se desactivan las acciones de las demás filas, «Borrar
    todas» y «Guardar sesión».
  - Se añade el botón «Borrar todas las sesiones» con su confirmación (plan 3.4 y 4.3).
  - Hecho cuando: a mano no se puede pulsar ninguna de esas acciones durante una edición.
    «Borrar todas», con una sesión no válida guardada desde la consola, la conserva. El
    botón está desactivado cuando no queda ninguna sesión válida. El texto de la
    confirmación usa singular y plural.

- [x] **T9. Estilos.** RNF-1, RNF-3
  Acciones de cada fila, fila en edición, errores, diálogo y estado desactivado (plan 4.4).
  - Hecho cuando: a 375 px no hay desplazamiento horizontal ni en la lista ni con una fila
    en edición ni con el diálogo abierto, cada botón mide al menos 44 × 44 px y todo se
    puede usar solo con teclado.

## Fase 3 — Cierre

- [ ] **T10. Repaso final.** Todos los RF y RNF
  - Recorrer a mano en el navegador todos los casos límite de la spec, incluido el
    almacenamiento lleno (RF-17).
  - Marcar los criterios de finalización de la spec y poner la spec en «implementada».
  - Actualizar `MEMORY.md`.
  - Hecho cuando: todos los casos están marcados como comprobados, `node --test` está en
    verde, `tests.html` no tiene fallos y no hay errores en la consola.
  - Avance (2026-10-02):
    - Comprobado automáticamente: `node --test` (88/88) y `tests.html` (88 pasados).
    - Recorrido en Chrome headless a 375 px, con 48 comprobaciones correctas:
      - todos los casos de T5 a T9;
      - las dos sesiones idénticas, los errores de edición, el cambio y la fecha
        futura;
      - otra pestaña, datos corruptos y almacenamiento lleno;
      - borrar todas, singular y plural, y la última sesión;
      - la racha tras borrar, Enter, Escape y el foco;
      - tamaño de los botones y que no haya desplazamiento horizontal.
    - Falta a mano:
      - un vistazo visual;
      - navegar solo con Tab;
      - el modo de alto contraste;
      - guardar sin cambios y pasar la medianoche con la página abierta (cubiertos
        solo por los tests de lógica y por el código).
