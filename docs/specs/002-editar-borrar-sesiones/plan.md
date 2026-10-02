# Plan 002 — Editar y borrar sesiones

Estado: aprobado (2026-10-02) · Fecha: 2026-10-02
Spec: `docs/specs/002-editar-borrar-sesiones/spec.md` (aprobada) · Constitución:
`docs/constitution.md`

Este plan explica **cómo** se construye lo que la spec define. No contiene código: solo
responsabilidades, firmas de funciones y pseudocódigo. Los números «P» son los principios
de la constitución.

## 0. Resumen

- **Formato de datos sin cambios.** No se añade ningún campo nuevo a las sesiones (P9).
  Cada sesión se identifica por su posición en la lista guardada más una copia exacta de
  su contenido (decisión D1).
- **Lógica pura en `logica.js`.** Validar, localizar, editar, borrar, preparar el
  guardado y los textos de confirmación son funciones puras: reciben la lista y devuelven
  una lista nueva, sin DOM ni `localStorage` (P4).
- **Interfaz en `app.js`.** Pinta la fila en modo edición, el diálogo de confirmación y
  los avisos, y gestiona el foco. Es lo único que lee y escribe `localStorage` (P5).
- **Releer antes de escribir.** Cada guardado vuelve a leer `localStorage` justo antes y
  aplica el cambio sobre esos datos. Así no se pierde nada que haya escrito otra pestaña
  (P8).
- **Sin archivos nuevos y sin dependencias** (P1).

## 1. Archivos

| Archivo | Acción | Responsabilidad | RF |
|---|---|---|---|
| `logica.js` | Modificar | Funciones puras nuevas de la sección 2. Las que ya existen no cambian. | 1, 4, 5, 7, 8, 9, 11, 12, 14–16, 18, RNF-2 |
| `logica.test.js` | Modificar | Tests de cada función nueva (sección 6). | — |
| `app.js` | Modificar | Estado de la edición, pintar la lista con sus acciones y la fila en edición, diálogo de confirmación, leer y guardar con control de errores, avisos y foco. | 1–19 |
| `index.html` | Modificar | En la sección «Sesiones»: zona de avisos, botón «Borrar todas las sesiones» y un único `<dialog>` de confirmación. `id` en el botón «Guardar sesión» y en el título de la lista. | 3, 8, 10, 11, 13, 15–17 |
| `styles.css` | Modificar | Acciones de cada fila, fila en edición, mensajes de error, diálogo, estado desactivado y botones de 44 × 44 px a 375 px. | RNF-1, RNF-3 |
| `MEMORY.md` | Modificar | Estado y decisiones al terminar cada fase. | — |

`tests.html` no cambia: ya carga `logica.js` y `logica.test.js`.

## 2. Funciones puras de lógica (`logica.js`)

Convenciones:
- Ninguna función nueva modifica la lista que recibe; siempre devuelven una lista nueva.
- Las sesiones se copian con todos sus campos, también los que no conocemos (RF-18).
- **Ninguna función nueva depende de «hoy».** Lo que depende de hoy (racha, mes, mapa) ya
  lo recibe como parámetro y se recalcula en `mostrarTodo()` (spec: «Actualizar todo»).
  Las fechas siguen la skill `local-dates` (P7): se reutilizan `esFechaValida` y
  `fechaBonita`.

### 2.1 Leer lo guardado

| Función | Entrada → salida | RF |
|---|---|---|
| `leerListaGuardada(texto)` | texto o `null` → `{ ok: true, sesiones }` o `{ ok: false }`. `null` o `""` cuentan como lista vacía y es correcto. Un JSON roto o algo que no es una lista devuelve `ok: false`. | 16 |

Hace falta porque `interpretarDatosGuardados` (spec 001) devuelve `[]` tanto si no hay
datos como si están corruptos. Para escribir hay que distinguir los dos casos: escribir
encima de datos corruptos los borraría (P8). `interpretarDatosGuardados` no se toca: el
mapa la sigue usando.

### 2.2 Validar una edición

| Función | Entrada → salida | RF |
|---|---|---|
| `validarEdicion(fecha, tema, minutosTexto)` | los tres textos de los campos → `{ valida: true, cambios: { date, topic, minutes } }` o `{ valida: false, errores: [mensajes] }` | 4, 5 |

- **Fecha:** `esFechaValida(fecha)`. Si falla, el mensaje es «Elige una fecha válida.».
- **Tema:** `tema.trim() !== ""`. Si falla, «Escribe un tema.». En `cambios.topic` se
  guarda el tema recortado.
- **Minutos:** el texto recortado tiene que ser solo dígitos y su número, mayor que 0. Si
  falla, «Los minutos deben ser un número entero mayor que 0.». Se valida el texto, no
  `Number()`, para rechazar «4.5», «1e2» y el texto vacío.
- Los errores salen siempre en el orden fecha, tema, minutos.

### 2.3 Localizar, editar y borrar

| Función | Entrada → salida | RF |
|---|---|---|
| `mismaSesion(a, b)` | dos sesiones → `true` si su contenido es idéntico (`JSON.stringify(a) === JSON.stringify(b)`) | 9, 14, 15 |
| `localizarSesion(sesiones, indice, original)` | lista, posición recordada y copia de la sesión → posición actual o `-1` | 14, 15 |
| `editarSesion(sesiones, indice, cambios)` | → lista nueva. En la misma posición va `{ ...sesion, ...cambios }`, así se conservan los campos extra y el orden de las claves. | 4, 7, 18 |
| `borrarSesion(sesiones, indice)` | → lista nueva sin esa posición | 9, 18 |
| `borrarSesionesValidas(sesiones)` | → lista nueva con solo las sesiones que no cumplen `esSesionValida` | 12, 18 |
| `contarSesionesValidas(sesiones)` | → número | 11, 13 |

### 2.4 Preparar el guardado (une 2.1 y 2.3)

| Función | Entrada → salida | RF |
|---|---|---|
| `prepararGuardado(texto, operacion)` | texto guardado en este momento, y la operación: `{ tipo: "editar", indice, original, cambios }`, `{ tipo: "borrar", indice, original }` o `{ tipo: "borrarTodas" }` → `{ estado: "ok", sesiones }`, `{ estado: "ilegible" }` o `{ estado: "noExiste" }` | 4, 9, 12, 14, 15, 16, 18 |

### 2.5 Orden de la lista, textos y foco

| Función | Entrada → salida | RF |
|---|---|---|
| `ordenarParaLista(sesiones)` | → `[{ sesion, indice, valida }]`, de la fecha más reciente a la más antigua y, dentro del mismo día, de mayor a menor `indice`. Da el mismo orden que la lista actual, pero conserva la posición guardada de cada sesión. | 1, 7 |
| `textoConfirmarBorrado(sesion)` | → «¿Borrar la sesión «Matemáticas» del martes, 29 de septiembre de 2026 (45 min)?» | 8 |
| `textoConfirmarBorrarTodas(n)` | → «¿Borrar las 12 sesiones? Esta acción no se puede deshacer.», o la forma en singular si `n === 1` | 11 |
| `nombreAccion(accion, sesion)` | «Editar» o «Borrar» y la sesión → «Borrar Matemáticas, martes, 29 de septiembre de 2026, 45 min» | RNF-2 |
| `posicionFocoTrasBorrar(posicion, total)` | posición en la lista que se veía y número de filas antes de borrar → posición que recibe el foco, o `-1` si la lista queda vacía | 9 |

## 3. Algoritmos (pseudocódigo)

### 3.1 `localizarSesion(sesiones, indice, original)` — RF-14, RF-15

```
si indice < longitud(sesiones) y mismaSesion(sesiones[indice], original):
    devolver indice                        // caso normal: nadie ha tocado nada
para j de 0 a longitud(sesiones) - 1:      // otra pestaña la movió de posición
    si mismaSesion(sesiones[j], original): devolver j
devolver -1                                // ya no existe → RF-15
```

Con dos sesiones idénticas, se toca la que está en la posición recordada. Si esa ya no
coincide, se toca la primera idéntica. Como las dos tienen el mismo contenido, el
resultado guardado es igual en ambos casos (RF-9).

### 3.2 `prepararGuardado(texto, operacion)` — RF-14 a RF-16 y RF-18

```
lectura = leerListaGuardada(texto)
si no lectura.ok: devolver { estado: "ilegible" }
sesiones = lectura.sesiones
si operacion.tipo == "borrarTodas":
    devolver { estado: "ok", sesiones: borrarSesionesValidas(sesiones) }
i = localizarSesion(sesiones, operacion.indice, operacion.original)
si i == -1: devolver { estado: "noExiste" }
si operacion.tipo == "editar": devolver { estado: "ok", sesiones: editarSesion(sesiones, i, operacion.cambios) }
si operacion.tipo == "borrar": devolver { estado: "ok", sesiones: borrarSesion(sesiones, i) }
```

### 3.3 Guardar una edición (`app.js`) — RF-4, RF-5 y RF-14 a RF-17

```
al enviar el formulario de la fila (botón Guardar o Enter):
    impedir el envío normal
    v = validarEdicion(valores de los tres campos)
    si no v.valida: pintar v.errores junto a la fila; terminar        // RF-5, la fila sigue igual
    r = guardarOperacion({ tipo: "editar", indice, original, cambios: v.cambios })
    si r == "ok":       edicion = null; mostrarTodo(); foco en «Editar» de esa sesión   // RF-4
    si r == "noExiste": edicion = null; aviso RF-15; mostrarTodo()
    si r == "ilegible": aviso RF-16                                    // la fila sigue en edición
    si r == "fallo":    aviso RF-17                                    // la fila sigue en edición

guardarOperacion(operacion):
    intentar texto = localStorage.getItem(CLAVE)  si falla → devolver "ilegible"
    p = prepararGuardado(texto, operacion)
    si p.estado != "ok": devolver p.estado
    intentar localStorage.setItem(CLAVE, JSON.stringify(p.sesiones))  si falla → devolver "fallo"
    devolver "ok"
```

### 3.4 Borrar una sesión o todas — RF-8 a RF-13

```
al pulsar Borrar en una fila:
    abrir diálogo con textoConfirmarBorrado(sesion) y botones «Borrar» y «Cancelar»
    si se cancela (Cancelar, Escape o cierre): foco en el «Borrar» que lo abrió; fin   // RF-10
    r = guardarOperacion({ tipo: "borrar", indice, original })
    "ok"       → mostrarTodo(); foco según posicionFocoTrasBorrar                 // RF-9
    "noExiste" → aviso RF-15; mostrarTodo()
    "ilegible" → aviso RF-16      "fallo" → aviso RF-17 (la pantalla no cambia)

al pulsar «Borrar todas las sesiones»:
    n = contarSesionesValidas(sesiones mostradas)
    diálogo con textoConfirmarBorrarTodas(n) y botones «Borrar todo» y «Cancelar»
    si se acepta: guardarOperacion({ tipo: "borrarTodas" }), y los mismos casos de arriba
```

## 4. Interfaz

### 4.1 La lista (`mostrarLista`) — RF-1, RF-2, RF-3, RF-7, RNF-2

- La lista se pinta en el orden de `ordenarParaLista`. Cada fila guarda su `indice` y
  una copia de su sesión (`original`).
- **Sesión válida:** se muestran como ahora el tema, la fecha y los minutos, más dos
  botones, «Editar» y «Borrar», con el `aria-label` de `nombreAccion`.
- **Sesión no válida:** se pinta como hoy, sin botones (RF-1). Mostrarlas bien queda fuera
  de alcance (spec).
- **Sesión en edición:** su fila se convierte en un `<form novalidate>` con un campo de
  fecha (`type="date"`), uno de tema (`type="text"`) y uno de minutos (`type="number"`,
  `min="1"`, `step="1"`), cada uno con su `<label>`. Debajo van «Guardar» (submit) y
  «Cancelar», y una zona de errores con `role="alert"` enlazada con `aria-describedby`.
  - `novalidate` hace que los mensajes sean los de RF-5 y no las burbujas del navegador.
  - Un `<form>` ya hace que Enter guarde.
  - Escape en cualquier campo cancela (RF-6).
- **Estado de la edición:** `edicion = null | { indice, original, valores }`. Mientras no
  sea `null`, se desactivan (`disabled`) los botones de las demás filas, «Borrar todas las
  sesiones» y el botón «Guardar sesión» del formulario (RF-3).
  - Con eso, nada puede volver a llamar a `mostrarTodo()` durante una edición, y lo
    escrito no se pierde.
  - Al abrir la edición, el foco va al campo de fecha (RF-2).

### 4.2 Diálogo de confirmación — RF-8, RF-10, RF-11

- Hay un único `<dialog>` en `index.html`. Se abre con `showModal()` y se rellenan su
  texto y el nombre de su botón de borrar.
- El navegador ya cierra el diálogo con Escape, atrapa el foco dentro y lo hace accesible
  al lector de pantalla.
- El evento `close` comprueba `returnValue`, y cualquier cierre que no sea el de borrar
  cuenta como cancelar.
- Al abrirse, el foco empieza en «Cancelar», para que un Enter por error no borre nada
  (P8).

### 4.3 Avisos y «Borrar todas» — RF-13, RF-15 a RF-17

- Una zona `<p id="aviso" role="status">` bajo el título «Sesiones» muestra los avisos de
  RF-15, RF-16 y RF-17. Se vacía al empezar la siguiente acción.
- El botón «Borrar todas las sesiones» va al final de la sección. Está desactivado si
  `contarSesionesValidas` es 0 (RF-13) o si hay una edición abierta (RF-3).
- Si la lista queda vacía, el foco va al título «Sesiones», que tiene `tabindex="-1"`
  (RF-9).

### 4.4 Estilos — RNF-1, RNF-3

- Botones de las filas y del diálogo con `min-height` y `min-width` de 44 px.
- La fila en edición se apila en una columna por debajo de unos 480 px, para que no haya
  desplazamiento horizontal a 375 px.
- Los botones desactivados se distinguen por algo más que el color. «Borrar» se diferencia
  de «Editar» por el texto, no solo por el color.

## 5. Decisiones

| # | Decisión | Alternativa descartada y por qué |
|---|---|---|
| D1 | Identificar una sesión por su posición más una copia de su contenido (3.1). | **Añadir un campo `id`.** Habría que generar ids para las sesiones antiguas, es decir, reescribir datos sin que el usuario haga nada (choca con P8 y RF-19), o mezclar sesiones con y sin id. Para la spec, dos sesiones idénticas son intercambiables, así que no hace falta más. |
| D2 | Releer `localStorage` justo antes de cada escritura y aplicar ahí el cambio (3.2). | **Escribir la lista que hay en memoria.** Es lo que hace hoy el formulario, y borraría lo que haya escrito otra pestaña (RF-14). |
| D3 | `leerListaGuardada` nueva, sin tocar `interpretarDatosGuardados`. | **Cambiar la función existente.** El mapa depende de que devuelva `[]` (spec 001, RF-11). Cambiarla obligaría a revisar la 001. |
| D4 | `<dialog>` propio con `showModal()`. | **`window.confirm()`.** No deja poner a los botones «Borrar» y «Borrar todo», como pide la spec, ni elegir cuál empieza con el foco. |
| D5 | La fila en edición es un `<form novalidate>`. | **Teclas a mano y validación del navegador.** Enter vendría gratis con el formulario, pero las burbujas del navegador no tienen los textos de RF-5 y cambian según el navegador. |
| D6 | Desactivar el resto de acciones durante una edición. | **Dejar guardar una sesión nueva y volver a pintar la edición abierta.** Es más complejo y es justo lo que la spec descartó (RF-3). |
| D7 | Validar los minutos como texto de solo dígitos. | **`Number.isInteger(Number(texto))`.** Aceptaría «1e2» y «45.0». La regla de la spec se refiere a lo que el usuario escribe. |
| D8 | `borrarSesionesValidas` conserva las sesiones no válidas. | **Guardar `[]`.** Eliminaría datos que el usuario no ve ni ha elegido borrar (RF-12, P8). |

**Límite conocido (fuera de alcance según la spec):** si `localStorage` tiene una sesión
con una fecha que no existe, la lista actual falla al pintarla (`fechaBonita`). Este plan
no lo arregla. Se anota en `MEMORY.md` para la futura spec de robustez.

## 6. Tests (`node --test`, sin instalar nada) — P6

Todos van en `logica.test.js`, así que también se ejecutan en `tests.html`. En cada
tarea: primero el test en rojo, después el código.

| Función | Casos |
|---|---|
| `leerListaGuardada` | `null` y `""` dan lista vacía con `ok: true`. Una lista válida, `ok: true`. JSON roto, un objeto o un número, `ok: false`. |
| `validarEdicion` | Un caso válido. Tema con espacios en los extremos, que se recorta. Tema solo con espacios. Fecha vacía o «2026-02-30». Minutos «0», «-5», «», «4.5», «1e2» y « 45 » (este último es válido). Varios errores a la vez, en orden fecha, tema, minutos. |
| `mismaSesion` / `localizarSesion` | Posición correcta. Posición desplazada porque otra pestaña borró una sesión anterior. Sesión que ya no existe (`-1`). Dos sesiones idénticas. |
| `editarSesion` | Cambia solo esa posición, conserva los campos extra y no modifica la lista de entrada. |
| `borrarSesion` | Con dos sesiones idénticas solo borra una, el resto queda intacto y la lista de entrada no cambia. |
| `borrarSesionesValidas` / `contarSesionesValidas` | Lista mixta: se quedan las no válidas (formato antiguo y minutos decimales) y se cuentan solo las válidas. |
| `prepararGuardado` | `ilegible`, `noExiste`, editar y borrar sobre datos con una sesión añadida desde otra pestaña (se conserva), y `borrarTodas`. |
| `ordenarParaLista` | Fecha descendente, en el mismo día primero el índice mayor, y una sesión editada a otra fecha que respeta su índice (RF-7). |
| `textoConfirmarBorrado` / `textoConfirmarBorrarTodas` / `nombreAccion` | Textos exactos, con singular y plural. |
| `posicionFocoTrasBorrar` | Fila del medio, última fila y única fila (`-1`). |

**Pruebas a mano en el navegador** (la parte de DOM, P5): cada caso límite de la tabla de
la spec, usando solo el teclado (Tab, Enter y Escape), a 375 px y con dos pestañas
abiertas para RF-14 y RF-15. Para RF-16 y RF-17 se fuerza el fallo desde la consola, por
ejemplo escribiendo datos corruptos en la clave o llenando el almacenamiento.

## 7. Fases (orientativas para `tasks.md`)

1. Lectura y validación: `leerListaGuardada` y `validarEdicion`.
2. Operaciones sobre la lista: `mismaSesion`, `localizarSesion`, `editarSesion`,
   `borrarSesion`, `borrarSesionesValidas`, `contarSesionesValidas` y `prepararGuardado`.
3. Orden y textos: `ordenarParaLista`, textos de confirmación, `nombreAccion` y
   `posicionFocoTrasBorrar`.
4. Interfaz para borrar una sesión: botones, diálogo, `guardarOperacion` y avisos.
5. Interfaz para editar: fila en edición, errores, bloqueo de RF-3 y foco.
6. «Borrar todas las sesiones».
7. Estilos y repaso a mano de todos los casos límite.

## 8. Cobertura de RF

| RF | Dónde |
|---|---|
| 1 | 2.5 `ordenarParaLista`, 4.1 |
| 2 | 4.1 |
| 3 | 4.1, 4.3, D6 |
| 4 | 2.2, 2.3 `editarSesion`, 3.3 |
| 5 | 2.2, 3.3, 4.1, D5, D7 |
| 6 | 4.1 |
| 7 | 2.3 (misma posición), 2.5 `ordenarParaLista` |
| 8 | 2.5 `textoConfirmarBorrado`, 3.4, 4.2 |
| 9 | 2.3 `borrarSesion`, 3.1, 3.4, 2.5 `posicionFocoTrasBorrar` |
| 10 | 3.4, 4.2 |
| 11 | 2.5 `textoConfirmarBorrarTodas`, 3.4, 4.2 |
| 12 | 2.3 `borrarSesionesValidas`, D8 |
| 13 | 2.3 `contarSesionesValidas`, 4.3 |
| 14 | 3.2, 3.3 `guardarOperacion`, D2 |
| 15 | 3.1, 3.2, 4.3 |
| 16 | 2.1, 3.2, D3 |
| 17 | 3.3 `guardarOperacion`, 4.3 |
| 18 | 2.3 (copia con campos extra), 2.4, D8 |
| 19 | Solo se escribe en 3.3 y 3.4, siempre después de «Guardar» o de aceptar el diálogo |
| RNF-1 a RNF-5 | 4.1 a 4.4, `nombreAccion`. Todos los textos están en español. |
