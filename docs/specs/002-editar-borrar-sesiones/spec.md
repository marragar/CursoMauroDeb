# Spec 002 — Editar y borrar sesiones

Estado: aprobada (2026-10-02) · Fecha: 2026-10-02 · Revisada tras la clarificación: 2026-10-02

## Contexto y objetivo

Hoy, una vez registrada, una sesión no se puede cambiar ni quitar. Si el usuario se
equivoca de fecha, escribe mal el tema o pone minutos de más, el error queda para siempre
y altera la racha, el contador de días del mes y el mapa de calor.

El objetivo es que el usuario pueda corregir o eliminar sesiones desde la lista, y borrar
todas de una vez, sin perder datos por accidente.

## Usuarios

Una sola persona que registra su propio estudio en su navegador. No hay cuentas ni datos
compartidos.

## Historias de usuario

- HU-1. Como estudiante, quiero corregir una sesión mal registrada para que mis
  estadísticas reflejen lo que estudié de verdad.
- HU-2. Como estudiante, quiero borrar una sesión que no debería existir para que no
  cuente en la racha, el mes ni el mapa.
- HU-3. Como estudiante, quiero borrar todas mis sesiones de una vez para empezar de cero.
- HU-4. Como estudiante, quiero que se me pida confirmación antes de borrar para no perder
  sesiones por un toque accidental.

## Definiciones

- **Sesión válida:** sesión con una fecha real en formato «AAAA-MM-DD» y con minutos como
  número entero mayor que 0. Es el mismo criterio que usa el mapa de calor (spec 001,
  RF-9).
- **Sesión no válida:** cualquier otro elemento de los datos guardados, por ejemplo con el
  formato antiguo de desarrollo o con minutos decimales.
- **Reglas de validez de una edición:**
  - Fecha: tiene que ser una fecha real.
  - Tema: no puede quedar vacío después de quitar los espacios de los extremos.
  - Minutos: número entero mayor que 0.
- **Modo edición:** estado de una sesión de la lista en el que su fecha, su tema y sus
  minutos se muestran como campos editables, en el mismo sitio donde se ve la sesión, con
  los botones «Guardar» y «Cancelar».
- **Confirmación:** diálogo con un texto y dos botones, uno para borrar y otro para
  «Cancelar». Cancelarlo, pulsar Escape o cerrarlo de cualquier forma equivale a no borrar.
- **Fecha larga:** la fecha escrita como en la lista de sesiones, por ejemplo «martes, 29
  de septiembre de 2026».
- **Actualizar todo:** volver a calcular «hoy» y mostrar de nuevo la lista, la racha, el
  contador de días del mes y el mapa de calor con los datos guardados, sin recargar la
  página. El mapa se comporta igual que al guardar una sesión nueva: se quita la selección
  y se muestra el detalle de hoy (spec 001, RF-5 y RF-8).
- **Orden de la lista:** de la fecha más reciente a la más antigua. Dentro del mismo día,
  primero la última sesión añadida.

## Requisitos funcionales

### Editar una sesión

- RF-1: EL SISTEMA mostrará en cada sesión válida de la lista dos acciones, «Editar» y
  «Borrar». Las sesiones no válidas no tendrán ninguna de las dos.
- RF-2: CUANDO el usuario pulse «Editar» en una sesión, EL SISTEMA la pondrá en modo
  edición con su fecha, su tema y sus minutos actuales ya rellenos, y llevará el foco al
  campo de la fecha.
- RF-3: MIENTRAS haya una sesión en modo edición, EL SISTEMA mantendrá desactivadas las
  acciones «Editar» y «Borrar» de las demás sesiones, la acción «Borrar todas las
  sesiones» y el botón «Guardar sesión» del formulario de nueva sesión.
- RF-4: CUANDO el usuario pulse «Guardar», o Enter en un campo de la sesión en edición, y
  los datos cumplan las reglas de validez, EL SISTEMA:
  - cambiará la fecha, el tema (sin los espacios de los extremos) y los minutos de esa
    sesión, y solo de esa;
  - guardará el cambio;
  - sacará la sesión del modo edición;
  - actualizará todo;
  - llevará el foco a la acción «Editar» de esa sesión.
- RF-5: SI el usuario intenta guardar y algún dato no cumple las reglas de validez,
  ENTONCES EL SISTEMA no guardará nada, mantendrá la sesión en modo edición con lo que el
  usuario ha escrito y mostrará junto a ella un mensaje por cada campo que falle, en este
  orden:
  - fecha: «Elige una fecha válida.»
  - tema: «Escribe un tema.»
  - minutos: «Los minutos deben ser un número entero mayor que 0.»
- RF-6: CUANDO el usuario pulse «Cancelar» o Escape en un campo de la sesión en edición,
  EL SISTEMA saldrá del modo edición sin cambiar los datos guardados y llevará el foco a la
  acción «Editar» de esa sesión.
- RF-7: CUANDO se guarde una edición, EL SISTEMA mantendrá la sesión en su lugar dentro
  del orden en que se añadieron. Si cambia la fecha, la sesión se coloca en su nuevo día
  según el orden de la lista, como si se hubiera añadido cuando se añadió la original.

### Borrar una sesión

- RF-8: CUANDO el usuario pulse «Borrar» en una sesión, EL SISTEMA pedirá confirmación con
  el texto «¿Borrar la sesión «<tema>» del <fecha larga> (<minutos> min)?» y los botones
  «Borrar» y «Cancelar».
- RF-9: CUANDO el usuario acepte la confirmación, EL SISTEMA:
  - eliminará esa sesión, y solo esa aunque haya otra con los mismos datos;
  - guardará el cambio;
  - actualizará todo;
  - llevará el foco a la acción «Editar» de la sesión que ocupe ahora su lugar en la
    lista, o a la anterior si era la última. Si la lista queda vacía, lo llevará al título
    de la lista.
- RF-10: SI el usuario no acepta la confirmación, ENTONCES EL SISTEMA no cambiará nada y
  devolverá el foco a la acción «Borrar» que la abrió.

### Borrar todas las sesiones

- RF-11: CUANDO el usuario pulse «Borrar todas las sesiones», EL SISTEMA pedirá
  confirmación con el texto «¿Borrar las <n> sesiones? Esta acción no se puede deshacer.»
  y los botones «Borrar todo» y «Cancelar». <n> es el número de sesiones válidas. Si hay
  una sola, el texto será «¿Borrar la sesión? Esta acción no se puede deshacer.».
- RF-12: CUANDO el usuario acepte esa confirmación, EL SISTEMA eliminará todas las
  sesiones válidas, guardará el cambio y actualizará todo. Las sesiones no válidas se
  conservarán intactas.
- RF-13: MIENTRAS no haya ninguna sesión válida, EL SISTEMA mantendrá desactivada la
  acción «Borrar todas las sesiones».

### Protección de los datos

- RF-14: CUANDO vaya a guardar una edición o un borrado, EL SISTEMA leerá en ese momento
  los datos guardados y aplicará el cambio sobre ellos, no sobre lo que había al abrir la
  página. Así se conservan las sesiones añadidas desde otra pestaña.
- RF-15: SI, al ir a guardar, la sesión que se edita o se borra ya no está en los datos
  guardados, ENTONCES EL SISTEMA no guardará nada, mostrará el mensaje «Esta sesión ya no
  existe. La lista se ha actualizado.» y actualizará todo.
- RF-16: SI, al ir a guardar, los datos guardados no se pueden leer como una lista de
  sesiones, ENTONCES EL SISTEMA no guardará nada y mostrará el mensaje «No se han podido
  leer tus datos. No se ha cambiado nada.».
- RF-17: SI no se puede guardar el cambio (almacenamiento lleno o no disponible),
  ENTONCES EL SISTEMA mostrará el mensaje «No se ha podido guardar el cambio. Tus datos no
  se han modificado.», dejará lo que se ve en pantalla como estaba antes del cambio y, si
  era una edición, mantendrá el modo edición con lo que el usuario ha escrito.
- RF-18: EL SISTEMA conservará exactamente igual, en cada guardado, las sesiones que no se
  editan ni se borran, incluidas las no válidas y cualquier dato que tengan además de
  fecha, tema y minutos. Al editar una sesión, también conservará sus datos adicionales.
- RF-19: EL SISTEMA nunca eliminará ni modificará una sesión sin una acción expresa del
  usuario: guardar en RF-4 o aceptar una confirmación en RF-9 y RF-12.

## Requisitos no funcionales

- RNF-1: Todas las acciones (editar, guardar, cancelar, borrar, borrar todas y confirmar)
  se pueden usar con ratón, con el dedo y solo con teclado.
- RNF-2: Las acciones «Editar» y «Borrar» de cada sesión tienen un nombre accesible con el
  tema, la fecha larga y los minutos de su sesión. Por ejemplo, «Borrar Matemáticas,
  martes, 29 de septiembre de 2026, 45 min».
- RNF-3: A 375 px de ancho, la lista en modo edición y todas las acciones se ven y se usan
  sin desplazamiento horizontal. Cada botón ocupa al menos 44 × 44 px.
- RNF-4: Los datos guardados antes de esta versión se siguen leyendo igual. Si se añade
  algún dato nuevo a las sesiones, es opcional, y las sesiones que no lo tienen se pueden
  editar y borrar igual.
- RNF-5: Todos los textos nuevos están en español.

## Casos límite

| Caso | Comportamiento esperado |
| --- | --- |
| Dos sesiones idénticas (misma fecha, tema y minutos) y se borra una | Solo desaparece una y la otra sigue (RF-9). |
| Se guarda sin cambiar nada | Sale del modo edición y los datos de la sesión quedan iguales (RF-4, RF-18). |
| Al editar, el tema tiene espacios al principio o al final | Se guarda sin esos espacios (RF-4). |
| Al editar, el tema solo tiene espacios | «Escribe un tema.» y no se guarda (RF-5). |
| Al editar, minutos en 0, negativos, vacíos o con decimales | «Los minutos deben ser un número entero mayor que 0.» y no se guarda (RF-5). |
| Al editar, tema vacío y minutos en 0 a la vez | Se muestran los dos mensajes, primero el del tema (RF-5). |
| Se edita la fecha y la sesión pasa a otro día | Se mueve en la lista y la racha, el mes y el mapa se recalculan (RF-4, RF-7). |
| Se edita la fecha a un día futuro o anterior al periodo del mapa | Se permite. El mapa sigue las reglas de la spec 001 (RF-4, RF-9 de la 001). |
| Se borra la única sesión de hoy | La racha se recalcula y sigue viva si ayer hubo sesión (RF-9). |
| Se borra la última sesión válida | Aparece el mensaje de lista vacía, el foco va al título de la lista y «Borrar todas las sesiones» se desactiva (RF-9, RF-13). |
| Hay sesiones no válidas guardadas | No tienen «Editar» ni «Borrar», no cuentan en <n> y sobreviven a cualquier borrado (RF-1, RF-11, RF-12, RF-18). |
| Se cancela o se cierra cualquier confirmación | No cambia nada (RF-10). |
| Mientras se edita, se intenta guardar una sesión nueva | El botón «Guardar sesión» está desactivado (RF-3). |
| En otra pestaña se añadió una sesión y aquí se edita o se borra otra | La sesión añadida en la otra pestaña se conserva (RF-14). |
| En otra pestaña se borró la sesión que aquí se edita o se borra | No se guarda nada, aparece el aviso y la lista se actualiza (RF-15). |
| El almacenamiento está lleno o no disponible al guardar | Aparece el aviso y la pantalla no cambia (RF-17). |
| Se recarga o se cierra la página con una edición sin guardar | Los cambios sin guardar se pierden sin aviso. Los datos guardados no cambian (RF-19). |
| Se edita o se borra pasada la medianoche con la página abierta | «Hoy» se recalcula y la racha y el mapa usan el día nuevo (Actualizar todo). |

## Fuera de alcance

- Seleccionar varias sesiones para borrarlas juntas. Queda para una spec futura.
- Editar o borrar sesiones desde el mapa de calor. Queda para una spec futura que tendrá
  que revisar la spec 001.
- Mostrar, corregir o borrar las sesiones no válidas.
- Historial de cambios, deshacer un borrado ya confirmado o avisar al salir con una
  edición sin guardar.
- Que la lista, la racha y el contador del mes funcionen con datos guardados corruptos.
  Sigue pendiente desde la spec 001.
- Actualizar en directo una pestaña cuando otra cambia los datos.

## Criterios de finalización

- [ ] Se cumplen RF-1 a RF-19 y RNF-1 a RNF-5.
- [ ] Hay tests automáticos que pasan para:
  - editar y validar una edición, con todos los mensajes de RF-5;
  - mantener el orden al editar (RF-7);
  - borrar una sesión, incluidas sesiones idénticas;
  - borrar todas, conservando las no válidas;
  - aplicar el cambio sobre datos leídos de nuevo (RF-14);
  - una sesión que ya no existe (RF-15);
  - datos ilegibles (RF-16);
  - conservar los datos adicionales (RF-18).
- [ ] Cada caso límite de la tabla se ha comprobado a mano en el navegador, incluido el
      uso solo con teclado y a 375 px.
- [ ] Ninguna prueba ha borrado ni modificado una sesión sin una acción expresa del usuario.

## Dudas abiertas

Ninguna. Se resolvieron en la clarificación del 2026-10-02 (ver la sección siguiente).

## Decisiones de la clarificación

- **Alcance reducido:** se quitan la selección múltiple y las acciones desde el mapa.
  Rompían la spec 001 (su RF-5, su RF-11 y lo que dejó fuera), generaban varias
  contradicciones y hacían que salieran más de 10 tareas.
- **Validez igual que en el mapa:** los minutos tienen que ser enteros. Así una sesión
  editada nunca desaparece del mapa.
- **Sesiones no válidas:** no se tocan nunca y se conservan en cada guardado (principio
  8).
- **Varias pestañas:** no se sincronizan en directo, pero cada cambio se aplica sobre los
  datos leídos en ese momento y nunca se borra lo que otra pestaña añadió (principio 8).
- **Sesiones idénticas:** la spec exige poder distinguirlas. Cómo se hace lo decide el
  plan, respetando el principio 9 (cualquier dato nuevo es opcional).
- **Durante una edición** se bloquea todo lo que podría redibujar la lista (RF-3), para
  no perder lo que el usuario está escribiendo.
