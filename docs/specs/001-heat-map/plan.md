# Plan 001 — Mapa de calor de estudio

Estado: propuesta para aprobación · Fecha: 2026-10-01
Spec: `docs/specs/001-heat-map/spec.md` · Constitución: `docs/constitution.md`

Este plan explica **cómo** se construye lo que la spec define. No contiene código: solo
responsabilidades, firmas de funciones y pseudocódigo.

## 0. Resumen

- La lógica pura se separa en un archivo nuevo. Todas sus funciones reciben «hoy» como
  parámetro y trabajan con fechas en texto `AAAA-MM-DD`.
- La interfaz (DOM, `localStorage`, eventos) se queda en `app.js` y solo llama a esa
  lógica.
- Los tests se escriben **una sola vez**. El mismo archivo se ejecuta con `node --test` y
  también abriendo `tests.html` en el navegador, que es lo que exige la constitución.
- Hay cuatro fases. La primera separa la lógica existente sin cambiar nada visible
  (spec, sección 8).

## 1. Archivos

| Archivo | Acción | Responsabilidad | RF |
|---|---|---|---|
| `logica.js` | **Nuevo** | Funciones puras: fechas, racha, días del mes y todo el cálculo del mapa. Ni DOM ni `localStorage` (P3). Funciona como script clásico en el navegador (funciones globales) y en Node (se exporta solo si existe `module`). | 1–5, 9, 11 |
| `app.js` | Modificar | Interfaz y datos: leer y guardar en `localStorage`, pintar la página, eventos del formulario y del mapa, y estado de la selección. Calcula «hoy» una vez por dibujado y se lo pasa a la lógica. Pierde las funciones que pasan a `logica.js`. | 1, 5, 6, 8, 10, 11 |
| `index.html` | Modificar | Nueva sección del mapa entre el resumen y el formulario: título, iniciales, cuadrícula, línea de detalle y leyenda. Carga `logica.js` antes de `app.js`. | 1, 5, 6, 7, 10 |
| `styles.css` | Modificar | Cuadrícula, 5 niveles, aspecto «futuro», contorno de hoy, foco, leyenda, móvil, zoom y alto contraste. | 3, 4, 6, 7, 10 |
| `logica.test.js` | **Nuevo** | Todos los casos de prueba de `logica.js`. Lo ejecutan `node --test` y `tests.html`. | todos los de lógica |
| `tests.html` | **Nuevo** | Página que se abre con doble clic. Define un mini `test`/`assert` propio, carga `logica.js` y `logica.test.js`, y pinta cada caso en verde o rojo con un resumen (P4). | — |
| `CLAUDE.md` (AGENTS.md) | Modificar | En *Stack y estructura*, añadir los tres archivos nuevos. En *Verificación*, explicar cómo pasar los tests. | — |
| `MEMORY.md` | Modificar | Estado y decisiones al terminar cada fase. | — |

Crear archivos nuevos requiere permiso (AGENTS.md). **Aprobar este plan supone aprobar
`logica.js`, `logica.test.js` y `tests.html`.** No se crea `package.json` ni nada que
instalar (P1).

## 2. Funciones puras de lógica (`logica.js`)

Convenciones:
- Las fechas entran y salen como texto `AAAA-MM-DD`.
- `hoy` siempre llega como parámetro; ninguna función llama a `new Date()` sin argumentos.
- No se usan `toISOString()` ni `new Date("AAAA-MM-DD")`.

### 2.1 Existentes que se mueven (fase 1)

| Función | Cambio | Para qué |
|---|---|---|
| `fechaATexto(fecha)` | Se mueve sin cambios | `Date` local → texto. La usa `app.js` para calcular hoy. |
| `textoAFecha(texto)` | Se mueve sin cambios | Texto → `Date` local. |
| `diaAnterior(fecha)` | Se mueve sin cambios | Usada por la racha. |
| `fechaBonita(texto)` | Se mueve sin cambios | «martes, 29 de septiembre de 2026». |
| `calcularRacha(sesiones, hoy)` | **Nuevo parámetro `hoy`** | Mismo resultado que ahora, pero comprobable (P4). |
| `calcularDiasDelMes(sesiones, hoy)` | **Nuevo parámetro `hoy`** | Ídem. |

### 2.2 Nuevas para el mapa

| Función | Entrada → salida | RF |
|---|---|---|
| `sumarDias(fecha, n)` | texto, entero → texto (n puede ser negativo) | 1 |
| `diaDeLaSemana(fecha)` | texto → 0 (lunes) … 6 (domingo) | 1 |
| `calcularPeriodo(hoy)` | texto → `{ inicio, fin }` (primer lunes y último domingo) | 1 |
| `esFechaValida(texto)` | cualquier valor → sí/no (formato exacto y día real) | 9 |
| `esSesionValida(sesion)` | cualquier valor → sí/no (objeto, fecha válida, minutos enteros > 0) | 9 |
| `minutosPorDia(sesiones, inicio, fin)` | lista → objeto `{ fecha: minutos }` solo con sesiones válidas del periodo | 2, 9 |
| `nivelDeMinutos(minutos)` | entero ≥ 0 → 0…4 | 3 |
| `tipoDeDia(fecha, hoy)` | texto, texto → `"pasado"`, `"hoy"` o `"futuro"` | 4, 5 |
| `textoDetalle(fecha, hoy, minutos)` | → uno de los cinco textos de RF-5 | 5 |
| `construirMapa(sesiones, hoy)` | → 12 semanas × 7 días, cada día `{ fecha, tipo, minutos, nivel, detalle }` (`nivel` vacío si es futuro) | 1–5, 9 |
| `moverSeleccion(fecha, tecla, inicio, fin)` | → fecha nueva tras una flecha | RNF-6 |
| `interpretarDatosGuardados(texto)` | texto guardado (o nada) → lista de sesiones; `[]` si está vacío, corrupto o no es una lista | 11 |

## 3. Algoritmo del mapa (pseudocódigo)

```
calcularPeriodo(hoy):
    lunesDeHoy ← sumarDias(hoy, −diaDeLaSemana(hoy))
    inicio     ← sumarDias(lunesDeHoy, −77)          # 11 semanas antes
    fin        ← sumarDias(lunesDeHoy, +6)           # domingo de esta semana
    devolver { inicio, fin }

sumarDias(fecha, n):
    (año, mes, día) ← partes de fecha
    devolver fechaATexto(nueva Date local(año, mes − 1, día + n))
    # El constructor ajusta solo el fin de mes, el de año y el 29 de febrero.
    # Nunca se suman milisegundos: así el cambio de hora no afecta.

esFechaValida(texto):
    si texto no es texto o no encaja con 4 dígitos-2 dígitos-2 dígitos → no
    devolver fechaATexto(textoAFecha(texto)) = texto   # "2026-02-30" → "2026-03-02" ≠ → no

esSesionValida(s):
    devolver s es objeto y esFechaValida(s.date)
             y s.minutes es número entero y s.minutes > 0   # "30" (texto) → no

minutosPorDia(sesiones, inicio, fin):
    resultado ← objeto vacío
    para cada s en sesiones:
        si esSesionValida(s) y inicio ≤ s.date ≤ fin:      # comparación de textos
            resultado[s.date] ← (resultado[s.date] o 0) + s.minutes
    devolver resultado

nivelDeMinutos(m):
    si m = 0 → 0;  si m < 30 → 1;  si m < 60 → 2;  si m < 120 → 3;  si no → 4

tipoDeDia(fecha, hoy):
    si fecha < hoy → "pasado";  si fecha = hoy → "hoy";  si no → "futuro"

textoDetalle(fecha, hoy, minutos):
    tipo ← tipoDeDia(fecha, hoy);  bonita ← fechaBonita(fecha)
    si tipo = "futuro" → bonita + ": todavía no ha llegado"
    prefijo ← (tipo = "hoy") ? "Hoy, " : ""
    si minutos > 0 → prefijo + bonita + ": " + minutos + " min"
    si tipo = "hoy" → "Hoy, " + bonita + ": aún sin estudio"
    si no → bonita + ": sin estudio"

construirMapa(sesiones, hoy):
    { inicio, fin } ← calcularPeriodo(hoy)
    minutos ← minutosPorDia(sesiones, inicio, fin)
    semanas ← lista vacía;  fecha ← inicio
    repetir 12 veces:
        semana ← lista vacía
        repetir 7 veces:
            m ← minutos[fecha] o 0;  tipo ← tipoDeDia(fecha, hoy)
            añadir a semana { fecha, tipo, minutos: m,
                              nivel: (tipo = "futuro") ? vacío : nivelDeMinutos(m),
                              detalle: textoDetalle(fecha, hoy, m) }
            fecha ← sumarDias(fecha, 1)
        añadir semana a semanas
    devolver semanas

moverSeleccion(fecha, tecla, inicio, fin):
    izquierda → −7; derecha → +7; arriba → −1 (salvo lunes); abajo → +1 (salvo domingo)
    nueva ← sumarDias(fecha, salto)
    si nueva < inicio o nueva > fin → devolver fecha     # no sale del periodo
    devolver nueva

interpretarDatosGuardados(texto):
    si texto está vacío → []
    intentar datos ← JSON.parse(texto);  si falla → []
    si datos no es una lista → []
    devolver datos         # las sesiones no válidas se filtran después (RF-9)
```

Coste: una pasada por las sesiones más 84 días, lineal en el número de sesiones
(RNF-8, 5.000 sesiones).

## 4. Cómo se pinta en la interfaz (`app.js`, `index.html`, `styles.css`)

### 4.1 Estructura (`index.html`) — RF-1, 5, 6, 7

Una sección nueva entre el resumen y el formulario, con:
1. El título «Últimas 12 semanas».
2. Un contenedor de la cuadrícula. Las 7 iniciales van fijas en el HTML; las 84 casillas
   las genera `app.js`.
3. La línea de detalle, un párrafo que el lector de pantalla anuncia al cambiar
   (`aria-live="polite"`) — RNF-7.
4. La leyenda, estática en el HTML: 5 niveles con su rango, «futuro» y «hoy» — RF-6.

### 4.2 Dibujar (`app.js`) — RF-1, 3, 4, 8, 10, 11

```
mostrarMapa():
    hoy ← fechaATexto(new Date())               # único sitio donde se lee el reloj
    sesiones ← leerSesionesParaMapa()
    semanas ← construirMapa(sesiones, hoy)
    diaSeleccionado ← vacío                     # RF-5: al redibujar, se vuelve a hoy
    vaciar la cuadrícula
    para cada día de cada semana (por columnas):
        crear un botón con:
            clase según nivel (nivel-0 … nivel-4) o «futuro»
            nombre accesible = día.detalle       # RNF-3
            si es hoy → clase «hoy» y aria-current="date"     # RF-10
            tabindex 0 solo en hoy y −1 en el resto           # una sola parada de Tab
        añadirlo a un fragmento
    añadir el fragmento de una vez a la cuadrícula
    escribir el detalle de hoy en la línea de detalle

leerSesionesParaMapa():
    intentar texto ← localStorage.getItem(CLAVE);  si falla → texto ← vacío
    devolver interpretarDatosGuardados(texto)    # RF-11; el mapa nunca escribe
```

- `mostrarTodo()` llama a `mostrarMapa()` **la primera**, antes que a `cargarSesiones()`.
  Así, si los datos están corruptos, el mapa se dibuja aunque lo demás falle (RF-11).
- Se llama al cargar la página y tras guardar una sesión, igual que hoy (RF-8).

### 4.3 Interacción (`app.js`) — RF-5, RNF-6, RNF-7

Un solo escuchador de cada evento en el contenedor (delegación):

| Evento | Acción |
|---|---|
| clic / toque en una casilla | `diaSeleccionado` ← su fecha; mover allí el `tabindex` 0; mostrar su detalle |
| ratón entra en una casilla | mostrar su detalle, sin tocar `diaSeleccionado` |
| ratón sale del mapa | mostrar el detalle de `diaSeleccionado`, o de hoy si no hay ninguno |
| flecha con el foco en el mapa | `moverSeleccion(...)`; enfocar la casilla nueva (que pasa a ser la seleccionada); evitar el scroll de la página |
| Tab | comportamiento normal del navegador: sale del mapa |

### 4.4 Estilos (`styles.css`) — RF-3, 4, 6, 7, 10, RNF-1 a 5

- **Cuadrícula:** CSS Grid de 7 filas que se rellena por columnas. Primera columna para
  las iniciales y 12 columnas iguales que se reparten el ancho. Casillas cuadradas;
  separación pequeña, de 2 a 3 px, para que a 375 px haya casillas de al menos 24 px.
- **Niveles:** escala de la tinta azul del diseño actual. Nivel 0 solo con borde y niveles
  1→4 cada vez más oscuros, todos con contraste ≥ 3:1 sobre el papel (comprobar con un
  medidor de contraste).
- **Futuro:** borde discontinuo y sin relleno.
- **Hoy:** contorno de tinta separado de la casilla, visible sobre cualquier nivel.
- **Foco:** el contorno amarillo del diseño actual, distinto del de hoy.
- **Zoom 200 %:** el contenedor del mapa puede hacer scroll horizontal; la página no.
- **Alto contraste:** un bloque `@media (forced-colors: active)` en el que «con estudio» se
  rellena con color del sistema, «sin estudio» lleva borde, «futuro» borde discontinuo y
  «hoy» un contorno grueso.

## 5. Decisiones técnicas

| # | Decisión | Por qué | Alternativa descartada |
|---|---|---|---|
| D1 | Lógica en `logica.js` como script clásico con exportación condicional para Node | Funciona con doble clic (`file://`) y en `node --test` sin build (P1, P3) | Módulos ES (`import`/`export`): prohibidos con `file://` por AGENTS.md |
| D2 | Fechas como texto `AAAA-MM-DD` en toda la lógica | Se comparan con `<` y `=`, se ven en los tests y siguen la regla de fechas | Objetos `Date`: comparaciones por milisegundos y riesgo de UTC |
| D3 | `sumarDias` con el constructor local `(año, mes, día + n)` | Inmune al cambio de hora; ajusta solo meses, años y bisiestos | Sumar 86.400.000 ms: falla los días de 23 o 25 horas |
| D4 | `construirMapa` devuelve datos (incluido el texto de cada día) y `app.js` solo los pinta | Todo lo comprobable queda en lógica pura (RNF-11) | Calcular niveles o textos mientras se crea el DOM: no se puede probar sin navegador |
| D5 | Una casilla = un `<button>`, con «tabindex itinerante» (solo una casilla con 0) | Botón nativo: clic, toque, Enter y foco gratis. Una sola parada de Tab (RNF-6) | 84 casillas con `tabindex` 0 (84 pulsaciones de Tab); `aria-activedescendant` (más difícil de entender) |
| D6 | Delegación: un escuchador por evento en el contenedor | Se redibuja sin volver a enganchar 84 × 4 escuchadores; más simple | Un escuchador por casilla |
| D7 | Línea de detalle con `aria-live="polite"` | El lector anuncia el cambio sin interrumpir (RNF-7) | Burbuja `title`: no funciona con el dedo y la mayoría de lectores no la anuncia |
| D8 | Lectura segura propia del mapa (`leerSesionesParaMapa`) y `cargarSesiones()` intacta | Si `cargarSesiones` devolviera `[]` ante datos corruptos, al guardar se **sobrescribirían** los datos del usuario (P5). Hoy, al fallar, al menos no guarda | Hacer segura `cargarSesiones` para toda la página: es la spec pendiente de datos corruptos (spec, sección 8) |
| D9 | Leyenda e iniciales fijas en el HTML | No dependen de los datos; menos código | Generarlas desde JS |
| D10 | Tests en un único `logica.test.js` que sirve para Node y para el navegador | Cumple la petición (`node --test`) y P4 (`tests.html` sin instalar nada) sin duplicar casos | Solo `node --test` (incumple P4: obliga a instalar Node); solo `tests.html` (no cumple la petición) |
| D11 | Sesiones con `minutes` en texto (`"30"`) no válidas | El formulario siempre guarda números; aceptarlas ocultaría datos rotos | Convertirlas con `Number()` |

## 6. Estrategia de tests

### 6.1 Cómo se ejecutan
- **Terminal:** `node --test` en la raíz del proyecto. Node encuentra `logica.test.js` por
  su nombre. Hace falta Node 18 o superior; no hay `package.json` ni dependencias.
- **Navegador:** doble clic en `tests.html`. Muestra cada caso en verde o rojo y un total.
  No necesita Node (P4).

### 6.2 Un archivo, dos entornos
- `logica.test.js` usa solo `test(nombre, función)`, `assert.strictEqual` y
  `assert.deepStrictEqual`.
- **En Node:** si existe `require`, los toma de los módulos internos `node:test` y
  `node:assert`, y obtiene las funciones de `logica.js`. Son módulos que trae Node: no se
  instala nada.
- **En el navegador:** `tests.html` define antes su propio mini `test` y `assert`, con
  esos mismos tres nombres, y carga `logica.js` como script normal.
- **Fechas en español:** `fechaBonita` depende de los datos de idioma del entorno. Node 22
  oficial los incluye (comprobado: «martes, 29 de septiembre de 2026»). Si una
  instalación de Node no los trae, fallarán solo los tests de texto y se verá claramente
  en el mensaje.

### 6.3 Casos (todos con «hoy» fijo)

| Grupo | Casos | RF |
|---|---|---|
| `calcularRacha` y `calcularDiasDelMes` (fase 1) | Sin sesiones; racha que termina hoy; hoy sin sesión y ayer sí; hueco; varias sesiones el mismo día; fechas futuras; cambio de mes | P4 |
| `sumarDias` | +1 a fin de mes y a fin de año; −1 el 1 de enero; 28 feb 2028 + 1 = 29 feb; +1 en el día del cambio de hora (29 mar y 25 oct 2026) | 1 |
| `diaDeLaSemana` | Un lunes → 0, un domingo → 6 | 1 |
| `calcularPeriodo` | Jueves 2026-10-01 → 07-13 a 10-04; lunes 2026-10-05 → 07-20 a 10-11; domingo 2026-10-04 → 07-13 a 10-04; jueves 2028-03-02 → 2027-12-13 a 2028-03-05 | 1 |
| `esFechaValida` / `esSesionValida` | Válidas; `"2026-02-30"`, `"2026-9-5"`, `null`, número; minutos `0`, `-10`, `12.5`, `"30"`; objeto `{ id, fecha, tema, minutos }` | 9 |
| `minutosPorDia` | 20 + 15 = 35; sesión el primer lunes (entra), el domingo anterior (no), tras el último domingo (no); sesiones no válidas ignoradas | 2, 9 |
| `nivelDeMinutos` | 0, 1, 29, 30, 59, 60, 119, 120, 900 → 0, 1, 1, 2, 2, 3, 3, 4, 4 | 3 |
| `tipoDeDia` | Ayer, hoy, mañana | 4, 5 |
| `textoDetalle` | Los 5 textos exactos de la tabla de RF-5 | 5 |
| `construirMapa` | 12 × 7 = 84 días consecutivos; el primero y el último; día futuro con sesión → nivel vacío; hoy marcado como «hoy»; sin sesiones → todo nivel 0; 5.000 sesiones en menos de 200 ms | 1–5, RNF-8 |
| `moverSeleccion` | Las 4 flechas; no pasa del primer lunes ni del último domingo; arriba en lunes y abajo en domingo no se mueven | RNF-6 |
| `interpretarDatosGuardados` | `null`, `""`, `"{roto"`, `"{}"`, `"5"` → `[]`; una lista válida se devuelve igual | 11 |

### 6.4 Lo que no cubren los tests (verificación manual en el navegador)
Pintado, colores, contraste, tamaños, ratón, toque, teclado, lector de pantalla, alto
contraste, zoom, 320 y 375 px, y que el mapa no escribe en `localStorage`. Es la lista de
criterios de finalización de la spec, sección 9. Se verifica con el MCP de Chrome
DevTools si está disponible; si no, con Chrome sin interfaz.

## 7. Fases

1. **Separar la lógica (sin cambios visibles):** crear `logica.js`, `logica.test.js` y
   `tests.html`; mover las funciones de fecha, racha y mes, añadiéndoles el parámetro
   `hoy`; tests de racha y mes en verde; comprobar que la web se comporta exactamente igual.
2. **Lógica del mapa con tests primero:** escribir los casos de 6.3 y después las funciones
   de 2.2 hasta que todo esté en verde en Node y en el navegador.
3. **Interfaz:** HTML, CSS y la parte de `app.js` de la sección 4.
4. **Verificación y documentación:** criterios de finalización de la spec, y
   actualización de AGENTS.md y `MEMORY.md`.

Cada fase deja la web funcionando y puede revisarse por separado.

## 8. Cobertura de requisitos

| RF | Lógica (2–3) | Interfaz (4) | Tests (6.3) |
|---|---|---|---|
| RF-1 Periodo y cuadrícula | `calcularPeriodo`, `sumarDias`, `diaDeLaSemana`, `construirMapa` | 4.1, 4.2, cuadrícula de 4.4 | `calcularPeriodo`, `sumarDias`, `construirMapa` |
| RF-2 Minutos por día | `minutosPorDia` | — | `minutosPorDia` |
| RF-3 Niveles | `nivelDeMinutos` | clases de nivel en 4.2 y 4.4 | `nivelDeMinutos` |
| RF-4 Futuros | `tipoDeDia`, `construirMapa` | clase «futuro» en 4.2 y 4.4 | `tipoDeDia`, `construirMapa` |
| RF-5 Detalle | `textoDetalle` | línea de detalle 4.1; eventos 4.3 | `textoDetalle` (+ manual) |
| RF-6 Leyenda | — | 4.1, 4.4 | manual |
| RF-7 Iniciales | — | 4.1, 4.4 | manual |
| RF-8 Actualización | — | `mostrarTodo` en 4.2 | manual |
| RF-9 Qué sesiones entran | `esFechaValida`, `esSesionValida`, `minutosPorDia` | — | validez y límites |
| RF-10 Hoy | `tipoDeDia` | clase «hoy» y `aria-current` en 4.2, contorno en 4.4 | `construirMapa` (+ manual) |
| RF-11 Datos ilegibles | `interpretarDatosGuardados` | `leerSesionesParaMapa`; el mapa se dibuja primero (4.2) | `interpretarDatosGuardados` |

## 9. Riesgos y puntos a revisar

1. **Choque entre la spec y RF-11.** La spec pide «sin errores en la consola» con datos
   corruptos, pero el resto de la página (fuera de alcance) sí lanzará errores, aunque el
   mapa se dibuje. Antes de implementar hay que acotar ese criterio al mapa en la spec (P2).
2. **`node --test` necesita Node,** algo que P4 no exige. Por eso es opcional y
   `tests.html` es la referencia. Si se prefiere que Node sea obligatorio, hay que cambiar
   antes la constitución.
3. **El espacio a 375 px es justo:** con casillas de 24 px quedan unos 2–3 px de
   separación. Si no cabe, se reduce el margen lateral de la hoja en móvil, sin tocar el
   tamaño mínimo.
4. **Contraste del nivel 1 frente a 3:1:** un azul muy claro no llega. El nivel 1 será más
   saturado de lo que «suave» sugiere; se valida en la fase 3.
5. **Ruta de la spec:** la petición dice `specs/001-heat-map/`, pero el plan vive en
   `docs/specs/001-heat-map/`, como manda P2.
