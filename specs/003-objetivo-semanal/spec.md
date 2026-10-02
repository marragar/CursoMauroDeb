# Spec 003 — Objetivo semanal

Estado: borrador · Fecha: 2026-10-02 · Revisada tras la clarificación: 2026-10-02

## Contexto y objetivo

Hoy el diario muestra la racha, los días estudiados del mes y el mapa de calor, pero no
deja fijar una meta. El usuario no sabe si lo que lleva estudiado esta semana es poco o
suficiente para lo que se había propuesto.

El objetivo es que el usuario pueda fijar cuántos minutos quiere estudiar cada semana y
ver en todo momento cuánto lleva, cuánto le falta y cuántos días le quedan. Así tiene un
motivo para cumplirlo.

## Usuarios

Una sola persona que registra su propio estudio en su navegador. No hay cuentas ni datos
compartidos.

## Historias de usuario

- HU-1. Como estudiante, quiero fijar cuántos minutos quiero estudiar cada semana para
  tener una meta clara.
- HU-2. Como estudiante, quiero ver cuántos minutos llevo esta semana frente a mi
  objetivo, cuántos me faltan y cuántos días me quedan, para organizarme.
- HU-3. Como estudiante, quiero recibir una enhorabuena al cumplir el objetivo y ver cuánto
  lo he superado, para motivarme.
- HU-4. Como estudiante, quiero cambiar o quitar el objetivo cuando cambie mi situación.
- HU-5. Como estudiante sin objetivo fijado, quiero ver igualmente los minutos de la semana
  y que se me invite a fijar uno.

## Definiciones

- **Hoy:** la fecha local del dispositivo, en formato «AAAA-MM-DD».
- **Semana en curso:** de lunes a domingo, en hora local, la semana que contiene «hoy». Es
  el mismo criterio de semana que usa el mapa de calor (spec 001). Siempre tiene 7 días,
  también en las semanas con cambio de hora y en las que cruzan de un año a otro.
- **Sesión válida:** la misma definición que en las specs 001 y 002: fecha real en formato
  «AAAA-MM-DD» y minutos como número entero mayor que 0.
- **Minutos de la semana (X):** la suma de los minutos de las sesiones válidas cuya fecha
  está entre el lunes de la semana en curso y «hoy», ambos incluidos. Una sesión con fecha
  posterior a hoy no cuenta, aunque caiga en la semana en curso.
- **Objetivo (Y):** un número entero de minutos entre 1 y 10080, ambos incluidos. 10080
  son los minutos que tiene una semana. Solo hay un objetivo vigente y se compara siempre
  con la semana en curso. No se guarda historial de semanas pasadas.
- **Entrada válida del objetivo:** lo escrito en el campo cumple estas reglas, una vez
  quitados los espacios de los extremos:
  - Solo contiene dígitos. Los ceros a la izquierda se aceptan: «0300» equivale a 300.
  - Su valor está entre 1 y 10080.
  - No es válido si está vacío o lleva signos, decimales, exponentes o separadores. Por
    ejemplo, «+300», «300.0», «3e2», «1.000» y «30,5» no son válidos.
- **Objetivo válido guardado:** el dato guardado del objetivo es un número entero entre 1
  y 10080.
- **Objetivo corrupto:** el dato guardado del objetivo existe pero no es un objetivo válido
  guardado. Por ejemplo, el texto «"300"», 300.5, null, un número fuera de rango o un
  contenido que no se puede interpretar.
- **Sin objetivo:** no hay un objetivo válido guardado, ya sea porque no existe dato, porque
  el dato es corrupto o porque leer el almacenamiento produce un error.
- **Porcentaje (P):** X / Y × 100 redondeado hacia abajo a un entero, sin tope. Puede pasar
  de 100, y puede ser 100 con un exceso pequeño: con X = 301 e Y = 300, P es 100.
- **Minutos que faltan (F):** Y − X, solo si X < Y.
- **Exceso (E):** X − Y, solo si X > Y.
- **Días que quedan (D):** los días que quedan de la semana en curso, contando hoy. El
  lunes son 7 y el domingo, 1.
- **Formato de los números:** todos los números se muestran sin separador de miles, por
  ejemplo «10080».
- **Actualizar todo:** el mismo concepto que en la spec 002: volver a calcular «hoy» y
  mostrar de nuevo todo lo que depende de los datos guardados. Ahora también vuelve a leer
  el objetivo guardado y muestra de nuevo el progreso del objetivo semanal, pero no cambia
  lo escrito en el campo del objetivo.

## Requisitos funcionales

### Fijar, cambiar y quitar el objetivo

- RF-1: EL SISTEMA mostrará, encima del mapa de calor, un bloque «Objetivo semanal» con un
  campo para escribir el objetivo en minutos y un botón «Guardar objetivo».
- RF-2: CUANDO se cargue la página, EL SISTEMA mostrará en el campo el objetivo válido
  guardado. Si no lo hay, el campo estará vacío.
- RF-3: MIENTRAS haya un objetivo válido guardado o un objetivo corrupto, EL SISTEMA
  mostrará la acción «Quitar objetivo».
- RF-4: CUANDO el usuario pulse «Guardar objetivo», o Enter en el campo, y lo escrito sea
  una entrada válida, EL SISTEMA:
  - recalculará «hoy»;
  - guardará ese valor como objetivo vigente, sustituyendo al anterior, aunque fuera
    corrupto;
  - mostrará en el campo el valor guardado, sin espacios ni ceros a la izquierda;
  - quitará cualquier mensaje de error o aviso del bloque;
  - mostrará de nuevo el progreso;
  - dejará el foco en el campo.
- RF-5: SI el usuario intenta guardar y lo escrito no es una entrada válida, ENTONCES EL
  SISTEMA:
  - no guardará nada, tampoco si el dato guardado es corrupto;
  - mantendrá lo escrito en el campo;
  - dejará el progreso como estaba;
  - mostrará junto al campo el mensaje «El objetivo debe ser un número entero entre 1 y
    10080.».
- RF-6: CUANDO el usuario pulse «Quitar objetivo», EL SISTEMA:
  - eliminará el objetivo guardado sin pedir confirmación, aunque fuera corrupto;
  - recalculará «hoy»;
  - vaciará el campo, aunque tuviera texto no válido;
  - quitará cualquier mensaje de error o aviso del bloque;
  - mostrará el bloque como sin objetivo (RF-12);
  - llevará el foco al campo.
- RF-7: SI no se puede guardar ni quitar el objetivo (almacenamiento lleno o no
  disponible), ENTONCES EL SISTEMA:
  - mostrará el mensaje «No se ha podido guardar el objetivo. No se ha cambiado nada.»;
  - mantendrá lo escrito en el campo;
  - dejará el progreso como estaba antes.
- RF-8: CUANDO el usuario modifique el contenido del campo, EL SISTEMA quitará los mensajes
  de RF-5 y RF-7 que estén visibles.

### Progreso de la semana con objetivo

- RF-9: MIENTRAS haya un objetivo válido guardado, EL SISTEMA mostrará:
  - el texto «X de Y min (P %)»;
  - una barra de progreso.

  El relleno de la barra es la proporción exacta X / Y, con un tope visual del 100 %. Si X
  es mayor que 0, la barra nunca se ve vacía.
- RF-10: MIENTRAS haya un objetivo válido guardado y X < Y, EL SISTEMA mostrará además el
  texto «Te faltan F min. Quedan D días.». Si D es 1, el texto será «Te faltan F min.
  Queda 1 día.».
- RF-11: MIENTRAS haya un objetivo válido guardado y X ≥ Y, EL SISTEMA mostrará, en lugar
  del texto de RF-10:
  - si X = Y, el mensaje «¡Objetivo cumplido!»;
  - si X > Y, el mensaje «¡Objetivo cumplido! +E min».

  En el texto de RF-9, P mostrará su valor real: puede ser 100 cuando el exceso es pequeño
  (X = 301 e Y = 300 dan «(100 %)» y «+1 min»), o mayor de 100.

### Sin objetivo

- RF-12: MIENTRAS no haya objetivo, EL SISTEMA mostrará el texto «Esta semana llevas X
  min.» y la invitación «Fija un objetivo semanal para seguir tu progreso.». No mostrará
  barra, porcentaje, minutos que faltan ni días que quedan.

### Actualización

- RF-13: CUANDO se guarde una sesión nueva, se edite o se borre una sesión, o se borren
  todas, EL SISTEMA actualizará todo, incluido el progreso del objetivo semanal.
- RF-14: CUANDO la página vuelva a estar visible (por ejemplo, al volver a la pestaña), EL
  SISTEMA actualizará todo. Así recalcula «hoy» y la semana en curso tras pasar la
  medianoche con la página abierta y recoge el objetivo que se haya cambiado en otra
  pestaña.
- RF-15: CUANDO, al recalcular «hoy», este haya pasado a otra semana, EL SISTEMA usará la
  nueva semana en curso. El objetivo vigente se mantiene y X se calcula solo con las
  sesiones de la nueva semana hasta hoy.
- RF-16: CUANDO una sesión se edite (spec 002) y pase a tener una fecha posterior a hoy o
  fuera de la semana en curso, EL SISTEMA dejará de contarla en X. Si pasa a tener una
  fecha entre el lunes de la semana en curso y hoy, la contará.

### Anuncios

- RF-17: CUANDO, tras una acción del usuario (guardar o quitar el objetivo, o guardar,
  editar o borrar sesiones), el estado pase de no cumplido a cumplido (X ≥ Y), EL SISTEMA
  anunciará el mensaje de RF-11 a las tecnologías de apoyo.
- RF-18: CUANDO se cargue la página con el objetivo ya cumplido, o el estado pase de
  cumplido a no cumplido, EL SISTEMA actualizará el texto sin ningún anuncio especial.

### Protección de los datos

- RF-19: SI el dato guardado del objetivo es corrupto, o leer el almacenamiento produce un
  error, ENTONCES EL SISTEMA:
  - se comportará como sin objetivo (RF-12);
  - dejará el campo vacío;
  - no fallará;
  - no sobrescribirá ese dato hasta que el usuario guarde un objetivo con una entrada
    válida (RF-4) o lo quite (RF-6) de forma expresa.
- RF-20: EL SISTEMA guardará el objetivo aparte de las sesiones. Fijar, cambiar o quitar el
  objetivo nunca modificará las sesiones guardadas ni su formato.
- RF-21: EL SISTEMA no tendrá en cuenta las sesiones no válidas para calcular X. Tampoco
  las modificará.

## Requisitos no funcionales

- RNF-1: El campo, «Guardar objetivo» y «Quitar objetivo» se pueden usar con ratón, con el
  dedo y solo con teclado.
- RNF-2: Accesibilidad:
  - La barra de progreso informa a las tecnologías de apoyo de un valor de min(P, 100) sobre
    100, y de un texto con el progreso completo «X de Y min (P %)».
  - El mensaje de error de RF-5 está asociado al campo.
  - Los mensajes de RF-5 y RF-7 se anuncian al aparecer.
  - El mensaje de RF-11 se anuncia solo en los casos de RF-17.
- RNF-3: A 375 px de ancho, el bloque se ve y se usa sin desplazamiento horizontal. Los
  textos largos, como «12000 de 10080 min (119 %)» o «¡Objetivo cumplido! +1920 min», se
  reparten en varias líneas. El campo y cada botón ocupan al menos 44 × 44 px.
- RNF-4: Los datos de sesiones guardados antes de esta versión se siguen leyendo igual, y
  la app funciona igual que antes si nunca se ha fijado un objetivo.
- RNF-5: Todos los textos nuevos están en español.

## Casos límite

| Caso | Comportamiento esperado |
| --- | --- |
| No hay ninguna sesión esta semana y hay objetivo | «0 de Y min (0 %)», barra vacía y «Te faltan Y min. Quedan D días.» (RF-9, RF-10). |
| No hay sesiones esta semana ni objetivo | «Esta semana llevas 0 min.» y la invitación (RF-12). |
| X es exactamente Y | «Y de Y min (100 %)», barra llena y «¡Objetivo cumplido!», sin «+0 min» (RF-11). |
| X = 301 e Y = 300 | «301 de 300 min (100 %)», barra llena y «¡Objetivo cumplido! +1 min» (RF-11). |
| X = 390 e Y = 300 | «390 de 300 min (130 %)», barra llena y «¡Objetivo cumplido! +90 min» (RF-11). |
| X = 1 e Y = 3 | El porcentaje se redondea hacia abajo: «1 de 3 min (33 %)» (Definiciones). |
| X = 1 e Y = 10080 | «1 de 10080 min (0 %)», pero la barra no se ve vacía (RF-9). |
| Hoy es lunes | D = 7 y X solo cuenta las sesiones de ese lunes. Las del resto de la semana, posteriores a hoy, no cuentan (Definiciones). |
| Hoy es domingo y no se ha cumplido | «… Queda 1 día.» (RF-10). |
| Hoy es miércoles y hay una sesión con fecha del viernes de esta semana | No cuenta en X hasta que llegue el viernes (Definiciones). |
| Hay sesiones del domingo anterior | No cuentan en X (Definiciones). |
| Sesión registrada a las 00:30 del lunes, en hora local | Su fecha es ese lunes y cuenta en la nueva semana (Definiciones). |
| La página sigue abierta y se pasa del domingo al lunes | Al volver a la pestaña, o tras cualquier acción, se usa la nueva semana: X solo cuenta las sesiones del lunes, D = 7 y el objetivo se mantiene (RF-14, RF-15). |
| Semana con cambio de hora (la del domingo 2026-10-25 y la del domingo 2027-03-28) | La semana tiene 7 días, de lunes a domingo, y el domingo del cambio D es 1 (Definiciones). |
| Semana que cruza el año (del lunes 2026-12-28 al domingo 2027-01-03) | X suma las sesiones de ambos años hasta hoy. El 2027-01-03, D es 1 (Definiciones). |
| Se edita una sesión de esta semana a un día posterior a hoy | Deja de contar en X (RF-16). |
| Se edita una sesión de esta semana a otra semana | Deja de contar en X (RF-16). |
| Se edita una sesión de otra semana a un día de esta semana anterior o igual a hoy | Pasa a contar en X (RF-16). |
| Se escribe 0, -5, «+300», «30.5», «300.0», «3e2», «1.000», «30,5», «abc» o 10081 | Mensaje de RF-5 y no se guarda nada. |
| Se guarda con el campo vacío | Mensaje de RF-5 y no se guarda nada, aunque el dato guardado sea corrupto (RF-5). |
| Se escribe 1 o 10080 | Se guarda (RF-4). |
| Se escribe « 300 » o «0300» | Se guarda 300 y el campo muestra «300» (Definiciones, RF-4). |
| Se guarda el mismo objetivo que ya había | Se guarda y el progreso queda igual (RF-4). |
| Se cambia el objetivo con la semana empezada | El nuevo valor se compara al momento con la semana en curso (RF-4, RF-9). |
| Se quita el objetivo | Sin confirmación: el bloque pasa a sin objetivo, el foco va al campo y las sesiones no cambian (RF-6, RF-20). |
| Se quita con el mensaje de error de RF-5 visible y texto no válido en el campo | Se quita el objetivo, el campo queda vacío y desaparece el mensaje (RF-6). |
| Se guarda con el aviso de RF-7 visible | Si ahora se puede guardar, se guarda y desaparece el aviso (RF-4). Si vuelve a fallar, el aviso sigue (RF-7). |
| Se modifica el campo con un mensaje visible | El mensaje desaparece (RF-8). |
| El objetivo guardado es corrupto («"300"», 300.5, null, contenido ilegible o fuera de rango) | Se trata como sin objetivo, el campo queda vacío, se muestra «Quitar objetivo», la app no falla y no se escribe encima hasta que el usuario guarde o quite (RF-3, RF-19). |
| Leer el almacenamiento produce un error | Se trata como sin objetivo y la app no falla (RF-19). |
| Almacenamiento lleno o no disponible al guardar o quitar el objetivo | Aviso de RF-7. El campo conserva lo escrito y el progreso no cambia. |
| Se borran todas las sesiones con un objetivo fijado | El objetivo se mantiene y X pasa a 0 (RF-13). |
| Se borra una sesión y X baja de Y | Cambia de cumplido a no cumplido: el texto se actualiza sin anuncio especial (RF-18). |
| Se guarda una sesión y X llega a Y | Se anuncia «¡Objetivo cumplido!» (RF-17). |
| Se carga la página con el objetivo ya cumplido | Se muestra el mensaje sin anunciarlo (RF-18). |
| Se cambia el objetivo en otra pestaña | Al volver a esta pestaña, o tras cualquier acción, el progreso usa el objetivo nuevo. El campo no cambia (RF-14, Actualizar todo). |
| El usuario está escribiendo en el campo y se actualiza todo | Lo escrito no se pierde: solo cambia el progreso (Actualizar todo). |
| Hay sesiones no válidas con fecha de esta semana | No suman a X (RF-21). |
| A 375 px con «12000 de 10080 min (119 %)» o «¡Objetivo cumplido! +1920 min» | El texto ocupa varias líneas, sin desplazamiento horizontal (RNF-3). |

## Fuera de alcance

- Historial de semanas pasadas, cumplimiento de semanas anteriores o marcas en el mapa de
  calor.
- Objetivos distintos por semana, por día o por tema.
- Elegir el día en que empieza la semana.
- Notificaciones, recordatorios o avisos fuera de la página.
- Sincronizar el objetivo en directo entre pestañas mientras la página está visible. Solo se
  recoge al volver a la pestaña o tras una acción (RF-13, RF-14).
- Que la lista, la racha y el contador del mes funcionen con sesiones corruptas. Sigue
  pendiente desde la spec 001.

## Criterios de finalización

- [ ] Se cumplen RF-1 a RF-21 y RNF-1 a RNF-5.
- [ ] Hay tests automáticos que pasan con `node --test` para:
  - obtener «hoy» como fecha local, incluida una hora cercana a la medianoche (00:30);
  - calcular la semana en curso para cada día de la semana, con cambios de mes y de año
    (2026-12-28 a 2027-01-03);
  - las semanas con cambio de hora (2026-10-25 y 2027-03-28): 7 días, y D = 1 el domingo;
  - sumar X solo con las sesiones válidas entre el lunes y hoy, sin contar las fechas
    posteriores a hoy ni las de otras semanas;
  - validar la entrada: espacios, ceros a la izquierda, vacío, signos, decimales,
    exponentes, separadores y los límites 0, 1, 10080 y 10081;
  - interpretar el dato guardado: un objetivo válido, los corruptos («"300"», 300.5, null,
    contenido ilegible, fuera de rango) y la ausencia de dato;
  - calcular P (redondeo hacia abajo, sin tope, incluido 301/300 = 100), F, E y D;
  - elegir el texto correcto de RF-10, RF-11 y RF-12, incluido «Queda 1 día»;
  - decidir cuándo se anuncia el cumplimiento (RF-17, RF-18).
- [ ] Cada caso límite de la tabla se ha comprobado a mano en el navegador, incluidos la
      semana que cruza el año, el uso solo con teclado y el ancho de 375 px.
- [ ] Ninguna prueba ha modificado las sesiones guardadas ni su formato.

## Dudas abiertas

Ninguna. Se resolvieron en la clarificación del 2026-10-02 (ver la sección siguiente).

## Decisiones de la clarificación

- **Fechas futuras:** X solo suma las sesiones desde el lunes hasta hoy. Una sesión con
  fecha posterior no cuenta hasta que llegue su día, y una sesión editada a otra semana deja
  de contar.
- **Quitar sin confirmación:** quitar el objetivo no borra sesiones y se deshace fijándolo
  de nuevo, así que no se pide confirmación.
- **Ubicación:** el bloque va encima del mapa de calor.
- **Objetivo corrupto:** se puede sobrescribir, pero solo con una acción expresa del
  usuario (guardar o quitar). El principio 8 protege las sesiones, y el objetivo es un dato
  aparte. Aun así, nunca se escribe encima de forma automática. Por coherencia, «Quitar
  objetivo» también se muestra cuando hay un objetivo corrupto.
- **«Hoy» y la semana:** se usa la fecha local del dispositivo y la semana va de lunes a
  domingo en hora local. «Hoy» se recalcula al guardar, al quitar, al actualizar todo y al
  volver a la pestaña. Así se cubre el cruce de la medianoche con la página abierta.
  Actualizar todo vuelve a leer el objetivo guardado, para cubrir el caso de varias
  pestañas.
- **Entrada estricta:** se quitan los espacios de los extremos y solo se aceptan dígitos,
  con ceros a la izquierda permitidos, en el rango de 1 a 10080. Guardar con el campo vacío
  es un error.
- **El campo no se pisa:** solo cambia al cargar la página, al guardar con éxito y al
  quitar. Actualizar todo no lo toca, para no perder lo que el usuario está escribiendo.
- **Cálculos aprobados:** P se redondea hacia abajo y no tiene tope, y D cuenta el día de
  hoy.
- **Barra:** su relleno es la proporción exacta con un tope visual del 100 %, y nunca se ve
  vacía si X > 0.
- **Anuncios:** el cumplimiento se anuncia solo al pasar de no cumplido a cumplido tras una
  acción del usuario.
