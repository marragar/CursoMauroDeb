# Spec 001 — Mapa de calor de estudio

Estado: implementada y verificada (2026-10-02) · Fecha: 2026-10-01

## 1. Contexto y objetivo

El Diario de Estudio ya muestra la racha de días seguidos y cuántos días se ha estudiado
en el mes actual. Son dos números: dicen *cuánto*, pero no *cómo* ha sido la constancia.
Una racha de 0 no distingue entre «no estudio nunca» y «ayer fallé después de dos meses
estudiando a diario».

**Objetivo:** que el estudiante vea de un vistazo su constancia y su dedicación de las
últimas 12 semanas de calendario, en una cuadrícula donde cada casilla es un día y el
color es más intenso cuantos más minutos haya estudiado ese día. Así se motiva a no dejar
huecos y se ven las rachas pasadas, no solo la actual.

## 2. Usuarios

- **Estudiante:** usa el diario en su propio dispositivo (móvil u ordenador), con ratón,
  dedo, teclado o lector de pantalla, para registrar sesiones y motivarse. Es el único
  usuario de sus datos.
- **Persona que mantiene el proyecto:** está empezando a programar. La funcionalidad debe
  poder entenderse y comprobarse sin conocimientos avanzados (ver constitución).

## 3. Historias de usuario

- **HU-1.** Como estudiante, quiero ver mis últimas 12 semanas de calendario en una
  cuadrícula de días para saber de un vistazo qué días estudié y cuáles no.
- **HU-2.** Como estudiante, quiero que los días con más minutos se vean más intensos para
  distinguir los días flojos de los días fuertes.
- **HU-3.** Como estudiante, quiero consultar la fecha y los minutos exactos de un día
  concreto para no depender solo del color.
- **HU-4.** Como estudiante, quiero que el mapa se actualice en cuanto guardo una sesión
  para ver mi progreso al momento.
- **HU-5.** Como estudiante, quiero una leyenda que explique cada color y cada marca para
  interpretar el mapa sin adivinar.

## 4. Requisitos funcionales

Notación EARS: *El sistema deberá…* (siempre) · *Cuando…* (evento) · *Mientras…* (estado)
· *Si…, entonces…* (situación no deseada).

### Definiciones

- **Hoy:** la fecha local actual del dispositivo en el momento de dibujar el mapa.
- **Semana:** semana de calendario de lunes a domingo.
- **Periodo del mapa:** desde el lunes de la semana que está 11 semanas antes de la de hoy
  hasta el domingo de la semana de hoy, ambos incluidos (84 días).
- **Día pasado / hoy / día futuro:** cada día del periodo es exactamente uno de los tres,
  comparando su fecha con hoy.
- **Sesión válida:** sesión guardada cuya fecha es un texto `AAAA-MM-DD` (con ceros a la
  izquierda) que corresponde a un día real del calendario, y cuyos minutos son un número
  entero mayor que 0.
- **Día seleccionado:** el día cuyo detalle se muestra de forma fija (ver RF-5).

### RF-1. Periodo, cuadrícula y posición
- El sistema deberá mostrar el mapa justo debajo del resumen (racha y días del mes) y
  antes del formulario, con el título «Últimas 12 semanas».
- El sistema deberá mostrar las 84 casillas del periodo del mapa en 12 columnas (una por
  semana, de la más antigua a la izquierda a la de hoy a la derecha) y 7 filas (lunes
  arriba, domingo abajo).
- El sistema deberá calcular hoy y todas las fechas con la fecha local del dispositivo.

**Criterios de aceptación:**
- Con hoy = jueves 1 de octubre de 2026, la primera casilla es el lunes 13 de julio de
  2026 y la última el domingo 4 de octubre de 2026.
- Con hoy = lunes 5 de octubre de 2026, la primera casilla es el lunes 20 de julio de 2026
  y hoy ocupa la fila de arriba de la última columna.
- Con hoy = jueves 2 de marzo de 2028, la primera casilla es el lunes 13 de diciembre de
  2027 y el periodo incluye el martes 29 de febrero de 2028.

### RF-2. Minutos por día
- El sistema deberá calcular los minutos de cada día sumando los minutos de todas las
  sesiones válidas con esa fecha.

**Criterio de aceptación:** dos sesiones el mismo día de 20 y 15 minutos dan 35 minutos
en esa casilla (nivel 2).

### RF-3. Intensidad por tramos fijos
- El sistema deberá asignar a cada día pasado y a hoy uno de estos niveles según sus
  minutos totales:

  | Nivel | Minutos del día | Aspecto                                      |
  |-------|-----------------|----------------------------------------------|
  | 0     | 0               | casilla sin relleno, solo con borde          |
  | 1     | 1–29            | relleno del color más suave                  |
  | 2     | 30–59           | relleno algo más intenso que el nivel 1      |
  | 3     | 60–119          | relleno algo más intenso que el nivel 2      |
  | 4     | 120 o más       | relleno del color más intenso                |

- El sistema deberá usar el mismo aspecto para el mismo nivel en cualquier día, sin
  depender del resto de días.

**Criterios de aceptación:** 0 min → nivel 0; 1 → 1; 29 → 1; 30 → 2; 59 → 2; 60 → 3;
119 → 3; 120 → 4; 900 → 4.

### RF-4. Días futuros
- Mientras un día del periodo sea futuro, el sistema deberá mostrar su casilla con un
  aspecto «futuro» que no use ningún color de nivel y que se distinga del nivel 0 por algo
  más que el color (por ejemplo, el tipo de borde).
- Si un día futuro tiene sesiones guardadas, entonces el sistema deberá mostrarlo
  igualmente con el aspecto «futuro», sin nivel.

### RF-5. Detalle de un día
- El sistema deberá mostrar el detalle de un día en una línea fija bajo el mapa, igual en
  móvil y en escritorio, con este formato (minutos como número entero seguido de «min»,
  igual que en la lista de sesiones, sin convertir a horas ni separar miles):

  | Tipo de día              | Texto del detalle                                        |
  |--------------------------|----------------------------------------------------------|
  | Pasado con estudio       | «martes, 29 de septiembre de 2026: 30 min»                |
  | Pasado sin estudio       | «martes, 29 de septiembre de 2026: sin estudio»           |
  | Hoy con estudio          | «Hoy, jueves, 1 de octubre de 2026: 45 min»               |
  | Hoy sin estudio          | «Hoy, jueves, 1 de octubre de 2026: aún sin estudio»      |
  | Futuro                   | «domingo, 4 de octubre de 2026: todavía no ha llegado»    |

- Mientras no haya un día seleccionado, el sistema deberá mostrar el detalle de hoy.
- Cuando el usuario toque o haga clic en una casilla, o llegue a ella con el teclado, el
  sistema deberá convertirla en el día seleccionado y mostrar su detalle. El detalle no
  desaparece solo.
- Mientras el ratón esté sobre una casilla, el sistema deberá mostrar su detalle; cuando
  el ratón salga del mapa, el sistema deberá volver a mostrar el del día seleccionado (o
  el de hoy si no hay ninguno). Pasar el ratón no cambia el día seleccionado.
- Cuando el mapa se vuelva a dibujar (al guardar una sesión), el sistema deberá quitar la
  selección y mostrar el detalle de hoy.

### RF-6. Leyenda
- El sistema deberá mostrar, inmediatamente debajo de la línea de detalle, una leyenda con
  los 5 niveles de menos a más intenso y el rango de minutos de cada uno, más el aspecto
  «futuro» y la marca de hoy, cada uno con su texto.

### RF-7. Iniciales de los días
- El sistema deberá mostrar a la izquierda de las filas las 7 iniciales de los días de la
  semana en español (L, M, X, J, V, S, D), también en móvil.

### RF-8. Actualización
- Cuando se cargue la página, el sistema deberá dibujar el mapa con las sesiones guardadas.
- Cuando el usuario guarde una sesión nueva, el sistema deberá volver a calcular hoy y el
  periodo y dibujar de nuevo el mapa, sin recargar la página.

### RF-9. Qué sesiones entran en el mapa
- El sistema deberá tener en cuenta solo las sesiones válidas cuya fecha esté dentro del
  periodo del mapa (primer lunes y último domingo incluidos).
- Si una sesión tiene fecha anterior a la primera casilla o posterior a la última,
  entonces el sistema deberá ignorarla en el mapa (sigue contando donde corresponda en el
  resto de la web).
- Si una sesión no es válida, entonces el sistema deberá ignorarla en el mapa y seguir
  mostrando el resto, sin errores visibles ni en la consola.

**Criterios de aceptación** (con hoy = 1 de octubre de 2026):
- Una sesión del lunes 13 de julio cuenta; una del domingo 12 de julio no.
- Una sesión del lunes 5 de octubre no aparece en el mapa.
- Se ignoran sesiones con minutos `0`, `-10`, `12.5` o `"30"` (texto), y con fechas
  `"2026-02-30"` o `"2026-9-5"`.

### RF-10. Hoy
- El sistema deberá marcar la casilla de hoy con un contorno propio, visible sea cual sea
  su nivel y distinto de cualquier relleno de nivel.

### RF-11. Datos guardados ilegibles o no disponibles
- Si lo guardado no se puede leer como una lista de sesiones (texto corrupto, valor vacío,
  un objeto en vez de una lista) o el almacenamiento del navegador no está disponible,
  entonces el sistema deberá dibujar el mapa como si no hubiera sesiones, sin que el mapa
  provoque errores en la consola. Los errores que provoque el resto de la página con esos
  datos quedan fuera de alcance (sección 8).
- El sistema no deberá escribir, borrar ni modificar nunca los datos guardados desde el
  mapa: solo los lee.

## 5. Requisitos no funcionales

- **RNF-1. Móvil y tamaño:** a 375 px de ancho, el mapa completo (iniciales, casillas,
  detalle y leyenda) deberá verse sin scroll horizontal y con casillas de al menos
  24 × 24 px. A 320 px tampoco habrá scroll horizontal de la página, aunque las casillas
  sean más pequeñas.
- **RNF-2. Zoom:** con el texto ampliado al 200 %, nada se deberá solapar ni cortar; se
  admite scroll horizontal solo dentro del propio mapa, nunca en la página.
- **RNF-3. No solo color:** la información de cada día deberá poder conocerse sin
  distinguir colores: cada casilla tendrá como nombre accesible el mismo texto que su
  detalle (RF-5), y los aspectos «nivel 0», «futuro» y «hoy» se distinguirán por su borde.
- **RNF-4. Contraste:** el borde de las casillas, los niveles 1 a 4 y el contorno de hoy
  deberán tener un contraste mínimo de 3:1 con el fondo. Cada nivel deberá ser
  visiblemente más oscuro que el anterior y encajar con el diseño actual de cuaderno.
- **RNF-5. Alto contraste del sistema:** con los colores forzados por el sistema, deberán
  seguir distinguiéndose al menos «con estudio», «sin estudio», «futuro» y «hoy».
- **RNF-6. Teclado:** el mapa deberá ocupar una sola parada de tabulador. Dentro de él,
  las flechas izquierda y derecha cambiarán de semana y las flechas arriba y abajo de día,
  sin salir del periodo. El foco deberá verse siempre. Pulsar Tab saldrá del mapa.
- **RNF-7. Lector de pantalla:** cuando cambie el día seleccionado, el lector de pantalla
  deberá anunciar el nuevo detalle.
- **RNF-8. Rendimiento:** con 5.000 sesiones guardadas, el mapa deberá dibujarse sin una
  espera que se note (menos de 200 ms en un ordenador normal).
- **RNF-9. Datos:** la funcionalidad no deberá cambiar el formato ni la clave de los datos
  guardados (constitución, principio 5).
- **RNF-10. Coherencia de fechas:** el mapa deberá seguir las mismas reglas de fechas que
  la racha y el contador del mes: todo en fecha local, las sesiones de un mismo día se
  juntan en una sola casilla y los días futuros no reciben nivel.
- **RNF-11. Comprobable:** toda la lógica de esta funcionalidad (periodo, validez de
  sesiones, suma por día, nivel, tipo de día y texto del detalle) deberá poder probarse
  con un «hoy» fijo, sin depender del día real en que se ejecuta la prueba (constitución,
  principios 3 y 4).
- **RNF-12. Idioma:** todos los textos visibles y los nombres accesibles, en español.

## 6. Casos límite

| Situación | Comportamiento esperado |
|---|---|
| Usuario nuevo sin sesiones | Días pasados en nivel 0, hoy en nivel 0 con su contorno, futuros con aspecto «futuro»; detalle «Hoy, …: aún sin estudio». |
| Hoy es lunes | Hoy arriba en la última columna; 6 días futuros debajo (RF-1). |
| Hoy es domingo | Última columna completa; no hay días futuros. |
| Hoy sin sesiones todavía | Nivel 0 y texto «aún sin estudio», no «sin estudio» (RF-5). |
| Primer lunes / domingo anterior al periodo | El lunes cuenta; el domingo anterior no (RF-9). |
| Sesión posterior al último domingo | No aparece en el mapa (RF-9). |
| Sesión con fecha futura dentro del periodo | Casilla con aspecto «futuro», sin nivel (RF-4). |
| Periodo que cruza cambio de mes o de año | Fechas consecutivas y correctas (RF-1, caso 2027–2028). |
| 29 de febrero dentro del periodo | Aparece como un día normal (RF-1). |
| Cambio de hora (verano/invierno) en el periodo | Ni se pierde ni se duplica ningún día: siempre 84 casillas. |
| Cambio de zona horaria del dispositivo | Hoy pasa a ser la fecha local nueva; las fechas guardadas no se convierten. |
| Varias sesiones el mismo día | Se suman sus minutos (RF-2). |
| Día con muchísimos minutos (p. ej. 900) | Nivel 4; el detalle muestra «900 min» sin romper el diseño. |
| Sesiones no válidas o en el formato de desarrollo `{ id, fecha, tema, minutos }` | Se ignoran en el mapa (RF-9, ver decisión 31). |
| Datos guardados corruptos o almacenamiento no disponible | Mapa vacío, sin errores; nada se sobrescribe desde el mapa (RF-11). |
| La página sigue abierta al pasar la medianoche | Se actualiza al recargar o al guardar una sesión, como la racha. |
| Se guarda una sesión justo después de pasar de domingo a lunes | El mapa avanza una columna, se pierde la selección y se muestra el detalle de hoy (RF-5, RF-8). |
| 5.000 sesiones guardadas | Se dibuja sin espera perceptible (RNF-8). |
| Pantalla de 320 px o zoom de texto al 200 % | Sin scroll horizontal de la página (RNF-1, RNF-2). |

## 7. Fuera de alcance (esta versión)

- Nombres de los meses sobre las columnas.
- Total de minutos o de días del periodo.
- Elegir el número de semanas, o mostrar un rango distinto en móvil y en escritorio.
- Intensidad relativa al mejor día del usuario.
- Pulsar un día para filtrar la lista de sesiones, o para crear o editar sesiones.
- Colorear días futuros con sesiones planificadas.
- Actualización automática del mapa al cambiar de día con la página abierta.
- Que el resto de la página (racha, contador del mes, lista, formulario) resista datos
  corruptos: hoy no lo hace y necesita su propia spec (ver sección 8).

## 8. Dependencias

- **Lógica separada y página de pruebas (constitución, principios 3 y 4):** hoy no
  existen. Crearlas, y pasar «hoy» como dato a las funciones de cálculo, es la primera
  fase de esta funcionalidad, no un trabajo aparte.
- **Datos corruptos en el resto de la página:** la página actual deja de funcionar si lo
  guardado no es una lista válida, y al guardar después podría sobrescribirlo. No se
  resuelve en esta spec (solo RF-11 para el mapa), pero queda registrado como riesgo para
  el principio 5 y debe tener una spec propia antes o justo después de esta.

## 9. Criterios de finalización

- [x] Se cumplen todos los criterios de aceptación de RF-1 a RF-11.
- [x] Las pruebas del proyecto cubren, con un «hoy» fijo, el periodo (los tres casos de
      RF-1), la validez de sesiones y los límites del periodo (RF-9), la suma (RF-2),
      todos los límites de nivel (RF-3), el tipo de día (RF-4) y los cinco textos del
      detalle (RF-5); y pasan todas.
- [x] Se ha comprobado en el navegador: con datos, sin datos, con datos corruptos, a
      375 px y 320 px, con zoom al 200 %, solo con teclado y con 5.000 sesiones; la
      consola no muestra errores del mapa (con datos corruptos, el resto de la página
      puede mostrarlos: sección 8).
- [x] Se ha medido que a 375 px las casillas miden al menos 24 × 24 px (RNF-1).
- [x] Los datos guardados antes de la funcionalidad siguen igual, byte a byte.
- [x] Esta spec refleja el comportamiento final (constitución, principio 2) y la memoria
      del proyecto está actualizada.

## 10. Dudas abiertas

No quedan dudas abiertas. Las decisiones tomadas, con su porqué, están en el apartado 11.

## 11. Decisiones tomadas

**Primera ronda (dudas del borrador):**
- **Posición y título:** debajo del resumen, con el título «Últimas 12 semanas»: el mapa
  es otra forma de ver la constancia, así que va junto a la racha (RF-1).
- **Hoy destacado:** con un contorno propio; sin él cuesta orientarse en 84 casillas (RF-10).
- **Detalle:** una línea fija bajo el mapa, no una burbuja: no tapa casillas, no
  desaparece al levantar el dedo y sirve igual con ratón, dedo, teclado y lector (RF-5).
- **Iniciales:** las 7 (RF-7). Que quepan a 375 px con casillas de 24 px es un requisito
  que se comprueba al terminar (RNF-1), no algo que se dé por hecho.
- **Tramos:** 30 / 60 / 120 min: media hora, una hora y una tarde larga son referencias
  fáciles de entender (RF-3).

**Segunda ronda (revisión QA, 31 hallazgos):**
- **Hoy como tercer tipo de día** con su propio texto, «aún sin estudio», porque el día no
  ha terminado (hallazgo 1).
- **Seleccionar = tocar, hacer clic o llegar con el teclado; pasar el ratón solo
  previsualiza.** Al redibujar se vuelve a hoy, porque la mayoría de sesiones se guardan
  para hoy y así se ve el efecto al momento (hallazgos 2, 3 y 21).
- **Un único límite del periodo, por casillas y no por «12 semanas» contadas en días**
  (hallazgos 12, 17 y 18). El título habla de semanas de calendario, definidas en la
  sección 4 (hallazgo 13).
- **Requisitos medibles:** casillas de al menos 24 px, contraste de 3:1 y nivel 0, futuro y
  hoy distinguibles por el borde (hallazgos 6, 7, 14 y 26).
- **Sesión válida definida con precisión:** solo minutos enteros mayores que 0, porque el
  formulario solo permite enteros y aceptar decimales obligaría a redondear y el color no
  coincidiría con el texto (hallazgo 11).
- **Teclado:** una sola parada de tabulador con flechas, para no obligar a pulsar Tab 84
  veces antes de llegar al formulario (hallazgos 9 y 27).
- **Formato de minutos igual al de la lista,** por coherencia (hallazgo 5).
- **RF-11 protege el mapa ante datos corruptos.** El resto de la página queda fuera, pero
  registrado como dependencia, para no ampliar esta funcionalidad (hallazgos 19 y 20).
- **El formato `{ id, fecha, tema, minutos }` se trata como no válido:** solo existió
  durante el desarrollo, antes de fijar el formato oficial, y no hay usuarios con esos
  datos. Por eso no choca con el principio 5 (hallazgo 31).
- **La carpeta de la spec conserva el nombre `001-heat-map`** porque así se pidió. El
  principio 6 trata del código y los textos de la web, no de nombres de carpeta
  (hallazgo 31). La spec vive en `docs/specs/`, como manda el principio 2 (hallazgo 28).
- **Pruebas de toda la lógica, no solo del nivel,** y su creación es la primera fase de
  esta funcionalidad (hallazgos 29 y 30).
- **Rendimiento, zoom, 320 px, zona horaria, alto contraste y 29 de febrero** quedan
  cubiertos en los RNF y los casos límite (hallazgos 22 a 26).
- **RNF de coherencia reescrito:** dice «se juntan en una casilla» en lugar de
  «varias sesiones = un día» (hallazgo 15).
- **Se quita la afirmación sin verificar sobre cuántos píxeles caben** y pasa a ser un
  criterio de finalización (hallazgo 16).
